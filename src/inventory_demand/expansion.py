"""Additive product-count-independent experiment built on the original analysis modules."""

import hashlib
import importlib.metadata
import json
import platform
from dataclasses import asdict
from pathlib import Path

import pandas as pd

from .business_update import demand_stream_summary
from .cleaning import anonymize_transactions, clean_transactions, monthly_datasets, reconcile_monthly, reconstruct_daily
from .config import Config
from .data import load_product_bundle
from .eda import demand_profiles, run_eda
from .evaluation import run_backtests, scenario_coherence
from .features import build_features
from .financial import ManufacturingCostInputs, evaluate_production_costs
from .forecast_validity import ForecastValidityRules, evaluate_safeguards
from .portfolio_planning import portfolio_production, replay_production
from .visualization import plot_portfolio


EXPERIMENT = "five_products_v1"


def historical_hashes(config):
    """Include the previous business update, as well as the originally frozen results."""
    paths = list((config.root / "reports" / "tables").glob("*.csv"))
    paths += list((config.root / "reports" / "figures").glob("*.png"))
    paths += list((config.root / "reports").glob("*.md"))
    paths += list((config.root / "data" / "processed").glob("*.csv"))
    paths += [p for p in (config.root / "artifacts").glob("*") if p.is_file()]
    paths += list((config.root / "notebooks").glob("*.ipynb"))
    paths += list(config.raw.glob("*.csv"))
    return {str(p.relative_to(config.root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(paths)}


def historical_comparison(tables, config):
    path = config.root / "reports" / "tables" / "model_comparison.csv"
    if not path.exists():
        return pd.DataFrame()
    old = pd.read_csv(path)
    keys = ["codigo_producto", "scenario", "phase", "model"]
    metrics = ["mae", "rmse", "wape", "bias", "mase"]
    result = old[keys + metrics].merge(tables["model_comparison"][keys + metrics], on=keys,
                                       suffixes=("_historical", "_expanded"), validate="one_to_one")
    for metric in metrics:
        result[f"delta_{metric}"] = result[f"{metric}_expanded"] - result[f"{metric}_historical"]
    result["comparison_scope"] = "same_original_candidates_and_temporal_windows; rerun_not_independent_evidence"
    return result


def run_expansion(config: Config, bundle: Path, scenario_path: Path, *, ledger_name=None, figures=True, eda_only=False):
    if not config.experiment:
        raise ValueError("Product expansion requires an isolated experiment namespace")
    before = historical_hashes(config)
    config.prepare()
    preservation = config.artifacts / "historical_reference_manifest.json"
    if preservation.exists():
        frozen = json.loads(preservation.read_text(encoding="utf-8"))["files"]
        if any(before.get(name) != value for name, value in frozen.items()):
            raise ValueError("Historical reference changed since this experiment was first run")
    else:
        preservation.write_text(json.dumps({"files": before}, indent=2) + "\n", encoding="utf-8")
    raw, monthly_reference, catalog, sources, verification = load_product_bundle(config, bundle, ledger_name)
    transactions, quality = clean_transactions(raw, config)
    transactions.to_csv(config.private / "validated_transactions.csv", index=False)
    anonymize_transactions(transactions).to_csv(config.processed / "validated_transactions.csv", index=False)
    quality.to_csv(config.tables / "quality_checks.csv", index=False)
    if not transactions.analysis_eligible.all() or transactions.balance_discrepancy.any():
        raise ValueError("Core-invalid or unreconciled movements retained for review; expansion blocked")
    daily = reconstruct_daily(transactions, config)
    monthly, coverage = monthly_datasets(transactions, daily)
    reconciliation = reconcile_monthly(monthly, monthly_reference)
    if not reconciliation.matches_reference.all():
        raise ValueError("Monthly sums disagree with the preliminary reference")
    tables = {"product_catalog": catalog, "reported_product_inputs": catalog, "quality_checks": quality,
              "source_reconciliation": sources, "verification_reconciliation": verification,
              "monthly_reconciliation": reconciliation, "coverage": coverage,
              "quality_by_product": transactions.groupby("codigo_producto")[["negative_balance", "zero_balance", "zero_quantity_sale",
                  "balance_discrepancy", "source_date_reversal", "source_order_reversal", "repeated_business_candidate"]].sum().reset_index()}
    daily.to_csv(config.processed / "daily_recorded_inventory.csv", index=False)
    monthly.to_csv(config.processed / "monthly_demand.csv", index=False)
    if monthly.complete_for_modeling.any():
        build_features(monthly).to_csv(config.processed / "monthly_features.csv", index=False)
    tables.update(run_eda(transactions, daily, monthly, config))
    tables["demand_profiles"] = demand_profiles(monthly, transactions)
    tables["rujaf_demand_streams"] = demand_stream_summary(monthly, tables)
    print(f"Expansion: {len(transactions):,} movements, {len(catalog)} products, {len(coverage)} product-months reconciled.", flush=True)
    if not eda_only:
        tables.update(run_backtests(monthly, config, expanded=True))
        if "backtest_predictions" in tables:
            tables["historical_model_comparison"] = historical_comparison(tables, config)
            tables["scenario_forecast_coherence"] = scenario_coherence(tables["next_history_month_forecasts"])
            # Predeclared expansion rule: a positive intermittent rate can follow three zero months.
            # All other provisional checks remain the same. No target actuals enter these checks.
            rules = ForecastValidityRules(allow_positive_after_recent_zeros=True)
            tables.update(evaluate_safeguards(monthly, tables["backtest_predictions"], tables["next_history_month_forecasts"],
                                              tables["next_history_baseline_forecasts"], rules))
            scenario = json.loads(scenario_path.read_text(encoding="utf-8"))
            tables["production_scenarios"] = portfolio_production(monthly, tables["forecast_validity"], catalog, scenario)
            replay, replay_daily = replay_production(monthly, daily, tables["forecast_safeguard_predictions"], catalog, scenario)
            tables["production_replay"] = replay
            replay_daily.to_csv(config.processed / "production_replay_daily.csv", index=False)
            (config.artifacts / "planning_readiness.json").write_text(json.dumps({
                "scenario_inputs": scenario, "forecast_validity_rules": asdict(rules),
                "manufacturing_cost_evaluation": evaluate_production_costs(pd.DataFrame(), ManufacturingCostInputs()),
                "live_recommendation_allowed": False, "actual_savings": None,
                "economic_optimality_established": False, "shared_factory_schedule_verified": False,
                "replay_status": "post_hoc_diagnostic; recorded-sales withdrawals, not latent final demand"}, indent=2) + "\n", encoding="utf-8")
    for name, frame in tables.items():
        frame.to_csv(config.tables / f"{name}.csv", index=False)
    if figures:
        plot_portfolio(monthly, tables, catalog, config)
    write_expansion_report(tables, config, eda_only=eda_only, figures=figures)
    metadata = {"experiment": config.experiment, "config": config.serializable(), "python": platform.python_version(),
                "packages": {name: importlib.metadata.version(name) for name in
                             ("pandas", "numpy", "scipy", "scikit-learn", "statsmodels", "statsforecast")},
                "products": catalog.codigo_producto.tolist(), "movements": len(transactions), "eda_only": eda_only,
                "modeling_target": "gross recorded VENTA, not consumer or unconstrained demand", "live_forecast_available": False,
                "protocol": "24 initial months, at least 6 validation origins, 6 final rolling one-step origins; fixed 5% simplicity tie band",
                "historical_partitions_changed": False,
                "new_experiment_not_independent_A_B_test": True,
                "code_sha256": {str(p.relative_to(config.root)): hashlib.sha256(p.read_bytes()).hexdigest()
                                for p in sorted((config.root / "src" / "inventory_demand").glob("*.py"))}}
    (config.artifacts / "run_metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    if historical_hashes(config) != before:
        raise RuntimeError("Historical outputs changed during the expansion")
    print(f"Experiment written to {config.reports.relative_to(config.root)}; historical outputs unchanged.", flush=True)
    return tables


def write_expansion_report(tables, config, *, eda_only=False, figures=True):
    def md(frame):
        return frame.to_markdown(index=False, floatfmt=".3f")

    def image(name, caption):
        if figures and (config.figures / f"{name}.png").exists():
            return f"![{caption}](figures/{name}.png)"
        return ""

    catalog = tables["product_catalog"]
    summary = tables["sales_summary"].query("scenario == 'combined'")
    profile = tables["demand_profiles"].query("scenario == 'combined'")
    historical = summary[["codigo_producto", "all_observed_sales_units", "all_sales_transactions", "complete_months", "monthly_mean", "monthly_cv"]]
    historical = historical.merge(profile[["codigo_producto", "zero_periods", "longest_zero_run_months", "demand_class"]], on="codigo_producto")
    text = f"""# RUJAF: ampliación del sistema a {len(catalog)} productos

Experimento `{config.experiment}`, fecha de análisis {config.as_of}. Los resultados anteriores de dos productos siguen en `reports/tables/`, `data/processed/` y `artifacts/`. Esta ejecución escribe en subdirectorios de experimentos y comprueba sus huellas antes y después. Los ejemplos A y B mantienen sus particiones originales. Reentrenar sobre esos mismos meses no aporta una prueba independiente nueva.

## Integridad y procedencia

Se procesan {int(catalog.movements.sum()):,} movimientos una sola vez desde el consolidado autoritativo. Los individuales, el consolidado de tres productos y el anterior son controles de multiconjuntos, no fuentes que se suman. Las {len(tables['coverage'])} combinaciones producto/mes concilian con el CSV mensual preliminar; también se recalculan las afirmaciones de `verificacion_kardex.json`.

{md(catalog[['product_id', 'codigo_producto', 'movements', 'empresa_para_el_analisis', 'empresa_documento', 'pdf_origen']])}

El encabezado REFAMA de C se conserva como procedencia. Los cinco documentos forman el conjunto de RUJAF por instrucción de la empresa; esa asignación no prueba propiedad ni consumo final. Los destinatarios Refama identifican movimientos registrados, no venta al consumidor. Se conservan ventas en cero, traslados, ajustes, devoluciones, compras e ingresos por producción. Solo `VENTA.salida` alimenta el objetivo bruto.

{md(tables['quality_by_product'])}

El primer saldo no tiene antecesor independiente. Los demás saldos se verifican aritméticamente; esto no certifica existencias físicas. Ceros de inventario y períodos sin ventas requieren revisión, no equivalen a faltantes reales medidos.

## Historial y diferencias de demanda

{md(historical)}

Los totales observados incluyen fronteras; las medias y los modelos excluyen el primer y último mes de cada Kardex por cobertura no confirmada. Los meses interiores sin ventas se conservan en el calendario como cero registrado, no como demanda real cero. La clasificación ADI/CV² depende de la agregación mensual. `daily_intermittency.csv` conserva el diagnóstico diario.

{image('portfolio_monthly_sales', 'Series mensuales y ritmos de venta')}
{image('portfolio_intermittency', 'Meses sin ventas registradas')}

Tendencias, YTD comparable, perfiles de calendario, ACF, STL y cambios exploratorios se recalculan por producto y canal en las tablas. Las pruebas armónicas y sus ajustes FDR ahora abarcan hasta 15 series, en vez de seis. Los valores q nuevos no sustituyen los históricos ni prueban una temporada operativa estable. Las series cortas no reciben diagnósticos anuales ni selección de modelos sin historia suficiente.

## Montos y producción reportados

{md(catalog[['product_id', 'monto_reportado_gtq', 'clasificacion_monto', 'produccion_aproximada_diaria_min', 'produccion_aproximada_diaria_max']])}

A, B, C, D y E tienen precios de venta netos tras descuentos confirmados (Q2.50, Q12.00, Q15.00, Q2.50 y Q100.00; clasificación `precio_venta_neto_tras_descuento`). Ninguno se convierte en costo de fabricación verificado, margen o ahorro. Multiplicar unidades vendidas o pronosticadas por el precio neto correspondiente produce únicamente un escenario de ingresos estimados: como se desconocen las variaciones de precios durante todo el período, no equivale a ingresos históricos reales. Los ritmos son aproximaciones por día productivo, no producción constante ni máximos certificados. En E se conserva y prueba el rango de 30 a 35, sin reemplazarlo por un promedio implícito.
"""
    if not eda_only and "selected_models" in tables:
        selected = tables["selected_models"].query("scenario == 'combined'")
        holdout = tables["model_comparison"].query("scenario == 'combined' and phase == 'holdout'")
        result = selected[["codigo_producto", "model", "selected_validation_mae", "n_validation", "holdout_start", "holdout_end"]].merge(
            holdout[["codigo_producto", "model", "mae", "wape", "bias", "positive_actual_months"]], on=["codigo_producto", "model"])
        naive = holdout[holdout.model.eq("naive")][["codigo_producto", "mae"]].rename(columns={"mae": "naive_holdout_mae"})
        result = result.merge(naive, on="codigo_producto")
        text += f"""
## Comparación de modelos ejecutada

Se comparan los 13 métodos originales y una referencia cero. Croston-SBA y TSB de StatsForecast se incorporan cuando los primeros 24 meses contienen al menos dos meses positivos y 20% de ceros. La elegibilidad queda fijada antes de validación; no se usa el perfil de toda la serie ni el holdout para elegir candidatos. SBA usa suavizado fijo 0.1; TSB usa alpha de tamaño y ocurrencia 0.2, sin búsqueda posterior de parámetros.

Se conservan 24 meses iniciales, validación creciente de un paso y seis meses finales reservados. Se selecciona el más simple dentro del 5% del menor MAE de validación. Cada producto y canal puede elegir otro método. RMSE, WAPE, sesgo y MASE acompañan al MAE; WAPE y MASE indefinidos se publican como ausentes, no cero. Un método con fallos no compite como si hubiese completado todos los orígenes. Los errores de ajuste se conservan en `backtest_predictions.csv`.

{md(result)}

MAE en unidades mensuales. Las ventanas finales difieren entre productos, por lo que no se interpreta su MAE absoluto como una clasificación de dificultad compartida. En series intermitentes, un buen MAE o una selección de cero no establece demanda inexistente ni una política de servicio adecuada. La cantidad de meses positivos del holdout indica cuánta evidencia respalda la comparación.

{image('portfolio_holdout', 'Comparación temporal final')}

`historical_model_comparison.csv` muestra las diferencias de cada candidato original frente a los resultados archivados. No se escoge retrospectivamente al ganador del holdout. Los artefactos seleccionados se guardan en el directorio de este experimento. No cargar archivos pickle de fuentes no confiables.

## Inventario, escenarios y simulación

{image('portfolio_inventory', 'Inventario frente a venta reciente')}
{image('portfolio_production', 'Sensibilidad de producción') if tables['production_scenarios'].status.eq('hypothetical_production_scenario').any() else ''}

Se calcularon {len(tables['production_scenarios'])} escenarios puntuales con saldo alineado al origen, días asignados, seguridad, ritmo reportado y factores de venta previstos configurables. El escenario base mantiene 30 días por mes, revisión de 30 días, plazo total de 7 días, días asignados de 1 o 5 y seguridad de cero o un mes. El factor 1.5 es estrés de la previsión, no una observación. El rango de ritmo de E tiene dos extremos. Las asignaciones son por SKU y no constituyen un calendario conjunto de fábrica.

{md(tables['production_scenarios'].groupby('status').size().reset_index(name='alternativas'))}

Los estados bloqueados no son cantidades de producción cero. Faltan entradas antes de poder calcularlos.

Los controles de validez conservan el respaldo MA3 y el bloqueo de resultados inválidos. En este experimento se permite una previsión positiva después de tres meses en cero, para no invalidar por definición las tasas intermitentes. Los controles siguen siendo provisionales y su replay es diagnóstico posterior, no evidencia independiente de precisión ni garantía de servicio. Las ventas del mes frontera solo se muestran como contraste posterior, nunca como entrada de entrenamiento o de decisión.

`production_replay.csv` y `production_replay_daily.csv` simulan decisiones mensuales y recepciones con plazo explícito durante los seis orígenes finales. El saldo simulado se arrastra entre días y meses. Las decisiones ven solo el pronóstico y stock disponibles al origen; las ventas diarias registradas posteriores sirven como retiros de evaluación. No se agregan como suministro los ingresos reales, ajustes o traslados históricos, pues el replay estudia otra política. La demanda no atendida es venta registrada no servida por la política simulada, no pérdida real estimada ni demanda final. Se asume recepción antes de los retiros del día y ausencia de atrasos trasladados; no se mide ahorro ni factibilidad real.

Todos los pronósticos siguientes son retrospectivos de frontera, con fechas propias de cada producto. No hay pronóstico operativo vigente ni orden de fabricación autorizada. Faltan stock físico actual, cobertura reciente confirmada, restricciones compartidas, materiales, rendimientos y costos completos. No se afirma optimalidad económica.

## Evidencia de ejecución

Las tablas y figuras de esta carpeta se generaron con el programa, no con cifras ilustrativas. `artifacts/experiments/{config.experiment}/run_metadata.json` registra configuración, versiones y hashes de código; `source_manifest.json` registra las entradas. Las pruebas de regresión históricas siguen separadas de `tests/test_expansion.py`.
"""
    else:
        text += "\n## Modelos\n\nNo entrenados en esta ejecución EDA. No publicar como un experimento completo.\n"
    (config.reports / "final_report.md").write_text(text, encoding="utf-8")
    if not eda_only and "selected_models" in tables:
        concise = catalog[["product_id", "codigo_producto"]].merge(result, on="codigo_producto")
        concise = concise[["product_id", "codigo_producto", "model", "mae", "naive_holdout_mae", "wape"]]
        concise = concise.rename(columns={"product_id": "Producto", "codigo_producto": "Código", "model": "Método fijado",
                                           "mae": "MAE final", "naive_holdout_mae": "MAE último mes", "wape": "WAPE"})
        profile_summary = catalog[["product_id", "codigo_producto"]].merge(historical, on="codigo_producto")
        profile_summary = profile_summary[["product_id", "all_observed_sales_units", "complete_months", "zero_periods", "longest_zero_run_months", "demand_class"]]
        intermittent_note = "La frecuencia de ceros y los meses positivos de prueba limitan la evidencia disponible. El MAE no valida una política de servicio."
        sparse_code = catalog.loc[catalog.product_id.eq("E"), "codigo_producto"]
        if len(sparse_code):
            sparse = result[result.codigo_producto.eq(sparse_code.iloc[0])]
            if len(sparse) and sparse.model.iloc[0] == "zero":
                row = sparse.iloc[0]
                intermittent_note = (f"En E se evaluaron Croston-SBA y TSB. La referencia cero ganó por MAE de validación "
                                     f"y obtuvo WAPE final {row.wape:.0%}, con ventas en {row.positive_actual_months:g} meses finales. "
                                     "No prueba demanda nula ni respalda producción cero. Los controles y el respaldo del siguiente escenario son provisionales.")
        replay = tables["production_replay"]
        if "simulated_unserved_recorded_sales_units" in replay:
            selected_replays = replay[replay.assumed_available_production_days.eq(1) & replay.demand_factor.eq(1)].merge(
                catalog[["codigo_producto", "product_id", "produccion_aproximada_diaria_min"]], on="codigo_producto")
            selected_replays = selected_replays[selected_replays.assumed_units_per_production_day.eq(selected_replays.produccion_aproximada_diaria_min)]
            replay_summary = selected_replays.groupby(["product_id", "assumed_safety_stock_months"]).simulated_unserved_recorded_sales_units.sum().unstack()
            replay_summary = replay_summary.rename(columns={0: "Seguridad cero", 1: "Seguridad un mes"}).reset_index()
        else:
            replay_summary = replay.groupby("status").size().reset_index(name="alternativas_bloqueadas")
        summary_text = f"""# Resultados nuevos frente al análisis de dos productos

Se integraron {len(catalog)} productos, {int(catalog.movements.sum()):,} movimientos y {len(tables['coverage'])} combinaciones producto/mes. Los resultados históricos, sus particiones y el cuaderno ejecutado permanecen intactos. Los candidatos originales de A y B reproducen las métricas archivadas; esta reejecución no es una nueva prueba independiente.

## Comparación final

{md(concise)}

WAPE se expresa como fracción. Los MAE están en unidades mensuales, con seis orígenes finales propios de cada serie. La elección proviene exclusivamente de validación.

{md(profile_summary)}

{intermittent_note}

## Planificación

Se ejecutaron {len(tables['production_scenarios'])} escenarios puntuales, incluidos estrés de previsión y extremos del ritmo de E. El replay diario de los seis meses finales produjo las siguientes unidades VENTA no servidas por la política simulada, con un día asignado mensual y ritmo inferior reportado:

{md(replay_summary)}

Son retiros registrados no servidos en una simulación, no faltantes reales medidos, consumo final ni ahorro. El saldo inicial y las ventanas difieren entre productos. Las alternativas no se suman.

La palanca C conserva REFAMA como procedencia y RUJAF como conjunto de análisis. Los cinco montos son precios de venta netos tras descuentos (`precio_venta_neto_tras_descuento`): A Q2.50, B Q12.00, C Q15.00, D Q2.50 y E Q100.00; no son costos de fabricación, márgenes ni ahorros. El rango de E sigue siendo 30 a 35 unidades por día productivo aproximado, no capacidad máxima. Un ingreso estimado (unidades × precio neto) es solo un escenario complementario y no equivale a ingresos históricos reales, pues se desconocen las variaciones de precios del período. No hay optimalidad económica ni autorización de uso operativo.

El informe, las tablas y las figuras están en esta carpeta. La presentación conserva 30 diapositivas principales y tres anexos, con 50 minutos estimados, y añade comparaciones en pasos de las diapositivas existentes.
"""
        (config.reports / "summary.md").write_text(summary_text, encoding="utf-8")

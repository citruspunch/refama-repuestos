# RUJAF manufacturing and finished-goods inventory analysis

Sistema de predicción de ventas registradas y apoyo a la planificación de inventarios de RUJAF,
ampliado de dos a **cinco productos** sobre la implementación existente. Descubre productos desde
el consolidado, verifica sus movimientos y procedencia, compara métodos por serie con validación
temporal y calcula escenarios de producción. No establece demanda final, capacidad máxima verificada,
costos completos, optimalidad económica ni ahorros reales.

## Ampliación actual a cinco productos

- [Resumen de resultados nuevos](reports/experiments/five_products_v1/summary.md).
- [Informe ejecutado](reports/experiments/five_products_v1/final_report.md), con análisis histórico,
  comparaciones de modelos, inventario, producción y simulación diaria.
- [Método, reproducción y diferencias respecto a la referencia](docs/five_product_expansion.md).
- [Presentación en español](presentacion/README.md), 30 diapositivas principales, tres anexos y
  50 minutos estimados. A y B siguen como ejemplos principales; las nuevas comparaciones no añaden diapositivas.

El experimento `five_products_v1` procesó **2,108 movimientos**, concilió **258 combinaciones producto/mes**,
entrenó y comparó métodos para 15 series, y calculó **48 escenarios puntuales** y replays diarios
de seis meses. Los 13 métodos anteriores siguen disponibles; se añade referencia cero y, cuando la
historia inicial lo permite, Croston-SBA y TSB. La elección no se fuerza a un único algoritmo.

Los resultados anteriores, sus modelos, pruebas y cuaderno ejecutado permanecen en sus rutas originales.
La ampliación escribe únicamente en `data/experiments/five_products_v1/`,
`reports/experiments/five_products_v1/` y `artifacts/experiments/five_products_v1/`.
Los originales privados tampoco se modifican. Los apartados inferiores describen la referencia histórica.

```sh
uv pip install --python .venv/bin/python -r requirements-expansion-lock.txt
.venv/bin/python scripts/run_pipeline.py --expand-products
.venv/bin/python -m pytest -q --junitxml=reports/expansion_tests.xml
```

Para otro conjunto, especificar `--source-bundle`, `--ledger`, `--experiment` y, si corresponde,
`--planning-scenarios`. La cantidad de SKU se deriva de los datos. No sumar los CSV individuales
con sus consolidados. Los cinco montos son precios de venta netos tras descuentos confirmados
(`precio_venta_neto_tras_descuento`: A Q2.50, B Q12.00, C Q15.00, D Q2.50, E Q100.00); no son costos,
márgenes ni ahorros.
El ritmo de E mantiene el rango aproximado de 30 a 35 u./día productivo. C conserva su encabezado
REFAMA como procedencia y se incluye en el conjunto de análisis de RUJAF.

## Results and deliverables

- **[Final numerical report](reports/final_report.md)** — findings, visualizations, model results,
  limitations, and the exact additional data required.
- **[RUJAF update summary](reports/rujaf_update_summary.md)** — changes, retained conclusions, implemented
  interfaces and blockers. [Assumptions](docs/business_assumptions.md) · [missing data](docs/missing_data_checklist.md).
- **[Data quality report](reports/data_quality.md)** — provenance, reconciliation, flags, coverage.
- **[Executed EDA notebook](notebooks/01_exploratory_analysis.ipynb)** — independently re-executable.
- [`reports/tables/`](reports/tables/) and [`reports/figures/`](reports/figures/) — computed CSV tables and PNGs.
- [`data/processed/`](data/processed/) — customer-free validated transactions, daily recorded inventory,
  monthly demand, and strictly lagged forecasting features.
- [`artifacts/`](artifacts/) — selected models, source SHA-256 manifest, environment metadata,
  and financial-readiness status. Pickle artifacts are local trusted files; never load untrusted pickles.

### Main findings of the preserved two-product reference

| | Product A: UAH-90385-18025 | Product B: 48815-14050 |
|---|---:|---:|
| All-observed gross `VENTA` units | 66,423 | 6,437 |
| Sales transactions | 513 | 434 |
| Provisional interior months | 50 | 51 |
| Interior monthly mean / standard deviation | 1,278.76 / 1,186.11 | 121.33 / 58.70 |
| Latest comparable 2026 YTD vs 2025 | −55.6% (Jan–Aug) | −51.0% (Jan–Sep) |
| Refama share of all recorded sales | 5.6% | 37.2% |
| Validation-locked combined-sales method | Ridge regression | 3-month moving average |
| Final six-month holdout MAE | 290.19 | 37.33 |
| Naive holdout MAE | 312.33 | 34.17 |
| Selected-method holdout WAPE | 93.2% | 60.4% |

Both recorded-sales trajectories decline. Product A is more variable and bulk-order-heavy.
Annual-harmonic evidence exists for A (FDR q=0.014), but lag-12 autocorrelation and forecasting
results do not establish reliable operational seasonality; B has no comparable harmonic evidence.
Machine learning has **not demonstrated a robust advantage over simple baselines**.
Relative errors remain large; these are exploratory forecasting results, not deployment-ready accuracy.

**Critical warning:** Product A's locked ridge model extrapolates below zero at the next historical
origin; the reported nonnegative point forecast is zero even though the partial target month already
contains 325 units. This is a documented model failure, not zero demand, and must not drive production or purchases.
The best holdout method differs from the validation-locked choice; we do not silently reselect on test data.

All 1,062 movements reconcile arithmetically, but two negative balances, 10 zero-balance events,
23 adjustments, and uncertain availability require investigation. Zero ledger stock is not proven lost sales.
Refama shipments measure wholesale replenishment, not final consumer demand. The combined target remains
appropriate **provisionally for RUJAF's total recorded outgoing VENTA**, not all outflows or unconstrained
demand. Future retail POS sales must not be added to these shipments for the same goods.

### Reported inputs and new planning layer

| Product | Net selling price after discounts (`precio_venta_neto_tras_descuento`) | Reported units per production day |
|---|---:|---:|
| A — UAH-90385-18025 | Q2.50 | approximately 800 |
| B — 48815-14050 | Q12.00 | approximately 210 |
| C — UAH-33505-35020 | Q15.00 | approximately 300 |
| D — 90385-18046 | Q2.50 | approximately 480 |
| E — 17881-54820 | Q100.00 | approximately 30–35 |

None of the five values is a manufacturing cost, margin, saving or profit. Multiplying sold or forecast units by the net price yields only an estimated-revenue scenario, not historical real revenue, because price variations over the whole period are unknown. Neither rate is actual daily output or sustainable
capacity. [`scenarios/rujaf_planning.json`](scenarios/rujaf_planning.json) explicitly assumes production days,
lead time, batches, safety stock, open orders and inventory restrictions for sensitivity analysis only.
Production scenarios show monthly/weekly mean-rate demand, uncertainty, coverage, surplus/shortage,
triggers, quantity and production days. They never authorize live action.

Forecast safeguards use pre-origin history and a **fixed provisional 3-month-mean fallback** only when
validity checks fail. A separate diagnostic replay uses the original time-series origins; this post-hoc
rule is not a newly validated model or evidence of improved accuracy. Original selection and test scores
remain unchanged. See [forecasting](docs/demand_forecasting.md) and [production/economic interfaces](docs/production_planning.md).

Non-fiscal dispatch documents are reported, but their legal/accounting treatment has not been verified.
Reconcile physical movements without duplication; do not assume correct tax treatment. Tax avoidance is
not an optimization objective.

## Reproduce

Tested with **Python 3.12.14**. The raw files must remain in `kardex_csv/` under their original names.
No source file is overwritten. Run from the repository root:

**For this checkout, use `--expand-products` above for the five-product experiment, or
`--business-update-only` below for the previous two-product planning update. Both preserve the frozen outputs.**
The full regeneration/notebook commands are retained for independent reproduction in a separate checkout/root
with the raw files, scenario JSON and notebook available. They rewrite generated files (including notebook
execution timestamps); byte-preservation tests intentionally detect such changes to the frozen baseline.

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements-lock.txt
.venv/bin/python scripts/run_pipeline.py --execute-notebook
.venv/bin/python -m pytest -q
```

Without `uv`, use Python's standard `venv` and `pip`:

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python scripts/run_pipeline.py --execute-notebook
```

`requirements.txt` installs compatible dependency ranges; `requirements-lock.txt` pins the exact
tested environment, also recorded in `artifacts/run_metadata.json`. On a different OS/Python version,
use the ranged file if exact wheels are unavailable and record the changed environment. Tiny numerical
optimizer differences are possible across BLAS/platforms. Fixed ML/bootstrap seeds are 42.

```bash
# Apply only the business/planning update to existing outputs (no retraining or historical metric rewriting):
.venv/bin/python scripts/run_pipeline.py --business-update-only
.venv/bin/python -m pytest -q
# Optional alternative explicit production assumptions:
.venv/bin/python scripts/run_pipeline.py --business-update-only --planning-scenarios scenarios/rujaf_planning.json
# Quality, cleaned data, features, EDA only:
.venv/bin/python scripts/run_pipeline.py --eda-only
# Full pipeline without figure regeneration:
.venv/bin/python scripts/run_pipeline.py --skip-figures
# Re-execute the notebook using this interpreter, without retraining:
.venv/bin/python scripts/run_pipeline.py --notebook-only
# Installed CLI is equivalent:
.venv/bin/kardex-demand --execute-notebook
```

The fixed analysis date is **2026-10-26**, configurable with `--as-of YYYY-MM-DD`.
Business-only updates retain the archived analysis date and reject changing it; they archive original report
prose in `reports/history/pre_rujaf_update/` and hash historical numerical outputs, models, sources and tests
in `artifacts/historical_results_manifest.json`. The original executed notebook and test XML are retained.
Changing `--as-of` is a future-date validation check, **not** an automatic historical as-of extraction:
earlier cutoffs reject future-dated rows rather than silently truncating the ledger. For a true historical
replay, provide an appropriately filtered, coverage-confirmed extract in a separate root.
The notebook independently repeats EDA with the default analysis date and only reads forecasting results.
An EDA-only run does not refresh previously generated model outputs; use a full run before publishing.

## Coverage and interpretation rules

1. **Sales = `tipo_movimiento == VENTA`, quantity = `salida`.** Purchases, production, opening stock,
   returns, and adjustments are separate. Returns are not netted into the gross-sales target.
2. `refama` = RUJAF shipments to Refama; `other` = sales to other customers; `combined` = their total.
   Do not sum all three scenarios or add retail sell-through. `venta_a_refama` is used only on sales.
   Customer names do not appear in public tables, charts, or notebook outputs.
3. Consolidated data is authoritative for processing; individual files cross-check it. The preliminary
   monthly file is reconciliation-only. No repeated/extreme transaction is removed.
4. Movement order = product, parsed date, original PDF movement sequence, stable source row.
   Initial stock is not an observed purchase. The first balance has no independently observed predecessor.
5. Both first and last product months are **boundary-unconfirmed** and excluded. Interior months are
   provisionally complete; absent sales within them mean no *recorded* sales, not verified zero demand.
6. Daily EOD balances use the last ordered movement and carry forward only inside observed date ranges.
   Low stock means recorded balance between 0 and 10 units, a descriptive configurable threshold,
   not a known business reorder point. Negative stock is tracked separately.
7. All forecasting predictors use information strictly before the target month. The final six complete
   months are untouched for selection; expanding one-month origins update on actuals as they arrive.
8. Model selection uses validation MAE and a predeclared 5% practical tie band favoring simpler methods.
   Final holdout rankings are reported, not used to reselect. No random train/test split is used.
9. Forecasts target the month following the latest **usable** history (A: September 2026; B: October 2026).
   They are retrospective boundary forecasts, **not live November 2026 predictions**. Unconfirmed
   September/October coverage must be resolved before issuing a defensible live one-step forecast.
10. Legacy purchasing examples remain historical demonstrations. Production planning requires explicit
    lead time, available days, good-unit rate, batches, safety stock, pipeline and stock restrictions.
    Missing/failed inputs block calculations; stale stock and unconfirmed constraints block live use.
    Manufacturing costs remain missing; confirmed net selling prices support only estimated-revenue scenarios and do not unlock financial evaluation.

## Project structure

```text
kardex_csv/                         preserved raw CSVs; private/ignored
src/inventory_demand/
  config.py                        fixed, explicit analysis choices
  data.py                          schemas, source loading and reconciliation
  cleaning.py                      quality flags, daily stock, monthly sales
  eda.py                           descriptive metrics, trend/seasonality, anomalies
  visualization.py                 customer-free PNG figures
  features.py                      strictly lagged forecasting datasets
  forecasting.py                   baselines, regression, ETS/SARIMA, shallow trees
  evaluation.py                    expanding origins, selection, holdout, diagnostics
  forecast_validity.py             provisional validity checks and separate diagnostic replay
  business.py                      RUJAF demand streams and reported net selling prices
  business_update.py               additive planning outputs; historical preservation
  inventory.py                     legacy purchasing + periodic-review production scenarios
  financial.py                     purchasing/manufacturing cost and comparison gates; net prices never auto-feed manufacturing costs
  reporting.py                     evidence-generated Markdown reports
  pipeline.py                      raw-to-output orchestration and CLI
scripts/run_pipeline.py
tests/                             data, leakage, models, policy, cost, output checks
notebooks/01_exploratory_analysis.ipynb
data/private/                      full validated records; private/ignored
data/processed/                    customer-free analysis-ready exports
reports/{tables,figures}/
artifacts/
scenarios/rujaf_planning.json        explicit, configurable historical assumptions
```

## Data and model interfaces

See [data dictionary](docs/data_dictionary.md), [methods](docs/methodology.md), and
[production/economic interfaces](docs/production_planning.md). New `ProductionInputs`, `ProductionConstraints`,
and `OpenProductionOrder` contracts require explicit planning inputs; `ManufacturingCostInputs` never
automatically consumes reported net selling prices. Legacy `PolicyInputs`/`CostInputs` remain compatible.

Next priorities: refresh/verify stock and coverage, reconcile dispatches/adjustments, confirm the production
calendar, capacity, yield and linked order-to-receipt lead times; collect unfilled demand, current decisions
and dated manufacturing costs. Then obtain new complete months for prospective validation. Reduced production
spend is not savings without unmet demand, eventual sales and ending inventory being considered.

**Privacy:** do not publish `kardex_csv/` or `data/private/`. Public exports remove customer identities
but remain commercially sensitive and are not a legal guarantee of anonymization. Review sharing permissions.

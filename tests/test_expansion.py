"""Expansion contracts supplement, rather than replace, the frozen two-product tests."""

import hashlib
import json
from dataclasses import replace

import numpy as np
import pandas as pd
import pytest

from inventory_demand.cleaning import anonymize_transactions, clean_transactions, monthly_datasets, reconstruct_daily
from inventory_demand.config import Config
from inventory_demand.data import load_product_bundle, product_catalog, read_source, verify_product_reference
from inventory_demand.eda import demand_profiles, season_and_trend
from inventory_demand.evaluation import choose_model, run_backtests
from inventory_demand.expansion import run_expansion, write_expansion_report
from inventory_demand.forecasting import CANDIDATES, candidates_for_history, fit_predict
from inventory_demand.portfolio_planning import portfolio_production, replay_production, scenario_variants


@pytest.fixture(scope="module")
def expanded_config():
    return Config(experiment="five_products_v1")


@pytest.fixture(scope="module")
def bundle(expanded_config):
    return expanded_config.raw / "kardex_5_productos_RUJAF_csv"


@pytest.fixture(scope="module")
def expanded_raw(bundle):
    return read_source(bundle / "kardex_5_productos_consolidado.csv")


@pytest.fixture(scope="module")
def expanded_clean(expanded_raw, expanded_config):
    return clean_transactions(expanded_raw, expanded_config)[0]


@pytest.fixture(scope="module")
def expanded_daily(expanded_clean, expanded_config):
    return reconstruct_daily(expanded_clean, expanded_config)


@pytest.fixture(scope="module")
def expanded_monthly(expanded_clean, expanded_daily):
    return monthly_datasets(expanded_clean, expanded_daily)[0]


@pytest.fixture(scope="module")
def expanded_tables(expanded_config):
    return {p.stem: pd.read_csv(p) for p in expanded_config.tables.glob("*.csv")}


def test_expansion_paths_cannot_overwrite_historical_results(expanded_config):
    original = replace(expanded_config, experiment=None)
    for name in ("processed", "private", "tables", "figures", "artifacts", "reports"):
        assert getattr(expanded_config, name) != getattr(original, name)
    with pytest.raises(ValueError, match="directory names"):
        Config(experiment="../escape")


def test_authoritative_ledger_is_not_concatenated_and_all_references_match(expanded_config, bundle, tmp_path):
    # Keep a test's source manifest out of both archived and experiment outputs.
    target = replace(expanded_config, experiment="source_test")
    target = replace(target, root=tmp_path)
    # The loader also accepts a supplied extract outside the destination root.
    raw, monthly_ref, catalog, reconciliation, verification = load_product_bundle(target, bundle)
    assert len(raw) == 2108 and len(catalog) == 5
    assert len(monthly_ref) == 258
    assert reconciliation.multiset_equal.all()
    assert verification.matches_reference.all()


def test_all_new_rows_and_movement_types_survive(expanded_clean):
    assert len(expanded_clean) == 2108
    assert expanded_clean.analysis_eligible.all()
    assert expanded_clean.movement_id.is_unique
    assert expanded_clean.groupby("codigo_producto").size().to_dict() == {
        "UAH-90385-18025": 583, "48815-14050": 479, "UAH-33505-35020": 815,
        "90385-18046": 157, "17881-54820": 74}
    assert not expanded_clean.balance_discrepancy.any()
    assert expanded_clean.first_product_row.sum() == 5
    assert expanded_clean.tipo_movimiento.eq("TRASLADO").sum() == 4
    assert expanded_clean.zero_quantity_sale.sum() == 1
    assert expanded_clean.loc[~expanded_clean.is_sale, "monthly_sales_units"].eq(0).all()


def test_provenance_and_exact_product_code_are_retained(expanded_clean):
    c = expanded_clean[expanded_clean.codigo_producto.eq("UAH-33505-35020")]
    assert len(c) == 815
    assert c.empresa_documento.eq("REFAMA").all()
    assert c.empresa_kardex.eq("RUJAF").all()
    assert c.pdf_origen.eq("doc_261026_152501.pdf").all()
    public = anonymize_transactions(c)
    assert "cliente_proveedor" not in public and "numero_documento" not in public
    assert "empresa_documento" in public


def test_input_verification_is_recomputed_not_trusted(expanded_raw, bundle):
    reference = json.loads((bundle / "verificacion_kardex.json").read_text())
    reference["productos"][-1]["unidades_en_movimientos_VENTA"] += 1
    with pytest.raises(ValueError, match="disagree"):
        verify_product_reference(expanded_raw, reference)


def test_mismatched_individual_is_rejected_not_deduplicated(expanded_raw, tmp_path):
    raw = expanded_raw[expanded_raw.codigo_producto.eq("17881-54820")].copy()
    raw.to_csv(tmp_path / "kardex_consolidado.csv", index=False)
    raw.iloc[:-1].to_csv(tmp_path / "kardex_individual.csv", index=False)
    target = Config(root=tmp_path, experiment="mismatch")
    with pytest.raises(ValueError, match="disagree"):
        load_product_bundle(target, tmp_path)


def test_new_bundle_does_not_require_the_two_original_products(expanded_raw, tmp_path):
    target = Config(root=tmp_path, experiment="different_catalog")
    target.raw.mkdir()
    expanded_raw[expanded_raw.codigo_producto.eq("UAH-90385-18025")].to_csv(target.raw / "kardex_original.csv", index=False)
    inputs = tmp_path / "other_bundle"
    inputs.mkdir()
    expanded_raw[expanded_raw.codigo_producto.eq("17881-54820")].to_csv(inputs / "kardex_consolidado.csv", index=False)
    # Ingestion only validates the reference's existence; monthly arithmetic is checked by the pipeline.
    pd.DataFrame({"codigo_producto": ["17881-54820"], "mes": ["2022-06"]}).to_csv(inputs / "ventas_mensuales_preliminares.csv", index=False)
    raw, _, catalog, _, _ = load_product_bundle(target, inputs)
    assert len(raw) == 74 and len(catalog) == 1
    assert catalog.codigo_producto.iloc[0] == "17881-54820"


def test_single_boundary_month_processes_without_inventing_model(expanded_raw, bundle, expanded_config, tmp_path):
    inputs = tmp_path / "inputs"
    inputs.mkdir()
    raw = expanded_raw[expanded_raw.codigo_producto.eq("17881-54820")].head(1)
    raw.to_csv(inputs / "kardex_consolidado.csv", index=False)
    pd.DataFrame([{"codigo_producto": "17881-54820", "mes": "2022-06", "unidades_venta": 0,
                   "unidades_venta_a_refama": 0, "unidades_venta_otros": 0,
                   "cantidad_operaciones_venta": 0}]).to_csv(inputs / "ventas_mensuales_preliminares.csv", index=False)
    reported = read_source(bundle / "datos_reportados_productos.csv")
    reported[reported.codigo_producto.eq("17881-54820")].to_csv(inputs / "datos_reportados_productos.csv", index=False)
    target = Config(root=tmp_path, experiment="short_history")
    tables = run_expansion(target, inputs, expanded_config.root / "scenarios" / "five_products.json", figures=False)
    assert tables["model_readiness"].status.eq("blocked_insufficient_temporal_history").all()
    assert "selected_models" not in tables
    assert (target.reports / "final_report.md").exists()


def test_sixth_product_does_not_require_a_code_allowlist(expanded_raw, expanded_config):
    extra = expanded_raw[expanded_raw.codigo_producto.eq("17881-54820")].copy()
    extra["codigo_producto"] = "SIXTH-SKU"
    extended = pd.concat([expanded_raw, extra], ignore_index=True)
    clean = clean_transactions(extended, expanded_config)[0]
    assert clean.analysis_eligible.all()
    daily = reconstruct_daily(clean, expanded_config)
    monthly = monthly_datasets(clean, daily)[0]
    assert monthly.codigo_producto.nunique() == 6
    assert monthly.query("codigo_producto == 'SIXTH-SKU' and scenario == 'combined'").sales_units.sum() == 166
    assert "SIXTH-SKU" in set(product_catalog(extended, None).codigo_producto)


def test_coverage_channels_and_transfers_are_not_sales(expanded_monthly):
    combined = expanded_monthly[expanded_monthly.scenario.eq("combined")]
    assert combined.groupby("codigo_producto").complete_for_modeling.sum().to_dict() == {
        "UAH-90385-18025": 50, "48815-14050": 51, "UAH-33505-35020": 47,
        "90385-18046": 51, "17881-54820": 49}
    assert combined.transfer_incoming.sum() == 35
    channels = expanded_monthly.pivot(index=["codigo_producto", "month"], columns="scenario", values="sales_units")
    assert channels.combined.eq(channels.refama + channels.other).all()
    assert not combined.loc[combined.start_boundary | combined.end_boundary, "complete_for_modeling"].any()


def test_cost_labels_and_rate_range_are_not_reclassified(expanded_tables):
    catalog = expanded_tables["product_catalog"].set_index("product_id")
    assert (catalog["clasificacion_monto"] == "precio_venta_neto_tras_descuento").all()
    assert catalog.loc["A", "monto_reportado_gtq"] == 2.5
    assert catalog.loc["B", "monto_reportado_gtq"] == 12.0
    assert catalog.loc["C", "monto_reportado_gtq"] == 15.0
    assert catalog.loc["D", "monto_reportado_gtq"] == 2.5
    assert catalog.loc["E", "monto_reportado_gtq"] == 100.0
    assert catalog.loc["E", "produccion_aproximada_diaria_min"] == 30
    assert catalog.loc["E", "produccion_aproximada_diaria_max"] == 35
    assert not catalog.manufacturing_cost_verified.any()


def test_net_prices_do_not_change_forecasts_or_unit_simulations(expanded_tables, expanded_config):
    import json
    catalog = expanded_tables["product_catalog"]
    assert (catalog["clasificacion_monto"] == "precio_venta_neto_tras_descuento").all()
    # Forecasts target units only; prices are not training inputs.
    selected = expanded_tables["selected_models"]
    assert len(selected) == 15
    scenarios = expanded_tables["production_scenarios"]
    assert scenarios.status.eq("hypothetical_production_scenario").all()
    readiness = json.loads((expanded_config.artifacts / "planning_readiness.json").read_text())
    assert readiness["manufacturing_cost_evaluation"]["status"] == "blocked_missing_manufacturing_cost_inputs"
    assert readiness["actual_savings"] is None


@pytest.mark.parametrize("model", ["croston_sba", "tsb", "zero"])
def test_intermittent_models_use_calendar_zeros_and_are_nonnegative(model, synthetic_series):
    history = synthetic_series.copy()
    history["sales_units"] = np.tile([0, 0, 0, 4, 0], 8)
    result = fit_predict(model, history)
    assert np.isfinite(result.prediction) and result.prediction >= 0
    assert result.artifact["cutoff"] == history.month.max().strftime("%Y-%m-%d")
    if model != "zero":
        assert result.prediction > 0
    history["sales_units"] = 0
    assert fit_predict(model, history).prediction == 0


def test_tsb_decays_after_silence_while_sba_does_not(synthetic_series):
    history = synthetic_series.copy()
    history["sales_units"] = [0, 3] * 20
    before = history.iloc[:30]
    history.loc[30:, "sales_units"] = 0
    assert fit_predict("tsb", history).prediction < fit_predict("tsb", before).prediction
    assert fit_predict("croston_sba", history).prediction == pytest.approx(fit_predict("croston_sba", before).prediction)


def test_candidate_eligibility_is_based_on_initial_history_only(synthetic_series):
    dense = synthetic_series.iloc[:24].copy()
    assert set(candidates_for_history(dense)) == set(CANDIDATES) | {"zero"}
    sparse = dense.copy()
    sparse.loc[:19, "sales_units"] = 0
    assert {"croston_sba", "tsb"} <= set(candidates_for_history(sparse))
    sparse["sales_units"] = 0
    assert "tsb" not in candidates_for_history(sparse)


def test_short_series_is_explicitly_blocked_not_forced_to_train(synthetic_series, expanded_config):
    short = synthetic_series.iloc[:12]
    result = run_backtests(short, expanded_config, expanded=True)
    assert result["model_readiness"].status.eq("blocked_insufficient_temporal_history").all()
    assert "selected_models" not in result
    eda = season_and_trend(short, expanded_config)
    assert eda["seasonality"].status.eq("insufficient_history_for_annual_diagnostics").all()


def test_intermittency_profiles_include_silent_months(expanded_monthly, expanded_clean):
    profiles = demand_profiles(expanded_monthly, expanded_clean).query("scenario == 'combined'").set_index("codigo_producto")
    assert profiles.loc["17881-54820", "zero_periods"] > profiles.loc["UAH-33505-35020", "zero_periods"]
    assert profiles.loc["17881-54820", "longest_zero_run_months"] == 4
    assert profiles.loc["90385-18046", "zero_quantity_sale_rows"] == 1


def test_temporal_outputs_selection_and_missing_metrics(expanded_tables):
    predictions = expanded_tables["backtest_predictions"]
    assert predictions.codigo_producto.nunique() == 5
    assert predictions.training_end.lt(predictions.target_month).all()
    selection = expanded_tables["selected_models"]
    assert len(selection) == 15 and selection.n_holdout.eq(6).all()
    assert selection.validation_end.lt(selection.holdout_start).all()
    scores = expanded_tables["model_comparison"]
    for s in selection.itertuples():
        validation = scores[scores.codigo_producto.eq(s.codigo_producto) & scores.scenario.eq(s.scenario) & scores.phase.eq("validation")]
        assert choose_model(validation, Config())["model"] == s.model
    eligibility = expanded_tables["candidate_eligibility"]
    selected = selection.merge(eligibility, on=["codigo_producto", "scenario", "model"])
    assert selected.eligible.all() and selected.screening_end.lt(selected.validation_start).all()
    history = expanded_tables["historical_model_comparison"]
    assert history.filter(like="delta_").abs().max().max() < 1e-7


def test_planning_and_daily_replay_conserve_units(expanded_tables, expanded_config):
    scenarios = expanded_tables["production_scenarios"]
    assert scenarios.codigo_producto.nunique() == 5
    assert scenarios.status.eq("hypothetical_production_scenario").all()
    assert not scenarios.live_recommendation_allowed.any()
    assert set(scenarios.query("codigo_producto == '17881-54820'").assumed_units_per_production_day) == {30, 35}
    replay = expanded_tables["production_replay"]
    assert replay.codigo_producto.nunique() == 5
    assert replay.training_end.lt(replay.target_month).all()
    assert np.allclose(replay.starting_simulated_stock + replay.received_units - replay.simulated_served_units,
                       replay.ending_simulated_stock)
    assert np.allclose(replay.simulated_served_units + replay.simulated_unserved_recorded_sales_units,
                       replay.recorded_sales_units)
    for _, g in replay.groupby(["codigo_producto", "variant_id"]):
        assert len(g) == 6
        assert np.allclose(g.starting_simulated_stock.iloc[1:], g.ending_simulated_stock.iloc[:-1])
    daily = pd.read_csv(expanded_config.processed / "production_replay_daily.csv")
    assert daily.simulated_closing_stock.ge(0).all()
    readiness = json.loads((expanded_config.artifacts / "planning_readiness.json").read_text())
    assert readiness["actual_savings"] is None and not readiness["economic_optimality_established"]


def test_selected_model_artifacts_exist_for_all_fifteen_series(expanded_tables, expanded_config):
    manifest = expanded_tables["model_artifacts"]
    assert len(manifest) == 15
    for row in manifest.itertuples():
        assert (expanded_config.artifacts / row.file).stat().st_size > 20


def test_missing_reported_rate_blocks_planning_without_using_cost_as_rate(expanded_tables, expanded_monthly, expanded_daily, expanded_config, tmp_path):
    catalog = expanded_tables["product_catalog"].copy()
    catalog[["produccion_aproximada_diaria_min", "produccion_aproximada_diaria_max"]] = np.nan
    scenario = json.loads((expanded_config.root / "scenarios" / "five_products.json").read_text())
    result = portfolio_production(expanded_monthly, expanded_tables["forecast_validity"], catalog, scenario)
    assert result.status.eq("blocked_missing_production_inputs").all()
    assert result.suggested_production_units.isna().all()
    for raw in result.scenario_inputs_json:
        assert json.loads(raw)["constraints"]["units_per_production_day"] is None
    replay, _ = replay_production(expanded_monthly, expanded_daily, expanded_tables["forecast_safeguard_predictions"], catalog, scenario)
    assert replay.status.eq("blocked_missing_production_inputs").all()
    tables = {**expanded_tables, "product_catalog": catalog, "production_scenarios": result, "production_replay": replay}
    target = replace(expanded_config, root=tmp_path)
    target.prepare()
    write_expansion_report(tables, target, figures=False)
    assert "blocked_missing_production_inputs" in (target.reports / "summary.md").read_text()


def test_future_withdrawals_cannot_change_a_replay_decision(expanded_monthly, expanded_daily, expanded_tables, expanded_config):
    scenario = json.loads((expanded_config.root / "scenarios" / "five_products.json").read_text())
    scenario["available_production_days"] = [1]
    scenario["safety_stock_months"] = [0]
    scenario["demand_factors"] = [1]
    guarded = expanded_tables["forecast_safeguard_predictions"]
    first, _ = replay_production(expanded_monthly, expanded_daily, guarded, expanded_tables["product_catalog"], scenario)
    changed = expanded_daily.copy()
    first_targets = guarded.query("scenario == 'combined' and phase == 'holdout'").groupby("codigo_producto").target_month.min()
    for code, target in first_targets.items():
        changed.loc[changed.codigo_producto.eq(code) & changed.month.ge(pd.Timestamp(target)), "sales_units"] = 100000
    second, _ = replay_production(expanded_monthly, changed, guarded, expanded_tables["product_catalog"], scenario)
    a = first.groupby(["codigo_producto", "variant_id"]).first()
    b = second.groupby(["codigo_producto", "variant_id"]).first()
    pd.testing.assert_series_equal(a.suggested_production_units, b.suggested_production_units)


def test_historical_expansion_reference_stays_byte_identical(expanded_config):
    payload = json.loads((expanded_config.artifacts / "historical_reference_manifest.json").read_text())
    for name, expected in payload["files"].items():
        assert hashlib.sha256((expanded_config.root / name).read_bytes()).hexdigest() == expected


def test_expanded_exports_do_not_publish_customer_names(expanded_config, expanded_clean):
    names = {name for name in expanded_clean.loc[expanded_clean.is_sale, "cliente_proveedor"].unique() if len(name) > 8}
    paths = list(expanded_config.processed.glob("*.csv")) + list(expanded_config.tables.glob("*.csv"))
    paths += list(expanded_config.reports.glob("*.md"))
    for path in paths:
        text = path.read_text()
        assert not any(name in text for name in names), f"Customer label leaked: {path.name}"

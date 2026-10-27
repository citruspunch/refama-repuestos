"""Additive-update integration and preservation checks; no historical retraining."""

import hashlib
import json
import sys
from dataclasses import replace
from shutil import copy2

import pandas as pd
import pytest

from inventory_demand.business_update import (UPDATE_TABLES, demand_stream_summary, planning_tables,
                                              update_existing_results)
from inventory_demand.forecast_validity import ForecastValidityRules


def existing_tables(config):
    return {path.stem: pd.read_csv(path, float_precision="round_trip") for path in config.tables.glob("*.csv")
            if path.stem not in UPDATE_TABLES}


def test_all_pre_update_numerical_files_sources_artifacts_and_tests_are_unchanged(config):
    manifest = json.loads((config.root / "artifacts" / "historical_results_manifest.json").read_text())
    assert len(manifest["files"]) >= 70
    for name, expected in manifest["files"].items():
        path = config.root / name
        if name.startswith("kardex_csv/") and not path.exists():
            continue  # Private ignored raw data may be absent in a public checkout.
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, f"Historical file changed: {name}"


def test_demand_streams_are_disjoint_and_cannot_double_count(monthly, config):
    tables = existing_tables(config)
    result = demand_stream_summary(monthly, tables)
    totals = result.pivot(index="codigo_producto", columns="scenario", values="all_observed_sales_units")
    assert totals.combined.eq(totals.refama + totals.other).all()
    changed = monthly.copy()
    changed.loc[changed.scenario.eq("combined"), "sales_units"] += 1
    with pytest.raises(ValueError, match="exactly"):
        demand_stream_summary(changed, tables)


def test_planning_configuration_is_explicit_reproducible_and_scenario_only(monthly, config):
    tables = existing_tables(config)
    scenario = json.loads((config.root / "scenarios" / "rujaf_planning.json").read_text())
    first = planning_tables(monthly, tables, scenario)
    second = planning_tables(monthly, tables, scenario)
    assert set(first) == UPDATE_TABLES
    for name in first:
        pd.testing.assert_frame_equal(first[name], second[name])
    production = first["production_scenarios"]
    assert len(production) == 8
    assert production.status.eq("hypothetical_production_scenario").all()
    assert not production.live_recommendation_allowed.any()
    assert dict(production.groupby("codigo_producto").assumed_units_per_production_day.first()) == {
        "UAH-90385-18025": 800, "48815-14050": 210}
    a = first["forecast_validity"].query("codigo_producto == 'UAH-90385-18025' and scenario == 'combined'").iloc[0]
    assert a.locked_model == "ridge" and a.locked_forecast_units == 0
    assert a.fallback_used and a.effective_forecast_units == 205
    for row in production.itertuples():
        inputs = json.loads(row.scenario_inputs_json)
        assert inputs["mode"] == "scenario" and not inputs["constraints_confirmed"]
        assert "reported_rate_as_scenario_rate" in inputs["assumed_fields"]
    del scenario["open_production_orders"]
    with pytest.raises(ValueError, match="Explicit scenario"):
        planning_tables(monthly, tables, scenario)


def test_invalid_forecasts_leave_machine_readable_blocked_scenarios(monthly, config):
    scenario = json.loads((config.root / "scenarios" / "rujaf_planning.json").read_text())
    result = planning_tables(monthly, existing_tables(config), scenario, ForecastValidityRules(recent_months=100))
    production = result["production_scenarios"]
    assert production.status.eq("blocked_invalid_forecast").all()
    assert production.suggested_production_units.isna().all()
    for raw in production.scenario_inputs_json:
        parsed = json.loads(raw)
        assert parsed["forecast_units_per_month"] is None
        assert "NaN" not in raw  # Failed demand must not become zero or invalid JSON.


def test_guarded_comparison_keeps_original_metrics_and_expanding_origins(config):
    original = pd.read_csv(config.tables / "model_comparison.csv")
    locked = pd.read_csv(config.tables / "selected_models.csv")
    guarded = pd.read_csv(config.tables / "forecast_safeguard_comparison.csv")
    selected = original.merge(locked[["codigo_producto", "scenario", "model"]],
                               on=["codigo_producto", "scenario", "model"], validate="many_to_one")
    replay = guarded[guarded.strategy.eq("original_locked")]
    joined = selected.merge(replay, on=["codigo_producto", "scenario", "phase"], validate="one_to_one", suffixes=("_old", "_new"))
    for metric in ("mae", "rmse", "wape", "bias", "mase"):
        assert (joined[f"{metric}_old"] - joined[f"{metric}_new"]).abs().lt(1e-10).all()
    assert joined.origins_old.eq(joined.origins_new).all()
    assert guarded.evaluation_status.str.startswith("post_hoc_diagnostic").all()


def test_business_only_path_does_not_fit_or_rewrite_original_outputs(config, tmp_path, monkeypatch):
    import inventory_demand.evaluation as evaluation
    import inventory_demand.forecasting as forecasting
    import inventory_demand.pipeline as pipeline

    def forbidden_fit(*args, **kwargs):
        raise AssertionError("Business update must not train or reselect historical models")

    monkeypatch.setattr(pipeline, "run_backtests", forbidden_fit)
    monkeypatch.setattr(evaluation, "fit_predict", forbidden_fit)
    monkeypatch.setattr(evaluation, "choose_model", forbidden_fit)
    monkeypatch.setattr(forecasting, "fit_predict", forbidden_fit)
    target = replace(config, root=tmp_path)
    target.prepare()
    for source in config.tables.glob("*.csv"):
        if source.stem not in UPDATE_TABLES:
            copy2(source, target.tables / source.name)
    for name in ("monthly_demand.csv", "validated_transactions.csv"):
        copy2(config.processed / name, target.processed / name)
    for name in ("final_report.md", "data_quality.md"):
        copy2(config.root / "reports" / "history" / "pre_rujaf_update" / name, tmp_path / "reports" / name)
    original_hashes = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in target.tables.glob("*.csv")}
    scenario = config.root / "scenarios" / "rujaf_planning.json"
    update_existing_results(target, scenario)
    first = {name: (target.tables / f"{name}.csv").read_bytes() for name in UPDATE_TABLES}
    update_existing_results(target, scenario)
    for path, expected in original_hashes.items():
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected
    for name, expected in first.items():
        assert (target.tables / f"{name}.csv").read_bytes() == expected
    for name in ("final_report.md", "data_quality.md"):
        assert (tmp_path / "reports" / "history" / "pre_rujaf_update" / name).read_bytes() == (
            config.root / "reports" / "history" / "pre_rujaf_update" / name).read_bytes()
    status = json.loads((tmp_path / "artifacts" / "rujaf_planning_readiness.json").read_text())
    assert not status["live_recommendation_allowed"] and status["actual_savings"] is None
    assert status["manufacturing_cost_evaluation"]["status"] == "blocked_missing_manufacturing_cost_inputs"
    with pytest.raises(ValueError, match="original forecast analysis date"):
        update_existing_results(replace(target, as_of="2030-01-01"), scenario)


@pytest.mark.parametrize("extra", [["--eda-only"], ["--notebook-only"], ["--execute-notebook"],
                                  ["--as-of", "2030-01-01"]])
def test_cli_blocks_reexecution_or_redating_archived_evidence(extra, monkeypatch):
    from inventory_demand.pipeline import main

    monkeypatch.setattr(sys, "argv", ["kardex-demand", "--business-update-only", *extra])
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 2

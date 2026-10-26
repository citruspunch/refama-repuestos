"""Integration checks for generated deliverables; skip only before the first full run."""

import json
import re

import pandas as pd
import pytest


def outputs(config):
    if not (config.tables / "model_comparison.csv").exists():
        pytest.skip("Run the complete pipeline first for output integration checks")
    return config.tables


def test_all_scenarios_candidates_and_temporal_cutoffs(config):
    path = outputs(config)
    comparison = pd.read_csv(path / "model_comparison.csv")
    predictions = pd.read_csv(path / "backtest_predictions.csv", parse_dates=["training_end", "target_month"])
    assert len(comparison) == 2 * 3 * 2 * 13
    assert comparison.groupby(["codigo_producto", "scenario", "phase"]).model.nunique().eq(13).all()
    assert predictions.training_end.lt(predictions.target_month).all()
    assert predictions.groupby(["codigo_producto", "scenario", "phase", "model"]).size().min() >= 6
    assert predictions.groupby(["codigo_producto", "scenario"]).apply(
        lambda g: g[g.phase.eq("validation")].target_month.max() < g[g.phase.eq("holdout")].target_month.min(),
        include_groups=False).all()


def test_forecasts_do_not_pretend_to_be_live(config):
    path = outputs(config)
    f = pd.read_csv(path / "next_history_month_forecasts.csv", parse_dates=["forecast_origin", "target_month"])
    assert len(f) == 6
    assert f.live_forecast_available.eq(False).all()
    assert f.forecast_origin.lt(f.target_month).all()
    assert f.status.str.contains("NOT_live").all()
    if "nonnegative_clipped" in f:
        a = f[f.codigo_producto.eq("UAH-90385-18025") & f.scenario.eq("combined")].iloc[0]
        assert a.nonnegative_clipped and a.raw_forecast_units < 0
        assert a.units_already_in_unconfirmed_boundary == 325


def test_policy_outputs_aligned_and_hypothetical(config):
    path = outputs(config)
    scenarios = pd.read_csv(path / "inventory_scenarios.csv", parse_dates=["observed_balance_cutoff", "forecast_target_month"])
    assert len(scenarios) == 6
    assert scenarios.status.eq("hypothetical_scenario").all()
    assert scenarios.observed_balance_cutoff.lt(scenarios.forecast_target_month).all()
    assert set(scenarios.assumed_lead_time_months) == {.5, 1., 2.}
    financial = json.loads((config.root / "artifacts/financial_readiness.json").read_text())
    assert financial["actual_savings"] is None
    assert financial["cost_evaluation"]["status"] == "blocked_missing_cost_inputs"


def test_movement_totals_preserve_supply_and_non_sale_outflows(config):
    path = outputs(config)
    totals = pd.read_csv(path / "movement_totals.csv")
    assert totals.net.eq(totals.incoming - totals.outgoing).all()
    assert totals.groupby("codigo_producto").net.sum().to_dict() == {
        "48815-14050": 44, "UAH-90385-18025": 5567}


def test_report_figures_exist_and_nonempty(config):
    outputs(config)
    for name in ("final_report.md", "data_quality.md"):
        text = (config.root / "reports" / name).read_text()
        for target in re.findall(r"!\[[^\]]*\]\(([^)]+)\)", text):
            assert (config.root / "reports" / target).stat().st_size > 1000


def test_public_reports_and_data_do_not_include_customer_names(config, cleaned):
    outputs(config)
    names = {n for n in cleaned.loc[cleaned.is_sale, "cliente_proveedor"].unique() if len(n) > 8}
    paths = list((config.root / "reports").glob("**/*.csv")) + list((config.root / "reports").glob("*.md"))
    paths += list(config.processed.glob("*.csv"))
    for path in paths:
        text = path.read_text()
        assert not any(name in text for name in names), f"Customer name leaked in {path}"


def test_executed_notebook_has_no_errors(config):
    outputs(config)
    nb = json.loads((config.root / "notebooks/01_exploratory_analysis.ipynb").read_text())
    code_cells = [c for c in nb["cells"] if c["cell_type"] == "code"]
    assert all(c["execution_count"] is not None for c in code_cells)
    assert all(output.get("output_type") != "error" for c in code_cells for output in c["outputs"])

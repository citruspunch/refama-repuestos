"""Add the RUJAF planning layer without retraining or overwriting historical results."""

import hashlib
import json
from dataclasses import asdict
from pathlib import Path
from shutil import copy2

import pandas as pd

from .business import DEMAND_STREAMS, REPORTED_PRODUCTS, reported_product_table
from .config import Config
from .financial import ManufacturingCostInputs, evaluate_production_costs, unclassified_value_scenario
from .forecast_validity import ForecastValidityRules, evaluate_safeguards
from .inventory import OpenProductionOrder, ProductionConstraints, ProductionInputs, plan_production


UPDATE_TABLES = {"reported_product_inputs", "rujaf_demand_streams", "forecast_safeguard_predictions",
                 "forecast_safeguard_comparison", "forecast_validity", "production_scenarios",
                 "unclassified_value_scenarios"}


def preserve_historical_results(config: Config):
    """Archive original report prose once; hash unchanged datasets, metrics and artifacts."""
    manifest = config.root / "artifacts" / "historical_results_manifest.json"
    if manifest.exists():
        return
    archive = config.root / "reports" / "history" / "pre_rujaf_update"
    archive.mkdir(parents=True, exist_ok=True)
    for name in ("final_report.md", "data_quality.md"):
        source = config.root / "reports" / name
        if source.exists() and not (archive / name).exists():
            copy2(source, archive / name)
    paths = list(config.processed.glob("*.csv"))
    paths += [p for p in config.tables.glob("*.csv") if p.stem not in UPDATE_TABLES]
    paths += list(config.figures.glob("*.png")) + list((config.root / "notebooks").glob("*.ipynb"))
    paths += [p for p in (config.root / "artifacts").iterdir() if p.is_file()
              and not p.name.startswith(("rujaf_", "historical_"))]
    paths += list(config.raw.glob("*.csv"))
    paths += [config.root / "tests" / name for name in ("conftest.py", "test_data.py", "test_deliverables.py",
              "test_features_and_models.py", "test_inventory_financial.py")]
    paths = [path for path in paths if path.is_file()]
    prior_test_result = config.root / "reports" / "test_results.xml"
    if prior_test_result.exists():
        paths.append(prior_test_result)
    payload = {"purpose": "Pre-update files retained unchanged; report prose archived in reports/history/pre_rujaf_update",
               "files": {str(p.relative_to(config.root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(paths)}}
    manifest.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def demand_stream_summary(monthly: pd.DataFrame, tables: dict) -> pd.DataFrame:
    observed = monthly.pivot(index=["codigo_producto", "month"], columns="scenario", values="sales_units")
    if observed.isna().any().any() or not observed.combined.eq(observed.refama + observed.other).all():
        raise ValueError("RUJAF outgoing sales must equal Refama + other exactly, with no duplicated channel")
    summary = tables["sales_summary"][["codigo_producto", "scenario", "all_observed_sales_units", "monthly_mean", "complete_months"]].copy()
    summary["demand_stream"] = summary.scenario.map(DEMAND_STREAMS)
    return summary.merge(tables["trend"][["codigo_producto", "scenario", "last_12_mean", "last_12_vs_first_12"]],
                         on=["codigo_producto", "scenario"], validate="one_to_one")


def planning_tables(monthly: pd.DataFrame, tables: dict, scenario: dict,
                    rules=ForecastValidityRules()) -> dict[str, pd.DataFrame]:
    required = {"days_per_month", "review_period_days", "production_lead_time_days", "available_production_days",
                "safety_stock_months", "batch_size_units", "minimum_batch_units", "maximum_production_units",
                "maximum_inventory_units", "reserved_stock_units", "restricted_stock_units", "backorders_units",
                "open_production_orders", "products"}
    if required - scenario.keys():
        raise ValueError(f"Explicit scenario assumptions required: {sorted(required - scenario.keys())}")
    if not scenario["available_production_days"] or not scenario["safety_stock_months"]:
        raise ValueError("Production-day and safety-stock sensitivity grids must not be empty")
    update = {"reported_product_inputs": reported_product_table(),
              "rujaf_demand_streams": demand_stream_summary(monthly, tables)}
    update.update(evaluate_safeguards(monthly, tables["backtest_predictions"], tables["next_history_month_forecasts"],
                                      tables["next_history_baseline_forecasts"], rules))
    monthly = monthly.copy()
    monthly["month"] = pd.to_datetime(monthly.month)
    rows, values = [], []
    for f in update["forecast_validity"][update["forecast_validity"].scenario.eq("combined")].itertuples():
        history = monthly[monthly.codigo_producto.eq(f.codigo_producto) & monthly.scenario.eq("combined")
                           & monthly.complete_for_modeling & monthly.month.lt(pd.Timestamp(f.target_month))].sort_values("month")
        on_hand = float(history.closing_balance.iloc[-1])
        if f.codigo_producto not in scenario["products"] or {"units_per_production_day", "unclassified_net_unit_value"} - scenario["products"][f.codigo_producto].keys():
            raise ValueError(f"Explicit scenario rate and unclassified value required for {f.codigo_producto}")
        product = scenario["products"][f.codigo_producto]
        values.append({"codigo_producto": f.codigo_producto, "balance_cutoff": f.forecast_origin,
                       **unclassified_value_scenario(on_hand, REPORTED_PRODUCTS[f.codigo_producto],
                                                       scenario_unit_value=product["unclassified_net_unit_value"]),
                       "balance_status": "historical_unverified_bookkeeping_stock"})
        for days in scenario["available_production_days"]:
            for safety_months in scenario["safety_stock_months"]:
                if not isinstance(safety_months, (int, float)) or not 0 <= safety_months < float("inf"):
                    raise ValueError("Safety-stock months must be finite and nonnegative")
                constraints = ProductionConstraints(
                    units_per_production_day=product["units_per_production_day"], available_production_days=days,
                    production_lead_time_days=scenario["production_lead_time_days"], batch_size_units=scenario["batch_size_units"],
                    minimum_batch_units=scenario["minimum_batch_units"], maximum_production_units=scenario["maximum_production_units"],
                    maximum_inventory_units=scenario["maximum_inventory_units"])
                assumptions = ("unverified_bookkeeping_stock", "unconfirmed_production_constraints", "retrospective_forecast",
                               "reported_rate_as_scenario_rate", "available_production_days", "production_lead_time_days",
                               "days_per_month", "review_period_days", "safety_stock_units", "open_production_orders",
                               "reserved_stock_units", "restricted_stock_units", "backorders_units", "batch_sizes",
                               "optional_production_and_inventory_limits", "per_SKU_days_not_shared_factory_schedule")
                effective = f.effective_forecast_units if f.valid_for_scenario else None
                inputs = ProductionInputs(effective, on_hand, str(f.forecast_origin), str(f.forecast_origin),
                                          str(f.target_month), days_per_month=scenario["days_per_month"],
                                          review_period_days=scenario["review_period_days"],
                                          safety_stock_units=safety_months * effective if effective is not None else None,
                                          monthly_error_std=f.monthly_error_std if pd.notna(f.monthly_error_std) else None,
                                          open_production_orders=tuple(OpenProductionOrder(**order) for order in scenario["open_production_orders"]),
                                          reserved_stock_units=scenario["reserved_stock_units"], restricted_stock_units=scenario["restricted_stock_units"],
                                          backorders_units=scenario["backorders_units"], constraints=constraints,
                                          forecast_valid_for_scenario=f.valid_for_scenario, assumed_fields=assumptions)
                result = plan_production(inputs)
                rows.append({"codigo_producto": f.codigo_producto, "forecast_target_month": f.target_month,
                             "balance_cutoff": f.forecast_origin, "recorded_on_hand_units": on_hand,
                             "locked_model": f.locked_model, "effective_model": f.effective_model, "fallback_used": f.fallback_used,
                             "lower80_heuristic": f.lower80_heuristic, "upper80_heuristic": f.upper80_heuristic,
                             "assumed_units_per_production_day": constraints.units_per_production_day,
                             "assumed_available_production_days": days, "assumed_safety_stock_months": safety_months,
                             "assumed_lead_time_days": constraints.production_lead_time_days,
                             "assumed_review_days": inputs.review_period_days,
                             **dict.fromkeys(("expected_monthly_outgoing_units", "coverage_days", "safety_stock_units",
                                              "production_trigger_units", "surplus_above_target_units", "estimated_production_days_required",
                                              "projected_shortage_units")),
                             **{key: value for key, value in result.items() if key != "inputs"},
                             "scenario_inputs_json": json.dumps(asdict(inputs), sort_keys=True, allow_nan=False)})
    update["production_scenarios"] = pd.DataFrame(rows)
    update["unclassified_value_scenarios"] = pd.DataFrame(values)
    return update


def write_planning_outputs(monthly: pd.DataFrame, tables: dict, config: Config, scenario_path: Path,
                            rules=ForecastValidityRules()) -> dict:
    scenario = json.loads(scenario_path.read_text(encoding="utf-8"))
    update = planning_tables(monthly, tables, scenario, rules)
    for name, frame in update.items():
        frame.to_csv(config.tables / f"{name}.csv", index=False)
    readiness = {"scope": "RUJAF manufacturing and wholesale finished goods; not Refama consumer demand",
                 "analysis_as_of": config.as_of,
                 "scenario_inputs": scenario, "forecast_validity_rules": asdict(rules),
                 "fallback_status": "fixed_MA3_provisional_post_hoc_diagnostic_not_newly_selected_model",
                 "manufacturing_cost_evaluation": evaluate_production_costs(pd.DataFrame(), ManufacturingCostInputs()),
                 "live_recommendation_allowed": False, "actual_savings": None,
                 "non_fiscal_dispatch_documents": "reported; legal/accounting treatment unverified; tax avoidance is not an objective"}
    (config.root / "artifacts" / "rujaf_planning_readiness.json").write_text(json.dumps(readiness, indent=2) + "\n", encoding="utf-8")
    tables.update(update)
    return tables


def update_existing_results(config: Config, scenario_path: Path):
    """No source cleaning, fitting, original CSV/artifact rewriting or notebook execution."""
    from .reporting import write_business_summary, write_findings, write_quality_report

    preserve_historical_results(config)
    tables = {path.stem: pd.read_csv(path, float_precision="round_trip") for path in config.tables.glob("*.csv")
              if path.stem not in UPDATE_TABLES}
    if not tables["next_history_month_forecasts"].analysis_as_of.eq(config.as_of).all():
        raise ValueError("Business-only updates must retain the original forecast analysis date")
    monthly = pd.read_csv(config.processed / "monthly_demand.csv", float_precision="round_trip")
    write_planning_outputs(monthly, tables, config, scenario_path)
    write_findings(tables, config)
    write_business_summary(tables, config)
    transactions = pd.read_csv(config.processed / "validated_transactions.csv")
    write_quality_report(tables, transactions, config)
    return tables

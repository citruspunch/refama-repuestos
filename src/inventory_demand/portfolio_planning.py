"""Data-driven production sensitivities and timed replay of recorded-sales withdrawals."""

import json
from dataclasses import asdict
from itertools import product

import numpy as np
import pandas as pd

from .inventory import OpenProductionOrder, ProductionConstraints, ProductionInputs, plan_production


ASSUMPTIONS = (
    "unverified_bookkeeping_stock", "unconfirmed_production_constraints", "retrospective_forecast",
    "reported_rate_as_scenario_rate", "available_production_days", "production_lead_time_days",
    "days_per_month", "review_period_days", "safety_stock_units", "open_production_orders",
    "reserved_stock_units", "restricted_stock_units", "backorders_units", "batch_sizes",
    "optional_production_and_inventory_limits", "per_SKU_days_not_shared_factory_schedule",
)


def scenario_variants(catalog: pd.DataFrame, scenario: dict):
    required = {"days_per_month", "review_period_days", "production_lead_time_days", "available_production_days",
                "safety_stock_months", "demand_factors", "batch_size_units", "minimum_batch_units",
                "maximum_production_units", "maximum_inventory_units", "reserved_stock_units",
                "restricted_stock_units", "backorders_units", "open_production_orders", "products"}
    if required - scenario.keys():
        raise ValueError(f"Explicit scenario assumptions required: {sorted(required - scenario.keys())}")
    for key in ("available_production_days", "safety_stock_months", "demand_factors"):
        values = scenario[key]
        if not values or any(not isinstance(v, (int, float)) or not np.isfinite(v) or v < 0 for v in values):
            raise ValueError(f"Invalid sensitivity grid: {key}")
        if len(set(values)) != len(values):
            raise ValueError(f"Repeated sensitivity values: {key}")
    for row in catalog.itertuples():
        override = scenario["products"].get(row.codigo_producto, {})
        lower = override.get("units_per_production_day", getattr(row, "produccion_aproximada_diaria_min", np.nan))
        upper = override.get("units_per_production_day", getattr(row, "produccion_aproximada_diaria_max", np.nan))
        if "units_per_production_day" in override and (not np.isfinite(override["units_per_production_day"]) or override["units_per_production_day"] <= 0):
            raise ValueError("Scenario rate overrides must be finite and positive")
        reported_rates = pd.to_numeric(pd.Series([lower, upper]), errors="coerce").dropna()
        rates = sorted(set(float(v) for v in reported_rates)) or [np.nan]
        for rate, days, safety, factor in product(rates, scenario["available_production_days"],
                                                scenario["safety_stock_months"], scenario["demand_factors"]):
            yield {"codigo_producto": row.codigo_producto, "assumed_units_per_production_day": rate,
                   "assumed_available_production_days": days, "assumed_safety_stock_months": safety,
                   "demand_factor": factor,
                   "variant_id": f"rate{rate:g}_days{days:g}_ss{safety:g}_demand{factor:g}"}


def calculate_plan(forecast, on_hand, cutoff, target, variant, scenario, *, error_std=None, orders=None):
    rate = variant["assumed_units_per_production_day"]
    constraints = ProductionConstraints(
        units_per_production_day=rate if np.isfinite(rate) else None,
        available_production_days=variant["assumed_available_production_days"],
        production_lead_time_days=scenario["production_lead_time_days"], batch_size_units=scenario["batch_size_units"],
        minimum_batch_units=scenario["minimum_batch_units"], maximum_production_units=scenario["maximum_production_units"],
        maximum_inventory_units=scenario["maximum_inventory_units"])
    point = float(forecast) * variant["demand_factor"] if pd.notna(forecast) else None
    inputs = ProductionInputs(
        forecast_units_per_month=point, on_hand_units=float(on_hand), as_of_date=str(cutoff),
        observed_inventory_date=str(cutoff), forecast_target_month=str(target), days_per_month=scenario["days_per_month"],
        review_period_days=scenario["review_period_days"],
        safety_stock_units=point * variant["assumed_safety_stock_months"] if point is not None else None,
        monthly_error_std=float(error_std) if pd.notna(error_std) else None,
        open_production_orders=tuple(OpenProductionOrder(**order) for order in (scenario["open_production_orders"] if orders is None else orders)),
        reserved_stock_units=scenario["reserved_stock_units"], restricted_stock_units=scenario["restricted_stock_units"],
        backorders_units=scenario["backorders_units"], constraints=constraints,
        forecast_valid_for_scenario=point is not None, assumed_fields=ASSUMPTIONS)
    result = plan_production(inputs)
    return {**{k: v for k, v in result.items() if k != "inputs"},
            "scenario_inputs_json": json.dumps(asdict(inputs), sort_keys=True, allow_nan=False)}


def portfolio_production(monthly, validity, catalog, scenario):
    rows = []
    variants = list(scenario_variants(catalog, scenario))
    for f in validity[validity.scenario.eq("combined")].itertuples():
        history = monthly[monthly.codigo_producto.eq(f.codigo_producto) & monthly.scenario.eq("combined")
                          & monthly.complete_for_modeling & monthly.month.lt(pd.Timestamp(f.target_month))].sort_values("month")
        on_hand = float(history.closing_balance.iloc[-1])
        for variant in variants:
            if variant["codigo_producto"] != f.codigo_producto:
                continue
            if on_hand < 0:
                rows.append({**variant, "status": "blocked_negative_recorded_stock", "live_recommendation_allowed": False})
                continue
            result = calculate_plan(f.effective_forecast_units if f.valid_for_scenario else None,
                                    on_hand, f.forecast_origin, f.target_month, variant, scenario,
                                    error_std=f.monthly_error_std)
            rows.append({**variant, "forecast_target_month": f.target_month, "balance_cutoff": f.forecast_origin,
                         "recorded_on_hand_units": on_hand, "locked_model": f.locked_model,
                         "effective_model": f.effective_model, "fallback_used": f.fallback_used,
                         "lower80_heuristic": f.lower80_heuristic * variant["demand_factor"],
                         "upper80_heuristic": f.upper80_heuristic * variant["demand_factor"], **result})
    return pd.DataFrame(rows)


def replay_production(monthly, daily, safeguarded_predictions, catalog, scenario):
    """Monthly decisions, daily timed receipts and actual recorded VENTA as evaluation outcomes.

    This is NOT a reconstruction of actual factory decisions. Historical adjustments,
    transfers and receipts are not replayed as supply. Unserved quantities are simulated
    recorded sales, never estimates of real lost demand. Guard rules are diagnostic.
    """
    rows, daily_rows = [], []
    holdout = safeguarded_predictions[safeguarded_predictions.phase.eq("holdout") & safeguarded_predictions.scenario.eq("combined")]
    for variant in scenario_variants(catalog, scenario):
        # Stress factors belong to point scenarios; avoid implying stressed actual observations.
        if variant["demand_factor"] != 1:
            continue
        code = variant["codigo_producto"]
        origins = holdout[holdout.codigo_producto.eq(code)].sort_values("target_month")
        if origins.empty:
            continue
        start = pd.Timestamp(origins.target_month.iloc[0])
        prior = monthly[monthly.codigo_producto.eq(code) & monthly.scenario.eq("combined") & monthly.month.lt(start)].sort_values("month")
        stock = float(prior.closing_balance.iloc[-1])
        if stock < 0:
            rows.append({**variant, "status": "blocked_negative_initial_stock", "live_recommendation_allowed": False})
            continue
        queue = [dict(order) for order in scenario["open_production_orders"]]
        for f in origins.itertuples():
            target = pd.Timestamp(f.target_month).as_unit("ns")
            cutoff = target - pd.Timedelta(1, unit="D")
            initial = stock
            result = calculate_plan(f.effective_forecast_units if f.valid_for_scenario else None,
                                    stock, cutoff, target, variant, scenario, orders=queue)
            if result["status"] != "hypothetical_production_scenario":
                rows.append({**variant, "target_month": target, **result})
                break
            quantity = result["suggested_production_units"]
            due = max(target, cutoff + pd.Timedelta(scenario["production_lead_time_days"], unit="D"))
            if quantity:
                queue.append({"units": quantity, "due_date": due.isoformat()})
            actual = daily[daily.codigo_producto.eq(code) & daily.month.eq(target)].set_index("date")
            received = withdrawn = unserved = 0.0
            stock_days = 0.0
            for day in pd.date_range(target, target + pd.offsets.MonthEnd(0), freq="D"):
                receipts = sum(o["units"] for o in queue if pd.Timestamp(o["due_date"]) <= day)
                queue = [o for o in queue if pd.Timestamp(o["due_date"]) > day]
                stock += receipts
                demand = float(actual.loc[day, "sales_units"]) if day in actual.index else 0.0
                served = min(stock, demand)
                missed = demand - served
                stock -= served
                stock_days += stock
                received += receipts
                withdrawn += served
                unserved += missed
                daily_rows.append({**variant, "date": day, "receipts_units": receipts, "recorded_sales_units": demand,
                                   "simulated_served_units": served, "simulated_unserved_recorded_sales_units": missed,
                                   "simulated_closing_stock": stock})
            rows.append({**variant, "target_month": target, "training_end": f.training_end,
                         "starting_simulated_stock": initial, "ending_simulated_stock": stock,
                         "received_units": received, "simulated_served_units": withdrawn,
                         "simulated_unserved_recorded_sales_units": unserved,
                         "recorded_sales_units": withdrawn + unserved,
                         "mean_simulated_eod_stock": stock_days / (target + pd.offsets.MonthEnd(0)).day,
                         "decision_forecast_units": f.effective_forecast_units,
                         "suggested_production_units": quantity, "production_due_date": due,
                         "status": "post_hoc_recorded_sales_policy_replay_NOT_actual_service_or_savings",
                         "live_recommendation_allowed": False})
    return pd.DataFrame(rows), pd.DataFrame(daily_rows)

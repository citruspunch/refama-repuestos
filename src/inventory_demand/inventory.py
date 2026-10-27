"""Purchasing compatibility and production-aware scenarios; no optimality claim."""

import math
from dataclasses import asdict, dataclass, field
from statistics import NormalDist

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class PurchasingConstraints:
    minimum_order_units: int = 0
    pack_size_units: int = 1
    maximum_order_units: int | None = None
    budget: float | None = None
    unit_cost: float | None = None


@dataclass(frozen=True)
class PolicyInputs:
    forecast_units_per_month: float
    on_hand_units: float
    lead_time_months: float | None = None
    service_level: float = .95
    monthly_demand_std: float | None = None
    safety_stock_units: float | None = None
    review_period_months: float = 1.0
    on_order_units: float | None = None
    backorders_units: float | None = None
    constraints: PurchasingConstraints = field(default_factory=PurchasingConstraints)
    assumed_fields: tuple[str, ...] = ()
    observed_inventory_date: str | None = None
    forecast_target_month: str | None = None


def recommend(inputs: PolicyInputs) -> dict:
    """Legacy purchasing arithmetic only; no forecast/date validity certification or live approval."""
    missing = [name for name in ("lead_time_months", "on_order_units", "backorders_units") if getattr(inputs, name) is None]
    if inputs.safety_stock_units is None and inputs.monthly_demand_std is None:
        missing.append("monthly_demand_std_or_explicit_safety_stock")
    if missing:
        return {"status": "blocked_missing_inputs", "missing_inputs": missing,
                "suggested_order_units": None, "inputs": asdict(inputs)}
    numbers = [inputs.forecast_units_per_month, inputs.on_hand_units, inputs.lead_time_months,
               inputs.on_order_units, inputs.backorders_units, inputs.review_period_months]
    if not all(math.isfinite(v) and v >= 0 for v in numbers):
        raise ValueError("Policy quantities, lead time, and review period must be finite and nonnegative")
    if not .5 < inputs.service_level < 1:
        raise ValueError("Normal approximation requires .5 < service level < 1")
    if inputs.review_period_months <= 0:
        raise ValueError("Review/order-up-to coverage must be positive")
    for value in (inputs.monthly_demand_std, inputs.safety_stock_units):
        if value is not None and (not math.isfinite(value) or value < 0):
            raise ValueError("Uncertainty and safety stock must be finite and nonnegative")
    z = NormalDist().inv_cdf(inputs.service_level)
    lead = inputs.lead_time_months
    coverage = lead + inputs.review_period_months
    if inputs.safety_stock_units is None:
        lead_safety = z * inputs.monthly_demand_std * math.sqrt(lead)
        coverage_safety = z * inputs.monthly_demand_std * math.sqrt(coverage)
    else:
        lead_safety = coverage_safety = inputs.safety_stock_units
    reorder_point = inputs.forecast_units_per_month * lead + lead_safety
    target = inputs.forecast_units_per_month * coverage + coverage_safety
    position = inputs.on_hand_units + inputs.on_order_units - inputs.backorders_units
    trigger = position <= reorder_point
    unconstrained = max(0, math.ceil(target - position)) if trigger else 0
    c = inputs.constraints
    if c.pack_size_units < 1 or c.minimum_order_units < 0:
        raise ValueError("Invalid pack size or minimum order")
    if c.maximum_order_units is not None and c.maximum_order_units < 0:
        raise ValueError("Maximum order must be nonnegative")
    if c.budget is not None and (c.unit_cost is None or c.unit_cost <= 0 or c.budget < 0):
        raise ValueError("A nonnegative budget requires a positive unit cost")
    suggested = math.ceil(max(unconstrained, c.minimum_order_units) / c.pack_size_units) * c.pack_size_units if unconstrained else 0
    cap = math.inf
    if c.maximum_order_units is not None:
        cap = c.maximum_order_units
    if c.budget is not None:
        cap = min(cap, math.floor(c.budget / c.unit_cost))
    if math.isfinite(cap):
        suggested = min(suggested, math.floor(cap / c.pack_size_units) * c.pack_size_units)
    infeasible = suggested > 0 and suggested < c.minimum_order_units
    if infeasible:
        suggested = 0
    constrained_shortfall = suggested < unconstrained
    return {"status": "hypothetical_scenario" if inputs.assumed_fields else "policy_calculation_not_validated_optimum",
            "live_recommendation_allowed": False,
            "inventory_position_units": position, "reorder_point_units": reorder_point,
            "order_up_to_units": target, "lead_time_safety_stock_units": lead_safety,
            "coverage_safety_stock_units": coverage_safety, "reorder_trigger": trigger,
            "unconstrained_order_units": unconstrained, "suggested_order_units": suggested,
            "constraints_prevent_target": constrained_shortfall, "minimum_order_infeasible": infeasible,
            "assumed_fields": inputs.assumed_fields, "inputs": asdict(inputs),
            "warning": "Gaussian independent monthly increments and constant-rate demand are unvalidated; no achieved-service guarantee"}


def inventory_scenarios(monthly: pd.DataFrame, forecasts: pd.DataFrame, predictions: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for f in forecasts[forecasts.scenario.eq("combined")].itertuples():
        history = monthly[monthly.codigo_producto.eq(f.codigo_producto) & monthly.scenario.eq("combined") & monthly.complete_for_modeling]
        # Align the recorded inventory and forecast origin. Never mix a later balance
        # with a historical forecast and call it an as-of decision.
        on_hand = history.sort_values("month").closing_balance.iloc[-1]
        residual = predictions[predictions.codigo_producto.eq(f.codigo_producto) & predictions.scenario.eq("combined")
                               & predictions.phase.eq("validation") & predictions.selected].error
        sigma = float(residual.std(ddof=1))
        for lead in (.5, 1.0, 2.0):
            inputs = PolicyInputs(forecast_units_per_month=f.forecast_units, on_hand_units=float(on_hand),
                                  lead_time_months=lead, service_level=.95, monthly_demand_std=sigma,
                                  on_order_units=0, backorders_units=0,
                                  assumed_fields=("lead_time_months", "service_level", "on_order_units", "backorders_units", "review_period_months", "uncertainty_scaling"),
                                  observed_inventory_date=str(f.forecast_origin),
                                  forecast_target_month=str(f.target_month))
            result = recommend(inputs)
            rows.append({"codigo_producto": f.codigo_producto, "forecast_target_month": f.target_month,
                         "observed_balance_cutoff": f.forecast_origin, "observed_bookkeeping_balance": on_hand,
                         "estimated_forecast_units": f.forecast_units, "estimated_monthly_error_std": sigma,
                         "assumed_lead_time_months": lead, "assumed_service_level": .95,
                         "assumed_on_order_units": 0, "assumed_backorders_units": 0, "assumed_review_months": 1,
                         **{k: result[k] for k in ("status", "inventory_position_units", "reorder_point_units",
                             "order_up_to_units", "reorder_trigger", "suggested_order_units")},
                         "warning": "Retrospective hypothetical scenario; not a live recommendation or actual optimum"})
    return pd.DataFrame(rows)


@dataclass(frozen=True)
class OpenProductionOrder:
    """Remaining expected good units, not original ordered units or completed receipts."""
    units: float
    due_date: str


@dataclass(frozen=True)
class ProductionConstraints:
    units_per_production_day: float | None = None
    available_production_days: float | None = None
    production_lead_time_days: float | None = None
    batch_size_units: int | None = None
    minimum_batch_units: int | None = None
    maximum_production_units: int | None = None
    maximum_inventory_units: float | None = None


@dataclass(frozen=True)
class ProductionInputs:
    forecast_units_per_month: float | None
    on_hand_units: float
    as_of_date: str
    observed_inventory_date: str
    forecast_target_month: str
    days_per_month: float | None = None
    review_period_days: float | None = None
    safety_stock_units: float | None = None
    monthly_error_std: float | None = None
    open_production_orders: tuple[OpenProductionOrder, ...] | None = None
    reserved_stock_units: float | None = None
    restricted_stock_units: float | None = None
    backorders_units: float | None = None
    constraints: ProductionConstraints = field(default_factory=ProductionConstraints)
    forecast_valid_for_scenario: bool = False
    forecast_current: bool = False
    physical_stock_verified: bool = False
    constraints_confirmed: bool = False
    maximum_stock_age_days: int | None = None
    mode: str = "scenario"
    assumed_fields: tuple[str, ...] = ()


def plan_production(inputs: ProductionInputs) -> dict:
    """Calculate a periodic-review order-up-to finished-goods production SCENARIO.

    Lead time is total elapsed calendar time to good-unit receipt, including processing.
    Runtime is reported separately, not added to that lead time or called a feasible schedule.
    Reservations/restrictions are disjoint; backorders exclude those reservations.
    """
    if inputs.mode not in {"scenario", "live"}:
        raise ValueError("mode must be scenario or live")
    blocked = {"suggested_production_units": None, "live_recommendation_allowed": False,
               "inputs": asdict(inputs)}
    if not inputs.forecast_valid_for_scenario:
        return {**blocked, "status": "blocked_invalid_forecast", "blockers": ["forecast_validity"]}
    required = ("forecast_units_per_month", "days_per_month", "review_period_days", "safety_stock_units", "open_production_orders",
                "reserved_stock_units", "restricted_stock_units", "backorders_units")
    missing = [name for name in required if getattr(inputs, name) is None]
    c = inputs.constraints
    missing += [f"constraints.{name}" for name in ("units_per_production_day", "available_production_days",
                "production_lead_time_days", "batch_size_units", "minimum_batch_units") if getattr(c, name) is None]
    if missing:
        return {**blocked, "status": "blocked_missing_production_inputs", "blockers": missing}
    quantities = [inputs.forecast_units_per_month, inputs.on_hand_units, inputs.safety_stock_units,
                  inputs.reserved_stock_units, inputs.restricted_stock_units, inputs.backorders_units,
                  c.available_production_days, c.production_lead_time_days]
    if not all(math.isfinite(v) and v >= 0 for v in quantities):
        raise ValueError("Production quantities and times must be finite and nonnegative")
    for value in (inputs.days_per_month, inputs.review_period_days, c.units_per_production_day):
        if not math.isfinite(value) or value <= 0:
            raise ValueError("Days per month, review period, and production rate must be positive")
    for name, minimum in (("batch_size_units", 1), ("minimum_batch_units", 0)):
        value = getattr(c, name)
        if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
            raise ValueError("Batch sizes must be valid whole units")
    for value in (c.maximum_production_units, c.maximum_inventory_units, inputs.monthly_error_std,
                  inputs.maximum_stock_age_days):
        if value is not None and (not math.isfinite(value) or value < 0):
            raise ValueError("Optional limits and uncertainty must be finite and nonnegative")
    if inputs.reserved_stock_units + inputs.restricted_stock_units > inputs.on_hand_units:
        raise ValueError("Disjoint reserved/restricted stock cannot exceed on-hand stock")
    cutoff, stock_date, target = (pd.Timestamp(v) for v in
                                (inputs.as_of_date, inputs.observed_inventory_date, inputs.forecast_target_month))
    if any(pd.isna(v) for v in (cutoff, stock_date, target)) or stock_date > cutoff:
        raise ValueError("Invalid inventory/planning dates or inventory dated after cutoff")
    if inputs.mode == "live":
        # Even complete inputs do not constitute deployment approval for this prototype.
        blockers = ["prototype_not_approved_for_live_use"]
        if inputs.maximum_stock_age_days is None or (cutoff - stock_date).days > inputs.maximum_stock_age_days:
            blockers.append("stale_or_unconfirmed_stock_age")
        if not inputs.physical_stock_verified:
            blockers.append("physical_stock_not_verified")
        if not inputs.constraints_confirmed:
            blockers.append("production_constraints_not_confirmed")
        if not inputs.forecast_current or target.to_period("M") != cutoff.to_period("M") + 1:
            blockers.append("forecast_not_current")
        if inputs.assumed_fields:
            blockers.append("unconfirmed_scenario_assumptions")
        return {**blocked, "status": "blocked_live_planning", "blockers": blockers}
    needed_assumptions = []
    for confirmed, label in ((inputs.physical_stock_verified, "unverified_bookkeeping_stock"),
                             (inputs.constraints_confirmed, "unconfirmed_production_constraints"),
                             (inputs.forecast_current, "retrospective_forecast")):
        if not confirmed and label not in inputs.assumed_fields:
            needed_assumptions.append(label)
    if needed_assumptions:
        return {**blocked, "status": "blocked_unlabeled_scenario_assumptions", "blockers": needed_assumptions}
    lead = c.production_lead_time_days
    horizon = lead + inputs.review_period_days
    due_lead = due_horizon = later_orders = 0.0
    for order in inputs.open_production_orders:
        if not math.isfinite(order.units) or order.units < 0 or pd.isna(pd.Timestamp(order.due_date)):
            raise ValueError("Open production orders need nonnegative remaining units and valid due dates")
        days = (pd.Timestamp(order.due_date) - cutoff).total_seconds() / 86400
        if days < 0:
            return {**blocked, "status": "blocked_overdue_production_order", "blockers": ["reconcile_overdue_orders"]}
        if days <= lead:
            due_lead += order.units
        if days <= horizon:
            due_horizon += order.units
        else:
            later_orders += order.units
    available = inputs.on_hand_units - inputs.reserved_stock_units - inputs.restricted_stock_units
    daily_demand = inputs.forecast_units_per_month / inputs.days_per_month
    position = available + due_horizon - inputs.backorders_units
    lead_position = available + due_lead - inputs.backorders_units
    lead_threshold = daily_demand * lead + inputs.safety_stock_units
    target_units = daily_demand * horizon + inputs.safety_stock_units
    # Periodic review must cover lead + next review, not merely immediate lead demand.
    # Keep the lead-time alert separate: delayed pipeline cannot fix early shortages.
    trigger = position < target_units
    unconstrained = max(0, math.ceil(target_units - position)) if trigger else 0
    batch = c.batch_size_units
    desired = math.ceil(max(unconstrained, c.minimum_batch_units) / batch) * batch if unconstrained else 0
    capacity = c.units_per_production_day * c.available_production_days
    cap = capacity
    if c.maximum_production_units is not None:
        cap = min(cap, c.maximum_production_units)
    if c.maximum_inventory_units is not None:
        # Conservative simultaneous-receipt cap: no assumed sales to create storage space.
        cap = min(cap, max(0, c.maximum_inventory_units - inputs.on_hand_units - due_horizon))
    suggested = min(desired, math.floor(cap / batch) * batch)
    minimum_infeasible = desired > 0 and suggested < c.minimum_batch_units
    if minimum_infeasible:
        suggested = 0
    free_after_backlog = max(0, available - inputs.backorders_units)
    coverage_days = free_after_backlog / daily_demand if daily_demand > 0 else None
    horizon_demand = daily_demand * horizon
    ending = position + suggested - horizon_demand
    return {"status": "hypothetical_production_scenario", "live_recommendation_allowed": False,
            "expected_monthly_outgoing_units": inputs.forecast_units_per_month,
            "expected_weekly_outgoing_units": daily_demand * 7,
            "available_finished_goods_units": available, "inventory_position_units": position,
            "coverage_days": coverage_days,
            "coverage_months": coverage_days / inputs.days_per_month if coverage_days is not None else None,
            "coverage_status": "undefined_zero_forecast" if coverage_days is None else "constant_rate_scenario",
            "monthly_error_std": inputs.monthly_error_std,
            "production_trigger_units": target_units, "production_trigger": trigger,
            "lead_time_alert_units": lead_threshold, "lead_time_alert": lead_position <= lead_threshold,
            "order_up_to_units": target_units, "safety_stock_units": inputs.safety_stock_units,
            "open_production_due_by_lead_units": due_lead, "open_production_due_by_horizon_units": due_horizon,
            "open_production_excluded_later_units": later_orders,
            "shortage_before_receipt_units": max(0, daily_demand * lead - lead_position),
            "shortage_without_new_production_units": max(0, horizon_demand - position),
            "surplus_above_target_units": max(0, position - target_units),
            "unconstrained_production_units": unconstrained, "scenario_capacity_units": capacity,
            "suggested_production_units": suggested,
            "estimated_production_days_required": suggested / c.units_per_production_day,
            "unconstrained_production_days_required": unconstrained / c.units_per_production_day,
            "projected_ending_inventory_net_units": ending,
            "projected_shortage_units": max(0, -ending),
            "constraints_prevent_target": suggested < unconstrained,
            "minimum_batch_infeasible": minimum_infeasible,
            "assumed_fields": inputs.assumed_fields, "inputs": asdict(inputs),
            "warning": "Scenario only; monthly-to-weekly conversion is not a weekly model. Receipt timing, shared capacity, materials, yield and setups require scheduling validation"}

"""Configurable (s,S) policy interfaces. No actual-business optimality claim."""

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

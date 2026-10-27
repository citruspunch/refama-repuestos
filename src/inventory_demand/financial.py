"""Cost accounting and historical policy replay contracts, blocked without actual inputs."""

import math
from dataclasses import asdict, dataclass

import pandas as pd

from .business import ReportedProductInputs


@dataclass(frozen=True)
class CostInputs:
    unit_cost: float | None = None
    carrying_cost_per_unit_month: float | None = None
    ordering_cost: float | None = None
    lost_sale_cost_per_unit: float | None = None
    currency: str | None = None
    hypothetical: bool = False


def evaluate_costs(ledger: pd.DataFrame, inputs: CostInputs) -> dict:
    """Account for a supplied policy ledger, not the company's unobserved losses.

    Ledger fields: purchased_units, average_inventory_units, months, orders,
    lost_sales_units. Actual lost sales cannot be inferred from recorded sales.
    """
    missing = [k for k, v in asdict(inputs).items() if v is None]
    if missing:
        return {"status": "blocked_missing_cost_inputs", "missing_inputs": missing, "actual_savings": None}
    costs = [inputs.unit_cost, inputs.carrying_cost_per_unit_month, inputs.ordering_cost, inputs.lost_sale_cost_per_unit]
    if not all(math.isfinite(c) and c >= 0 for c in costs):
        raise ValueError("Costs must be finite and nonnegative")
    required = ["purchased_units", "average_inventory_units", "months", "orders", "lost_sales_units"]
    if set(required) - set(ledger):
        raise ValueError("Incomplete policy replay ledger")
    if not ledger[required].apply(pd.to_numeric, errors="raise").map(lambda x: math.isfinite(x) and x >= 0).all().all():
        raise ValueError("Ledger values must be finite and nonnegative")
    purchase = float(ledger.purchased_units.sum() * inputs.unit_cost)
    holding = float((ledger.average_inventory_units * ledger.months).sum() * inputs.carrying_cost_per_unit_month)
    ordering = float(ledger.orders.sum() * inputs.ordering_cost)
    shortage = float(ledger.lost_sales_units.sum() * inputs.lost_sale_cost_per_unit)
    return {"status": "hypothetical_only" if inputs.hypothetical else "supplied_ledger_costs_not_verified_savings",
            "purchase_cost": purchase, "carrying_cost": holding, "ordering_cost": ordering,
            "lost_sale_cost": shortage, "total_cost": purchase + holding + ordering + shortage,
            "currency": inputs.currency, "actual_savings": None,
            "warning": "Compare policies on identical demand, horizon, initial pipeline, and terminal stock valuation; do not call procurement timing savings"}


@dataclass(frozen=True)
class ReplayInputs:
    """Required information for a future same-demand historical policy comparison."""
    opening_inventory: float | None = None
    actual_lead_times_available: bool = False
    pending_orders_available: bool = False
    actual_order_decisions_available: bool = False
    demand_censoring_resolved: bool = False

    def readiness(self) -> dict:
        missing = []
        if self.opening_inventory is None:
            missing.append("opening_inventory")
        for name in ("actual_lead_times_available", "pending_orders_available", "actual_order_decisions_available", "demand_censoring_resolved"):
            if not getattr(self, name):
                missing.append(name)
        return {"ready_for_actual_policy_comparison": not missing, "missing": missing}


def unclassified_value_scenario(units: float, reported: ReportedProductInputs, *,
                                 scenario_unit_value: float | None = None) -> dict:
    """A reference multiplication, NEVER inventory valuation, revenue, margin or savings."""
    value = reported.net_unit_value if scenario_unit_value is None else scenario_unit_value
    if not all(math.isfinite(v) and v >= 0 for v in (units, reported.net_unit_value, value)):
        raise ValueError("Units and reported reference values must be finite and nonnegative")
    return {"status": "unclassified_reference_only", "units": units,
            "reported_net_unit_value": reported.net_unit_value, "currency": reported.currency,
            "scenario_net_unit_value": value, "reference_value_overridden": value != reported.net_unit_value,
            "unclassified_reference_amount": units * value,
            "manufacturing_inventory_value": None, "actual_savings": None,
            "warning": "Net unit value meaning unconfirmed; this amount is not cost, sale value, contribution or profit"}


@dataclass(frozen=True)
class ManufacturingCostInputs:
    manufacturing_cost_per_unit: float | None = None
    holding_cost_per_unit_month: float | None = None
    setup_cost_per_batch: float | None = None
    unmet_demand_cost_per_unit: float | None = None
    terminal_inventory_value_per_unit: float | None = None
    currency: str | None = None
    manufacturing_cost_confirmed: bool = False
    hypothetical: bool = False


def evaluate_production_costs(ledger: pd.DataFrame, inputs: ManufacturingCostInputs, *,
                              assumed_unnecessary_production_units: float | None = None) -> dict:
    """Single-SKU, same-unit schedule accounting, not an optimizer or verified business outcome.

    Unnecessary production is a caller-declared scenario, never inferred from lower production.
    A terminal credit preserves the difference between spend timing and economic cost.
    """
    missing = [name for name in ("manufacturing_cost_per_unit", "holding_cost_per_unit_month",
               "setup_cost_per_batch", "unmet_demand_cost_per_unit", "terminal_inventory_value_per_unit",
               "currency") if getattr(inputs, name) is None]
    if not inputs.manufacturing_cost_confirmed and not inputs.hypothetical:
        missing.append("confirmed_manufacturing_cost_or_explicit_hypothetical_costs")
    if missing:
        return {"status": "blocked_missing_manufacturing_cost_inputs", "missing_inputs": missing,
                "actual_savings": None}
    costs = [inputs.manufacturing_cost_per_unit, inputs.holding_cost_per_unit_month,
             inputs.setup_cost_per_batch, inputs.unmet_demand_cost_per_unit, inputs.terminal_inventory_value_per_unit]
    if not all(math.isfinite(v) and v >= 0 for v in costs) or not inputs.currency.strip():
        raise ValueError("Manufacturing costs must be finite/nonnegative and currency explicit")
    required = ["opening_inventory_units", "produced_units", "fulfilled_demand_units", "unmet_demand_units",
                "ending_inventory_units", "average_inventory_units", "months", "batches"]
    if ledger.empty or set(required) - set(ledger):
        raise ValueError("Incomplete production schedule ledger")
    if not ledger[required].map(lambda v: math.isfinite(v) and v >= 0).all().all() or not ledger.months.gt(0).all():
        raise ValueError("Schedule quantities must be finite/nonnegative and periods positive")
    balance = ledger.opening_inventory_units + ledger.produced_units - ledger.fulfilled_demand_units
    if not (balance - ledger.ending_inventory_units).abs().le(1e-8).all():
        raise ValueError("Production schedule inventory does not reconcile")
    previous_ending = ledger.ending_inventory_units.shift(1)
    if not (ledger.opening_inventory_units.iloc[1:] - previous_ending.iloc[1:]).abs().le(1e-8).all():
        raise ValueError("Schedule periods must have continuous inventory")
    excess_holding = None
    if "average_excess_inventory_units" in ledger:
        excess = ledger.average_excess_inventory_units
        if not excess.map(lambda v: math.isfinite(v) and v >= 0).all() or not excess.le(ledger.average_inventory_units).all():
            raise ValueError("Declared excess stock must be finite, nonnegative and bounded by average inventory")
        excess_holding = float((excess * ledger.months).sum() * inputs.holding_cost_per_unit_month)
    if assumed_unnecessary_production_units is not None:
        if not inputs.hypothetical:
            raise ValueError("Unnecessary-production quantities require an explicitly hypothetical scenario")
        if not (math.isfinite(assumed_unnecessary_production_units)
                and 0 <= assumed_unnecessary_production_units <= min(ledger.produced_units.sum(), ledger.ending_inventory_units.iloc[-1])):
            raise ValueError("Assumed unnecessary production must be bounded by production and ending inventory")
    production = float(ledger.produced_units.sum() * inputs.manufacturing_cost_per_unit)
    holding = float((ledger.average_inventory_units * ledger.months).sum() * inputs.holding_cost_per_unit_month)
    setup = float(ledger.batches.sum() * inputs.setup_cost_per_batch)
    unmet = float(ledger.unmet_demand_units.sum() * inputs.unmet_demand_cost_per_unit)
    opening = float(ledger.opening_inventory_units.iloc[0] * inputs.terminal_inventory_value_per_unit)
    terminal = float(ledger.ending_inventory_units.iloc[-1] * inputs.terminal_inventory_value_per_unit)
    return {"status": "hypothetical_manufacturing_costs" if inputs.hypothetical else "supplied_schedule_costs_not_verified_savings",
            "production_spend": production, "holding_cost": holding, "excess_holding_cost": excess_holding,
            "setup_cost": setup, "unmet_demand_cost": unmet,
            "ending_finished_goods_manufacturing_value": float(ledger.ending_inventory_units.iloc[-1] * inputs.manufacturing_cost_per_unit),
            "opening_inventory_terminal_basis": opening, "ending_inventory_terminal_value": terminal,
            "terminal_adjusted_cost": production + holding + setup + unmet + opening - terminal,
            "potential_unnecessary_production_cost": (assumed_unnecessary_production_units * inputs.manufacturing_cost_per_unit
                                                       if assumed_unnecessary_production_units is not None else None),
            "currency": inputs.currency, "actual_savings": None,
            "warning": "Terminal values, eventual sales, service and avoidable versus fixed costs require confirmation; reduced production spend is not verified savings"}


def compare_production_schedules(baseline: pd.DataFrame, alternative: pd.DataFrame,
                                 inputs: ManufacturingCostInputs, *, baseline_is_actual_decisions=False) -> dict:
    base = evaluate_production_costs(baseline, inputs)
    alt = evaluate_production_costs(alternative, inputs)
    if "terminal_adjusted_cost" not in base or "terminal_adjusted_cost" not in alt:
        return {"status": "blocked_schedule_comparison", "baseline": base, "alternative": alt,
                "potential_cost_difference": None, "actual_savings": None}
    same_periods = len(baseline) == len(alternative) and (baseline.months.to_numpy() == alternative.months.to_numpy()).all()
    same_demand = same_periods and ((baseline.fulfilled_demand_units + baseline.unmet_demand_units).to_numpy()
                                   == (alternative.fulfilled_demand_units + alternative.unmet_demand_units).to_numpy()).all()
    if not same_demand or baseline.opening_inventory_units.iloc[0] != alternative.opening_inventory_units.iloc[0]:
        raise ValueError("Compare identical demand paths, horizons and opening inventories")
    return {"status": "hypothetical_schedule_comparison" if inputs.hypothetical else "unverified_schedule_comparison",
            "baseline": base, "alternative": alt, "baseline_is_actual_decisions": baseline_is_actual_decisions,
            "production_spend_difference_NOT_savings": base["production_spend"] - alt["production_spend"],
            "potential_cost_difference": base["terminal_adjusted_cost"] - alt["terminal_adjusted_cost"],
            "actual_savings": None,
            "warning": "No verified RUJAF savings. Same demand and terminal basis are necessary but do not establish eventual sales or achievable schedules; validate opening pipeline and fixed-cost avoidability"}

"""Cost accounting and historical policy replay contracts, blocked without actual inputs."""

import math
from dataclasses import asdict, dataclass

import pandas as pd


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

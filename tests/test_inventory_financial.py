from dataclasses import replace

import pandas as pd
import pytest

from inventory_demand.financial import CostInputs, ReplayInputs, evaluate_costs
from inventory_demand.inventory import PolicyInputs, PurchasingConstraints, recommend


def fixture_inputs():
    return PolicyInputs(100, 50, lead_time_months=1, safety_stock_units=20,
                        on_order_units=10, backorders_units=5,
                        assumed_fields=("all_test_fixture_parameters",))


def test_missing_operations_block_live_recommendation():
    result = recommend(PolicyInputs(100, 50))
    assert result["status"] == "blocked_missing_inputs"
    assert result["suggested_order_units"] is None
    assert "lead_time_months" in result["missing_inputs"]
    assert "on_order_units" in result["missing_inputs"]


def test_inventory_arithmetic_explicitly_hypothetical():
    result = recommend(fixture_inputs())
    assert result["status"] == "hypothetical_scenario"
    assert result["inventory_position_units"] == 55
    assert result["reorder_point_units"] == 120
    assert result["order_up_to_units"] == 220
    assert result["suggested_order_units"] == 165


def test_pending_orders_prevent_unnecessary_replenishment():
    result = recommend(replace(fixture_inputs(), on_order_units=500))
    assert not result["reorder_trigger"]
    assert result["suggested_order_units"] == 0


def test_pack_budget_and_infeasible_moq():
    inputs = replace(fixture_inputs(), constraints=PurchasingConstraints(pack_size_units=12, budget=200, unit_cost=2))
    result = recommend(inputs)
    assert result["suggested_order_units"] == 96
    assert result["constraints_prevent_target"]
    result = recommend(replace(inputs, constraints=PurchasingConstraints(minimum_order_units=120, pack_size_units=12, maximum_order_units=100)))
    assert result["suggested_order_units"] == 0
    assert result["minimum_order_infeasible"]


def test_normal_scaling_and_zero_lead_time():
    inputs = replace(fixture_inputs(), monthly_demand_std=10, safety_stock_units=None, lead_time_months=0)
    result = recommend(inputs)
    assert result["lead_time_safety_stock_units"] == 0
    assert result["coverage_safety_stock_units"] > 0


@pytest.mark.parametrize("field,value", [("lead_time_months", -1), ("service_level", 1.0),
                                          ("review_period_months", 0), ("safety_stock_units", -1)])
def test_policy_rejects_invalid_inputs(field, value):
    with pytest.raises(ValueError):
        recommend(replace(fixture_inputs(), **{field: value}))


def test_no_real_financial_values_or_savings_inferred():
    result = evaluate_costs(pd.DataFrame(), CostInputs())
    assert result["status"] == "blocked_missing_cost_inputs"
    assert result["actual_savings"] is None
    assert not ReplayInputs().readiness()["ready_for_actual_policy_comparison"]


def test_cost_accounting_synthetic_fixture_only():
    ledger = pd.DataFrame({"purchased_units": [10], "average_inventory_units": [5], "months": [1],
                           "orders": [1], "lost_sales_units": [2]})
    inputs = CostInputs(unit_cost=2, carrying_cost_per_unit_month=.1, ordering_cost=3,
                        lost_sale_cost_per_unit=4, currency="TEST_ONLY", hypothetical=True)
    result = evaluate_costs(ledger, inputs)
    assert result["status"] == "hypothetical_only"
    assert result["total_cost"] == 31.5
    assert result["actual_savings"] is None


def test_negative_ledger_rejected():
    ledger = pd.DataFrame({"purchased_units": [-1], "average_inventory_units": [5], "months": [1],
                           "orders": [1], "lost_sales_units": [2]})
    with pytest.raises(ValueError):
        evaluate_costs(ledger, CostInputs(2, .1, 3, 4, "TEST_ONLY", True))

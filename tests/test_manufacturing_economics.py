from dataclasses import replace

import pandas as pd
import pytest

from inventory_demand.business import REPORTED_PRODUCTS
from inventory_demand.financial import (ManufacturingCostInputs, compare_production_schedules,
                                       evaluate_production_costs, unclassified_value_scenario)


def synthetic_costs():
    return ManufacturingCostInputs(2, .1, 3, 5, 2, "TEST_ONLY", hypothetical=True)


def ledger(opening=10, produced=20, fulfilled=15, unmet=0, months=1):
    return pd.DataFrame({"opening_inventory_units": [opening], "produced_units": [produced],
                         "fulfilled_demand_units": [fulfilled], "unmet_demand_units": [unmet],
                         "ending_inventory_units": [opening + produced - fulfilled],
                         "average_inventory_units": [(opening + opening + produced - fulfilled) / 2],
                         "months": [months], "batches": [2]})


@pytest.mark.parametrize("code,value,rate", [("UAH-90385-18025", 2.5, 800), ("48815-14050", 12, 210)])
def test_reported_values_remain_unclassified_not_costs(code, value, rate):
    reported = REPORTED_PRODUCTS[code]
    assert reported.value_classification == "unconfirmed"
    assert reported.units_per_production_day == rate
    result = unclassified_value_scenario(100, reported)
    assert result["unclassified_reference_amount"] == 100 * value
    assert result["manufacturing_inventory_value"] is None
    assert result["actual_savings"] is None
    assert evaluate_production_costs(pd.DataFrame(), ManufacturingCostInputs())["status"] == "blocked_missing_manufacturing_cost_inputs"


def test_supplied_costs_need_confirmation_or_explicit_scenario():
    result = evaluate_production_costs(ledger(), replace(synthetic_costs(), hypothetical=False))
    assert "confirmed_manufacturing_cost_or_explicit_hypothetical_costs" in result["missing_inputs"]
    assert result["actual_savings"] is None


def test_value_override_does_not_change_the_reported_business_value():
    result = unclassified_value_scenario(100, REPORTED_PRODUCTS["UAH-90385-18025"], scenario_unit_value=3)
    assert result["reported_net_unit_value"] == 2.5
    assert result["scenario_net_unit_value"] == 3
    assert result["reference_value_overridden"]
    assert result["unclassified_reference_amount"] == 300
    assert result["manufacturing_inventory_value"] is None


def test_manufacturing_cost_and_inventory_accounting_synthetic_only():
    result = evaluate_production_costs(ledger(), synthetic_costs(), assumed_unnecessary_production_units=5)
    assert result["production_spend"] == 40
    assert result["holding_cost"] == 1.25
    assert result["setup_cost"] == 6
    assert result["ending_finished_goods_manufacturing_value"] == 30
    assert result["terminal_adjusted_cost"] == 37.25
    assert result["potential_unnecessary_production_cost"] == 10
    assert result["actual_savings"] is None


def test_explicit_excess_stock_holding_cost_is_not_automatically_all_stock():
    data = ledger()
    data["average_excess_inventory_units"] = 5
    result = evaluate_production_costs(data, synthetic_costs())
    assert result["excess_holding_cost"] == .5
    assert result["holding_cost"] == 1.25
    data["average_excess_inventory_units"] = 99
    with pytest.raises(ValueError, match="Declared excess"):
        evaluate_production_costs(data, synthetic_costs())


def test_less_production_spend_is_not_automatically_savings():
    costs = replace(synthetic_costs(), holding_cost_per_unit_month=0, setup_cost_per_batch=0)
    base, alt = ledger(0, 100, 50), ledger(0, 50, 50)
    comparison = compare_production_schedules(base, alt, costs)
    assert comparison["production_spend_difference_NOT_savings"] == 100
    assert comparison["potential_cost_difference"] == 0  # equal terminal-adjusted consumption cost
    assert comparison["actual_savings"] is None


def test_unmet_demand_can_make_reduced_production_worse():
    costs = replace(synthetic_costs(), holding_cost_per_unit_month=0, setup_cost_per_batch=0)
    result = compare_production_schedules(ledger(0, 50, 50), ledger(0, 25, 25, unmet=25), costs,
                                          baseline_is_actual_decisions=True)
    assert result["production_spend_difference_NOT_savings"] == 50
    assert result["potential_cost_difference"] == -75
    assert result["actual_savings"] is None


@pytest.mark.parametrize("alt", [ledger(0, 50, 40), ledger(0, 50, 50, months=2), ledger(5, 50, 50)])
def test_noncomparable_demand_horizon_and_stock_rejected(alt):
    with pytest.raises(ValueError, match="identical demand"):
        compare_production_schedules(ledger(0, 50, 50), alt, synthetic_costs())


@pytest.mark.parametrize("field,value", [("produced_units", -1), ("average_inventory_units", float("inf")),
                                        ("months", 0), ("ending_inventory_units", 999)])
def test_invalid_or_unreconciled_economic_ledger_rejected(field, value):
    data = ledger()
    data[field] = value
    with pytest.raises(ValueError):
        evaluate_production_costs(data, synthetic_costs())


def test_discontinuous_ledger_and_unjustified_unnecessary_units_rejected():
    with pytest.raises(ValueError, match="continuous"):
        evaluate_production_costs(pd.concat([ledger(), ledger()], ignore_index=True), synthetic_costs())
    with pytest.raises(ValueError, match="bounded"):
        evaluate_production_costs(ledger(), synthetic_costs(), assumed_unnecessary_production_units=99)
    with pytest.raises(ValueError, match="hypothetical"):
        evaluate_production_costs(ledger(), replace(synthetic_costs(), hypothetical=False, manufacturing_cost_confirmed=True),
                                  assumed_unnecessary_production_units=1)


def test_schedule_comparison_stays_blocked_without_costs():
    result = compare_production_schedules(ledger(), ledger(), ManufacturingCostInputs())
    assert result["status"] == "blocked_schedule_comparison"
    assert result["potential_cost_difference"] is None
    assert result["actual_savings"] is None

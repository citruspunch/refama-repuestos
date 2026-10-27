from dataclasses import replace

import pytest

from inventory_demand.inventory import (OpenProductionOrder, ProductionConstraints,
                                        ProductionInputs, plan_production)


def scenario_inputs():
    # Synthetic, not observed RUJAF operating data.
    return ProductionInputs(
        forecast_units_per_month=300, on_hand_units=50, as_of_date="2026-01-31",
        observed_inventory_date="2026-01-31", forecast_target_month="2026-02-01",
        days_per_month=30, review_period_days=30, safety_stock_units=20, monthly_error_std=25,
        open_production_orders=(OpenProductionOrder(10, "2026-02-05"),),
        reserved_stock_units=10, restricted_stock_units=5, backorders_units=5,
        constraints=ProductionConstraints(100, 10, 7, 1, 0), forecast_valid_for_scenario=True,
        assumed_fields=("unverified_bookkeeping_stock", "unconfirmed_production_constraints", "retrospective_forecast"))


def test_production_demand_stock_trigger_and_runtime():
    result = plan_production(scenario_inputs())
    assert result["status"] == "hypothetical_production_scenario"
    assert result["expected_monthly_outgoing_units"] == 300
    assert result["expected_weekly_outgoing_units"] == 70
    assert result["available_finished_goods_units"] == 35
    assert result["inventory_position_units"] == 40
    assert result["coverage_days"] == 3
    assert result["coverage_months"] == .1
    assert result["monthly_error_std"] == 25
    assert result["production_trigger_units"] == 390
    assert result["lead_time_alert_units"] == 90
    assert result["lead_time_alert"]
    assert result["order_up_to_units"] == 390
    assert result["suggested_production_units"] == 350
    assert result["estimated_production_days_required"] == 3.5
    assert result["shortage_before_receipt_units"] == 30
    assert result["projected_ending_inventory_net_units"] == 20
    assert not result["live_recommendation_allowed"]


def test_capacity_shortage_and_fractional_days():
    inputs = scenario_inputs()
    result = plan_production(replace(inputs, constraints=replace(inputs.constraints, available_production_days=.5)))
    assert result["suggested_production_units"] == 50
    assert result["estimated_production_days_required"] == .5
    assert result["unconstrained_production_days_required"] == 3.5
    assert result["constraints_prevent_target"]
    assert result["projected_shortage_units"] == 280


def test_batch_rounding_storage_and_minimum_infeasibility():
    inputs = scenario_inputs()
    result = plan_production(replace(inputs, constraints=replace(inputs.constraints, batch_size_units=12)))
    assert result["suggested_production_units"] == 360
    result = plan_production(replace(inputs, constraints=replace(inputs.constraints, batch_size_units=12,
                                                                maximum_inventory_units=250)))
    assert result["suggested_production_units"] == 180  # 250 - 50 - 10 = 190, down to batches
    assert result["constraints_prevent_target"]
    result = plan_production(replace(inputs, constraints=replace(inputs.constraints, minimum_batch_units=300,
                                                                maximum_production_units=200)))
    assert result["suggested_production_units"] == 0
    assert result["minimum_batch_infeasible"]


def test_due_dates_prevent_pipeline_from_hiding_immediate_shortages():
    inputs = scenario_inputs()
    late = OpenProductionOrder(500, "2026-03-20")
    result = plan_production(replace(inputs, open_production_orders=inputs.open_production_orders + (late,)))
    assert result["open_production_excluded_later_units"] == 500
    assert result["suggested_production_units"] == 350
    within_horizon = OpenProductionOrder(500, "2026-02-20")
    result = plan_production(replace(inputs, open_production_orders=inputs.open_production_orders + (within_horizon,)))
    assert not result["production_trigger"]
    assert result["lead_time_alert"]
    assert result["suggested_production_units"] == 0
    assert result["shortage_before_receipt_units"] == 30
    assert result["surplus_above_target_units"] == 150


def test_early_pipeline_prevents_unnecessary_production():
    result = plan_production(replace(scenario_inputs(), open_production_orders=(OpenProductionOrder(500, "2026-02-01"),)))
    assert not result["production_trigger"]
    assert result["suggested_production_units"] == 0


def test_periodic_review_covers_demand_before_next_review_not_only_lead():
    inputs = replace(scenario_inputs(), on_hand_units=100, reserved_stock_units=0,
                     restricted_stock_units=0, backorders_units=0, open_production_orders=(), safety_stock_units=0)
    result = plan_production(inputs)
    assert not result["lead_time_alert"]  # 100 units > 70 lead-time units
    assert result["production_trigger"]  # but 100 < 370 lead + review units
    assert result["suggested_production_units"] == 270
    assert result["projected_shortage_units"] == 0


def test_zero_demand_has_undefined_coverage_not_infinite_promise():
    result = plan_production(replace(scenario_inputs(), forecast_units_per_month=0))
    assert result["coverage_days"] is None
    assert result["coverage_status"] == "undefined_zero_forecast"
    assert result["suggested_production_units"] == 0


@pytest.mark.parametrize("field", ["days_per_month", "review_period_days", "safety_stock_units",
                                  "open_production_orders", "reserved_stock_units", "restricted_stock_units", "backorders_units"])
def test_no_implicit_zero_or_calendar_assumptions(field):
    result = plan_production(replace(scenario_inputs(), **{field: None}))
    assert result["status"] == "blocked_missing_production_inputs"
    assert field in result["blockers"]
    assert result["suggested_production_units"] is None


def test_missing_constraints_and_unlabeled_assumptions_block():
    result = plan_production(replace(scenario_inputs(), constraints=ProductionConstraints()))
    assert "constraints.available_production_days" in result["blockers"]
    result = plan_production(replace(scenario_inputs(), assumed_fields=()))
    assert result["status"] == "blocked_unlabeled_scenario_assumptions"


def test_failed_forecast_never_drives_production_even_in_scenarios():
    result = plan_production(replace(scenario_inputs(), forecast_valid_for_scenario=False))
    assert result["status"] == "blocked_invalid_forecast"
    assert result["suggested_production_units"] is None


def test_stale_stock_and_unconfirmed_constraints_block_live_action():
    result = plan_production(replace(scenario_inputs(), mode="live", maximum_stock_age_days=1,
                                      observed_inventory_date="2025-12-31"))
    assert result["status"] == "blocked_live_planning"
    assert "stale_or_unconfirmed_stock_age" in result["blockers"]
    assert "production_constraints_not_confirmed" in result["blockers"]
    assert "forecast_not_current" in result["blockers"]
    assert result["suggested_production_units"] is None
    assert not result["live_recommendation_allowed"]


def test_even_complete_inputs_do_not_constitute_live_approval():
    result = plan_production(replace(scenario_inputs(), mode="live", maximum_stock_age_days=1,
                                      physical_stock_verified=True, constraints_confirmed=True,
                                      forecast_current=True, assumed_fields=()))
    assert result["blockers"] == ["prototype_not_approved_for_live_use"]


def test_overdue_orders_need_reconciliation():
    result = plan_production(replace(scenario_inputs(), open_production_orders=(OpenProductionOrder(10, "2026-01-30"),)))
    assert result["status"] == "blocked_overdue_production_order"
    assert result["suggested_production_units"] is None


@pytest.mark.parametrize("field,value", [("forecast_units_per_month", -1), ("on_hand_units", float("nan")),
                                        ("reserved_stock_units", 60), ("monthly_error_std", -1),
                                        ("days_per_month", 0), ("review_period_days", 0),
                                        ("observed_inventory_date", "2026-02-01")])
def test_invalid_production_inputs_rejected(field, value):
    with pytest.raises(ValueError):
        plan_production(replace(scenario_inputs(), **{field: value}))


@pytest.mark.parametrize("field,value", [("units_per_production_day", 0), ("available_production_days", -1),
                                        ("production_lead_time_days", float("inf")), ("batch_size_units", 1.5),
                                        ("minimum_batch_units", -1), ("maximum_inventory_units", -1)])
def test_invalid_production_constraints_rejected(field, value):
    inputs = scenario_inputs()
    with pytest.raises(ValueError):
        plan_production(replace(inputs, constraints=replace(inputs.constraints, **{field: value})))

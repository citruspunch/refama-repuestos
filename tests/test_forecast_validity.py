import numpy as np
import pandas as pd
import pytest

from inventory_demand.forecast_validity import (ForecastValidityRules, check_forecast,
                                               evaluate_safeguards, guarded_forecast)


@pytest.mark.parametrize("prediction,raw,clipped,reason", [
    (0, -10, True, "negative_raw_extrapolation"), (0, 0, False, "collapse_relative_to_recent_history"),
    (1000, 1000, False, "spike_relative_to_recent_history"),
    (float("nan"), float("nan"), False, "invalid_point_forecast"),
    (100, None, False, "missing_or_nonfinite_raw_forecast"),
    (float("inf"), float("inf"), False, "invalid_point_forecast")])
def test_invalid_forecasts_are_not_silently_accepted(prediction, raw, clipped, reason):
    result = check_forecast([100, 110, 90], prediction, raw, clipped=clipped)
    assert not result["valid_for_scenario"]
    assert reason in result["reasons"]


def test_fixed_fallback_preserves_original_failure_and_is_scenario_only():
    result = guarded_forecast([100, 110, 90], 0, -10, 100, locked_model="ridge", clipped=True)
    assert result["locked_model"] == "ridge"
    assert result["locked_forecast_units"] == 0
    assert not result["locked_forecast_valid"]
    assert result["effective_model"] == "moving_average_3"
    assert result["effective_forecast_units"] == 100
    assert result["fallback_used"] and result["valid_for_scenario"]
    assert result["status"] == "provisional_fallback_scenario_only"
    assert not result["live_recommendation_allowed"]


def test_failed_fallback_blocks_and_valid_original_is_not_reselected():
    result = guarded_forecast([100, 110, 90], 0, -10, np.nan, locked_model="ridge")
    assert result["status"] == "blocked_invalid_forecast"
    assert np.isnan(result["effective_forecast_units"])
    result = guarded_forecast([100, 110, 90], 90, 90, 100, locked_model="ridge")
    assert result["effective_model"] == "ridge"
    assert not result["fallback_used"]


def test_zero_history_fit_failure_and_invalid_history():
    assert check_forecast([0, 0, 0], 0, 0)["valid_for_scenario"]
    assert not check_forecast([0, 0, 0], 5, 5)["valid_for_scenario"]
    assert not check_forecast([10, 10, 10], 10, 10, failure="did not converge")["valid_for_scenario"]
    for history in ([], [10, 10], [10, -1, 10], [10, np.nan, 10]):
        assert not check_forecast(history, 10, 10)["valid_for_scenario"]


def test_limits_are_configurable_and_not_tuned_by_test_scores():
    assert not check_forecast([100] * 3, 400, 400)["valid_for_scenario"]
    assert check_forecast([100] * 3, 400, 400, rules=ForecastValidityRules(maximum_recent_mean_ratio=5))["valid_for_scenario"]
    with pytest.raises(ValueError):
        ForecastValidityRules(recent_months=0)


def replay_fixture(series):
    rows = []
    for i in range(24, len(series)):
        for model in ("ridge", "moving_average_3", "naive"):
            past = series.sales_units.iloc[:i]
            raw = -10 if model == "ridge" and i % 2 == 0 else float(past.iloc[-1] if model == "naive" else past.iloc[-3:].mean())
            rows.append({"codigo_producto": "TEST_ONLY", "scenario": "combined", "model": model,
                         "phase": "holdout" if i >= len(series) - 6 else "validation",
                         "target_month": series.month.iloc[i], "training_end": series.month.iloc[i - 1],
                         "training_months": i, "actual": series.sales_units.iloc[i], "predicted": max(0, raw),
                         "raw_predicted": raw, "nonnegative_clipped": raw < 0, "failure": "",
                         "mase_scale": 2, "selected": model == "ridge"})
    target = pd.Timestamp(series.month.max() + pd.offsets.MonthBegin(1))
    forecasts = pd.DataFrame([{"codigo_producto": "TEST_ONLY", "scenario": "combined", "model": "ridge",
                               "target_month": target, "forecast_origin": target - pd.offsets.Day(1),
                               "forecast_units": 0, "raw_forecast_units": -10, "nonnegative_clipped": True,
                               "units_already_in_unconfirmed_boundary": 50}])
    baseline = forecasts[["codigo_producto", "scenario", "target_month", "forecast_origin"]].copy()
    baseline["model"] = "moving_average_3"
    baseline["forecast_units"] = series.sales_units.iloc[-3:].mean()
    return pd.DataFrame(rows), forecasts, baseline


def test_replay_reuses_original_origins_and_never_changes_locked_results(synthetic_series):
    predictions, forecasts, baselines = replay_fixture(synthetic_series)
    preserved = predictions.copy(deep=True)
    out = evaluate_safeguards(synthetic_series, predictions, forecasts, baselines)
    pd.testing.assert_frame_equal(predictions, preserved)
    replay = out["forecast_safeguard_predictions"]
    assert len(replay) == len(predictions[predictions.selected])
    assert replay.training_end.lt(replay.target_month).all()
    assert replay.fallback_used.sum() == 8
    assert out["forecast_safeguard_comparison"].evaluation_status.str.startswith("post_hoc").all()
    assert out["forecast_validity"].iloc[0].effective_forecast_units == synthetic_series.sales_units.tail(3).mean()


def test_future_actuals_cannot_change_forecast_validity_or_switching(synthetic_series):
    predictions, forecasts, baselines = replay_fixture(synthetic_series)
    original = evaluate_safeguards(synthetic_series, predictions, forecasts, baselines)
    predictions.loc[predictions.phase.eq("holdout"), "actual"] = 999999
    forecasts["units_already_in_unconfirmed_boundary"] = 999999
    boundary = synthetic_series.iloc[[-1]].copy()
    boundary["month"] = forecasts.target_month.iloc[0]
    boundary["sales_units"] = 999999
    boundary["complete_for_modeling"] = False
    with_boundary = pd.concat([synthetic_series, boundary], ignore_index=True)
    changed = evaluate_safeguards(with_boundary, predictions, forecasts, baselines)
    cols = ["target_month", "locked_model", "locked_forecast_valid", "effective_model", "fallback_used", "predicted"]
    pd.testing.assert_frame_equal(original["forecast_safeguard_predictions"][cols], changed["forecast_safeguard_predictions"][cols])
    assert original["forecast_validity"].iloc[0].effective_model == changed["forecast_validity"].iloc[0].effective_model
    assert original["forecast_validity"].iloc[0].monthly_error_std == changed["forecast_validity"].iloc[0].monthly_error_std


def test_misaligned_training_or_fallback_rejected(synthetic_series):
    predictions, forecasts, baselines = replay_fixture(synthetic_series)
    predictions.loc[predictions.selected, "training_months"] += 1
    with pytest.raises(ValueError, match="cutoff and length"):
        evaluate_safeguards(synthetic_series, predictions, forecasts, baselines)
    predictions, forecasts, baselines = replay_fixture(synthetic_series)
    baselines["forecast_origin"] = pd.Timestamp("1999-01-31")
    with pytest.raises(ValueError, match="aligned"):
        evaluate_safeguards(synthetic_series, predictions, forecasts, baselines)

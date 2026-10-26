import numpy as np
import pandas as pd
import pytest

from inventory_demand.eda import demand_classification
from inventory_demand.evaluation import (choose_model, error_metrics, finite_sample_error_quantile,
                                         origin_plan)
from inventory_demand.features import MODEL_FEATURES, engineer_series
from inventory_demand.forecasting import CANDIDATES, fit_predict


def test_features_strictly_lagged(synthetic_series):
    engineered = engineer_series(synthetic_series, append_next=True)
    assert engineered.loc[10, "lag_1"] == synthetic_series.loc[9, "sales_units"]
    assert engineered.loc[10, "rolling_mean_3"] == synthetic_series.loc[7:9, "sales_units"].mean()
    assert engineered.loc[10, "previous_closing_balance"] == synthetic_series.loc[9, "closing_balance"]
    assert engineered.information_cutoff.lt(engineered.month).all()
    assert "closing_balance" not in engineered
    assert pd.isna(engineered.iloc[-1].target_sales_units)


def test_future_mutation_cannot_change_past_features(synthetic_series):
    original = engineer_series(synthetic_series)
    changed = synthetic_series.copy()
    changed.loc[25:, ["sales_units", "closing_balance", "eod_nonpositive_days"]] = 999999
    result = engineer_series(changed)
    features = [c for c in original if c != "target_sales_units"]
    pd.testing.assert_frame_equal(original.loc[:25, features], result.loc[:25, features])


def test_append_future_row_does_not_change_historical_features(synthetic_series):
    a = engineer_series(synthetic_series)
    b = engineer_series(synthetic_series.iloc[:30], append_next=True)
    pd.testing.assert_frame_equal(a.loc[:29], b.loc[:29], check_dtype=False)
    assert (a.loc[30, MODEL_FEATURES] == b.loc[30, MODEL_FEATURES]).all()


def test_features_reject_gaps_and_boundaries(synthetic_series):
    with pytest.raises(ValueError, match="contiguous"):
        engineer_series(synthetic_series.drop(index=20))
    synthetic_series.loc[0, "complete_for_modeling"] = False
    with pytest.raises(ValueError, match="boundary"):
        engineer_series(synthetic_series)


def test_origin_splits_never_train_on_target(synthetic_series, config):
    plan = origin_plan(synthetic_series, config)
    assert plan.training_end.lt(plan.target_month).all()
    assert len(plan[plan.phase.eq("holdout")]) == 6
    assert plan.loc[plan.phase.eq("validation"), "target_month"].max() < plan.loc[plan.phase.eq("holdout"), "target_month"].min()
    assert plan.iloc[0].training_months == 24


def test_selection_simplicity_and_holdout_block(config):
    scores = pd.DataFrame({"model": ["naive", "ridge"], "phase": "validation",
                           "all_origins_successful": True, "mae": [104, 100]})
    assert choose_model(scores, config)["model"] == "naive"
    scores.loc[0, "mae"] = 110
    assert choose_model(scores, config)["model"] == "ridge"
    scores.loc[1, "all_origins_successful"] = False
    assert choose_model(scores, config)["model"] == "naive"
    scores["phase"] = "holdout"
    with pytest.raises(ValueError, match="validation"):
        choose_model(scores, config)


def test_metrics_bias_mase_and_zero_denominators():
    metrics = error_metrics([10, 20], [12, 24], [2, 4])
    assert metrics["mae"] == 3
    assert metrics["bias"] == 3
    assert metrics["wape"] == pytest.approx(.2)
    assert metrics["mase"] == 1
    zero = error_metrics([0, 0], [1, 2], [0, 0])
    assert np.isnan(zero["wape"])
    assert np.isnan(zero["mase"])


def test_heuristic_bands_do_not_fake_small_sample_coverage():
    assert np.isnan(finite_sample_error_quantile([1, 2, 3, 4, 5], .95))
    assert finite_sample_error_quantile(np.arange(1, 21), .95) == 20


@pytest.mark.parametrize("model", list(CANDIDATES))
def test_candidates_execute_on_explicit_test_fixture(model, synthetic_series):
    result = fit_predict(model, synthetic_series)
    assert np.isfinite(result.prediction)
    assert result.prediction >= 0


def test_baseline_values(synthetic_series):
    assert fit_predict("naive", synthetic_series).prediction == 178
    assert fit_predict("seasonal_naive", synthetic_series).prediction == 156
    assert fit_predict("historical_average", synthetic_series).prediction == synthetic_series.sales_units.mean()
    assert fit_predict("moving_average_3", synthetic_series).prediction == synthetic_series.sales_units.tail(3).mean()


def test_intermittency_is_aggregation_dependent():
    assert demand_classification([10, 10, 10, 10])["demand_class"] == "smooth"
    assert demand_classification([0, 0, 10, 0, 10])["demand_class"] == "intermittent"
    assert demand_classification([1, 100, 1, 100])["demand_class"] == "erratic"

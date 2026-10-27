"""Post-analysis safeguards, not a replacement for validation-locked model selection.

The fixed MA3 fallback and thresholds are provisional rules introduced AFTER the
original evaluation. Replaying them on that evaluation is diagnostic, not new test evidence.
"""

import math
from dataclasses import asdict, dataclass

import numpy as np
import pandas as pd

from .evaluation import error_metrics, finite_sample_error_quantile


@dataclass(frozen=True)
class ForecastValidityRules:
    recent_months: int = 3
    minimum_recent_mean_ratio: float = .1
    maximum_recent_mean_ratio: float = 3.0

    def __post_init__(self):
        if not isinstance(self.recent_months, int) or self.recent_months < 1:
            raise ValueError("recent_months must be a positive integer")
        if not (0 < self.minimum_recent_mean_ratio < 1 < self.maximum_recent_mean_ratio
                and math.isfinite(self.maximum_recent_mean_ratio)):
            raise ValueError("Invalid provisional plausibility ratios")


def check_forecast(history_units, prediction, raw_prediction, *, clipped=False,
                   failure="", rules=ForecastValidityRules()) -> dict:
    """Only pre-origin history is allowed; target actuals are never a validity input."""
    history = np.asarray(history_units, float)
    reasons = []
    if len(history) < rules.recent_months or not np.isfinite(history).all() or (history < 0).any():
        reasons.append("insufficient_or_invalid_history")
    if failure:
        reasons.append("fit_failure")
    if prediction is None or not math.isfinite(prediction) or prediction < 0:
        reasons.append("invalid_point_forecast")
    if raw_prediction is None or not math.isfinite(raw_prediction):
        reasons.append("missing_or_nonfinite_raw_forecast")
    elif raw_prediction < 0:
        reasons.append("negative_raw_extrapolation")
    if clipped:
        reasons.append("nonnegative_clipping")
    recent = float(history[-rules.recent_months:].mean()) if not reasons else None
    if recent is not None and recent > 0:
        ratio = prediction / recent
        if ratio < rules.minimum_recent_mean_ratio:
            reasons.append("collapse_relative_to_recent_history")
        if ratio > rules.maximum_recent_mean_ratio:
            reasons.append("spike_relative_to_recent_history")
    elif recent == 0 and prediction > 0:
        reasons.append("positive_forecast_after_recent_zero_history")
    return {"valid_for_scenario": not reasons, "reasons": reasons,
            "recent_mean_units": recent, "rules": asdict(rules)}


def guarded_forecast(history_units, prediction, raw_prediction, fallback_prediction, *,
                     locked_model, clipped=False, failure="", rules=ForecastValidityRules()) -> dict:
    primary = check_forecast(history_units, prediction, raw_prediction,
                             clipped=clipped, failure=failure, rules=rules)
    effective, method, fallback_used = prediction, locked_model, False
    fallback_check = None
    if not primary["valid_for_scenario"]:
        fallback_used = True
        effective, method = fallback_prediction, "moving_average_3"
        fallback_check = check_forecast(history_units, effective, effective, rules=rules)
    valid = primary["valid_for_scenario"] or fallback_check["valid_for_scenario"]
    return {"locked_model": locked_model, "locked_forecast_units": prediction,
            "locked_forecast_valid": primary["valid_for_scenario"],
            "validity_reasons": ";".join(primary["reasons"]),
            "effective_model": method, "effective_forecast_units": effective if valid else np.nan,
            "fallback_used": fallback_used, "valid_for_scenario": valid,
            "fallback_reasons": ";".join(fallback_check["reasons"]) if fallback_check else "",
            "status": ("provisional_fallback_scenario_only" if fallback_used else "locked_forecast_scenario_only")
                      if valid else "blocked_invalid_forecast",
            "live_recommendation_allowed": False}


def evaluate_safeguards(monthly, predictions, forecasts, baseline_forecasts,
                        rules=ForecastValidityRules()) -> dict[str, pd.DataFrame]:
    """Replay existing one-step origins without refitting or changing historical results."""
    monthly, predictions = monthly.copy(), predictions.copy()
    monthly["month"] = pd.to_datetime(monthly.month)
    for col in ("target_month", "training_end"):
        predictions[col] = pd.to_datetime(predictions[col])
    complete = monthly[monthly.complete_for_modeling]
    keys = ["codigo_producto", "scenario", "phase", "target_month", "training_end"]
    locked = predictions[predictions.selected]
    fallback = predictions[predictions.model.eq("moving_average_3")]
    paired = locked.merge(fallback[keys + ["predicted"]].rename(columns={"predicted": "fallback_prediction"}),
                          on=keys, validate="one_to_one", how="left")
    rows = []
    for f in paired.itertuples(index=False):
        history = complete[complete.codigo_producto.eq(f.codigo_producto) & complete.scenario.eq(f.scenario)
                           & complete.month.lt(f.target_month)].sort_values("month")
        if history.empty or history.month.max() != f.training_end or len(history) != f.training_months:
            raise ValueError("Safeguard replay must match the original training cutoff and length")
        if np.isfinite(f.fallback_prediction) and not np.isclose(f.fallback_prediction, history.sales_units.tail(3).mean()):
            raise ValueError("Archived fallback must equal the fixed pre-origin three-month mean")
        result = guarded_forecast(history.sales_units, f.predicted, f.raw_predicted, f.fallback_prediction,
                                  locked_model=f.model, clipped=f.nonnegative_clipped,
                                  failure=f.failure if pd.notna(f.failure) else "", rules=rules)
        rows.append({**{key: getattr(f, key) for key in keys}, "training_months": f.training_months,
                     "actual": f.actual, "mase_scale": f.mase_scale, **result,
                     "predicted": result["effective_forecast_units"],
                     "error": result["effective_forecast_units"] - f.actual,
                     "evaluation_status": "post_hoc_diagnostic_NOT_independent_test_evidence"})
    replay = pd.DataFrame(rows)
    metrics = []
    for group, guarded in replay.groupby(["codigo_producto", "scenario", "phase"]):
        code, scenario, phase = group
        original = predictions[predictions.codigo_producto.eq(code) & predictions.scenario.eq(scenario)
                               & predictions.phase.eq(phase)]
        for strategy, sub in (("original_locked", original[original.selected]),
                              ("provisional_guarded_ma3_v1", guarded),
                              ("naive", original[original.model.eq("naive")]),
                              ("moving_average_3", original[original.model.eq("moving_average_3")])):
            metrics.append({"codigo_producto": code, "scenario": scenario, "phase": phase,
                            "strategy": strategy, "origins": len(sub),
                            "successful_origins": int(sub.predicted.notna().sum()),
                            "fallback_origins": int(guarded.fallback_used.sum()) if strategy.startswith("provisional") else 0,
                            **error_metrics(sub.actual, sub.predicted, sub.mase_scale),
                            "evaluation_status": "post_hoc_diagnostic_NOT_independent_test_evidence"})
    future_rows = []
    for f in forecasts.itertuples(index=False):
        target = pd.Timestamp(f.target_month)
        history = complete[complete.codigo_producto.eq(f.codigo_producto) & complete.scenario.eq(f.scenario)
                           & complete.month.lt(target)].sort_values("month")
        if history.empty or history.month.max() + pd.offsets.MonthEnd(0) != pd.Timestamp(f.forecast_origin):
            raise ValueError("Forecast and history cutoffs do not align")
        b = baseline_forecasts[baseline_forecasts.codigo_producto.eq(f.codigo_producto)
                               & baseline_forecasts.scenario.eq(f.scenario)
                               & baseline_forecasts.model.eq("moving_average_3")
                               & pd.to_datetime(baseline_forecasts.target_month).eq(target)]
        if len(b) != 1 or pd.Timestamp(b.iloc[0].forecast_origin) != pd.Timestamp(f.forecast_origin):
            raise ValueError("Exactly one aligned, fixed MA3 fallback is required")
        if np.isfinite(b.iloc[0].forecast_units) and not np.isclose(b.iloc[0].forecast_units, history.sales_units.tail(3).mean()):
            raise ValueError("Archived fallback must equal the fixed pre-origin three-month mean")
        result = guarded_forecast(history.sales_units, f.forecast_units, f.raw_forecast_units,
                                  float(b.iloc[0].forecast_units), locked_model=f.model,
                                  clipped=f.nonnegative_clipped, rules=rules)
        calibration = replay[replay.codigo_producto.eq(f.codigo_producto) & replay.scenario.eq(f.scenario)
                             & replay.phase.eq("validation")].error
        width = finite_sample_error_quantile(calibration, .8)
        point = result["effective_forecast_units"]
        future_rows.append({"codigo_producto": f.codigo_producto, "scenario": f.scenario,
                            "forecast_origin": f.forecast_origin, "target_month": target,
                            **result, "monthly_error_std": float(calibration.std(ddof=1)),
                            "lower80_heuristic": max(0, point - width) if np.isfinite(point + width) else np.nan,
                            "upper80_heuristic": point + width,
                            "retrospective_boundary_exceeds_effective_forecast": bool(f.units_already_in_unconfirmed_boundary > point),
                            "warning": "Boundary actuals are diagnostic only; no fallback tuning or guaranteed interval coverage"})
    return {"forecast_safeguard_predictions": replay, "forecast_safeguard_comparison": pd.DataFrame(metrics),
            "forecast_validity": pd.DataFrame(future_rows)}

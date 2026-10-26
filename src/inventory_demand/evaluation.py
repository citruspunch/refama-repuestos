"""Expanding origins, frozen validation selection, and a never-selected-on final holdout."""

import json
import pickle

import numpy as np
import pandas as pd
from statsmodels.stats.diagnostic import acorr_ljungbox

from .config import Config
from .eda import block_resample
from .forecasting import CANDIDATES, ML_MODELS, fit_predict


def error_metrics(actual, predicted, mase_scales=None) -> dict:
    a, p = np.asarray(actual, float), np.asarray(predicted, float)
    valid = np.isfinite(a) & np.isfinite(p)
    a, p = a[valid], p[valid]
    if not len(a):
        return {key: np.nan for key in ("mae", "rmse", "wape", "bias", "bias_pct", "mase")}
    e = p - a  # Positive bias means overforecasting.
    denom = np.abs(a).sum()
    result = {"mae": float(np.abs(e).mean()), "rmse": float(np.sqrt(np.mean(e ** 2))),
              "wape": float(np.abs(e).sum() / denom) if denom else np.nan,
              "bias": float(e.mean()), "bias_pct": float(e.sum() / denom) if denom else np.nan,
              "mase": np.nan}
    if mase_scales is not None:
        scales = np.asarray(mase_scales, float)[valid]
        good = np.isfinite(scales) & (scales > 0)
        if good.any():
            result["mase"] = float((np.abs(e[good]) / scales[good]).mean())
    return result


def origin_plan(series: pd.DataFrame, config: Config) -> pd.DataFrame:
    n = len(series)
    if n < config.initial_train_months + config.holdout_months + 6:
        raise ValueError("Insufficient observations for independent model selection and holdout")
    split = n - config.holdout_months
    return pd.DataFrame([{"position": i, "phase": "validation" if i < split else "holdout",
                          "target_month": series.month.iloc[i],
                          "training_end": series.month.iloc[i - 1], "training_months": i,
                          "horizon_months": 1} for i in range(config.initial_train_months, n)])


def evaluate_origins(series: pd.DataFrame, origins: pd.DataFrame, config: Config) -> pd.DataFrame:
    rows = []
    for origin in origins.itertuples(index=False):
        train = series.iloc[:origin.position]
        # Fold-local nonseasonal MASE denominator: no global or future data is used.
        scale = float(np.abs(np.diff(train.sales_units.to_numpy(float))).mean())
        for model in CANDIDATES:
            try:
                result = fit_predict(model, train, config.seed)
                prediction, failure, fit_warnings = result.prediction, "", result.warnings
                raw_prediction, clipped = result.raw_prediction, result.nonnegative_clipped
            except (ValueError, RuntimeError, np.linalg.LinAlgError, FloatingPointError) as exc:
                prediction, failure, fit_warnings = np.nan, f"{type(exc).__name__}: {exc}", ""
                raw_prediction, clipped = np.nan, False
            rows.append({"codigo_producto": series.codigo_producto.iloc[0], "scenario": series.scenario.iloc[0],
                         "model": model, "phase": origin.phase, "target_month": origin.target_month,
                         "training_end": origin.training_end, "training_months": origin.training_months,
                         "horizon_months": 1, "actual": series.sales_units.iloc[origin.position],
                         "predicted": prediction, "raw_predicted": raw_prediction,
                         "nonnegative_clipped": clipped, "mase_scale": scale, "failure": failure,
                         "fit_warnings": fit_warnings})
    return pd.DataFrame(rows)


def summarize_predictions(predictions: pd.DataFrame) -> pd.DataFrame:
    rows = []
    keys = ["codigo_producto", "scenario", "phase", "model"]
    for group, g in predictions.groupby(keys):
        rows.append({**dict(zip(keys, group)), "origins": len(g),
                     "successful_origins": int(g.predicted.notna().sum()),
                     "all_origins_successful": bool(g.predicted.notna().all()),
                     "clipped_origins": int(g.nonnegative_clipped.sum()) if "nonnegative_clipped" in g else 0,
                     **error_metrics(g.actual, g.predicted, g.mase_scale)})
    out = pd.DataFrame(rows)
    for baseline in ("naive", "seasonal_naive"):
        reference = out[out.model.eq(baseline)][["codigo_producto", "scenario", "phase", "mae"]].rename(
            columns={"mae": f"{baseline}_mae"})
        out = out.merge(reference, on=["codigo_producto", "scenario", "phase"], validate="many_to_one")
        out[f"mae_skill_vs_{baseline}"] = (1 - out.mae / out[f"{baseline}_mae"]).where(out[f"{baseline}_mae"].gt(0))
    return out


def choose_model(validation_summary: pd.DataFrame, config: Config) -> dict:
    if not validation_summary.phase.eq("validation").all():
        raise ValueError("Model selection may only access validation scores")
    valid = validation_summary[validation_summary.all_origins_successful & validation_summary.mae.notna()].copy()
    if valid.empty:
        raise RuntimeError("No candidate completed all validation origins")
    best = valid.sort_values(["mae", "model"]).iloc[0]
    tied = valid[valid.mae.le(best.mae * (1 + config.practical_tie_fraction) + 1e-12)].copy()
    tied["simplicity"] = tied.model.map(CANDIDATES)
    selected = tied.sort_values(["simplicity", "mae"]).iloc[0]
    return {"model": selected.model, "best_raw_mae_model": best.model,
            "selected_validation_mae": float(selected.mae), "best_validation_mae": float(best.mae),
            "selection_rule": "simplest within 5% of lowest validation MAE; final holdout never selects"}


def paired_comparison(chosen: pd.DataFrame, reference: pd.DataFrame, config: Config) -> dict:
    paired = chosen.merge(reference, on="target_month", suffixes=("_chosen", "_baseline"))
    paired = paired.dropna(subset=["predicted_chosen", "predicted_baseline"])
    difference = (paired.predicted_baseline - paired.actual_baseline).abs() - (paired.predicted_chosen - paired.actual_chosen).abs()
    if not len(difference):
        return {"paired_origins": 0, "mean_mae_improvement": np.nan, "improvement_ci_low": np.nan, "improvement_ci_high": np.nan}
    rng = np.random.default_rng(config.seed)
    means = [block_resample(difference.to_numpy(), rng, len(difference), min(3, len(difference))).mean()
             for _ in range(config.bootstrap_repetitions)]
    return {"paired_origins": len(difference), "mean_mae_improvement": difference.mean(),
            "improvement_ci_low": np.quantile(means, .025), "improvement_ci_high": np.quantile(means, .975)}


def finite_sample_error_quantile(errors, coverage: float) -> float:
    values = np.sort(np.abs(np.asarray(errors, float)))
    values = values[np.isfinite(values)]
    rank = int(np.ceil((len(values) + 1) * coverage))
    # No fake finite 95% bound when the calibration sample cannot support that rank.
    return float(values[rank - 1]) if 1 <= rank <= len(values) else np.nan


def run_backtests(monthly: pd.DataFrame, config: Config) -> dict[str, pd.DataFrame]:
    all_predictions, selections, future_rows, comparisons, residual_rows, split_rows, interval_rows = [], [], [], [], [], [], []
    baseline_forecasts, robustness_rows = [], []
    complete = monthly[monthly.complete_for_modeling]
    for (code, scenario), series in complete.groupby(["codigo_producto", "scenario"]):
        series = series.sort_values("month").reset_index(drop=True)
        plan = origin_plan(series, config)
        # Execute validation FIRST, choose a fixed model, only then evaluate the final months.
        validation = evaluate_origins(series, plan[plan.phase.eq("validation")], config)
        selection = choose_model(summarize_predictions(validation), config)
        holdout = evaluate_origins(series, plan[plan.phase.eq("holdout")], config)
        predictions = pd.concat([validation, holdout], ignore_index=True)
        predictions["error"] = predictions.predicted - predictions.actual
        predictions["absolute_error"] = predictions.error.abs()
        predictions["selected"] = predictions.model.eq(selection["model"])
        # Stability diagnostics do NOT reselect the locked model using final outcomes.
        for phase in ("validation", "holdout"):
            dates = sorted(predictions.loc[predictions.phase.eq(phase), "target_month"].unique())
            midpoint = len(dates) // 2
            for block, subdates in (("early_half", dates[:midpoint]), ("late_half", dates[midpoint:])):
                for model, sub in predictions[predictions.phase.eq(phase) & predictions.target_month.isin(subdates)].groupby("model"):
                    robustness_rows.append({"codigo_producto": code, "scenario": scenario, "phase": phase,
                                            "block": block, "model": model, "n": len(sub),
                                            **error_metrics(sub.actual, sub.predicted, sub.mase_scale)})
        all_predictions.append(predictions)
        split_rows.append(plan.assign(codigo_producto=code, scenario=scenario))
        chosen = predictions[predictions.selected]
        calibration = chosen[chosen.phase.eq("validation")]
        # Calibration was used for selection: these are heuristic error bands, not
        # exchangeability-guaranteed conformal intervals. Holdout coverage is reported.
        band80 = finite_sample_error_quantile(calibration.error, .8)
        band95 = finite_sample_error_quantile(calibration.error, .95)
        for phase in ("validation", "holdout"):
            sub = chosen[chosen.phase.eq(phase)]
            for baseline in ("naive", "seasonal_naive"):
                reference = predictions[predictions.phase.eq(phase) & predictions.model.eq(baseline)]
                comparisons.append({"codigo_producto": code, "scenario": scenario, "phase": phase,
                                    "selected_model": selection["model"], "baseline": baseline,
                                    **paired_comparison(sub, reference, config)})
            residual = sub.error.dropna().to_numpy()
            lag = min(6, len(residual) // 3)
            ljung = acorr_ljungbox(residual, lags=[lag], return_df=True) if len(residual) > 3 and np.std(residual) > 0 else None
            residual_rows.append({"codigo_producto": code, "scenario": scenario, "phase": phase,
                                  "model": selection["model"], "n": len(residual),
                                  "mean_error": np.mean(residual), "std_error": np.std(residual, ddof=1),
                                  "lag1_error_correlation": pd.Series(residual).autocorr(1) if len(residual) > 3 else np.nan,
                                  "ljung_box_lag": lag,
                                  "ljung_box_p_exploratory": ljung.lb_pvalue.iloc[0] if ljung is not None else np.nan})
            for coverage, width in ((.8, band80), (.95, band95)):
                lo = (sub.predicted - width).clip(lower=0)
                hi = sub.predicted + width
                interval_rows.append({"codigo_producto": code, "scenario": scenario, "phase": phase,
                                      "nominal_coverage": coverage, "absolute_error_half_width": width,
                                      "observed_coverage": ((sub.actual >= lo) & (sub.actual <= hi)).mean() if np.isfinite(width) else np.nan,
                                      "n": len(sub), "warning": "heuristic, selection-dependent, nonstationary small sample"})
        selections.append({"codigo_producto": code, "scenario": scenario, **selection,
                           "validation_start": validation.target_month.min(), "validation_end": validation.target_month.max(),
                           "holdout_start": holdout.target_month.min(), "holdout_end": holdout.target_month.max(),
                           "n_validation": len(calibration), "n_holdout": config.holdout_months})
        result = fit_predict(selection["model"], series, config.seed)
        target = series.month.max() + pd.offsets.MonthBegin(1)
        for baseline in ("naive", "seasonal_naive", "moving_average_3", "moving_average_6", "historical_average"):
            benchmark = fit_predict(baseline, series, config.seed)
            baseline_forecasts.append({"codigo_producto": code, "scenario": scenario, "model": baseline,
                                       "target_month": target, "forecast_origin": target - pd.Timedelta(days=1),
                                       "forecast_units": benchmark.prediction,
                                       "status": "retrospective_reference_NOT_newly_selected_or_live"})
        all_observed = monthly[monthly.codigo_producto.eq(code) & monthly.scenario.eq(scenario)]
        partial = all_observed[all_observed.month.eq(target)]
        future_rows.append({"codigo_producto": code, "scenario": scenario, "model": selection["model"],
                            "forecast_origin": target - pd.Timedelta(days=1), "target_month": target,
                            "forecast_units": result.prediction, "raw_forecast_units": result.raw_prediction,
                            "nonnegative_clipped": result.nonnegative_clipped,
                            "model_warning": "negative extrapolation clipped to zero; NOT evidence of zero demand" if result.nonnegative_clipped else "",
                            "boundary_sales_exceed_point_forecast": bool(len(partial) and partial.sales_units.iloc[0] > result.prediction),
                            "lower80_heuristic": max(0, result.prediction - band80),
                            "upper80_heuristic": result.prediction + band80,
                            "lower95_heuristic": max(0, result.prediction - band95) if np.isfinite(band95) else np.nan,
                            "upper95_heuristic": result.prediction + band95,
                            "units_already_in_unconfirmed_boundary": partial.sales_units.iloc[0] if len(partial) else np.nan,
                            "analysis_as_of": config.as_of,
                            "status": "retrospective_boundary_forecast_NOT_live_next_month",
                            "live_next_calendar_month": (pd.Timestamp(config.as_of).to_period("M") + 1).to_timestamp(),
                            "live_forecast_available": False})
        # Serialize only the selected approach, with no names or transaction-level data.
        stem = f"{code}_{scenario}"
        model_dir = config.root / "artifacts"
        if isinstance(result.artifact, dict) and "estimator" not in result.artifact:
            (model_dir / f"{stem}.json").write_text(json.dumps(result.artifact, indent=2), encoding="utf-8")
        else:
            with (model_dir / f"{stem}.pkl").open("wb") as handle:
                pickle.dump(result.artifact, handle, protocol=pickle.HIGHEST_PROTOCOL)
    predictions = pd.concat(all_predictions, ignore_index=True)
    return {"backtest_predictions": predictions, "model_comparison": summarize_predictions(predictions),
            "selected_models": pd.DataFrame(selections), "next_history_month_forecasts": pd.DataFrame(future_rows),
            "paired_baseline_comparison": pd.DataFrame(comparisons), "residual_diagnostics": pd.DataFrame(residual_rows),
            "validation_splits": pd.concat(split_rows, ignore_index=True), "prediction_interval_diagnostics": pd.DataFrame(interval_rows),
            "next_history_baseline_forecasts": pd.DataFrame(baseline_forecasts), "performance_stability": pd.DataFrame(robustness_rows)}


def scenario_coherence(forecasts: pd.DataFrame) -> pd.DataFrame:
    out = forecasts.pivot(index="codigo_producto", columns="scenario", values="forecast_units").reset_index()
    out["sum_segment_forecasts"] = out.refama + out.other
    out["combined_minus_sum_segments"] = out.combined - out.sum_segment_forecasts
    out["warning"] = "independent scenario models need not add up; no accounting constraint was imposed"
    return out

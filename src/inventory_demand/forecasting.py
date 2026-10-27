"""Small, fixed candidate set. Fits see only data before the forecast origin."""

import warnings
from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX

from .features import MODEL_FEATURES, engineer_series


# Priority used only inside a predeclared 5%-of-best validation MAE tie band.
CANDIDATES = {
    "naive": 0,
    "moving_average_3": 1,
    "moving_average_6": 2,
    "historical_average": 3,
    "seasonal_naive": 4,
    "ets_level": 5,
    "ets_damped": 6,
    "ets_seasonal_add": 7,
    "ridge": 8,
    "linear_regression": 9,
    "sarima": 10,
    "random_forest": 11,
    "gradient_boosting": 12,
}
ML_MODELS = {"ridge", "linear_regression", "random_forest", "gradient_boosting"}
# Separate experiment registry. The historical 13-candidate protocol stays available.
EXPANDED_CANDIDATES = {**CANDIDATES, "zero": -1, "croston_sba": 5.1, "tsb": 5.2}


def candidates_for_history(history) -> dict:
    """Screen once on the INITIAL training window, not the full EDA or holdout."""
    y = history.sales_units.to_numpy(float)
    positives = int((y > 0).sum())
    candidates = {**CANDIDATES, "zero": -1}
    if positives >= 2 and (y == 0).mean() >= .2:
        candidates.update({name: EXPANDED_CANDIDATES[name] for name in ("croston_sba", "tsb")})
    return candidates


@dataclass
class FitResult:
    prediction: float
    artifact: object
    warnings: str = ""
    raw_prediction: float | None = None

    @property
    def nonnegative_clipped(self) -> bool:
        return self.raw_prediction is not None and self.raw_prediction < 0


def fit_predict(model: str, history, seed: int = 42) -> FitResult:
    if model not in EXPANDED_CANDIDATES:
        raise ValueError(f"Unknown model: {model}")
    y = history.sales_units.to_numpy(float)
    if len(y) < 13 or not np.isfinite(y).all() or np.any(y < 0):
        raise ValueError("At least 13 finite, nonnegative history months are required")
    artifact = {"model": model, "history_units": y.tolist(),
                "cutoff": history.month.max().strftime("%Y-%m-%d")}
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        if model == "zero":
            pred = 0.0
        elif model in {"croston_sba", "tsb"}:
            from statsforecast.models import CrostonSBA, TSB

            # SBA uses the library's fixed smoothing; TSB parameters are predeclared.
            # Both see the full zero-filled pre-origin calendar, never positive rows only.
            estimator = CrostonSBA() if model == "croston_sba" else TSB(alpha_d=.2, alpha_p=.2)
            pred = estimator.forecast(y=y, h=1)["mean"][0]
            artifact.update({"library": "statsforecast", "alpha_d": .2 if model == "tsb" else .1,
                             "alpha_p": .2 if model == "tsb" else .1})
        elif model == "naive":
            pred = y[-1]
        elif model.startswith("moving_average_"):
            pred = y[-int(model.rsplit("_", 1)[1]):].mean()
        elif model == "historical_average":
            pred = y.mean()
        elif model == "seasonal_naive":
            pred = y[-12]
        elif model in ML_MODELS:
            f = engineer_series(history, append_next=True)
            train = f.iloc[:-1].dropna(subset=MODEL_FEATURES + ["target_sales_units"])
            future = f.iloc[[-1]]
            if len(train) < 12:
                raise ValueError("Insufficient lagged supervised training rows")
            if model == "ridge":
                estimator = make_pipeline(StandardScaler(), Ridge(alpha=10.0))
            elif model == "linear_regression":
                estimator = make_pipeline(StandardScaler(), LinearRegression())
            elif model == "random_forest":
                estimator = RandomForestRegressor(n_estimators=80, max_depth=3, min_samples_leaf=5,
                                                  max_features=.8, random_state=seed, n_jobs=1)
            else:
                estimator = GradientBoostingRegressor(n_estimators=40, max_depth=1,
                                                      min_samples_leaf=5, learning_rate=.04,
                                                      loss="squared_error", random_state=seed)
            estimator.fit(train[MODEL_FEATURES], train.target_sales_units)
            pred = estimator.predict(future[MODEL_FEATURES])[0]
            artifact = {"estimator": estimator, "feature_names": MODEL_FEATURES,
                        "model": model, "training_rows": len(train),
                        "cutoff": history.month.max().strftime("%Y-%m-%d")}
        elif model.startswith("ets_"):
            trend = "add" if model == "ets_damped" else None
            seasonal = "add" if model == "ets_seasonal_add" else None
            fitted = ExponentialSmoothing(y, trend=trend, damped_trend=trend is not None,
                                          seasonal=seasonal, seasonal_periods=12 if seasonal else None,
                                          initialization_method="estimated").fit(optimized=True)
            if fitted.mle_retvals is not None and not fitted.mle_retvals.get("success", True):
                raise RuntimeError("ETS optimizer did not converge")
            pred = fitted.forecast(1)[0]
            artifact = fitted
        elif model == "sarima":
            # Parsimonious, fixed stationary seasonal AR structure, not an auto-ARIMA search.
            fitted = SARIMAX(y, order=(1, 0, 0), seasonal_order=(1, 0, 0, 12), trend="c",
                             enforce_stationarity=True, enforce_invertibility=True).fit(disp=False, maxiter=150)
            if not fitted.mle_retvals.get("converged", False):
                raise RuntimeError("SARIMA optimizer did not converge")
            pred = fitted.forecast(1)[0]
            artifact = fitted
    if not np.isfinite(pred):
        raise ValueError("Non-finite forecast")
    messages = "; ".join(sorted({str(w.message) for w in caught}))
    # All candidates share the same physically motivated nonnegative forecast constraint.
    return FitResult(max(0.0, float(pred)), artifact, messages, float(pred))

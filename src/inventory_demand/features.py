"""One-month-ahead features: every non-calendar input is strictly lagged."""

import numpy as np
import pandas as pd

# Deliberately small predictor set for roughly 20-47 usable supervised training rows.
# Richer features are exported for future experiments, not all fitted simultaneously.
MODEL_FEATURES = ["lag_1", "lag_2", "lag_3", "rolling_mean_3", "time_index", "month_sin", "month_cos"]


def engineer_series(frame: pd.DataFrame, append_next: bool = False) -> pd.DataFrame:
    data = frame.sort_values("month").copy().reset_index(drop=True)
    data["month"] = data.month.astype("datetime64[ns]")
    if not data.complete_for_modeling.all():
        raise ValueError("Feature input must exclude unconfirmed boundary months")
    expected = pd.date_range(data.month.min(), data.month.max(), freq="MS")
    if data.month.duplicated().any() or list(data.month) != list(expected):
        raise ValueError("Features require one contiguous calendar-month series")
    if append_next:
        row = {"month": data.month.iloc[-1] + pd.offsets.MonthBegin(1),
               "codigo_producto": data.codigo_producto.iloc[0], "scenario": data.scenario.iloc[0],
               "complete_for_modeling": False}
        data = pd.concat([data, pd.DataFrame([row])], ignore_index=True)
    data["calendar_month"] = data.month.dt.month
    data["calendar_year"] = data.month.dt.year
    data["quarter"] = data.month.dt.quarter
    data["time_index"] = np.arange(len(data))
    data["month_sin"] = np.sin(2 * np.pi * data.calendar_month / 12)
    data["month_cos"] = np.cos(2 * np.pi * data.calendar_month / 12)
    y = data.sales_units
    for lag in (1, 2, 3, 6, 12):
        data[f"lag_{lag}"] = y.shift(lag)
    for window in (3, 6, 12):
        shifted = y.shift(1)
        data[f"rolling_mean_{window}"] = shifted.rolling(window, min_periods=window).mean()
        data[f"rolling_std_{window}"] = shifted.rolling(window, min_periods=window).std(ddof=1)
    data["historical_mom_growth"] = (y.shift(1) / y.shift(2) - 1).where(y.shift(2).gt(0))
    data["historical_yoy_growth"] = (y.shift(1) / y.shift(13) - 1).where(y.shift(13).gt(0))
    for col in ("closing_balance", "eod_nonpositive_days", "eod_low_stock_days", "sales_transactions"):
        if col in data:
            data[f"previous_{col}"] = data[col].shift(1)
    data["information_cutoff"] = data.month.to_numpy(dtype="datetime64[ns]") - np.timedelta64(1, "D")
    data["target_sales_units"] = data.sales_units
    # Raw target-month inventory and flows must never be mistaken for usable features.
    feature_cols = ["codigo_producto", "scenario", "month", "information_cutoff", "target_sales_units",
                    "calendar_month", "calendar_year", "quarter", "time_index", "month_sin", "month_cos"]
    feature_cols += [c for c in data if c.startswith(("lag_", "rolling_", "historical_", "previous_"))]
    return data[feature_cols]


def build_features(monthly: pd.DataFrame) -> pd.DataFrame:
    complete = monthly[monthly.complete_for_modeling]
    return pd.concat([engineer_series(g, append_next=True)
                      for _, g in complete.groupby(["codigo_producto", "scenario"])], ignore_index=True)

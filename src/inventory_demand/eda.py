"""Descriptive analysis with conservative, explicitly exploratory statistical tests."""

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats
from statsmodels.stats.multitest import multipletests
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import acf

from .config import Config


def safe_ratio(a, b):
    return float(a / b) if b else np.nan


def demand_classification(y) -> dict:
    y = np.asarray(y, dtype=float)
    positive = y[y > 0]
    adi = safe_ratio(len(y), len(positive))
    cv2 = (positive.std(ddof=1) / positive.mean()) ** 2 if len(positive) > 1 else np.nan
    if not np.isfinite(cv2) or not np.isfinite(adi):
        label = "insufficient_positive_periods"
    elif adi < 1.32:
        label = "smooth" if cv2 < 0.49 else "erratic"
    else:
        label = "intermittent" if cv2 < 0.49 else "lumpy"
    return {"adi": adi, "cv2_positive_periods": cv2, "zero_periods": int((y == 0).sum()),
            "demand_class": label}


def sales_summary(monthly: pd.DataFrame, transactions: pd.DataFrame) -> pd.DataFrame:
    result = []
    for (code, scenario), g in monthly.groupby(["codigo_producto", "scenario"]):
        c = g[g.complete_for_modeling]
        y = c.sales_units
        sales = transactions[transactions.codigo_producto.eq(code) & transactions.is_sale & transactions.analysis_eligible]
        if scenario != "combined":
            sales = sales[sales.is_refama_sale.eq(scenario == "refama")]
        quantities = sales.salida.sort_values(ascending=False)
        customer_totals = sales.groupby("cliente_proveedor").salida.sum().sort_values(ascending=False)
        total = quantities.sum()
        result.append({"codigo_producto": code, "scenario": scenario,
                       "all_observed_sales_units": total, "all_sales_transactions": len(sales),
                       "complete_months": len(c), "complete_sales_units": y.sum(),
                       "monthly_mean": y.mean(), "monthly_median": y.median(),
                       "monthly_std": y.std(ddof=1), "monthly_cv": safe_ratio(y.std(ddof=1), y.mean()),
                       "monthly_min": y.min(), "monthly_max": y.max(),
                       "min_month": c.loc[y.idxmin(), "month"], "max_month": c.loc[y.idxmax(), "month"],
                       "all_average_units_per_transaction": safe_ratio(total, len(sales)),
                       "complete_average_units_per_transaction": safe_ratio(y.sum(), c.sales_transactions.sum()),
                       "top_1_order_share": safe_ratio(quantities.head(1).sum(), total),
                       "top_5_orders_share": safe_ratio(quantities.head(5).sum(), total),
                       "top_10pct_orders_share": safe_ratio(quantities.head(max(1, int(np.ceil(len(quantities) * .1)))).sum(), total),
                       "customer_count_raw_labels": len(customer_totals),
                       "top_customer_share": safe_ratio(customer_totals.head(1).sum(), total),
                       "top_5_customers_share": safe_ratio(customer_totals.head(5).sum(), total),
                       "customer_hhi_raw_labels": float(((customer_totals / total) ** 2).sum()) if total else np.nan,
                       **demand_classification(y)})
    return pd.DataFrame(result)


def calendar_totals(monthly: pd.DataFrame, freq: str) -> pd.DataFrame:
    data = monthly.copy()
    data["period"] = data.month.dt.to_period(freq).astype(str)
    data["complete_sales"] = data.sales_units.where(data.complete_for_modeling, 0)
    grouped = data.groupby(["codigo_producto", "scenario", "period"])
    out = grouped.agg(observed_sales_units=("sales_units", "sum"),
                      interior_sales_units=("complete_sales", "sum"),
                      calendar_months_present=("month", "size"),
                      interior_months=("complete_for_modeling", "sum"),
                      sales_transactions=("sales_transactions", "sum")).reset_index()
    expected = 12 if freq == "Y" else 3
    out["full_calendar_period"] = out.interior_months.eq(expected)
    lag = 1 if freq == "Y" else 4
    groups = out.groupby(["codigo_producto", "scenario"])
    prior = groups.interior_sales_units.shift(lag)
    valid = out.full_calendar_period & groups.full_calendar_period.shift(lag).astype("boolean").fillna(False).astype(bool) & prior.gt(0)
    out["comparable_yoy_growth"] = (out.interior_sales_units / prior - 1).where(valid)
    return out


def comparable_ytd(monthly: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for (code, scenario), g in monthly[monthly.complete_for_modeling].groupby(["codigo_producto", "scenario"]):
        last = g.month.max()
        for year, gy in g[g.month.dt.month.le(last.month)].groupby(g.month.dt.year):
            if len(gy) != last.month:
                continue
            rows.append({"codigo_producto": code, "scenario": scenario, "year": year,
                         "through_month": last.month, "sales_units": gy.sales_units.sum()})
    out = pd.DataFrame(rows)
    out["yoy_growth"] = out.groupby(["codigo_producto", "scenario"]).sales_units.pct_change(fill_method=None)
    return out


def block_resample(values: np.ndarray, rng, length: int, block_size: int = 3) -> np.ndarray:
    starts = rng.integers(0, len(values), size=int(np.ceil(length / block_size)))
    return np.concatenate([values[(start + np.arange(block_size)) % len(values)] for start in starts])[:length]


def season_and_trend(monthly: pd.DataFrame, config: Config) -> dict[str, pd.DataFrame]:
    trends, seasons, components, correlations, changes = [], [], [], [], []
    for (code, scenario), g in monthly[monthly.complete_for_modeling].groupby(["codigo_producto", "scenario"]):
        g = g.sort_values("month")
        y = g.sales_units.to_numpy(float)
        logy = np.log1p(y)
        t = np.arange(len(y))
        x0 = sm.add_constant(t)
        fit = sm.OLS(logy, x0).fit(cov_type="HAC", cov_kwds={"maxlags": 3})
        ci = fit.conf_int()[1]
        tau, kp = stats.kendalltau(t, y)
        trends.append({"codigo_producto": code, "scenario": scenario, "months": len(y),
                       "log1p_slope": fit.params[1], "estimated_monthly_change": np.expm1(fit.params[1]),
                       "slope_ci_low": ci[0], "slope_ci_high": ci[1], "hac_slope_p": fit.pvalues[1],
                       "kendall_tau": tau, "kendall_p_unadjusted": kp,
                       "first_12_mean": y[:12].mean(), "last_12_mean": y[-12:].mean(),
                       "last_12_vs_first_12": safe_ratio(y[-12:].mean(), y[:12].mean()) - 1})
        # A two-degree-of-freedom annual harmonic, controlling for a linear trend.
        months = g.month.dt.month.to_numpy()
        x1 = np.column_stack([x0, np.sin(2 * np.pi * months / 12), np.cos(2 * np.pi * months / 12)])
        seasonal_fit = sm.OLS(logy, x1).fit(cov_type="HAC", cov_kwds={"maxlags": 3})
        restriction = np.zeros((2, 4))
        restriction[:, 2:] = np.eye(2)
        harmonic_p = float(seasonal_fit.f_test(restriction).pvalue)
        stl = STL(pd.Series(y, index=g.month), period=12, robust=True).fit()
        denom = np.var(stl.resid + stl.seasonal)
        strength = max(0, 1 - np.var(stl.resid) / denom) if denom > 0 else np.nan
        residual = fit.resid
        ac, ci_ac = acf(residual, nlags=min(24, len(y) // 2 - 1), fft=False, alpha=.05)
        for lag in range(len(ac)):
            correlations.append({"codigo_producto": code, "scenario": scenario, "lag": lag,
                                 "acf_detrended_log_sales": ac[lag],
                                 "approx_ci_low": ci_ac[lag, 0], "approx_ci_high": ci_ac[lag, 1]})
        seasons.append({"codigo_producto": code, "scenario": scenario, "annual_harmonic_hac_p": harmonic_p,
                        "acf_lag_12": ac[12], "acf12_ci_low": ci_ac[12, 0], "acf12_ci_high": ci_ac[12, 1],
                        "stl_seasonal_strength_descriptive": strength,
                        "years_per_calendar_month_min": int(g.groupby(g.month.dt.month).size().min()),
                        "years_per_calendar_month_max": int(g.groupby(g.month.dt.month).size().max())})
        for i, month in enumerate(g.month):
            components.append({"codigo_producto": code, "scenario": scenario, "month": month,
                               "sales_units": y[i], "trend": stl.trend.iloc[i],
                               "seasonal": stl.seasonal.iloc[i], "residual": stl.resid.iloc[i]})
        # Exploratory max split statistic, corrected for searching all admissible dates
        # with a residual moving-block bootstrap under a smooth-trend null.
        candidates = range(12, len(y) - 11)
        def max_shift(values):
            scales = np.std(values, ddof=1) + 1e-12
            scores = [abs(values[:k].mean() - values[k:].mean()) / scales * np.sqrt(k * (len(values) - k) / len(values))
                      for k in candidates]
            best = int(np.argmax(scores))
            return scores[best], list(candidates)[best]
        observed, split = max_shift(residual)
        rng = np.random.default_rng(config.seed)
        simulated = [max_shift(block_resample(residual, rng, len(y)))[0]
                     for _ in range(config.bootstrap_repetitions)]
        changes.append({"codigo_producto": code, "scenario": scenario,
                        "candidate_change_month": g.month.iloc[split], "max_split_statistic": observed,
                        "block_bootstrap_p": (1 + np.sum(np.asarray(simulated) >= observed)) / (1 + len(simulated)),
                        "before_mean_units": y[:split].mean(), "after_mean_units": y[split:].mean(),
                        "interpretation": "exploratory residual level shift, not a verified business event"})
    trend = pd.DataFrame(trends)
    season = pd.DataFrame(seasons)
    change = pd.DataFrame(changes)
    trend["hac_slope_q_bh"] = multipletests(trend.hac_slope_p, method="fdr_bh")[1]
    season["harmonic_q_bh"] = multipletests(season.annual_harmonic_hac_p, method="fdr_bh")[1]
    change["change_q_bh"] = multipletests(change.block_bootstrap_p, method="fdr_bh")[1]
    season["harmonic_evidence_after_fdr"] = season.harmonic_q_bh.lt(.05)
    return {"trend": trend, "seasonality": season, "stl_components": pd.DataFrame(components),
            "autocorrelation": pd.DataFrame(correlations), "change_points": change}


def inventory_analysis(df: pd.DataFrame, daily: pd.DataFrame, monthly: pd.DataFrame) -> dict[str, pd.DataFrame]:
    movement_totals = df.groupby(["codigo_producto", "tipo_movimiento", "is_opening_inventory"]).agg(
        movements=("movement_id", "size"), incoming=("entrada", "sum"), outgoing=("salida", "sum")).reset_index()
    movement_totals["net"] = movement_totals.incoming - movement_totals.outgoing
    summaries, periods, intermittency, association = [], [], [], []
    for code, d in daily.groupby("codigo_producto"):
        g = df[df.codigo_producto.eq(code) & df.analysis_eligible]
        c = monthly[monthly.codigo_producto.eq(code) & monthly.scenario.eq("combined") & monthly.complete_for_modeling]
        complete_daily = d[d.month.isin(c.month)]
        summaries.append({"codigo_producto": code, "first_valid_date": g.fecha.min(), "last_valid_date": g.fecha.max(),
                          "movements": len(g), "ending_recorded_balance": g.saldo.iloc[-1],
                          "minimum_recorded_balance": g.saldo.min(), "maximum_recorded_balance": g.saldo.max(),
                          "negative_movement_balances": int(g.negative_balance.sum()),
                          "zero_movement_balances": int(g.zero_balance.sum()),
                          "eod_zero_days": int(d.eod_zero.sum()), "eod_negative_days": int(d.eod_negative.sum()),
                          "eod_nonpositive_days": int(d.eod_nonpositive.sum()),
                          "eod_low_stock_days": int(d.eod_low_stock.sum()), "covered_days": len(d),
                          "carried_forward_days": int(d.balance_carried_forward.sum()),
                          "observed_zero_event_days": int(d.observed_zero_event.sum()),
                          "longest_gap_without_movement_days": d.days_since_last_movement.max(),
                          "adjustment_incoming": g.loc[g.tipo_movimiento.eq("AJUSTE"), "entrada"].sum(),
                          "adjustment_outgoing": g.loc[g.tipo_movimiento.eq("AJUSTE"), "salida"].sum(),
                          "opening_inventory_units": g.loc[g.is_opening_inventory, "entrada"].sum(),
                          "non_sale_outgoing": g.loc[~g.is_sale, "salida"].sum()})
        intermittency.append({"codigo_producto": code, "aggregation": "daily_interior_provisional",
                              **demand_classification(complete_daily.sales_units)})
        for flag in ("eod_zero", "eod_negative", "eod_low_stock"):
            blocks = d[flag].ne(d[flag].shift()).cumsum()
            for _, run in d[d[flag]].groupby(blocks):
                periods.append({"codigo_producto": code, "condition": flag, "start": run.date.min(),
                                "end": run.date.max(), "days": len(run),
                                "observed_movements": int(run.movements.sum()),
                                "sales_recorded_units": run.sales_units.sum(),
                                "interpretation": "recorded EOD balance / carry-forward; not confirmed lost sales"})
        exposed = c.eod_nonpositive_days.gt(0)
        association.append({"codigo_producto": code, "months_nonpositive_eod": int(exposed.sum()),
                            "mean_sales_exposed": c.loc[exposed, "sales_units"].mean(),
                            "mean_sales_not_exposed": c.loc[~exposed, "sales_units"].mean(),
                            "warning": "descriptive association only; timing, reverse causality, and missing movements confound demand censoring"})
    periods = pd.DataFrame(periods, columns=["codigo_producto", "condition", "start", "end", "days", "observed_movements", "sales_recorded_units", "interpretation"])
    return {"movement_totals": movement_totals, "inventory_summary": pd.DataFrame(summaries),
            "recorded_low_stock_periods": periods, "daily_intermittency": pd.DataFrame(intermittency),
            "availability_association": pd.DataFrame(association)}


def inventory_pressure(monthly: pd.DataFrame, daily: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for code, g in monthly[monthly.complete_for_modeling & monthly.scenario.eq("combined")].groupby("codigo_producto"):
        g = g.sort_values("month")
        trailing = g.tail(12)
        d = daily[daily.codigo_producto.eq(code) & daily.month.isin(trailing.month)]
        balance = g.closing_balance.iloc[-1]
        rows.append({"codigo_producto": code, "last_interior_month": g.month.iloc[-1],
                     "aligned_closing_balance": balance, "trailing_3_mean_sales": g.sales_units.tail(3).mean(),
                     "trailing_12_mean_sales": trailing.sales_units.mean(),
                     "bookkeeping_units_over_trailing12_monthly_sales": safe_ratio(balance, trailing.sales_units.mean()),
                     "trailing12_eod_nonpositive_days": int(d.eod_nonpositive.sum()),
                     "trailing12_eod_low_stock_days": int(d.eod_low_stock.sum()),
                     "trailing12_incoming_units": trailing.all_incoming.sum(),
                     "trailing12_sale_units": trailing.sales_units.sum(),
                     "trailing12_adjustment_outgoing": trailing.adjustment_outgoing.sum(),
                     "warning": "backward-looking stock/sales ratio, not guaranteed future coverage or physical stock"})
    return pd.DataFrame(rows)


def detect_anomalies(df: pd.DataFrame, monthly: pd.DataFrame) -> pd.DataFrame:
    rows = []
    def add(row, kind, classification, detail):
        rows.append({"codigo_producto": row.codigo_producto, "movement_id": row.movement_id,
                     "date": row.fecha, "type": kind, "classification": classification,
                     "quantity_in": row.entrada, "quantity_out": row.salida,
                     "balance": row.saldo, "detail": detail})
    for code, g in df.groupby("codigo_producto"):
        sales = g[g.is_sale]
        q1, q3 = sales.salida.quantile([.25, .75])
        threshold = q3 + 3 * (q3 - q1)
        typical_month = monthly.loc[monthly.codigo_producto.eq(code) & monthly.scenario.eq("combined") & monthly.complete_for_modeling, "sales_units"].median()
        for row in g.itertuples():
            if row.is_sale and row.salida > threshold:
                add(row, "large_sale", "legitimate_but_unusual_or_context_needed", f"Above Q3+3*IQR={threshold:g}; retained")
            if row.adjustment_requires_context and abs(row.adjustment_net) >= typical_month:
                add(row, "large_adjustment", "context_required", f"Absolute adjustment >= median interior monthly sales ({typical_month:g})")
            if row.negative_balance:
                add(row, "negative_balance", "potential_data_or_timing_problem", "Arithmetically possible ledger, physically ambiguous")
            if row.balance_discrepancy:
                add(row, "balance_discrepancy", "potential_data_quality_problem", f"Balance equation residual={row.balance_error:g}")
            if row.missing_document or row.exact_duplicate_candidate or row.repeated_business_candidate:
                add(row, "document_or_repetition", "potential_data_quality_problem", "Investigate source; no movements deleted")
    # Abrupt calendar-month sales changes are separate contextual flags, not edited observations.
    for (code, scenario), g in monthly[monthly.complete_for_modeling].groupby(["codigo_producto", "scenario"]):
        change = g.sales_units.diff()
        med = change.median()
        mad = (change - med).abs().median()
        if mad > 0:
            unusual = ((change - med).abs() / (1.4826 * mad)).gt(3.5)
            for _, row in g[unusual].iterrows():
                rows.append({"codigo_producto": code, "movement_id": "", "date": row.month,
                             "type": f"abrupt_monthly_change_{scenario}", "classification": "context_required",
                             "quantity_in": np.nan, "quantity_out": row.sales_units, "balance": np.nan,
                             "detail": "Monthly difference robust z>3.5; not evidence of a transcription error"})
    return pd.DataFrame(rows)


def run_eda(df: pd.DataFrame, daily: pd.DataFrame, monthly: pd.DataFrame, config: Config) -> dict[str, pd.DataFrame]:
    tables = {"sales_summary": sales_summary(monthly, df), "yearly_sales": calendar_totals(monthly, "Y"),
              "quarterly_sales": calendar_totals(monthly, "Q"), "comparable_ytd": comparable_ytd(monthly),
              "anomalies": detect_anomalies(df, monthly)}
    tables.update(season_and_trend(monthly, config))
    tables.update(inventory_analysis(df, daily, monthly))
    tables["inventory_pressure"] = inventory_pressure(monthly, daily)
    full_quarters = tables["quarterly_sales"][tables["quarterly_sales"].full_calendar_period].copy()
    full_quarters["calendar_quarter"] = pd.PeriodIndex(full_quarters.period, freq="Q").quarter
    tables["quarter_seasonality_profile"] = full_quarters.groupby(["codigo_producto", "scenario", "calendar_quarter"]).interior_sales_units.agg(
        mean="mean", median="median", std="std", years="size").reset_index()
    complete = monthly[monthly.complete_for_modeling].copy()
    complete["calendar_month"] = complete.month.dt.month
    tables["calendar_month_profile"] = complete.groupby(["codigo_producto", "scenario", "calendar_month"]).sales_units.agg(
        mean="mean", median="median", std="std", years="size").reset_index()
    return tables

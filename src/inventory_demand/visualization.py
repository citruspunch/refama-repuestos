"""Shareable, customer-free figures. Boundary periods are never disguised as full months."""

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from .config import Config, PRODUCTS

COLORS = {"combined": "#156082", "refama": "#e97132", "other": "#196b24"}


def save(fig, name: str, config: Config):
    fig.tight_layout()
    fig.savefig(config.figures / f"{name}.png", dpi=160, bbox_inches="tight")
    plt.close(fig)


def axes_products(rows=1, **kwargs):
    fig, axes = plt.subplots(rows, 2, figsize=(14, 3.8 * rows), squeeze=False, **kwargs)
    return fig, axes


def plot_eda(monthly: pd.DataFrame, transactions: pd.DataFrame, daily: pd.DataFrame,
             tables: dict, config: Config):
    sns.set_theme(style="whitegrid", context="notebook")
    codes = list(PRODUCTS)
    complete = monthly[monthly.complete_for_modeling]
    fig, axes = axes_products()
    for col, code in enumerate(codes):
        ax = axes[0, col]
        for scenario, g in monthly[monthly.codigo_producto.eq(code)].groupby("scenario"):
            good = g[g.complete_for_modeling]
            ax.plot(good.month, good.sales_units, label=scenario, color=COLORS[scenario], alpha=.85)
            boundary = g[~g.complete_for_modeling]
            ax.scatter(boundary.month, boundary.sales_units, facecolors="none", edgecolors=COLORS[scenario], marker="o")
        ax.set(title=f"{PRODUCTS[code]}: recorded VENTA units", ylabel="Units / calendar month")
        ax.legend(fontsize=8)
        ax.tick_params(axis="x", rotation=30)
    fig.suptitle("Hollow points = unconfirmed boundary months (excluded from modeling)", y=1.03)
    save(fig, "monthly_sales_scenarios", config)

    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        g = complete[complete.codigo_producto.eq(code) & complete.scenario.eq("combined")]
        axes[0, col].plot(g.month, g.sales_units, alpha=.35, label="Actual")
        for window in (3, 6, 12):
            axes[0, col].plot(g.month, g.sales_units.rolling(window).mean(), label=f"Trailing {window} months")
        axes[0, col].set(title=PRODUCTS[code], ylabel="Recorded monthly sales")
        axes[0, col].legend(fontsize=8)
        axes[1, col].plot(g.month, g.sales_units.rolling(6).std(), color="#7d4b99")
        axes[1, col].set(ylabel="Trailing 6-month standard deviation")
        for ax in axes[:, col]:
            ax.tick_params(axis="x", rotation=30)
    save(fig, "rolling_trend_variability", config)

    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        g = complete[complete.codigo_producto.eq(code) & complete.scenario.eq("combined")]
        sns.histplot(g.sales_units, bins=14, ax=axes[0, col], color=COLORS["combined"])
        axes[0, col].axvline(g.sales_units.median(), color="black", ls="--", label="Median")
        axes[0, col].set(title=PRODUCTS[code], xlabel="Interior monthly units")
        axes[0, col].legend()
        sales = transactions[transactions.codigo_producto.eq(code) & transactions.is_sale]
        sns.histplot(sales.salida, bins=25, ax=axes[1, col], color=COLORS["other"])
        axes[1, col].set(xlabel="Units per VENTA transaction", ylabel="Transactions")
    save(fig, "sales_distributions", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = complete[complete.codigo_producto.eq(code) & complete.scenario.eq("combined")].copy()
        g["year"], g["calendar_month"] = g.month.dt.year, g.month.dt.month
        pivot = g.pivot(index="year", columns="calendar_month", values="sales_units").reindex(columns=range(1, 13))
        sns.heatmap(pivot, annot=True, fmt=".0f", cmap="YlGnBu", ax=axes[0, col], cbar_kws={"label": "Units"})
        axes[0, col].set(title=PRODUCTS[code], xlabel="Calendar month (blank = not comparable)")
    save(fig, "calendar_heatmap", config)

    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        g = complete[complete.codigo_producto.eq(code) & complete.scenario.eq("combined")].copy()
        g["calendar_month"] = g.month.dt.month
        sns.boxplot(data=g, x="calendar_month", y="sales_units", color="#9dc3d6", ax=axes[0, col])
        counts = g.groupby("calendar_month").size()
        axes[0, col].set(title=f"{PRODUCTS[code]}: only {counts.min()}–{counts.max()} observations per month", ylabel="Units")
        for year, sub in g.groupby(g.month.dt.year):
            axes[1, col].plot(sub.month.dt.month, sub.sales_units / sub.sales_units.mean(), marker=".", label=str(year))
        axes[1, col].set(xlabel="Calendar month", ylabel="Within-year mean-normalized sales", xticks=range(1, 13))
        axes[1, col].legend(fontsize=7, ncol=3)
    save(fig, "seasonal_profiles", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        q = tables["quarterly_sales"]
        q = q[q.codigo_producto.eq(code) & q.scenario.eq("combined") & q.full_calendar_period].copy()
        q["calendar_quarter"] = pd.PeriodIndex(q.period, freq="Q").quarter
        sns.boxplot(data=q, x="calendar_quarter", y="interior_sales_units", color="#9dc3d6", ax=axes[0, col])
        sns.stripplot(data=q, x="calendar_quarter", y="interior_sales_units", color="#156082", jitter=False, ax=axes[0, col])
        axes[0, col].set(title=f"{PRODUCTS[code]}: full calendar quarters only", xlabel="Quarter", ylabel="Quarterly units (trend not removed)")
    save(fig, "quarterly_seasonality", config)

    fig, axes = axes_products(4)
    components = tables["stl_components"]
    for col, code in enumerate(codes):
        g = components[components.codigo_producto.eq(code) & components.scenario.eq("combined")]
        for row, component in enumerate(("sales_units", "trend", "seasonal", "residual")):
            axes[row, col].plot(g.month, g[component], color=COLORS["combined"])
            axes[row, col].set(ylabel=component)
            axes[row, col].tick_params(axis="x", rotation=30)
        axes[0, col].set_title(f"{PRODUCTS[code]}: robust STL, period=12 (descriptive)")
    save(fig, "stl_decomposition", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = tables["autocorrelation"]
        g = g[g.codigo_producto.eq(code) & g.scenario.eq("combined") & g.lag.gt(0)]
        ax = axes[0, col]
        ax.stem(g.lag, g.acf_detrended_log_sales)
        ax.fill_between(g.lag, g.approx_ci_low - g.acf_detrended_log_sales,
                        g.approx_ci_high - g.acf_detrended_log_sales, alpha=.2)
        ax.axvline(12, color="#e97132", ls="--")
        ax.set(title=f"{PRODUCTS[code]}: detrended log1p sales ACF", xlabel="Lag (months)", ylabel="ACF")
    save(fig, "autocorrelation", config)

    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        d = daily[daily.codigo_producto.eq(code)]
        ax = axes[0, col]
        ax.plot(d.date, d.recorded_closing_balance, lw=1, label="Recorded EOD / forward-filled")
        neg = d[d.eod_negative]
        ax.scatter(neg.date, neg.recorded_closing_balance, color="red", s=20, label="Negative")
        zero = d[d.eod_zero]
        ax.scatter(zero.date, zero.recorded_closing_balance, color="orange", s=12, label="Zero")
        ax.axhline(0, color="black", lw=.7)
        ax.set(title=PRODUCTS[code], ylabel="Ledger units (not verified physical stock)")
        ax.legend(fontsize=7)
        g = monthly[monthly.codigo_producto.eq(code) & monthly.scenario.eq("combined")]
        ax = axes[1, col]
        bottom = np.zeros(len(g))
        for category, color in (("purchase_incoming", "#156082"), ("production_incoming", "#196b24"),
                                ("adjustment_incoming", "#e97132"), ("opening_inventory_incoming", "#8c6bb1")):
            ax.bar(g.month, g[category], bottom=bottom, width=20, label=category, color=color, alpha=.7)
            bottom += g[category].to_numpy()
        ax.plot(g.month, g.sales_units, color="black", label="VENTA only")
        ax.bar(g.month, -g.adjustment_outgoing, width=20, color="red", label="Adjustment out")
        ax.set(ylabel="Units / month; includes marked boundaries")
        ax.legend(fontsize=6)
        for a in axes[:, col]:
            a.tick_params(axis="x", rotation=30)
    save(fig, "inventory_and_supply", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = transactions[transactions.codigo_producto.eq(code) & transactions.is_sale].salida.sort_values(ascending=False).to_numpy()
        ranks = np.arange(1, len(g) + 1) / len(g)
        axes[0, col].plot(ranks, np.cumsum(g) / g.sum())
        axes[0, col].plot([0, 1], [0, 1], ls="--", color="grey")
        axes[0, col].axvline(.1, color="#e97132", ls=":")
        axes[0, col].set(title=PRODUCTS[code], xlabel="Fraction of orders (largest first)", ylabel="Cumulative sales-unit share")
    save(fig, "order_concentration", config)

    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        g = complete[complete.codigo_producto.eq(code) & complete.scenario.eq("combined")]
        for row, field in enumerate(("mom_growth", "yoy_growth")):
            axes[row, col].bar(g.month, 100 * g[field], width=20, color=COLORS["combined"])
            axes[row, col].axhline(0, color="black", lw=.7)
            axes[row, col].set(title=PRODUCTS[code] if row == 0 else "", ylabel=f"{field} (%)")
            axes[row, col].tick_params(axis="x", rotation=30)
    save(fig, "calendar_growth", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = monthly[monthly.codigo_producto.eq(code)].pivot(index="month", columns="scenario", values="sales_units")
        axes[0, col].stackplot(g.index, g.refama, g.other, labels=["Refama", "Other customers"],
                              colors=[COLORS["refama"], COLORS["other"]], alpha=.8)
        axes[0, col].set(title=f"{PRODUCTS[code]}: gross VENTA segmentation", ylabel="Units (boundary months included)")
        axes[0, col].legend(fontsize=8)
        axes[0, col].tick_params(axis="x", rotation=30)
    save(fig, "customer_segment_contributions", config)


def plot_models(monthly: pd.DataFrame, tables: dict, config: Config):
    codes = list(PRODUCTS)
    comparison = tables["model_comparison"]
    p = tables["backtest_predictions"]
    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        for row, phase in enumerate(("validation", "holdout")):
            g = comparison[comparison.codigo_producto.eq(code) & comparison.scenario.eq("combined")
                           & comparison.phase.eq(phase)].sort_values("mae")
            colors = ["#156082" if v else "#d9a441" for v in g.all_origins_successful]
            axes[row, col].barh(g.model, g.mae, color=colors)
            axes[row, col].invert_yaxis()
            axes[row, col].set(title=f"{PRODUCTS[code]}: {phase}", xlabel="MAE (units); gold = failed origins")
            axes[row, col].tick_params(axis="y", labelsize=8)
    save(fig, "model_comparison", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = p[p.codigo_producto.eq(code) & p.scenario.eq("combined")]
        actual = g.drop_duplicates("target_month")
        ax = axes[0, col]
        ax.plot(actual.target_month, actual.actual, color="black", marker=".", label="Actual")
        chosen = g[g.selected]
        ax.plot(chosen.target_month, chosen.predicted, color="#156082", label=f"Selected: {chosen.model.iloc[0]}")
        for baseline, color in (("naive", "#e97132"), ("seasonal_naive", "#7d4b99")):
            b = g[g.model.eq(baseline) & g.phase.eq("holdout")]
            ax.plot(b.target_month, b.predicted, ls="--", color=color, label=baseline)
        start = g.loc[g.phase.eq("holdout"), "target_month"].min()
        ax.axvspan(start - pd.Timedelta(days=10), g.target_month.max() + pd.Timedelta(days=10), alpha=.1, color="green", label="Final 6-month holdout")
        ax.set(title=PRODUCTS[code], ylabel="Recorded monthly VENTA units")
        ax.legend(fontsize=7)
        ax.tick_params(axis="x", rotation=30)
    save(fig, "actual_vs_predicted", config)

    fig, axes = axes_products(2)
    for col, code in enumerate(codes):
        g = p[p.codigo_producto.eq(code) & p.scenario.eq("combined") & p.selected]
        sns.histplot(data=g, x="error", hue="phase", bins=12, element="step", ax=axes[0, col])
        axes[0, col].axvline(0, color="black", ls="--")
        axes[0, col].set(title=PRODUCTS[code], xlabel="Forecast - actual (units)")
        for phase, sub in g.groupby("phase"):
            axes[1, col].scatter(sub.predicted, sub.error, label=phase)
        axes[1, col].axhline(0, color="black", ls="--")
        axes[1, col].set(xlabel="Predicted units", ylabel="Forecast error")
        axes[1, col].legend()
    save(fig, "residual_analysis", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = tables["next_history_month_forecasts"]
        g = g[g.codigo_producto.eq(code)].sort_values("scenario")
        ax = axes[0, col]
        ax.barh(g.scenario, g.forecast_units, color=[COLORS[s] for s in g.scenario])
        ax.errorbar(g.forecast_units, g.scenario,
                    xerr=np.vstack([g.forecast_units - g.lower80_heuristic, g.upper80_heuristic - g.forecast_units]),
                    fmt="none", color="black", capsize=4)
        target = pd.Timestamp(g.target_month.iloc[0]).strftime("%Y-%m")
        ax.set(title=f"{PRODUCTS[code]}: {target} retrospective forecast", xlabel="Units; heuristic 80% bands, not guaranteed")
    save(fig, "forecast_scenarios", config)

    fig, axes = axes_products()
    for col, code in enumerate(codes):
        g = tables["inventory_scenarios"]
        g = g[g.codigo_producto.eq(code)]
        ax = axes[0, col]
        ax.plot(g.assumed_lead_time_months, g.reorder_point_units, marker="o", label="Hypothetical reorder point")
        ax.plot(g.assumed_lead_time_months, g.order_up_to_units, marker="s", label="Hypothetical order-up-to")
        ax.axhline(g.observed_bookkeeping_balance.iloc[0], color="black", ls="--", label="Aligned recorded balance")
        ax.set(title=f"{PRODUCTS[code]}: NOT a live recommendation", xlabel="Assumed lead time (months)", ylabel="Units")
        ax.legend(fontsize=7)
    save(fig, "hypothetical_inventory_scenarios", config)


def plot_portfolio(monthly, tables, catalog, config):
    """Compact cross-product figures with independent unit scales, discovered from data."""
    sns.set_theme(style="whitegrid", context="notebook")
    codes = catalog.codigo_producto.tolist()
    labels = catalog.set_index("codigo_producto").product_id.to_dict()
    complete = monthly[monthly.complete_for_modeling & monthly.scenario.eq("combined")]

    def panels():
        columns = min(2, len(codes))
        fig, axes = plt.subplots(int(np.ceil(len(codes) / columns)), columns,
                                 figsize=(14, 3.1 * np.ceil(len(codes) / columns)), squeeze=False)
        for ax in axes.flat[len(codes):]:
            ax.set_visible(False)
        return fig, list(axes.flat)

    fig, axes = panels()
    for code, ax in zip(codes, axes):
        g = complete[complete.codigo_producto.eq(code)]
        ax.plot(g.month, g.sales_units, color="#4e79a7", label="VENTA registrada")
        ax.plot(g.month, g.sales_units.rolling(3).mean(), color="#b37828", label="Media móvil 3 meses")
        ax.scatter(g.loc[g.sales_units.eq(0), "month"], g.loc[g.sales_units.eq(0), "sales_units"], color="#c3404d", s=10)
        ax.set(title=f"{labels[code]} · {code}", ylabel="Unidades / mes", ylim=(0, None))
        ax.tick_params(axis="x", rotation=20)
        ax.legend(fontsize=8)
    fig.suptitle("Ventas registradas: meses interiores de cobertura provisional; escalas propias")
    save(fig, "portfolio_monthly_sales", config)

    profiles = tables["demand_profiles"].query("scenario == 'combined'").set_index("codigo_producto").reindex(codes)
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(labels.values(), profiles.zero_fraction * 100, color="#4e79a7")
    for i, row in enumerate(profiles.itertuples()):
        ax.text(i, row.zero_fraction * 100 + 1, f"{row.zero_periods}/{row.usable_months} meses\nracha {row.longest_zero_run_months}", ha="center", fontsize=10)
    ax.set(ylabel="Meses sin ventas registradas (%)", ylim=(0, 105), title="Frecuencia de ceros y mayor racha mensual por producto")
    save(fig, "portfolio_intermittency", config)

    fig, axes = panels()
    p = tables.get("backtest_predictions", pd.DataFrame())
    if len(p):
        for code, ax in zip(codes, axes):
            g = p[p.codigo_producto.eq(code) & p.scenario.eq("combined") & p.phase.eq("holdout")]
            if g.empty:
                ax.set_title(f"{labels[code]} · historial insuficiente")
                continue
            selected = g[g.selected]
            naive = g[g.model.eq("naive")]
            ax.plot(selected.target_month, selected.actual, color="#1c1028", marker="o", label="VENTA observada")
            ax.plot(selected.target_month, selected.predicted, color="#4e79a7", label=selected.model.iloc[0])
            ax.plot(naive.target_month, naive.predicted, color="#b37828", ls="--", label="Último mes")
            ax.set(title=f"{labels[code]} · seis orígenes finales", ylabel="Unidades / mes", ylim=(0, None))
            ax.tick_params(axis="x", rotation=20)
            ax.legend(fontsize=8)
        save(fig, "portfolio_holdout", config)
    else:
        plt.close(fig)

    inventory = tables["inventory_pressure"].set_index("codigo_producto").reindex(codes)
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(labels.values(), inventory.bookkeeping_units_over_trailing12_monthly_sales, color="#4e79a7")
    ax.set(ylabel="Saldo / venta mensual media de 12 meses", title="Inventario alineado al último mes interior de cada producto")
    save(fig, "portfolio_inventory", config)

    if "production_scenarios" in tables:
        g = tables["production_scenarios"].query("status == 'hypothetical_production_scenario' and demand_factor == 1 and assumed_available_production_days == 1").copy()
        if g.empty:
            return  # Missing planning inputs are not zero production bars.
        g = g.sort_values("assumed_units_per_production_day").drop_duplicates(["codigo_producto", "assumed_safety_stock_months"])
        g["Producto"] = g.codigo_producto.map(labels)
        fig, ax = plt.subplots(figsize=(10, 5))
        sns.barplot(data=g, x="Producto", y="suggested_production_units", hue="assumed_safety_stock_months", ax=ax)
        ax.set(ylabel="Unidades de producción supuestas", title="Un día asignado: seguridad de cero o un mes; ritmo inferior reportado")
        ax.legend(title="Meses de seguridad")
        save(fig, "portfolio_production", config)

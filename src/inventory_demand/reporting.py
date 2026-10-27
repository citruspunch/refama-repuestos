"""Generate numerical findings directly from computed tables, never fabricated prose values."""

import pandas as pd

from .config import Config, PRODUCTS


def table(df: pd.DataFrame, columns=None) -> str:
    data = df[columns].copy() if columns is not None else df.copy()
    for col in data.select_dtypes(include=["datetime64[ns]"]):
        data[col] = data[col].dt.strftime("%Y-%m-%d")
    return data.fillna("—").to_markdown(index=False, floatfmt=".3f")


def write_quality_report(tables: dict, transactions: pd.DataFrame, config: Config):
    issues = tables["quality_checks"]
    quality = tables["quality_reference_reconciliation"]
    inventory = tables["inventory_summary"]
    covered = tables["coverage"]
    nonzero = issues[issues.flagged_rows.gt(0)]
    text = f"""# Data quality and provenance

Analysis as of **{config.as_of}**. Customer names are intentionally absent from public outputs.

## Sources and reconciliation

{table(tables['source_reconciliation'])}

The consolidated Kardex is used once; individual files are independent cross-checks, not appended copies.
All five source CSVs are preserved byte-for-byte. SHA-256 hashes and row counts are in
[`../artifacts/source_manifest.json`](../artifacts/source_manifest.json).
The original source columns and strings are retained in `data/private/validated_transactions.csv`;
the public transaction export removes customer names, document numbers, and extraction free text.

- Transactions preserved: **{len(transactions):,}**. Analysis exclusions: **{int((~transactions.analysis_eligible).sum())}**.
- Independent monthly-reference matches: **{int(tables['monthly_reconciliation'].matches_reference.sum())}/{len(tables['monthly_reconciliation'])}** product-months, including both boundaries.
- Previously flagged issues matched to transactions: **{int(quality.reference_matched.sum())}/{len(quality)}**.
- Balance equation checks with an independently preceding recorded balance: **{int((~transactions.first_product_row).sum())}**;
  discrepancies: **{int(transactions.balance_discrepancy.sum())}**.
- First-row implied opening balances: {transactions.loc[transactions.first_product_row, ['codigo_producto', 'implied_opening_balance']].to_dict('records')}.
  These are inferred from the first movement, not independent confirmation of opening stock.

## Nonzero flags (rows can have multiple flags)

{table(nonzero)}

All checks, including zero-count checks, appear in `tables/quality_checks.csv`.
Field-level blanks for **every CSV**, source/parsed dtypes, chronological ordering, numeric parsing,
PDF-date consistency, product/type/Refama domains, quantity signs, direction, sequence collisions,
same-day order, duplicate candidates, document gaps, and source balance flags are validated.
Unexpected mandatory schema discrepancies or disagreements between source files stop the pipeline.
Invalid core records also stop analysis rather than silently turning missing demand into zero.

## Date coverage and inventory warnings

{table(inventory, ['codigo_producto','first_valid_date','last_valid_date','movements','negative_movement_balances','zero_movement_balances','ending_recorded_balance'])}

{table(covered[~covered.complete_for_modeling], ['codigo_producto','month','coverage_start','coverage_end','coverage_status'])}

Only interior calendar months are **provisionally** treated as fully observed: {covered.groupby('codigo_producto').complete_for_modeling.sum().to_dict()}.
Starting and terminal months are unconfirmed, even when the last transaction falls in an already-ended calendar month.
Last movement date is **not** a report coverage endpoint. Interior completeness is also an assumption,
not a proven absence of missing pages, missing movements, or business closure.
Zero filling inside this range means *no recorded VENTA*, not verified zero unconstrained demand.
Calendar growth is suppressed if either comparable period is a boundary or the denominator is zero.
Yearly/quarterly growth is computed only for full comparable calendar periods.

## Interpretation and possible forecasting effects

- Negative balances can reconcile arithmetically while remaining physically impossible; delayed entry,
  extraction omissions, or accounting conventions require source verification.
- Zero after a movement can be intraday only. Daily closing balances take the **last PDF-ordered movement**,
  then forward-fill only between first and last recorded dates. Forward-filled availability is uncertain.
- Purchases, opening stock, production, returns, and adjustments stay separate. Only `VENTA.salida` is gross
  outgoing recorded sales. Returns are not silently netted into sales. Initial `COMPRA` entries explicitly
  labeled opening inventory are separated from genuine purchasing receipts.
- Repeated quantities/customer/date combinations are review candidates, not duplicates proven by that key.
  Different documents and changing balances can support legitimate repetition. **No duplicates or extremes removed.**
- Reconstructed long names and encoding artifacts mostly affect identity/concentration analysis, not the
  observed quantities. Customer concentration uses raw labels; spelling variants/branches may split one entity.
- Adjustment magnitudes at or above median interior monthly sales are contextual anomalies. Receipts or
  adjustments that restore a depleted ledger are not evidence of supplier lead time or unrecorded retail demand.
- RUJAF is the manufacturer/wholesaler; Refama operates retail stores. `venta_a_refama` identifies RUJAF
  shipments to that retail business, not consumer sell-through. Non-fiscal dispatch documents are reported
  but their legal/accounting treatment and completeness are unverified; no tax treatment is endorsed.
- Anomaly flags and STL are retrospective EDA only. They never modify targets or train preprocessing.

Detailed evidence: `tables/anomalies.csv`, `tables/recorded_low_stock_periods.csv`,
`tables/source_missingness.csv`, `tables/parsed_schema.csv`, `tables/quality_reference_reconciliation.csv`,
`tables/monthly_reconciliation.csv`, and the public movement export.
"""
    (config.root / "reports" / "data_quality.md").write_text(text, encoding="utf-8")


def write_findings(tables: dict, config: Config):
    summaries = tables["sales_summary"]
    combined = summaries[summaries.scenario.eq("combined")]
    trend = tables["trend"]
    season = tables["seasonality"]
    selections = tables["selected_models"]
    comparison = tables["model_comparison"]
    forecasts = tables["next_history_month_forecasts"]
    inventory = tables["inventory_summary"]
    live_month = (pd.Timestamp(config.as_of).to_period("M") + 1).strftime("%B %Y")
    clipped = forecasts[forecasts.nonnegative_clipped]
    if len(clipped):
        clip_table = table(clipped, ["codigo_producto", "scenario", "target_month", "raw_forecast_units",
                                     "forecast_units", "units_already_in_unconfirmed_boundary"])
        clipping_warning = f"""**Extrapolation failure warning:** the following raw predictions are negative and
clipped to zero. Positive recorded target-boundary sales directly contradict treating these point values
as zero demand. These are inadmissible-for-operations outputs, **not evidence of zero underlying demand**.

{clip_table}

The locked choices and holdouts remain reported honestly; these observed failures are not hidden by
retuning on final outcomes. Raw predictions, clipping flags, and simple next-history-month reference
forecasts are exported for audit. Confirmed-new-month data and new prospective evaluation are required
before deployment."""
    else:
        clipping_warning = "No selected next-history-month forecast required nonnegative clipping; this alone does not establish deployment readiness."
    best_holdout = comparison[comparison.scenario.eq("combined") & comparison.phase.eq("holdout")
                              & comparison.all_origins_successful].sort_values("mae").groupby("codigo_producto").first().reset_index()
    lines = [f"""# RUJAF manufacturing, finished-goods inventory and wholesale forecasting

Reproducible historical analysis as of **{config.as_of}**, with a business-context update.
Historical quantities and errors remain in units; the estimated-revenue scenario amounts in section 13 (units x precio_venta_neto_tras_descuento) are GTQ and are not historical real revenue.

## Scope and evidence

**RUJAF manufactures and wholesales automotive components; Refama operates retail stores.** The Kardex
belongs to RUJAF. Sales to Refama are RUJAF shipments supplying the retail business, not consumer sell-through.
The three streams remain `refama` (shipments to Refama), `other` (sales to other customers), and `combined`
(total recorded RUJAF outgoing VENTA). Combined actuals equal the two disjoint streams, counted once.

The combined target remains a useful provisional RUJAF finished-goods planning target because both channels
draw from its stock. It measures recorded wholesale fulfillment, not unconstrained orders, all inventory outflows,
or retail consumption. Maintain channel diagnostics; independent forecasts do not automatically reconcile.
Future Refama POS sales should inform retail replenishment via branch stock/transfer reconciliation, **not be
added to RUJAF shipments** for the same units. Returns and non-sale movements stay separate.

Non-fiscal dispatch documents are reported. Their legal/accounting treatment is unverified; reconcile their
physical movements to the Kardex using unique documents without duplication. This analysis neither endorses
their tax treatment nor includes tax avoidance as an optimization objective.
No actual savings, verified lost sales, confirmed manufacturing capacity/lead times, or optimal policy is estimated.
Original report prose is preserved in `history/pre_rujaf_update/`; original numerical tables, models, figures,
executed notebook, raw datasets and tests remain intact. Section 13 adds a separately labeled provisional layer.

There are {int(inventory.movements.sum()):,} preserved movements, independently reconciled to the two product CSVs.
All reconstructed product-month totals match the preliminary reference, which is not used as the modeling source.
Boundary months are excluded; interior months remain provisionally complete, not independently verified.
See [data quality](data_quality.md) for all flags and their forecasting consequences.

## 1–2. Historical sales and direction

{table(combined, ['codigo_producto','all_observed_sales_units','all_sales_transactions','complete_months','monthly_mean','monthly_median','monthly_std','monthly_min','monthly_max'])}

Totals include unconfirmed boundaries; monthly moments and models use only interior months.

![Monthly sales by scenario](figures/monthly_sales_scenarios.png)
![Rolling trend and variability](figures/rolling_trend_variability.png)

Trend model: OLS of `log1p(monthly recorded sales)` on time with HAC(3) standard errors.
False-discovery-rate q-values use Benjamini–Hochberg across all six product/scenario tests.
These are exploratory conditional associations, not identified causes or guaranteed future growth rates.

{table(trend[trend.scenario.eq('combined')], ['codigo_producto','estimated_monthly_change','slope_ci_low','slope_ci_high','hac_slope_q_bh','kendall_tau','first_12_mean','last_12_mean','last_12_vs_first_12'])}

`estimated_monthly_change` is a fraction on the log1p-sales scale; confidence limits are log slopes.
Comparable YTD totals use the same January-to-latest-interior-month window in every included year:

{table(tables['comparable_ytd'][tables['comparable_ytd'].scenario.eq('combined')])}
"""]
    for code, label in PRODUCTS.items():
        tr = trend[trend.codigo_producto.eq(code) & trend.scenario.eq("combined")].iloc[0]
        se = season[season.codigo_producto.eq(code) & season.scenario.eq("combined")].iloc[0]
        su = combined[combined.codigo_producto.eq(code)].iloc[0]
        direction = "decreasing" if tr.log1p_slope < 0 else "increasing"
        support = "supported by this exploratory trend test" if tr.hac_slope_q_bh < .05 else "not statistically resolved by this trend test"
        share = summaries[summaries.codigo_producto.eq(code) & summaries.scenario.eq("refama")].all_observed_sales_units.iloc[0] / su.all_observed_sales_units
        lines.append(f"**{label} — {code}:** the fitted trajectory is {direction} ({support}; q={tr.hac_slope_q_bh:.4g}). "
                     f"The last 12-month average is {tr.last_12_vs_first_12:+.1%} versus the first 12. "
                     f"Refama accounts for {share:.1%} of all recorded VENTA units. "
                     f"Monthly CV={su.monthly_cv:.2f}, ADI={su.adi:.2f}, CV² on positive months={su.cv2_positive_periods:.2f}: "
                     f"the conventional monthly demand-shape label is **{su.demand_class}**.\n")
    lines.append(f"""
Sales contributions and concentration (customer identity never published):

{table(summaries, ['codigo_producto','scenario','all_observed_sales_units','monthly_mean','monthly_cv','zero_periods','top_5_orders_share','top_10pct_orders_share','top_customer_share'])}

![Customer segments](figures/customer_segment_contributions.png)
![Sales/order distributions](figures/sales_distributions.png)
![Order concentration](figures/order_concentration.png)

## 3. Is seasonality statistically credible?

{table(season[season.scenario.eq('combined')], ['codigo_producto','annual_harmonic_hac_p','harmonic_q_bh','acf_lag_12','acf12_ci_low','acf12_ci_high','stl_seasonal_strength_descriptive','years_per_calendar_month_min','years_per_calendar_month_max'])}

The annual harmonic test includes a trend and uses HAC(3), then FDR adjustment across six series.
ACF is computed after linear detrending of log1p sales; its intervals are approximate and not a
multiple-lag test. STL uses period 12 and robust fitting; its in-sample seasonal strength is descriptive,
**not** a significance test. Only roughly four annual cycles are available. A single peak year or large
STL component cannot establish a stable business season. Inspect cross-year consistency and seasonal-naive
out-of-sample results before operational use.
""")
    for code, label in PRODUCTS.items():
        se = season[season.codigo_producto.eq(code) & season.scenario.eq("combined")].iloc[0]
        evidence = "There is exploratory annual-harmonic evidence" if se.harmonic_evidence_after_fdr else "There is no FDR-significant annual-harmonic evidence"
        acf_support = se.acf12_ci_low > 0 or se.acf12_ci_high < 0
        lines.append(f"- **{label}:** {evidence} (q={se.harmonic_q_bh:.4f}); lag-12 ACF={se.acf_lag_12:.3f} "
                     f"({'outside' if acf_support else 'inside'} its approximate zero-including confidence range). "
                     "Stable operational seasonality is not established by this short sample alone.\n")
    lines.append(f"""
![Calendar heatmap](figures/calendar_heatmap.png)
![Seasonal consistency](figures/seasonal_profiles.png)
![Quarterly profile](figures/quarterly_seasonality.png)
![ACF](figures/autocorrelation.png)
![STL](figures/stl_decomposition.png)

Quarterly profiles use only complete calendar quarters (`tables/quarter_seasonality_profile.csv`);
these raw profiles retain the long-term trend and are descriptive, not an additional seasonality test.

## 4–7. Variability, anomalies, availability, and product differences

Monthly ADI is total periods / positive-sale periods. CV² uses only positive periods (sample variance).
The conventional ADI=1.32 and CV²=0.49 shape thresholds are descriptive heuristics, not proof of a
particular stochastic process. Aggregation changes these labels: many zero-sales days do not imply
intermittent *monthly* sales. Neither classification resolves demand censored by unavailable stock.

{table(tables['daily_intermittency'])}

{table(inventory, ['codigo_producto','ending_recorded_balance','minimum_recorded_balance','maximum_recorded_balance','negative_movement_balances','zero_movement_balances','eod_zero_days','eod_negative_days','eod_low_stock_days','carried_forward_days','non_sale_outgoing'])}

Zero movement balances and zero EOD days differ because replenishment can occur later on the same day.
Forward-filled balances assume no unrecorded movements, and negative days undermine physical-stock inference.
There are **indications of possible availability-related sales censoring**, not a measurable lost-sales total:
zero/low ledgers can coincide with unmet demand, but missing transaction times, backorders, and availability
logs prevent identification. Recorded sales may understate demand. Continued sales after small/negative
balances could also reflect timing or accounting problems, not confirmed stockout behavior.

{table(tables['availability_association'], ['codigo_producto','months_nonpositive_eod','mean_sales_exposed','mean_sales_not_exposed'])}

Aligned recent inventory pressure (historical stock/sales ratios, not guaranteed future coverage):

{table(tables['inventory_pressure'], ['codigo_producto','last_interior_month','aligned_closing_balance','trailing_12_mean_sales','bookkeeping_units_over_trailing12_monthly_sales','trailing12_eod_nonpositive_days','trailing12_eod_low_stock_days'])}

Product A's latest interior recorded stock is large relative to recent sales, while Product B's is small.
The recent Product A decline is **not explained by observed recent nonpositive EOD balances**; no such
days are recorded in its trailing 12 interior months. That does not rule out unrecorded availability
constraints, channel changes, or data omissions. Product B's near-depleted ledger merits prompt physical
stock and pending-order reconciliation, not an automatic claim of lost sales.

Anomalies retained, by category (one event can trigger several flags):

{table(tables['anomalies'].groupby(['codigo_producto','type','classification']).size().reset_index(name='flags'))}

Large wholesale orders can be legitimate and forecast-relevant. Adjustment outflows are not sales.
The missing document and repeated business keys are source-review candidates, not grounds for deletion.
Exploratory change-point searches use a max-split statistic on trend residuals, minimum 12 months per side,
and a circular moving-block bootstrap (block length 3; {config.bootstrap_repetitions} draws), then FDR:

{table(tables['change_points'][tables['change_points'].scenario.eq('combined')])}

Change dates are candidates for investigation only; no unverified causal business story is attached.
Different unit scales, transaction sizes, customer mixes, and inventory paths make product-specific models
more defensible than assuming the two products share one process. With only two SKUs, no pooled model is
claimed superior. Weekly/daily models are deferred: sparse events and uncertain stock availability add noise.

![Inventory and supply](figures/inventory_and_supply.png)
![Growth with calendar comparability](figures/calendar_growth.png)

## 8–9. Forecasting and whether ML improves on baselines

Thirteen fixed candidates: historical mean; 3-/6-month means; naive; seasonal naive; linear regression;
ridge; ETS level, damped trend, additive seasonality; SARIMA(1,0,0)(1,0,0,12) with intercept;
shallow random forest; shallow gradient boosting. No parameter search or neural network is justified
by this sample. Regression uses seven predeclared predictors: lags 1/2/3, lagged 3-month mean, time index,
and month sine/cosine. Standardization is fitted inside each training fold. Other engineered features,
including lagged inventory, are exported but not included by default because the ledger is uncertain.

Each series starts with {config.initial_train_months} months, then expands monthly. Earlier origins choose
the simplest model within {config.practical_tie_fraction:.0%} of best validation MAE. The most recent
{config.holdout_months} complete months are evaluated **only after** selection. Candidates are fixed before
either stage; holdout rankings are diagnostics, not a second model-selection round. Holdout refits may use
earlier holdout actuals as they become available, representing one-step rolling deployment, not a six-step
forecast issued at one fixed origin. Failures are logged; incomplete-origin candidates cannot be selected.

{table(selections, ['codigo_producto','scenario','model','best_raw_mae_model','selected_validation_mae','validation_start','validation_end','holdout_start','holdout_end','n_validation','n_holdout'])}

Bias = forecast minus actual (positive means overforecast). WAPE and bias_pct are fractions; zero total
actuals give undefined WAPE, not zero. MASE uses each origin's training-only mean absolute lag-1 difference;
constant training histories have undefined scale. All forecasts are clipped to nonnegative units.
""")
    rows = []
    for code in PRODUCTS:
        selected = selections[selections.codigo_producto.eq(code) & selections.scenario.eq("combined")].model.iloc[0]
        rows.append(comparison[comparison.codigo_producto.eq(code) & comparison.scenario.eq("combined")
                               & comparison.model.isin({selected, "naive", "seasonal_naive"})])
    lines.append(table(pd.concat(rows), ["codigo_producto", "phase", "model", "mae", "rmse", "wape", "bias", "mase", "mae_skill_vs_naive", "mae_skill_vs_seasonal_naive"]))
    for code, label in PRODUCTS.items():
        cv = comparison[comparison.codigo_producto.eq(code) & comparison.scenario.eq("combined") & comparison.phase.eq("validation") & comparison.all_origins_successful]
        best_ml = cv[cv.model.isin({"linear_regression", "ridge", "random_forest", "gradient_boosting"})].sort_values("mae").iloc[0]
        best_simple = cv[cv.model.isin({"naive", "seasonal_naive", "moving_average_3", "moving_average_6", "historical_average"})].sort_values("mae").iloc[0]
        chosen = selections[selections.codigo_producto.eq(code) & selections.scenario.eq("combined")].model.iloc[0]
        hold = comparison[comparison.codigo_producto.eq(code) & comparison.scenario.eq("combined") & comparison.phase.eq("holdout")]
        hchosen = hold[hold.model.eq(chosen)].iloc[0]
        hnaive = hold[hold.model.eq("naive")].iloc[0]
        lines.append(f"\n**{label}:** lowest ML validation MAE={best_ml.mae:.2f} ({best_ml.model}); "
                     f"lowest simple-baseline MAE={best_simple.mae:.2f} ({best_simple.model}). "
                     f"The locked choice is **{chosen}**. Final holdout MAE={hchosen.mae:.2f} versus naive {hnaive.mae:.2f} "
                     f"({hchosen.mae_skill_vs_naive:+.1%} MAE skill). "
                     "A six-origin holdout and regime change do not establish a reliable deployment advantage.\n")
    lines.append(f"""
Paired MAE differences (positive means selected model improves), exploratory 95% moving-block bootstrap intervals:

{table(tables['paired_baseline_comparison'][tables['paired_baseline_comparison'].scenario.eq('combined')])}

Small samples and selection bias limit these intervals; they are not proof of superior production performance.
All six series, all candidates, and both stages are in `tables/model_comparison.csv`; residual tests,
fit warnings, failed origins, and heuristic interval coverage are also exported.
`tables/performance_stability.csv` separates early/late halves of each evaluation stage without
using these diagnostics to reselect a winner. The numerically lowest holdout MAE methods are
{dict(zip(best_holdout.codigo_producto, best_holdout.model))} (see comparison chart); these are
retrospective rankings, not replacements silently chosen after seeing the test outcomes.
Independent scenario forecasts may not sum to the combined forecast; their coherence gap is explicitly reported.

![Model comparison](figures/model_comparison.png)
![Actual vs predicted](figures/actual_vs_predicted.png)
![Residuals](figures/residual_analysis.png)

## Next-history-month forecasts, not live {live_month} forecasts

{table(forecasts, ['codigo_producto','scenario','model','forecast_origin','target_month','forecast_units','lower80_heuristic','upper80_heuristic','units_already_in_unconfirmed_boundary'])}

{clipping_warning}

Combined-sales simple reference forecasts (not newly selected or live forecasts):

{table(tables['next_history_baseline_forecasts'][tables['next_history_baseline_forecasts'].scenario.eq('combined')], ['codigo_producto','model','target_month','forecast_units'])}

These are full-month predictions issued at the last defensibly usable historical origin. Actual partial
boundary sales are shown for context only, never used as future features or as full-month test outcomes.
The next real calendar month as of this analysis is **{live_month}**; a validated one-step live forecast
is blocked by unconfirmed September/October coverage. No partial month was inflated, imputed as complete,
or silently skipped to pretend the model is current. Refresh and confirm coverage before live use.
The bands use finite-sample quantiles of the selected model's earlier validation absolute errors;
they are **heuristic**, selection-dependent, and not guaranteed calibrated under the observed demand change.

![Scenario forecasts](figures/forecast_scenarios.png)

## 10. What can already be concluded about inventory?

- Preserve operation types and distinguish opening inventory from new supply.
- Audit negative balances, large adjustments, and depletion/replenishment sequences before treating
  bookkeeping availability as physical stock. Separate the Refama channel from other outgoing sales.
- Forecasting must adapt to changing recorded sales rather than extrapolate a global mean without validation.
- A reproducible policy interface can already calculate inventory position, reorder point, and order-up-to
  targets once missing inputs are supplied. The new manufacturing interface (section 13) adds production
  quantities, good-unit rates, available days, due-dated open orders, restrictions, batches and storage caps.

Retrospective **hypothetical** (s,S) examples use aligned recorded balances, forecast estimates,
lead times 0.5/1/2 months, service level 95%, review coverage 1 month, and assumed zero on-order/backorders.
Uncertainty is estimated from earlier validation errors; independent Gaussian monthly increments and
square-root-time scaling are unverified. This is not a validated achieved-service or optimal policy.
Product A's selected zero forecast has failed the above sanity check; its scenario arithmetic is retained
only as a preserved legacy purchasing-interface demonstration and must not drive production or purchasing.
It is not the new RUJAF production plan. All scenarios are blocked from live use.

{table(tables['inventory_scenarios'], ['codigo_producto','forecast_target_month','observed_bookkeeping_balance','estimated_forecast_units','assumed_lead_time_months','reorder_point_units','order_up_to_units','suggested_order_units','status'])}

Policy: inventory position = on hand + on order − backorders; ROP = forecast × lead + z × error_std × √lead;
S = forecast × (lead + review) + z × error_std × √(lead + review). If position ≤ ROP, order up to S,
rounded to packs and subject to optional MOQ/cap/budget constraints. Explicit safety stock may override
the Gaussian approximation. Monthly mean-rate arithmetic is a scenario approximation, not known intramonth timing.

![Hypothetical inventory scenarios](figures/hypothetical_inventory_scenarios.png)

## 11. What cannot yet be concluded?

True retail/end-customer demand; exact lost sales; actual stockout duration; real supplier/production lead
times; optimal service levels; economically optimal reorder parameters; causal reasons for declining sales;
reliable long-range seasonality; expected deployment accuracy; achieved service or **actual financial savings**.
Falling recorded sales can combine market changes, customer ordering changes, supply constraints, or reporting
changes. The data cannot identify which explanation is correct.

The legacy purchasing financial interface still returns `blocked_missing_cost_inputs`. The manufacturing
interface separately returns `blocked_missing_manufacturing_cost_inputs`. Reported Q2.50/Q12.00/Q15.00/Q2.50/Q100.00 values
are confirmed `precio_venta_neto_tras_descuento` (net selling prices after discounts) and do not clear either gate. Synthetic tests verify arithmetic, not business savings.

## 12. Additional data and next steps (in priority order)

1. **Remaining provenance:** the RUJAF manufacturing / Refama retail relationship is confirmed. Still confirm
   stock ownership/location, transfer versus invoiced-sale definitions, SKU/unit-of-measure crosswalk,
   all branches/channels, and dispatch-to-Kardex reconciliation. Obtain qualified legal/accounting review
   of non-fiscal documents; do not assume their tax treatment is correct.
2. **Coverage confirmation:** PDF report start/end/as-of dates, full pages, all movements, corrected source
   records, current through-October ledgers, closure calendars, canceled/voided documents, and explanations
   for negative balances/large adjustments/encoding and missing-document flags.
3. **Unconstrained demand and availability:** transaction timestamps, physical stock checks, exact stockout
   start/end, backorders/unfilled inquiries/lost orders, substitutions, cancellations, returns linked to sales,
   customer/branch identifiers with consistent private normalization, and final Refama sell-through if retail
   demand is the desired target.
4. **Replenishment operations:** purchase/production order placement dates, promised dates, actual receipt
   dates **linked by order**, partial receipts, supplier/item-specific lead-time distributions, open pipeline,
   actual production days and calendars, sustainable/shared production capacity, materials/yield/setup times,
   minimum batches and packs. Reported 800/210 units per production day are operating-rate scenario inputs,
   not observed daily production or established capacity. Receipt dates alone cannot identify lead time.
5. **Policy and constraints:** current decision rules and order history, physical on-hand at a common cutoff,
   reserved stock/backorders, desired cycle-service or fill-rate definition, budget/storage constraints, and
   promotions/customer contracts or exceptional bulk orders known at forecast issuance.
6. **Costs and financial comparison:** the five reported amounts are classified `precio_venta_neto_tras_descuento`
   (A Q2.50, B Q12.00, C Q15.00, D Q2.50, E Q100.00); they are not manufacturing costs, margins or savings.
   Obtain dated actual manufacturing (including avoidable versus fixed components), purchase and landed costs in GTQ (or specified
   currency), storage/capital/insurance/obsolescence costs with time units, ordering/setup costs, defensible
   shortage/lost-margin costs, and terminal stock values. A complementary estimated-revenue scenario may multiply
   sold or forecast units by the net price, but it is not historical real revenue because price variations over
   the whole period are unknown. Compare policies on identical horizons, initial
   inventories/pipelines, service assumptions, and demand paths. Reduced production is not savings without
   accounting for unmet demand, eventual sales and ending inventory; timing/spend differences are not verified benefits.
7. After corrections, rerun the unchanged temporal split, audit segment/combined coherence, gather new months
   for genuine prospective evaluation, calibrate uncertainty, and only then test cost-aware policies against
   the documented current policy. Do not retune repeatedly on this final holdout and still call it untouched.
""")
    if "production_scenarios" in tables:
        lines.append(production_update_section(tables))
    (config.root / "reports" / "final_report.md").write_text("\n".join(lines), encoding="utf-8")


def production_update_section(tables: dict) -> str:
    validity = tables["forecast_validity"]
    comparison = tables["forecast_safeguard_comparison"]
    notes, stream_notes = [], []
    for code, label in PRODUCTS.items():
        streams = tables["rujaf_demand_streams"][tables["rujaf_demand_streams"].codigo_producto.eq(code)].set_index("scenario")
        stream_notes.append(f"- **{label}:** last-12 versus first-12 mean shipments change "
                            f"{streams.loc['refama', 'last_12_vs_first_12']:+.1%} to Refama, "
                            f"{streams.loc['other', 'last_12_vs_first_12']:+.1%} to other customers, "
                            f"{streams.loc['combined', 'last_12_vs_first_12']:+.1%} overall.")
        holdout = comparison[comparison.codigo_producto.eq(code) & comparison.scenario.eq("combined")
                             & comparison.phase.eq("holdout")].set_index("strategy")
        old = holdout.loc["original_locked"]
        guarded = holdout.loc["provisional_guarded_ma3_v1"]
        notes.append(f"- **{label}:** combined holdout diagnostic MAE {old.mae:.2f} locked → {guarded.mae:.2f} guarded; "
                     f"bias {old.bias:+.2f} → {guarded.bias:+.2f}; {int(guarded.fallback_origins)} fallback origin(s).")
    diagnostic_notes = "\n".join(notes)
    stream_interpretation = "\n".join(stream_notes)
    return f"""
## 13. RUJAF business update: provisional manufacturing planning

### Three outgoing-demand streams and reported inputs

{table(tables['rujaf_demand_streams'], ['codigo_producto','scenario','demand_stream','all_observed_sales_units','monthly_mean','last_12_mean','last_12_vs_first_12'])}

{stream_interpretation}

The stronger other-customer decline warrants customer/order-mix investigation, not attribution of the
combined decline to Refama consumer consumption. Wholesale order batching and channel timing can change
independently of retail sell-through; these comparisons do not establish causes.

The same declining trajectories, uncertain seasonality, availability caveats and original validation-locked
results remain valid. Product A's Ridge extrapolation fails; B's locked moving average loses to naive on the
holdout. Neither fact justifies a hidden test-based model replacement or a claim of a robust ML advantage.

{table(tables['reported_product_inputs'])}

The values are confirmed net selling prices after discounts (`precio_venta_neto_tras_descuento` in GTQ), not manufacturing costs, margins or profits. They support only complementary estimated-revenue scenarios (units × net price); those estimates are not historical real revenue because price variations over the whole period are unknown. Rates are approximate **per production day**, not daily
production, maximum sustainable capacity, or proof of a feasible joint factory schedule.

### Explicit forecast safeguards and provisional fallback

`forecast_validity.py` rejects nonfinite/negative raw forecasts, clipping, fit failures, and implausible collapse
or spikes relative to the prior three-month mean. Default ratio limits 0.1–3.0 are configurable review heuristics,
not optimized business thresholds. Positive forecasts after three zero months also require review.
Only a failed check activates the fixed three-month moving-average fallback, which must pass the same checks.
A fallback failure blocks production calculations. No target-month actuals enter either decision.
Boundary actuals exceeding a forecast are shown separately as retrospective warnings, not fallback triggers.

{table(validity, ['codigo_producto','scenario','locked_model','locked_forecast_valid','validity_reasons','effective_model','effective_forecast_units','fallback_used','status'])}

The original models, forecasts and historical metrics are unchanged. The new rule is replayed on the **same**
expanding one-step validation/holdout origins using the existing predictions and MAE/RMSE/WAPE/bias/MASE definitions:

{table(comparison[comparison.scenario.eq('combined')], ['codigo_producto','phase','strategy','origins','successful_origins','fallback_origins','mae','rmse','wape','bias','mase'])}

{diagnostic_notes}

The guard can worsen error (see the B/Refama stream in the full comparison CSV); it is not an accuracy optimizer.
In particular, a lower replay MAE can coexist with greater overforecast bias. B's locked total is not replaced
just because naive has lower holdout MAE.

This safeguard was designed after the original results were inspected. This is **post-hoc diagnostic replay,
not new independent test evidence**. It does not establish improved accuracy; prospective evaluation on new
complete months is required. Guarded validation residual dispersion and 80% error bands are heuristic,
selection-dependent and nonstationary. The fallback is a scenario reference, never a production deployment approval.

### Production-aware finished-goods scenarios

Configuration: `scenarios/rujaf_planning.json`; all parameters and the validity rules used are recorded in
`artifacts/rujaf_planning_readiness.json`. Each CSV row also records its exact production inputs as JSON.
Defaults explicitly assume 30 calendar days/month, 7 elapsed days to good-unit receipt, 30 review days,
1 or 5 production days **per SKU**, one-unit batches, zero or one forecast-month of safety stock, no open
orders/backlog/reservations/restrictions and no additional production/storage caps. These are not confirmed
business values. Weekly demand is monthly/30×7, not a validated weekly forecast.

{table(tables['production_scenarios'], ['codigo_producto','balance_cutoff','expected_monthly_outgoing_units','coverage_days','assumed_available_production_days','safety_stock_units','production_trigger_units','surplus_above_target_units','suggested_production_units','estimated_production_days_required','projected_shortage_units','status'])}

Available stock = on hand − disjoint reservations − restrictions. Inventory position adds only open production
due by the planning horizon and subtracts non-overlapping backorders. Coverage excludes pipeline receipts.
The periodic-review trigger/target covers mean demand through **lead + review** plus explicit safety stock.
A separate lead-time alert uses only receipts due by lead time; later pipeline cannot hide early shortages.
Production is rounded to batches and capped by rate×allocated production days,
optional production limits and conservative storage headroom. Later orders cannot erase an immediate shortage;
overdue orders require reconciliation. Outputs also expose shortage before receipt, capacity-limited shortfalls,
and surplus above the target. Runtime = suggested units / scenario good-unit rate, **not** a verified schedule.
Daily rates do not establish materials availability, yield, setups, shared-line feasibility or achievable service.
Coverage is a constant-rate stock/forecast ratio, not a validated long-range demand horizon or guarantee.

These balances are aligned historical bookkeeping stocks, not current physical inventory. Live requests are
blocked, including for stale stock, failed forecasts and unconfirmed constraints; the prototype never grants live
approval. Historical scenarios require explicitly named unverified-stock, retrospective-forecast and constraint assumptions.
See [business assumptions](../docs/business_assumptions.md), [methods](../docs/methodology.md), and
[missing-data checklist](../docs/missing_data_checklist.md).

### Economic interface, with unclassified values kept separate

{table(tables['unclassified_value_scenarios'], ['codigo_producto','balance_cutoff','units','reported_net_unit_value','scenario_net_unit_value','unclassified_reference_amount','currency','status'])}

These multiplications are **estimated-revenue scenarios from net selling prices, not historical real revenue, inventory cost valuations, manufacturing costs, margins or savings**. They refer to the aligned
historical stocks above, not current stock, and price variations over the whole period are unknown. Confirmed manufacturing cost inputs are still missing.
Scenario value overrides are recorded separately and never relabeled as new reported business values.
`ManufacturingCostInputs` and reconciled per-period production ledgers can evaluate manufacturing inventory
value, holding/setup/unmet-demand costs and alternative schedules. Caller-supplied unnecessary-production units
are accepted only as explicit hypothetical scenarios; unsold units are not automatically unnecessary production.
Schedule comparisons require identical demand paths, horizons and opening inventory, and include opening/ending
terminal valuation. Confirm opening pipeline, eventual sales and avoidable versus fixed costs before interpreting
any potential benefit. A production-spend reduction alone is never financial savings. RUJAF's dated current
decisions and real costs are absent, so no verified business savings or optimal production schedule is reported.
"""


def write_business_summary(tables: dict, config: Config):
    text = """# RUJAF update — concise decision summary

1. **What changed:** RUJAF is the manufacturer/wholesaler and the Kardex records concern its operations;
   Refama is retail. The focus is RUJAF finished goods, production requirements and wholesale fulfillment.
   Refama shipments, other-customer sales and their once-counted total remain separate demand streams.
2. **Still valid:** all historical totals, trend/seasonality tests, temporal splits, selected models and
   numerical scores are preserved. Both products decline; stable seasonality and a robust ML advantage
   remain unproven. A's Ridge forecast fails; naive beats B's locked method on the final holdout.
3. **Changed assumptions:** entity identity is no longer unknown. Combined sales are RUJAF's recorded
   shipment target, not retail consumption. Q2.50/Q12.00/Q15.00/Q2.50/Q100.00 are confirmed net selling prices after discounts (`precio_venta_neto_tras_descuento`); 800/210 units per
   production day are reported rates, neither manufacturing costs nor confirmed factory capacity.
   Estimated revenue (units × net price) remains a scenario only, not historical real revenue.
   Non-fiscal dispatch legality/accounting remains unverified; tax avoidance is not an objective.
4. **Implemented now:** configurable forecast checks, a fixed provisional MA3 fallback, and a separately
   labeled post-hoc replay on the original validation framework; production quantity/runtime, coverage,
   triggers, surplus/shortage, batches, due-dated orders and capacity/storage scenarios; unclassified-value
   exposure and gated manufacturing-cost/schedule-comparison interfaces. No new accuracy claim is made.
5. **Still blocked:** live decisions need refreshed physical stock and complete coverage, valid current
   forecasts, actual production days/calendars, sustainable/shared capacity, lead times, batches, materials,
   yields, restrictions and open orders. Economics need classified values, confirmed dated costs,
   eventual-sales/terminal assumptions and RUJAF's current decisions. No actual savings are established.

Details: [updated final report](final_report.md#13-rujaf-business-update-provisional-manufacturing-planning),
[assumptions](../docs/business_assumptions.md), [missing data](../docs/missing_data_checklist.md).
Original report prose is archived in `history/pre_rujaf_update/`; numerical files remain in place and are
hashed in `../artifacts/historical_results_manifest.json`. Reproduce the additive update without refitting:

```bash
.venv/bin/python scripts/run_pipeline.py --business-update-only
.venv/bin/python -m pytest -q
```
"""
    (config.root / "reports" / "rujaf_update_summary.md").write_text(text, encoding="utf-8")

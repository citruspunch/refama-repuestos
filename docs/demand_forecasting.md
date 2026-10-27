# RUJAF demand forecasting and validity safeguards

## Target and unchanged evidence

The target is monthly **RUJAF gross outgoing VENTA units**, separately for Refama shipments, other
customers and the total. This is wholesale fulfillment, not Refama consumer demand or all inventory outflows.
The total remains useful provisionally for finished-goods production. Check coverage, orders and availability
before interpreting it as manufacturing requirements. Keep non-sale movements separately reconciled.

The original numerical evaluation, models and [protocol](methodology.md#forecasting-protocol) are unchanged:
24 initial months, expanding one-step origins, validation-only 5% simplicity tie rule, six final holdout months.
No random split, new search, target edits or silent model replacement was introduced.

- **A:** deterioration remains material (latest comparable YTD −55.6%; last-12 vs first-12 mean −83.9%).
  Ridge holdout MAE 290.19 versus naive 312.33 is not a consistent deployment advantage. The next historical
  raw Ridge forecast is negative and clips to zero despite 325 already-recorded boundary units: a failure.
- **B:** sales also decline (comparable YTD −51.0%; last-12 vs first-12 −51.3%). The locked three-month
  average has holdout MAE 37.33 versus naive 34.17. The naive result does not authorize retrospective reselection.
- Seasonal evidence is inconsistent: A's exploratory harmonic q≈0.014 does not establish stable operational
  seasonality alongside ACF/seasonal-naive performance; B has no comparable harmonic evidence. No calendar
  production multipliers or seasonal stock builds are justified.
- Simple baselines remain essential. ML has not demonstrated a robust advantage. High relative errors,
  small samples, trend change and availability uncertainty remain limitations.

## New, explicitly provisional rule

`ForecastValidityRules` defaults to the prior 3-month mean and plausibility ratios 0.1–3.0. These are
configurable review limits, not inferred or optimized RUJAF thresholds. `check_forecast` rejects:

1. Missing/nonfinite/negative predictions or raw outputs, clipping and fit failures.
2. Insufficient, negative or nonfinite history.
3. A collapse below 10% or spike above 300% of the recent mean, including zero after positive history.
4. Positive predictions after three zero months (requires review, not automatic restart inference).

For invalid locked outputs only, `guarded_forecast` tries the **fixed** three-month moving average.
It must pass the same checks; otherwise effective demand is unavailable and production is blocked.
A valid original prediction is retained even if naive looked better on the holdout. The original raw/clipped
forecast, model and reasons remain visible. No partial-boundary actual enters the validity decision or fallback.
Boundary exceedances are retrospective warnings: an uncertain point estimate being below observed partial
shipments does not by itself prove model invalidity or justify selecting a different model using future data.

## Diagnostic replay, not an accuracy claim

`evaluate_safeguards` uses the existing candidate predictions at **exactly the same training cutoffs and lengths**.
The fallback is the archived MA3 at that origin. Historical choices and `model_comparison.csv` are untouched.
New outputs are:

- `forecast_safeguard_predictions.csv`: original/effective method, reasons, fallback use, actuals and errors.
- `forecast_safeguard_comparison.csv`: locked, guarded, naive and MA3 scores for every product/stream/phase.
  Same MAE/RMSE/WAPE/bias/MASE formulas and fold-local scales. Incomplete successful-origin counts are explicit.
- `forecast_validity.csv`: last usable origin, effective scenario estimate and guarded-validation uncertainty.

The rule was introduced **after inspecting the original results**, so neither validation nor that holdout
is new independent evidence for this rule. Scores are post-hoc diagnostics, including any apparent improvement
or deterioration. Do not retune limits on these tables. Freeze a proposed policy, gather new complete months,
evaluate prospectively and calibrate uncertainty before deployment.

Guarded validation absolute-error quantiles use the existing finite-sample rank rule; insufficient samples
give undefined bands. Selection, nonstationarity and rule design invalidate guaranteed coverage claims.
Independent segment forecasts remain unreconciled; choose one total or a validated reconciled sum, not both.

All historical boundary forecasts remain **not live**. Weekly mean-rate outputs in production planning are
monthly/assumed-days×7, not newly trained weekly forecasts. Failed/stale forecasts cannot authorize action.

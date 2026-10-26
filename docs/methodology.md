# Analytical and validation methods

## Boundaries, provenance, and uncertainty

The reporting endpoint is not supplied. The conservative primary sample excludes both first and last
calendar month per product. Product A: July 2022–August 2026; Product B: July 2022–September 2026.
Interior months remain provisionally complete. Extending the latest date with zeros would invent observations.
The fixed date is October 26, 2026; forecasts from the last usable histories are retrospective, not current.

Balances are checked against previous balance + incoming − outgoing. Matching arithmetic cannot detect
a missing offsetting transaction pair, wrong classification, duplicate source transactions with adjusted
balances, or incorrect physical stock. Daily availability is a bookkeeping reconstruction, not a censoring correction.
No source issue or EDA anomaly is automatically removed or used to edit training targets.

## EDA

- Calendar aggregation from original transactions, not preliminary monthly totals.
- Full observed totals separately from comparable interior-month moments.
- Growth: both numerator/denominator usable; zero baseline means undefined. Full quarter/year comparisons
  only. YTD windows are matched within product; the A/B latest YTD windows differ and must not be conflated.
- Concentration: largest orders and raw-label customer totals, identities never exported. Branch/spelling
  variants make raw-label customer concentration a lower-resolution entity estimate.
- Demand shape: ADI = periods / positive periods; CV² = sample variance / mean² on positive periods.
  ADI 1.32 and CV² 0.49 are conventional descriptive thresholds, not a verified business model.
- Trend: log1p-sales/time OLS, HAC lag 3, plus descriptive Kendall tau. Kendall p-values are unadjusted
  and assume independence more strongly; the reported primary test is HAC with six-series BH adjustment.
- Seasonality: annual sine/cosine jointly tested with trend, HAC lag 3, six-series BH adjustment.
  Approximate detrended ACF intervals and robust STL period 12 complement rather than prove the finding.
  No post-hoc selection of high months is called statistically established seasonality.
- Candidate change point: maximum scaled mean shift in trend residuals, at least 12 months each side.
  Circular moving-block residual bootstrap with length 3 and 1,000 repetitions accounts approximately
  for serial dependence and date search; six-series BH adjustment. The null is a smooth trend, so this
  tests an extra residual level change, not whether any long-run decline exists. Results are exploratory.
- Large sales: product-specific Q3 + 3×IQR; abrupt monthly differences: robust z > 3.5; large adjustments:
  magnitude >= median interior monthly combined sales. All retained. These are retrospective flags only.

## Forecasting protocol

1. Fixed 13 candidates and fixed hyperparameters, no expensive search on ~50 monthly observations.
2. Initial 24-month history. Expanding one-month origins: validation up to before the final six months.
3. Within each series, select simplest candidate within 5% of the best validation MAE. Candidates that fail
   any validation origin are ineligible. The full simplicity ordering is in `forecasting.CANDIDATES`.
4. Only after locking the method, evaluate all fixed candidates on the final six months. Actuals update
   training monthly; this measures one-step rolling forecasts, not a fixed-origin six-step horizon.
5. Refit the locked method on all usable history. Never replace it with the best final-test result without
   declaring that the test is now exhausted and obtaining new prospective data.
6. No real-time `as known then` timestamps exist, so temporal evaluation assumes transactions were available
   by month end. Backdated postings and later PDF corrections could violate that assumption; request posting
   timestamps/versioned extracts before claiming fully deployment-realistic availability.

ML uses lag1/2/3, shifted rolling mean3, time index, and sine/cosine month (7 fields).
Earliest ML origins have 21 usable training rows: intentionally regularized/shallow, still high-variance.
Ridge alpha=10; RF=80 trees, depth3, leaf5, max_features=.8; boosting=40 stumps, leaf5, rate=.04.
Regression StandardScaler is fitted inside every fold. ETS uses optimized level/damped-trend/seasonal-additive
versions; SARIMA is fixed (1,0,0)×(1,0,0,12), intercept, stationary/invertible, 150 optimizer iterations.
Convergence failures are logged rather than silently replaced by a baseline.

### Metrics

For actual `y`, forecast `f`, error `e=f-y`:

- MAE = mean(|e|); RMSE = sqrt(mean(e²)).
- WAPE = sum(|e|)/sum(|y|); undefined if total actual is zero.
- Bias = mean(e); bias fraction = sum(e)/sum(|y|). Positive means overforecast.
- MASE = mean(|e_t| / training-only mean(|y_i-y_(i-1)|)); each origin has its own scale;
  zero scale is undefined. This is nonseasonal MASE, not a seasonal lag12 scale.
- MAE skill against baseline = 1 − model_MAE/baseline_MAE.

Use successful-origin counts when reading metrics: a candidate with failures is not comparable as a
full-origin winner. For selected vs baseline paired differences, positive means improvement; 95% circular
moving-block bootstrap intervals (length3, 1,000 samples) are exploratory, especially with only six test errors.

### Forecast failure and uncertainty

All candidates are clipped to nonnegative units. Raw outputs and clipping counts are retained. For A,
the locked next-history-month ridge forecast becomes zero, contradicted by already-recorded positive partial
sales. This triggers a clear analytical warning, not target rewriting or a hidden test-based switch.
It demonstrates why lowest average backtest error is insufficient for unreviewed live deployment.

80%/95% bands use a finite-sample validation absolute-error order statistic,
rank=ceil((n+1)×coverage). Insufficient calibration samples yield undefined bounds rather than false precision.
These errors also selected the model; nonstationarity and selection make the bands heuristic, not guaranteed
conformal coverage. Observed holdout coverage is reported in `prediction_interval_diagnostics.csv`.
Neither a wide interval nor MASE<1 guarantees useful inventory decisions. Segment models are independent;
the gap between combined forecast and sum of segments is exported, not hidden.

## Preliminary policy and financial interfaces

Typed policy inputs distinguish required observed stock/pipeline data, forecast/error estimates, and named
assumptions. Lead times are in **months**, not days inferred from receipt gaps. The (s,S) calculation uses
constant mean demand and Gaussian independent monthly increments; service level is a hypothetical cycle-
service approximation, not an achieved fill-rate guarantee. Explicit safety stock can override this approximation.
MOQ/pack/max/budget rules flag when the desired target cannot be reached. Demonstration stocks and forecast
origins align; later observed balances never leak into earlier recommendations.

No actual financial simulation is justified without dated costs and operational/demand context. `CostInputs`
and a supplied replay ledger support purchasing/holding/ordering/shortage accounting. `ReplayInputs`
documents readiness for same-demand historical comparisons; it does not pretend censored recorded sales are
unconstrained demand. Synthetic unit tests validate cost arithmetic but are not empirical savings.

## Documentation references

- [scikit-learn: lagged-feature time-series forecasting](https://scikit-learn.org/stable/auto_examples/applications/plot_time_series_lagged_features.html)
- [scikit-learn: Pipeline](https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html)
- [statsmodels: Holt–Winters ExponentialSmoothing](https://www.statsmodels.org/stable/generated/statsmodels.tsa.holtwinters.ExponentialSmoothing.html)
- [statsmodels: SARIMAX](https://www.statsmodels.org/stable/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html)
- [statsmodels: STL](https://www.statsmodels.org/stable/generated/statsmodels.tsa.seasonal.STL.html)
- [statsmodels: robust covariance](https://www.statsmodels.org/stable/generated/statsmodels.regression.linear_model.RegressionResults.get_robustcov_results.html)

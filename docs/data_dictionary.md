# Dataset dictionary

## Source files

`kardex_csv/kardex_consolidado.csv` (1,062 rows) is cross-checked against the 583-row Product A
and 479-row Product B files. They are three views of the same data, not concatenated sources.
`ventas_mensuales_preliminares.csv` has 105 product-month rows; `revision_calidad.csv` has 35 alerts.
Row counts/hashes are computed on every run in `artifacts/source_manifest.json`.

Product A = **UAH-90385-18025**, Hilux leaf-spring urethane. Product B = **48815-14050**,
Hilux stabilizer-bar rubber. Units are recorded component units; packaging conversion has not been verified.

## `data/processed/validated_transactions.csv`

One row per original consolidated movement. No deletion, deduplication, or sales outlier replacement.

| Fields | Meaning |
|---|---|
| `codigo_producto`, `descripcion_producto` | Product code and original description |
| `fecha`, `fecha_pdf`, `raw_fecha` | Parsed date, original PDF-formatted date, original ISO date text |
| `tipo_movimiento` | VENTA / COMPRA / PRODUCCION / AJUSTE / DEVOLUCION C, never pooled as sales |
| `entrada`, `salida`, `saldo`, `raw_*` | Parsed quantities/balance and preserved source text |
| `venta_a_refama` | Original SI/NO grouping flag, not proof of retail demand |
| `pagina_pdf`, `orden_movimiento_pdf`, `source_row` | PDF provenance and original stable ordering |
| `movement_id` | `K` plus original source line number; use for source investigations |
| `is_sale`, `is_refama_sale` | Explicit sales/channel indicators |
| `is_opening_inventory` | Original counterparty label explicitly says opening inventory |
| `previous_balance`, `balance_error` | Previous recorded balance and equation residual; first residual is undefined |
| `implied_opening_balance` | First balance − incoming + outgoing; inferred, not independently observed |
| `monthly_sales_units` | `salida` only for VENTA; zero for other types |
| `analysis_eligible` | All mandatory date/quantity/type/product/Refama-domain/direction checks passed |
| Other boolean fields | Quality/repetition/extraction/encoding/inventory flags; not deletion decisions |

The original names, document numbers, and extraction text are retained only in
`data/private/validated_transactions.csv`. Original CSVs remain untouched. Public quality-reference
tables retain document identifiers when useful for audit but never customer names.

## `daily_recorded_inventory.csv`

Daily calendar rows between each product's first and last valid movement.
`recorded_closing_balance` = last same-day PDF-ordered balance, forward-filled only in range.
`intraday_min_balance` is available only on days with recorded movements; no intraday time is inferred.
`observed_zero_event`/`observed_negative_event` indicate movement-level observations.
`eod_zero`, `eod_negative`, `eod_nonpositive`, and `eod_low_stock` describe reconstructed EOD ledgers.
`movement_observed`, `balance_carried_forward`, and `days_since_last_movement` identify uncertainty.
`sales_units` remains gross recorded VENTA only. Zero-sales dates include unknown closure days.

## `monthly_demand.csv`

Unique key: `codigo_producto`, `scenario`, `month` (calendar month start).
Scenarios: `combined`, `refama`, `other`. Combined actuals equal segment actuals exactly.

- `sales_units`, `sales_transactions`, `units_per_transaction`: recorded VENTA metrics.
- `complete_for_modeling`: true only for provisional interior months.
- `coverage_status`: `interior_provisional` or `boundary_unconfirmed`.
- `coverage_start/end`, `start_boundary/end_boundary`: observed date span and explicit edge status.
- `mom_growth`, `yoy_growth`: fractional changes only when both relevant months are usable and
  the earlier sales denominator is positive. Undefined values stay blank, never forced to zero.
- `purchase_incoming`, `opening_inventory_incoming`, `production_incoming`, `returns_incoming/outgoing`,
  `adjustment_incoming/outgoing`, `all_incoming/outgoing`: separate operation quantities.
- `closing_balance`, `min_recorded_balance`, `eod_nonpositive_days`, `eod_negative_days`,
  `eod_low_stock_days`, `observed_zero_events`, `daily_covered_days`: ledger descriptors.

Inventory columns repeat across the three scenarios because all channels draw on the same ledger.
**Do not sum inventory or supply columns across scenarios.** Raw target-month inventory is not a feature.

## `monthly_features.csv`

Only complete-history monthly rows, plus one next-history-month row with unknown target per series.
`target_sales_units` is the full-month recorded-sales target.
`information_cutoff` = previous calendar month end. Calendar features are known at issuance.

- Lags: 1, 2, 3, 6, 12 months.
- Rolling means and sample standard deviations: 3, 6, 12 months, always **shift before rolling**.
- Historical growth: latest past MoM and YoY ratios, undefined for zero denominator.
- Previous closing balance, nonpositive/low-stock days, transaction count: lagged ledger descriptors.
- Product/scenario identifiers, time index, month/year/quarter, sine/cosine month encoding.

Early lag-related missingness is intentional; it is not imputed using future data.
The fitted models use seven curated fields documented in `features.MODEL_FEATURES`, not every export.
Inventory features are reserved for future reliable-data experiments.

## Forecast and policy outputs

`backtest_predictions.csv`: training cutoff/length, target month, actual, prediction, **raw** prediction,
clipping flag, phase, fixed candidate, fold-local MASE scale, fit warning/failure, locked-choice indicator.
`model_comparison.csv`: MAE/RMSE in units, WAPE/relative bias as fractions, MASE, baseline skill,
successful/total/clipped origins. Partial-origin scores are labeled and ineligible for model selection.
`next_history_month_forecasts.csv`: raw/clipped estimates, target and origin, heuristic uncertainty,
partial-boundary context, warning flags, and explicit false live-availability flag.
`next_history_baseline_forecasts.csv`: simple reference forecasts, **not** revised test-selected winners.
`inventory_scenarios.csv`: aligned recorded inventory and estimated demand plus explicitly named
assumed lead time, service level, review coverage, pending orders/backorders; no actual optimization claim.

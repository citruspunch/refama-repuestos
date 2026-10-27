# Dataset dictionary

The sections below describe the preserved two-product reference. The active five-product experiment
uses the same movement and monthly contracts in `data/experiments/five_products_v1/`. See
[the expansion contract](five_product_expansion.md) for its distinct outputs and interpretation.

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
| `venta_a_refama` | Original SI/NO flag: RUJAF shipments to the Refama retail business, not consumer demand |
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
Scenarios: `refama` = RUJAF shipments to Refama; `other` = RUJAF sales to other customers;
`combined` = total recorded RUJAF outgoing sales. Combined actuals equal segment actuals exactly.
Do not sum all three targets or add downstream POS sales for the same units.

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

## Additive RUJAF outputs (original files above are not replaced)

- `reported_product_inputs.csv`: Q2.50/Q12.00/Q15.00/Q2.50/Q100.00 in `net_unit_value`, classification **precio_venta_neto_tras_descuento** (net selling prices after discounts, not costs/margins/savings);
  800/210 `units_per_production_day` as reported operating rates, **not verified capacity**.
- `rujaf_demand_streams.csv`: historical metrics joined to explicit wholesale-stream definitions;
  no new sales observations or modified totals.
- `forecast_safeguard_predictions.csv`: original locked model/point, validity reasons, effective method/point,
  fallback flag, cutoff/length and actual/error at the original expanding origins. `evaluation_status` is
  post-hoc diagnostic, never independent new test evidence. Actuals do not enter safeguard decisions.
- `forecast_safeguard_comparison.csv`: unchanged metric definitions for locked, guarded, naive and MA3 strategies
  in each original phase; `successful_origins` and `fallback_origins` identify incomplete/replaced predictions.
- `forecast_validity.csv`: effective last-history-month scenario forecast, source model/checks, heuristic guarded
  validation residual standard deviation and 80% bands. `live_recommendation_allowed` is always false.
- `production_scenarios.csv`: explicit historical balance cutoff, effective demand and uncertainty; assumed
  good-unit rate, production days, lead/review days and safety stock; available stock, coverage, trigger, target,
  due-dated pipeline, shortage/surplus, batch/capacity-constrained units and estimated runtime. Undefined zero-
  demand coverage is blank, not infinite guaranteed coverage. `scenario_inputs_json` contains exact inputs;
  all quantities are units or stated calendar/production days. Rows are alternatives, **not quantities to sum**.
- `unclassified_value_scenarios.csv`: aligned historical stock × net selling price (`precio_venta_neto_tras_descuento`) in GTQ,
  labeled estimated-revenue scenario only, never historical real revenue. Original reported values, scenario overrides and override flags remain
  distinct; manufacturing inventory value and actual savings remain unavailable. Price variations over the whole period are unknown.

`artifacts/rujaf_planning_readiness.json` records scenario configuration, validity rules, missing manufacturing
cost inputs and false live-approval status. `artifacts/historical_results_manifest.json` hashes retained
pre-update files; original report prose is archived in `reports/history/pre_rujaf_update/`.

## Five-product additions

- `empresa_documento`, `empresa_kardex`, `pdf_origen`: original provenance, retained in public
  transactions; `empresa_para_el_analisis=RUJAF` in the catalog is an analytical assignment only.
- `TRASLADO`: preserved movement type, excluded from gross VENTA. Monthly
  `transfer_incoming/outgoing` remain separate from production, purchases and sales.
- `zero_quantity_sale`: retained VENTA row with zero `salida`, not an invalid direction or positive sale.
- `product_catalog.csv`: discovered codes, presentation aliases, provenance, reported amount classification,
  minimum/maximum approximate production rate and false manufacturing-cost verification status.
- `demand_profiles.csv`: provisional monthly ADI/CV², zero fraction, zero runs and positive-sale counts.
- `candidate_eligibility.csv`: initial-window cutoff, positive-month count, zero fraction and fixed eligibility.
- `model_readiness.csv`: evaluated or blocked for insufficient temporal history, separately for each stream.
- `model_artifacts.csv`: exact selected artifact filename, method, stream and training cutoff.
- `historical_model_comparison.csv`: old/new common metrics and deltas; not an independent experiment.
- `production_scenarios.csv`: extends the production contract with `variant_id`, `demand_factor`
  and both endpoints when a reported rate is a range. Alternatives are never added together.
- `production_replay.csv`: monthly simulated starting/ending stock, decisions, receipts, served/unserved
  recorded sales and pre-target training cutoff. No actual loss/service/savings claim.
- `production_replay_daily.csv`: daily receipts before withdrawals, simulated EOD stock and unserved
  recorded VENTA. This is another policy, not the observed ledger or latent customer demand.

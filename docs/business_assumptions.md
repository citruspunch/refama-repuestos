# RUJAF business facts and assumption register

## Confirmed scope

- RUJAF manufactures automotive components and distributes finished goods to Refama and other customers.
- Refama operates retail stores. The supplied Kardex concerns RUJAF operations.
- `VENTA` to Refama is RUJAF outgoing wholesale replenishment, **not retail consumer sell-through**.
- The planning focus is RUJAF finished goods, production requirements and wholesale fulfillment.
  Raw materials, work in progress and multi-echelon retail optimization require additional data.

## Reported, not validated as economic or capacity parameters

| SKU | Net unit value | Units per production day | Permitted use now |
|---|---:|---:|---|
| UAH-90385-18025 | Q2.50 | approximately 800 | Explicit scenario reference only |
| 48815-14050 | Q12.00 | approximately 210 | Explicit scenario reference only |

"Net unit value" is unclassified. Do not interpret it as manufacturing cost, sale price, contribution,
profit or terminal inventory value. Currency is quetzales (GTQ); the value's effective date and components
are unknown. The production figures are reported operating rates, not observations for every calendar day,
maximum capacity or guarantees. Actual production days, yield, materials, shared machines, setups and
sustainable throughput are unconfirmed. Never multiply by all calendar days and call that actual output.

Non-fiscal dispatch documents are reported. Legal/accounting treatment, completeness and linkage to
existing movements are unverified. Seek qualified review; this project does not endorse their tax treatment.
Tax avoidance is not an optimization objective. Physical dispatches need unique-key reconciliation regardless
of document type; an unmatched dispatch is not automatically an additional sale.

## Preserved historical analytical assumptions

- Original gross outgoing `VENTA.salida` targets, raw data, returned-goods handling and all metrics remain intact.
- `refama` and `other` are disjoint; `combined = refama + other` in observed data. Both draw on one SKU ledger.
  Never sum inventory across streams. Non-sale outflows require separate planning, not reclassification as sales.
- First/last months remain boundary-unconfirmed. Interior completeness is provisional. Positive or zero
  ledgers are not independently confirmed physical stock; zero recorded sales are not zero unconstrained demand.
- Combined recorded shipments are a defensible **provisional** production-planning target, subject to order
  backlog, censored demand, omitted dispatches and coverage. Customer ordering cadence is not retail seasonality.
- Independent segment forecasts are not automatically additive. Use one total target or an explicitly
  reconciled segment sum, never combined plus its segments. No unvalidated reconciliation was imposed now.
- Future POS sell-through is a different echelon. Reconcile SKU/branch/transfer IDs, retail stock, returns
  and timing; use POS to explain replenishment, not to count the same goods again as RUJAF outgoing demand.

## Explicit scenario assumptions, not new business facts

`scenarios/rujaf_planning.json` records the reproducible defaults. The typed API permits alternatives.

| Parameter | Demonstration assumption |
|---|---|
| Rate | Use the reported rate as good-unit scenario throughput |
| Available production days | 1 or 5 per SKU; **not** a jointly feasible factory schedule |
| Calendar conversion / review | 30 days per month / 30-day review |
| Lead time | 7 elapsed days to good-unit completion/receipt, including processing |
| Batches | 1-unit multiples; zero minimum; no extra maximum production cap |
| Safety stock | 0 or one effective forecast-month; neither is an approved service target |
| Pipeline | Explicit empty open-order list; no backlog |
| Stock restrictions | Zero reserved/blocked stock; no extra storage cap |
| Stock and origin | Last usable historical month-end bookkeeping balance; not current physical stock |
| Uncertainty | Guarded validation residual std and absolute-error bands; not calibrated service guarantees |

All these settings are recorded on each production row and in `artifacts/rujaf_planning_readiness.json`.
Unspecified required numerical inputs block a calculation; unverified categories must be named as assumptions.
Missing stock restrictions are not silently treated as zero by the API. Live use is disabled even if inputs
are supplied. Failed forecasts cannot be used even for production scenarios; a valid explicitly provisional
fallback may be used, with provenance retained.

## Forecast and economic governance

The original validation-locked models remain the historical choices. New validity rules / fixed MA3 fallback
are a **post-hoc scenario safeguard**, not a test-selected replacement. See [forecasting](demand_forecasting.md).
No additional accuracy is asserted. New months are required for prospective assessment.

Unclassified-value multiplication is not inventory valuation. Confirmed manufacturing costs (or separately
labeled synthetic costs) are required for cost accounting. Compare schedules on identical demand, horizon,
opening stock/pipeline and terminal basis; consider unmet demand, eventual sales and fixed-cost avoidability.
Less production or cash spent is not automatically savings. Hypothetical benefits are never verified outcomes.

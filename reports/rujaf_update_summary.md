# RUJAF update — concise decision summary

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

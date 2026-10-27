# Missing-data checklist — RUJAF

## Resolved or reported (do not request as if still unknown)

- [x] RUJAF manufacturing/wholesale versus Refama retail relationship; Kardex scope is RUJAF.
- [x] Reported A/B net values Q2.50/Q12.00 and operating rates approximately 800/210 per production day.
- [x] Existence of some non-fiscal dispatch documents is reported, **not** legal/accounting validation.

## Priority 1 — safe stock and demand interpretation

- [ ] Current, dated physical finished-goods stock by SKU/location; reconcile negative ledgers and adjustments.
- [ ] Reserved, quality-blocked, damaged, consigned and otherwise unavailable units; non-overlapping backlog.
- [ ] Confirm extract endpoints/all pages/all channels, missing/canceled documents and posting timestamps.
- [ ] Link dispatches, invoices, receipts, returns and transfers by unique IDs, including non-fiscal documents;
  detect both omissions and duplicates without inventing sales. Obtain qualified legal/accounting review.
- [ ] SKU/pack/unit conversions and stock ownership/location boundaries.
- [ ] Wholesale orders, requested/promised/fulfilled dates, unfilled quantities, cancellations, substitutions,
  exact availability and physical stockout logs. Recorded fulfillment is not unconstrained demand.
- [ ] If retail data arrives: dated Refama POS sales plus branch inventory, returns and matched transfer IDs;
  do not add POS consumption to the same RUJAF shipments.

## Priority 2 — production feasibility

- [ ] Actual production-day/shift calendar, downtime and observed good output; validate reported rates.
- [ ] Sustainable capacity by SKU/line, shared resources, setup/changeover times, minimum/multiple batches.
- [ ] Materials/BOM, yield/scrap/rework, labor, maintenance and work-in-progress constraints.
- [ ] Production order release/start/completion/receipt timestamps linked by order, including partial receipts;
  real lead-time distributions and whether lead time includes runtime.
- [ ] Open orders' **remaining good units and due dates** at the same stock cutoff; reconcile overdue orders.
- [ ] Storage/max-stock limits, budget restrictions, approved safety stock and service definition.
- [ ] Known contracts, promotions, exceptional wholesale orders and RUJAF's current production decisions.

## Priority 3 — forecasting and economics

- [ ] New complete months beyond the already-inspected holdout; prospective evaluation of safeguard rules.
- [ ] Check current forecasts, regime change and channel coherence; calibrate uncertainty for decision horizons.
- [ ] Define "net unit value": cost/price/other basis, currency, effective date and components. Until then it
  cannot clear the manufacturing-cost gate or support profit/savings claims.
- [ ] Dated actual manufacturing costs, separating avoidable variable costs from fixed/allocated costs.
- [ ] Holding costs per unit/time, capital/space/insurance/obsolescence, setup costs and defensible unmet-demand costs.
- [ ] Eventual-sale/obsolescence assumptions, terminal inventory valuation and actual realized service/outcomes.
- [ ] Comparable RUJAF baseline decisions, identical opening stock/pipeline, horizon and demand paths for replay.

**Release gate:** current physical stock + complete/current demand history + valid prospective forecasts +
confirmed production constraints and pipeline + approved decision process. The implementation currently
permits scenarios only. Financial comparison additionally needs classified actual costs and a defensible baseline;
no verified savings can be reported from the present data.

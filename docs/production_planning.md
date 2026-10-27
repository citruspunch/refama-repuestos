# Production and economic interfaces

## Reproducible scenarios

```bash
.venv/bin/python scripts/run_pipeline.py --business-update-only
.venv/bin/python scripts/run_pipeline.py --business-update-only --planning-scenarios scenarios/rujaf_planning.json
```

The additive path reads existing processed data and evaluation tables, never retrains, and never rewrites
original metric CSVs, model artifacts, source files, notebook or original test XML. It archives original report
prose once and exports a SHA-256 preservation manifest. A full pipeline run also generates the new layer.
Scenario inputs are JSON, not silent defaults for missing business observations. Change a copy to compare
alternatives; preserve prior scenario outputs when retaining multiple runs. No extra dependency is required.

## Typed production API

`inventory.plan_production(ProductionInputs(...))` accepts:

- Effective monthly outgoing-demand estimate and explicit validity flag from the safeguards. Callers are
  responsible for supplying the matching model, history and stock cutoff; a flag alone is not validation evidence.
- Dated on-hand units; separately stated, disjoint reservations, restrictions and non-overlapping backorders.
- Calendar days/month, review days, explicit safety stock and optional monthly error std. Safety stock is not
  inferred from the supplied dispersion; choose it explicitly until a service model is validated.
- `ProductionConstraints`: good units per production day, available/actual production days, total calendar
  lead time to good-unit receipt, batch multiple/minimum, optional maximum production and maximum stock.
- `OpenProductionOrder` tuple: **remaining** good-unit quantity and due date for every open order. An explicit
  empty tuple asserts no pipeline as an assumption; omitted pipeline blocks calculation.
- Named `assumed_fields` for retrospective forecasts, unverified bookkeeping stock and unconfirmed production
  constraints. Default reported rates require such a constraint assumption, not a confirmed-capacity assertion.

Missing required values return `blocked_missing_production_inputs`, no suggestion. Invalid quantities raise
`ValueError`. Failed forecasts return `blocked_invalid_forecast` even for scenarios. Unlabeled uncertainty
about operational inputs returns `blocked_unlabeled_scenario_assumptions`. Overdue orders block pending
reconciliation. Live requests return `blocked_live_planning`; no code path grants deployment approval.
Stale/undated physical stock, a non-current target or unconfirmed constraints are additional live blockers.
Optional caps of `None` must be explicitly recorded as "no cap assumed" in scenarios, not known unlimited capacity.

### Calculation conventions

Let `d = monthly forecast / assumed calendar days per month`, `L = total lead days`, `R = review days`.

1. Available stock = on hand − reserved − restricted. Coverage = max(0, available − backlog) / `d`,
   excluding pipeline; zero demand gives **undefined** coverage, not a guaranteed infinite horizon.
2. Horizon position = available + open production due by `L+R` − backlog. Later orders are excluded.
3. Target/periodic-review trigger threshold = `d×(L+R) + safety stock`. Trigger if horizon position < target;
   this covers demand before the next review, not merely the immediate lead time.
4. Separately, lead-time alert = available + open production due by `L` − backlog ≤ `d×L + safety stock`.
   If production is triggered, desired good units = ceil(max(0, target − position)).
5. Round up to batch/minimum; cap by rate×available production days, optional production cap, and conservative
   storage headroom (max stock − current on hand − receipts due within horizon, without assuming intervening sales).
   Round down to full batches under caps; infeasible minima and inability to reach target are flagged.
6. Runtime = suggested units / scenario good-unit rate. This is fractional production days, not a scheduled
   completion date. Lead time **already includes** processing; it is not automatically added again.
7. Outputs expose demand/week (`d×7`), error dispersion, pre-receipt shortage, horizon shortage with/without new
   production, surplus above target and net projected ending stock. Pipeline timing aggregates do not prove
   absence of an earlier intrahorizon shortage: detailed due-date scheduling and material/resource feasibility
   remain required. A positive suggestion cannot resolve shortages before completion.

These are transparent single-SKU constant-rate periodic-review calculations, **not an optimized factory schedule**.
Coverage is a stock/forecast ratio, not a validated long-range forecast (especially for surplus stocks).
Allocated days are alternatives per SKU, not independent entitlement to shared capacity. Yield/setup/material
constraints require confirmation. Safety stock and error bands do not guarantee achieved cycle service/fill rate.
The preserved `recommend(PolicyInputs)` purchasing arithmetic remains a legacy demonstration, not RUJAF's plan.

## Unclassified-value boundary

`financial.unclassified_value_scenario(units, ReportedProductInputs(...))` returns only a labeled reference
multiplication. Q2.50/Q12.00 are never automatically copied into a manufacturing cost, sale price, terminal
value, margin or profit. Historical reference amounts are not valuations of current stock.

## Manufacturing economics and alternative schedules

`ManufacturingCostInputs` requires dated, confirmed manufacturing cost, holding cost/unit/month, setup cost/batch,
unmet-demand cost/unit, terminal value/unit and currency. `manufacturing_cost_confirmed` is an explicit caller
assertion, not independently verified by code; an unclassified net value cannot justify it. All must be supplied.
Alternatively set `hypothetical=True` with explicitly synthetic/scenario costs, never label them actual RUJAF costs.
Absent inputs return `blocked_missing_manufacturing_cost_inputs`; real savings remain unavailable.

`evaluate_production_costs` accepts one SKU's ordered period ledger with:

`opening_inventory_units`, `produced_units`, `fulfilled_demand_units`, `unmet_demand_units`,
`ending_inventory_units`, `average_inventory_units`, `months`, `batches`.

Inventory must reconcile (opening + production − fulfilled = ending) and remain continuous across periods.
Opening pipeline is not inferred: represent receipts consistently in both ledgers and validate externally.
Other movements need separate reconciled treatment before using this simplified ledger.

- Manufacturing spend = produced units × confirmed/scenario manufacturing cost.
- Holding = Σ(average inventory × months) × holding cost; setup = batches × setup cost. Optional
  `average_excess_inventory_units` (bounded by average total stock) separates declared excess holding cost;
  the code does not classify all inventory as excess automatically.
- Unmet-demand cost is supplied explicitly; recorded sales cannot estimate lost orders by themselves.
- Ending finished-goods manufacturing value = ending units × manufacturing cost.
- Terminal-adjusted cost = spend + holding + setup + unmet cost + opening terminal basis − ending terminal value.
- Optional `assumed_unnecessary_production_units` is accepted **only for hypothetical analysis**, bounded by
  production and ending units. It estimates exposure, not verified waste or recoverable savings; units may sell later.

`compare_production_schedules` rejects different demand paths (fulfilled + unmet), period horizons or opening
stocks. Both schedules use the same cost/terminal basis, explicitly account for unmet demand and ending inventory,
and return a **potential** cost difference separately from a spend difference. This simplified economic ledger
still requires validation of eventual sales, shared capacity, initial pipeline, terminal valuation, lost-margin
assumptions and avoidable versus allocated fixed costs. It is not a validated optimization result.

RUJAF's actual dated production decisions are absent. `baseline_is_actual_decisions` only describes a supplied
baseline; it cannot verify outcomes. Every interface keeps `actual_savings=None`. Do not claim hypothetical
benefits as verified savings or assume producing fewer units saves money regardless of service and future sales.

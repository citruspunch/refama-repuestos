# Data quality and provenance

Analysis as of **2026-10-26**. Customer names are intentionally absent from public outputs.

## Sources and reconciliation

| file                   |   source_rows |   consolidated_rows | multiset_equal   |   only_individual |   only_consolidated | same_product_order   |
|:-----------------------|--------------:|--------------------:|:-----------------|------------------:|--------------------:|:---------------------|
| kardex_90385-18025.csv |           583 |                 583 | True             |                 0 |                   0 | True                 |
| kardex_48815-14050.csv |           479 |                 479 | True             |                 0 |                   0 | True                 |

The consolidated Kardex is used once; individual files are independent cross-checks, not appended copies.
All five source CSVs are preserved byte-for-byte. SHA-256 hashes and row counts are in
[`../artifacts/source_manifest.json`](../artifacts/source_manifest.json).
The original source columns and strings are retained in `data/private/validated_transactions.csv`;
the public transaction export removes customer names, document numbers, and extraction free text.

- Transactions preserved: **1,062**. Analysis exclusions: **0**.
- Independent monthly-reference matches: **105/105** product-months, including both boundaries.
- Previously flagged issues matched to transactions: **35/35**.
- Balance equation checks with an independently preceding recorded balance: **1060**;
  discrepancies: **0**.
- First-row implied opening balances: [{'codigo_producto': '48815-14050', 'implied_opening_balance': 0.0}, {'codigo_producto': 'UAH-90385-18025', 'implied_opening_balance': 0.0}].
  These are inferred from the first movement, not independent confirmation of opening stock.

## Nonzero flags (rows can have multiple flags)

| check                       |   flagged_rows | action                                        |
|:----------------------------|---------------:|:----------------------------------------------|
| missing_document            |              1 | retain and investigate; no automatic deletion |
| extraction_flag             |             33 | retain and investigate; no automatic deletion |
| text_encoding_issue         |             47 | retain and investigate; no automatic deletion |
| repeated_business_candidate |             12 | retain and investigate; no automatic deletion |
| negative_balance            |              2 | retain and investigate; no automatic deletion |
| zero_balance                |             10 | retain and investigate; no automatic deletion |
| adjustment_requires_context |             23 | retain and investigate; no automatic deletion |

All checks, including zero-count checks, appear in `tables/quality_checks.csv`.
Field-level blanks for **every CSV**, source/parsed dtypes, chronological ordering, numeric parsing,
PDF-date consistency, product/type/Refama domains, quantity signs, direction, sequence collisions,
same-day order, duplicate candidates, document gaps, and source balance flags are validated.
Unexpected mandatory schema discrepancies or disagreements between source files stop the pipeline.
Invalid core records also stop analysis rather than silently turning missing demand into zero.

## Date coverage and inventory warnings

| codigo_producto   | first_valid_date   | last_valid_date   |   movements |   negative_movement_balances |   zero_movement_balances |   ending_recorded_balance |
|:------------------|:-------------------|:------------------|------------:|-----------------------------:|-------------------------:|--------------------------:|
| 48815-14050       | 2022-06-02         | 2026-10-23        |         479 |                            0 |                        5 |                        44 |
| UAH-90385-18025   | 2022-06-02         | 2026-09-23        |         583 |                            2 |                        5 |                      5567 |

| codigo_producto   | month      | coverage_start   | coverage_end   | coverage_status      |
|:------------------|:-----------|:-----------------|:---------------|:---------------------|
| 48815-14050       | 2022-06-01 | 2022-06-02       | 2022-06-30     | boundary_unconfirmed |
| 48815-14050       | 2026-10-01 | 2026-10-01       | 2026-10-23     | boundary_unconfirmed |
| UAH-90385-18025   | 2022-06-01 | 2022-06-02       | 2022-06-30     | boundary_unconfirmed |
| UAH-90385-18025   | 2026-09-01 | 2026-09-01       | 2026-09-23     | boundary_unconfirmed |

Only interior calendar months are **provisionally** treated as fully observed: {'48815-14050': 51, 'UAH-90385-18025': 50}.
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

# Kardex inventory sales analysis

Implemented and executed university ML project for two automotive components in Guatemala.
It validates the transaction ledger, reconstructs three sales scenarios, performs exploratory
analysis, compares 13 forecasting methods with temporal backtests, and demonstrates **hypothetical**
inventory policies. It does **not** establish Refama retail demand or actual financial savings.

## Results and deliverables

- **[Final numerical report](reports/final_report.md)** — findings, visualizations, model results,
  limitations, and the exact additional data required.
- **[Data quality report](reports/data_quality.md)** — provenance, reconciliation, flags, coverage.
- **[Executed EDA notebook](notebooks/01_exploratory_analysis.ipynb)** — independently re-executable.
- [`reports/tables/`](reports/tables/) and [`reports/figures/`](reports/figures/) — computed CSV tables and PNGs.
- [`data/processed/`](data/processed/) — customer-free validated transactions, daily recorded inventory,
  monthly demand, and strictly lagged forecasting features.
- [`artifacts/`](artifacts/) — selected models, source SHA-256 manifest, environment metadata,
  and financial-readiness status. Pickle artifacts are local trusted files; never load untrusted pickles.

### Main findings

| | Product A: UAH-90385-18025 | Product B: 48815-14050 |
|---|---:|---:|
| All-observed gross `VENTA` units | 66,423 | 6,437 |
| Sales transactions | 513 | 434 |
| Provisional interior months | 50 | 51 |
| Interior monthly mean / standard deviation | 1,278.76 / 1,186.11 | 121.33 / 58.70 |
| Latest comparable 2026 YTD vs 2025 | −55.6% (Jan–Aug) | −51.0% (Jan–Sep) |
| Refama share of all recorded sales | 5.6% | 37.2% |
| Validation-locked combined-sales method | Ridge regression | 3-month moving average |
| Final six-month holdout MAE | 290.19 | 37.33 |
| Naive holdout MAE | 312.33 | 34.17 |
| Selected-method holdout WAPE | 93.2% | 60.4% |

Both recorded-sales trajectories decline. Product A is more variable and bulk-order-heavy.
Annual-harmonic evidence exists for A (FDR q=0.014), but lag-12 autocorrelation and forecasting
results do not establish reliable operational seasonality; B has no comparable harmonic evidence.
Machine learning has **not demonstrated a robust advantage over simple baselines**.
Relative errors remain large; these are exploratory forecasting results, not deployment-ready accuracy.

**Critical warning:** Product A's locked ridge model extrapolates below zero at the next historical
origin; the reported nonnegative point forecast is zero even though the partial target month already
contains 325 units. This is a documented model failure, not zero demand, and must not drive purchases.
The best holdout method differs from the validation-locked choice; we do not silently reselect on test data.

All 1,062 movements reconcile arithmetically, but two negative balances, 10 zero-balance events,
23 adjustments, and uncertain availability require investigation. Zero ledger stock is not proven lost sales.
The RUJAF–Refama commercial relationship remains unconfirmed.

## Reproduce

Tested with **Python 3.12.14**. The raw files must remain in `kardex_csv/` under their original names.
No source file is overwritten. Run from the repository root:

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements-lock.txt
.venv/bin/python scripts/run_pipeline.py --execute-notebook
.venv/bin/python -m pytest -q
```

Without `uv`, use Python's standard `venv` and `pip`:

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python scripts/run_pipeline.py --execute-notebook
```

`requirements.txt` installs compatible dependency ranges; `requirements-lock.txt` pins the exact
tested environment, also recorded in `artifacts/run_metadata.json`. On a different OS/Python version,
use the ranged file if exact wheels are unavailable and record the changed environment. Tiny numerical
optimizer differences are possible across BLAS/platforms. Fixed ML/bootstrap seeds are 42.

```bash
# Quality, cleaned data, features, EDA only:
.venv/bin/python scripts/run_pipeline.py --eda-only
# Full pipeline without figure regeneration:
.venv/bin/python scripts/run_pipeline.py --skip-figures
# Re-execute the notebook using this interpreter, without retraining:
.venv/bin/python scripts/run_pipeline.py --notebook-only
# Installed CLI is equivalent:
.venv/bin/kardex-demand --execute-notebook
```

The fixed analysis date is **2026-10-26**, configurable with `--as-of YYYY-MM-DD`.
Changing `--as-of` is a future-date validation check, **not** an automatic historical as-of extraction:
earlier cutoffs reject future-dated rows rather than silently truncating the ledger. For a true historical
replay, provide an appropriately filtered, coverage-confirmed extract in a separate root.
The notebook independently repeats EDA with the default analysis date and only reads forecasting results.
An EDA-only run does not refresh previously generated model outputs; use a full run before publishing.

## Coverage and interpretation rules

1. **Sales = `tipo_movimiento == VENTA`, quantity = `salida`.** Purchases, production, opening stock,
   returns, and adjustments are separate. Returns are not netted into the gross-sales target.
2. `combined`, `refama`, and `other` are separate scenarios. `venta_a_refama` is used only on sales.
   Customer names do not appear in public tables, charts, or notebook outputs.
3. Consolidated data is authoritative for processing; individual files cross-check it. The preliminary
   monthly file is reconciliation-only. No repeated/extreme transaction is removed.
4. Movement order = product, parsed date, original PDF movement sequence, stable source row.
   Initial stock is not an observed purchase. The first balance has no independently observed predecessor.
5. Both first and last product months are **boundary-unconfirmed** and excluded. Interior months are
   provisionally complete; absent sales within them mean no *recorded* sales, not verified zero demand.
6. Daily EOD balances use the last ordered movement and carry forward only inside observed date ranges.
   Low stock means recorded balance between 0 and 10 units, a descriptive configurable threshold,
   not a known business reorder point. Negative stock is tracked separately.
7. All forecasting predictors use information strictly before the target month. The final six complete
   months are untouched for selection; expanding one-month origins update on actuals as they arrive.
8. Model selection uses validation MAE and a predeclared 5% practical tie band favoring simpler methods.
   Final holdout rankings are reported, not used to reselect. No random train/test split is used.
9. Forecasts target the month following the latest **usable** history (A: September 2026; B: October 2026).
   They are retrospective boundary forecasts, **not live November 2026 predictions**. Unconfirmed
   September/October coverage must be resolved before issuing a defensible live one-step forecast.
10. Inventory examples use explicitly assumed lead times and zero pending orders/backorders.
    Cost evaluation remains blocked without costs; hypothetical scenarios are never called actual savings.

## Project structure

```text
kardex_csv/                         preserved raw CSVs; private/ignored
src/inventory_demand/
  config.py                        fixed, explicit analysis choices
  data.py                          schemas, source loading and reconciliation
  cleaning.py                      quality flags, daily stock, monthly sales
  eda.py                           descriptive metrics, trend/seasonality, anomalies
  visualization.py                 customer-free PNG figures
  features.py                      strictly lagged forecasting datasets
  forecasting.py                   baselines, regression, ETS/SARIMA, shallow trees
  evaluation.py                    expanding origins, selection, holdout, diagnostics
  inventory.py                     typed (s,S) policy and hypothetical scenarios
  financial.py                     future cost/replay interfaces; missing-input gates
  reporting.py                     evidence-generated Markdown reports
  pipeline.py                      raw-to-output orchestration and CLI
scripts/run_pipeline.py
tests/                             data, leakage, models, policy, cost, output checks
notebooks/01_exploratory_analysis.ipynb
data/private/                      full validated records; private/ignored
data/processed/                    customer-free analysis-ready exports
reports/{tables,figures}/
artifacts/
```

## Data and model interfaces

See [data dictionary](docs/data_dictionary.md) and [methods](docs/methodology.md).
To add confirmed lead times, pending orders, constraints, or real costs, supply the typed
`PolicyInputs`, `PurchasingConstraints`, and `CostInputs` interfaces. Missing lead time/pipeline
or uncertainty inputs block a policy recommendation; missing real costs block financial evaluation.
An explicit safety stock can replace the unvalidated Gaussian approximation.

Next priorities: confirm entity/coverage, reconcile physical stock and adjustments, link order placement
to receipts, collect true unfulfilled demand and current policy decisions, and obtain dated real costs.
Then collect new complete months for prospective validation before deploying or estimating savings.

**Privacy:** do not publish `kardex_csv/` or `data/private/`. Public exports remove customer identities
but remain commercially sensitive and are not a legal guarantee of anonymization. Review sharing permissions.

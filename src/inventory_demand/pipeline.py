"""CLI: reproducible raw-to-report execution with separate data, EDA, and model stages."""

import argparse
import importlib.metadata
import json
import platform
import sys
from pathlib import Path

import pandas as pd

from .cleaning import (anonymize_transactions, clean_transactions, match_quality_reference,
                       monthly_datasets, reconcile_monthly, reconstruct_daily)
from .business_update import preserve_historical_results, update_existing_results, write_planning_outputs
from .config import Config
from .data import load_sources
from .eda import run_eda
from .evaluation import run_backtests, scenario_coherence
from .features import build_features
from .financial import CostInputs, ReplayInputs, evaluate_costs
from .inventory import inventory_scenarios
from .reporting import write_business_summary, write_findings, write_quality_report
from .visualization import plot_eda, plot_models


def save_tables(tables: dict, config: Config):
    for name, frame in tables.items():
        frame.to_csv(config.tables / f"{name}.csv", index=False)


def execute_notebook(config: Config):
    import nbformat
    from nbclient import NotebookClient
    from jupyter_client import KernelManager
    notebook_path = config.root / "notebooks" / "01_exploratory_analysis.ipynb"
    nb = nbformat.read(notebook_path, as_version=4)
    # Force this interpreter, not an unrelated global Jupyter environment.
    km = KernelManager(kernel_name="python3", transport="ipc")
    km.kernel_spec.argv = [sys.executable, "-m", "ipykernel_launcher", "-f", "{connection_file}"]
    client = NotebookClient(nb, timeout=300, km=km,
                            resources={"metadata": {"path": str(config.root)}})
    try:
        client.execute()
    finally:
        # An explicitly supplied manager is caller-owned; nbclient will not close it.
        if km.has_kernel:
            km.shutdown_kernel(now=True)
        if client.kc is not None:
            client.kc.stop_channels()
    nbformat.write(nb, notebook_path)


def run(config: Config, eda_only: bool = False, figures: bool = True, scenario_path: Path | None = None) -> dict:
    if (config.tables / "model_comparison.csv").exists():
        preserve_historical_results(config)
    config.prepare()
    sources, source_checks = load_sources(config)
    transactions, checks = clean_transactions(sources["kardex_consolidado.csv"], config)
    transactions.to_csv(config.private / "validated_transactions.csv", index=False)
    anonymize_transactions(transactions).to_csv(config.processed / "validated_transactions.csv", index=False)
    tables = {"quality_checks": checks, "source_reconciliation": source_checks}
    tables["source_missingness"] = pd.DataFrame([
        {"file": name, "column": col, "source_dtype": str(frame[col].dtype), "rows": len(frame),
         "blank_values": int(frame[col].str.strip().eq("").sum())}
        for name, frame in sources.items() for col in frame])
    tables["parsed_schema"] = pd.DataFrame([
        {"column": col, "parsed_dtype": str(transactions[col].dtype), "missing_values": int(transactions[col].isna().sum())}
        for col in transactions])
    tables["quality_by_product"] = transactions.groupby("codigo_producto")[[
        "missing_document", "extraction_flag", "text_encoding_issue", "negative_balance", "zero_balance",
        "balance_discrepancy", "source_date_reversal", "source_order_reversal", "repeated_business_candidate"]].sum().reset_index()
    tables["quality_reference_reconciliation"] = match_quality_reference(transactions, sources["revision_calidad.csv"])
    save_tables(tables, config)
    if not transactions.analysis_eligible.all():
        raise ValueError("Core-invalid movements preserved and reported. Resolve before inferring monthly zero sales or fitting models.")
    daily = reconstruct_daily(transactions, config)
    monthly, coverage = monthly_datasets(transactions, daily)
    tables["coverage"] = coverage
    tables["monthly_reconciliation"] = reconcile_monthly(monthly, sources["ventas_mensuales_preliminares.csv"])
    daily.to_csv(config.processed / "daily_recorded_inventory.csv", index=False)
    monthly.to_csv(config.processed / "monthly_demand.csv", index=False)
    build_features(monthly).to_csv(config.processed / "monthly_features.csv", index=False)
    print(f"Validated {len(transactions):,} movements; reconstructed {len(coverage)} product-months.", flush=True)
    tables.update(run_eda(transactions, daily, monthly, config))
    save_tables(tables, config)
    write_quality_report(tables, transactions, config)
    if figures:
        plot_eda(monthly, transactions, daily, tables, config)
    print("EDA and quality outputs written.", flush=True)
    if not eda_only:
        tables.update(run_backtests(monthly, config))
        tables["scenario_forecast_coherence"] = scenario_coherence(tables["next_history_month_forecasts"])
        tables["inventory_scenarios"] = inventory_scenarios(monthly, tables["next_history_month_forecasts"], tables["backtest_predictions"])
        save_tables(tables, config)
        write_planning_outputs(monthly, tables, config, scenario_path or config.root / "scenarios" / "rujaf_planning.json")
        if figures:
            plot_models(monthly, tables, config)
        write_findings(tables, config)
        write_business_summary(tables, config)
        financial_status = {"cost_evaluation": evaluate_costs(pd.DataFrame(), CostInputs()),
                            "policy_replay_readiness": ReplayInputs().readiness(), "actual_savings": None}
        (config.root / "artifacts" / "financial_readiness.json").write_text(json.dumps(financial_status, indent=2), encoding="utf-8")
        print("Temporal backtests, model artifacts, hypothetical policies, and final report written.", flush=True)
    metadata = {"config": config.serializable(), "python": platform.python_version(),
                "packages": {name: importlib.metadata.version(name) for name in
                    ("pandas", "numpy", "scipy", "matplotlib", "seaborn", "scikit-learn", "statsmodels", "nbformat", "nbclient")},
                "command": "python scripts/run_pipeline.py" + (" --eda-only" if eda_only else ""),
                "modeling_target": "recorded gross outgoing VENTA units, not retail demand",
                "live_forecast_available": False}
    (config.root / "artifacts" / "run_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return tables


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Config().root)
    parser.add_argument("--as-of", default=Config().as_of)
    parser.add_argument("--eda-only", action="store_true")
    parser.add_argument("--skip-figures", action="store_true")
    parser.add_argument("--execute-notebook", action="store_true")
    parser.add_argument("--notebook-only", action="store_true")
    parser.add_argument("--business-update-only", action="store_true", help="Use archived evaluation; do not retrain or rewrite historical numerical outputs")
    parser.add_argument("--planning-scenarios", type=Path, help="Explicit production scenario JSON; default scenarios/rujaf_planning.json")
    args = parser.parse_args()
    config = Config(root=args.root.resolve(), as_of=args.as_of)
    if args.business_update_only:
        if args.eda_only or args.notebook_only or args.execute_notebook:
            parser.error("--business-update-only cannot run EDA or execute the preserved notebook")
        metadata = json.loads((config.root / "artifacts" / "run_metadata.json").read_text(encoding="utf-8"))
        if args.as_of != metadata["config"]["as_of"]:
            parser.error("Archived evaluation date cannot change in a business-only update; use a separate confirmed extract")
        update_existing_results(config, args.planning_scenarios or config.root / "scenarios" / "rujaf_planning.json")
        print("RUJAF interpretation, diagnostic safeguards, and scenario-only production planning updated; historical metrics unchanged.", flush=True)
        return
    if not args.notebook_only:
        run(config, eda_only=args.eda_only, figures=not args.skip_figures, scenario_path=args.planning_scenarios)
    if args.execute_notebook or args.notebook_only:
        execute_notebook(config)
        print("Exploratory notebook executed successfully.", flush=True)


if __name__ == "__main__":
    main()

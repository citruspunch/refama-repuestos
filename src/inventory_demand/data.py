"""Read-only source ingestion, schema validation, and independent-file reconciliation."""

import hashlib
import json
from collections import Counter

import pandas as pd

from .config import Config, REQUIRED_COLUMNS


def read_source(path) -> pd.DataFrame:
    # Keep strings, document prefixes, blanks, and leading zeroes intact.
    return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")


def load_sources(config: Config) -> tuple[dict[str, pd.DataFrame], pd.DataFrame]:
    sources, manifest = {}, []
    for path in sorted(config.raw.glob("*.csv")):
        frame = read_source(path)
        sources[path.name] = frame
        manifest.append({"file": f"kardex_csv/{path.name}", "rows": len(frame),
                         "columns": len(frame.columns),
                         "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
        if path.name.startswith("kardex_"):
            missing = set(REQUIRED_COLUMNS) - set(frame.columns)
            if missing:
                raise ValueError(f"{path.name}: missing columns {sorted(missing)}")
    required = {"kardex_consolidado.csv", "kardex_90385-18025.csv",
                "kardex_48815-14050.csv", "ventas_mensuales_preliminares.csv",
                "revision_calidad.csv"}
    if required - sources.keys():
        raise FileNotFoundError(f"Missing inputs: {sorted(required - sources.keys())}")
    reference_schemas = {
        "ventas_mensuales_preliminares.csv": {"codigo_producto", "mes", "unidades_venta",
            "unidades_venta_a_refama", "unidades_venta_otros", "cantidad_operaciones_venta"},
        "revision_calidad.csv": {"codigo_producto", "fecha", "documento", "tipo_alerta",
                                  "detalle", "pagina_pdf"},
    }
    for name, columns in reference_schemas.items():
        if columns - set(sources[name]):
            raise ValueError(f"{name}: missing reference columns")
    (config.root / "artifacts" / "source_manifest.json").write_text(
        json.dumps(manifest, indent=2), encoding="utf-8")
    consolidated = sources["kardex_consolidado.csv"]
    checks = []
    for name in ("kardex_90385-18025.csv", "kardex_48815-14050.csv"):
        original = sources[name]
        codes = original.codigo_producto.unique()
        subset = consolidated[consolidated.codigo_producto.isin(codes)]
        rows = lambda df: Counter(df[list(REQUIRED_COLUMNS)].itertuples(index=False, name=None))
        left, right = rows(original), rows(subset)
        checks.append({"file": name, "source_rows": len(original),
                       "consolidated_rows": len(subset), "multiset_equal": left == right,
                       "only_individual": sum((left - right).values()),
                       "only_consolidated": sum((right - left).values()),
                       "same_product_order": original[list(REQUIRED_COLUMNS)].reset_index(drop=True).equals(
                           subset[list(REQUIRED_COLUMNS)].reset_index(drop=True))})
    checks = pd.DataFrame(checks)
    if not checks.multiset_equal.all():
        raise ValueError("Individual and consolidated Kardex disagree; resolve before analysis.")
    # These are copies of the same movements, not three independent datasets to concatenate.
    return sources, checks

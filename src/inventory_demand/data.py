"""Read-only source ingestion, schema validation, and independent-file reconciliation."""

import hashlib
import json
from collections import Counter
from pathlib import Path

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


def movement_multiset(frame: pd.DataFrame, columns=REQUIRED_COLUMNS) -> Counter:
    return Counter(frame[list(columns)].itertuples(index=False, name=None))


def load_product_bundle(config: Config, bundle: Path, ledger_name: str | None = None):
    """One authoritative ledger; every other extract is a cross-check, never an append.

    Product count is discovered. An explicit filename is preferable for future extracts;
    otherwise the largest consolidated ledger must contain every smaller extract exactly.
    """
    paths = sorted(bundle.glob("*.csv"))
    sources = {path.name: read_source(path) for path in paths}
    ledgers = {name: frame for name, frame in sources.items() if name.startswith("kardex_")}
    if not ledgers:
        raise FileNotFoundError(f"No Kardex files in {bundle}")
    for name, frame in ledgers.items():
        missing = set(REQUIRED_COLUMNS) - set(frame)
        if missing:
            raise ValueError(f"{name}: missing columns {sorted(missing)}")
        if frame.codigo_producto.str.strip().eq("").any():
            raise ValueError(f"{name}: blank product code")
    if ledger_name is None:
        candidates = [name for name in ledgers if "consolidado" in name]
        if not candidates:
            raise ValueError("Specify one authoritative consolidated ledger")
        ledger_name = max(candidates, key=lambda name: (len(ledgers[name]), name))
    if ledger_name not in ledgers:
        raise FileNotFoundError(f"Authoritative ledger not found: {ledger_name}")
    ledger = ledgers[ledger_name]
    checks = []
    # The previous two-SKU extracts are independent checks of unchanged original rows.
    reference_paths = []
    for path in config.raw.glob("kardex_*.csv"):
        if path.parent == bundle:
            continue
        original = read_source(path)
        shared = original[original.codigo_producto.isin(ledger.codigo_producto.unique())]
        if len(shared):
            # A different bundle need not include A/B. Check unchanged legacy rows only
            # for products it actually contains, rather than requiring the old SKU set.
            sources[f"legacy/{path.name}"] = shared
            reference_paths.append(path)
    for name, frame in sources.items():
        if not (name.startswith("kardex_") or name.startswith("legacy/kardex_")) or name == ledger_name:
            continue
        subset = ledger[ledger.codigo_producto.isin(frame.codigo_producto.unique())]
        columns = list(REQUIRED_COLUMNS) + [c for c in ("empresa_kardex", "empresa_documento", "pdf_origen")
                                             if c in frame and c in ledger]
        left, right = movement_multiset(frame, columns), movement_multiset(subset, columns)
        checks.append({"file": name, "source_rows": len(frame), "consolidated_rows": len(subset),
                       "multiset_equal": left == right, "only_individual": sum((left - right).values()),
                       "only_consolidated": sum((right - left).values())})
    reconciliation = pd.DataFrame(checks)
    if len(reconciliation) and not reconciliation.multiset_equal.all():
        raise ValueError("Individual, historical or consolidated Kardex disagree; no records were appended")

    reference_names = [name for name in sources if name.startswith("ventas_mensuales_")]
    if len(reference_names) != 1:
        raise ValueError("Exactly one preliminary monthly reference is required in the bundle")
    catalog = product_catalog(ledger, sources.get("datos_reportados_productos.csv"))
    verification_path = bundle / "verificacion_kardex.json"
    verification = verify_product_reference(ledger, json.loads(verification_path.read_text(encoding="utf-8"))) if verification_path.exists() else pd.DataFrame()
    manifest_paths = paths + reference_paths + ([verification_path] if verification_path.exists() else [])
    relative = lambda p: str(p.relative_to(config.root)) if p.is_relative_to(config.root) else str(p)
    manifest = {"authoritative_ledger": relative(bundle / ledger_name),
                "deduplication": "No concatenation or row deletion; multiset reconciliation including multiplicity",
                "products": len(catalog), "movements": len(ledger),
                "files": [{"file": relative(p), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                          for p in manifest_paths]}
    config.artifacts.mkdir(parents=True, exist_ok=True)
    (config.artifacts / "source_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return ledger, sources[reference_names[0]], catalog, reconciliation, verification


def product_catalog(ledger: pd.DataFrame, reported: pd.DataFrame | None) -> pd.DataFrame:
    """Metadata is data-driven. Letters are display aliases, not model/processing keys."""
    aliases = {"UAH-90385-18025": "A", "48815-14050": "B", "UAH-33505-35020": "C",
               "90385-18046": "D", "17881-54820": "E"}
    rows = []
    for code, g in ledger.groupby("codigo_producto", sort=False):
        row = {"codigo_producto": code, "product_id": aliases.get(code, code),
               "descripcion_producto": g.descripcion_producto.iloc[0], "empresa_para_el_analisis": "RUJAF",
               "movements": len(g)}
        for col in ("empresa_documento", "empresa_kardex", "pdf_origen"):
            values = g[col].unique() if col in g else []
            if len(values) > 1:
                raise ValueError(f"Conflicting provenance for {code}: {col}")
            row[col] = values[0] if len(values) else "not_reported"
        rows.append(row)
    catalog = pd.DataFrame(rows)
    if reported is None:
        catalog["nombre_producto"] = catalog.descripcion_producto
        catalog["clasificacion_monto"] = "not_reported"
        for col in ("monto_reportado_gtq", "produccion_aproximada_diaria_min", "produccion_aproximada_diaria_max"):
            catalog[col] = float("nan")
        catalog["rate_status"] = "not_reported"
        catalog["manufacturing_cost_verified"] = False
        return catalog
    required = ("codigo_producto", "nombre_producto", "monto_reportado_gtq", "clasificacion_monto",
                "produccion_aproximada_diaria_min", "produccion_aproximada_diaria_max")
    if set(required) - set(reported) or reported.codigo_producto.duplicated().any():
        raise ValueError("Reported product inputs require unique product keys and the documented schema")
    reported = reported[list(required)].copy()  # Do not export source free text.
    numeric = ["monto_reportado_gtq", "produccion_aproximada_diaria_min", "produccion_aproximada_diaria_max"]
    for col in numeric:
        reported[col] = pd.to_numeric(reported[col], errors="raise")
    import numpy as np
    if not np.isfinite(reported[numeric]).all().all() or reported[numeric].lt(0).any().any():
        raise ValueError("Reported amounts and rates must be finite and nonnegative")
    if (reported.produccion_aproximada_diaria_min.le(0) |
            reported.produccion_aproximada_diaria_max.lt(reported.produccion_aproximada_diaria_min)).any():
        raise ValueError("Reported production rate range must be positive and ordered")
    catalog = catalog.merge(reported, on="codigo_producto", how="left", validate="one_to_one")
    catalog["rate_status"] = "reported_approximation_NOT_constant_output_or_verified_maximum"
    catalog.loc[catalog.produccion_aproximada_diaria_min.isna(), "rate_status"] = "not_reported"
    catalog["clasificacion_monto"] = catalog.clasificacion_monto.fillna("not_reported")
    catalog["manufacturing_cost_verified"] = False
    return catalog.sort_values("product_id").reset_index(drop=True)


def verify_product_reference(ledger: pd.DataFrame, reference: dict) -> pd.DataFrame:
    """Recompute the supplier's JSON claims, rather than accepting its 'OK' text."""
    claims = reference.get("productos", [])
    codes = [r["codigo_producto"] for r in claims]
    if len(codes) != len(set(codes)) or set(codes) != set(ledger.codigo_producto):
        raise ValueError("Verification product keys disagree with the authoritative ledger")
    summary = reference.get("resumen", {})
    if summary.get("productos", len(codes)) != len(codes) or summary.get("movimientos_cinco", len(ledger)) != len(ledger):
        raise ValueError("Verification summary counts disagree")
    checks = []
    for claim in claims:
        g = ledger[ledger.codigo_producto.eq(claim["codigo_producto"])].copy()
        for col in ("entrada", "salida", "saldo"):
            g[col] = pd.to_numeric(g[col], errors="raise")
        errors = (g.saldo - (g.saldo.shift() + g.entrada - g.salida)).iloc[1:]
        actual = {"filas": len(g), "fecha_inicio": g.fecha.min(), "fecha_fin": g.fecha.max(),
                  "unidades_en_movimientos_VENTA": float(g.loc[g.tipo_movimiento.eq("VENTA"), "salida"].sum()),
                  "ventas_documentos": int(g.tipo_movimiento.eq("VENTA").sum()),
                  "saldo_ultimo": float(g.saldo.iloc[-1]), "diferencias_de_saldo": int(errors.abs().gt(1e-8).sum()),
                  "empresa_mostrada_en_pdf": g.empresa_documento.iloc[0], "documento_fuente": g.pdf_origen.iloc[0]}
        for key, value in actual.items():
            expected = float(claim[key]) if isinstance(value, (int, float)) else claim[key]
            checks.append({"codigo_producto": claim["codigo_producto"], "check": key,
                           "matches_reference": value == expected})
    result = pd.DataFrame(checks)
    if not result.matches_reference.all():
        raise ValueError("Recomputed Kardex checks disagree with verification JSON")
    return result

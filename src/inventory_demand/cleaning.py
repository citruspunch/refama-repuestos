"""Preserve every original movement and attach explicit quality/coverage flags."""

import numpy as np
import pandas as pd

from .config import Config, PRODUCTS, SCENARIOS


def clean_transactions(raw: pd.DataFrame, config: Config) -> tuple[pd.DataFrame, pd.DataFrame]:
    df = raw.copy()
    df["source_row"] = np.arange(2, len(df) + 2)
    df["movement_id"] = "K" + df.source_row.astype(str).str.zfill(5)
    for col in ("fecha", "entrada", "salida", "saldo", "pagina_pdf", "orden_movimiento_pdf"):
        df[f"raw_{col}"] = df[col]
    for col in ("codigo_producto", "tipo_movimiento", "venta_a_refama"):
        df[col] = df[col].str.strip().str.upper()
    df["fecha"] = pd.to_datetime(df.fecha, format="%Y-%m-%d", errors="coerce")
    pdf_date = pd.to_datetime(df.fecha_pdf, format="%d/%m/%Y", errors="coerce")
    df["invalid_date"] = df.fecha.isna()
    df["pdf_date_mismatch"] = pdf_date.isna() | df.fecha.ne(pdf_date)
    df["future_date"] = df.fecha.gt(pd.Timestamp(config.as_of))
    for col in ("entrada", "salida", "saldo", "pagina_pdf", "orden_movimiento_pdf"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["invalid_numeric"] = df[["entrada", "salida", "saldo", "pagina_pdf", "orden_movimiento_pdf"]].isna().any(axis=1)
    df["invalid_pdf_sequence"] = (df[["pagina_pdf", "orden_movimiento_pdf"]].le(0).any(axis=1)
                                  | (df[["pagina_pdf", "orden_movimiento_pdf"]] % 1).ne(0).any(axis=1))
    df["fractional_quantity"] = (df[["entrada", "salida", "saldo"]] % 1).ne(0).any(axis=1)
    df["negative_quantity"] = df[["entrada", "salida"]].lt(0).any(axis=1)
    df["both_in_and_out"] = df.entrada.gt(0) & df.salida.gt(0)
    df["unknown_type"] = ~df.tipo_movimiento.isin(["VENTA", "COMPRA", "PRODUCCION", "AJUSTE", "DEVOLUCION C"])
    df["unknown_product"] = ~df.codigo_producto.isin(PRODUCTS)
    df["invalid_refama_flag"] = ~df.venta_a_refama.isin(["SI", "NO"])
    df["is_sale"] = df.tipo_movimiento.eq("VENTA")
    df["sale_direction_issue"] = df.is_sale & (df.entrada.ne(0) | df.salida.le(0))
    df["is_refama_sale"] = df.is_sale & df.venta_a_refama.eq("SI")
    df["refama_flag_on_non_sale"] = ~df.is_sale & df.venta_a_refama.eq("SI")
    # Initial inventory is explicitly identified, never reinterpreted as a real supplier receipt.
    df["is_opening_inventory"] = df.cliente_proveedor.str.strip().str.upper().eq("INVENTARIO INICIAL")
    df["missing_document"] = df.numero_documento.str.strip().eq("")
    df["extraction_flag"] = df.observaciones_extraccion.str.strip().ne("")
    df["source_balance_flag"] = ~df.validacion_saldo.eq("OK")
    df["text_encoding_issue"] = df.cliente_proveedor.str.contains(r"\(cid:|Ã|�", regex=True)
    exact_cols = [c for c in raw.columns]
    df["exact_duplicate_candidate"] = raw.duplicated(exact_cols, keep=False)
    business_key = ["codigo_producto", "fecha", "tipo_movimiento", "cliente_proveedor", "entrada", "salida"]
    df["repeated_business_candidate"] = df.duplicated(business_key, keep=False)
    document_key = ["codigo_producto", "fecha", "numero_documento", "tipo_movimiento", "entrada", "salida"]
    df["repeated_document_candidate"] = ~df.missing_document & df.duplicated(document_key, keep=False)
    df["sequence_collision"] = df.duplicated(["codigo_producto", "orden_movimiento_pdf"], keep=False)
    df["source_date_reversal"] = df.groupby("codigo_producto", sort=False).fecha.diff().lt(pd.Timedelta(0))
    df["source_order_reversal"] = df.groupby("codigo_producto", sort=False).orden_movimiento_pdf.diff().le(0)
    df["source_sequence_gap"] = df.groupby("codigo_producto", sort=False).orden_movimiento_pdf.diff().gt(1)
    # PDF sequence is retained on same-day movements. source_row is a stable final tie-breaker.
    df = df.sort_values(["codigo_producto", "fecha", "orden_movimiento_pdf", "source_row"], kind="stable")
    groups = df.groupby("codigo_producto", sort=False)
    df["previous_balance"] = groups.saldo.shift(1)
    df["first_product_row"] = groups.cumcount().eq(0)
    df["implied_opening_balance"] = np.where(df.first_product_row, df.saldo - df.entrada + df.salida, np.nan)
    df["balance_error"] = df.saldo - (df.previous_balance + df.entrada - df.salida)
    # The first row has no independently observed predecessor; do not assert a zero opening balance.
    df["balance_discrepancy"] = df.balance_error.abs().gt(1e-8) & ~df.first_product_row
    df["negative_balance"] = df.saldo.lt(0)
    df["zero_balance"] = df.saldo.eq(0)
    df["adjustment_net"] = np.where(df.tipo_movimiento.eq("AJUSTE"), df.entrada - df.salida, 0)
    df["adjustment_requires_context"] = df.tipo_movimiento.eq("AJUSTE")
    df["monthly_sales_units"] = np.where(df.is_sale, df.salida, 0)
    df["month"] = df.fecha.dt.to_period("M").dt.to_timestamp()
    df["analysis_eligible"] = ~df[["invalid_date", "invalid_numeric", "invalid_pdf_sequence", "fractional_quantity", "negative_quantity", "unknown_type",
                                    "unknown_product", "invalid_refama_flag", "future_date", "sale_direction_issue"]].any(axis=1)
    flags = [c for c in df if df[c].dtype == bool and c not in
             {"is_sale", "is_refama_sale", "is_opening_inventory", "analysis_eligible", "first_product_row"}]
    quality = pd.DataFrame([{"check": c, "flagged_rows": int(df[c].sum()),
                             "action": "retain and investigate; no automatic deletion"} for c in flags])
    quality = pd.concat([quality, pd.DataFrame([{"check": "excluded_from_analysis", "flagged_rows": int((~df.analysis_eligible).sum()),
                                               "action": "preserved in validated transactions"}])], ignore_index=True)
    return df.reset_index(drop=True), quality


def reconstruct_daily(df: pd.DataFrame, config: Config) -> pd.DataFrame:
    rows = []
    for code, g in df[df.analysis_eligible].groupby("codigo_producto"):
        g = g.sort_values(["fecha", "orden_movimiento_pdf", "source_row"], kind="stable")
        daily = g.groupby("fecha").agg(
            recorded_closing_balance=("saldo", "last"), intraday_min_balance=("saldo", "min"),
            observed_zero_event=("zero_balance", "max"), observed_negative_event=("negative_balance", "max"),
            movements=("movement_id", "size"), incoming=("entrada", "sum"), outgoing=("salida", "sum"),
            sales_units=("monthly_sales_units", "sum"), balance_discrepancy=("balance_discrepancy", "max"))
        daily = daily.reindex(pd.date_range(g.fecha.min(), g.fecha.max(), freq="D"))
        daily.index.name = "date"
        daily["movement_observed"] = daily.movements.notna()
        daily["balance_carried_forward"] = ~daily.movement_observed
        # A bookkeeping reconstruction, not independently verified physical stock availability.
        daily["recorded_closing_balance"] = daily.recorded_closing_balance.ffill()
        daily["days_since_last_movement"] = (daily.index.to_series() - daily.index.to_series().where(daily.movement_observed).ffill()).dt.days
        for col in ("movements", "incoming", "outgoing", "sales_units"):
            daily[col] = daily[col].fillna(0)
        for col in ("observed_zero_event", "observed_negative_event", "balance_discrepancy"):
            daily[col] = daily[col].astype("boolean").fillna(False).astype(bool)
        daily["eod_zero"] = daily.recorded_closing_balance.eq(0)
        daily["eod_negative"] = daily.recorded_closing_balance.lt(0)
        daily["eod_nonpositive"] = daily.recorded_closing_balance.le(0)
        daily["eod_low_stock"] = daily.recorded_closing_balance.between(0, config.low_stock_units)
        daily["codigo_producto"] = code
        daily["month"] = daily.index.to_period("M").to_timestamp()
        rows.append(daily.reset_index())
    return pd.concat(rows, ignore_index=True)


def monthly_datasets(df: pd.DataFrame, daily: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    rows, coverage = [], []
    for code, g in df[df.analysis_eligible].groupby("codigo_producto"):
        first, last = g.fecha.min(), g.fecha.max()
        months = pd.date_range(first.to_period("M").to_timestamp(), last.to_period("M").to_timestamp(), freq="MS")
        for month in months:
            end = month + pd.offsets.MonthEnd(0)
            start_boundary = month == months[0]
            end_boundary = month == months[-1]
            # Last movement date does not establish the report/extraction coverage endpoint.
            usable = not (start_boundary or end_boundary)
            common = {"codigo_producto": code, "month": month, "coverage_start": max(first, month),
                      "coverage_end": min(last, end), "calendar_days": end.day,
                      "start_boundary": start_boundary, "end_boundary": end_boundary,
                      "complete_for_modeling": usable,
                      "coverage_status": "interior_provisional" if usable else "boundary_unconfirmed"}
            coverage.append(common)
            gm = g[g.month.eq(month)]
            dm = daily[daily.codigo_producto.eq(code) & daily.month.eq(month)]
            sales = gm[gm.is_sale]
            for scenario in SCENARIOS:
                subset = sales if scenario == "combined" else sales[sales.is_refama_sale.eq(scenario == "refama")]
                quantity = subset.salida.sum()
                rows.append({**common, "scenario": scenario, "sales_units": quantity,
                             "sales_transactions": len(subset),
                             "units_per_transaction": quantity / len(subset) if len(subset) else np.nan,
                             "purchase_incoming": gm.loc[gm.tipo_movimiento.eq("COMPRA") & ~gm.is_opening_inventory, "entrada"].sum(),
                             "opening_inventory_incoming": gm.loc[gm.is_opening_inventory, "entrada"].sum(),
                             "production_incoming": gm.loc[gm.tipo_movimiento.eq("PRODUCCION"), "entrada"].sum(),
                             "returns_incoming": gm.loc[gm.tipo_movimiento.eq("DEVOLUCION C"), "entrada"].sum(),
                             "returns_outgoing": gm.loc[gm.tipo_movimiento.eq("DEVOLUCION C"), "salida"].sum(),
                             "adjustment_incoming": gm.loc[gm.tipo_movimiento.eq("AJUSTE"), "entrada"].sum(),
                             "adjustment_outgoing": gm.loc[gm.tipo_movimiento.eq("AJUSTE"), "salida"].sum(),
                             "all_incoming": gm.entrada.sum(), "all_outgoing": gm.salida.sum(),
                             "closing_balance": dm.recorded_closing_balance.iloc[-1],
                             "min_recorded_balance": gm.saldo.min(),
                             "eod_nonpositive_days": int(dm.eod_nonpositive.sum()),
                             "observed_zero_events": int(gm.zero_balance.sum()),
                             "eod_low_stock_days": int(dm.eod_low_stock.sum()),
                             "eod_negative_days": int(dm.eod_negative.sum()),
                             "daily_covered_days": len(dm),
                             "balance_discrepancies": int(gm.balance_discrepancy.sum())})
    monthly = pd.DataFrame(rows).sort_values(["codigo_producto", "scenario", "month"]).reset_index(drop=True)
    for lag, name in ((1, "mom_growth"), (12, "yoy_growth")):
        grouped = monthly.groupby(["codigo_producto", "scenario"])
        previous = grouped.sales_units.shift(lag)
        previous_complete = grouped.complete_for_modeling.shift(lag).astype("boolean").fillna(False).astype(bool)
        valid = monthly.complete_for_modeling & previous_complete & previous.gt(0)
        monthly[name] = ((monthly.sales_units / previous) - 1).where(valid)
    return monthly, pd.DataFrame(coverage)


def reconcile_monthly(monthly: pd.DataFrame, reference: pd.DataFrame) -> pd.DataFrame:
    actual = monthly.pivot(index=["codigo_producto", "month"], columns="scenario", values="sales_units").reset_index()
    counts = monthly[monthly.scenario.eq("combined")][["codigo_producto", "month", "sales_transactions"]]
    actual = actual.merge(counts, on=["codigo_producto", "month"])
    ref = reference.copy()
    ref["month"] = pd.to_datetime(ref.mes, format="%Y-%m", errors="raise")
    comparisons = {"combined": "unidades_venta", "refama": "unidades_venta_a_refama",
                   "other": "unidades_venta_otros", "sales_transactions": "cantidad_operaciones_venta"}
    for col in comparisons.values():
        ref[col] = pd.to_numeric(ref[col], errors="raise")
    if ref.duplicated(["codigo_producto", "month"]).any():
        raise ValueError("Duplicate product/month keys in preliminary sales reference")
    result = actual.merge(ref, on=["codigo_producto", "month"], how="outer", indicator=True, validate="one_to_one")
    for left, right in comparisons.items():
        result[f"difference_{left}"] = result[left] - result[right]
    result["matches_reference"] = result._merge.eq("both") & result.filter(like="difference_").eq(0).all(axis=1)
    return result


def match_quality_reference(df: pd.DataFrame, reference: pd.DataFrame) -> pd.DataFrame:
    ref = reference.copy()
    ref["fecha"] = pd.to_datetime(ref.fecha, format="%Y-%m-%d", errors="raise")
    ref["pagina_pdf"] = pd.to_numeric(ref.pagina_pdf, errors="raise")
    ref["documento"] = ref.documento.fillna("")
    key = ["codigo_producto", "fecha", "numero_documento", "pagina_pdf"]
    grouped = df.groupby(key, dropna=False).agg(matched_movements=("movement_id", "size"),
                                               independently_negative=("negative_balance", "max"),
                                               extraction_flag=("extraction_flag", "max")).reset_index()
    result = ref.rename(columns={"documento": "numero_documento"}).merge(grouped, on=key, how="left")
    result["reference_matched"] = result.matched_movements.fillna(0).gt(0)
    # Drop free-text detail from this shareable output; raw reference remains untouched.
    return result.drop(columns=["detalle"])


def anonymize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    # No stable customer hash: unnecessary identity/linkage is not published at all.
    return df.drop(columns=["cliente_proveedor", "observaciones_extraccion", "numero_documento"], errors="ignore")

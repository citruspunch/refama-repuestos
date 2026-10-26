import hashlib

import pandas as pd
import pytest

from inventory_demand.cleaning import (anonymize_transactions, clean_transactions,
                                       match_quality_reference, reconcile_monthly)
from inventory_demand.config import Config


def test_all_source_records_preserved(cleaned):
    assert len(cleaned) == 1062
    assert cleaned.movement_id.is_unique
    assert cleaned.source_row.is_unique
    assert cleaned.analysis_eligible.all()
    assert cleaned.codigo_producto.value_counts().to_dict() == {"UAH-90385-18025": 583, "48815-14050": 479}


def test_balance_equations_and_first_row_uncertainty(cleaned):
    assert cleaned.first_product_row.sum() == 2
    assert cleaned.loc[~cleaned.first_product_row, "balance_error"].eq(0).all()
    assert cleaned.loc[cleaned.first_product_row, "balance_error"].isna().all()
    assert cleaned.loc[cleaned.first_product_row, "implied_opening_balance"].eq(0).all()
    assert cleaned.negative_balance.sum() == 2
    assert cleaned.zero_balance.sum() == 10


def test_sale_definition_not_all_outflows(cleaned):
    assert cleaned.loc[~cleaned.is_sale, "monthly_sales_units"].eq(0).all()
    actual = cleaned.groupby("codigo_producto").monthly_sales_units.sum().to_dict()
    assert actual == {"48815-14050": 6437, "UAH-90385-18025": 66423}
    assert cleaned.loc[~cleaned.is_sale, "salida"].sum() > 0
    assert cleaned.is_opening_inventory.sum() == 2
    assert cleaned.adjustment_requires_context.sum() == 23


def test_same_day_order_and_chronology(cleaned):
    assert not cleaned.source_date_reversal.any()
    assert not cleaned.source_order_reversal.any()
    for _, g in cleaned.groupby("codigo_producto"):
        assert g.fecha.is_monotonic_increasing
        for _, day in g.groupby("fecha"):
            assert day.orden_movimiento_pdf.is_monotonic_increasing


def test_daily_last_movement_closes_day(cleaned, daily):
    expected = cleaned.groupby(["codigo_producto", "fecha"]).saldo.last().reset_index()
    merged = daily.merge(expected, left_on=["codigo_producto", "date"], right_on=["codigo_producto", "fecha"])
    assert merged.recorded_closing_balance.eq(merged.saldo).all()
    assert daily.groupby("codigo_producto").date.max().to_dict() == cleaned.groupby("codigo_producto").fecha.max().to_dict()
    assert daily.balance_carried_forward.any()


def test_boundary_coverage_and_calendar_zeroes(monthly):
    combined = monthly[monthly.scenario.eq("combined")]
    assert combined.groupby("codigo_producto").complete_for_modeling.sum().to_dict() == {
        "48815-14050": 51, "UAH-90385-18025": 50}
    assert combined[combined.start_boundary | combined.end_boundary].complete_for_modeling.eq(False).all()
    for _, g in monthly.groupby(["codigo_producto", "scenario"]):
        assert list(g.month) == list(pd.date_range(g.month.min(), g.month.max(), freq="MS"))
        assert g.iloc[0].mom_growth != g.iloc[0].mom_growth  # NaN, not zero growth.
        assert pd.isna(g.iloc[1].mom_growth)  # Comparator is a boundary.
        assert pd.isna(g.iloc[-1].mom_growth)


def test_segment_units_add_exactly(monthly):
    p = monthly.pivot(index=["codigo_producto", "month"], columns="scenario", values="sales_units")
    assert (p.refama + p.other).eq(p.combined).all()


def test_independent_monthly_reconciliation(monthly, sources):
    result = reconcile_monthly(monthly, sources["ventas_mensuales_preliminares.csv"])
    assert len(result) == 105
    assert result.matches_reference.all()


def test_quality_reference_and_no_deletion(cleaned, sources):
    matched = match_quality_reference(cleaned, sources["revision_calidad.csv"])
    assert len(matched) == 35
    assert matched.reference_matched.all()
    assert cleaned.missing_document.sum() == 1
    assert cleaned.repeated_business_candidate.sum() == 12
    assert cleaned.exact_duplicate_candidate.sum() == 0
    assert len(cleaned) == len(sources["kardex_consolidado.csv"])


def test_public_export_has_no_names(cleaned):
    public = anonymize_transactions(cleaned)
    assert "cliente_proveedor" not in public
    assert "numero_documento" not in public
    assert "observaciones_extraccion" not in public


@pytest.mark.parametrize("column,value,flag", [
    ("fecha", "bad-date", "invalid_date"),
    ("entrada", "not-numeric", "invalid_numeric"),
    ("salida", "-5", "negative_quantity"),
    ("salida", "1.5", "fractional_quantity"),
    ("pagina_pdf", "0", "invalid_pdf_sequence"),
    ("tipo_movimiento", "UNKNOWN", "unknown_type"),
    ("venta_a_refama", "UNKNOWN", "invalid_refama_flag"),
])
def test_corrupt_inputs_are_flagged_not_deleted(sources, config, column, value, flag):
    raw = sources["kardex_consolidado.csv"].copy()
    raw.loc[2, column] = value
    data, _ = clean_transactions(raw, config)
    record = data[data.source_row.eq(4)].iloc[0]
    assert record[flag]
    assert not record.analysis_eligible
    assert len(data) == 1062


def test_original_sources_unchanged(config):
    import json
    manifest = json.loads((config.root / "artifacts/source_manifest.json").read_text())
    for record in manifest:
        assert hashlib.sha256((config.root / record["file"]).read_bytes()).hexdigest() == record["sha256"]

"""Reported business facts, deliberately separate from confirmed planning inputs."""

from dataclasses import asdict, dataclass


DEMAND_STREAMS = {
    "refama": "RUJAF shipments to Refama (wholesale replenishment, not retail sell-through)",
    "other": "RUJAF recorded sales to other customers",
    "combined": "Total recorded RUJAF outgoing sales (refama + other, once only)",
}


@dataclass(frozen=True)
class ReportedProductInputs:
    net_unit_value: float
    units_per_production_day: float
    currency: str = "GTQ"
    value_classification: str = "precio_venta_neto_tras_descuento"
    rate_status: str = "reported_operating_rate_NOT_verified_capacity"


REPORTED_PRODUCTS = {
    "UAH-90385-18025": ReportedProductInputs(2.50, 800),
    "48815-14050": ReportedProductInputs(12.00, 210),
    "UAH-33505-35020": ReportedProductInputs(15.00, 300),
    "90385-18046": ReportedProductInputs(2.50, 480),
    "17881-54820": ReportedProductInputs(100.00, 30),
}


def reported_product_table():
    import pandas as pd

    return pd.DataFrame([{"codigo_producto": code, **asdict(inputs)}
                         for code, inputs in REPORTED_PRODUCTS.items()])

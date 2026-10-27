"""Explicit, reproducible analysis choices; no invented operational parameters."""

from dataclasses import asdict, dataclass
from pathlib import Path
import re


@dataclass(frozen=True)
class Config:
    root: Path = Path(__file__).resolve().parents[2]
    as_of: str = "2026-10-26"
    initial_train_months: int = 24
    holdout_months: int = 6
    practical_tie_fraction: float = 0.05
    low_stock_units: float = 10.0  # Descriptive threshold, NOT a business reorder point.
    seed: int = 42
    bootstrap_repetitions: int = 1000
    experiment: str | None = None

    def __post_init__(self):
        if self.experiment is not None and not re.fullmatch(r"[A-Za-z0-9_-]+", self.experiment):
            raise ValueError("Experiment names must be simple directory names")

    @property
    def raw(self) -> Path:
        return self.root / "kardex_csv"

    @property
    def processed(self) -> Path:
        if self.experiment:
            return self.root / "data" / "experiments" / self.experiment
        return self.root / "data" / "processed"

    @property
    def private(self) -> Path:
        if self.experiment:
            return self.root / "data" / "private" / self.experiment
        return self.root / "data" / "private"

    @property
    def reports(self) -> Path:
        if self.experiment:
            return self.root / "reports" / "experiments" / self.experiment
        return self.root / "reports"

    @property
    def artifacts(self) -> Path:
        if self.experiment:
            return self.root / "artifacts" / "experiments" / self.experiment
        return self.root / "artifacts"

    @property
    def tables(self) -> Path:
        return self.reports / "tables"

    @property
    def figures(self) -> Path:
        return self.reports / "figures"

    def prepare(self) -> None:
        for path in (self.processed, self.private, self.tables, self.figures,
                     self.artifacts):
            path.mkdir(parents=True, exist_ok=True)

    def serializable(self) -> dict:
        return {**asdict(self), "root": "."}


SCENARIOS = ("combined", "refama", "other")
PRODUCTS = {"UAH-90385-18025": "Product A", "48815-14050": "Product B"}
REQUIRED_COLUMNS = (
    "codigo_producto", "descripcion_producto", "fecha", "fecha_pdf",
    "numero_documento", "tipo_movimiento", "cliente_proveedor", "entrada",
    "salida", "saldo", "venta_a_refama", "pagina_pdf", "orden_movimiento_pdf",
    "observaciones_extraccion", "validacion_saldo",
)

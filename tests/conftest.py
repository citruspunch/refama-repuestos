import numpy as np
import pandas as pd
import pytest

from inventory_demand.cleaning import clean_transactions, monthly_datasets, reconstruct_daily
from inventory_demand.config import Config
from inventory_demand.data import load_sources


@pytest.fixture(scope="session")
def config():
    return Config()


@pytest.fixture(scope="session")
def sources(config):
    config.prepare()
    return load_sources(config)[0]


@pytest.fixture(scope="session")
def cleaned(sources, config):
    return clean_transactions(sources["kardex_consolidado.csv"], config)[0]


@pytest.fixture(scope="session")
def daily(cleaned, config):
    return reconstruct_daily(cleaned, config)


@pytest.fixture(scope="session")
def monthly(cleaned, daily):
    return monthly_datasets(cleaned, daily)[0]


@pytest.fixture
def synthetic_series():
    # Explicit test fixture, never written as observed business data.
    return pd.DataFrame({"codigo_producto": "TEST_ONLY", "scenario": "combined",
                         "month": pd.date_range("2020-01-01", periods=40, freq="MS"),
                         "sales_units": 100 + np.arange(40) * 2,
                         "complete_for_modeling": True,
                         "closing_balance": 300 + np.arange(40),
                         "eod_nonpositive_days": 0, "eod_low_stock_days": 0,
                         "sales_transactions": 5})

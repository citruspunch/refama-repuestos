import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"
import { csvParse } from "d3-dsv"

const sources = {
  monthly: "data/experiments/five_products_v1/monthly_demand.csv",
  summary: "reports/experiments/five_products_v1/tables/sales_summary.csv",
  streams: "reports/experiments/five_products_v1/tables/rujaf_demand_streams.csv",
  ytd: "reports/experiments/five_products_v1/tables/comparable_ytd.csv",
  inventory: "reports/experiments/five_products_v1/tables/inventory_pressure.csv",
  seasonality: "reports/experiments/five_products_v1/tables/seasonality.csv",
  selection: "reports/experiments/five_products_v1/tables/selected_models.csv",
  comparison: "reports/experiments/five_products_v1/tables/model_comparison.csv",
  predictions: "reports/experiments/five_products_v1/tables/backtest_predictions.csv",
  forecast: "reports/experiments/five_products_v1/tables/next_history_month_forecasts.csv",
  guard: "reports/experiments/five_products_v1/tables/forecast_validity.csv",
  replay: "reports/experiments/five_products_v1/tables/forecast_safeguard_comparison.csv",
  production: "reports/experiments/five_products_v1/tables/production_scenarios.csv",
  paired: "reports/experiments/five_products_v1/tables/paired_baseline_comparison.csv",
  quality: "reports/experiments/five_products_v1/tables/quality_checks.csv",
  catalog: "reports/experiments/five_products_v1/tables/product_catalog.csv",
  profiles: "reports/experiments/five_products_v1/tables/demand_profiles.csv",
  movements: "reports/experiments/five_products_v1/tables/movement_totals.csv",
  coverage: "reports/experiments/five_products_v1/tables/coverage.csv",
  eligibility: "reports/experiments/five_products_v1/tables/candidate_eligibility.csv",
  productionReplay: "reports/experiments/five_products_v1/tables/production_replay.csv",
  historicalComparison: "reports/experiments/five_products_v1/tables/historical_model_comparison.csv",
}

const sourceURL = (path) => new URL(`../${path}`, import.meta.url)
export const sourcePaths = Object.values(sources).map((path) => fileURLToPath(sourceURL(path)))

function parse(value) {
  if (value === "") return null
  if (value === "True" || value === "False") return value === "True"
  if (/^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) return Number(value)
  return value
}

export function loadEvidence() {
  const tables = {}
  const provenance = []
  for (const [key, path] of Object.entries(sources)) {
    const bytes = readFileSync(sourceURL(path))
    tables[key] = csvParse(bytes.toString("utf8"), (row) => Object.fromEntries(
      Object.entries(row).map(([name, value]) => [name, parse(value)]),
    ))
    provenance.push({ path, rows: tables[key].length, sha256: createHash("sha256").update(bytes).digest("hex") })
  }
  const products = {}
  for (const entry of tables.catalog) {
    const { product_id: id, codigo_producto: code } = entry
    const combined = (row) => row.codigo_producto === code && row.scenario === "combined"
    const selection = tables.selection.find(combined)
    products[id] = {
      code,
      catalog: entry,
      profile: tables.profiles.find(combined),
      summary: tables.summary.find(combined),
      channels: tables.summary.filter((row) => row.codigo_producto === code && row.scenario !== "combined"),
      streams: tables.streams.filter((row) => row.codigo_producto === code),
      monthly: tables.monthly.filter(combined),
      ytd: tables.ytd.filter(combined),
      inventory: tables.inventory.find((row) => row.codigo_producto === code),
      seasonality: tables.seasonality.find(combined),
      selection,
      comparison: tables.comparison.filter(combined),
      predictions: tables.predictions.filter((row) => combined(row) && [selection.model, "naive", "seasonal_naive", "moving_average_3"].includes(row.model))
        .map(({ target_month, training_end, training_months, horizon_months, phase, model, actual, predicted, raw_predicted }) => ({
          target_month, training_end, training_months, horizon_months, phase, model, actual, predicted, raw_predicted,
        })),
      forecast: tables.forecast.find(combined),
      guard: tables.guard.find(combined),
      replay: tables.replay.filter(combined),
      paired: tables.paired.filter(combined),
      productionReplay: tables.productionReplay.filter((row) => row.codigo_producto === code),
      production: tables.production.filter((row) => row.codigo_producto === code).map((row) => {
        const { scenario_inputs_json, assumed_fields, warning, ...publicValues } = row
        const assumptions = JSON.parse(scenario_inputs_json)
        return { ...publicValues, assumptions }
      }),
    }
  }
  return { analysisDate: "2026-10-26", experiment: "five_products_v1", products,
    movementCount: tables.catalog.reduce((sum, row) => sum + row.movements, 0),
    monthCount: tables.coverage.length, scenarioCount: tables.production.length,
    modelCount: new Set(tables.eligibility.filter((row) => row.eligible).map((row) => row.model)).size,
    quality: tables.quality, historicalComparison: tables.historicalComparison, provenance }
}

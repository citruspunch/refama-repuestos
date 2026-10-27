import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"
import { csvParse } from "d3-dsv"

const sources = {
  monthly: "data/processed/monthly_demand.csv",
  summary: "reports/tables/sales_summary.csv",
  streams: "reports/tables/rujaf_demand_streams.csv",
  ytd: "reports/tables/comparable_ytd.csv",
  inventory: "reports/tables/inventory_pressure.csv",
  seasonality: "reports/tables/seasonality.csv",
  selection: "reports/tables/selected_models.csv",
  comparison: "reports/tables/model_comparison.csv",
  predictions: "reports/tables/backtest_predictions.csv",
  forecast: "reports/tables/next_history_month_forecasts.csv",
  guard: "reports/tables/forecast_validity.csv",
  replay: "reports/tables/forecast_safeguard_comparison.csv",
  production: "reports/tables/production_scenarios.csv",
  paired: "reports/tables/paired_baseline_comparison.csv",
  quality: "reports/tables/quality_checks.csv",
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
  for (const [id, code] of [["A", "UAH-90385-18025"], ["B", "48815-14050"]]) {
    const combined = (row) => row.codigo_producto === code && row.scenario === "combined"
    const selection = tables.selection.find(combined)
    products[id] = {
      code,
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
      production: tables.production.filter((row) => row.codigo_producto === code).map((row) => {
        const { scenario_inputs_json, assumed_fields, warning, ...publicValues } = row
        const assumptions = JSON.parse(scenario_inputs_json)
        return { ...publicValues, assumptions }
      }),
    }
  }
  return { analysisDate: "2026-10-26", products, quality: tables.quality, provenance }
}

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { loadEvidence } from "../evidence-loader.js"
import { BUSINESS } from "../src/business.js"
import { contrast, heatmapColor } from "../src/chart-colors.js"

const evidence = loadEvidence()
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} no coincide con ${b}`)

test("las tablas importadas son públicas y los canales y meses concilian", () => {
  assert.ok(evidence.provenance.length >= 14)
  for (const source of evidence.provenance) {
    assert.match(source.path, /^(reports\/tables|data\/processed)\//)
    assert.match(source.sha256, /^[a-f0-9]{64}$/)
  }
  for (const id of ["A", "B"]) {
    const p = evidence.products[id]
    close(p.monthly.reduce((sum, row) => sum + row.sales_units, 0), p.summary.all_observed_sales_units)
    close(p.channels.reduce((sum, row) => sum + row.all_observed_sales_units, 0), p.summary.all_observed_sales_units)
    assert.equal(p.monthly.filter((row) => row.complete_for_modeling).length, id === "A" ? 50 : 51)
    assert.equal(p.monthly.filter((row) => !row.complete_for_modeling).length, 2)
    assert.equal(p.monthly.at(-1).coverage_status, "boundary_unconfirmed")
  }
})

test("las métricas mostradas se recalculan con los mismos seis errores de prueba", () => {
  for (const p of Object.values(evidence.products)) {
    const predictions = p.predictions.filter((row) => row.phase === "holdout" && row.model === p.selection.model)
    const score = p.comparison.find((row) => row.phase === "holdout" && row.model === p.selection.model)
    assert.equal(predictions.length, 6)
    const errors = predictions.map((row) => row.predicted - row.actual)
    const absolute = errors.reduce((sum, value) => sum + Math.abs(value), 0)
    close(absolute / 6, score.mae)
    close(absolute / predictions.reduce((sum, row) => sum + row.actual, 0), score.wape)
    close(errors.reduce((sum, value) => sum + value, 0) / 6, score.bias)
    assert.ok(predictions.every((row) => row.training_end < row.target_month && row.horizon_months === 1))
  }
})

test("el fallo de A y el respaldo no se ocultan ni se usan como pronóstico en vivo", () => {
  const p = evidence.products.A
  assert.ok(p.forecast.raw_forecast_units < 0)
  assert.equal(p.forecast.forecast_units, 0)
  assert.equal(p.forecast.units_already_in_unconfirmed_boundary, 325)
  assert.equal(p.guard.locked_forecast_valid, false)
  assert.equal(p.guard.fallback_used, true)
  const recent = p.monthly.filter((row) => row.complete_for_modeling).slice(-3)
  close(recent.reduce((sum, row) => sum + row.sales_units, 0) / 3, 205)
  close(p.guard.effective_forecast_units, 205)
  assert.ok(recent.every((row) => row.month < p.forecast.target_month))
  for (const product of Object.values(evidence.products)) {
    assert.equal(product.forecast.live_forecast_available, false)
    assert.equal(product.guard.live_recommendation_allowed, false)
    assert.ok(product.replay.every((row) => row.evaluation_status.startsWith("post_hoc_diagnostic")))
  }
})

test("los ocho escenarios archivados mantienen los supuestos y la aritmética", () => {
  let count = 0
  for (const p of Object.values(evidence.products)) for (const row of p.production) {
    count++
    assert.equal(row.status, "hypothetical_production_scenario")
    assert.equal(row.live_recommendation_allowed, false)
    assert.equal(row.assumptions.constraints_confirmed, false)
    const target = row.expected_monthly_outgoing_units / 30 * 37 + row.safety_stock_units
    close(row.production_trigger_units, target)
    assert.equal(row.suggested_production_units, Math.ceil(Math.max(0, target - row.recorded_on_hand_units)))
    close(row.estimated_production_days_required, row.suggested_production_units / row.assumed_units_per_production_day)
  }
  assert.equal(count, 8)
  const b = evidence.products.B.production.filter((row) => row.assumed_available_production_days === 1)
  assert.deepEqual(b.map((row) => row.suggested_production_units), [95, 192])
  assert.ok(evidence.products.A.production.every((row) => row.suggested_production_units === 0 && row.expected_monthly_outgoing_units === 205))
})

test("los precios confirmados no se transforman en costos", () => {
  assert.equal(BUSINESS.A.netSellingPrice, 2.5)
  assert.equal(BUSINESS.B.netSellingPrice, 12)
  assert.equal(BUSINESS.A.reportedUnitsPerProductionDay, 800)
  assert.equal(BUSINESS.B.reportedUnitsPerProductionDay, 210)
  assert.equal(BUSINESS.A.manufacturingCost, undefined)
  assert.equal(BUSINESS.B.manufacturingCost, undefined)
})

test("las cifras de cada celda del calendario tienen contraste mínimo de 4.5", () => {
  for (const id of ["A", "B"]) {
    const rows = evidence.products[id].monthly.filter((row) => row.complete_for_modeling)
    const max = Math.max(...rows.map((row) => row.sales_units))
    for (const row of rows) {
      const style = heatmapColor(id, row.sales_units, max)
      assert.ok(contrast(style.color, style.background) >= 4.5)
    }
  }
})

test("los 52 MAE de consulta del guion coinciden con las tablas a dos decimales", () => {
  const text = readFileSync(new URL("../GUION.md", import.meta.url), "utf8")
  const start = text.indexOf("| Método | A, MAE validación |")
  assert.ok(start > 0)
  const rows = text.slice(start).split("\n").filter((line) => line.startsWith("|")).slice(2, 15)
  const models = ["naive", "moving_average_3", "moving_average_6", "historical_average", "seasonal_naive", "ets_level", "ets_damped", "ets_seasonal_add", "ridge", "linear_regression", "sarima", "random_forest", "gradient_boosting"]
  assert.equal(rows.length, models.length)
  rows.forEach((line, index) => {
    const values = line.split("|").slice(2, 6).map((value) => Number(value.trim().replaceAll(",", "")))
    const expected = ["A", "B"].flatMap((id) => ["validation", "holdout"].map((phase) => Number(
      evidence.products[id].comparison.find((row) => row.model === models[index] && row.phase === phase).mae.toFixed(2),
    )))
    assert.deepEqual(values, expected)
  })
})

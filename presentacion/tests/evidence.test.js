import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { loadEvidence } from "../evidence-loader.js"
import { BUSINESS, number } from "../src/business.js"
import { CHART_COLORS, PRODUCT_STROKES, contrast, heatmapColor } from "../src/chart-colors.js"

const evidence = loadEvidence()
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} no coincide con ${b}`)

test("las tablas importadas son públicas y los canales y meses concilian", () => {
  assert.ok(evidence.provenance.length >= 14)
  for (const source of evidence.provenance) {
    assert.match(source.path, /^(reports|data)\/experiments\/five_products_v1\//)
    assert.match(source.sha256, /^[a-f0-9]{64}$/)
  }
  assert.equal(Object.keys(evidence.products).length, 5)
  assert.equal(evidence.movementCount, 2108)
  assert.equal(evidence.monthCount, 258)
  assert.equal(evidence.modelCount, 16)
  for (const p of Object.values(evidence.products)) {
    close(p.monthly.reduce((sum, row) => sum + row.sales_units, 0), p.summary.all_observed_sales_units)
    close(p.channels.reduce((sum, row) => sum + row.all_observed_sales_units, 0), p.summary.all_observed_sales_units)
    assert.equal(p.monthly.filter((row) => row.complete_for_modeling).length, p.summary.complete_months)
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

test("los 48 escenarios archivados mantienen supuestos, estrés y límites por producto", () => {
  let count = 0
  for (const p of Object.values(evidence.products)) for (const row of p.production) {
    count++
    assert.equal(row.status, "hypothetical_production_scenario")
    assert.equal(row.live_recommendation_allowed, false)
    assert.equal(row.assumptions.constraints_confirmed, false)
    const target = row.expected_monthly_outgoing_units / 30 * 37 + row.safety_stock_units
    close(row.production_trigger_units, target)
    assert.equal(row.suggested_production_units, Math.min(Math.ceil(Math.max(0, target - row.recorded_on_hand_units)), Math.floor(row.assumed_units_per_production_day * row.assumed_available_production_days)))
    close(row.estimated_production_days_required, row.suggested_production_units / row.assumed_units_per_production_day)
  }
  assert.equal(count, 48)
  const b = evidence.products.B.production.filter((row) => row.assumed_available_production_days === 1 && row.demand_factor === 1)
  assert.deepEqual(b.map((row) => row.suggested_production_units), [95, 192])
  assert.ok(evidence.products.A.production.every((row) => row.suggested_production_units === 0 && row.expected_monthly_outgoing_units === 205 * row.demand_factor))
})

test("la ampliación conserva precios netos, rango de ritmo y procedencia Refama", () => {
  assert.equal(evidence.products.C.catalog.empresa_documento, "REFAMA")
  assert.equal(evidence.products.C.catalog.empresa_para_el_analisis, "RUJAF")
  for (const id of ["A", "B", "C", "D", "E"]) {
    assert.equal(evidence.products[id].catalog.clasificacion_monto, "precio_venta_neto_tras_descuento")
    assert.equal(evidence.products[id].catalog.manufacturing_cost_verified, false)
    assert.equal(BUSINESS[id].manufacturingCost, undefined)
  }
  assert.equal(BUSINESS.C.netSellingPrice, 15)
  assert.equal(BUSINESS.E.netSellingPrice, 100)
  assert.equal(BUSINESS.D.netSellingPrice, 2.5)
  assert.equal(evidence.products.E.catalog.produccion_aproximada_diaria_min, 30)
  assert.equal(evidence.products.E.catalog.produccion_aproximada_diaria_max, 35)
  assert.equal(evidence.products.E.profile.zero_periods, 21)
  assert.equal(evidence.products.E.selection.model, "zero")
  assert.equal(evidence.products.E.guard.effective_forecast_units, 3)
  for (const row of evidence.historicalComparison) for (const [name, value] of Object.entries(row)) {
    if (name.startsWith("delta_") && value !== null) close(value, 0, 1e-7)
  }
})

test("el replay diario agregado no se confunde con faltantes observados", () => {
  for (const p of Object.values(evidence.products)) for (const row of p.productionReplay) {
    close(row.starting_simulated_stock + row.received_units - row.simulated_served_units, row.ending_simulated_stock)
    close(row.simulated_served_units + row.simulated_unserved_recorded_sales_units, row.recorded_sales_units)
    assert.equal(row.live_recommendation_allowed, false)
    assert.match(row.status, /^post_hoc_recorded_sales_policy_replay/)
  }
})

test("los precios confirmados no se transforman en costos", () => {
  assert.equal(BUSINESS.A.netSellingPrice, 2.5)
  assert.equal(BUSINESS.B.netSellingPrice, 12)
  assert.equal(BUSINESS.C.netSellingPrice, 15)
  assert.equal(BUSINESS.D.netSellingPrice, 2.5)
  assert.equal(BUSINESS.E.netSellingPrice, 100)
  assert.equal(BUSINESS.A.reportedUnitsPerProductionDay, 800)
  assert.equal(BUSINESS.B.reportedUnitsPerProductionDay, 210)
  assert.equal(BUSINESS.A.manufacturingCost, undefined)
  assert.equal(BUSINESS.B.manufacturingCost, undefined)
})

test("las cifras de cada celda del calendario tienen contraste mínimo de 4.5", () => {
  for (const id of Object.keys(evidence.products)) {
    const rows = evidence.products[id].monthly.filter((row) => row.complete_for_modeling)
    const max = Math.max(...rows.map((row) => row.sales_units))
    for (const row of rows) {
      const style = heatmapColor(id, row.sales_units, max)
      assert.ok(contrast(style.color, style.background) >= 4.5)
    }
  }
})

test("las cinco identidades de producto conservan contraste en sus letras", () => {
  assert.equal(new Set(Object.values(BUSINESS).map((p) => p.color)).size, 5)
  for (const [id, p] of Object.entries(BUSINESS)) assert.ok(contrast(p.color, ["A", "B", "C"].includes(id) ? "#1c1028" : "#ffffff") >= 4.5, id)
  assert.deepEqual(Object.values(BUSINESS).map((p) => p.color), ["#ffd22b", "#feb204", "#ff8503", "#d53600", "#700e01"])
  const zero = heatmapColor("E", 0, 0)
  assert.ok(contrast(zero.color, zero.background) >= 4.5)
})

test("los trazos de producto tienen contraste mínimo de 3 sin contorno", () => {
  assert.deepEqual(Object.keys(PRODUCT_STROKES), Object.keys(BUSINESS))
  assert.equal(new Set(Object.values(PRODUCT_STROKES)).size, 5)
  for (const [id, color] of Object.entries(PRODUCT_STROKES)) {
    for (const background of [CHART_COLORS.paper, CHART_COLORS.amberBg]) {
      assert.ok(contrast(color, background) >= 3, `${id} sobre ${background}`)
    }
  }
})

test("los MAE conservados en las notas coinciden con las tablas fuente", () => {
  const text = readFileSync(new URL("../GUION.md", import.meta.url), "utf8")
  const results = text.split("## 18.")[1].split("## 19.")[0]
  for (const p of Object.values(evidence.products)) for (const model of [p.selection.model, "naive"]) {
    const score = p.comparison.find((row) => row.phase === "holdout" && row.model === model)
    assert.ok(results.includes(number(score.mae, 2)))
  }
})

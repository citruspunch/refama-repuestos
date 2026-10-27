import test from "node:test"
import assert from "node:assert/strict"
import { loadEvidence } from "../evidence-loader.js"
import { comparablePeriod, forecastSeries, interiorMonths, productionVariant, replayTotal, salesSeries } from "../src/analysis.js"
import { monthRange } from "../src/business.js"

const { products } = loadEvidence()

test("los rangos muestran el año sin repetirlo ni ocultar cambios de año", () => {
  assert.equal(monthRange("2026-03-01", "2026-08-01"), "mar a ago 26")
  assert.equal(monthRange("2025-12-01", "2026-05-01"), "dic 25 a may 26")
})

test("las cinco curvas conservan fechas, ceros y escalas propias sin completar fronteras", () => {
  const { series, domain } = salesSeries(products)
  assert.deepEqual(series.map((row) => row.id), ["A", "B", "C", "D", "E"])
  for (const { id, data, max } of series) {
    assert.equal(data.length, products[id].summary.complete_months)
    assert.ok(data.every((row) => row.complete_for_modeling && row.time >= domain[0] && row.time <= domain[1]))
    assert.equal(max, products[id].summary.monthly_max)
    assert.equal(data.filter((row) => row.sales_units === 0).length, products[id].profile.zero_periods)
  }
  assert.ok(series.find((row) => row.id === "C").data[0].time > domain[0])
  assert.ok(series.find((row) => row.id === "E").data.at(-1).time < domain[1])
  assert.deepEqual(Object.values(products).map(comparablePeriod), ["Ene a ago", "Ene a sep", "Ene a sep", "Ene a sep", "Ene a jul"])
})

test("las cinco curvas finales comparan los mismos seis objetivos dentro de cada producto", () => {
  for (const p of Object.values(products)) {
    const rows = forecastSeries(p, true)
    assert.equal(rows.length, 6)
    assert.equal(rows[0].month, p.selection.holdout_start)
    assert.equal(rows.at(-1).month, p.selection.holdout_end)
    for (const row of rows) {
      assert.ok([row.actual, row.selected, row.naive].every(Number.isFinite))
      assert.equal(row.actual, interiorMonths(p).find((entry) => entry.month === row.month).sales_units)
    }
  }
})

test("el selector compara cinco variantes sin mezclar estrés, días o extremos de E", () => {
  for (const p of Object.values(products)) for (const safety of [0, 1]) for (const days of [1, 5]) {
    const row = productionVariant(p, safety, days)
    assert.equal(row.demand_factor, 1)
    assert.equal(row.assumed_safety_stock_months, safety)
    assert.equal(row.assumed_available_production_days, days)
    assert.equal(row.assumed_units_per_production_day, p.catalog.produccion_aproximada_diaria_min)
    assert.equal(row.recorded_on_hand_units, p.inventory.aligned_closing_balance)
  }
  assert.equal(productionVariant(products.C, 1, 1).suggested_production_units, 300)
  assert.equal(productionVariant(products.C, 1, 5).suggested_production_units, 439)
})

test("el replay muestra A y B además de C, D y E, sin sumar políticas alternativas", () => {
  assert.deepEqual(Object.values(products).map((p) => [replayTotal(p, 0), replayTotal(p, 1)]), [[0, 0], [0, 0], [115, 2], [129, 0], [1, 1]])
})

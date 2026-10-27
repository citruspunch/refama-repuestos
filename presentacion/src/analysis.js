export const interiorMonths = (p) => p.monthly.filter((row) => row.complete_for_modeling)

export function salesSeries(products) {
  const series = Object.entries(products).map(([id, p]) => {
    const data = interiorMonths(p).map((row) => ({ ...row, time: Date.parse(row.month) }))
    return { id, data, max: Math.max(0, ...data.map((row) => row.sales_units)) }
  })
  const times = series.flatMap(({ data }) => data.map((row) => row.time))
  return { series, domain: [Math.min(...times), Math.max(...times)] }
}

export function forecastSeries(p, holdoutOnly = false) {
  return p.predictions.filter((row) => row.model === p.selection.model && (!holdoutOnly || row.phase === "holdout"))
    .map((row) => ({
      month: row.target_month, actual: row.actual, selected: row.predicted,
      naive: p.predictions.find((other) => other.target_month === row.target_month && other.model === "naive")?.predicted ?? null,
    }))
}

export function evaluationSplit(p) {
  const first = p.predictions.find((row) => row.model === p.selection.model
    && row.phase === "validation" && row.target_month === p.selection.validation_start)
  const training = first?.training_months
  const validation = p.selection.n_validation
  const test = p.selection.n_holdout
  const total = p.summary.complete_months
  if (!Number.isInteger(training) || training + validation + test !== total) {
    throw new Error("La distribución temporal no coincide con la historia del producto")
  }
  return { training, validation, test, total }
}

export function comparablePeriod(p) {
  const end = p.ytd.at(-1).through_month
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `Ene a ${months[end - 1]}`
}

export function productionVariant(p) {
  return p.production.find((row) => row.demand_factor === 1
    && row.assumed_available_production_days === 1
    && row.assumed_safety_stock_months === 0
    && row.assumed_units_per_production_day === p.catalog.produccion_aproximada_diaria_min)
}

export function replayTotal(p) {
  return p.productionReplay.filter((row) => row.assumed_available_production_days === 1
    && row.assumed_safety_stock_months === 0
    && row.assumed_units_per_production_day === p.catalog.produccion_aproximada_diaria_min)
    .reduce((sum, row) => sum + row.simulated_unserved_recorded_sales_units, 0)
}

import React from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import evidence from "virtual:rujaf-evidence"
import { BUSINESS, MODEL_NAMES, month, number, percent } from "./business.js"
import { ProductLabel } from "./ui.jsx"
import { CHART_COLORS, heatmapColor } from "./chart-colors.js"

export const product = (id) => evidence.products[id]
export const score = (id, model, phase = "holdout") => product(id).comparison.find((row) => row.model === model && row.phase === phase)
const grid = CHART_COLORS.grid
const tick = { fill: CHART_COLORS.text, fontSize: 18 }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{/^\d{4}-/.test(String(label)) ? month(String(label), false) : label}</strong>
    {payload.map((entry) => <div key={entry.dataKey}><span style={{ color: entry.color }}>{entry.name}</span><b>{number(entry.value, 1)} u.</b></div>)}
  </div>
}

// Los datos son estáticos: pausar el escenario no debe remontar los trazos de Recharts.
export const SalesChart = React.memo(function SalesChart({ id, compact = false }) {
  const data = product(id).monthly.filter((row) => row.complete_for_modeling)
  const ticks = data.filter((_, index) => index % 12 === 0).map((row) => row.month)
  return <div className={`chart-wrap ${compact ? "compact" : ""}`}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 18, right: 18, bottom: 10, left: 8 }} accessibilityLayer title={`Ventas mensuales registradas del producto ${id}, en unidades`}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="month" ticks={ticks} tickFormatter={(value) => month(value)} tick={tick} axisLine={false} tickLine={false} dy={10} height={42} />
        <YAxis domain={[0, "auto"]} tick={tick} tickFormatter={(v) => number(v)} axisLine={false} tickLine={false} width={65} />
        <Tooltip content={<ChartTooltip />} />
        <Line dataKey="sales_units" name="Ventas registradas" type="linear" stroke={BUSINESS[id].color} strokeWidth={compact ? 3 : 4} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
})

export function TrendPanel({ id }) {
  const latest = product(id).ytd.at(-1)
  return <figure className="chart-panel">
    <ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel>
    <div className="chart-unit">Ventas mensuales registradas, unidades</div>
    <SalesChart id={id} />
    <figcaption className={`ytd product-${id.toLowerCase()}`}><strong>{percent(latest.yoy_growth)}</strong>
      <span>2026 frente a 2025<br />{id === "A" ? "Enero a agosto" : "Enero a septiembre"}</span>
    </figcaption>
  </figure>
}

export const ModelBars = React.memo(function ModelBars({ id, models, phase = "holdout" }) {
  const data = models.map((model) => ({ ...score(id, model, phase), name: MODEL_NAMES[model], locked: product(id).selection.model === model }))
  const max = Math.max(...data.map((row) => row.mae)) * 1.25
  return <figure className="comparison-figure">
    <figcaption>MAE en unidades por mes. Menor es mejor.</figcaption>
    <div className="model-bars">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 12, right: 65, bottom: 18, left: 0 }} accessibilityLayer title={`Error absoluto medio de los métodos comparados para el producto ${id}`}>
          <CartesianGrid stroke={grid} horizontal={false} />
          <XAxis type="number" domain={[0, max]} tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => number(v)} />
          <YAxis type="category" dataKey="name" width={285} tick={{ ...tick, fontSize: 21 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => [number(v, 2), "MAE"]} />
          <Bar dataKey="mae" barSize={29} isAnimationActive={false}>
            {data.map((row) => <Cell key={row.model} fill={row.locked ? BUSINESS[id].color : CHART_COLORS.dim} />)}
            <LabelList dataKey="mae" position="right" formatter={(v) => number(v, 2)} fill={CHART_COLORS.ink} fontSize={22} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </figure>
})

export const ForecastChart = React.memo(function ForecastChart({ id }) {
  const p = product(id)
  const data = p.predictions.filter((row) => row.model === p.selection.model).map((row) => ({
    month: row.target_month, actual: row.actual, selected: row.predicted,
    naive: p.predictions.find((other) => other.target_month === row.target_month && other.model === "naive").predicted,
  }))
  const ticks = data.filter((_, i) => i % 6 === 0).map((row) => row.month)
  return <div className="forecast-chart"><ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 0 }} accessibilityLayer title={`Ventas y pronósticos mensuales del producto ${id}. La zona sombreada marca la prueba final.`}>
      <CartesianGrid stroke={grid} vertical={false} />
      <XAxis dataKey="month" ticks={ticks} tickFormatter={(value) => month(value)} tick={tick} axisLine={false} tickLine={false} height={40} dy={8} />
      <YAxis domain={[0, "auto"]} tick={tick} axisLine={false} tickLine={false} width={62} />
      <ReferenceArea x1={p.selection.holdout_start} x2={p.selection.holdout_end} fill={CHART_COLORS.amberBg} fillOpacity={0.85} />
      <Tooltip content={<ChartTooltip />} />
      <Line dataKey="actual" name="Venta real registrada" stroke={CHART_COLORS.ink} strokeWidth={3} dot={{ r: 2 }} isAnimationActive={false} />
      <Line dataKey="selected" name={MODEL_NAMES[p.selection.model]} stroke={BUSINESS[id].color} strokeWidth={3} dot={false} isAnimationActive={false} />
      <Line dataKey="naive" name="Último mes" stroke={CHART_COLORS.muted} strokeDasharray="8 6" strokeWidth={2} dot={false} isAnimationActive={false} />
    </LineChart>
  </ResponsiveContainer></div>
})

export function CalendarHeatmap({ id }) {
  const data = product(id).monthly.filter((row) => row.complete_for_modeling)
  const max = Math.max(...data.map((row) => row.sales_units))
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return <figure className="calendar-figure">
    <ProductLabel id={id}>Ventas mensuales registradas</ProductLabel>
    <div className="calendar" role="table" aria-label={`Calendario de ventas del producto ${id}, en unidades. Sin dato indica un mes fuera de la muestra.`}>
      <div className="calendar-row" role="row"><span role="columnheader">Año</span>{months.map((m) => <span role="columnheader" key={m}>{m}</span>)}</div>
      {[2022, 2023, 2024, 2025, 2026].map((year) => <div className="calendar-row" role="row" key={year}>
        <span role="rowheader">{year}</span>{months.map((m, index) => {
          const row = data.find((entry) => entry.month.startsWith(`${year}-${String(index + 1).padStart(2, "0")}`))
          return <span role="cell" key={m} className={`calendar-cell ${!row ? "unavailable" : ""}`} style={row ? heatmapColor(id, row.sales_units, max) : undefined}>{row ? number(row.sales_units) : "s/d"}</span>
        })}
      </div>)}
    </div>
  </figure>
}

import React from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import evidence from "virtual:rujaf-evidence"
import { BUSINESS, MODEL_NAMES, month, number } from "./business.js"
import { ProductLabel } from "./ui.jsx"
import { CHART_COLORS, PRODUCT_STROKES, heatmapColor } from "./chart-colors.js"
import { forecastSeries, salesSeries } from "./analysis.js"

export const product = (id) => evidence.products[id]
export const portfolio = evidence
export const productIds = Object.keys(evidence.products)
export const score = (id, model, phase = "holdout") => product(id).comparison.find((row) => row.model === model && row.phase === phase)
const grid = CHART_COLORS.grid
const tick = { fill: CHART_COLORS.text, fontSize: 18 }
const lineStyle = {
  type: "linear",
  strokeWidth: 2.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  dot: false,
  activeDot: { r: 4, stroke: CHART_COLORS.paper, strokeWidth: 2 },
  isAnimationActive: false,
}
const lineCursor = { stroke: CHART_COLORS.muted, strokeOpacity: 0.3, strokeDasharray: "3 5" }
const barCursor = { fill: grid, fillOpacity: 0.35, stroke: "none" }

function ChartTooltip({ active, payload, label }) {
  const entries = payload?.filter((entry) => entry && entry.type !== "none") ?? []
  if (!active || !entries.length) return null
  return <div className="chart-tooltip"><strong>{/^\d{4}-/.test(String(label)) ? month(String(label), false) : label}</strong>
    {entries.map((entry) => <div key={entry.dataKey}><span><i style={{ background: entry.color }} aria-hidden="true" />{entry.name}</span><b>{number(entry.value, 1)} u.</b></div>)}
  </div>
}

// Los datos son estáticos: pausar el escenario no debe remontar los trazos de Recharts.
export const SalesChart = React.memo(function SalesChart({ id, domain, color }) {
  const data = product(id).monthly.filter((row) => row.complete_for_modeling).map((row) => ({ ...row, time: Date.parse(row.month) }))
  const range = domain || [data[0].time, data.at(-1).time]
  const ticks = [range[0], Date.UTC(2024, 0), range[1]]
  const stroke = color || PRODUCT_STROKES[id]
  return <div className="chart-wrap">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }} accessibilityLayer title={`Ventas mensuales registradas del producto ${id}, en unidades. ${month(data[0].month, false)} a ${month(data.at(-1).month, false)}. Escala vertical propia desde cero.`}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="time" type="number" scale="time" domain={range} ticks={ticks} tickFormatter={(value) => month(new Date(value).toISOString())} tick={tick} axisLine={false} tickLine={false} dy={6} height={34} />
        <YAxis domain={[0, "auto"]} tick={tick} tickFormatter={(v) => number(v)} axisLine={false} tickLine={false} width={55} tickCount={3} />
        <Tooltip cursor={lineCursor} content={({ active, payload }) => <ChartTooltip active={active} payload={payload} label={payload?.[0]?.payload.month} />} />
        <Line {...lineStyle} className="sales-identity" dataKey="sales_units" name="Ventas registradas" stroke={stroke} />
      </LineChart>
    </ResponsiveContainer>
  </div>
})

export const PortfolioSales = React.memo(function PortfolioSales() {
  const { series, domain } = salesSeries(evidence.products)
  return <figure className="portfolio-sales" aria-label="Evolución de las ventas de los cinco productos">
    <div className="product-chart-grid sales-grid">{series.map(({ id }) => <TrendPanel id={id} domain={domain} key={id} />)}</div>
  </figure>
})

export const BaselineComparison = React.memo(function BaselineComparison() {
  const data = productIds.map((id) => ({ id, relative: 100 * score(id, product(id).selection.model).mae / score(id, "naive").mae }))
  const max = Math.max(125, Math.ceil(Math.max(...data.map((row) => row.relative)) * 1.15 / 25) * 25)
  return <figure className="baseline-figure">
    <figcaption>MAE relativo · Último mes = 100</figcaption>
    <div className="baseline-bars"><ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 12, right: 65, bottom: 8, left: 0 }} accessibilityLayer title="Error del modelo fijado respecto al último mes. Por debajo de 100 indica menor MAE.">
        <CartesianGrid stroke={grid} horizontal={false} />
        <XAxis type="number" domain={[0, max]} ticks={[0, 50, 100]} tick={tick} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="id" width={30} tick={tick} axisLine={false} tickLine={false} />
        <ReferenceLine x={100} stroke={CHART_COLORS.muted} strokeDasharray="5 5" />
        <Tooltip cursor={barCursor} formatter={(value) => [number(value, 1), "Último mes = 100"]} />
        <Bar dataKey="relative" barSize={26} radius={[0, 4, 4, 0]} stroke="none" isAnimationActive={false}>
          {data.map((row) => <Cell key={row.id} fill={BUSINESS[row.id].color} />)}
          <LabelList dataKey="relative" position="right" formatter={(value) => number(value, 1)} fill={CHART_COLORS.ink} fontSize={20} />
        </Bar>
      </BarChart>
    </ResponsiveContainer></div>
  </figure>
})

export function TrendPanel({ id, domain }) {
  return <figure className="chart-panel" data-product={id}>
    <ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel>
    <SalesChart id={id} domain={domain} />
    <figcaption className="grid-ytd"><span>Unidades por mes · Escala propia</span></figcaption>
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
          <Tooltip cursor={barCursor} formatter={(v) => [number(v, 2), "MAE"]} />
          <Bar dataKey="mae" barSize={29} radius={[0, 4, 4, 0]} stroke="none" isAnimationActive={false}>
            {data.map((row) => <Cell key={row.model} fill={row.locked ? BUSINESS[id].color : CHART_COLORS.dim} />)}
            <LabelList dataKey="mae" position="right" formatter={(v) => number(v, 2)} fill={CHART_COLORS.ink} fontSize={22} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </figure>
})

export const ForecastChart = React.memo(function ForecastChart({ id, finalOnly = false }) {
  const p = product(id)
  const data = forecastSeries(p, finalOnly)
  const ticks = finalOnly ? [data[0].month, data[2].month, data.at(-1).month] : data.filter((_, i) => i % 6 === 0).map((row) => row.month)
  const max = Math.max(1, ...data.flatMap((row) => [row.actual, row.selected, row.naive ?? 0]))
  return <div className="forecast-chart"><ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 10, right: 20, bottom: 4, left: 0 }} accessibilityLayer title={`Ventas y pronósticos mensuales del producto ${id}. ${finalOnly ? `Seis meses de prueba final, ${month(p.selection.holdout_start)} a ${month(p.selection.holdout_end)}. Escala de 0 a ${number(max, 1)} unidades.` : "La zona sombreada marca la prueba final."}`}>
      <CartesianGrid stroke={grid} vertical={false} />
      <XAxis dataKey="month" ticks={ticks} tickFormatter={(value) => month(value)} tick={tick} axisLine={false} tickLine={false} height={34} dy={6} />
      <YAxis domain={finalOnly ? [0, max] : [0, "auto"]} tickCount={3} tickFormatter={(value) => number(value, finalOnly && max < 20 ? 1 : 0)} tick={tick} axisLine={false} tickLine={false} width={55} />
      {!finalOnly && <ReferenceArea x1={p.selection.holdout_start} x2={p.selection.holdout_end} fill={CHART_COLORS.amberBg} fillOpacity={0.85} stroke="none" />}
      <Tooltip cursor={lineCursor} content={<ChartTooltip />} />
      <Line {...lineStyle} className="actual-sales" dataKey="actual" name="Venta real registrada" stroke={CHART_COLORS.ink} strokeWidth={2.5} dot={{ r: 2.25, fill: CHART_COLORS.ink, stroke: "none" }} />
      <Line {...lineStyle} className="selected-forecast" dataKey="selected" name={MODEL_NAMES[p.selection.model]} stroke={PRODUCT_STROKES[id]} strokeDasharray="8 5" />
      <Line {...lineStyle} className="naive-forecast" dataKey="naive" name="Último mes" stroke={CHART_COLORS.muted} strokeDasharray="1 6" strokeWidth={2} activeDot={{ ...lineStyle.activeDot, r: 3 }} />
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

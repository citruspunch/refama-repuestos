import React, { useMemo } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { DURATION, responseAt, sampleResponse } from "./model"

export const INK = "#1c1028"
export const CAT_BLUE = "#4e79a7"
export const VIOLET = "#6c5fc7"
export const GRID = "#dbd6e1"

export function ChartCard({ title, legend = [], height = 320, children }) {
  return (
    <figure className="panel chart-card" aria-label={title}>
      <figcaption className="chart-head">
        <span className="chart-title">{title}</span>
        <span className="legend">{legend.map((entry) => <span key={entry.label}>
          <i style={{ background: entry.color }} aria-hidden="true" />{entry.label}
        </span>)}</span>
      </figcaption>
      <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
    </figure>
  )
}

/** Declared analytical model, not invented empirical comparison data. */
export function ResponseComparison() {
  const rows = useMemo(() => sampleResponse({ tau: 1 }).map((row) => ({ t: row.t, fast: row.y, slow: responseAt(row.t, 2) })), [])
  const tick = { fill: INK, fontSize: 13 }
  return <ChartCard title="Unit-step output · dimensionless" height={350} legend={[{ label: "τ = 1 s", color: CAT_BLUE }, { label: "τ = 2 s", color: VIOLET }]}>
    <LineChart data={rows} margin={{ top: 12, right: 24, bottom: 8, left: 4 }}>
      <CartesianGrid stroke={GRID} vertical={false} />
      <XAxis dataKey="t" type="number" domain={[0, DURATION]} ticks={[0, 1, 2, 3, 4]} unit=" s" tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis domain={[0, 1.05]} ticks={[0, 0.5, 1]} tick={tick} tickLine={false} axisLine={false} width={48} />
      <Tooltip formatter={(value, name) => [Number(value).toFixed(3), name]} labelFormatter={(value) => `t = ${Number(value).toFixed(2)} s`} />
      <ReferenceLine y={1} stroke={GRID} strokeDasharray="4 5" />
      <Line type="linear" dataKey="fast" name="τ = 1 s" stroke={CAT_BLUE} dot={false} strokeWidth={3} isAnimationActive={false} />
      <Line type="linear" dataKey="slow" name="τ = 2 s" stroke={VIOLET} strokeDasharray="7 4" dot={false} strokeWidth={3} isAnimationActive={false} />
    </LineChart>
  </ChartCard>
}

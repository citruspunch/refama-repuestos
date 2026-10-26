import React, { useId } from "react"
import { DURATION } from "./model"

/** A clock-owned trace: clip the reveal, never clamp the source measurements. */
export function LiveTrace({ rows, time, title = "Analytical unit-step response" }) {
  const id = useId()
  const width = 860
  const height = 360
  const pad = { l: 64, r: 24, t: 24, b: 48 }
  const W = width - pad.l - pad.r
  const H = height - pad.t - pad.b
  const X = (t) => pad.l + t / DURATION * W
  const Y = (y) => pad.t + H - y / 1.05 * H
  const path = rows.map((row, i) => `${i ? "L" : "M"} ${X(row.t)} ${Y(row.y)}`).join(" ")
  const revealWidth = Math.max(0, Math.min(W, time / DURATION * W))
  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`}>
    <title id={`${id}-title`}>{title}. Time in seconds, output dimensionless.</title>
    <defs><clipPath id={`${id}-clip`}><rect x={pad.l} y={pad.t} width={revealWidth} height={H} /></clipPath></defs>
    {[0, 0.5, 1].map((y) => <g key={y}>
      <line x1={pad.l} x2={pad.l + W} y1={Y(y)} y2={Y(y)} stroke="var(--line)" />
      <text x={pad.l - 12} y={Y(y)} textAnchor="end" dominantBaseline="middle">{y}</text>
    </g>)}
    {[0, 1, 2, 3, 4].map((t) => <text key={t} x={X(t)} y={height - 16} textAnchor="middle">{t} s</text>)}
    <path d={path} clipPath={`url(#${id}-clip)`} stroke="var(--cyan)" strokeWidth="3" fill="none" />
    <line x1={X(Math.min(DURATION, Math.max(0, time)))} x2={X(Math.min(DURATION, Math.max(0, time)))} y1={pad.t} y2={pad.t + H} stroke="var(--purple)" strokeDasharray="4 5" />
  </svg>
}

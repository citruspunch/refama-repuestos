import React from "react"
import evidence from "virtual:rujaf-evidence"
import { month, number } from "./business.js"
import { useCueState, usePresentation } from "./PresentationContext.jsx"
import { Slide } from "./ui.jsx"
import { BASELINE_LABELS, MODEL_LESSONS, REGRESSION_EXAMPLE, baselineLesson, regressionLesson } from "./model-lessons.js"
import "./ModelLessons.css"

const lesson = (id) => MODEL_LESSONS.find((entry) => entry.id === id)
function Tabs({ options, value, onChange }) {
  const { guided } = usePresentation()
  return <div className="lesson-tabs" role="group" aria-label="Concepto del modelo">
    {options.map(([id, label]) => <button key={id} type="button" disabled={guided} aria-pressed={value === id} onClick={() => onChange(id)}>{label}</button>)}
  </div>
}

function Frame({ id, model, children, footer = "Ejemplo didáctico" }) {
  return <Slide className="model-lesson">
    <div className="lesson-body" data-lesson={id} data-model={model}>{children}</div>
    {footer ? <p className="lesson-footer">{footer}</p> : null}
  </Slide>
}

function Diagram({ label, wide = false, children }) {
  return <svg className={`lesson-diagram${wide ? " wide" : ""}`} viewBox={`0 0 ${wide ? 1360 : 1000} 360`} role="img" aria-label={label}>
    {children}
  </svg>
}

function Readout({ title, children, value, unit, detail }) {
  return <div className="lesson-readout"><h3>{title}</h3>{value !== undefined && <strong data-testid="lesson-prediction">{number(value, 1)}<small>{unit}</small></strong>}<p>{children}</p>{detail && <span className="lesson-detail">{detail}</span>}</div>
}

export function BaselineLesson() {
  const id = "modelos-referencias"
  const [method, setMethod] = useCueState("method", "naive")
  const [monthsBack] = useCueState("monthsBack", 1)
  const p = evidence.products.B
  const data = baselineLesson(p.monthly, method, monthsBack)
  const copy = BASELINE_LABELS[method]
  const max = Math.ceil(Math.max(...p.monthly.filter((row) => row.complete_for_modeling).slice(-13).map((row) => row.sales_units)) / 50) * 50
  const x = (i) => 60 + i * 68
  const y = (value) => 286 - value / max * 220
  const first = data.selected.findIndex(Boolean)
  return <Frame id={id} model={method} footer="">
    <Tabs options={lesson(id).models.map((model) => [model, BASELINE_LABELS[model].tab])} value={method} onChange={setMethod} />
    <div className="lesson-visual" key={`${method}:${monthsBack}`}>
      <Diagram label={`${copy.tab}: ${data.used} meses usados y previsión de ${number(data.prediction, 1)} unidades. Las barras resaltadas aportan a la referencia.`}>
        <text x="24" y="28" className="diagram-caption">Ventas pasadas</text>
        {first >= 0 && <rect x={x(first) - 23} y="44" width={x(data.selected.lastIndexOf(true)) - x(first) + 46} height="254" rx="8" className="diagram-window" />}
        {[0, max / 2, max].map((value) => <g key={value}><line x1="36" x2="974" y1={y(value)} y2={y(value)} className="diagram-grid" /><text x="24" y={y(value) + 6} textAnchor="end" className="diagram-tick">{number(value)}</text></g>)}
        {data.shown.map((row, i) => <g key={row.month}>
          <rect x={x(i) - 15} y={y(row.sales_units)} width="30" height={286 - y(row.sales_units)} rx="3" className={`lesson-bar ${data.selected[i] ? "diagram-bar-selected" : "diagram-bar"}`} />
          {(i % 3 === 0 || i === 11) && <text x={x(i)} y="320" textAnchor="middle" className="diagram-tick">{month(row.month)}</text>}
        </g>)}
        <line x1="866" x2="866" y1="44" y2="298" className="diagram-cutoff" />
        <g className="lesson-trace">
          <path d={`M${first < 0 ? 886 : x(first)},${y(data.prediction)} H942`} className="diagram-projection" />
          {data.prediction > 0 ? <rect x="927" y={y(data.prediction)} width="30" height={286 - y(data.prediction)} rx="3" className="diagram-bar-forecast lesson-bar" /> : <circle cx="942" cy="286" r="6" className="diagram-forecast-dot" />}
        </g>
        <text x="940" y="320" textAnchor="middle" className="diagram-tick">Siguiente</text>
        <text x="440" y="352" textAnchor="middle" className="diagram-caption">{data.used} {data.used === 1 ? "mes aporta" : "meses aportan"}</text>
      </Diagram>
      <Readout title={copy.title} value={data.prediction} unit="u./mes">{copy.text}</Readout>
    </div>
  </Frame>
}

export function RegressionLesson() {
  const [method, setMethod] = useCueState("method", "linear_regression")
  const ridge = method === "ridge", ordinary = regressionLesson(), fitted = regressionLesson(ridge)
  const x = (value) => 70 + value * 84, y = (value) => 285 - value * 1.85
  return <Frame id="regresion" model={method} footer="Ejemplo con una variable. Nuestro modelo combina varias entradas.">
    <Tabs options={[["linear_regression", "Regresión lineal"], ["ridge", "Ridge"]]} value={method} onChange={setMethod} />
    <div className="lesson-visual regression-visual" key={method}>
      <Diagram label={`${ridge ? "Ridge" : "Regresión lineal"}: puntos didácticos y recta de un predictor. Ridge reduce el peso en este ejemplo estandarizado, sin garantizar una mejor predicción.`}>
        <text x="20" y="26" className="diagram-caption">Venta siguiente, u.</text>
        {[0, 60, 120].map((value) => <g key={value}><line x1="55" x2="920" y1={y(value)} y2={y(value)} className="diagram-grid" /><text x="40" y={y(value) + 6} textAnchor="end" className="diagram-tick">{value}</text></g>)}
        {REGRESSION_EXAMPLE.map((row) => <circle key={row.x} cx={x(row.x)} cy={y(row.y)} r="6" className="diagram-observation" />)}
        {ridge && <path d={`M${x(0)},${y(ordinary.predict(0))} L${x(9)},${y(ordinary.predict(9))}`} className="diagram-ghost" />}
        <path d={`M${x(0)},${y(fitted.predict(0))} L${x(9)},${y(fitted.predict(9))}`} className={`${ridge ? "diagram-projection" : "diagram-signal"} lesson-trace`} />
        <circle cx={x(9)} cy={y(fitted.predict(9))} r="7" className="diagram-forecast-dot lesson-pop" />
        <text x="440" y="335" textAnchor="middle" className="diagram-caption">Una señal de ventas: de menor a mayor</text>
      </Diagram>
      <Readout title={ridge ? "Ridge" : "Regresión lineal"}>
        {ridge ? "Penaliza los pesos muy grandes para reducir el sobreajuste al historial." : "Aprende cómo combinar las variables para estimar las ventas del mes siguiente."}
        <span className="lesson-weight"><span>Influencia de la señal</span><i><b style={{ width: `${100 * fitted.weight / ordinary.weight}%` }} /></i></span>
      </Readout>
    </div>
  </Frame>
}

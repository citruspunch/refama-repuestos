import React from "react"
import { ArrowLeft, ArrowRight, ExitFullscreen, Fullscreen, Note as NoteIcon, RotateLeft, Timer, Sliders } from "reicon-react"
import { usePresentation } from "./PresentationContext.jsx"
import { NumberTicker } from "./NumberTicker.jsx"

const ICONS = {
  "arrow-left": ArrowLeft, "arrow-right": ArrowRight,
  "exit-fullscreen": ExitFullscreen, fullscreen: Fullscreen,
  note: NoteIcon, "rotate-left": RotateLeft, timer: Timer, sliders: Sliders,
}

export function Icon({ name }) {
  const Component = ICONS[name]
  if (!Component) throw new Error(`Ícono desconocido: ${name}`)
  return <Component size="1em" weight="Outline" aria-hidden="true" focusable="false" />
}

export function Slide({ children, className = "", takeaway, caveat }) {
  const { title } = usePresentation()
  return <section className={`slide ${className}`}>
    <header className="slide-head"><h2>{title}</h2></header>
    <div className="content">{children}</div>
    {takeaway && <p className="takeaway">{takeaway}</p>}
    {caveat && <p className="caveat">{caveat}</p>}
  </section>
}

export function Metric({ value, label, detail, tone = "ink", animate = false, decimalPlaces = 0 }) {
  return <div className={`metric ${tone}`}><strong>{animate ? <NumberTicker value={value} decimalPlaces={decimalPlaces} /> : value}</strong><span>{label}</span>{detail && <small>{detail}</small>}</div>
}

export function Flow({ items, vertical = false }) {
  return <ol className={`flow ${vertical ? "vertical" : ""}`}>{items.map((item, i) => <li key={i} style={{ "--i": i }}>
    <span className="flow-num">{String(i + 1).padStart(2, "0")}</span>
    <h3>{item.title}</h3>{item.text && <p>{item.text}</p>}
  </li>)}</ol>
}

export function Rows({ items }) {
  return <ul className="rows">{items.map(([title, text], index) => <li key={index} style={{ "--i": index }}><h3>{title}</h3><p>{text}</p></li>)}</ul>
}

export function Note({ children, warning = false }) {
  return <div className={`note ${warning ? "warning" : ""}`}>{children}</div>
}

export function ProductLabel({ id, children }) {
  return <div className={`product-label product-${id.toLowerCase()}`}><b>{id}</b><span>{children}</span></div>
}

export function InlineProduct({ id }) {
  return <b className={`inline-product product-${id.toLowerCase()}`} aria-label={`Producto ${id}`}>{id}</b>
}

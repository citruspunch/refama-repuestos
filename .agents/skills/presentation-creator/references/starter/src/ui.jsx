import React, { useId, useMemo } from "react"
import katex from "katex"
import { ArrowLeft, ArrowRight, CheckCircle, ExitFullscreen, Fullscreen, Note, RotateLeft, Sliders, Timer } from "reicon-react"
import { usePresentation } from "./PresentationContext"

const ICONS = {
  "arrow-left": ArrowLeft, "arrow-right": ArrowRight, "check-circle": CheckCircle,
  "exit-fullscreen": ExitFullscreen, fullscreen: Fullscreen, note: Note,
  "rotate-left": RotateLeft, sliders: Sliders, timer: Timer,
}

export function Icon({ name, size = "1em", ...props }) {
  const Component = ICONS[name]
  if (!Component) throw new Error(`Unknown icon: ${name}. Add an explicit reicon-react import.`)
  return <Component size={size} weight="Outline" aria-hidden="true" focusable="false" {...props} />
}

export function Head({ children }) {
  const { title } = usePresentation()
  return <div className="slide-head rise"><h2>{children || title}</h2></div>
}

export function Rise({ as: Tag = "div", d = 0.05, className = "", style, children, ...props }) {
  return <Tag className={`rise ${className}`} style={{ animationDelay: `${Math.min(0.15, Math.max(0, d))}s`, ...style }} {...props}>{children}</Tag>
}

export function Facts({ items }) {
  return <ul className="facts">{items.map((item, i) => (
    <li key={i} className={item.kind || ""}>
      <span className="fi"><Icon name={item.icon || "check-circle"} /></span><span>{item.text}</span>
    </li>
  ))}</ul>
}

export function Big({ children, cap, color = "ink" }) {
  return <div className="bignum-block" style={{ "--c": `var(--${color})` }}>
    <div className="bignum">{children}</div>{cap && <div className="cap">{cap}</div>}
  </div>
}

/** Keep MathML available; never trust arbitrary HTML/URL commands in math. */
export function Tex({ children, block = false }) {
  const html = useMemo(() => katex.renderToString(String(children), {
    displayMode: block, throwOnError: false, trust: false, output: "htmlAndMathml",
  }), [children, block])
  return <span className={`tex${block ? " tex-block" : ""}`} dangerouslySetInnerHTML={{ __html: html }} />
}

export function M({ children }) {
  return <Tex>{children}</Tex>
}

export function Slider({ label, display, min, max, step = 1, value, onChange }) {
  const { guided } = usePresentation()
  const id = useId()
  return <label className="slider">
    <span className="slider-top"><span id={id}>{label}</span><b>{display}</b></span>
    <input type="range" aria-labelledby={id} min={min} max={max} step={step} value={value} disabled={guided} style={{ "--p": `${(value - min) / (max - min) * 100}%` }} onChange={(event) => onChange(Number(event.target.value))} />
  </label>
}

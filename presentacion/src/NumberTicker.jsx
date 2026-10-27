import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { number } from "./business.js"
import { usePresentation } from "./PresentationContext.jsx"

const DELAY = 140
const DURATION = 1100

// Entrada finita: comparte pausa/repetición con la presentación, sin otro motor de animación.
export function NumberTicker({ value, decimalPlaces = 0 }) {
  const { replayToken } = usePresentation()
  const visual = useRef(null)
  const elapsed = useRef(0)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const formatter = useMemo(() => new Intl.NumberFormat("es-GT", {
    minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces,
  }), [decimalPlaces])
  const finalValue = number(value, decimalPlaces)
  const canAnimate = Number.isFinite(value) && value > 0

  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useLayoutEffect(() => {
    elapsed.current = 0
    visual.current.textContent = reducedMotion || !canAnimate ? finalValue : formatter.format(0)
  }, [value, formatter, finalValue, canAnimate, replayToken])

  useEffect(() => {
    if (reducedMotion || !canAnimate) {
      visual.current.textContent = finalValue
      elapsed.current = DELAY + DURATION
      return
    }
    if (elapsed.current >= DELAY + DURATION) return
    let frame
    let previous = null
    const tick = (now) => {
      if (previous !== null) elapsed.current += now - previous
      previous = now
      const progress = Math.min(1, Math.max(0, (elapsed.current - DELAY) / DURATION))
      // Desaceleración suave, sin rebote ni valores por encima del dato real.
      visual.current.textContent = progress === 1 ? finalValue : formatter.format(value * (1 - (1 - progress) ** 4))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, formatter, finalValue, canAnimate, reducedMotion, replayToken])

  return <span className="number-ticker" role="img" aria-label={finalValue} data-value={finalValue}>
    <span ref={visual} aria-hidden="true">{finalValue}</span>
  </span>
}

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"

export const PresentationContext = createContext({
  guided: true, paused: false, reducedMotion: false,
  cue: { values: {} }, previousCue: null, clockKey: "", step: 0, title: "",
})

export const usePresentation = () => useContext(PresentationContext)
const readOnly = () => {}

/** Present selects absolute scripted values; Explore starts from that scenario. */
export function useCueState(name, initialValue) {
  const { guided, cue } = usePresentation()
  const [local, setLocal] = useState(initialValue)
  const scripted = cue.values[name]
  useEffect(() => {
    if (guided && scripted !== undefined) setLocal(scripted)
  }, [guided, scripted])
  return [guided && scripted !== undefined ? scripted : local, guided ? readOnly : setLocal]
}

/** Finite by default. Optional Explore loops never advance the story. */
export function useClock({ duration = 0, loop = 0, running = true, resetKey = "", resetOnStep = true } = {}) {
  const { guided, paused, reducedMotion, clockKey, step } = usePresentation()
  const [time, setTime] = useState(0)
  const elapsed = useRef(0)
  const epoch = `${clockKey}:${resetOnStep ? step : "continuous"}:${resetKey}:${duration}:${loop}`
  const end = guided || !loop ? duration : 0
  useLayoutEffect(() => { elapsed.current = 0; setTime(0) }, [epoch])
  useEffect(() => {
    if (!running) { elapsed.current = 0; setTime(0); return }
    if (reducedMotion) { elapsed.current = duration || loop; setTime(elapsed.current); return }
    if (paused || (!end && (guided || !loop)) || (end && elapsed.current >= end)) return
    let raf
    let previous = null
    const tick = (now) => {
      if (previous !== null) {
        elapsed.current += Math.min(0.05, (now - previous) / 1000)
        if (end) elapsed.current = Math.min(end, elapsed.current)
        else if (loop) elapsed.current %= loop
        setTime(elapsed.current)
      }
      previous = now
      if (!end || elapsed.current < end) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [epoch, duration, loop, end, guided, running, paused, reducedMotion])
  return time
}

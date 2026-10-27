import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { SLIDES } from "./slides.jsx"
import { Icon } from "./ui.jsx"
import { PresentationContext } from "./PresentationContext.jsx"
import { assembleSlides, lastMainSlide, movePosition, normalizePosition, positionFromLocation, positionHash, presentationProgress } from "./presentation.js"

const ALL_SLIDES = assembleSlides(SLIDES)
const MAIN_END = lastMainSlide(ALL_SLIDES)
const samePosition = (a, b) => a.slide === b.slide && a.step === b.step

function useStageScale() {
  const measure = () => Math.min(window.innerWidth / 1600, window.innerHeight / 900)
  const [scale, setScale] = useState(measure)
  useEffect(() => {
    const update = () => setScale(measure())
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return scale
}

function Modal({ open, onClose, title, id, children, className = "" }) {
  const ref = useRef(null)
  const origin = useRef(null)
  useEffect(() => {
    if (open) {
      origin.current = document.activeElement
      if (!ref.current.open) ref.current.showModal()
    } else if (ref.current.open) {
      ref.current.close()
      origin.current?.focus?.({ preventScroll: true })
    }
  }, [open])
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={id} onCancel={(event) => { event.preventDefault(); onClose() }} onClose={onClose}>
    <div className="modal-heading"><h3 id={id}>{title}</h3><button onClick={onClose} autoFocus aria-label="Cerrar diálogo">Cerrar</button></div>
    {children}
  </dialog>
}

function Nav({ position, go, fullscreen, toggleFullscreen, idle, replay, showHelp }) {
  const previous = movePosition(position, -1, { slides: ALL_SLIDES })
  const next = movePosition(position, 1, { slides: ALL_SLIDES })
  return <nav className={`nav${idle ? " idle" : ""}`} aria-label="Controles de presentación">
    <button onClick={toggleFullscreen} aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"} title="Pantalla completa · F"><Icon name={fullscreen ? "exit-fullscreen" : "fullscreen"} /></button>
    <button onClick={() => go(-1)} disabled={samePosition(previous, position)} aria-label="Paso anterior" title="Anterior · Flecha izquierda"><Icon name="arrow-left" /></button>
    <span className="count">{String(position.slide + 1).padStart(2, "0")} / {ALL_SLIDES.length}</span>
    <button onClick={() => go(1)} disabled={samePosition(next, position)} aria-label="Paso siguiente" title="Siguiente · Flecha derecha"><Icon name="arrow-right" /></button>
    <div className="nav-tools">
      <button onClick={replay} aria-label="Repetir entrada" title="Repetir · R"><Icon name="rotate-left" /></button>
      <button onClick={showHelp} aria-label="Atajos de teclado" title="Ayuda · ?"><Icon name="note" /></button>
    </div>
  </nav>
}

export default function App() {
  const [position, setPosition] = useState(() => positionFromLocation(window.location, ALL_SLIDES))
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement)
  const [idle, setIdle] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [replayToken, setReplayToken] = useState(0)
  const [sceneRevision, setSceneRevision] = useState(0)
  const [direction, setDirection] = useState(1)
  const frame = useRef(null)
  const scale = useStageScale()
  const { slide: cur, step } = position
  const scene = ALL_SLIDES[cur]

  // Repite también las entradas de los gráficos sin desmontar los controles de Explorar.
  useLayoutEffect(() => {
    frame.current?.getAnimations({ subtree: true }).forEach((animation) => {
      animation.currentTime = 0
    })
  }, [scene.id, replayToken])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.hash = positionHash(position)
    url.searchParams.delete("mode")
    window.history.replaceState(null, "", url)
  }, [position])

  useEffect(() => {
    const readPosition = () => { setPosition(positionFromLocation(window.location, ALL_SLIDES)) }
    window.addEventListener("hashchange", readPosition)
    window.addEventListener("popstate", readPosition)
    return () => { window.removeEventListener("hashchange", readPosition); window.removeEventListener("popstate", readPosition) }
  }, [])

  const go = useCallback((delta, bySlide = false) => {
    setDirection(delta)
    setPosition((current) => movePosition(current, delta, { bySlide, slides: ALL_SLIDES }))
  }, [])

  const jump = useCallback((slide, targetStep = 0) => {
    setDirection(slide >= cur ? 1 : -1)
    setSceneRevision((revision) => revision + 1)
    setPosition((current) => normalizePosition({ ...current, slide, step: targetStep }, ALL_SLIDES))
  }, [cur, step])

  const replay = useCallback(() => {
    setReplayToken((token) => token + 1)
    setSceneRevision((revision) => revision + 1)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    const update = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", update)
    return () => document.removeEventListener("fullscreenchange", update)
  }, [])

  useEffect(() => {
    let timer
    const wake = () => { setIdle(false); clearTimeout(timer); timer = setTimeout(() => setIdle(true), 3200) }
    const events = ["pointermove", "pointerdown", "keydown", "focusin"]
    events.forEach((name) => window.addEventListener(name, wake))
    wake()
    return () => { clearTimeout(timer); events.forEach((name) => window.removeEventListener(name, wake)) }
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (helpOpen || event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest("textarea, select, [contenteditable]:not([contenteditable='false']), dialog[open]")) return
      const input = target?.closest("input")
      if (input && (input.type !== "range" || ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", " ", "PageUp", "PageDown"].includes(event.key))) return
      if (target?.closest("[role='application']") && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", " ", "PageUp", "PageDown"].includes(event.key)) return
      if ([" ", "Enter"].includes(event.key) && target?.closest("button, a[href], summary, [role='button']")) return
      const key = event.key.toLowerCase()
      let action
      if (["ArrowRight", " ", "PageDown"].includes(event.key)) action = () => go(1, event.shiftKey && event.key === "ArrowRight")
      else if (["ArrowLeft", "PageUp"].includes(event.key)) action = () => go(-1, event.shiftKey && event.key === "ArrowLeft")
      else if (event.key === "Home") action = () => jump(0)
      else if (event.key === "End") action = () => jump(MAIN_END, ALL_SLIDES[MAIN_END].cues.length - 1)
      else if (key === "f") action = toggleFullscreen
      else if (key === "r") action = replay
      else if (key === "?" || key === "h") action = () => setHelpOpen(true)
      if (action) { event.preventDefault(); action() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [helpOpen, go, jump, toggleFullscreen, replay])

  const context = useMemo(() => ({ guided: true, replayToken, cue: scene.cues[step], title: scene.title }), [replayToken, scene, step])
  const CurrentSlide = scene.C

  return <PresentationContext.Provider value={context}>
    <div className={`viewport guided`} data-slide={cur} data-step={step}>
      <div className="progress" style={{ width: `${presentationProgress(position, ALL_SLIDES) * 100}%` }} />
      <p className="sr-only" role="status">{scene.title}. Paso {step + 1} de {scene.cues.length}.</p>
      <div className="stage" style={{ "--s": scale }}>
        <div ref={frame} className="slide-frame" key={scene.id} style={{ "--direction": direction }}>
          <CurrentSlide key={`${scene.id}:${sceneRevision}`} />
        </div>
        <div className="cue-rail">{scene.cues.length > 1 && <div className="cue-steps" aria-label={`Paso ${step + 1} de ${scene.cues.length}`}>
          {scene.cues.map((_, index) => <span key={index} className={`cue-segment${index === step ? " current" : ""}`} />)}
          <span>{step + 1} / {scene.cues.length}</span>
        </div>}</div>
      </div>
      <Nav position={position} go={go} fullscreen={fullscreen} toggleFullscreen={toggleFullscreen} idle={idle} replay={replay} showHelp={() => setHelpOpen(true)} />
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Controles de la presentación" id="shortcut-title">
        <p>Presentar sigue los pasos del guion. No entrena modelos ni calcula un plan en vivo.</p>
        <dl className="shortcut-list">
          <div><dt>Siguiente o anterior</dt><dd>→ / ← · Espacio · Av Pág / Re Pág</dd></div>
          <div><dt>Saltar una diapositiva</dt><dd>Mayús + → / ←</dd></div>
          <div><dt>Repetir entradas visuales</dt><dd>R</dd></div>
          <div><dt>Pantalla completa</dt><dd>F · Esc para salir</dd></div>
          <div><dt>Inicio o cierre</dt><dd>Inicio / Fin</dd></div>
          <div><dt>Ayuda</dt><dd>? / H</dd></div>
        </dl>
        <p>No hay avance automático. La URL conserva la diapositiva y el paso. Las notas y los tiempos están en GUION.md, fuera de la pantalla de la audiencia.</p>
      </Modal>
    </div>
  </PresentationContext.Provider>
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { SLIDES } from "./slides"
import { Icon } from "./ui"
import { PresentationContext } from "./PresentationContext"
import { assembleSlides, lastMainSlide, movePosition, normalizePosition, positionFromLocation, positionHash, presentationProgress } from "./presentation"

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

function Nav({ position, go, jump, fullscreen, toggleFullscreen, idle, paused, replay, togglePause, toggleMode, showHelp }) {
  const previous = movePosition(position, -1, { slides: ALL_SLIDES })
  const next = movePosition(position, 1, { slides: ALL_SLIDES })
  return <nav className={`nav${idle ? " idle" : ""}`} aria-label="Presentation controls">
    <button onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"} title="Fullscreen (F)"><Icon name={fullscreen ? "exit-fullscreen" : "fullscreen"} /></button>
    <button onClick={() => go(-1)} disabled={samePosition(previous, position)} aria-label="Previous step" title="Previous (← / PageUp)"><Icon name="arrow-left" /></button>
    <div className="dots">{ALL_SLIDES.map((slide, index) => <button key={slide.id}
      className={`${index === position.slide ? "on" : ""}${slide.appendix ? " appendix-dot" : ""}`}
      onClick={() => jump(index)} aria-label={`Slide ${index + 1}: ${slide.title}`} aria-current={index === position.slide ? "page" : undefined}
      title={`${slide.appendix ? "Appendix" : `Slide ${index + 1}`} · ${slide.title}`} />)}</div>
    <button onClick={() => go(1)} disabled={samePosition(next, position)} aria-label="Next step" title="Next (→ / Space / PageDown)"><Icon name="arrow-right" /></button>
    <span className="count">{position.slide > MAIN_END ? "Appendix" : `${position.slide + 1} / ${MAIN_END + 1}`}</span>
    <div className="nav-tools">
      <button onClick={replay} aria-label="Replay current step" title="Replay (R)"><Icon name="rotate-left" /></button>
      <button onClick={togglePause} aria-label={paused ? "Resume animations" : "Pause animations"} aria-pressed={paused} title="Pause / resume (P)"><Icon name="timer" /></button>
      <button className="mode-toggle" onClick={toggleMode} aria-label={`Switch to ${position.mode === "present" ? "Explore" : "Present"} mode`} title="Present / Explore (G)">{position.mode === "present" ? "Present" : "Explore"}</button>
      <button onClick={showHelp} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)"><Icon name="note" /></button>
    </div>
  </nav>
}

function ShortcutHelp({ open, onClose }) {
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
  return <dialog ref={ref} className="shortcut-dialog" aria-labelledby="shortcut-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClose={onClose}>
    <div className="shortcut-heading"><h3 id="shortcut-title">Presentation controls</h3><button onClick={onClose} autoFocus aria-label="Close shortcuts">Esc</button></div>
    <p>Present follows scripted cues. Explore unlocks the controls.</p>
    <dl>
      <div><dt>Next / previous cue</dt><dd>→ / ← · Space · PageDown / PageUp</dd></div>
      <div><dt>Skip a slide</dt><dd>Shift + → / ←</dd></div>
      <div><dt>Replay / pause / mode</dt><dd>R / P / G</dd></div>
      <div><dt>Fullscreen</dt><dd>F · Esc exits</dd></div>
      <div><dt>Appendix / return</dt><dd>A</dd></div>
      <div><dt>Start / conclusion</dt><dd>Home / End</dd></div>
    </dl>
    <p>Your slide and cue are saved in the URL. A standard arrow-key or PageDown clicker works without setup.</p>
  </dialog>
}

export default function App() {
  const [position, setPosition] = useState(() => positionFromLocation(window.location, ALL_SLIDES))
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement)
  const [idle, setIdle] = useState(false)
  const [paused, setPaused] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [replayToken, setReplayToken] = useState(0)
  const [sceneRevision, setSceneRevision] = useState(0)
  const [direction, setDirection] = useState(1)
  const appendixReturn = useRef(null)
  const reducedMotion = !!useReducedMotion()
  const scale = useStageScale()
  const { slide: cur, step, mode } = position
  const scene = ALL_SLIDES[cur]

  useEffect(() => {
    const url = new URL(window.location.href)
    url.hash = positionHash(position)
    if (mode === "explore") url.searchParams.set("mode", "explore")
    else url.searchParams.delete("mode")
    window.history.replaceState(null, "", url)
  }, [position, mode])

  useEffect(() => {
    const readPosition = () => { setPosition(positionFromLocation(window.location, ALL_SLIDES)); setPaused(false) }
    window.addEventListener("hashchange", readPosition)
    window.addEventListener("popstate", readPosition)
    return () => { window.removeEventListener("hashchange", readPosition); window.removeEventListener("popstate", readPosition) }
  }, [])

  const go = useCallback((delta, bySlide = false) => {
    setDirection(delta)
    setPaused(false)
    setPosition((current) => movePosition(current, delta, { bySlide, slides: ALL_SLIDES }))
  }, [])

  const jump = useCallback((slide, targetStep = 0) => {
    setDirection(slide >= cur ? 1 : -1)
    setPaused(false)
    setSceneRevision((revision) => revision + 1)
    setPosition((current) => normalizePosition({ ...current, slide, step: targetStep }, ALL_SLIDES))
  }, [cur])

  const replay = useCallback(() => {
    setPaused(false)
    setReplayToken((token) => token + 1)
    if (mode === "present") setSceneRevision((revision) => revision + 1)
  }, [mode])

  const toggleMode = useCallback(() => {
    setPaused(false)
    setPosition((current) => ({ ...current, mode: current.mode === "present" ? "explore" : "present" }))
  }, [])

  const toggleAppendix = useCallback(() => {
    if (cur > MAIN_END) {
      const back = appendixReturn.current || { slide: MAIN_END, step: ALL_SLIDES[MAIN_END].cues.length - 1 }
      jump(back.slide, back.step)
    } else if (MAIN_END + 1 < ALL_SLIDES.length) {
      appendixReturn.current = { slide: cur, step }
      jump(MAIN_END + 1)
    }
  }, [cur, step, jump])

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
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), 3200)
    }
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
      if (target?.closest("[role='application']") && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", " "].includes(event.key)) return
      // Let native Space/Enter activation fire exactly one button/link action.
      if ([" ", "Enter"].includes(event.key) && target?.closest("button, a[href], summary, [role='button']")) return
      const key = event.key.toLowerCase()
      let action
      if (["ArrowRight", " ", "PageDown"].includes(event.key)) action = () => go(1, event.shiftKey && event.key === "ArrowRight")
      else if (["ArrowLeft", "PageUp"].includes(event.key)) action = () => go(-1, event.shiftKey && event.key === "ArrowLeft")
      else if (event.key === "Home") action = () => jump(0)
      else if (event.key === "End") action = () => {
        const end = mode === "present" ? MAIN_END : ALL_SLIDES.length - 1
        jump(end, mode === "present" ? ALL_SLIDES[end].cues.length - 1 : 0)
      }
      else if (key === "f") action = toggleFullscreen
      else if (key === "r") action = replay
      else if (key === "p") action = () => setPaused((value) => !value)
      else if (key === "g") action = toggleMode
      else if (key === "a") action = toggleAppendix
      else if (key === "?" || key === "h") action = () => setHelpOpen(true)
      if (action) { event.preventDefault(); action() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [helpOpen, go, jump, mode, toggleFullscreen, replay, toggleMode, toggleAppendix])

  useEffect(() => {
    document.querySelectorAll(".stage svg").forEach((svg) => {
      if (paused) svg.pauseAnimations?.()
      else svg.unpauseAnimations?.()
    })
  }, [paused, cur, step, sceneRevision])

  const context = useMemo(() => ({
    guided: mode === "present", paused, reducedMotion,
    cue: scene.cues[step], previousCue: scene.cues[step - 1] || null,
    clockKey: `${cur}:${mode}:${replayToken}:${sceneRevision}`, step, title: scene.title,
  }), [mode, paused, reducedMotion, scene, step, cur, replayToken, sceneRevision])
  const CurrentSlide = scene.C

  return <PresentationContext.Provider value={context}>
    <div className={`viewport ${mode === "present" ? "guided" : "explore"}${paused ? " is-paused" : ""}`} data-slide={cur} data-step={step} data-mode={mode}>
      <div className="progress" style={{ width: `${presentationProgress(position, ALL_SLIDES) * 100}%` }} />
      <p className="sr-only" role="status">{scene.title}, step {step + 1} of {scene.cues.length}</p>
      <div className="stage" style={{ "--s": scale }}>
        {cur > 0 && <div className="hud"><span className="live" />{scene.ch}</div>}
        <motion.div className="slide-frame" key={scene.id} initial={{ opacity: 0, x: reducedMotion ? 0 : direction * 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <CurrentSlide key={`${scene.id}:${sceneRevision}`} />
        </motion.div>
        <div className="cue-rail">{mode === "present" && scene.cues.length > 1 && <div className="cue-steps" aria-label={`Step ${step + 1} of ${scene.cues.length}`}>
          {scene.cues.map((entry, index) => <span key={index} className={`cue-segment${index === step ? " current" : index < step ? " done" : ""}`} />)}
          <span className="cue-fraction">{step + 1} / {scene.cues.length}</span>
        </div>}</div>
      </div>
      <Nav position={position} go={go} jump={jump} fullscreen={fullscreen} toggleFullscreen={toggleFullscreen} idle={idle} paused={paused} replay={replay} togglePause={() => setPaused((value) => !value)} toggleMode={toggleMode} showHelp={() => setHelpOpen(true)} />
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  </PresentationContext.Provider>
}

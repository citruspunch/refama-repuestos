/** @typedef {{label: string, values: Record<string, string | number | boolean>}} Cue */
/** @typedef {{id: string, title: string, appendix?: boolean, cues: Cue[]}} Scene */
/** @typedef {{slide: number, step: number, mode: "present" | "explore"}} Position */

const cue = (label, values = {}) => ({ label, values })

/** @type {Scene[]} */
export const STORY = [
  { id: "title", title: "First-order response", cues: [cue("Introduce the analytical teaching example")] },
  { id: "response", title: "Response to a unit step", cues: [
    cue("Define the initial state and command", { tau: 1, run: false }),
    cue("Run the response with a 1 s time constant", { tau: 1, run: true }),
    cue("Compare a 2 s time constant", { tau: 2, run: true }),
  ] },
  { id: "comparison", title: "Comparing time constants", cues: [cue("Compare both analytical responses on the same axes")] },
  { id: "conclusions", title: "Conclusions", cues: [cue("Explain the result and limits of this model")] },
  { id: "appendix", title: "Appendix: model and evidence", appendix: true, cues: [cue("Review equations, assumptions, and reproducibility")] },
]

const nonempty = (value) => typeof value === "string" && value.trim().length > 0
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const scalar = (value) => typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))
const check = (condition, message) => { if (!condition) throw new Error(`Invalid storyboard: ${message}`) }

export function validateStory(story = STORY) {
  check(Array.isArray(story) && story.length > 0, "at least one scene is required")
  const ids = new Set()
  let inAppendix = false
  for (const scene of story) {
    check(record(scene) && nonempty(scene.id) && !ids.has(scene.id), "scene IDs must be unique, nonempty strings")
    ids.add(scene.id)
    check(nonempty(scene.title), `${scene.id}: title is required`)
    check(scene.appendix === undefined || typeof scene.appendix === "boolean", `${scene.id}: appendix must be boolean`)
    check(!inAppendix || scene.appendix === true, "appendix scenes must be contiguous and last")
    inAppendix ||= scene.appendix === true
    check(Array.isArray(scene.cues) && scene.cues.length > 0, `${scene.id}: at least one cue is required`)
    let schema
    for (const entry of scene.cues) {
      check(record(entry) && nonempty(entry.label) && record(entry.values), `${scene.id}: cue needs a label and values object`)
      check(Object.values(entry.values).every(scalar), `${scene.id}: values must be finite JSON scalars`)
      const fields = JSON.stringify(Object.keys(entry.values).sort().map((key) => [key, typeof entry.values[key]]))
      schema ??= fields
      check(fields === schema, `${scene.id}: every cue must specify the same complete fields and types`)
    }
  }
  check(story[0].appendix !== true, "at least one main scene is required")
  return story
}

export function assembleSlides(definitions, story = STORY) {
  validateStory(story)
  check(Array.isArray(definitions) && definitions.length === story.length, "registry/story counts must match")
  return definitions.map((definition, index) => {
    check(definition?.id === story[index].id, `registry order/ID mismatch at ${index}`)
    check(typeof definition.C === "function" && nonempty(definition.ch), `${definition.id}: component and chapter are required`)
    return { ...definition, ...story[index] }
  })
}

const boundedInteger = (value, max) => Math.max(0, Math.min(max, Number.isSafeInteger(value) ? value : 0))

export function lastMainSlide(slides = STORY) {
  const firstAppendix = slides.findIndex((slide) => slide.appendix)
  return firstAppendix < 0 ? slides.length - 1 : firstAppendix - 1
}

export function normalizePosition(position = {}, slides = STORY) {
  const slide = boundedInteger(position?.slide, slides.length - 1)
  return {
    slide,
    step: boundedInteger(position?.step, slides[slide].cues.length - 1),
    mode: position?.mode === "explore" ? "explore" : "present",
  }
}

export function positionFromLocation(location, slides = STORY) {
  const match = (location.hash || "").match(/^#(\d+)(?:\/(\d+))?$/)
  return normalizePosition({
    slide: match ? Number(match[1]) : 0,
    step: match?.[2] ? Number(match[2]) : 0,
    mode: new URLSearchParams(location.search).get("mode"),
  }, slides)
}

export const positionHash = ({ slide, step }) => `#${slide}/${step}`

export function movePosition(position, delta, { bySlide = false, slides = STORY } = {}) {
  const current = normalizePosition(position, slides)
  if (delta !== 1 && delta !== -1) return current
  const end = current.mode === "present" && current.slide <= lastMainSlide(slides) ? lastMainSlide(slides) : slides.length - 1
  if (current.mode === "present" && !bySlide) {
    const step = current.step + delta
    if (step >= 0 && step < slides[current.slide].cues.length) return { ...current, step }
    if (delta < 0 && current.slide > 0) return { ...current, slide: current.slide - 1, step: slides[current.slide - 1].cues.length - 1 }
    if (delta > 0 && current.slide < end) return { ...current, slide: current.slide + 1, step: 0 }
    return current
  }
  const slide = Math.max(0, Math.min(end, current.slide + delta))
  return slide === current.slide ? current : { ...current, slide, step: 0 }
}

export function presentationProgress(position, slides = STORY) {
  const current = normalizePosition(position, slides)
  const end = lastMainSlide(slides)
  if (current.slide > end) return 1
  if (current.mode === "explore") return (current.slide + 1) / (end + 1)
  const main = slides.slice(0, end + 1)
  const total = main.reduce((sum, slide) => sum + slide.cues.length, 0)
  const before = main.slice(0, current.slide).reduce((sum, slide) => sum + slide.cues.length, 0)
  return (before + current.step + 1) / total
}

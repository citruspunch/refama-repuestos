import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { STORY, assembleSlides, lastMainSlide, movePosition, normalizePosition, positionFromLocation, positionHash, presentationProgress, validateStory } from "../src/presentation.js"

const end = lastMainSlide()
const route = STORY.slice(0, end + 1).flatMap((scene, slide) => scene.cues.map((_, step) => ({ slide, step, mode: "present" })))
const definitions = () => STORY.map((scene) => ({ id: scene.id, C: () => null, ch: "Test chapter" }))

test("the real component registry matches the validated narrative in order", () => {
  const source = readFileSync(new URL("../src/slides.jsx", import.meta.url), "utf8")
  const ids = [...source.matchAll(/\{ id: "([^"]+)", C:/g)].map((match) => match[1])
  assert.deepEqual(ids, STORY.map((scene) => scene.id))
  assert.equal(validateStory(), STORY)
  assert.deepEqual(assembleSlides(definitions()).map((scene) => scene.id), ids)
})

test("schema validation rejects incomplete, nonfinite, duplicate, or misplaced scenes", () => {
  const valid = () => structuredClone(STORY)
  let story = valid()
  story[1].cues[1].values = { run: true }
  assert.throws(() => validateStory(story), /complete fields/)
  story = valid()
  story[1].cues[1].values.tau = Infinity
  assert.throws(() => validateStory(story), /finite JSON/)
  story = valid()
  story[1].cues[1].values.tau = "1"
  assert.throws(() => validateStory(story), /types/)
  story = valid()
  story[1].id = story[0].id
  assert.throws(() => validateStory(story), /unique/)
  story = valid()
  story[1].cues = []
  assert.throws(() => validateStory(story), /at least one cue/)
  story = valid()
  story[1].appendix = true
  assert.throws(() => validateStory(story), /contiguous/)
  assert.throws(() => validateStory([]), /at least one scene/)
  assert.throws(() => validateStory([{ id: "only", title: "Only appendix", appendix: true, cues: [{ label: "Cue", values: {} }] }]), /main scene/)
  assert.throws(() => assembleSlides(definitions().slice(1)), /counts/)
  assert.throws(() => assembleSlides(definitions().reverse()), /mismatch/)
})

test("Next visits every main cue once, then stops before the appendix", () => {
  let position = route[0]
  for (const expected of route.slice(1)) {
    position = movePosition(position, 1)
    assert.deepEqual(position, expected)
  }
  assert.equal(STORY[position.slide].id, "conclusions")
  assert.deepEqual(movePosition(position, 1), position)
})

test("Previous retraces the route, including the previous slide's final cue", () => {
  let position = route.at(-1)
  for (const expected of route.slice(0, -1).reverse()) {
    position = movePosition(position, -1)
    assert.deepEqual(position, expected)
  }
  assert.deepEqual(movePosition(position, -1), route[0])
})

test("slide skipping, Explore, appendix, and boundaries have explicit semantics", () => {
  assert.deepEqual(movePosition({ slide: 1, step: 1 }, 1, { bySlide: true }), { slide: 2, step: 0, mode: "present" })
  assert.deepEqual(movePosition({ slide: 1, step: 1, mode: "explore" }, 1), { slide: 2, step: 0, mode: "explore" })
  assert.equal(movePosition({ slide: end, step: 0, mode: "explore" }, 1).slide, end + 1)
  assert.equal(movePosition({ slide: end + 1, step: 0 }, -1).slide, end)
  assert.deepEqual(movePosition(route.at(-1), 1, { bySlide: true }), route.at(-1))
  assert.deepEqual(movePosition(route[0], 0), route[0])
  const multiCueEnd = [{ id: "end", cues: [{}, {}] }]
  assert.equal(movePosition({ slide: 0, step: 1 }, 1, { bySlide: true, slides: multiCueEnd }).step, 1)
})

test("URL positions round-trip and invalid external values cannot crash navigation", () => {
  for (const position of route) assert.deepEqual(positionFromLocation({ hash: positionHash(position), search: "" }), position)
  assert.deepEqual(positionFromLocation({ hash: "#1", search: "" }), { slide: 1, step: 0, mode: "present" })
  assert.deepEqual(positionFromLocation({ hash: "#1/2", search: "?mode=explore" }), { slide: 1, step: 2, mode: "explore" })
  for (const hash of ["#nonsense", "#-1/3", "#NaN", "#1.5", `#${"9".repeat(400)}`]) {
    assert.deepEqual(positionFromLocation({ hash, search: "?mode=invalid" }), route[0])
  }
  assert.deepEqual(normalizePosition(null), route[0])
  assert.deepEqual(normalizePosition({ slide: -1, step: NaN }), route[0])
  assert.equal(normalizePosition({ slide: 1, step: 999 }).step, 2)
  assert.equal(normalizePosition({ slide: 999 }).slide, STORY.length - 1)
})

test("main-cue progress increases and finishes before appendix", () => {
  let previous = 0
  for (const position of route) {
    const value = presentationProgress(position)
    assert.ok(value > previous && value <= 1)
    previous = value
  }
  assert.equal(previous, 1)
  assert.equal(presentationProgress({ slide: end + 1 }), 1)
  assert.equal(presentationProgress({ slide: 0, mode: "explore" }), 1 / (end + 1))
})

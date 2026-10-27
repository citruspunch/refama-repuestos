import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { STORY, assembleSlides, lastMainSlide, movePosition, normalizePosition, positionFromLocation, positionHash, presentationProgress, validateStory } from "../src/presentation.js"

const end = lastMainSlide()
const route = STORY.slice(0, end + 1).flatMap((scene, slide) => scene.cues.map((_, step) => ({ slide, step, mode: "present" })))
const definitions = () => STORY.map((scene) => ({ id: scene.id, C: () => null, ch: "Capítulo de prueba" }))

test("el registro tiene 30 diapositivas principales, 3 anexos y un cierre de resultados", () => {
  const source = readFileSync(new URL("../src/slides.jsx", import.meta.url), "utf8")
  const ids = [...source.matchAll(/\{ id: "([^"]+)", C:/g)].map((match) => match[1])
  assert.deepEqual(ids, STORY.map((scene) => scene.id))
  assert.equal(validateStory(), STORY)
  assert.equal(assembleSlides(definitions()).length, 33)
  assert.equal(end, 29)
  assert.equal(STORY[end].id, "conclusiones")
  assert.ok(!STORY.some((scene) => ["piloto", "cierre"].includes(scene.id)))
  assert.equal(STORY.slice(0, end + 1).reduce((sum, scene) => sum + scene.seconds, 0), 3000)
  assert.equal(STORY.reduce((sum, scene) => sum + scene.seconds, 0), 3270)
})

test("el esquema rechaza identificadores repetidos, valores no finitos y entradas incompletas", () => {
  let story = structuredClone(STORY)
  story[26].cues[1].values = { seguridad: 1 }
  assert.throws(() => validateStory(story), /todos los campos/)
  story = structuredClone(STORY)
  story[26].cues[1].values.dias = Infinity
  assert.throws(() => validateStory(story), /finitos/)
  story = structuredClone(STORY)
  story[1].id = story[0].id
  assert.throws(() => validateStory(story), /únicos/)
  story = structuredClone(STORY)
  story[1].appendix = true
  assert.throws(() => validateStory(story), /al final/)
  assert.throws(() => validateStory([]))
  assert.throws(() => assembleSlides(definitions().reverse()), /orden/)
})

test("se recorre cada paso y se detiene antes de los anexos", () => {
  let position = route[0]
  for (const expected of route.slice(1)) {
    position = movePosition(position, 1)
    assert.deepEqual(position, expected)
  }
  assert.equal(STORY[position.slide].id, "conclusiones")
  assert.deepEqual(movePosition(position, 1), position)
  for (const expected of route.slice(0, -1).reverse()) {
    position = movePosition(position, -1)
    assert.deepEqual(position, expected)
  }
  assert.deepEqual(movePosition(position, -1), route[0])
})

test("URL, modos y límites externos se normalizan sin perder pasos", () => {
  for (const position of route) assert.deepEqual(positionFromLocation({ hash: positionHash(position), search: "" }), position)
  assert.deepEqual(positionFromLocation({ hash: "#26", search: "" }), { slide: 26, step: 0, mode: "present" })
  assert.deepEqual(positionFromLocation({ hash: "#26/1", search: "?mode=explore" }), { slide: 26, step: 1, mode: "explore" })
  for (const hash of ["#nonsense", "#-1/3", "#NaN", "#1.5", `#${"9".repeat(400)}`]) assert.deepEqual(positionFromLocation({ hash, search: "?mode=invalid" }), route[0])
  assert.deepEqual(normalizePosition(null), route[0])
  assert.equal(normalizePosition({ slide: 26, step: 999 }).step, 1)
  assert.equal(normalizePosition({ slide: 999 }).slide, STORY.length - 1)
  assert.equal(movePosition({ slide: 26, step: 1 }, 1, { bySlide: true }).slide, 27)
  assert.equal(movePosition({ slide: end, mode: "explore" }, 1).slide, end + 1)
})

test("el progreso mide los pasos principales sin aumentar por los anexos", () => {
  let previous = 0
  for (const position of route) {
    const next = presentationProgress(position)
    assert.ok(next > previous && next <= 1)
    previous = next
  }
  assert.equal(previous, 1)
  assert.equal(presentationProgress({ slide: end + 1 }), 1)
})

test("cada diapositiva tiene contenido, visual, notas y duración en el guion", () => {
  const text = readFileSync(new URL("../GUION.md", import.meta.url), "utf8")
  const headings = [...text.matchAll(/^## \d{2}\. (.+)$/gm)].map((match) => match[1])
  const times = [...text.matchAll(/^Tiempo: (\d+):(\d{2})\./gm)].map((match) => Number(match[1]) * 60 + Number(match[2]))
  assert.deepEqual(headings, STORY.map((scene) => scene.title))
  assert.deepEqual(times, STORY.map((scene) => scene.seconds))
  assert.equal((text.match(/^### En pantalla$/gm) || []).length, STORY.length)
  assert.equal((text.match(/^### Visual$/gm) || []).length, STORY.length)
  assert.equal((text.match(/^### Notas del presentador$/gm) || []).length, STORY.length)
  assert.doesNotMatch(text, /piloto|próximos pasos|siguientes pasos|solicitamos/i)
})

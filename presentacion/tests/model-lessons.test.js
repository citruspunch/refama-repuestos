import test from "node:test"
import assert from "node:assert/strict"
import { loadEvidence } from "../evidence-loader.js"
import { STORY } from "../src/presentation.js"
import { FOREST_EXAMPLE, MODEL_LESSONS, REGRESSION_EXAMPLE, baselineLesson, mean, regressionLesson } from "../src/model-lessons.js"

const evidence = loadEvidence()
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} no coincide con ${b}`)

test("la introducción explica solo métodos básicos que sí tienen resultados ejecutados", () => {
  const models = MODEL_LESSONS.flatMap((entry) => entry.models)
  assert.deepEqual(models, ["naive", "moving_average_3", "linear_regression", "ridge"])
  for (const model of models) assert.ok(Object.values(evidence.products).some((p) =>
    p.comparison.some((row) => row.model === model && row.phase === "holdout" && row.origins === 6 && Number.isFinite(row.mae))), model)
  assert.ok(!models.some((model) => model === "sarima" || model.startsWith("ets_") || model === "croston_sba" || model === "tsb"))
  const first = STORY.findIndex((scene) => scene.id === MODEL_LESSONS[0].id)
  assert.equal(STORY[first - 1].id, "meses-ciclicos")
  assert.equal(STORY[first - 2].id, "variables")
  assert.deepEqual(STORY.slice(first, first + MODEL_LESSONS.length).map((scene) => scene.id), MODEL_LESSONS.map((scene) => scene.id))
  assert.equal(STORY[first + MODEL_LESSONS.length].id, "validacion")
})

test("copiar y promediar usan únicamente los meses completos anteriores a cada corte", () => {
  const rows = evidence.products.B.monthly
  const complete = rows.filter((row) => row.complete_for_modeling)
  for (const { values } of MODEL_LESSONS[0].cues) {
    const { method, monthsBack } = values
    const result = baselineLesson(rows, method, monthsBack)
    const history = monthsBack ? complete.slice(0, -monthsBack) : complete
    const count = method === "naive" ? 1 : Number(method.split("_").at(-1))
    assert.deepEqual(result.history, history)
    assert.deepEqual(result.shown, history.slice(-12))
    assert.equal(result.used, count)
    assert.equal(result.selected.filter(Boolean).length, count)
    close(result.prediction, mean(history.slice(-count).map((row) => row.sales_units)))
  }
  assert.throws(() => baselineLesson(rows, "sarima"), /no explicada/)
  assert.throws(() => baselineLesson(rows, "naive", -1), /entero/)
  assert.throws(() => baselineLesson([], "naive"), /12 meses/)
})

test("la ventana móvil avanza un mes y no inventa una observación futura", () => {
  const before = baselineLesson(evidence.products.B.monthly, "moving_average_3", 1)
  const after = baselineLesson(evidence.products.B.monthly, "moving_average_3", 0)
  assert.deepEqual(before.history.slice(-2), after.history.slice(-3, -1))
  assert.ok(before.history.at(-1).month < after.history.at(-1).month)
  assert.equal(after.history.length, before.history.length + 1)
})

test("la recta didáctica se calcula y Ridge reduce el peso del único predictor estandarizado", () => {
  const ordinary = regressionLesson(), ridge = regressionLesson(true)
  assert.ok(ordinary.weight > ridge.weight && ridge.weight > 0)
  close(ridge.weight / ordinary.weight, REGRESSION_EXAMPLE.length / (REGRESSION_EXAMPLE.length + 10))
  const center = mean(REGRESSION_EXAMPLE.map((row) => row.x))
  close(ordinary.predict(center), mean(REGRESSION_EXAMPLE.map((row) => row.y)))
  close(ridge.predict(center), ordinary.predict(center))
  for (const x of [0, 4, 8, 9]) assert.ok(Number.isFinite(ordinary.predict(x)) && Number.isFinite(ridge.predict(x)))
})

test("el bosque didáctico promedia estimaciones, sin convertirlas en resultados del proyecto", () => {
  assert.deepEqual(FOREST_EXAMPLE, [60, 90, 75])
  close(mean(FOREST_EXAMPLE), 75)
})

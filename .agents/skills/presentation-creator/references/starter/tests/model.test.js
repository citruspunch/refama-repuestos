import test from "node:test"
import assert from "node:assert/strict"
import { DURATION, responseAt, sampleResponse } from "../src/model.js"
import { STORY } from "../src/presentation.js"

test("every scripted time constant produces finite reproducible analytical samples", () => {
  for (const cue of STORY.find((scene) => scene.id === "response").cues) {
    const tau = cue.values.tau
    assert.ok(tau >= 0.5 && tau <= 2)
    const rows = sampleResponse({ tau })
    assert.deepEqual(rows, sampleResponse({ tau }))
    assert.equal(rows[0].t, 0)
    assert.equal(rows[0].y, 0)
    assert.equal(rows.at(-1).t, DURATION)
    for (let i = 0; i < rows.length; i++) {
      assert.ok(Number.isFinite(rows[i].t) && Number.isFinite(rows[i].y))
      assert.ok(rows[i].y >= 0 && rows[i].y < 1)
      assert.equal(rows[i].y, responseAt(rows[i].t, tau))
      if (i) assert.ok(rows[i].t > rows[i - 1].t && rows[i].y > rows[i - 1].y)
    }
  }
})

test("displayed analytical claims and equilibrium are not the final finite sample", () => {
  assert.equal((100 * responseAt(1, 1)).toFixed(1), "63.2")
  assert.equal(responseAt(1, 1), responseAt(2, 2))
  assert.ok(responseAt(1, 1) > responseAt(1, 2))
  assert.ok(Math.abs(responseAt(40, 1) - 1) < 1e-12)
  assert.ok(sampleResponse({ tau: 2 }).at(-1).y < 0.9)
})

test("invalid model inputs fail explicitly; nonintegral sample grids retain endpoints", () => {
  for (const tau of [0, -1, Infinity, NaN]) assert.throws(() => responseAt(1, tau), RangeError)
  for (const t of [-1, Infinity, NaN]) assert.throws(() => responseAt(t, 1), RangeError)
  for (const settings of [{ interval: 0 }, { duration: -1 }, { interval: Infinity }, { interval: 1e-10 }]) {
    assert.throws(() => sampleResponse({ tau: 1, ...settings }), RangeError)
  }
  const rows = sampleResponse({ tau: 1, duration: 1, interval: 0.3 })
  assert.equal(rows.at(-1).t, 1)
  assert.ok(rows.at(-2).t < 1)
})

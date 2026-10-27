import { test, expect } from "@playwright/test"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { STORY } from "../src/presentation.js"
import { MODEL_LESSONS, baselineLesson } from "../src/model-lessons.js"
import { loadEvidence } from "../evidence-loader.js"
import { number } from "../src/business.js"

const position = (id) => STORY.findIndex((scene) => scene.id === id)
const hashFor = (id, step = 0) => `#${position(id)}/${step}`
const errors = new WeakMap()
test.beforeEach(async ({ page }) => {
  errors.set(page, [])
  page.on("pageerror", (error) => errors.get(page).push(error.message))
})
test.afterEach(async ({ page }) => { expect(errors.get(page)).toEqual([]) })

async function at(page, entry, step) {
  await expect(page.locator(".viewport")).toHaveAttribute("data-slide", String(position(entry.id)))
  await expect(page.locator(".viewport")).toHaveAttribute("data-step", String(step))
  await expect(page.locator(".slide h2")).toHaveText(entry.title)
  await expect(page.locator(".lesson-diagram")).toHaveAccessibleName(/.+/)
  await expect(page.locator(".lesson-body")).toHaveAttribute("data-model", entry.cues[step].values.method ?? "random_forest")
}

test("la introducción muestra solo modelos básicos usados y cada paso cabe en tres tamaños", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const products = loadEvidence().products
  for (const viewport of [{ width: 1600, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport)
    for (const entry of MODEL_LESSONS) for (let step = 0; step < entry.cues.length; step++) {
      await page.evaluate((hash) => { window.location.hash = hash }, hashFor(entry.id, step))
      await at(page, entry, step)
      await page.evaluate(() => document.fonts.ready)
      await expect(page.locator(".lesson-tabs button:enabled")).toHaveCount(0)
      expect(await page.locator(".model-lesson").innerText()).not.toMatch(/SARIMA|ETS|Croston|TSB|boosting|NaN|Infinity/)
      const issues = await page.locator(".model-lesson").evaluate((root) => {
        const stage = document.querySelector(".stage").getBoundingClientRect()
        const rail = document.querySelector(".cue-rail").getBoundingClientRect()
        const nav = document.querySelector(".nav").getBoundingClientRect()
        const problems = []
        for (const element of root.querySelectorAll(".lesson-body, .lesson-tabs, .lesson-readout, .lesson-readout > *, .lesson-footer, .lesson-inputs, .lesson-tree-caption, .lesson-diagram text")) {
          const box = element.getBoundingClientRect()
          if (box.left < stage.left - 1 || box.right > stage.right + 1) problems.push(`${element.className}: fuera del escenario`)
          if (box.bottom > Math.min(rail.top, nav.top) - 3) problems.push(`${element.className}: invade controles`)
          if (element instanceof HTMLElement && (element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 3)) problems.push(`${element.className}: desbordado`)
        }
        for (const line of root.querySelectorAll("path")) if (/NaN|Infinity/.test(line.getAttribute("d"))) problems.push("Trazo no finito")
        for (const rect of root.querySelectorAll("rect")) if (["width", "height"].some((key) => Number(rect.getAttribute(key)) < 0)) problems.push("Rectángulo negativo")
        const copy = root.cloneNode(true)
        copy.querySelectorAll("title").forEach((node) => node.remove())
        if (copy.textContent.trim().split(/\s+/).length > 110) problems.push("Exceso de texto")
        return problems
      })
      expect(issues, `${entry.id}/${step} a ${viewport.width}`).toEqual([])
      if (entry.id === "modelos-referencias") {
        const { method, monthsBack } = entry.cues[step].values
        const example = baselineLesson(products.B.monthly, method, monthsBack)
        await expect(page.getByTestId("lesson-prediction")).toHaveText(`${number(example.prediction, 1)}u./mes`)
        await expect(page.locator(".diagram-bar-selected")).toHaveCount(example.used)
      } else await expect(page.locator(".lesson-footer")).toContainText(/didáctico|ilustrativo|no resultados reales/)
      if (viewport.width === 1600) await page.screenshot({ path: testInfo.outputPath(`${entry.id}-${step}.png`) })
    }
  }
})

test("las flechas recorren la explicación y vuelven al bloque de validación", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor(MODEL_LESSONS[0].id)}`)
  for (const entry of MODEL_LESSONS) for (let step = 0; step < entry.cues.length; step++) {
    await at(page, entry, step)
    await page.keyboard.press("PageDown")
  }
  await expect(page.locator(".viewport")).toHaveAttribute("data-slide", String(position("validacion")))
  for (const entry of [...MODEL_LESSONS].reverse()) for (let step = entry.cues.length - 1; step >= 0; step--) {
    await page.keyboard.press("PageUp")
    await at(page, entry, step)
  }
  const location = page.url()
  await page.waitForTimeout(180)
  expect(page.url()).toBe(location)
})

test("el método sigue el guion y repetir conserva el paso", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("modelos-referencias", 1)}`)
  await expect(page.locator(".lesson-body")).toHaveAttribute("data-model", "moving_average_3")
  await page.keyboard.press("r")
  await expect(page.locator(".lesson-body")).toHaveAttribute("data-model", "moving_average_3")
  await expect(page.getByRole("button", { name: "Promedio de 3 meses", exact: true })).toBeDisabled()
  await page.keyboard.press("PageUp")
  await expect(page.locator(".lesson-body")).toHaveAttribute("data-model", "naive")
})

test("las animaciones de modelos terminan y respetan movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(`/${hashFor("modelos-referencias", 1)}`)
  await page.keyboard.press("r")
  const state = () => page.locator(".lesson-body").evaluate((root) => root.getAnimations({ subtree: true }).map((animation) => ({ name: animation.animationName, time: animation.currentTime, state: animation.playState, iterations: animation.effect.getTiming().iterations })))
  await expect.poll(async () => (await state()).some((animation) => animation.time > 150 && animation.state === "running")).toBe(true)
  expect((await state()).every((animation) => animation.iterations === 1)).toBe(true)
  await expect.poll(async () => (await state()).every((animation) => animation.state === "finished")).toBe(true)
  await page.keyboard.press("r")
  await expect.poll(async () => (await state()).some((animation) => animation.state === "running")).toBe(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect.poll(async () => (await state()).length).toBe(0)
  await expect(page.locator(".lesson-trace")).toHaveCSS("clip-path", "none")
})

test("los cinco pasos de modelos funcionan en el HTML sin red", async ({ page, context }) => {
  const requests = []
  page.on("request", (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()) })
  await context.setOffline(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`${pathToFileURL(resolve("dist/index.html"))}${hashFor(MODEL_LESSONS[0].id)}`)
  for (const entry of MODEL_LESSONS) for (let step = 0; step < entry.cues.length; step++) {
    await at(page, entry, step)
    await page.keyboard.press("PageDown")
  }
  expect(requests).toEqual([])
})

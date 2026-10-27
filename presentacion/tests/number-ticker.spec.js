import { test, expect } from "@playwright/test"
import { STORY } from "../src/presentation.js"
import { number } from "../src/business.js"
import { loadEvidence } from "../evidence-loader.js"

const hashFor = (id) => `#${STORY.findIndex((scene) => scene.id === id)}/0`
const visual = (page) => page.locator(".number-ticker > span").first()
const numericValue = async (page) => Number((await visual(page).textContent()).replaceAll(",", ""))

test("solo seis cifras protagonistas usan el contador; las comparaciones siguen estáticas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const selected = { portada: 3, trazabilidad: 1, calidad: 1, "resultado-b": 1 }
  for (const scene of STORY) {
    await page.evaluate((hash) => { window.location.hash = hash }, hashFor(scene.id))
    await expect(page.locator(".slide h1, .slide h2")).toHaveText(scene.title)
    await expect(page.locator(".number-ticker")).toHaveCount(selected[scene.id] ?? 0)
    for (const ticker of await page.locator(".number-ticker").all()) {
      const finalValue = await ticker.getAttribute("data-value")
      await expect(ticker).toHaveAccessibleName(finalValue)
      await expect(ticker.locator("span")).toHaveAttribute("aria-hidden", "true")
      await expect(ticker).toHaveText(finalValue)
    }
  }
})

test("el conteo es finito, conserva el ancho y respeta pausa, reanudación y repetición", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)
  await page.keyboard.press("r")
  await expect.poll(() => numericValue(page)).toBeGreaterThan(0)
  await page.keyboard.press("p")
  await expect(page.locator(".viewport")).toHaveAttribute("data-paused", "true")
  const frozen = await numericValue(page)
  expect(frozen).toBeLessThan(2108)
  const width = await page.locator(".number-ticker").first().evaluate((el) => el.offsetWidth)
  await page.waitForTimeout(300)
  expect(await numericValue(page)).toBe(frozen)
  await page.keyboard.press("p")
  await expect.poll(() => numericValue(page)).toBeGreaterThan(frozen)
  await expect(visual(page)).toHaveText("2,108")
  expect(await page.locator(".number-ticker").first().evaluate((el) => el.offsetWidth)).toBe(width)
  await page.waitForTimeout(200)
  await expect(visual(page)).toHaveText("2,108")
  await page.keyboard.press("g")
  const element = await visual(page).elementHandle()
  await page.keyboard.press("r")
  expect(await element.evaluate((el) => el.isConnected)).toBe(true)
  expect(await numericValue(page)).toBeLessThan(2108)
  await expect(visual(page)).toHaveText("2,108")
  await expect(page.locator(".viewport")).toHaveAttribute("data-step", "0")
})

test("el MAE termina con sus decimales reales y mantiene la jerarquía tipográfica", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(`/${hashFor("resultado-b")}`)
  const p = loadEvidence().products.E
  const mae = p.comparison.find((row) => row.model === p.selection.model && row.phase === "holdout").mae
  await expect(visual(page)).toHaveText(number(mae, 2))
  await expect(visual(page)).toHaveCSS("font-size", "94px")
  await expect(page.locator(".metric > span")).toHaveCSS("font-size", "27px")
})

test("activar movimiento reducido durante el conteo muestra el valor final incluso en pausa", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  await page.keyboard.press("r")
  await page.keyboard.press("p")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(visual(page)).toHaveText("2,108")
  await page.keyboard.press("r")
  await expect(page.locator(".cover-metrics dd")).toHaveText(["2,108", "Hasta 16", "48"])
  await page.waitForTimeout(200)
  await expect(visual(page)).toHaveText("2,108")
})

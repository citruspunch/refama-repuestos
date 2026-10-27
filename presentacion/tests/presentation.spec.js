import { test, expect } from "@playwright/test"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { STORY, lastMainSlide } from "../src/presentation.js"
import { BUSINESS, number, price } from "../src/business.js"

const end = lastMainSlide()
const route = STORY.slice(0, end + 1).flatMap((scene, slide) => scene.cues.map((_, step) => ({ slide, step })))
const errors = new WeakMap()
test.beforeEach(async ({ page }) => {
  errors.set(page, [])
  page.on("pageerror", (error) => errors.get(page).push(error.message))
})
test.afterEach(async ({ page }) => { expect(errors.get(page), "Sin errores de ejecución").toEqual([]) })

async function at(page, slide, step = 0) {
  await expect(page.locator(".viewport")).toHaveAttribute("data-slide", String(slide))
  await expect(page.locator(".viewport")).toHaveAttribute("data-step", String(step))
  await expect(page.locator(".slide h1, .slide h2")).toHaveText(STORY[slide].title)
}

async function settleAnimations(page) {
  // La pausa CSS se confirma en el siguiente frame del compositor.
  await page.locator(".slide-frame").evaluate(async (root) => {
    await Promise.all(root.getAnimations({ subtree: true }).map((animation) => animation.ready))
  })
}

test("la exposición completa avanza y retrocede con un control de diapositivas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (const position of route) {
    await at(page, position.slide, position.step)
    await expect(page.locator(".slide")).toHaveCount(1)
    expect(await page.locator(".slide").innerText()).not.toMatch(/NaN|Infinity/)
    await page.keyboard.press("PageDown")
  }
  await at(page, end)
  await expect(page.getByRole("button", { name: "Paso siguiente", exact: true })).toBeDisabled()
  for (const position of route.slice(0, -1).reverse()) {
    await page.keyboard.press("PageUp")
    await at(page, position.slide, position.step)
  }
})

test("los enlaces, la recarga y los anexos conservan el paso exacto", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?audiencia=universidad#26/1")
  await at(page, 26, 1)
  await page.reload()
  await at(page, 26, 1)
  await page.keyboard.press("a")
  await at(page, end + 1)
  await page.keyboard.press("a")
  await at(page, 26, 1)
  await page.keyboard.press("Shift+ArrowRight")
  await at(page, 27)
  await page.keyboard.press("ArrowLeft")
  await at(page, 26, 1)
  await page.keyboard.press("End")
  await at(page, end)
  await page.keyboard.press("Home")
  await at(page, 0)
  expect(new URL(page.url()).searchParams.get("audiencia")).toBe("universidad")
  await page.evaluate(() => { window.location.hash = "#26" })
  await at(page, 26)
})

test("Explorar consulta variantes archivadas y Presentar restaura el escenario del guion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#26/1")
  const safety = page.getByRole("combobox", { name: "Stock de seguridad supuesto", exact: true, includeHidden: true })
  const days = page.getByRole("combobox", { name: "Días de producción asignados", exact: true, includeHidden: true })
  await expect(safety).toBeHidden()
  await expect(safety).toBeDisabled()
  await expect(safety).toHaveValue("1")
  await expect(page.getByTestId("scenario-units")).toHaveText("192")
  await page.keyboard.press("g")
  await expect(safety).toBeVisible()
  await expect(safety).toBeEnabled()
  await safety.selectOption("0")
  await days.selectOption("5")
  await expect(page.getByTestId("scenario-units")).toHaveText("95")
  await safety.focus()
  await page.keyboard.press("ArrowDown")
  await at(page, 26, 1)
  await page.locator(".slide h2").click()
  await safety.selectOption("0")
  await page.locator(".slide h2").click()
  await page.keyboard.press("r")
  await expect(safety).toHaveValue("0")
  await expect(days).toHaveValue("5")
  await page.keyboard.press("g")
  await expect(safety).toBeDisabled()
  await expect(safety).toHaveValue("1")
  await expect(days).toHaveValue("1")
  await expect(page.getByTestId("scenario-units")).toHaveText("192")
})

test("los gráficos retienen sus flechas y no avanzan la exposición", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#9/0")
  const chart = page.locator(".recharts-surface[role='application']").first()
  await chart.focus()
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  await at(page, 9)
  await expect(page.locator(".recharts-tooltip-wrapper").first()).toBeVisible()
})

test("pausa y repetición no avanzan pasos ni pierden los datos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/#23/0")
  await page.keyboard.press("p")
  await expect(page.locator(".slide-frame")).toHaveCSS("animation-play-state", "paused")
  await settleAnimations(page)
  const frozen = await page.locator(".slide-frame").evaluate((el) => getComputedStyle(el).transform)
  await page.waitForTimeout(150)
  expect(await page.locator(".slide-frame").evaluate((el) => getComputedStyle(el).transform)).toBe(frozen)
  await at(page, 23)
  await page.keyboard.press("p")
  await expect(page.locator(".slide-frame")).toHaveCSS("animation-play-state", "running")
  await page.keyboard.press("r")
  await at(page, 23)
  await page.keyboard.press("ArrowRight")
  await at(page, 23, 1)
  await expect(page.locator(".note")).toContainText("325")
})

test("Espacio activa un botón una vez y las teclas mantenidas se ignoran", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#18/0")
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).focus()
  await page.keyboard.press("Space")
  await at(page, 18, 1)
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", repeat: true })))
  await at(page, 18, 1)
})

test("la ayuda restaura el foco y pantalla completa sigue al navegador, sin índice ni encabezados superiores", async ({ page }) => {
  await page.goto("/")
  const help = page.getByRole("button", { name: "Atajos de teclado", exact: true })
  await help.click()
  await expect(page.getByRole("dialog", { name: "Controles de la presentación" })).toBeVisible()
  await page.keyboard.press("PageDown")
  await at(page, 0)
  await page.keyboard.press("Escape")
  await expect(help).toBeFocused()
  await expect(page.getByRole("button", { name: /índice/i })).toHaveCount(0)
  await expect(page.locator(".slide-index, .index-modal")).toHaveCount(0)
  await page.keyboard.press("Shift+ArrowRight")
  await at(page, 1)
  await expect(page.locator(".hud")).toHaveCount(0)
  await page.evaluate(() => { window.location.hash = "#26/0" })
  await at(page, 26)
  await page.bringToFront()
  await page.keyboard.press("f")
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await page.evaluate(() => document.exitFullscreen())
  await expect(page.getByRole("button", { name: "Pantalla completa", exact: true })).toBeVisible()
})

test("la paleta es canónica y Montserrat siempre se presenta en Thin y mayúsculas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const palette = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return Object.fromEntries(["--paper", "--paper-2", "--ink", "--purple", "--cyan", "--amber", "--green", "--red"].map((token) => [token, style.getPropertyValue(token).trim()]))
  })
  expect(palette).toEqual({ "--paper": "#faf9fb", "--paper-2": "#f3f1f5", "--ink": "#1c1028", "--purple": "#d4953a", "--cyan": "#4e79a7", "--amber": "#d4953a", "--green": "#2ba185", "--red": "#f55459" })
  for (const slide of [0, 1, 4, 5, 10, 12, 26, STORY.length - 1]) {
    await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/0`)
    await at(page, slide)
    const violations = await page.locator(".viewport").evaluate((root) => [...root.querySelectorAll("*")].flatMap((el) => {
      const style = getComputedStyle(el)
      return style.fontFamily.includes("Montserrat") && (style.fontWeight !== "100" || style.textTransform !== "uppercase") ? [`${el.className}: ${style.fontWeight}, ${style.textTransform}`] : []
    }))
    expect(violations).toEqual([])
  }
})

test("las fichas identifican los productos y el escenario compara ambas variantes archivadas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await expect(page.locator(".cover-register")).toContainText(BUSINESS.A.code)
  await expect(page.locator(".cover-chart .recharts-line-curve")).toBeVisible()
  await expect(page.locator(".cover-chart")).toContainText("Ventas mensuales registradas · unidades")
  await expect(page.locator(".cover-orbit")).toHaveCount(0)
  await page.evaluate(() => { window.location.hash = "#3/0" })
  await at(page, 3)
  for (const id of ["A", "B"]) {
    const sheet = page.locator(`.product-sheet.product-${id.toLowerCase()}`)
    await expect(sheet).toContainText(BUSINESS[id].code)
    await expect(sheet.locator("dd")).toHaveText([price(BUSINESS[id].netSellingPrice), `≈ ${number(BUSINESS[id].reportedUnitsPerProductionDay)}`])
    await expect(sheet).toHaveCSS("box-shadow", "none")
  }
  await page.evaluate(() => { window.location.hash = "#26/1" })
  await at(page, 26, 1)
  await expect(page.locator(".scenario-baseline dd")).toHaveText(["24 u.", "96.33 u./mes", "210 u./día productivo"])
  await expect(page.locator(".scenario-table tbody tr")).toHaveCount(2)
  await expect(page.locator(".scenario-table tbody tr").nth(0).locator("td")).toHaveText(["118.81", "95", "0.45"])
  await expect(page.locator(".scenario-table tbody tr").nth(1).locator("td")).toHaveText(["215.14", "192", "0.91"])
  await expect(page.locator(".scenario-table tbody tr").nth(1)).toHaveAttribute("aria-current", "step")
  await expect(page.locator(".scenario-toolbar")).toBeHidden()
  await expect(page.getByTestId("scenario-units")).toHaveText("192")
})

test("la barra recupera su forma redondeada", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator(".nav")).toHaveCSS("border-radius", "40px")
  await expect(page.getByRole("button", { name: "Paso siguiente", exact: true })).toHaveCSS("border-radius", "50%")
  await expect(page.locator(".mode-toggle")).toHaveCSS("border-radius", "24px")
})

test("el texto principal es breve y termina en conclusiones, sin propuestas futuras", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (const { slide, step } of route) {
    await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/${step}`)
    await at(page, slide, step)
    const prose = await page.locator(".slide").evaluate((root) => {
      const copy = root.cloneNode(true)
      copy.querySelectorAll("svg, .calendar, .sr-only, select, [hidden]").forEach((el) => el.remove())
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT)
      const words = []
      while (walker.nextNode()) words.push(walker.currentNode.textContent)
      return words.join(" ").replace(/\s+/g, " ").trim()
    })
    expect(prose.split(/\s+/).length, `Texto de la diapositiva ${slide + 1}`).toBeLessThanOrEqual(90)
    expect(prose).not.toMatch(/piloto|siguientes pasos|próximos pasos|solicitamos|proponemos|nuestro|la decisión también debería/i)
  }
  await expect(page.locator(".slide h2")).toHaveText("Resultados y conclusiones")
  await expect(page.locator(".conclusion-record")).toContainText("1,062 movimientos preservados")
})

test("las entradas y trazos son finitos, se pausan y se pueden repetir", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/#9/0")
  await expect(page.locator(".recharts-line-curve").first()).toBeVisible()
  await page.keyboard.press("r")
  await expect.poll(() => page.locator(".recharts-line-curve").first().evaluate((el) => el.getAnimations()[0]?.currentTime ?? 0)).toBeGreaterThan(180)
  const curve = await page.locator(".recharts-line-curve").first().elementHandle()
  await page.keyboard.press("p")
  await settleAnimations(page)
  const animationState = () => page.locator(".slide-frame").evaluate((root) => root.getAnimations({ subtree: true }).map((animation) => ({ name: animation.animationName, time: animation.currentTime, state: animation.playState, iterations: animation.effect.getTiming().iterations })))
  const frozen = await animationState()
  expect(await curve.evaluate((el) => el.isConnected)).toBe(true)
  expect(frozen.filter((animation) => animation.name === "chart-reveal").every((animation) => animation.time > 180)).toBe(true)
  expect(frozen.some((animation) => animation.name === "chart-reveal")).toBe(true)
  expect(frozen.every((animation) => animation.state === "paused" && animation.iterations === 1)).toBe(true)
  await page.waitForTimeout(150)
  expect(await animationState()).toEqual(frozen)
  await page.keyboard.press("p")
  await expect.poll(async () => (await animationState()).every((animation) => animation.state === "finished")).toBe(true)
  await page.keyboard.press("r")
  // Recharts monta los trazos después de medir su contenedor de nuevo.
  await expect.poll(async () => (await animationState()).some((animation) => animation.name === "chart-reveal" && animation.state === "running" && animation.time < 500)).toBe(true)
  await at(page, 9)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect.poll(async () => (await animationState()).length).toBe(0)
  await expect(page.locator(".recharts-line-curve").first()).toHaveCSS("clip-path", "none")
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.evaluate(() => { window.location.hash = "#20/0" })
  await at(page, 20)
  await expect(page.locator(".recharts-bar-rectangles")).toHaveCSS("animation-name", "chart-reveal")
  const bars = await page.locator(".recharts-bar-rectangles").elementHandle()
  await page.keyboard.press("p")
  expect(await bars.evaluate((el) => el.isConnected)).toBe(true)
})

test("los controles ocultos aparecen al recibir foco", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator(".nav")).toHaveClass(/idle/, { timeout: 6000 })
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).focus()
  await expect(page.locator(".nav")).toHaveCSS("opacity", "1")
})

function layoutIssues(root) {
  const issues = []
  const stage = document.querySelector(".stage").getBoundingClientRect()
  const rail = document.querySelector(".cue-rail").getBoundingClientRect()
  const nav = document.querySelector(".nav").getBoundingClientRect()
  for (const el of root.querySelectorAll(".slide-head, .content, .takeaway, .caveat, .cover > *, .cover-copy, .cover-chart, .cover-register, .content > *, .split > *, .product-sheet, .product-specs > div, .inventory-reading, .comparison-figure, .conclusion-findings > div, .scenario-baseline > div, .scenario-table, .scenario-toolbar > *")) {
    if (!el.getClientRects().length) continue
    const box = el.getBoundingClientRect()
    if (box.bottom > Math.min(rail.top - 3, nav.top - 3)) issues.push(`${el.className}: invade controles`)
    if (box.left < stage.left - 1 || box.right > stage.right + 1) issues.push(`${el.className}: fuera del escenario`)
    // Los ascendentes de los títulos pueden extenderse sin quedar recortados.
    if (!el.matches("h1, h2, h3, .slide-head") && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 3)) issues.push(`${el.tagName}.${el.className}: contenido desbordado ${el.scrollWidth}×${el.scrollHeight} / ${el.clientWidth}×${el.clientHeight}`)
  }
  for (const path of root.querySelectorAll("svg path")) if (/NaN|Infinity/.test(path.getAttribute("d"))) issues.push("Geometría inválida")
  for (const rect of root.querySelectorAll("svg rect")) if (["width", "height"].some((key) => parseFloat(rect.getAttribute(key)) < 0)) issues.push("Rectángulo negativo")
  return issues
}

test("cada paso cabe en 1600×900, 1280×720 y 1024×768", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (const viewport of [{ width: 1600, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport)
    for (let slide = 0; slide < STORY.length; slide++) for (let step = 0; step < STORY[slide].cues.length; step++) {
      await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/${step}`)
      await at(page, slide, step)
      await page.evaluate(() => document.fonts.ready)
      const issues = await page.locator(".slide").evaluate(layoutIssues)
      expect.soft(issues, `${slide + 1}/${step + 1} a ${viewport.width}×${viewport.height}`).toEqual([])
      if (viewport.width === 1600 && step === STORY[slide].cues.length - 1) await page.screenshot({ path: testInfo.outputPath(`diapositiva-${String(slide + 1).padStart(2, "0")}.png`) })
    }
  }
})

test("la diapositiva 27 cabe en Presentar y Explorar con ambos supuestos", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const viewport of [{ width: 1600, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport)
    for (const mode of ["present", "explore"]) for (const step of [0, 1]) {
      await page.goto(`/?mode=${mode}#26/${step}`)
      await at(page, 26, step)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.locator(".slide").evaluate(layoutIssues), `${mode}/${step} a ${viewport.width}×${viewport.height}`).toEqual([])
      if (viewport.width === 1600) await page.screenshot({ path: testInfo.outputPath(`escenario-b-${mode}-${step}.png`) })
    }
  }
})

test("el único HTML funciona por file:// sin red, con fuentes, gráficos y controles", async ({ page, context }) => {
  expect(readdirSync(resolve("dist"))).toEqual(["index.html"])
  const html = readFileSync(resolve("dist/index.html"), "utf8")
  expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic|<script[^>]+src=/)
  expect(html).toContain("data:font/woff2;base64,")
  expect(html).toContain("SIL OPEN FONT LICENSE Version 1.1")
  expect(html).not.toContain("Notas del presentador")
  const requests = []
  page.on("request", (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()) })
  await context.setOffline(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(pathToFileURL(resolve("dist/index.html")).href)
  for (const position of route) {
    await at(page, position.slide, position.step)
    await page.keyboard.press("PageDown")
  }
  await page.keyboard.press("a")
  await at(page, end + 1)
  await page.keyboard.press("PageDown")
  await at(page, end + 2)
  await page.keyboard.press("PageDown")
  await at(page, end + 3)
  await page.keyboard.press("a")
  await at(page, end)
  expect(requests).toEqual([])
})

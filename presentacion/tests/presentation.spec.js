import { test, expect } from "@playwright/test"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { STORY, lastMainSlide } from "../src/presentation.js"
import { BUSINESS, MODEL_NAMES, month, number } from "../src/business.js"
import { PRODUCT_STROKES } from "../src/chart-colors.js"
import { loadEvidence } from "../evidence-loader.js"
import { forecastSeries, productionVariant, replayTotal } from "../src/analysis.js"

const end = lastMainSlide()
const scenes = Object.fromEntries(STORY.map((scene, index) => [scene.id, index]))
const hashFor = (id, step = 0) => `#${scenes[id]}/${step}`
const route = STORY.flatMap((scene, slide) => scene.cues.map((_, step) => ({ slide, step })))
const products = loadEvidence().products
const errors = new WeakMap()
test.beforeEach(async ({ page }) => {
  errors.set(page, [])
  page.on("pageerror", (error) => errors.get(page).push(error.message))
})
test.afterEach(async ({ page }) => { expect(errors.get(page), "Sin errores de ejecución").toEqual([]) })

async function at(page, slide, step = 0) {
  slide = typeof slide === "string" ? scenes[slide] : slide
  await expect(page.locator(".viewport")).toHaveAttribute("data-slide", String(slide))
  await expect(page.locator(".viewport")).toHaveAttribute("data-step", String(step))
  await expect(page.locator(".slide h1, .slide h2")).toHaveText(STORY[slide].title)
}

async function visit(page, id, step = 0) {
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor(id, step))
  await at(page, id, step)
}

test("todos los pasos avanzan y retroceden con el control de diapositivas", async ({ page }) => {
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
  await expect(page.getByRole("button", { name: "Paso anterior", exact: true })).toBeDisabled()
})

test("enlaces, recarga, saltos e inicio y fin conservan el paso", async ({ page }) => {
  await page.goto(`/?audiencia=universidad${hashFor("escenario-b", 1)}`)
  await at(page, "escenario-b", 1)
  await page.reload()
  await at(page, "escenario-b", 1)
  await page.keyboard.press("Shift+ArrowRight")
  await at(page, "escenario-a")
  await page.keyboard.press("ArrowLeft")
  await at(page, "escenario-b", 1)
  await page.keyboard.press("End")
  await at(page, end)
  await page.keyboard.press("Home")
  await at(page, 0)
  expect(new URL(page.url()).searchParams.get("audiencia")).toBe("universidad")
  await page.evaluate((hash) => { window.location.hash = hash }, `#${scenes.validacion}`)
  await at(page, "validacion")
})

test("las flechas del gráfico no avanzan la exposición ni duplican datos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("tendencia")}`)
  await page.locator(".recharts-surface[role='application']").first().focus()
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  await at(page, "tendencia")
  await expect(page.locator(".chart-tooltip").first().locator(":scope > div")).toHaveCount(1)
  const chart = page.locator(".recharts-surface[role='application']").first()
  await expect(chart).toHaveAttribute("aria-label", /Ventas mensuales registradas/)
  await expect(chart.locator("title")).toHaveText("")
})

test("Espacio no avanza dos veces y la repetición de tecla se ignora", async ({ page }) => {
  await page.goto(`/${hashFor("validacion")}`)
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).focus()
  await page.keyboard.press("Space")
  await at(page, "validacion", 1)
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", repeat: true })))
  await at(page, "validacion", 1)
})

test("la ayuda restaura el foco y pantalla completa sigue al navegador", async ({ page }) => {
  await page.goto("/")
  const help = page.getByRole("button", { name: "Atajos de teclado", exact: true })
  await help.click()
  await expect(page.getByRole("dialog", { name: "Controles de la presentación" })).toBeVisible()
  await page.keyboard.press("PageDown")
  await at(page, 0)
  await page.keyboard.press("Escape")
  await expect(help).toBeFocused()
  await expect(page.locator(".hud, .slide-index, .index-modal")).toHaveCount(0)
  await page.bringToFront()
  await page.keyboard.press("f")
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await page.evaluate(() => document.exitFullscreen())
  await expect(page.getByRole("button", { name: "Pantalla completa", exact: true })).toBeVisible()
})

test("se conserva la identidad visual y las fotos de los productos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const palette = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return Object.fromEntries(["--paper", "--ink", "--purple", "--a", "--b", "--c", "--d", "--e"].map((key) => [key, style.getPropertyValue(key).trim()]))
  })
  expect(palette).toEqual({ "--paper": "#faf9fb", "--ink": "#1c1028", "--purple": "#d4953a", ...Object.fromEntries(Object.entries(BUSINESS).map(([id, p]) => [`--${id.toLowerCase()}`, p.color])) })
  await expect(page.locator(".cover-products li")).toHaveCount(5)
  await expect(page.locator(".cover .recharts-wrapper")).toHaveCount(0)
  await visit(page, "productos")
  await expect(page.locator(".product-inputs tbody tr")).toHaveCount(5)
  await expect(page.locator(".product-inputs thead th")).toHaveCount(4)
  for (const [index, id] of Object.keys(BUSINESS).entries()) {
    const image = page.locator(".product-thumb").nth(index)
    await expect(image).toHaveAttribute("alt", BUSINESS[id].shortName)
    expect(await image.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true)
  }
  await expect(page.locator(".nav")).toHaveCSS("border-radius", "40px")
})

test("cada diapositiva es breve y no contiene detalles internos ni cifras decorativas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (const { slide, step } of route) {
    await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/${step}`)
    await at(page, slide, step)
    const text = await page.locator(".slide").evaluate((root) => {
      const copy = root.cloneNode(true)
      copy.querySelectorAll("svg, .sr-only").forEach((el) => el.remove())
      return copy.textContent.replace(/\s+/g, " ").trim()
    })
    expect.soft(text.split(/\s+/).length, `Texto ${slide + 1}/${step + 1}`).toBeLessThanOrEqual(100)
    expect(text).not.toMatch(/SHA-256|huellas|conciliaci[oó]n|FDR|arm[oó]nic|WAPE|RMSE|salvaguardas|16 m[eé]todos|48 escenarios|pruebas automatizadas|\.py\b|m[oó]dulos|repositorio|;/i)
    await expect(page.locator(".number-ticker, .takeaway, .caveat")).toHaveCount(0)
    const fontIssues = await page.locator(".slide").evaluate((root) => [...root.querySelectorAll("*")].flatMap((el) => {
      const style = getComputedStyle(el)
      return style.fontFamily.includes("Montserrat") && (style.fontWeight !== "100" || style.textTransform !== "uppercase") ? [el.className] : []
    }))
    expect(fontIssues).toEqual([])
  }
  await expect(page.locator(".slide h2")).toHaveText("Resultados y conclusiones")
})

test("las variables, el ejemplo de MAE y los modelos elegidos usan los datos reales", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("variables")}`)
  const recent = products.A.monthly.filter((row) => row.complete_for_modeling).slice(-3)
  await expect(page.locator(".feature-history strong")).toHaveText([...recent.map((row) => number(row.sales_units)), "205"])
  await visit(page, "precision")
  const example = forecastSeries(products.B, true).slice(0, 3)
  for (const [i, row] of example.entries()) await expect(page.locator(".mae-example tbody tr").nth(i).locator("td")).toHaveText([number(row.actual), number(row.selected, 2), number(Math.abs(row.selected - row.actual), 2)])
  const meanError = example.reduce((sum, row) => sum + Math.abs(row.selected - row.actual), 0) / 3
  await expect(page.locator(".large-caption")).toContainText(number(meanError, 2))
  await visit(page, "seleccion")
  await expect(page.locator(".selection-table tbody td")).toHaveText(Object.values(products).map((p) => MODEL_NAMES[p.selection.model]))
})

test("los resultados finales y los meses sin ventas no cambian al simplificar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("resultado-a")}`)
  for (const [i, p] of Object.values(products).entries()) {
    const score = (model) => p.comparison.find((row) => row.model === model && row.phase === "holdout").mae
    await expect(page.locator(".result-table tbody tr").nth(i).locator("td")).toHaveText([number(score(p.selection.model), 2), number(score("naive"), 2)])
  }
  await visit(page, "variabilidad")
  for (const [i, p] of Object.values(products).entries()) await expect(page.locator("tbody tr").nth(i).locator("td").last()).toHaveText(`${p.profile.zero_periods} de ${p.profile.usable_months}`)
  await visit(page, "resultado-b")
  const e = forecastSeries(products.E, true)
  await expect(page.locator(".zero-example tbody tr").nth(0).locator("td")).toHaveText(e.map((row) => number(row.actual)))
  await expect(page.locator(".zero-example tbody tr").nth(1).locator("td")).toHaveText(e.map((row) => number(row.selected)))
  await expect(page.locator(".large-caption")).toContainText("13 unidades")
  await visit(page, "fallo")
  await expect(page.locator(".rows")).toContainText(number(products.A.forecast.raw_forecast_units, 2))
  await expect(page.locator(".rows")).toContainText("205 unidades")
})

test("los escenarios conservan las cantidades, fechas y límites originales", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("escenario-b")}`)
  for (const step of [0, 1]) {
    await visit(page, "escenario-b", step)
    for (const [id, p] of Object.entries(products)) {
      const zero = productionVariant(p, 0), one = productionVariant(p, 1)
      const row = page.locator(`.portfolio-scenarios tr[data-product="${id}"]`)
      await expect(row.locator("td")).toHaveText([number(one.recorded_on_hand_units), `${number(zero.suggested_production_units)}${zero.constraints_prevent_target ? "*" : ""}`, `${number(one.suggested_production_units)}${one.constraints_prevent_target ? "*" : ""}`])
      await expect(row.locator("td.is-current")).toHaveAttribute("aria-current", "step")
      await expect(row.locator("th")).toContainText(month(one.balance_cutoff))
    }
    await expect(page.locator(".small-explanation")).toContainText("439")
  }
  await expect(page.getByTestId("scenario-units-B")).toHaveText("192")
  await expect(page.getByTestId("scenario-units-C")).toHaveText("300")
  await visit(page, "escenario-a", 1)
  for (const [id, p] of Object.entries(products)) await expect(page.locator(`.replay-table tr[data-product="${id}"] td`)).toHaveText([number(replayTotal(p, 0)), number(replayTotal(p, 1))])
  await expect(page.locator(".small-explanation")).toContainText("no representan pérdidas ni ahorros reales comprobados")
})

test("las curvas conservan los puntos originales, las escalas propias y los cinco productos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("tendencia")}`)
  for (const id of ["tendencia", "errores"]) {
    await visit(page, id)
    const cells = page.locator(".product-chart-grid > .chart-panel")
    await expect(cells).toHaveCount(5)
    const boxes = await cells.evaluateAll((elements) => elements.map((el) => ({ top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.querySelector(".chart-wrap, .forecast-chart").offsetHeight })))
    expect(boxes[0].top).toBe(boxes[1].top)
    expect(boxes[2].top).toBe(boxes[3].top)
    expect(boxes[3].top).toBe(boxes[4].top)
    expect(boxes[2].top).toBeGreaterThan(boxes[0].top)
    expect(boxes.every((box) => box.height >= 165)).toBe(true)
    for (const [productId, p] of Object.entries(products)) {
      const cell = page.locator(`[data-product="${productId}"]`)
      const lines = cell.locator(".recharts-line-curve")
      await expect(lines).toHaveCount(id === "tendencia" ? 1 : 3)
      for (const line of await lines.all()) {
        expect((await line.getAttribute("d")).match(/[ML]/g)).toHaveLength(id === "tendencia" ? p.summary.complete_months : 6)
        await expect(line).toHaveAttribute("stroke-linecap", "round")
        await expect(line).toHaveAttribute("stroke-linejoin", "round")
      }
      await expect(cell.locator(id === "tendencia" ? ".sales-identity .recharts-line-curve" : ".selected-forecast .recharts-line-curve")).toHaveAttribute("stroke", PRODUCT_STROKES[productId])
    }
  }
})

test("las entradas son finitas, se repiten y respetan movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(`/${hashFor("tendencia")}`)
  await expect(page.locator(".recharts-line-curve").first()).toBeVisible()
  await page.keyboard.press("r")
  const state = () => page.locator(".slide-frame").evaluate((root) => root.getAnimations({ subtree: true }).map((animation) => ({ name: animation.animationName, time: animation.currentTime, state: animation.playState, iterations: animation.effect.getTiming().iterations })))
  await expect.poll(async () => (await state()).some((animation) => animation.name === "chart-reveal" && animation.state === "running")).toBe(true)
  expect((await state()).every((animation) => animation.iterations === 1)).toBe(true)
  await expect.poll(async () => (await state()).every((animation) => animation.state === "finished")).toBe(true)
  await at(page, "tendencia")
  await page.keyboard.press("r")
  await expect.poll(async () => (await state()).some((animation) => animation.state === "running")).toBe(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect.poll(async () => (await state()).length).toBe(0)
  await expect(page.locator(".recharts-line-curve").first()).toHaveCSS("clip-path", "none")
})

test("los controles ocultos reaparecen al recibir foco", async ({ page }) => {
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
  for (const el of root.querySelectorAll(".slide-head, .content, .cover > *, .cover-copy > *, .cover-products li, .content > *, .split > *, .flow li, .rows li, .product-label, .portfolio-table th, .portfolio-table td, .chart-panel, .chart-wrap, .forecast-chart, .lesson-body, .lesson-readout, .lesson-footer, .feature-history > *")) {
    if (!el.getClientRects().length) continue
    const box = el.getBoundingClientRect()
    if (box.bottom > Math.min(rail.top - 3, nav.top - 3)) issues.push(`${el.className}: invade controles`)
    if (box.left < stage.left - 1 || box.right > stage.right + 1 || box.top < stage.top - 1) issues.push(`${el.className}: fuera del escenario`)
    if (!el.matches("h1, h2, h3, .slide-head") && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 3)) issues.push(`${el.tagName}.${el.className}: desbordado ${el.scrollWidth}×${el.scrollHeight} / ${el.clientWidth}×${el.clientHeight}`)
  }
  for (const path of root.querySelectorAll("svg path")) if (/NaN|Infinity/.test(path.getAttribute("d"))) issues.push("Geometría inválida")
  for (const rect of root.querySelectorAll("svg rect")) if (["width", "height"].some((key) => parseFloat(rect.getAttribute(key)) < 0)) issues.push("Rectángulo negativo")
  return issues
}

test("todos los pasos caben en tres tamaños y generan capturas para revisión visual", async ({ page, context }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const captures = []
  for (const viewport of [{ width: 1600, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport)
    for (const { slide, step } of route) {
      await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/${step}`)
      await at(page, slide, step)
      await page.evaluate(() => document.fonts.ready)
      expect.soft(await page.locator(".slide").evaluate(layoutIssues), `${slide + 1}/${step + 1} a ${viewport.width}×${viewport.height}`).toEqual([])
      if (viewport.width === 1600) {
        const buffer = await page.screenshot({ path: testInfo.outputPath(`diapositiva-${String(slide + 1).padStart(2, "0")}-${step}.png`) })
        captures.push(buffer.toString("base64"))
      }
    }
  }
  const contact = await context.newPage()
  await contact.setViewportSize({ width: 1280, height: 1440 })
  for (let i = 0; i < captures.length; i += 8) {
    await contact.setContent(`<html lang="es"><body style="margin:0;display:grid;grid-template-columns:repeat(2,640px)">${captures.slice(i, i + 8).map((image) => `<img width="640" height="360" src="data:image/png;base64,${image}">`).join("")}</body></html>`)
    await contact.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())))
    await contact.screenshot({ path: testInfo.outputPath(`resumen-visual-${i / 8 + 1}.png`) })
  }
  await contact.close()
})

test("el HTML único funciona sin red con fuentes, fotos, gráficos y navegación", async ({ page, context }) => {
  expect(readdirSync(resolve("dist"))).toEqual(["index.html"])
  const html = readFileSync(resolve("dist/index.html"), "utf8")
  const manifest = html.match(/<script[^>]*id="procedencia-datos"[^>]*>([\s\S]*?)<\/script>/)
  expect(manifest).not.toBeNull()
  expect(JSON.parse(manifest[1]).provenance).toEqual(loadEvidence().provenance)
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
    if (STORY[position.slide].id === "productos") expect(await page.locator("img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true)
    await page.keyboard.press("PageDown")
  }
  await at(page, end)
  expect(requests).toEqual([])
})

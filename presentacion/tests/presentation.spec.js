import { test, expect } from "@playwright/test"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { STORY, lastMainSlide } from "../src/presentation.js"
import { BUSINESS, MODEL_NAMES, number } from "../src/business.js"
import { PRODUCT_STROKES, contrast } from "../src/chart-colors.js"
import { loadEvidence } from "../evidence-loader.js"
import { evaluationSplit, forecastSeries, productionVariant, replayTotal } from "../src/analysis.js"

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

async function browserMonth(page, value) {
  return page.evaluate((date) => new Intl.DateTimeFormat("es-GT", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`)).replace(".", ""), value)
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
  await page.goto(`/?audiencia=universidad${hashFor("escenario-a", 1)}`)
  await at(page, "escenario-a", 1)
  await page.reload()
  await at(page, "escenario-a", 1)
  await page.keyboard.press("Shift+ArrowRight")
  await at(page, "estado")
  await page.keyboard.press("ArrowLeft")
  await at(page, "escenario-a", 1)
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
})

test("Espacio no avanza dos veces y la repetición de tecla se ignora", async ({ page }) => {
  await page.goto(`/${hashFor("validacion")}`)
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).focus()
  await page.keyboard.press("Space")
  await at(page, "precision")
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", repeat: true })))
  await at(page, "precision")
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
  await expect(page.locator(".product-inputs thead th")).toHaveCount(2)
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
    expect(text).not.toMatch(/SHA-256|huellas|conciliaci[oó]n|FDR|arm[oó]nic|WAPE|RMSE|salvaguardas|16 m[eé]todos|48 escenarios|pruebas automatizadas|\.py\b|m[oó]dulos|repositorio|\breserva\b|\bseguridad\b|colch[oó]n|;/i)
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
  await expect(page.locator(".selection-table tbody td:first-of-type")).toHaveText(Object.values(products).map((p) => MODEL_NAMES[p.selection.model]))
  await expect(page.locator(".selection-table tbody td:last-child")).toHaveCount(5)
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
  await expect(page.locator(".large-caption")).toHaveText("Un error bajo no basta para decidir cuánto inventario mantener.")
  await visit(page, "fallo")
  await expect(page.locator(".failure-steps")).toContainText(number(products.A.forecast.raw_forecast_units, 2))
  await expect(page.locator(".failure-steps")).toContainText("205 unidades")
})

test("las diapositivas 15 a 22 muestran las identidades, razones y textos solicitados", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("validacion")}`)
  await expect(page.locator(".validation-slide .flow-num")).toHaveCount(3)
  for (const item of await page.locator(".validation-slide .flow-num").all()) expect(Number(await item.evaluate((el) => getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(700)
  await expect(page.locator(".validation-slide .large-caption, .cue-segment")).toHaveCount(0)
  const split = evaluationSplit(products.A)
  await expect(page.locator(".validation-distribution figcaption")).toContainText(`Distribución de los ${split.total} meses del producto`)
  await expect(page.locator(".validation-distribution figcaption .product-a")).toHaveText("A")
  const segments = page.locator(".validation-bar [role='listitem']")
  await expect(segments.locator("strong")).toHaveText([`${split.training} meses`, `${split.validation} meses`, `${split.test} meses`])
  await expect(segments.locator("span")).toHaveText(["Entrenamiento inicial", "Validación", "Prueba final"])
  for (const [index, label] of ["Entrenamiento inicial", "Validación", "Prueba final"].entries()) await expect(segments.nth(index)).toHaveAttribute("aria-label", `${label}: ${[split.training, split.validation, split.test][index]} meses`)
  const geometry = await segments.evaluateAll((elements) => elements.map((el) => ({ width: el.getBoundingClientRect().width, color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor })))
  const totalWidth = geometry.reduce((sum, segment) => sum + segment.width, 0)
  const toHex = (rgb) => `#${rgb.match(/\d+/g).slice(0, 3).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`
  for (const [index, segment] of geometry.entries()) {
    expect(Math.abs(segment.width / totalWidth - [split.training, split.validation, split.test][index] / split.total)).toBeLessThan(.005)
    expect(contrast(toHex(segment.color), toHex(segment.background))).toBeGreaterThanOrEqual(4.5)
  }

  await visit(page, "precision")
  await expect(page.locator(".mae-example caption .product-b b")).toHaveText("B")
  await expect(page.locator(".chart-intro strong")).toHaveText("MAE")

  await visit(page, "seleccion")
  for (const header of await page.locator(".selection-table thead th").all()) expect(Number(await header.evaluate((el) => getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(700)
  await expect(page.locator(".selection-table tbody td:last-child")).toHaveText([
    /cercano al mínimo.*regularizar/, /cercano al mínimo.*sencilla/, /Menor error en validación/, /Menor error en validación/, /Menor error en validación.*poco frecuentes/,
  ])

  await visit(page, "resultado-a")
  await expect(page.locator(".large-caption .inline-product")).toHaveText(["A", "C", "E", "B", "D"])
  for (const badge of await page.locator(".large-caption .inline-product").all()) {
    const id = await badge.textContent()
    const color = await badge.evaluate((el) => getComputedStyle(el).backgroundColor)
    const expected = BUSINESS[id].color.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16))
    expect(color).toBe(`rgb(${expected.join(", ")})`)
  }

  await visit(page, "errores")
  await expect(page.locator(".chart-legend-unit")).toHaveText("Unidades por mes")
  await expect(page.locator(".chart-legend")).not.toContainText("Escala propia")
  const positions = await page.locator(".chart-legend > span").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().right))
  const legendRight = await page.locator(".chart-legend").evaluate((el) => el.getBoundingClientRect().right)
  expect(Math.abs(positions.at(-1) - legendRight)).toBeLessThan(1)

  await visit(page, "resultado-b")
  await expect(page.locator(".slide")).not.toContainText("Prueba final")
  await expect(page.locator(".slide")).not.toContainText("Predecir cero")

  await visit(page, "fallo")
  await expect(page.locator(".failure-header .product-a")).toContainText(BUSINESS.A.shortName)
  const headerBoxes = await page.locator(".failure-header > *").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().left))
  expect(headerBoxes[1]).toBeGreaterThan(headerBoxes[0])
  await expect(page.locator(".failure-steps li")).toHaveCount(3)
  const cardStyle = (el) => {
    const style = getComputedStyle(el)
    const text = getComputedStyle(el.querySelector("p"))
    return { border: style.borderTop, background: style.backgroundColor, shadow: style.boxShadow, padding: style.paddingTop, font: text.fontSize, margin: text.marginTop }
  }
  const failureStyle = await page.locator(".failure-steps li").first().evaluate(cardStyle)

  await visit(page, "planificacion")
  await expect(page.locator(".planning-inputs > div").first()).toContainText("período de revisión y reposición")
  expect(failureStyle).toEqual(await page.locator(".planning-inputs > div").first().evaluate(cardStyle))
})

test("los gráficos finales mantienen su popover y nombre accesible sin tooltip nativo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("errores")}`)
  for (const [id, p] of Object.entries(products)) {
    const chart = page.locator(`[data-product="${id}"] .recharts-surface`)
    const start = await browserMonth(page, p.selection.holdout_start)
    const end = await browserMonth(page, p.selection.holdout_end)
    await expect(chart).toHaveAttribute("aria-label", new RegExp(`producto ${id}.*${start} a ${end}`))
    await expect(chart.locator("title")).toBeEmpty()
    await expect(chart).not.toHaveAttribute("title")
  }
  const chart = page.locator('[data-product="B"] .recharts-surface')
  const box = await chart.boundingBox()
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5)
  const tooltip = page.locator('[data-product="B"] .chart-tooltip')
  await expect(tooltip).toBeVisible()
  await expect(tooltip).toContainText("Venta real registrada")
  await expect(tooltip).toContainText("Último mes")
})

test("el escenario y la simulación conservan sus cantidades y fechas históricas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("escenario-b")}`)
  for (const [id, p] of Object.entries(products)) {
    const scenario = productionVariant(p)
    const row = page.locator(`.portfolio-scenarios tr[data-product="${id}"]`)
    await expect(row.locator("td")).toHaveText([number(scenario.expected_monthly_outgoing_units, 2), number(scenario.recorded_on_hand_units), `${number(scenario.suggested_production_units)}${scenario.constraints_prevent_target ? "*" : ""}`])
    await expect(row.locator("th")).toContainText(await browserMonth(page, scenario.balance_cutoff))
  }
  await expect(page.locator(".small-explanation")).toContainText("escenario hipotético")
  await expect(page.getByTestId("scenario-units-B")).toHaveText("95")
  await expect(page.getByTestId("scenario-units-C")).toHaveText("229")
  await visit(page, "escenario-a", 1)
  for (const [id, p] of Object.entries(products)) await expect(page.locator(`.replay-table tr[data-product="${id}"] td`)).toHaveText([number(replayTotal(p))])
  await expect(page.locator(".small-explanation")).toContainText("no pérdidas ni ahorros reales comprobados")
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

test("la entrada de revisión es finita, repetible y respeta movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(`/${hashFor("fallo")}`)
  const animations = () => page.locator(".failure-steps").evaluate((root) => root.getAnimations({ subtree: true }).map((animation) => ({ name: animation.animationName, state: animation.playState, iterations: animation.effect.getTiming().iterations })))
  await expect.poll(async () => (await animations()).filter((animation) => animation.name === "failure-card-in").length).toBe(3)
  expect((await animations()).every((animation) => animation.iterations === 1)).toBe(true)
  await expect.poll(async () => (await animations()).every((animation) => animation.state === "finished")).toBe(true)
  await page.keyboard.press("r")
  await expect.poll(async () => (await animations()).some((animation) => animation.name === "failure-card-in" && animation.state === "running")).toBe(true)
  await at(page, "fallo")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect.poll(async () => (await animations()).length).toBe(0)
  for (const item of await page.locator(".failure-steps li").all()) await expect(item).toHaveCSS("opacity", "1")
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
  for (const el of root.querySelectorAll(".slide-head, .content, .cover > *, .cover-copy > *, .cover-products li, .content > *, .split > *, .flow li, .rows li, .product-label, .portfolio-table th, .portfolio-table td, .chart-panel, .chart-wrap, .forecast-chart, .lesson-body, .lesson-readout, .lesson-footer, .feature-history > *, .validation-segment, .failure-steps li")) {
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

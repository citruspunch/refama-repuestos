import { test, expect } from "@playwright/test"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { STORY, lastMainSlide } from "../src/presentation.js"
import { BUSINESS, month, number, price } from "../src/business.js"
import { CHART_COLORS, PRODUCT_STROKES } from "../src/chart-colors.js"
import { loadEvidence } from "../evidence-loader.js"
import { comparablePeriod, forecastSeries, productionVariant, replayTotal } from "../src/analysis.js"

const end = lastMainSlide()
const scenes = Object.fromEntries(STORY.map((scene, index) => [scene.id, index]))
const hashFor = (id, step = 0) => `#${scenes[id]}/${step}`
const route = STORY.slice(0, end + 1).flatMap((scene, slide) => scene.cues.map((_, step) => ({ slide, step })))
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

test("los enlaces, la recarga y los saltos conservan el paso exacto", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
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
  await page.evaluate((hash) => { window.location.hash = hash }, `#${scenes["escenario-b"]}`)
  await at(page, "escenario-b")
})

test("Explorar consulta variantes archivadas y Presentar restaura el escenario del guion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("escenario-b", 1)}`)
  const safety = page.getByRole("combobox", { name: "Stock de seguridad supuesto", exact: true, includeHidden: true })
  const days = page.getByRole("combobox", { name: "Días de producción asignados", exact: true, includeHidden: true })
  await expect(safety).toBeHidden()
  await expect(safety).toBeDisabled()
  await expect(safety).toHaveValue("1")
  await expect(page.getByTestId("scenario-units-B")).toHaveText("192")
  await expect(page.getByTestId("scenario-units-C")).toHaveText("300")
  await page.keyboard.press("g")
  await expect(safety).toBeVisible()
  await expect(safety).toBeEnabled()
  await safety.selectOption("0")
  await days.selectOption("5")
  await expect(page.getByTestId("scenario-units-B")).toHaveText("95")
  await safety.focus()
  await page.keyboard.press("ArrowDown")
  await at(page, "escenario-b", 1)
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
  await expect(page.getByTestId("scenario-units-B")).toHaveText("192")
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
  await expect(page.locator(".chart-tooltip").first().locator(":scope > div")).toHaveCount(1)
})

test("pausa y repetición no avanzan pasos ni pierden los datos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(`/${hashFor("fallo")}`)
  await page.keyboard.press("p")
  await expect(page.locator(".slide-frame")).toHaveCSS("animation-play-state", "paused")
  await settleAnimations(page)
  const frozen = await page.locator(".slide-frame").evaluate((el) => getComputedStyle(el).transform)
  await page.waitForTimeout(150)
  expect(await page.locator(".slide-frame").evaluate((el) => getComputedStyle(el).transform)).toBe(frozen)
  await at(page, "fallo")
  await page.keyboard.press("p")
  await expect(page.locator(".slide-frame")).toHaveCSS("animation-play-state", "running")
  await page.keyboard.press("r")
  await at(page, "fallo")
  await page.keyboard.press("ArrowRight")
  await at(page, "fallo", 1)
  await expect(page.locator(".note")).toContainText("325")
})

test("Espacio activa un botón una vez y las teclas mantenidas se ignoran", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`/${hashFor("validacion")}`)
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).focus()
  await page.keyboard.press("Space")
  await at(page, "validacion", 1)
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", repeat: true })))
  await at(page, "validacion", 1)
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
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor("escenario-b"))
  await at(page, "escenario-b")
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
  const identities = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return Object.fromEntries(["a", "b", "c", "d", "e"].map((id) => {
      const probe = document.createElement("span")
      probe.style.color = `var(--${id})`
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return [id.toUpperCase(), { token: style.getPropertyValue(`--${id}`).trim(), color }]
    }))
  })
  for (const [id, p] of Object.entries(BUSINESS)) {
    const rgb = [1, 3, 5].map((index) => parseInt(p.color.slice(index, index + 2), 16))
    expect(identities[id].color).toBe(`rgb(${rgb.join(", ")})`)
  }
  for (const slide of [0, 1, 4, 5, 10, 12, scenes["escenario-b"], STORY.length - 1]) {
    await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/0`)
    await at(page, slide)
    const violations = await page.locator(".viewport").evaluate((root) => [...root.querySelectorAll("*")].flatMap((el) => {
      const style = getComputedStyle(el)
      return style.fontFamily.includes("Montserrat") && (style.fontWeight !== "100" || style.textTransform !== "uppercase") ? [`${el.className}: ${style.fontWeight}, ${style.textTransform}`] : []
    }))
    expect(violations).toEqual([])
  }
})

test("la portada identifica los cinco productos sin comprimir cinco gráficas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await at(page, 0)
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator(".cover h1")).toHaveText("Ventas e inventario")
  await expect(page.locator(".cover-metrics dd")).toHaveText(["2,108", "Hasta 16", "48"])
  const rows = page.locator(".cover-products li")
  await expect(rows).toHaveCount(5)
  const dimensions = await rows.evaluateAll((elements) => elements.map((el) => [el.offsetWidth, el.offsetHeight]))
  expect(dimensions.every(([width, height]) => width === dimensions[0][0] && height === dimensions[0][1])).toBe(true)
  for (const [index, id] of Object.keys(BUSINESS).entries()) {
    const row = rows.nth(index)
    await expect(row.locator(".product-label")).toHaveText(`${id}${BUSINESS[id].shortName}`)
    await expect(row).toContainText(BUSINESS[id].code)
  }
  await expect(page.locator(".cover .recharts-wrapper")).toHaveCount(0)
})

test("el catálogo y los escenarios muestran los cinco productos con el mismo detalle", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#3/0")
  await at(page, 3)
  const products = loadEvidence().products
  await expect(page.locator(".product-inputs tbody tr")).toHaveCount(5)
  for (const [index, id] of Object.keys(products).entries()) {
    const row = page.locator(".product-inputs tbody tr").nth(index)
    await expect(row).toContainText(BUSINESS[id].code)
    await expect(row.locator("td").first()).toHaveText(price(products[id].catalog.monto_reportado_gtq))
  }
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor("escenario-b", 1))
  await at(page, "escenario-b", 1)
  await expect(page.locator(".portfolio-scenarios tbody tr")).toHaveCount(5)
  for (const [id, p] of Object.entries(products)) {
    const zero = productionVariant(p, 0)
    const one = productionVariant(p, 1)
    const row = page.locator(`.portfolio-scenarios tr[data-product="${id}"]`)
    await expect(row.locator("td")).toHaveText([number(one.recorded_on_hand_units), number(one.expected_monthly_outgoing_units, 2), number(zero.suggested_production_units), `${number(one.suggested_production_units)}${one.constraints_prevent_target ? "*" : ""}`, number(one.estimated_production_days_required, 2)])
    await expect(row.locator("td.is-current")).toHaveAttribute("aria-current", "step")
  }
  await expect(page.locator(".scenario-toolbar")).toBeHidden()
  await expect(page.getByTestId("scenario-units-B")).toHaveText("192")
  await expect(page.locator(".small-explanation")).toContainText("439 u.")
})

test("los pasos mantienen cinco productos visibles y explican costos, ceros y simulación", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#3/1")
  await at(page, 3, 1)
  for (const id of Object.keys(BUSINESS)) await expect(page.locator(".product-inputs")).toContainText(BUSINESS[id].code)
  await expect(page.locator(".product-inputs")).toContainText("30 a 35")
  await expect(page.locator(".product-inputs tbody tr.amount-pending")).toHaveCount(0)
  await expect(page.locator(".product-inputs tbody tr").nth(3)).toContainText("Precio neto")
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor("errores", 1))
  await at(page, "errores", 1)
  await expect(page.locator(".note")).toContainText("WAPE final de 100%")
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor("escenario-a", 2))
  await at(page, "escenario-a", 2)
  for (const [id, p] of Object.entries(loadEvidence().products)) {
    const row = page.locator(`.replay-table tr[data-product="${id}"]`)
    await expect(row.locator("td").nth(0)).toHaveText(number(replayTotal(p, 0)))
    await expect(row.locator("td").nth(1)).toHaveText(number(replayTotal(p, 1)))
  }
  await expect(page.locator(".note")).toContainText("No mide faltantes reales")
})

test("ventas, inventarios, variables, validación y resultados incluyen siempre A a E", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const comparisons = [["productos", 0], ["productos", 1], ["origen", 0], ["muestra", 0], ["tendencia", 0], ["canales", 0], ["variabilidad", 0], ["estacionalidad", 0], ["inventario", 0], ["inventario", 1], ["variables", 0], ["validacion", 0], ["validacion", 1], ["seleccion", 0], ["resultado-a", 0], ["errores", 0], ["errores", 1], ["controles", 0], ["escenario-b", 0], ["escenario-b", 1], ["escenario-a", 1], ["escenario-a", 2], ["conclusiones", 0]]
  for (const [id, step] of comparisons) {
    await page.evaluate((hash) => { window.location.hash = hash }, hashFor(id, step))
    await at(page, id, step)
    await expect(page.locator(".slide .product-label b"), `Productos en ${id}/${step + 1}`).toHaveText(["A", "B", "C", "D", "E"])
  }
})

test("las gráficas forman dos filas A/B y C/D/E con altura suficiente y datos propios", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#9/0")
  const products = loadEvidence().products
  for (const [id, p] of Object.entries(products)) {
    await expect(page.locator(`.sales-grid [data-product="${id}"] .grid-ytd span`)).toContainText(comparablePeriod(p))
    await expect(page.locator(`.sales-grid [data-product="${id}"] .recharts-line-curve`)).toHaveCount(1)
    const line = page.locator(`.sales-grid [data-product="${id}"] .sales-identity .recharts-line-curve`)
    await expect(line).toHaveAttribute("stroke", PRODUCT_STROKES[id])
    await expect(line).toHaveAttribute("stroke-width", "2.75")
    await expect(line).toHaveAttribute("stroke-linecap", "round")
    await expect(line).toHaveAttribute("stroke-linejoin", "round")
    expect((await line.getAttribute("d")).match(/[ML]/g)).toHaveLength(p.summary.complete_months)
  }
  await assertProductGrid(page)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: testInfo.outputPath("ventas-grid.png") })
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor("errores"))
  await at(page, "errores")
  for (const [id, p] of Object.entries(products)) {
    const row = page.locator(`.forecast-grid [data-product="${id}"]`)
    await expect(row.locator(".recharts-line-curve")).toHaveCount(3)
    await expect(row.locator(".selected-forecast .recharts-line-curve")).toHaveAttribute("stroke", PRODUCT_STROKES[id])
    await expect(row.locator(".selected-forecast .recharts-line-curve")).toHaveAttribute("stroke-dasharray", "8 5")
    await expect(row.locator(".naive-forecast .recharts-line-curve")).toHaveAttribute("stroke-dasharray", "1 6")
    for (const line of await row.locator(".recharts-line-curve").all()) {
      expect((await line.getAttribute("d")).match(/[ML]/g)).toHaveLength(forecastSeries(p, true).length)
      await expect(line).toHaveAttribute("stroke-linecap", "round")
      await expect(line).toHaveAttribute("stroke-linejoin", "round")
    }
    await expect(row.locator("svg title")).toContainText(`${month(p.selection.holdout_start)} a ${month(p.selection.holdout_end)}`)
  }
  await assertProductGrid(page)
  await page.screenshot({ path: testInfo.outputPath("prueba-grid.png") })
  await page.locator(".recharts-surface[role='application']").first().focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.locator(".chart-tooltip").first().locator(":scope > div")).toHaveCount(3)
})

test("las barras no tienen contorno y redondean solo su extremo libre", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const id of ["resultado-a", "resultado-b"]) {
    await page.goto(`/${hashFor(id)}`)
    await at(page, id)
    const bars = page.locator(".recharts-bar-rectangle .recharts-rectangle")
    await expect(bars).toHaveCount(id === "resultado-a" ? 5 : 4)
    for (const bar of await bars.all()) {
      await expect(bar).toHaveAttribute("stroke", "none")
      expect((await bar.getAttribute("d")).match(/A/g)).toHaveLength(2)
    }
    if (id === "resultado-a") {
      for (const [index, p] of Object.values(BUSINESS).entries()) await expect(bars.nth(index)).toHaveAttribute("fill", p.color)
    }
    await expect(page.locator(".recharts-cartesian-grid line").first()).toHaveAttribute("stroke", CHART_COLORS.grid)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: testInfo.outputPath(`barras-${id}.png`) })
  }
})

async function assertProductGrid(page) {
  const cells = page.locator(".product-chart-grid > .chart-panel")
  await expect(cells).toHaveCount(5)
  const boxes = await cells.evaluateAll((figures) => figures.map((el) => ({ top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, chartHeight: el.querySelector(".chart-wrap, .forecast-chart").offsetHeight })))
  expect(boxes[0].top).toBe(boxes[1].top)
  expect(boxes[2].top).toBe(boxes[3].top)
  expect(boxes[3].top).toBe(boxes[4].top)
  expect(boxes[2].top).toBeGreaterThan(boxes[0].top)
  expect(boxes[0].left).toBeLessThan(boxes[1].left)
  expect(boxes[2].left).toBeLessThan(boxes[3].left)
  expect(boxes[3].left).toBeLessThan(boxes[4].left)
  expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(1)
  expect(Math.abs(boxes[2].width - boxes[4].width)).toBeLessThanOrEqual(1)
  expect(boxes.every((box) => box.chartHeight >= 165)).toBe(true)
}

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
    expect.soft(prose.split(/\s+/).length, `Texto de la diapositiva ${slide + 1}/${step + 1}`).toBeLessThanOrEqual(100)
    expect(prose).not.toMatch(/piloto|siguientes pasos|próximos pasos|solicitamos|proponemos|nuestro|la decisión también debería/i)
  }
  await expect(page.locator(".slide h2")).toHaveText("Resultados y conclusiones")
  await expect(page.locator(".conclusion-record")).toContainText("2,108 movimientos preservados")
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
  await page.evaluate((hash) => { window.location.hash = hash }, hashFor("resultado-a"))
  await at(page, "resultado-a")
  await expect(page.locator(".recharts-bar-rectangles")).toHaveCSS("animation-name", "chart-reveal")
  const bars = await page.locator(".recharts-bar-rectangles").elementHandle()
  await page.keyboard.press("p")
  expect(await bars.evaluate((el) => el.isConnected)).toBe(true)
})

test("las nuevas filas, conexiones y resaltados son finitos y respetan pausa y movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  for (const [hash, selector, name] of [["#3/0", ".product-inputs tbody tr", "row-in"], ["#1/0", ".connector-svg path", "connector-in"], [hashFor("escenario-b", 1), ".portfolio-scenarios td.is-current", "cell-in"]]) {
    await page.goto(`/${hash}`)
    await page.keyboard.press("r")
    await page.keyboard.press("p")
    await settleAnimations(page)
    const state = () => page.locator(selector).first().evaluate((el) => el.getAnimations().map((animation) => ({ name: animation.animationName, time: animation.currentTime, state: animation.playState, iterations: animation.effect.getTiming().iterations })))
    const frozen = await state()
    expect(frozen.some((animation) => animation.name === name)).toBe(true)
    expect(frozen.every((animation) => animation.state === "paused" && animation.iterations === 1)).toBe(true)
    await page.waitForTimeout(100)
    expect(await state()).toEqual(frozen)
    await page.keyboard.press("p")
    await expect.poll(async () => (await state()).every((animation) => animation.state === "finished")).toBe(true)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect.poll(async () => (await state()).length).toBe(0)
    await expect(page.locator(selector).first()).toHaveCSS("opacity", "1")
    await page.emulateMedia({ reducedMotion: "no-preference" })
  }
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
  for (const el of root.querySelectorAll(".slide-head, .content, .takeaway, .caveat, .cover > *, .cover-copy, .cover-copy > *, .cover-visual, .cover-products, .cover-products li, .content > *, .product-chart-grid, .product-chart-grid > *, .grid-ytd, .forecast-metrics, .chart-wrap, .split > *, .product-label, .inventory-reading, .comparison-figure, .product-findings > div, .source-ledgers > div, .timeline-product, .timeline-track, .forecast-chart, .guard-readings > div, .zero-cases > article, .portfolio-table th, .portfolio-table td, .scenario-toolbar > *")) {
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

test("los escenarios de los cinco productos caben en Presentar y Explorar", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const viewport of [{ width: 1600, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport)
    for (const mode of ["present", "explore"]) for (const step of [0, 1]) {
      await page.goto(`/?mode=${mode}${hashFor("escenario-b", step)}`)
      await at(page, "escenario-b", step)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.locator(".slide").evaluate(layoutIssues), `${mode}/${step} a ${viewport.width}×${viewport.height}`).toEqual([])
      if (viewport.width === 1600) await page.screenshot({ path: testInfo.outputPath(`escenario-b-${mode}-${step}.png`) })
    }
  }
})

test("el único HTML funciona por file:// sin red, con fuentes, gráficos y controles", async ({ page, context }) => {
  expect(readdirSync(resolve("dist"))).toEqual(["index.html"])
  const html = readFileSync(resolve("dist/index.html"), "utf8")
  const manifest = html.match(/<script[^>]*id="procedencia-datos"[^>]*>([\s\S]*?)<\/script>/)
  expect(manifest, "El HTML conserva la procedencia fuera del código eliminable").not.toBeNull()
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
    await page.keyboard.press("PageDown")
  }
  await at(page, end)
  expect(requests).toEqual([])
})

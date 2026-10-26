import { test, expect } from "@playwright/test"
import { readdirSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { STORY, lastMainSlide } from "../src/presentation.js"

const end = lastMainSlide()
const route = STORY.slice(0, end + 1).flatMap((scene, slide) => scene.cues.map((_, step) => ({ slide, step })))
const errors = new WeakMap()
test.beforeEach(async ({ page }) => {
  errors.set(page, [])
  page.on("pageerror", (error) => errors.get(page).push(error.message))
})
test.afterEach(async ({ page }) => { expect(errors.get(page), "No runtime errors").toEqual([]) })

async function at(page, slide, step = 0) {
  await expect(page.locator(".viewport")).toHaveAttribute("data-slide", String(slide))
  await expect(page.locator(".viewport")).toHaveAttribute("data-step", String(step))
  await expect(page.locator(".slide h1, .slide h2")).toHaveText(STORY[slide].title)
}

test("the whole main talk works forwards and backwards with a clicker", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (let i = 0; i < route.length; i++) {
    await at(page, route[i].slide, route[i].step)
    await expect(page.locator(".slide")).toHaveCount(1)
    expect(await page.locator(".slide").innerText()).not.toMatch(/NaN|Infinity/)
    if (i < route.length - 1) await page.keyboard.press("PageDown")
  }
  await page.keyboard.press("PageDown")
  await at(page, end)
  await expect(page.getByRole("button", { name: "Next step", exact: true })).toBeDisabled()
  for (const position of route.slice(0, -1).reverse()) {
    await page.keyboard.press("PageUp")
    await at(page, position.slide, position.step)
  }
  await page.keyboard.press("PageUp")
  await at(page, 0)
})

test("deep links, refresh, URL parameters, skipping, and appendix preserve position", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?audience=class#1/1")
  await at(page, 1, 1)
  await page.reload()
  await at(page, 1, 1)
  await page.keyboard.press("a")
  await at(page, end + 1)
  await page.keyboard.press("a")
  await at(page, 1, 1)
  await page.keyboard.press("Shift+ArrowRight")
  await at(page, 2)
  await page.keyboard.press("ArrowLeft")
  await at(page, 1, 2)
  await page.keyboard.press("End")
  await at(page, end)
  await page.keyboard.press("Home")
  await at(page, 0)
  expect(new URL(page.url()).searchParams.get("audience")).toBe("class")
})

test("Explore starts from the cue and replay preserves its input values", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#1/2")
  const slider = page.getByRole("slider", { name: "Time constant", exact: true })
  await expect(slider).toBeDisabled()
  await expect(slider).toHaveValue("2")
  await page.keyboard.press("g")
  await expect(slider).toBeEnabled()
  await expect(slider).toHaveValue("2")
  await slider.focus()
  await page.keyboard.press("Home")
  await expect(slider).toHaveValue("0.5")
  await at(page, 1, 2)
  await slider.fill("0.7")
  await page.keyboard.press("r")
  await expect(slider).toHaveValue("0.7")
  await page.keyboard.press("g")
  await expect(slider).toBeDisabled()
  await expect(slider).toHaveValue("2")
  await at(page, 1, 2)
})

test("finite motion pauses, resumes, replays, and holds its endpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/#1/0")
  const clock = page.getByTestId("clock")
  await expect(clock).toHaveText("0.00 s")
  await page.waitForTimeout(200)
  await at(page, 1, 0)
  await expect(clock).toHaveText("0.00 s")
  await page.keyboard.press("ArrowRight")
  await expect.poll(async () => parseFloat(await clock.innerText())).toBeGreaterThan(0.15)
  await page.keyboard.press("p")
  const frozen = await clock.innerText()
  await page.waitForTimeout(220)
  await expect(clock).toHaveText(frozen)
  await page.keyboard.press("p")
  await expect(clock).not.toHaveText(frozen)
  await page.keyboard.press("r")
  await expect.poll(async () => parseFloat(await clock.innerText())).toBeLessThan(0.15)
  await expect(clock).toHaveText("4.00 s", { timeout: 9000 })
  await page.waitForTimeout(250)
  await expect(clock).toHaveText("4.00 s")
  await at(page, 1, 1)
})

test("a focused Recharts plot keeps its keyboard point navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?mode=explore#2/0")
  const chart = page.locator(".recharts-surface[role='application']")
  await chart.focus()
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  await at(page, 2)
  await expect(page.locator(".recharts-tooltip-wrapper")).toBeVisible()
})

test("reduced motion reveals the meaningful final frame without hiding math", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#1/1")
  await expect(page.getByTestId("clock")).toHaveText("4.00 s")
  await expect(page.locator(".katex-mathml math").first()).toBeAttached()
  await expect(page.locator(".katex-error")).toHaveCount(0)
  await expect(page.locator(".rise").first()).toHaveCSS("animation-name", "none")
  await page.keyboard.press("ArrowLeft")
  await expect(page.getByTestId("clock")).toHaveText("0.00 s")
})

test("Space on a focused navigation button advances once; held repeats do not advance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#1/0")
  await page.getByRole("button", { name: "Next step", exact: true }).click()
  await at(page, 1, 1)
  await page.keyboard.press("Space")
  await at(page, 1, 2)
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", repeat: true })))
  await at(page, 1, 2)
})

test("help is modal and restores focus; fullscreen follows browser state", async ({ page }) => {
  await page.goto("/")
  const help = page.getByRole("button", { name: "Keyboard shortcuts", exact: true })
  await help.click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("PageDown")
  await at(page, 0)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await expect(help).toBeFocused()
  await page.bringToFront()
  await page.keyboard.press("f")
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await page.evaluate(() => document.exitFullscreen())
  await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeVisible()
})

test("idle controls become visible when reached by keyboard", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator(".nav")).toHaveClass(/idle/, { timeout: 5000 })
  await page.getByRole("button", { name: "Next step", exact: true }).focus()
  await expect(page.locator(".nav")).toHaveCSS("opacity", "1")
})

test("all cues fit at projector and laptop sizes with valid icons and geometry", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (const viewport of [{ width: 1600, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport)
    for (let slide = 0; slide < STORY.length; slide++) {
      for (let step = 0; step < STORY[slide].cues.length; step++) {
        await page.evaluate((hash) => { window.location.hash = hash }, `#${slide}/${step}`)
        await at(page, slide, step)
        await page.evaluate(() => document.fonts.ready)
        await expect(page.locator(".katex-error, .slide .src")).toHaveCount(0)
        await expect(page.locator(".nav button svg")).toHaveCount(6)
        const issues = await page.locator(".slide").evaluate((root) => {
          const issues = []
          const rail = document.querySelector(".cue-rail").getBoundingClientRect()
          const nav = document.querySelector(".nav").getBoundingClientRect()
          const stage = document.querySelector(".stage").getBoundingClientRect()
          for (const element of root.querySelectorAll(".slide-head, .split > *, .facts, .panel, .cover > *")) {
            const rect = element.getBoundingClientRect()
            if (rect.bottom > Math.min(rail.top - 4, nav.top - 4)) issues.push(`${element.className}: overlaps controls`)
            if (rect.left < stage.left - 1 || rect.right > stage.right + 1) issues.push(`${element.className}: outside stage`)
            if (element.scrollWidth > element.clientWidth + 1) issues.push(`${element.className}: clipped content`)
          }
          for (const path of root.querySelectorAll("svg path")) if (/NaN|Infinity/.test(path.getAttribute("d"))) issues.push("invalid path")
          for (const rect of root.querySelectorAll("svg rect")) if (["width", "height"].some((key) => parseFloat(rect.getAttribute(key)) < 0)) issues.push("negative rectangle")
          return issues
        })
        expect(issues, `${slide}/${step} at ${viewport.width}×${viewport.height}`).toEqual([])
      }
      if (viewport.width === 1600) await page.screenshot({ path: testInfo.outputPath(`slide-${slide}.png`) })
    }
  }
})

test("the only build artifact runs offline as a real file including charts and math", async ({ page, context }) => {
  expect(readdirSync(resolve("dist"))).toEqual(["index.html"])
  await context.setOffline(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`${pathToFileURL(resolve("dist/index.html")).href}#1/0`)
  await at(page, 1)
  await page.keyboard.press("ArrowRight")
  await at(page, 1, 1)
  await expect(page.getByTestId("clock")).toHaveText("4.00 s")
  await expect(page.locator(".katex-error")).toHaveCount(0)
  await page.keyboard.press("Shift+ArrowRight")
  await at(page, 2)
  await expect(page.locator(".recharts-line-curve")).toHaveCount(2)
  await page.keyboard.press("g")
  await page.reload()
  await expect(page.locator(".viewport")).toHaveAttribute("data-mode", "explore")
})

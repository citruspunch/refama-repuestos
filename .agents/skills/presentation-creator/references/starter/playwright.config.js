import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  use: {
    baseURL: "http://127.0.0.1:4186",
    viewport: { width: 1600, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm preview --host 127.0.0.1 --port 4186 --strictPort",
    url: "http://127.0.0.1:4186",
    reuseExistingServer: false,
  },
})

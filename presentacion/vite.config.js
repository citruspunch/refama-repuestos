import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteSingleFile } from "vite-plugin-singlefile"
import { loadEvidence, sourcePaths } from "./evidence-loader.js"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const fontLicenses = Object.fromEntries(["tiktok-sans", "montserrat"].map((name) => [
  name, readFileSync(require.resolve(`@fontsource-variable/${name}/LICENSE`), "utf8"),
]))

// Solo agrega tablas públicas. No expone el directorio privado al servidor web.
const evidencePlugin = {
  name: "rujaf-evidence",
  resolveId(id) {
    if (id === "virtual:rujaf-evidence") return "\0virtual:rujaf-evidence"
  },
  load(id) {
    if (id !== "\0virtual:rujaf-evidence") return
    sourcePaths.forEach((path) => this.addWatchFile(path))
    return `export default ${JSON.stringify(loadEvidence())}`
  },
  transformIndexHtml() {
    return [{
      tag: "script", attrs: { type: "application/json", id: "licencias-fuentes" },
      children: JSON.stringify(fontLicenses).replaceAll("<", "\\u003c"), injectTo: "head",
    }]
  },
}

export default defineConfig({
  plugins: [react(), evidencePlugin, viteSingleFile()],
  build: { assetsInlineLimit: Number.MAX_SAFE_INTEGER },
})

import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const starter = join(root, "references", "starter")
const generated = new Set(["node_modules", "dist", "test-results", "playwright-report", ".git", ".vite"])

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (generated.has(entry.name)) return []
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : entry.isFile() ? [path] : []
  })
}

function inside(base, path) {
  const local = relative(base, path)
  return local !== ".." && !local.startsWith(`..${sep}`) && !isAbsolute(local)
}

const sourceFiles = filesUnder(root)

test("optional visual guides are directly discoverable from a compact entrypoint", () => {
  const entry = readFileSync(join(root, "SKILL.md"), "utf8")
  assert.ok(entry.split("\n").length < 500, "Keep detailed recipes out of SKILL.md")
  const links = new Set([...entry.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]))
  for (const name of ["number-ticker", "highlighter", "animated-beam", "lens", "code-comparison", "blur-fade", "animated-list"]) {
    const path = `references/${name}.md`
    assert.ok(links.has(path), `${path}: must be linked directly, not through another guide`)
    const guide = readFileSync(join(root, path), "utf8")
    assert.ok(guide.trim().length > 0, `${path}: empty guide`)
    assert.ok(guide.split("\n").length < 200, `${path}: keep optional guides focused`)
  }
})

test("all local Markdown references resolve inside the skill package", () => {
  let links = 0
  for (const file of sourceFiles.filter((path) => extname(path) === ".md")) {
    const text = readFileSync(file, "utf8")
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1]
      if (/^(?:[a-z][\w+.-]*:|#)/i.test(href)) continue
      const path = resolve(dirname(file), decodeURIComponent(href.split(/[?#]/)[0]))
      assert.ok(inside(root, path), `${relative(root, file)}: link leaves the skill: ${href}`)
      assert.ok(existsSync(path), `${relative(root, file)}: missing bundled resource: ${href}`)
      links++
    }
  }
  assert.ok(links > 0, "The entrypoint must link to its bundled references")
})

test("starter-relative imports resolve without the host repository", () => {
  let imports = 0
  for (const file of filesUnder(starter).filter((path) => [".js", ".jsx", ".mjs"].includes(extname(path)))) {
    const text = readFileSync(file, "utf8")
    for (const match of text.matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']/g)) {
      const specifier = match[1] || match[2]
      if (!specifier.startsWith(".")) continue
      const path = resolve(dirname(file), specifier)
      assert.ok(inside(starter, path), `${relative(starter, file)}: import leaves starter: ${specifier}`)
      const candidates = [path, ...[".js", ".jsx", ".json", ".css"].map((extension) => path + extension), join(path, "index.js")]
      assert.ok(candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile()), `${relative(starter, file)}: unresolved import: ${specifier}`)
      imports++
    }
  }
  assert.ok(imports > 0, "Expected actual bundled source imports")
})

test("starter entrypoints and dependencies are standalone", () => {
  const html = readFileSync(join(starter, "index.html"), "utf8")
  const entries = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)]
  assert.ok(entries.length > 0)
  for (const [, src] of entries) {
    assert.ok(!/^[a-z][\w+.-]*:/i.test(src), `Script must be bundled locally: ${src}`)
    const path = resolve(starter, src.startsWith("/") ? `.${src}` : src)
    assert.ok(inside(starter, path) && existsSync(path), `Missing local entrypoint: ${src}`)
  }
  const pkg = JSON.parse(readFileSync(join(starter, "package.json"), "utf8"))
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    assert.ok(!/^(?:file:|link:|workspace:|\.\.?\/|\/)/.test(version), `${name}: dependency requires an external local project`)
  }
})

test("source and configuration have no machine-specific home paths", () => {
  for (const file of sourceFiles.filter((path) => [".md", ".js", ".jsx", ".mjs", ".css", ".html", ".json"].includes(extname(path)))) {
    const text = readFileSync(file, "utf8")
    assert.doesNotMatch(text, /\/(?:Users|home)\/[\w.-]+\/|[A-Za-z]:[\\/]Users[\\/][\w.-]+[\\/]/, relative(root, file))
  }
})

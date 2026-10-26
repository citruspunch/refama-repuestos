# Validation and delivery

Behavior and technical claims are testable requirements. A successful Vite build does not prove readability or correctness.

## Workflow

Discover the target presentation and read its scripts, lockfile, tests, instructions, and sources when available. Preserve user edits and reuse existing commands. Do not assume a particular directory name, domain specification, or speaker-notes file exists.

Scaffold only source/configuration from `starter/`, excluding generated directories. Rename package/document, set the HTML language, replace the analytical example with actual story/evidence, and update tests.

The starter supplies:

```sh
pnpm install
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Node's test runner checks pure logic; Playwright checks the production preview and the actual offline `file://` artifact. Commit a new deck's generated lockfile and use `pnpm install --frozen-lockfile` in CI. Do not regenerate an existing lockfile casually during wording/layout edits.

An existing presentation may use a different test/dev-server workflow; do not replace it just to match the starter. Optional phone features require the supported mobile browser engines and a real-device rehearsal; include WebKit when supporting iOS.

## Pure unit checks

- Story/registry identity and order; complete cue keys/types; nonempty metadata; contiguous appendix.
- Entire forward/backward route; clamping, skipping, Explore semantics, final-main boundary.
- URL round trips and malformed/huge/negative/noninteger state; legacy links where supported.
- Progress increases with main cues and reaches/stays at one before appendix.
- All domain scenarios: finite reproducible results, legal parameters, correct units/signs/equilibria, and justified numerical tolerances.
- Displayed metric/table/threshold values agree with model/data. Unknown/unstable results stay explicitly undefined.

## Browser checks

1. Walk every main cue with PageDown, retrace with PageUp, verify heading/state and no timer-driven progression.
2. Deep-link, refresh, change hash, skip, Home/End, open appendix, return to exact saved cue.
3. Present controls are disabled with scripted values. Explore starts there, accepts edits, retains inputs on replay. Present restores the cue.
4. Live motion starts, pauses without time/geometry changing, resumes, replays, and holds its endpoint. Rapid navigation leaves no stale animations.
5. Reduced motion remains meaningful: no invisible entrances or continuous decoration.
6. Check clicker keys, repeats, slider/editing behavior, Space on focused buttons, modal blocking/focus restoration, fullscreen after Esc.
7. Collect `pageerror`; reject missing icons, KaTeX errors, NaN/Infinity in text/paths, invalid SVG rects, missing arrowheads, clipped formulas.
8. Count build outputs. Open actual HTML offline via `file://` and traverse SVG, Recharts, math, and controls. A served preview does not prove standalone portability.

## Layout inspection

At **1600×900**, **1280×720**, and **1024×768**, inspect every cue, not only initial states. Wait for `document.fonts.ready`. Use reduced motion for stable geometry assertions, then inspect representative normal transitions.

- Compare content rectangles with stage boundaries, cue rail, and viewport-fixed toolbar.
- Check scroll dimensions where overflow is not intentional; inspect text ranges for long poles/math.
- Charts have positive actual dimensions; no essential content is merely clipped with `overflow: hidden`.
- Check label-label/node/wire collisions, arrowhead endpoints, and particle paths.
- Capture and **visually inspect** dense slides: geometry tests cannot judge hierarchy, contrast, or misleading scales.
- Phones need separate narrow portrait/landscape, safe areas, expanded notes, and fixed reachable action-region checks.

## Single-file portability

`vite-plugin-singlefile` inlines recognized bundled JS/CSS, not arbitrary runtime network calls, `public/` files, external stylesheets, or remote fonts.

- Import data at build time; inline SVG in JSX; import assets through the bundler and inspect output. Essential content must not require runtime fetch.
- Bundle icons and KaTeX CSS/fonts; retain accessible MathML.
- The starter uses optional Google Fonts links: offline uses fallbacks, **not pixel-identical typography**. For exact fidelity, bundle licensed local font files and recheck file count/rendering.
- A phone remote requires the local server/network; standalone must still work and hide unavailable pairing controls.
- Private notes must not be embedded into the audience artifact by default; serve them only through the authenticated optional remote.

## Reporting

State what changed and which checks actually passed. Separate technical corrections from wording/design edits. Report unsupported claims, unavailable browser/device checks, and external dependencies. Do not claim visual review, offline success, or a full-suite pass when only a build/subset ran.

## Skill-package portability checks

From the directory containing `SKILL.md`, run `node --test tests/portability.test.mjs`. These dependency-free checks verify that local reference links stay inside the skill, starter-relative imports resolve inside the starter, and source/config files contain no machine-specific absolute home paths. Generated directories are excluded. Keep the whole skill directory together when reusing it elsewhere; it must not depend on files in its original host repository.

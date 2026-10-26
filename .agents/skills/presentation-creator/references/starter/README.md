# Interactive presentation starter

A self-contained presentation application: scaled 1600×900 stage, deterministic cues, Present/Explore, finite pauseable demonstrations, SVG and Recharts, KaTeX, bundled Reicon icons, and a single HTML build. It works in a new project without any source repository, external reference presentation, server, or remote.

## Run and check

Requires Node 22+ and pnpm. Dependencies are the template's tested baseline, not requirements for another project. Recharts uses major 3 and `react-is` must match React. Do not automatically migrate an existing deck's dependencies when revising its content.

```sh
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Commit the generated `pnpm-lock.yaml` in a new presentation; CI uses frozen-lockfile installs. Use `--ignore-workspace` only if intentionally independent of a parent workspace. esbuild is explicitly allowlisted for its installation script.

The browser suite serves the production preview on port 4186 (strict, no reuse), and separately opens `dist/index.html` offline. Browser installation may require network access.

## Adapt, do not ship the example as your results

1. Copy only source/config/docs into a new deck, not generated directories.
2. Change package name, HTML title/language, `STORY` in `src/presentation.js`, components/registry in `src/slides.jsx`, and evidence inventory in `DATA.md` together.
3. Add domain calculations to `model.js`, generated data separately, and test all displayed claims. Complete every cue's absolute scripted values; `assembleSlides` validates registry/story alignment.
4. Reuse `Head`, `Rise`, `Facts`, `Big`, `Slider`, `M`, and `Tex`. Explicitly import added icons in `ui.jsx`. No icon-font CDN is needed.
5. Keep only modules/dependencies that the actual topic needs. A qualitative deck can remove example models, charts, Recharts, or KaTeX if unused.
6. Update unit/browser expectations and inspect all cues at projector/laptop sizes before delivery.

`DATA.md` declares the analytical unit-step example. Its values are derived from an explicit equation; they are **not measured data or results for the user's project**. The example is removable and does not prescribe a topic, audience, or language. No private speaker notes or phone remote are included. Add those optional features only when requested.

## Controls

→ / Space / PageDown: next cue. ← / PageUp: previous cue. Shift+arrows: skip slides. Home/End: start/main conclusion. R: replay. P: pause. G: Present/Explore. F: fullscreen. A: appendix/return. ? or H: help. In Explore, controls unlock and End reaches the final slide. Normal guided Next stops before appendix.

The URL saves zero-based `#slide/step` and `?mode=explore`. Present runs once and holds; Explore replay retains chosen parameter values. Reduced motion presents stable final states.

## Delivery and fonts

Distribute `dist/index.html`. Code, icons, model data, math CSS/fonts, and controls are bundled. The optional Google Fonts stylesheet is external: offline rendering uses system fallbacks, **not guaranteed identical typography**. Bundle licensed local font assets and retest if exact offline appearance is required. No essential content should use runtime fetch or unbundled `public/` assets.

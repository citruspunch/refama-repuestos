---
name: presentation-creator
description: >-
  Create, revise, and test interactive presentations in any project. Use for presentations, slides, decks, data storytelling, guided demonstrations, and presentation UI/UX. Provides a self-contained React + Vite starter, validated slide/cue schemas, Present/Explore modes, accessible charts and diagrams, optional math, and single-file HTML delivery. Adapts to the target audience, domain, language, branding, and existing project instead of assuming a particular repository.
---

# Presentation Creator

Build a presentation as a small, testable application, not a collection of hidden pages. This is a **project-agnostic, self-contained skill**: its references, templates, and validation guidance travel together. No source repository, external example presentation, or project-specific dataset is required.

## Portability contract

- Resolve this skill's `references/` and template paths relative to the directory containing `SKILL.md`, not the target project's working directory.
- Discover the target presentation or use a destination chosen with the user. Do not assume a particular folder name, domain, author, institution, language, notes filename, or project structure.
- Read target-specific instructions and source material **when they exist**. Do not require files from another project or copy its content, numerical values, terminology, or branding.
- The visual system, stack, and stage size below are reusable defaults for new decks. Preserve an existing deck's architecture and identity; adapt defaults to explicit requirements without weakening evidence, accessibility, or validation.
- Charts, equations, simulations, private notes, and phone remotes are optional capabilities, not requirements. A qualitative or nontechnical presentation should not gain them just to resemble the starter.

## 1. Inspect before choosing a solution

- Read applicable `AGENTS.md`, the existing deck, package scripts, storyboard, model/data, speaker notes, and tests. Preserve user edits.
- **Existing presentation:** extend its architecture and visual identity. Do not replace it with the starter, migrate frameworks, or upgrade dependencies just to use this skill.
- **New presentation:** use `references/starter/`, excluding generated directories. It is a working foundation, not finished slide content.
- Establish audience, language, duration, evidence, narrative, and delivery constraints. Ask only for information that is missing and material; do not repeat questions the project already answers.
- Choose slide and cue counts around the explanation and rehearsal time, not a mandatory template count.

Read these references as needed:

| Reference | Use for |
| --- | --- |
| [Design system](references/design-system.md) | Stage, typography, composition, controls, accessibility |
| [Architecture and schemas](references/architecture.md) | Storyboard, slide registry, cue values, URL state, playback |
| [Charts and evidence](references/chart-patterns.md) | Scientific accuracy, data contracts, Recharts, live SVG |
| [Optional number ticker](references/number-ticker.md) | Count-up animation requested for a few headline metrics; selection rules, copyable component, playback and accessibility checks |
| [Optional highlighter](references/highlighter.md) | Underline, circle, or highlight a short phrase at its explanatory cue |
| [Optional animated beam](references/animated-beam.md) | Explain direction or sequence between diagram nodes with a finite connection animation |
| [Optional lens](references/lens.md) | Magnify a meaningful detail in an image or document; scripted in Present, interactive in Explore |
| [Optional code comparison](references/code-comparison.md) | Explain an actual before/after code change with readable, accessible differences |
| [Optional blur fade](references/blur-fade.md) | Introduce a selected visual block without duplicating existing entrance effects |
| [Optional animated list](references/animated-list.md) | Reveal narrative list items with the clicker in reading order; optional short cascade for one selected group |
| [Validation and delivery](references/validation.md) | Unit/browser checks, offline verification, build workflow |
| [Optional presenter remote](references/presenter-remote.md) | Private notes, local server, phone controls, connection safety |

## 2. Use the bundled stack, selectively

The bundled starter uses JavaScript ES modules, React 18, Vite 6 with `@vitejs/plugin-react`, `vite-plugin-singlefile`, Recharts 3, `framer-motion`, KaTeX, and `reicon-react`. These are **tested template versions, not claims about the latest releases or requirements for an existing project**. Inspect the target lockfile and verify library-specific APIs against current documentation before changing them. Do not force a TypeScript, Tailwind, routing-framework, or chart-library migration.

The starter matches React and `react-is` versions and tests chart-keyboard isolation. Evaluate dependency upgrades separately from content edits; do not treat a template's package versions as permission to migrate the user's application.

- **Recharts:** conventional comparisons, time series, distributions, and tooltips backed by actual evidence.
- **Inline SVG:** annotated diagrams, networks, spatial relationships, and progressively revealed traces synchronized with a scene clock. Prefer established chart primitives unless custom geometry or playback justifies SVG.
- **Motion:** slide transitions and finite, interruption-safe parameter/geometry transitions. The starter uses `framer-motion`; preserve the target's installed animation package rather than mixing equivalent packages gratuitously.
- **KaTeX:** inline `M` and display `Tex` helpers; load its stylesheet through the bundle. Preserve accessible math and use `trust: false` by default.
- **Reicon:** explicitly imported, bundled React SVG components behind an `Icon` map. No Phosphor CDN, icon font, or runtime icon download. Check actual package exports and fail visibly for unknown names.
- **Optional remote only:** Express + `ws` + `qrcode`, with `react-markdown` for private notes. Do not add a server or network requirement to an ordinary standalone deck.

Remove unused example charts and their dependencies when the actual talk does not need them. Use pnpm consistently, and retain/commit the target deck's `pnpm-lock.yaml`.

## 3. Design the story and schemas together

The shell consumes records, not anonymous slide functions:

```jsx
// presentation.js: serializable narrative, with no React imports
export const STORY = [
  { id: "response", title: "Step response", cues: [
    { label: "Define the input", values: { run: false, gain: 1 } },
    { label: "Apply the command", values: { run: true, gain: 1 } },
  ] },
]

// slides.jsx (or slidesA.jsx / slidesB.jsx): component registry
export const SLIDES = [{ id: "response", C: Response, ch: "02 · Response" }]
```

- Unique stable IDs join registry entries to storyboard entries. Validate a one-to-one, ordered match; never silently drop missing metadata.
- Every slide has a nonempty title and at least one cue. Every cue has a label and explicit values for **all** scripted fields on that slide. Set absolute values, never toggle from prior state.
- Keep narrative metadata, position/navigation, UI, model, and stored data separate. Add files as complexity warrants rather than creating a monolithic `App.jsx`.
- Keep only the current slide mounted. Key slide mounts and scene resets deliberately so background simulations do not run and replay does not discard unrelated Explore inputs.
- Position is `{ slide, step, mode }`. Normalize external input, persist `#<zero-based-slide>/<zero-based-step>` and `?mode=explore`, and preserve unrelated query parameters. Support old `#<slide>` links when revising an existing deck.
- Put supporting slides after the main conclusion with `appendix: true`; normal guided Next ends at the main conclusion. Appendix access must return to the exact saved slide/cue.

## 4. Make a live talk operable without a mouse

**Present is the default:** one Next press selects one deliberate cue. Scripted values drive widgets, local controls are disabled without being visually washed out, and finite demonstrations run once and hold their last frame. Timers must not select the next cue or scenario.

**Explore is explicit:** controls become editable and start from the scenario just shown. Returning to Present restores the current cue's exact values. Loops are allowed only when useful, not required.

Use the same navigation functions for toolbar, keyboard, clicker, and optional remote:

| Key | Action |
| --- | --- |
| → / Space / PageDown | Next cue; next slide when cues finish |
| ← / PageUp | Previous cue; previous slide's final cue |
| Shift + → / ← | Skip a slide |
| Home / End | Start / final main cue (final slide in Explore) |
| R / P / G | Replay / pause-resume / Present-Explore |
| F | Fullscreen, synchronized with `fullscreenchange` and Esc |
| A | Appendix / return to saved talk position |
| ? / H | Modal shortcut help |

Do not intercept text editing, slider adjustment keys, modal input, modified browser shortcuts, or held-key repeats. Avoid a Space keydown plus native button click advancing twice. Restore focus after dialogs; keep idle navigation discoverable by keyboard and touch.

Playback must coordinate requestAnimationFrame, Motion, CSS, and any SVG animations. Pause means freeze in place, not restart or skip to the end. Resume from that point; replay resets the intended scene. Clean up all animation handles/listeners. Reduced motion selects a meaningful stable state and suppresses decorative movement without disabling navigation.

## 5. Compose slides for explanation, not decoration

Use the fixed **1600×900** stage and scale by `min(viewportWidth/1600, viewportHeight/900)`. This preserves diagram geometry on laptops and 4:3 projectors. Stage content uses stage pixels, not viewport-relative font sizing. Phone remotes use their own responsive layout, never a miniaturized stage.

- Default typography: TikTok Sans for headings/body/large figures, Montserrat for labels/readouts (`--mono` is a historical variable name, not an actual monospace font), and KaTeX when math is needed. Adapt to the target's branding and language coverage.
- Default palette: paper `#faf9fb`, ink `#1c1028`, line `#dbd6e1`, purple `#6c5fc7`. Assign series/category identities for the actual topic; keep them and semantic colors consistent throughout the presentation.
- Generous whitespace, informative titles, one main concept per slide, a visual hierarchy of heading → diagram/chart → short interpretation.
- Prefer `.split`, `.stack`, open `.bignums`, icon-led `.facts`, and meaningful diagrams. Use `.panel`, `.scene`, `.chart-card`, small readouts, segmented controls, and status chips **when they group actual information or interaction**. They are not universally prohibited.
- Content slides should not accumulate decorative eyebrow pills or redundant subtitles. A quiet chapter HUD, a cover kicker/summary, panel labels, legends, and technical annotations are purposeful and allowed.
- No unrelated logos, watermarks, dashboard-like stat grids, invented metrics, or icons added just to fill space. Do not require headline numbers on every slide or on a cover without relevant evidence.
- Count-up is optional, never a default for every number. When requested or justified by a headline metric, read the number-ticker reference above; keep tables, chart labels, and supporting figures static.
- The optional visual references above are alternatives, not a checklist. Read only those relevant to the requested explanation. Keep them out of the default starter, reuse the installed stack, and adapt upstream examples to cue-driven playback, reduced motion, accessibility, and offline delivery before shipping.
- Avoid repetitive `.src` footers by default. Preserve traceability in data/model files, notes, or an appendix; follow the target's citation conventions and show on-slide attribution when requested or required.

## 6. Protect content and evidence

- Use clear, natural language in the requested language and register. Prefer descriptive titles and sentences the presenter can comfortably say aloud. Simplify wording, not the underlying meaning.
- Choose a narrative for the subject: context → question → evidence → interpretation → decision/next steps, for example. Technical talks may need assumptions/equations; proposals may need alternatives; teaching may need worked examples. Do not force every topic into one domain's outline.
- Explain what an equation or graph means, not just what its symbols say. Make causal claims only when the evidence supports them.
- Charts may use **sourced measurements**, **reproducible simulations**, or **declared analytical relationships**. Never invent observations, trends, causal explanations, or results to complete a layout.
- A labeled illustrative animation is not a measurement or a model prediction. Declare magnified angles, changed scales, normalized values, and assumptions near the visual.
- Define units, input amplitude, parameters, initial conditions, time horizon, and normalization. Compute related plots, readouts, and conclusions from the same source. Round only for display.
- Keep numerical methods and metrics pure and tested. Unknown, unstable, missing, or not-yet-settled results are not zero. Do not report a truncated last sample as an equilibrium.
- Preserve correct claims, equations, source data, terminology, and notation unless a requested correction is justified. The target's instructions, authoritative sources, and domain conventions take precedence over a template's illustrative content.

## 7. Implement, rehearse, and deliver

For a new deck, adapt the starter's content, document title/language, story, registry, evidence inventory, and tests. Its first-order analytical example is explicitly a teaching example, not user/project data. Do not ship it as evidence for another topic.

From the deck directory:

```sh
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Use `--ignore-workspace` only for an intentionally independent nested deck. `--ignore-scripts` is an optional restricted-install choice, not a guarantee that every tool works without its setup scripts. Inspect failures and the pnpm build-script allowlist instead of blindly disabling safeguards. Use frozen-lockfile installs in CI once a lockfile exists.

Before completion:

- [ ] Story/registry IDs, cue schemas, appendix boundary, and URL normalization are validated.
- [ ] Every main cue can be traversed forward/backward with a clicker; refresh, skip, replay, pause, Explore, and appendix return work.
- [ ] All cues fit at 1600×900, 1280×720, and 1024×768; no content collides with cue rail, navigation, or adjacent labels.
- [ ] Normal and reduced motion work; browser has no runtime errors, invalid SVG geometry, missing icons, or KaTeX errors.
- [ ] Units, scales, equations, charts, readouts, and stated conclusions agree with their evidence.
- [ ] `dist/index.html` is the only build artifact; the file opens via `file://` offline with bundled code, data, math, and icons. Verify rather than assume inlining.
- [ ] External font links are disclosed: fallback fonts are usable offline; embed licensed font assets if exact offline typography is required.
- [ ] Required tests/build pass. Report exactly which checks ran and any unavailable browser/device checks.
- [ ] No content, path, dataset, branding, or assumed prerequisite from an unrelated project remains.

Return the edited artifact, a concise change summary, and any remaining evidence or validation limitations. For existing decks, do not provide only suggestions when the user asked for edits.

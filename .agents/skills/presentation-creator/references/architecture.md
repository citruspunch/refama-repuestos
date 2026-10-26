# Architecture and schema contracts

The self-contained implementation is in the bundled starter: [navigation and schemas](starter/src/presentation.js), [application shell](starter/src/App.jsx), [playback context](starter/src/PresentationContext.jsx), and [UI helpers](starter/src/ui.jsx). Adapt these boundaries to the target project; none requires an external repository or example presentation.

## Module boundaries

```text
src/
  main.jsx                 # React root, bundled CSS and KaTeX CSS
  App.jsx                  # Stage, current slide, toolbar, URL, keyboard, dialogs
  presentation.js          # STORY, schema invariants, pure navigation helpers
  PresentationContext.jsx  # Playback context, useCueState, finite useClock
  slides.jsx               # Components + { id, C, ch } registry; split as it grows
  ui.jsx                   # Icon, Head, Rise, Facts, Big, Slider, M/Tex
  model.js                 # Pure domain functions, units, assumptions
  Charts.jsx               # Standard charts, no navigation state machine
  Live.jsx                 # SVG playback when a standard chart is insufficient
  App.css                  # Shared stage, typography, component tokens
  data.json                # Optional generated/source data; never invented filler
  remote/                  # Optional phone client/protocol, not a core dependency
tests/                     # Pure *.test.js and browser *.spec.js
```

Do not introduce every module for a tiny static deck. Do not put a large deck's navigation, solver, data, diagrams, and slides into one file either. Existing JavaScript is a baseline, not a request for a type-system migration.

## Storyboard contract

Conceptual types; no TypeScript/schema library is required:

```ts
type CueValue = string | number | boolean
type Cue = { label: string; values: Record<string, CueValue> }
type Scene = { id: string; title: string; appendix?: boolean; cues: Cue[] }
type SlideDefinition = { id: string; C: React.ComponentType; ch: string }
type Position = { slide: number; step: number; mode: "present" | "explore" }
```

The starter's cues use scalars. Extend validation deliberately if a deck needs JSON-safe structured values; never permit functions, JSX, NaN, or undefined in narrative data.

Required invariants:

1. Nonempty story; stable unique nonempty IDs, preferably kebab-case.
2. Nonempty titles/labels; at least one cue per scene.
3. Absolute finite/serializable cue values, with the same complete set of keys/types throughout each scene. Every comparison cue specifies both `scenario` and `highlight`, for example, even when only one changes.
4. Registry/story IDs match exactly in intended order. Missing narrative/component is an error, not an empty slide.
5. Main talk precedes a contiguous optional appendix, with at least one main scene.
6. Domain constraints are tested too: allowed scenario names, valid selection indices, sensible ranges, and correct units where applicable. Key validation alone does not establish correctness.

The starter validates generic invariants in `validateStory`/`assembleSlides` and domain scenarios in model tests. Adapt these checks to an existing deck's registry rather than imposing a different format.

`C`/`ch` stay in the registry; title/cues/appendix state stay in `STORY`. Avoid unused design fields and duplicate navigation title arrays. Merged records drive dots, counters, labels, and optional remote previews.

## Position and navigation

- `normalizePosition`: bound slide/step integers, default mode to Present, safely normalize malformed external state.
- `positionFromLocation`: read `#slide/step` and `?mode=explore`; accept old `#slide` as step zero. Preserve project-specific legacy query links only where the target already supports them.
- `positionHash`: zero-based URL indices. UI counters/speaker-note numbers may be one-based; do not mix those into URLs.
- `movePosition`: pure bounded transitions, shared by all input methods.
- `presentationProgress`: main-talk cue fraction in Present, slide fraction in Explore; appendix never expands the denominator.

| Situation | Next / Previous |
| --- | --- |
| Present, same-slide cue available | Adjacent cue |
| Present, end/start of slide | Next slide cue zero / previous slide final cue |
| Present, final main cue | Next is a no-op, not an implicit appendix jump |
| Explore or Shift+arrow | Adjacent slide at cue zero |
| First/final allowed position | Clamp without wrapping |

`Home` goes to the beginning. `End` goes to the last main cue in Present, final slide in Explore. `A` saves the exact `{ slide, step }`, opens appendix, and restores that position on return. Explicit appendix links remain valid.

Use `history.replaceState` so each cue does not add a history entry. Listen to `hashchange`/`popstate`; preserve unrelated query parameters. Support `file://…/index.html#slide/step` without a server router.

## Context and reset boundaries

```js
{
  guided,             // mode === "present"
  paused,
  reducedMotion,
  cue, previousCue,   // selected scene cue; prior cue for an optional entrance
  clockKey,          // slide/mode/replay/explicit-scene-reset identity
  step,
}
```

`useCueState(name, initial)` yields scripted values with a no-op setter in Present, editable local state in Explore. Entering Explore starts from the displayed scenario; returning to Present restores the cue. Test these transitions with focus still on a slider.

- Mount only the current slide, keyed by identity. Hidden opacity-zero slides still run timers/effects.
- Scene revision lets an explicit jump to the same slide reset it. A replay token resets clocks even when position does not change.
- Present replay may remount to reproduce an entrance. Explore replay resets animation **without losing selected input values**.
- A continuous phase demo may use `resetOnStep: false` while resetting on slide/replay. Document exceptions rather than resetting every clock blindly.

## Playback lifecycle

One clock coordinates a demonstration. Retain elapsed time in a ref; cap frame deltas to avoid jumps after backgrounding. Pause resets the last timestamp, not elapsed time. Cancel rAF on pause/reset/dependency change/unmount.

- Present: positive finite duration, clamp and hold. Without a duration, prefer static content unless continuous motion is essential.
- Explore: optional loop, bounded interaction, or replay; no timer-driven scenario changes.
- Reduced motion: time zero for a not-yet-run cue; meaningful final time for a running finite cue. Never navigate automatically.
- Motion: retain current value and returned controls; `pause()`/`play()` for playback, `stop()` on replacement/unmount. Do not restart finished animations on every pause toggle.
- CSS: scope `animation-play-state: paused` to content; reduced-motion rules settle entrances rather than leave opacity zero.
- SVG SMIL: pause/unpause when present; omit decorative animated nodes for reduced motion.
- Recharts: disable autonomous animation for clock-owned traces; global pause is incomplete if another animation still runs.

Preserve useful specialized behavior in an existing presentation, but do not copy unsafe `trust: true` settings, hidden MathML, constant background rAF work, or unused metadata into a new one.

## Application accessibility

Shortcuts ignore prevented events, browser modifiers, repeats, editing fields, native activations, and open dialogs. Consume a handled event once. Range inputs retain Arrow/Home/End/Page/Space behavior; R/P/G may remain available where appropriate. Space on a focused nav button must not double-advance. Recharts 3's focused `role="application"` chart also keeps its own arrow-key point navigation.

Expose `data-slide`, `data-step`, `data-mode` for tests. Announce position changes politely, not animation-frame values. Native dialogs need headings, close actions, and focus restoration. Fullscreen state follows browser events, not just a local boolean toggle.

# Optional number ticker

Read this reference when the user requests count-up, a number ticker, or an animated headline metric. It provides a finite, decelerating count-up similar to [Magic UI's Number Ticker](https://magicui.design/docs/components/number-ticker). It is optional; do not add it to every deck or enable it on a shared metric component by default.

## Choose the figures first

- Select figures by narrative importance and visual hierarchy, not magnitude alone. A large total, a central result, or a short group of cover statistics can qualify.
- Prefer one animated figure on a selected slide. Two or three related cover statistics can share a single entrance. Keep the effect on a minority of slides; do not impose a fixed quota on every deck.
- Leave tables, chart axes and labels, dates, identifiers, equations, footnotes, comparison grids, and supporting figures static. Do not stagger every number in a dense slide.
- Keep zero, negative, missing, and non-finite values static in this pattern. Never turn missing data into an animated zero. Do not animate live model outputs that need to agree with a chart at every frame.
- Intermediate counts are an entrance effect, not observations, progress, a simulation, or a change in the source data. Keep the real final value in the data/model and in the accessible label.

## Integrate with playback

Reuse the target's existing animation engine or finite scene clock. Do not install Magic UI, Tailwind, or another animation package solely for this effect. If using Magic UI's component directly, verify its current API and adapt its lifecycle; a viewport-triggered spring alone does not implement presentation pause or replay.

For the bundled starter, the implementation below uses its existing `useClock` and `usePresentation` hooks. Copy the component into the destination deck's `src/NumberTicker.jsx` only when needed. In another architecture, adapt those imports to the target's playback contract rather than importing from the skill or its original host project.

The clock must retain elapsed time during pause, resume from there, cancel its frame on unmount, and hold its finite endpoint. Replay resets the animation in both Present and Explore without clearing Explore inputs. Count once on slide entry, not on every cue or context render. Reset when the underlying value or its formatting changes.

### Component

This version uses a 140 ms entrance delay, followed by 1.1 seconds of deceleration without overshoot. The starter's clock uses seconds. `resetOnStep: false` prevents ordinary cue changes from restarting the count; `clockKey` still handles explicit scene resets and replay.

```jsx
import React, { useMemo } from "react"
import { useClock, usePresentation } from "./PresentationContext.jsx"

const DELAY = 0.14
const DURATION = 1.1

export function NumberTicker({ value, locale = "en-US", decimalPlaces = 0, missingLabel = "No data" }) {
  const { reducedMotion } = usePresentation()
  const formatter = useMemo(() => new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }), [locale, decimalPlaces])
  const finite = Number.isFinite(value)
  const animate = finite && value > 0
  const finalValue = finite ? formatter.format(value) : missingLabel
  const time = useClock({
    duration: DELAY + DURATION,
    running: animate,
    resetOnStep: false,
    resetKey: JSON.stringify([value, locale, decimalPlaces]),
  })
  const progress = reducedMotion ? 1 : Math.min(1, Math.max(0, (time - DELAY) / DURATION))
  const displayed = !animate || progress === 1
    ? finalValue
    : formatter.format(value * (1 - (1 - progress) ** 4))

  return <span className="number-ticker" role="img" aria-label={finalValue} data-value={finalValue}>
    <span aria-hidden="true">{displayed}</span>
  </span>
}
```

Pass the deck's locale and metric precision explicitly. If the project has a number-formatting utility, share its formatter/options so animated and static values have identical endpoints. Do not parse formatted strings to recover numeric input. Keep units, currency markers, signs, and qualifiers outside the animated digits unless the shared formatter owns them.

Reduced motion selects the final value synchronously, including when activated mid-count or while paused. The accessible name is always the final value; only the changing visual digits are hidden from assistive technology. Do not add an `aria-live` region that announces every animation frame.

### Stable width and inherited typography

Add these rules to the destination stylesheet. The hidden pseudo-element reserves the final formatted width while the visible number occupies the same grid cell. It adds no duplicate text node to assertions or copy operations.

```css
.number-ticker {
  display: inline-grid;
  vertical-align: baseline;
  font: inherit;
  letter-spacing: inherit;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.number-ticker::before {
  content: attr(data-value);
  visibility: hidden;
  grid-area: 1 / 1;
}
.number-ticker > span {
  grid-area: 1 / 1;
  font: inherit;
}
```

Inspect existing descendant selectors. A rule such as `.metric span` can shrink the ticker inside a large figure; scope a label rule to `.metric > span` when that matches the target markup. Do not change unrelated typography. Check the actual font after it loads: tabular digits stabilize digit widths, but do not assume punctuation has a digit's width.

### Opt-in usage

The starter's `Big` helper accepts children, so it needs no global behavior change:

```jsx
<Big cap={metric.label}>
  <NumberTicker value={metric.value} locale={deckLocale} decimalPlaces={metric.decimals} missingLabel={noDataLabel} />
  <small>{metric.unit}</small>
</Big>
```

`metric`, `deckLocale`, and `noDataLabel` come from the target presentation. Keep adjacent units and qualifications accessible, and preserve the original sourced value. For an existing metric helper, an explicit `animate` prop can opt in at selected call sites; default it to `false`.

## Validate the selected slides

- With normal motion, observe an intermediate count, then the exact final formatted value. It must stay there without looping, overshooting, or advancing the story.
- Pause during the delay and during the count. Both must freeze; resume must continue, not restart or jump to the endpoint.
- Replay in Present and Explore. It must repeat the count without changing the cue or discarding unrelated inputs. Moving to the next ordinary cue must not replay an unchanged metric.
- Load with reduced motion, then enable it mid-count and while paused. The final value must appear immediately. Turning reduced motion off must not start a completed entrance again.
- Check decimal precision, grouping, the deck's locale, and static zero/negative/missing values. Test a changed target value if the slide supports it.
- Assert the accessible name equals the final value even during counting. Confirm changing digits have `aria-hidden="true"`; retain a readable metric label and units.
- Compare width and surrounding layout at the start, mid-count, and endpoint after `document.fonts.ready`. Check that the figure inherits its intended font size at all supported stage scales.
- Traverse away during the count; there must be no background frame loop or stale update. Verify the selected count-up still works in the built offline HTML.
- Review the complete slide list. Only the deliberately selected figures should contain `.number-ticker`; all supporting figures remain static.

## Why this is a separate reference

The [Agent Skills specification](https://agentskills.io/specification) recommends progressive disclosure: metadata is advertised first, `SKILL.md` loads on activation, and supporting resources load only as needed. This guide is linked directly from `SKILL.md`; its code is not part of the default starter or the skill description. Keep it self-contained when copying the whole skill to another project.

# Optional blur fade

Read this when a selected image or visual block needs a short entrance. [Magic UI Blur Fade](https://magicui.design/docs/components/blur-fade) combines opacity, a small displacement, and blur. If the deck's existing fade/rise entrance already does the job, keep it instead.

## When to use it

- Introduce a main image or illustration on slide entry or at its explanatory cue. Keep the effect brief and the final visual sharp.
- Avoid blurring tables, equations, dense code, chart labels, or important numerical readouts. These need to be readable as soon as they are shown.
- Do not apply it to every word, every row, or a whole slide already receiving another entrance. Avoid long cascades that make the audience wait for the information.

## Upstream starting point

```jsx
<BlurFade duration={0.4} delay={0} offset={4} blur="3px">
  {visualBlock}
</BlurFade>
```

This is upstream usage, not a full presentation playback adapter. The component uses `motion/react`, starts on mount or viewport entry, and can animate opacity, transform, and filter independently. Verify the current API before copying it; preserve the destination's installed animation package and do not add an equivalent one solely for this effect.

## Clock-owned alternative for the bundled starter

For a single visual entrance, the starter's existing finite clock can own all animated properties. Copy this into the destination deck only if it is selected for use. `resetOnStep: false` plays once on mount or explicit replay; a separately mounted cue-owned block starts when that cue reveals it.

```jsx
import React from "react"
import { useClock, usePresentation } from "./PresentationContext.jsx"

export function VisualEntrance({ children }) {
  const { reducedMotion } = usePresentation()
  const time = useClock({ duration: 0.4, resetOnStep: false })
  const progress = reducedMotion ? 1 : Math.min(1, Math.max(0, time / 0.4))
  const remaining = (1 - progress) ** 3

  return <div style={{
    opacity: 1 - remaining,
    transform: remaining ? `translateY(${4 * remaining}px)` : "none",
    filter: remaining ? `blur(${3 * remaining}px)` : "none",
  }}>
    {children}
  </div>
}
```

This is an adapted entrance pattern, not Magic UI's component or API. Do not add a CSS transition to these clock-owned styles: it would lag behind the clock and keep moving during pause. Preserve the target's existing layout wrapper rather than creating nested animations around the same element.

## Presentation integration

1. Use a mount/replay boundary for slide entrances and explicit cue state for content reveals. Do not retrigger on every context update or ordinary cue change.
2. Pause must freeze opacity, displacement, and blur together. Resume from those values and hold the final state with no repeat. If using upstream Motion directly, retain and coordinate all relevant controls; pausing CSS alone will not pause a Motion filter transition.
3. Replay in Present repeats the intended entrance. Explore replay preserves inputs and only restarts the entrance. Cancel replaced controls/frames on navigation.
4. Reduced motion immediately shows the selected visual at full opacity, zero displacement, and no filter, including when enabled during pause. Do not reveal future-cue content as a side effect.
5. Keep the finite endpoint complete. The snippet returns `filter: none` and `transform: none` at the endpoint so the wrapper does not retain unnecessary filter/transform effects.

## Accessibility and delivery

- Preserve image alternatives and semantic content. Opacity zero does not remove focusable content from the accessibility tree or keyboard navigation; do not hide interactive controls with this entrance alone.
- Keep annotations and focus rings sharp. Filtering a wrapper also filters its descendants and can change stacking/containing-block behavior.
- Scope the wrapper's styling so existing CSS entrance rules do not animate it a second time. Do not apply this filter to the entire scaled stage.
- Bundle all content and any selected animation code locally. The effect should not need a runtime request or a new global styling framework.

## Validate

- Observe an intermediate state and a fully sharp final state with no looping or automatic navigation.
- Pause mid-entrance and confirm that opacity, transform, and filter all freeze. Resume continuously and replay in both modes without losing inputs.
- Activate reduced motion during entry and during pause. The selected visual appears immediately and stays visible.
- Confirm no duplicate CSS/Motion entrance, cropped filter edges, new overlays, hidden focused controls, or remaining background frames after navigation.
- Inspect legibility and layout at 1600×900, 1280×720, and 1024×768. Verify the built offline HTML as well as the served preview.

## Source

[Upstream implementation](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/blur-fade.tsx). Recheck how filter and opacity transitions are scheduled before integrating upstream playback.

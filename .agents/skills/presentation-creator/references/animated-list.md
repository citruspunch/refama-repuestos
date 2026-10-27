# Optional animated list

Read this when findings, conditions, risks, or process steps should appear as the presenter explains them. Use [Magic UI Animated List](https://magicui.design/docs/components/animated-list) as a reference for item entrances, not as an automatic notification feed. This is optional; do not progressively hide every list in a deck.

## Choose the disclosure pattern

- **Cue-driven reveal:** each Next press reveals the next item or deliberately selected group. Use this when each point needs its own explanation. This is the default for this recipe.
- **Short entrance cascade:** a group selected by the current cue enters with a small stagger as one finite entrance. Use this when the items should be read together. The clock animates already selected content; it never changes the cue or selects additional narrative content.
- **Static list:** show all items together when simultaneous comparison matters. Keep tables, alternative options, and evidence grids visible as a whole unless the explanation specifically needs a reveal.

Retain source/reading order. Add items at their intended positions, never prepend and reverse prior points. Prefer a small list that fits the final slide. Do not stack long delays or use a spring bounce merely to imitate a notification demo.

## Upstream behavior to adapt

In the reviewed upstream implementation, a timer increments the visible item count, `delay` defaults to 1000 ms, and the visible slice is reversed so the newest item appears at the top. Item entrances use a Motion spring and layout animation. The finite list eventually stops, but its content reveal is still timer-driven and not coordinated with presentation pause or replay.

Do not copy that reveal timer into a guided presentation. Verify the current API/source before using it, remove automatic count progression and reversal, and reuse the destination's installed animation engine. Do not install a second Motion package or a styling framework just for a list.

## Cue contract

Define an absolute integer count such as `visibleItems` in every cue on the selected slide. Keep it between zero and the list length. For example:

```js
cues: [
  { label: "First finding", values: { visibleItems: 1 } },
  { label: "Second finding", values: { visibleItems: 2 } },
  { label: "All findings", values: { visibleItems: 3 } },
]
```

If the slide has other scripted fields, include them in every cue as well. Count zero is valid for an intentionally empty initial step; otherwise start with a visible item. Do not infer the count by incrementing local state on key events. Deep links and backward navigation must reconstruct the correct subset directly.

## Clock-owned pattern for the bundled starter

Copy this into the destination only when selected. It uses the starter's existing hooks, preserves row space, and adds no dependency. Items are narrative records with stable `id` and `content` fields. Adapt imports and playback boundaries for another architecture; do not import from the skill at runtime.

```jsx
import React from "react"
import { useClock, useCueState, usePresentation } from "./PresentationContext.jsx"

function ListItem({ item, visible, delay }) {
  const { reducedMotion } = usePresentation()
  const duration = 0.3
  const time = useClock({
    duration: delay + duration,
    running: visible,
    resetOnStep: false,
    resetKey: visible ? "shown" : "hidden",
  })
  const progress = reducedMotion ? 1 : Math.min(1, Math.max(0, (time - delay) / duration))
  const remaining = (1 - progress) ** 3

  return <li aria-hidden={visible ? undefined : true} style={{
    visibility: visible ? "visible" : "hidden",
    opacity: visible ? 1 - remaining : 0,
    transform: visible && remaining ? `translateY(${6 * remaining}px)` : "none",
  }}>
    {item.content}
  </li>
}

export function ProgressiveList({ items, cascade = false }) {
  const [visibleItems] = useCueState("visibleItems", 1)
  const count = Math.min(items.length, Math.max(0, Math.trunc(visibleItems)))

  return <ol className="progressive-list">
    {items.map((item, index) => <ListItem
      key={item.id}
      item={item}
      visible={index < count}
      delay={cascade ? Math.min(index, 3) * 0.06 : 0}
    />)}
  </ol>
}
```

This is a presentation-adapted recipe, not the upstream component/API. Ordinary cue changes reveal only the newly selected items; previously visible rows do not replay. Explicit replay resets entrances for the currently selected subset. The optional stagger is capped at 180 ms, so the whole entrance finishes within 480 ms. In cascade mode, select the entire intended group in the cue rather than increasing the count with a timer.

The example reserves the final list's row space with `visibility: hidden`; hidden narrative content is excluded from the accessibility tree. This keeps a vertically centered list from shifting whenever its visible subset grows. Preserve stable keys, consistent row spacing, and source order. Do not use `display: none` or mount-only rows without checking whether the containing layout will move earlier points.

These rows should contain narrative content, not forms or live widgets. If the target requires interactive descendants, explicitly prevent focus and interaction in unrevealed rows, handle focus before hiding them, and avoid keeping hidden simulations running. An opacity change or `aria-hidden` alone does not disable a control.

## Playback and accessibility

- Freeze all entrance properties and any stagger delay on pause. Resume from the same time. Do not add CSS transitions to clock-owned styles, because they would continue interpolating independently.
- Use `resetOnStep: false` for unchanged visible rows; reset on explicit replay or the item's hidden/shown transition. Returning to an earlier cue hides later items without changing the remaining order.
- In Explore, a reveal control is optional. Replay must preserve its chosen count and other inputs; returning to Present restores the cue's exact count.
- Reduced motion shows all items selected by the current cue immediately, with no stagger or displacement. It must not expose later-cue items. Support a preference change during a paused entrance.
- Retain semantic `ol`/`ul` and `li` markup, readable text, and useful labels. Do not announce every animation frame. The shell's cue announcement is usually sufficient.
- Keep existing styling, but disable any overlapping CSS/Motion entrance on these rows or their shared wrapper. Do not animate the same row twice.

## Validate

- Traverse forward and backward, deep-link into a later cue, and reload. The selected count and item order must be identical in each case.
- Wait without pressing Next. Cue-driven mode must not reveal another item, insert a notification, reverse the list, or advance the presentation.
- Confirm previously visible rows keep their positions and do not restart on an unrelated cue change. Check final-list fit as well as intermediate states.
- Pause during an entrance and during a cascade delay, resume continuously, and replay in both modes without changing the count or discarding inputs.
- Load with reduced motion and enable it while paused. Only the selected subset becomes fully visible, without waiting for the stagger.
- Verify unrevealed rows are not announced, clickable, or focusable. Check semantic reading order and no repeated status announcements.
- Test at 1600×900, 1280×720, and 1024×768 after fonts load. Check the actual offline HTML and rapid navigation for stale timers or frames.

## Source

[Upstream implementation](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/animated-list.tsx). Recheck its current reveal and layout behavior before adapting it.

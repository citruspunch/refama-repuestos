# Optional highlighter

Read this when a short phrase needs emphasis at a specific explanatory cue. Use the [Magic UI Text Highlighter](https://magicui.design/docs/components/highlighter) as a reference, not a default treatment for headings or body copy.

## When to use it

- Underline the central condition, circle a term under discussion, or highlight a short conclusion. Prefer one active annotation in the current explanation.
- Keep text readable before, during, and after the annotation. Do not highlight whole paragraphs or combine a moving highlight with several other effects on the same phrase.
- Reserve crossed-off and strike-through marks for content that is actually rejected. A visual annotation must not change the meaning of an equation or sourced statement.

## Upstream starting point

The component uses `rough-notation` for its geometry and `motion/react` for viewport detection. Its actions include `highlight`, `underline`, `circle`, `box`, and `bracket`. Verify the current API and the destination's installed versions before copying it.

```jsx
<Highlighter action="underline" color={annotationColor} animationDuration={500} iterations={1}>
  {keyPhrase}
</Highlighter>
```

This is upstream usage, not a presentation-ready playback adapter. `animationDuration` is in milliseconds; `iterations` controls repeated drawing strokes, not presentation replay. The current upstream component has no presentation `paused` or cue prop.

## Presentation integration

1. Store annotation visibility/type as absolute cue values. In the bundled starter, read them with `useCueState`. Earlier cues keep the original phrase visible without an annotation; backward navigation restores the correct unannotated state.
2. For simple underlines or highlights, reuse an existing CSS/SVG primitive and the deck's finite clock. Use `rough-notation` when hand-drawn geometry is needed, rather than implementing a general annotation engine.
3. Separate geometry from playback. Let the clock reveal the annotation in roughly half a second, freeze its current drawing progress on pause, and leave the completed annotation in place. A static annotation revealed at the cue is an acceptable lower-motion alternative.
4. Reset playback only on annotation activation, relevant cue changes, or explicit replay. Explore replay must not discard local controls. Do not call `show()` on every React render.
5. With reduced motion, show the completed annotation immediately for an active cue. Do not reveal annotations belonging to future cues.

The upstream implementation calls `show()` on mount and redraws on resize. It does not coordinate with the presentation clock. Wrapping it in a paused CSS container is not proof of pause support; inspect and control the generated animations or use a clock-owned rendering instead. If the chosen implementation cannot freeze safely, use the static cue-driven annotation rather than claim full playback support.

Wait for fonts and layout before measuring. Recompute geometry after line wrapping or stage resize without replaying the entrance. The fixed stage's CSS transform can make viewport measurements differ from local SVG coordinates; test at non-unit scale. Remove annotations and disconnect observers on replacement/unmount, including React development remounts.

## Accessibility and delivery

- Keep the actual text in the DOM. Annotation strokes are decorative and must not duplicate its accessible name or intercept pointer events.
- Preserve text contrast under the fill. Meaning must also appear in words; color or a circle alone is insufficient.
- Use the target's palette and typography. Translate surrounding labels, not source quotations.
- Bundle any chosen annotation dependency. Do not add a second Motion package or a CDN just for a highlighter.

## Validate

- Traverse forward and backward through activation; the phrase remains readable and annotation state matches the cue.
- Pause mid-draw, resume, and replay in both modes. Completed strokes stay static; no annotation is duplicated.
- Enable reduced motion before loading and during a paused drawing. Only the current cue's completed annotation appears.
- Resize and wait for fonts at 1600×900, 1280×720, and 1024×768. Check multiline phrases, scaled-stage alignment, and clipping near neighboring text.
- Verify the accessible phrase is unchanged, observers are cleaned up, and the built offline HTML renders the annotation without a network request.

## Source

[Upstream implementation](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/highlighter.tsx). Recheck it when implementing; upstream animation behavior can change.

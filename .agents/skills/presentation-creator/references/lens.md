# Optional lens

Read this when a detail in an image, scan, or screenshot needs magnification. [Magic UI Lens](https://magicui.design/docs/components/lens) provides a masked magnified copy of its content. It should support an explanation, not replace readable slide composition.

## When to use it

- Inspect a specific area while retaining its surrounding context. For a long explanation, a labeled enlarged crop beside the original is often easier to read.
- Use sufficient source resolution. Magnification cannot recover unreadable text or create evidence absent from the original.
- Prefer static images and documents. Avoid duplicating live charts, video, forms, or interactive application trees inside the lens.

## Upstream starting point

The reviewed API supports a static position and a zoom factor. A guided presentation should never require hover to reveal an essential detail.

```jsx
<Lens
  isStatic
  position={{ x: focusX, y: focusY }}
  lensSize={220}
  zoomFactor={1.8}
  duration={0}
  ariaLabel={detailLabel}
>
  <img src={bundledImage} alt={sourceDescription} />
</Lens>
```

These are upstream props; verify them against the selected version. `position` uses local pixels, not percentages. `duration={0}` suppresses the upstream entrance transition; it is not a general pause control. Import the asset through the destination bundler rather than fetching it at runtime.

## Presentation integration

1. In Present, store focus coordinates and whether the detail is shown as absolute cue values. Keep the position fixed until the presenter advances. Backward navigation must restore the prior focus exactly.
2. Treat a lens movement as an optional finite transition. Reuse the presentation clock/animation controls to freeze position on pause and resume continuously. Instant repositioning is acceptable and simpler than autonomous pointer tracking.
3. In Explore, optionally enable pointer movement and keyboard controls or a list of labeled focus presets. Provide an equivalent path for touch and keyboard; do not rely on hover alone.
4. Replay must retain the chosen Explore focus and zoom unless the user explicitly requested a reset. Returning to Present restores the scripted focus.
5. Reduced motion keeps the detail magnified at its selected position but removes entrance scaling, fades, and animated travel. It must not disable access to the detail.

## Coordinates and duplicated content

The upstream pointer handler subtracts a viewport rectangle from pointer coordinates. In a scaled stage, convert that difference to local coordinates before positioning the lens. For a uniformly scaled stage:

```js
const rect = element.getBoundingClientRect()
const scaleX = rect.width / element.offsetWidth
const scaleY = rect.height / element.offsetHeight
const x = (event.clientX - rect.left) / scaleX
const y = (event.clientY - rect.top) / scaleY
```

This assumes an unrotated, borderless wrapper with positive dimensions. For other transforms use inverse-matrix conversion. Clamp positions to the intended image area and account for letterboxing, `object-fit`, and responsive image dimensions. Store cue coordinates in a documented image/container coordinate system.

The source component renders its children twice. A wrapper around the whole Lens is not enough to hide only the decorative copy from assistive technology. Adapt the magnified copy so it has `aria-hidden="true"`, no focusable descendants, no duplicate IDs, and no pointer interception. Preserve one accessible original image and a readable description of the selected detail. Never duplicate a stateful application tree just to enlarge it.

## Validate

- The scripted detail is visible without moving a mouse. Navigate forward/backward and verify exact focus restoration.
- Test center and edge positions after font/image loading and at 1600×900, 1280×720, and 1024×768. Pointer and scripted coordinates must refer to the same location.
- Verify pause/replay if transitions are enabled. Reduced motion preserves useful magnification without travel or entrance effects.
- Check keyboard/touch access in Explore, Escape behavior, no shortcut conflicts, a single accessible image, and no duplicated interactive descendants.
- Inspect source sharpness and clipping. The actual built offline HTML must retain the image and magnification without network access.

## Source

[Upstream implementation](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/lens.tsx). Verify its current masking, interaction, and accessibility behavior rather than assuming the demo is presentation-ready.

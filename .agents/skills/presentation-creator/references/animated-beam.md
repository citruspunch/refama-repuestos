# Optional animated beam

Read this when motion along a connection explains direction or sequence between diagram nodes. [Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam) is a visual reference for a pulse traveling along an SVG connection.

## When to use it

- Explain a data pipeline, a handoff, or a system's input/output connections. Activate the edge currently being explained rather than animating the whole graph continuously.
- Keep a static base connection and explicit direction indicators. At the endpoint, the diagram must still communicate the relationship without the moving pulse.
- Do not imply measured throughput, causal proof, travel time, or a working live integration unless actual evidence supports it. A teaching pulse is illustrative.

## Upstream starting point

The upstream component takes refs to a container, a source element, and a destination element. It uses an SVG gradient animated by `motion/react`.

```jsx
<AnimatedBeam
  containerRef={containerRef}
  fromRef={sourceRef}
  toRef={destinationRef}
  duration={1}
  repeat={0}
  pathColor={connectionColor}
  gradientStartColor={pulseColor}
  gradientStopColor={pulseColor}
/>
```

Verify the installed version supports `repeat`. In the reviewed upstream source, the default is `Infinity`; setting `repeat={0}` makes one traversal, but does not add presentation pause or replay. This snippet is an upstream starting point, not a full playback adapter.

## Presentation integration

1. Define the active edge or stage in the cue values. Preserve node labels and context while the presenter advances through the sequence. Do not use timers to select the next edge.
2. Reuse the existing Motion package and retain its animation controls, or drive the SVG reveal/pulse from the deck's finite clock. The bundled starter provides `useClock`, `paused`, `reducedMotion`, and a replay-aware `clockKey`.
3. Play once on edge activation, freeze the pulse in place on pause, resume from that position, and stop at a meaningful endpoint. Do not restart it on unrelated cue updates or context renders.
4. Replay resets the selected connection animation without losing Explore inputs. Clean up replaced animation controls and geometry observers when navigating away.
5. Reduced motion shows the static connection and its current-step emphasis immediately, with no moving gradient. The static path must remain visible after the pulse exits.

Prefer the destination deck's existing connection primitive when available. A normalized SVG path can use `pathLength="1"` and a clock-owned `strokeDashoffset` for a finite drawing reveal. That is an alternative to a traveling pulse, not a reason to run two animations on every edge.

## Scaled-stage geometry

The upstream source measures nodes with `getBoundingClientRect`. Those coordinates are already transformed by a scaled presentation stage. Inserting them as unscaled local coordinates can scale a connection twice.

Use a shared local SVG coordinate system. Convert viewport points through the inverse SVG screen matrix, or remove the known uniform stage scale before calculating local positions. Do not mix scaled rectangles with unscaled curvature or endpoint offsets. Recalculate after fonts, node layout, and stage resize; a CSS transform change may not trigger `ResizeObserver` by itself. Use unique SVG gradient IDs for concurrent edges.

## Accessibility and delivery

- Describe the flow in node labels and a short text alternative. Use arrowheads or equivalent direction cues in addition to the pulse.
- Mark a redundant SVG overlay decorative and keep `pointer-events: none`. It must not cover controls or duplicate diagram narration.
- Preserve category colors and adequate path contrast. A gradient is not a new semantic data series.
- Bundle the chosen implementation locally; do not install another animation stack merely to draw connections.

## Validate

- Check every edge's endpoints and direction at 1600×900, 1280×720, and 1024×768, including after a resize and delayed font loading.
- Confirm one finite traversal, no automatic step advance, pause mid-path, continuous resume, replay in both modes, and a readable static endpoint.
- Navigate backward and away rapidly. No stale gradients, duplicate IDs, background loops, or detached-node measurements remain.
- Reduced motion preserves the flow and selected edge. Verify the final offline HTML and reject invalid SVG geometry.

## Source

[Upstream implementation](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/animated-beam.tsx). Verify current props and lifecycle before reuse.

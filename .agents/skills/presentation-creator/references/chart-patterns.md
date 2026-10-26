# Charts, models, and evidence

Quantitative visuals must explain something supported by evidence. They do not have to be bars, and their evidence does not have to be empirical measurements. The bundled [standard charts](starter/src/Charts.jsx), [live trace](starter/src/Live.jsx), [example model](starter/src/model.js), and [tests](starter/tests/model.test.js) are self-contained examples, not prerequisites from another project.

## Evidence classes

1. **Measurements / imported results:** cite the source, date/version, units, transformations, and relevant series/scenario keys.
2. **Reproducible simulation:** identify equations, parameters, inputs, initial conditions, numerical method, step size, sample interval, and horizon. Test against a trusted reference.
3. **Analytical relationship:** identify the equation and assumptions. The starter's `y(t) = 1 − exp(−t/τ)` is a declared analytical teaching example, not empirical evidence about the user's subject.
4. **Conceptual illustration:** label it illustrative; it must not masquerade as a numerical result or measured trajectory.

No quantitative evidence? Use a diagram, equation explanation, fact row, process, or qualitative comparison. Do not manufacture headline numbers or placeholder bar charts.

Avoid repetitive `.src` footers by default. Maintain an evidence inventory in source documentation, notes, or an appendix. Follow the target's citation conventions and add concise visible attribution where requested or required by an external source. Less visual clutter does not remove the obligation to trace claims to evidence.

## Data contracts and a single source of truth

Keep raw/stored data separate from JSX. Import actual project data at build time when appropriate; keep calculations and derived metrics in pure modules. Filenames and fields are project choices, not required conventions. Document dataset shapes and transformations, for example:

```js
// Time series: [{ time, value }], with explicit time/value units and missingness.
// Category comparison: [{ category, value }], with a defined metric/denominator.
// Scenario metadata identifies source/version, parameters, and transformations.
// Simulation data additionally declares equations, inputs, and initial state.
```

- Validate finite values, required keys, ordering, domains, and units. Zero is not missingness; use explicit missing values and explain them.
- Do not join arrays by index unless their coordinate grids are verified identical. Otherwise align by time/frequency; document any interpolation. Do not silently connect missing observations or unrelated experiments.
- Memoize expensive calculations by model parameters, not the animation clock. Precompute trajectories; playback samples/reveals them instead of integrating every frame.
- Related plots, diagrams, readouts, annotations, and claims consume the same source. Test any hardcoded numerical labels against it.
- Preserve source precision; format only for display. Visual interpolation between known samples is not a new observation. A morph between scenarios is a transition, not a physically simulated parameter sweep.

## Color Constants

```javascript
export const INK = "#1c1028";
export const CAT_BLUE = "#4e79a7"; // primary categorical series
export const CAT_ORANGE = "#f28e2b"; // secondary categorical series
export const CAT_GRAY = "#bab0ac"; // tertiary / muted categorical
export const GREEN = "#2ba185"; // semantic: good / success
export const AMBER = "#d4953a"; // semantic: warning
export const VIOLET = "#6c5fc7"; // secondary series / accent
export const RED = "#f55459"; // unstable / failure
export const SLATE = "#80708f"; // axes, labels, tooltips
export const GRID = "#dbd6e1"; // grid lines
```

Assign blue/violet to categories or series as appropriate for the topic. Amber can mark a caveat; green/red signal a defined, supported success/failure or positive/negative outcome. Labels and dashes must distinguish series without color. Neutral categories use `CAT_*`, not arbitrary alternating semantic colors.

## Shared Configuration

```javascript
const ax = {
  axisLine: { stroke: SLATE },
  tickLine: false,
  tick: { fill: INK, fontSize: 13 },
};
const grid = { strokeDasharray: "3 3", stroke: GRID, vertical: false };
```

## Choose the rendering tool

| Need | Prefer |
| --- | --- |
| Standard time/frequency plots, comparisons, tooltips | Recharts |
| Shared clock revealing a trace alongside moving geometry | Lightweight SVG trace |
| Spatial geometry, process diagrams, annotated networks | Inline SVG with HTML/KaTeX labels as needed |
| Small shape alongside a matrix entry | SVG sparkline; disclose independent scales |

Use `ResponsiveContainer` with explicit logical height and a parent that can size (`min-width: 0`, `min-height: 0` where needed). Typical composition-driven heights: 175–230px in a multi-plot matrix, 250–400px for a principal plot, 60–120px for a sparkline. No one height is mandatory.

The bundled starter uses Recharts 3. If upgrading a target that uses a different major, follow the relevant [migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide), match `react-is` to React, and retest instead of assuming APIs/internal classes are unchanged. Do not migrate dependencies during an unrelated content edit.

Recharts 3 enables its accessibility layer by default: a focused chart uses arrow keys to inspect points. Global slide shortcuts must not steal those chart keys. Keep a descriptive chart title, visible focus, and keyboard-accessible tooltip data; do not disable accessibility merely to make clicker navigation simpler.

## Standard time-response pattern

```jsx
<ChartCard title="Output response · dimensionless" height={320}>
  <LineChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
    <CartesianGrid {...grid} />
    <XAxis dataKey="t" type="number" domain={[0, horizon]} unit=" s" {...ax} />
    <YAxis domain={[0, 1.05]} {...ax} />
    <Tooltip />
    <Line dataKey="response" type="linear" stroke={CAT_BLUE} dot={false} isAnimationActive={false} />
  </LineChart>
</ChartCard>
```

See the runnable `starter/src/Charts.jsx`. Use linear or scientifically justified interpolation; do not smooth away peaks. Disable Recharts' autonomous animation when the clock/CSS owns playback. Any enabled animation must support pause, replay, and reduced motion.

## Legible, honest comparisons

- Use about 2.5–3px lines, quiet grids, and light area fills. Avoid glowing neon traces on analysis slides.
- Variables, units, axis ranges, inputs, and legend mappings must be readable without hovering. Tooltips supplement the talk, never contain its only explanation.
- Numeric time axes preserve uneven spacing. Log axes require positive coordinates and explicit readable ticks. Distinguish rad/s from Hz, magnitude from dB, wrapped from unwrapped phase.
- Bars normally start at zero and use one categorical color per metric. A tighter line-chart range must be clearly labeled. Do not imply a chosen threshold is a universal physical law.
- **Stable versus unstable:** separate panels or explicitly separate y-scales if divergence would flatten the useful traces. Do not crop growth without an off-scale annotation or call it slow settling.
- **Mixed units:** separate plots/axes or explicit normalization. Define every percentage's denominator; a share of a reference scale differs from a percentage change relative to a baseline.
- **Steady state:** derive equilibrium from the model or verified source, not a truncated last sample. Show settling beyond the window as `> horizon`, unstable metrics as undefined, and missing results as unavailable.
- **Sampling:** stored samples from a continuous response do not prove sampled-controller stability, phase margin, or a maximum period. Verify the actual discrete closed-loop model first.
- **Illustrations:** declare magnification, visual limits, normalization, independent sparkline scales, and predictions outside a model's valid range.
- **Matrices:** label input columns/output rows; preserve signs/units/notation; keep entire equations legible and distinguish intuition from simulated equations.

## SVG geometry and animation

- Keep coordinates and `viewBox` consistent; use component-scoped IDs for markers, gradients, and clipping paths.
- Derive wires, arrowheads, moving markers, and labels from shared geometry. Test label-node/wire collisions.
- Clip to the plot rectangle, not by silently clamping each data value to the axis boundary. Explain off-scale values; prevent negative band dimensions, nonfinite paths, and zero-width domains.
- Share a clock across trace, cursor, readout, and geometry. Finite Present scenes hold; pause freezes; replay resets; reduced motion selects a meaningful final state.
- Morph paths only with compatible command/sample topology. Interrupted transitions start from the current rendered value, not an assumed prior cue endpoint. Stop controls on unmount.
- Provide accessible figure names/descriptions or adjacent interpretation. Private presenter prompts are not audience-facing labels.

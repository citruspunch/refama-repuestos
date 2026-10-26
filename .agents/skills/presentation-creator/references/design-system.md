# Reusable presentation design system

Defaults for a restrained, diagram- and evidence-led presentation. The complete baseline lives in the bundled [stylesheet](starter/src/App.css) and [UI helpers](starter/src/ui.jsx); no external reference deck is needed. For an existing presentation, preserve its visual identity. Adapt this baseline to the target's branding, audience, language, accessibility, and delivery requirements.

## Color Palette

```css
:root {
  --paper: #faf9fb; /* background */
  --paper-2: #f3f1f5; /* subtle fill */
  --ink: #1c1028; /* text and dark fills */
  --muted: #80708f; /* captions, secondary text */
  --line: #dbd6e1; /* borders, dividers */
  --line-2: #c4bdce;
  --card: #ffffff;
  --text-2: #3d314a;
  --green: #2ba185; /* semantic: success / good */
  --green-bg: #e0f5ef;
  --amber: #d4953a; /* semantic: warning */
  --amber-bg: #fdf3e4;
  --red: #f55459; /* semantic: failure */
  --red-bg: #fde8e9;
  --purple: #6c5fc7; /* accent: icons, active states, progress */
  --purple-light: #b5aade;
  --purple-bg: #ede8f5;
  --slate: #80708f;
  --cyan: #4e79a7; /* compatibility alias for the primary blue series */
  --cyan-d: #e8f0f8;
  --violet: #6c5fc7; /* secondary series / accent */
}
```

Assign category/series colors for the actual subject and keep them consistent across diagrams, legends, plots, equations, and readouts. Blue/violet are identities, not good/bad. Amber marks a caveat; green/red require evidence for success/failure or another explicitly defined meaning. Neutral categories may also use orange `#f28e2b` and gray `#bab0ac`. Never assume a color represents a particular domain variable.

Use labels, line dashes, shapes, or signs as well as color. Assess contrast at rendered size: a palette token is not automatically accessible for small text. Long explanations use ink or `--text-2`, not muted microtext.

## Typography

Stage sizes are logical pixels, not viewport-relative clamps:

| Element | Style |
| --- | --- |
| Cover h1 | TikTok Sans, 110px, 800, line-height .94, tracking −.04em |
| Slide h2 | TikTok Sans, 46px, 750, line-height 1.06, tracking −.03em |
| h3 | TikTok Sans, 22px, 700 |
| Figures | TikTok Sans, 88px; medium 68px; small 52px; 800, tabular numerals |
| Main facts / captions | 19px / 17px, line-height 1.4–1.45 |
| Technical labels/readouts | Montserrat; labels about 12–14px; readouts about 24px |
| Math | KaTeX fonts, not screenshots or body-font approximations |

`--sans` is TikTok Sans; the inherited `--mono` variable is **Montserrat, not a true monospace font**. Keep system fallbacks. Load the weights actually used: TikTok Sans variable range 300–900 and Montserrat 400–700. External Google Fonts links need a disclosed fallback offline; bundle licensed local fonts when exact offline fidelity is required.

If content does not fit, simplify composition, split a cue/slide, or move supporting detail into notes/appendix before shrinking important explanations.

## Layout Blocks

### Big figures (`Big`, `.bignums`)

Use only supported, relevant headline values. Open figure blocks with a colored left rule replace dashboard-like stat grids. Do not force metrics into every slide or the cover.

```css
.bignum {
  font-family: inherit;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  font-size: 88px;
  color: var(--c, var(--ink));
  font-variant-numeric: tabular-nums;
}
.bignum small {
  font-size: 0.35em;
  font-weight: 600;
  letter-spacing: 0;
}
.bignum-block { padding-left: 20px; border-left: 3px solid var(--c, var(--purple)); }
.bignums {
  display: flex;
  gap: 52px;
  flex-wrap: wrap;
}
.bignum-block .cap {
  margin-top: 10px;
  font-size: 17px;
  color: var(--muted);
  max-width: 310px;
  line-height: 1.4;
}
```

### Icon-led fact rows (`Facts`, `.facts`)

One bundled Reicon SVG and one concrete explanation per row, separated by top borders. `.compact` uses 18px. Good/warn/bad variants change meaning, not just decoration.

```css
.facts {
  list-style: none;
  padding: 0;
  margin: 0;
}
.facts li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  font-size: 19px;
  line-height: 1.45;
}
.facts .fi {
  font-size: 22px;
  color: var(--purple);
  margin-top: 2px;
}
.facts li.warn .fi {
  color: var(--amber);
}
```

### Purposeful panels, diagrams, and controls

| Primitive | Use |
| --- | --- |
| `.split`, `.l40`, `.l60`, `.stack`, `.row`, `.grid2` | Balanced explanation/visual arrangements, sized around the content |
| `Head`, `Rise` | Shared heading and short capped-delay entrance helpers |
| `.panel`, `.scene`, `.chart-card` | Real diagrams, charts, equations, or grouped controls; white, 1px line, 18px radius, very light shadow |
| `Readout`, `.readouts` | Small live values with units/context; content-sized columns for long values |
| `Slider`, `Seg` | Genuine Explore inputs, disabled without visual washout in Present |
| `Label`, `.chip`, `.legend` | Panel context, technical state, grouping, and units |
| `M`, `Tex` | Safe inline/display math, including accessible MathML |

Content-specific layouts are encouraged: labeled rows/columns for comparisons, separate plots for incompatible scales, diagrams for relationships, and timelines for chronological evidence. Do not force unrelated subjects into a fixed set of slide templates.

The cover may include a quiet kicker, short purpose statement, and relevant facts. These are not a repeated eyebrow/subtitle template for content slides. A quiet chapter HUD and panel labels are purposeful context. Repetitive `.src` footers are not part of the default layout; keep provenance in evidence documentation, notes, or an appendix, while honoring the target's citation conventions and required visible attribution.

## Stage and safe areas

Use a **1600×900 logical canvas**, centered at 50%/50%, with `transform: translate(-50%, -50%) scale(var(--s, 1))`. Set `--s` on mount/resize to `Math.min(innerWidth / 1600, innerHeight / 900)`. Letterboxing is intentional; never stretch a diagram to fill a 4:3 projector.

- `.slide`: absolute inset 0; padding `86px 100px 108px`, flex column. This gives a 1400px content width in the default stage.
- Chapter HUD: top 36px, left 100px; hide on cover when redundant.
- Cue rail: left/right 100px, bottom 60px, height 25px; segments/fraction, not another subtitle area.
- Toolbar: viewport-fixed, bottom 22px, outside the scaled stage. Compare its actual bounding rectangle with content; reserving stage pixels alone is insufficient.
- Use `min-height: 0` in flex/grid children and `minmax(0, …)` columns. Do not hide overflow as a substitute for layout.
- Narrow screens may reflow peripheral controls. A phone remote uses its own responsive surface, never a miniaturized stage.

## Motion and diagrams

- Slide transition: about .45s, subtle ±18px direction-aware travel and opacity, ease `[.22, 1, .36, 1]`; reduced motion removes travel.
- Entrances: .4–.6s and 8–12px travel, delays capped around .15s rather than a long stagger queue.
- Semantic geometry/parameter transitions: finite and interruption-safe, about .75–1.25s when needed for comprehension. Present demonstrations run once and hold.
- Pause all clock, Motion, CSS, and SVG animation layers. Decorative loops stop for pause/reduced motion; meaningful stable visuals remain.
- SVG uses consistent coordinates and a stable `viewBox`; derive wires/particles from shared geometry and give defs/clip paths unique IDs.
- Use HTML/KaTeX labels when SVG text layout is awkward. Keep labels clear of wires/nodes; provide accessible figure names/descriptions.
- Label visual magnification, off-scale values, normalization, truncated ranges, and independently scaled sparklines. Do not distort data to fit.

## Navigation

- Fixed bottom, centered, transparent (no border or background), `gap: 14px`.
- Buttons: 40px round, `1px solid var(--line)`, white fill, ink icon.
- Order: fullscreen, prev, dots, next, main-slide counter, replay/pause/mode/help, optional remote.
- `.dots button` 10px; active `.on` 26px purple pill.
- `.progress` top bar, 4px, purple: main-talk **cue** fraction in Present, slide fraction in Explore; appendix does not extend the denominator.
- Auto-hide after about 3.2s idle; reveal on pointer movement, touch, hover, and focus. Never leave a keyboard-focused toolbar transparent.
- Icon-only controls need accessible labels, selected/pressed/disabled states, visible focus, and modal help. Fullscreen follows browser events, including Esc.
- Preserve input/editing and modal keyboard behavior; prevent one Space press from advancing twice via keydown plus native click.
- Dialogs have headings, real modality, close actions, and focus restoration. Announce position changes politely, not every animation frame.
- Touch controls have at least 44px targets; the optional phone Next is substantially larger.

## Icons

The starter uses explicitly imported `reicon-react` SVG components behind a shared `Icon` map. Verify package exports and fail visibly on an unknown name rather than silently rendering nothing. Decorative icons are `aria-hidden`; buttons carry the accessible label. No runtime icon CDN or icon font is required. Preserve an existing project's appropriate bundled icon library rather than migrating it solely to match the template.

## Avoid

- Decorative eyebrow pills/redundant subtitles on every content slide.
- Unrelated logos, watermarks, dashboard-like headline stat grids, invented metrics, or filler icons.
- Tiny body copy, clipped formulas, meaningless infinite motion, color-only distinctions.
- Phosphor/Material CDN scripts and hidden MathML copied from obsolete examples.
- Universal bans on purposeful panels, chips, readouts, chapter labels, or cover summaries: use them when they explain actual information.

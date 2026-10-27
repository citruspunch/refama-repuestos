# Presentation Creator

A project-agnostic skill for creating and revising interactive presentations. Its instructions, references, starter, and tests are self-contained; the repository hosting this directory is not a prerequisite.

## Reuse in another project

Copy **this whole skill directory**, not only `SKILL.md`, into your agent's skill directory. For OpenCode, either:

- Install per project at `.opencode/skills/presentation-creator/` (the compatibility location `.agents/skills/presentation-creator/` also works).
- Install globally at `~/.config/opencode/skills/presentation-creator/` to make it available across projects.

Avoid conflicting copies with the same skill ID. Do not copy generated `node_modules/`, `dist/`, test results, or browser reports. The skill itself has no package-install step; only a presentation created from its starter needs dependencies installed.

All skill resources resolve relative to the directory containing `SKILL.md`. The destination presentation can have any directory name and does not need files from the skill's original host repository.

## Defaults versus project requirements

- **Reusable defaults:** the visual system, scaled stage, React/Vite starter, slide/cue contracts, Present/Explore interactions, accessibility, testing, and HTML delivery.
- **Discovered or supplied for each task:** topic, audience, language, branding, destination, source documents, data, citations, domain conventions, and delivery constraints.
- **Optional:** charts, math, numerical models, speaker notes, phone controls, and [selective count-up for headline metrics](references/number-ticker.md). Do not add these when the subject does not need them.

Other optional visual recipes are [highlighter](references/highlighter.md), [animated beam](references/animated-beam.md), [lens](references/lens.md), [code comparison](references/code-comparison.md), [blur fade](references/blur-fade.md), and [cue-driven animated list](references/animated-list.md). Each is linked directly from `SKILL.md` and loaded only for a relevant task. They are not enabled in the starter and require no installation until selected for a destination deck.

For an existing presentation, preserve its architecture and design. For a new one, adapt the [bundled starter](references/starter/README.md), replace its removable analytical example, and keep only needed capabilities. The skill does not force a technical subject or a specific narrative.

## Validate the package

From this skill directory:

```sh
node --test tests/portability.test.mjs
```

For the starter's unit, lint, build, browser, and offline checks, use the commands in its README from the starter directory. Those checks are separate from the skill-package portability checks.

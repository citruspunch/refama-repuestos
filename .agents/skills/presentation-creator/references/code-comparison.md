# Optional code comparison

Read this for presentations explaining a real code change, a refactor, or two alternative implementations. [Magic UI Code Comparison](https://magicui.design/docs/components/code-comparison) is a before/after code layout. It is not inherently an animation and does not need one to be useful.

## When to use it

- Show a small, relevant change with a clear explanation of what changed and why. Label both versions in the presentation's language.
- Use actual project code when making claims about that project. Label invented teaching examples explicitly and keep them separate from measured results.
- Keep enough unchanged context to understand the difference. Split a large diff across cues/slides instead of shrinking it into unreadable panels or requiring horizontal scroll.
- Do not use the component as a generic two-column layout for prose, tables, or mathematical comparisons.

## Upstream starting point

```jsx
<CodeComparison
  beforeCode={beforeCode}
  afterCode={afterCode}
  language={codeLanguage}
  filename={displayFilename}
  lightTheme="github-light"
  darkTheme="github-dark"
/>
```

Verify props against the selected source. The reviewed implementation uses Shiki and its transformers, `next-themes`, and an icon dependency. It imports highlighters asynchronously and uses Tailwind classes. Do not install all of those automatically into a small React/Vite presentation. Reuse its existing code renderer or a semantic `<pre><code>` comparison if syntax coloring is unnecessary. Preserve the deck's existing icon/theme system.

## Presentation integration

1. Keep a serializable record of the source snippets, language, filename, and explanatory label. Cue values select the compared version or highlighted change; timers never advance the comparison.
2. Prefer a stable two-column comparison. Use a labeled sequence when two columns would be unreadable. Highlight changed lines with text markers such as `+`/`−` and labels, not color alone.
3. If a cue changes emphasis, keep the code readable and stable. Avoid upstream hover-only focus behavior or blur that hides necessary context until the pointer enters a panel.
4. A static comparison has nothing to pause. If adding a finite transition, integrate it with the existing pause/replay controls. Replay should reset that entrance without changing selected snippets or Explore inputs.
5. Reduced motion keeps the selected versions and line emphasis fully visible. It must not remove the comparison or require an animation to finish before code is readable.

## Safety, accessibility, and offline delivery

- Treat code as text, not HTML. React text children escape a plain fallback safely. Do not copy an error fallback that interpolates raw code into `<pre>...</pre>` and inserts it through `dangerouslySetInnerHTML`.
- For syntax highlighting, use the selected library's documented HTML generation and escaping behavior. Preserve the raw source separately; annotation comments for diff transformers must not silently alter an executable example or copied code.
- Prefer build-time highlighting with bundled language grammars and themes. Runtime lazy loading, WASM, or dynamic imports may produce extra assets or fail through `file://`; verify the final artifact rather than assuming inlining.
- Readable plain text must remain available if highlighting fails. Cancel or ignore stale asynchronous highlighting results after snippet changes or unmount.
- Give each side a heading associated with its code block. Preserve meaningful whitespace, allow selection/copy, and keep filenames free of private paths or credentials.
- Use an actual monospace font for code. The starter's historical `--mono` token refers to Montserrat, so do not use that token as a code font without checking its value.
- Fit the fixed stage with explicit columns. Viewport-based responsive breakpoints and `w-screen` rules from a website demo can overflow a scaled stage.

## Validate

- Verify the displayed source and before/after labels, changed lines, indentation, and code-language selection. Label omissions; do not silently truncate relevant logic.
- Check legibility and panel bounds at 1600×900, 1280×720, and 1024×768 without hover or scrolling to essential code.
- Traverse cues and modes; snippet/line focus is deterministic and no keyboard action inside a code control advances the story unexpectedly.
- Test highlighting failure and code containing `<`, `>`, `&`, quotes, and HTML-like strings. They must remain inert source text.
- Verify reduced motion and any optional transition's pause/replay behavior. Open the actual offline HTML and check that code remains readable and no extra network assets are needed.

## Source

[Upstream implementation](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/code-comparison.tsx). Recheck dependencies, highlighting behavior, and fallback handling before reuse.

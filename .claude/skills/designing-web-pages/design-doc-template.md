# DESIGN.md — <Product name>

<!--
Copy to the project root as DESIGN.md and fill in. This is the source of truth for the look,
together with the Figma file (if any). Change the look = change it here AND in Figma AND in tokens.
Delete these comments when filled. Keep it current: an out-of-date DESIGN.md is worse than none.
-->

Figma: `<file key / URL>`, page `<Page>`, frames `<Screen / Light>` (`<node id>`), `<Screen / Dark>` (`<node id>`), <W × H>.
Tokens in `<path/to/tokens.css>` are 1:1 with the Figma variable collection `Theme` (modes Light / Dark).

---

## 1. Concept

**<One-line metaphor.>** <2–3 sentences: the real-world place/object the page is, and what the user does there.>

| Layer | Contains | Implementation |
|---|---|---|
| 1. Background (farthest) | <the "world": room, map, desk, street…> | <component / svg> |
| 2. Middle | <the frame the UI lives in: window, counter, board, device…> | |
| 3. Foreground | <the actual UI: input, primary action, key content> | |

Depth comes from: <overlap (negative margin), shadow, blur on the far layer, light/glow…>.

**Character:** <3–5 adjectives>. Light theme is <…>. Dark theme is <a story, not an inversion — e.g. "the same room after hours, lamp on">.

---

## 2. Color

All colors go through tokens. **No hex values inside components.** Theme: `data-theme="light" | "dark"` on `<html>`, default from `prefers-color-scheme`.

Palette source: <brand / domain colors with hex, where they come from>.

### 2.1 UI

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-page` | | | page background |
| `--surface-card` | | | cards, inputs |
| `--surface-raised` | | | active item, popovers |
| `--surface-sunken` | | | search, icon buttons |
| `--border-subtle` | | | default 1px border |
| `--border-strong` | | | secondary button outline |
| `--text-primary` | | | headings, body |
| `--text-secondary` | | | subtitles |
| `--text-muted` | | | labels, hints, footer |
| `--text-inverse` | | | text on accent |

### 2.2 Accents

| Token | Light | Dark | Role (one job each) |
|---|---|---|---|
| `--accent-brand` | | | brand mark, primary nav action |
| `--accent-action` | | | primary CTA, links, focus |
| `--accent-warn` | | | <…> |
| `--accent-danger` | | | errors, destructive |

### 2.3 Scene / illustration tokens

| Token | Light | Dark | Element |
|---|---|---|---|

### 2.4 Shadows

| Token | Light | Dark |
|---|---|---|
| `--shadow-a` | `0.16` | `0.55` |

Patterns: <card shadow, button shadow…>

---

## 3. Typography

| Variable | Typeface | Role |
|---|---|---|
| `--font-sans` | <…> | whole UI |
| `--font-display` | <…> | hero headline, dialog titles |
| `--font-mono` | <…> | labels, eyebrows, signage, metadata |

Base: `<14px / 1.45>`. Subsets: <latin + latin-ext if Polish/other diacritics>.

| Element | Face | Size | Weight | Other |
|---|---|---|---|---|
| Hero headline | display | `clamp(…)` | | `text-wrap: balance` |
| Eyebrow | mono | 10px | 400 | uppercase, `letter-spacing 0.2em` |

---

## 4. Layout

```
<ASCII wireframe of the desktop screen, with real widths in px>
```

- <shell structure, what scrolls, key max-widths>

| Breakpoint | Changes |
|---|---|
| `≤ 1024px` | |
| `≤ 720px` | |

| Radius | Where |
|---|---|

---

## 5. Components

### <Component>
- <size, tokens, states: hover / focus / active / disabled / empty / loading / error>

---

## 6. Icons

<One set, one stroke width, `currentColor`, default size. List of icons. Never emoji as icons.>

---

## 7. Motion

| What | How |
|---|---|
| button hovers | `0.14s ease` |
| <signature moment> | <duration, easing, what moves> |

`prefers-reduced-motion: reduce` disables animation globally; every new animation must respect it.

---

## 8. Accessibility

- Focus: `:focus-visible` outline 2px in <accent>, offset 2px
- Icon-only buttons have `aria-label` in the UI language; live regions for streaming/async content
- Contrast checked for text tokens on their surfaces in BOTH themes

---

## 9. Content & tone

- Language: <…>. No lorem ipsum. Realistic examples from the domain: <3 examples>.
- Voice: <e.g. "polite, officially warm — like the person at the counter">. Sample strings: <empty state, loading, error>.

---

## 10. Anti-patterns (forbidden in this project)

- <project-specific ones on top of the skill's list>

---

## 11. Code vs Figma differences (to sync)

| Element | Figma | Code |
|---|---|---|

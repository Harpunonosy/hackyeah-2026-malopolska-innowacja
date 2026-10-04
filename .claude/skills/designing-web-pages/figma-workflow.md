# Figma MCP workflow

Use this when the Figma MCP server (`plugin:figma:figma`) is connected. Figma is the source of truth for the look; code tokens mirror it 1:1.

## Hard requirements from the Figma plugin

| Before calling… | Load skill |
|---|---|
| `use_figma` (any write / JS in file) | `figma:figma-use` — every time, no exceptions |
| `create_new_file` | `figma:figma-create-new-file` |
| composing a whole screen | `figma:figma-generate-design` (together with `figma-use`) |
| `get_design_context` (Figma → code) | `figma:figma-design-to-code` |
| implementing animation from Figma | `figma:figma-implement-motion` |
| building tokens / component library | `figma:figma-generate-library` |

## Setup (once)

1. `whoami` → confirm account/plan. Create the file (`create_new_file`) or get the key from the team. Write the file key, page and frame node ids into `DESIGN.md`.
2. Create a variable collection **`Theme`** with modes **`Light`** and **`Dark`**. Add every token from the design direction (UI, accents, scene, shadow alpha). Name variables like the CSS vars (`bg-page` ↔ `--bg-page`).
3. Two frames on page `Landing` (or the screen name): `<Screen> / Light` and `<Screen> / Dark`, e.g. 1440 × 1024. Dark frame = same nodes with the variable mode set to `Dark`, not a hand-recolored copy.
4. Layer names in English; UI text in the product language.

## Build loop (section by section)

Order: background scene → middle frame → foreground UI → chrome (sidebar/topbar) → footer.

For each section:
1. `use_figma` to build **only that section**. Bind every fill/stroke to a variable, never a raw hex.
2. `get_screenshot` of the frame (both Light and Dark once the section exists in both).
3. Look at it critically against the Step 4 slop table in `SKILL.md`. Fix, then screenshot again.
4. Show the user the screenshot after each major section before moving on.

Scenery technique that works: vector shapes + linear/radial gradients + layer blur on the far layer (~0.8 px) + a big blurred radial "glow" behind the frame + an inner shadow inside the frame. For repeated props (books, binders, windows, tiles) use a seeded LCG in the `use_figma` script and reuse the **same generator and seed** in code, so both render the same arrangement.

## Handoff to code

- Export variables → `tokens.css` (`:root` = Light, dark block = Dark; see `tokens-starter.css`).
- Scenery → inline `<svg viewBox="…">` components with fills as `var(--token)`; split into layers (e.g. interior SVG + glass SVG with `mix-blend-mode: screen`) so they can be themed and animated separately.
- When code gains something Figma lacks (new screen, real data states), record it in DESIGN.md §11 "Code vs Figma differences" and sync when there is time.

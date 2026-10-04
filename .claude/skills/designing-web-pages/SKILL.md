---
name: designing-web-pages
description: Use when designing, restyling or building the look of a web page, landing page, app screen, chat UI, dashboard or empty state — choosing a concept, colors, fonts, layout, dark mode or motion, or working with Figma — and whenever the result risks looking generic, templated, SaaS-default or like "AI slop".
---

# Designing Web Pages

## Overview

Generic pages come from starting with components (hero, 3 cards, CTA). Distinctive pages start with **a place**: the real-world spot where this interaction would happen, drawn as layered vector scenery, with the UI standing *inside* that scene. Everything else — palette, type, dark mode, motion, copy — is derived from that place and the project's real brands, then built and checked visually section by section.

Worked example: a student Q&A chatbot designed as a dean's-office counter window. See `worked-example.md`.

## Step 1 — Write the design direction (before any code or Figma)

Produce exactly these parts, in this order. A direction missing any part is not done.

1. **Place** — one line: "The user is at ___, doing ___." Pick the physical place from the domain (student questions → the dean's-office window; city reports → ___; taxes → ___). Name of a reference product ("Linear energy") is not a place.
2. **Layers** — table of 3 depth layers: *background* (the world: room, street, desk), *middle* (the frame: window, counter, board, device), *foreground* (the real UI). State the depth device: overlap (negative margin onto the frame), blur on the far layer, glow/light, shadow.
3. **Anchor** — what the primary UI element physically rests on (the input lies on the window sill). It never floats centered on an empty background.
4. **Palette source** — the hex values it is derived from: brands the team actually represents or has permission to use (your org, client, partner) + materials of the place (wood, paper, brick, lamp light). A third-party institution's logo/colors are not yours: without permission, use only the materials. Then semantic tokens (`--surface-card`, `--text-muted`, `--accent-action`…), each accent with one job.
5. **Dark mode story** — same place at another time or state ("the office after hours, desk lamp on"), with its own tuned values and stronger shadows. Not an inversion to `#141414`.
6. **Type trio** — sans for UI, display (often serif) for the one headline, mono for labels/eyebrows/signage. Check diacritics subsets for the UI language.
7. **Signature moments** (1–2) — state-driven, story-true details (quota exhausted → a cat walks in and props up a "CLOSED" sign; theme switch spreads as a circle from the toggle; login grows out of the clicked button). Each has a `prefers-reduced-motion` fallback.
8. **Content** — real copy in the product's language and a voice that belongs to the place ("Good morning. How may I help?", loading: "Searching the binders…"). 3 realistic example inputs. No lorem ipsum, no invented statistics.
9. **ASCII wireframe** — desktop, with real px widths.

Then fill `design-doc-template.md` as the project's `DESIGN.md`. It stays the source of truth with Figma.

## Step 2 — Build it visually, one section at a time

**Figma is the default.** Design the key screen in Figma first, then code it. Follow `figma-workflow.md` (variables with Light/Dark modes, both theme frames, screenshot after every section).

- Figma MCP tools missing or `whoami` fails → stop and ask the user to connect the Figma MCP. Time pressure is not a reason to skip it: design iterations in Figma are cheaper than in code.
- Only if the user explicitly says to skip Figma → build straight in code, and take screenshots after every section in both themes with the `webapp-testing` skill (`scripts/screens.py` does light/dark × desktop/tablet/phone in one command).

Either way: scenery is vector (shapes, gradients, blur, inline SVG), never stock photos. Anything random (binder spines, stars, tiles) uses a seeded generator so server and client render identical markup.

**Scenery detail:** the middle frame carries the concept and gets the detail. The background is ~5–10 simple shapes + blur + one light source. When cutting scope, cut background detail first — never the anchor or the core flow.

**Usability beats metaphor:** the primary action is visible on first paint at 1440 and 375 px, readable at a glance, and never covered or delayed by the scene or an animation.

## Step 3 — Implement with tokens

Start from `tokens-starter.css`: every color is a CSS variable, 1:1 with the Figma variables; `data-theme` on `<html>`, default from `prefers-color-scheme`, set by an inline script before first paint. One icon set (one stroke width, `currentColor`), `aria-label` on icon-only buttons, `:focus-visible` outline, reduced-motion kill switch.

## Step 4 — Slop check (run on screenshots of BOTH themes at 1440 / 1024 / 375 px)

| If you see… | It is slop because… | Replace with |
|---|---|---|
| purple→blue / mesh gradient, glass cards | default AI look | colors from the palette source; glass only if the place has real glass |
| input centered on empty canvas | nothing anchors it | UI resting on the middle layer |
| hero → 3 feature cards → steps → testimonial → CTA | template, not a place | sections that exist in the scene |
| emoji as icons (even "placeholders") | placeholders ship | real SVG icons |
| `#3B82F6`, `#4ADE80`, `#FBBF24`, `#0B5FFF`, Inter alone | framework defaults | derived tokens, type trio |
| dark = light inverted to neutral gray | no story | tuned dark palette |
| "Linear/Notion/Citymapper vibe" as concept | borrowed identity | the place |
| hover-lift on every card, fade-in on scroll everywhere | motion without meaning | 1–2 signature moments |
| hex values inside components | tokens drift, dark mode breaks | `var(--token)` |

Fix, re-screenshot, repeat until no row matches. Then update `DESIGN.md` (including a "code vs Figma differences" table if they diverge).

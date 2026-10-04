# Worked example — student Q&A chatbot for a university

The generic version of this product is a chat input centered on a white page with a purple gradient. This is how the design direction turned it into something memorable instead.

| Part | Decision |
|---|---|
| **Place** | The student is at the dean's-office counter window, asking a question through the glass. |
| **Layers** | Background: office interior — shelves of colored binders, noticeboard, desk lamp with a warm cone of light, coffee mug, papers (slightly blurred). Middle: window frame, sill, glass with reflections, speaking grille, a sticky note taped on, sign "DZIEKANAT · OKIENKO 1". Foreground: question card, suggestion chips, sources note. |
| **Depth device** | Question card has `margin-top: -58px`, so it overlaps the sill. Warm radial glow from the window onto the wall. Far layer `blur(0.8px)`. |
| **Anchor** | The input rests on the window sill. In chat mode the window becomes a fixed backdrop and message bubbles "lie on the glass". |
| **Palette source** | University brand red + cream; student-org navy + light blue; materials: beige paper, wood, lamp amber. Light = cream/beige paper; accents: brand navy (new chat, user bubble), action blue (send, focus), amber (status clock), red (errors, footer heart, dictation). |
| **Dark story** | The same office after hours: navy room, the desk lamp switches on (`--lamp-on: 1`) and lights the wall. Shadow alpha 0.16 → 0.55. |
| **Type trio** | Inter (UI), Fraunces (headline "Dzień dobry. Czym mogę służyć?"), JetBrains Mono (eyebrow, signage, history group labels). `latin-ext` for Polish. |
| **Signature moments** | Theme switch: new theme spreads as a `clip-path: circle()` from the toggle (700 ms) and the lamp flickers on. Quota exhausted: a grey cat walks along the counter, props up a "CLOSED" sign and leaves; the sign stays. Login: `<dialog>` grows from the clicked button's rectangle to full screen. With reduced motion there is no cat, and the sign is simply lying there. |
| **Voice** | Polite, officially warm, like the clerk: "Dzień dobry. Czym mogę służyć?", loading "Szukam w segregatorach…", status pill "Okienko czynne 24/7", sign "Okienko zamknięte jeszcze przez 7 h 45 min". Example questions: "Kiedy zaczyna się sesja?", "Jak złożyć podanie o urlop?". |
| **Anti-requirements written down** | No purple-blue gradient, no centered input on an empty background, no glassmorphism without a reason, no emoji icons, no palette copied from ChatGPT/Claude, no hardcoded colors. |

## Why it works

- Every visual decision can be justified by "that's what's at the window". This also makes it faster: the concept answers questions like "what does loading look like?" or "what happens when the quota runs out?"
- The brand appears in the palette, not as a logo slapped on a template.
- Dark mode is a scene of its own, so it earns the "both themes as separate screens" requirement.

## Applying the method to other briefs (direction only, as a starting point)

- **City issue reporting** → a municipal noticeboard / city map pinned on a cork board by a tram stop. Report form is a card pinned to the board. Dark mode is the street at night with streetlights. The broken-streetlight report flickers.
- **SMB tax assistant** → an accountant's desk: ledger, stamp, calendar with deadlines circled in red pen. Chat is the notepad on the desk. Deadlines are sticky tabs on the calendar. Dark mode is the desk under a green banker's lamp at 23:00 before the deadline.

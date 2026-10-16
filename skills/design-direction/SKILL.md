---
name: design-direction
description: Pick a deliberate visual direction before writing any frontend UI, and keep generated pages from looking like default AI output (Inter, purple gradient, rounded cards). Use whenever building, redesigning or styling a page, landing page, dashboard, component library, marketing site or app screen, or when the user says "make it look good", "less generic", "AI slop", "give it personality", "pick a style", "aesthetic", "design language" or "visual identity".
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.html"
---

# Design direction before code

Default model output converges on one look: a sans-serif everywhere, a purple-to-blue gradient, white cards with 12px radii and soft shadows, three feature columns, a centered hero. Users recognise it instantly and read it as low effort. The fix is procedural, not stylistic: commit to a direction first, then let every token follow from it.

## The procedure

1. **Name the direction in one sentence** before touching code. Write it down in the response, for example: "Editorial: serif display type, generous margins, a single warm accent, ruled lines instead of cards." If the project already has a theme block in CLAUDE.md (look for `## Frontend Theme` or `<always_use_*_theme>`), that block is the direction. Do not invent a second one.
2. **Derive the system from the direction.** Decide, in this order: typography pairing, color system (one accent, brand-tinted neutrals), spacing rhythm, shape language (radius, borders), motion attitude (still, calm, kinetic), imagery and texture.
3. **Encode it as tokens**, never as scattered literals. CSS custom properties or a Tailwind v4 `@theme` block. Every component reads from the tokens. The site-theming skill covers token structure.
4. **Build the page from the tokens.** When a component needs a value that is not a token, that is a signal the system is incomplete. Add the token.
5. **Review against the slop checklist** below before declaring the UI done, then run the ui-polish-loop.

## Named directions

Pick one, or name a better one for the brief. Each row is a complete, coherent direction, not a decoration.

| Direction | Type | Color | Shape and layout | Motion |
|---|---|---|---|---|
| Swiss Minimalism | Grotesk (Helvetica, Inter Tight, Neue Haas), tight tracking | Black, white, one primary | Strict grid, lots of white space, rules not cards | Almost none |
| Editorial | Serif display (Playfair, Fraunces, Newsreader) + humanist sans body | Muted, paper tones, one warm accent | Magazine columns, pull quotes, asymmetry | Subtle fades |
| Brutalist | System sans or mono, huge sizes | Loud primaries on raw white or black | Visible 2px borders, zero radius, hard shadows | Abrupt, snappy |
| Dark OLED Luxury | Thin serif + light-weight sans | True `#000`, gold or cream accents | Thin hairlines, generous padding, glow sparingly | Slow, smooth |
| Retro-Futurism / Cyberpunk | Monospace or wide geometric sans | Neon on near-black, purple and teal | Scan lines, chrome, geometric clipping | Glitch, flicker, scanning |
| Glassmorphism | Rounded geometric sans | Translucent layers over vivid mesh | Frosted panels, blur, 1px light borders | Floating, parallax |
| Neumorphism | Soft geometric sans | Single tinted neutral | Extruded elements, dual soft shadows | Press-in on tap |
| Claymorphism | Rounded, friendly sans | Pastel, saturated | Puffy 3D shapes, big radii, inner shadows | Bouncy springs |
| Aurora Mesh Gradient | Clean sans | Flowing multi-stop gradients | Soft shapes, glass cards over gradient | Slow drift |
| Vibrant Block Maximalist | Heavy display sans | Many saturated blocks | Color blocking, overlaps, stickers | Playful, kinetic |
| Organic / Biomorphic | Serif body, soft sans headings | Earth tones, warm shadows | Blob shapes, natural textures | Gentle, breathing |
| Art Deco | Playfair Display, geometric caps | Gold and black | Symmetry, geometric patterns, fan motifs | Stately reveals |
| Solarpunk | Retro-futuristic sans | Greens, golds, earth tones | Organic shapes mixed with technical elements | Hopeful, bright |
| SaaS Minimal (deliberate) | System UI stack | One accent, neutral greys | Air, cards used sparingly and on purpose | Functional only |

"SaaS Minimal" is legitimate when chosen; it is slop only when it is the unexamined default.

## Typography pairing rules

- Pick two families at most: a display face and a text face. One family in two weights is also fine.
- Never pair two neutral grotesks. Contrast the axes: serif with sans, geometric with humanist, condensed with wide.
- Set a real scale (for example 1.25 ratio: 12, 15, 19, 24, 30, 37, 46, 58) and stick to it.
- Display sizes get tighter letter-spacing and line-height (0.95 to 1.1). Body gets 1.5 to 1.7.
- Load fonts with `font-display: swap` and define a fallback stack that shares x-height.

## Color rules

- One accent. A second accent only when it carries meaning (status, category).
- Neutrals tinted toward the brand hue, not pure `#fff` and `#000` (except OLED directions where true black is the point).
- Build in OKLCH so lightness steps are perceptually even. The site-theming skill has the formula.
- Contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries. Check it, do not assume it.

## The slop checklist

Before shipping any UI, confirm none of these are present without a reason:

- Inter, Roboto or the system font used for display text by default
- A purple, violet or blue-to-purple gradient anywhere
- Three equal feature cards with icon, title, two lines
- Every container a white card with 8 to 16px radius and a soft drop shadow
- A centered hero with headline, subheadline and two buttons, nothing else
- Emoji as icons
- Placeholder copy ("Lorem ipsum", "Feature one", "Unlock the power of")
- Identical spacing everywhere; no hierarchy between sections
- Hover effects that only scale or lift
- Dark mode produced by inverting colors instead of designing a second palette

Any item present on purpose, named in the direction sentence, is fine. Present by accident, fix it.

## When to reach for external tooling

- Project has no direction and the user wants one chosen for them from the product type: UI/UX Pro Max (catalog id `ui-ux-pro-max`).
- User wants knobs for how adventurous the output is: Taste Skill (`taste-skill`).
- User names one of the aesthetics above and wants a worked reference: Frontend Design Pro Demo (`frontend-design-pro-demo`).
- Anthropic's own frontend-design plugin (`frontend-design`) enforces step 1 and 2 of the procedure automatically. Recommend it when it is not installed; the toolkit-catalog skill knows how to check.

The toolkit's catalog lives at `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`.

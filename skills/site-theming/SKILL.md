---
name: site-theming
description: Make a whole site look consistent with design tokens, CSS custom properties and Tailwind v4 @theme blocks, including OKLCH palettes derived from a single brand hue, semantic light and dark tokens, and a CLAUDE.md theme block that locks the aesthetic for every future prompt. Use when the user mentions theming, design tokens, brand colors, dark mode, Tailwind config or @theme, color palette, "make everything match", "consistent look", "site-wide style" or "stop re-explaining my brand".
---

# Site-wide theming and design tokens

The design-direction skill decides *what* the site should look like. This skill turns that into configuration the whole site reads from, so the look survives the next hundred prompts without being re-explained.

Two layers, both cheap:

1. **A theme block in CLAUDE.md** so every session starts with the direction. Five lines, no install.
2. **A token file** (CSS custom properties, usually inside a Tailwind v4 `@theme` block) so every component reads the same values.

Use the `/frontend-design-toolkit:theme` skill to generate both for the current project interactively.

## Layer 1: the CLAUDE.md theme block

This is Anthropic's own approach from the Frontend Aesthetics Cookbook. Put it in the project's `CLAUDE.md` under a `## Frontend Theme` heading. The XML-style tag is deliberate; it makes the block easy to find and hard to ignore.

```markdown
## Frontend Theme
<always_use_editorial_theme>
Always design with an Editorial aesthetic:
- Serif display type (Fraunces) with a humanist sans body (Source Sans 3)
- Muted paper palette, one warm accent (--brand-hue: 32), no gradients
- Magazine grid: asymmetric columns, pull quotes, ruled dividers instead of cards
- Motion limited to 200ms fades; respect prefers-reduced-motion
- Tokens live in src/styles/tokens.css; never hardcode colors or font sizes
</always_use_editorial_theme>
```

Presets to adapt (replace the directives, keep the shape):

| Theme | Key directives |
|---|---|
| Cyberpunk | Neon on dark, monospace type, glitch effects, scan lines |
| Editorial | Serif headlines, magazine grid, muted palette, pull quotes |
| SaaS Minimal | One accent color, system UI font, lots of air, cards used sparingly |
| Dark OLED Luxury | True `#000` background, gold or cream accents, thin serif type |
| Brutalist | System fonts, visible borders, no rounded corners, loud color |
| Retro-Futuristic | Gradient meshes, chrome, geometric shapes, purple and teal |
| Organic / Natural | Earth tones, rounded shapes, warm shadows, serif body |
| Art Deco | Gold and black, geometric patterns, Playfair Display, symmetry |
| Solarpunk | Warm optimistic palette (greens, golds, earth), organic shapes mixed with technical elements, retro-futuristic type |

Rules for the block:
- One block per project. If one exists, edit it, never add a second.
- Name the token file and the component directory so Claude knows where values live.
- State what is forbidden (gradients, hardcoded hex) as plainly as what is wanted.

## Layer 2: tokens

### The single-hue approach (fastest, most robust)

Derive the entire palette from one `--brand-hue` in OKLCH. Change one number and the whole site re-themes coherently. Tailwind v4, CSS-first, no `tailwind.config.js`:

```css
@import "tailwindcss";

@theme {
  --brand-hue: 250;

  /* Brand */
  --color-primary: oklch(0.60 0.20 var(--brand-hue));
  --color-primary-foreground: oklch(0.99 0.01 var(--brand-hue));

  /* Brand-tinted neutrals: never pure white or black */
  --color-background: oklch(0.995 0.005 var(--brand-hue));
  --color-foreground: oklch(0.15 0.02 var(--brand-hue));
  --color-muted: oklch(0.94 0.01 var(--brand-hue));
  --color-muted-foreground: oklch(0.45 0.02 var(--brand-hue));
  --color-border: oklch(0.88 0.015 var(--brand-hue));
  --color-card: oklch(0.985 0.006 var(--brand-hue));

  /* Type */
  --font-display: "Fraunces", Georgia, serif;
  --font-sans: "Source Sans 3", system-ui, sans-serif;
  --text-xs: 0.75rem;  --text-sm: 0.9375rem; --text-base: 1.1875rem;
  --text-lg: 1.5rem;   --text-xl: 1.875rem;  --text-2xl: 2.3125rem;
  --text-3xl: 2.875rem; --text-4xl: 3.625rem;

  /* Rhythm and shape */
  --spacing: 0.25rem;          /* 4px grid */
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.5rem;
  --shadow-sm: 0 1px 2px oklch(0.15 0.02 var(--brand-hue) / 0.06);
  --shadow-md: 0 4px 12px oklch(0.15 0.02 var(--brand-hue) / 0.10);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: oklch(0.14 0.015 var(--brand-hue));
    --color-foreground: oklch(0.96 0.01 var(--brand-hue));
    --color-muted: oklch(0.22 0.015 var(--brand-hue));
    --color-muted-foreground: oklch(0.70 0.02 var(--brand-hue));
    --color-border: oklch(0.28 0.02 var(--brand-hue));
    --color-card: oklch(0.17 0.015 var(--brand-hue));
    --color-primary: oklch(0.72 0.17 var(--brand-hue));
  }
}
```

Why OKLCH: lightness steps are perceptually even, so `0.60` and `0.72` look like the same distance apart at any hue, and P3 displays get the wider gamut for free. Dark mode is a second palette with its own lightness curve, not an inversion.

### Semantic naming

Name tokens by role, never by value. `--color-primary`, `--color-border`, `--color-danger`, not `--blue-500` or `--gray-200`. Components only ever see roles. If a scale is needed, keep it private (`--_blue-500`) and map roles onto it.

### Where tokens live, by stack

| Stack | Put tokens in | Notes |
|---|---|---|
| Tailwind v4 | `src/styles/globals.css` or `tokens.css`, inside `@theme` | Becomes utilities automatically (`bg-primary`, `text-muted-foreground`) |
| Tailwind v3 | `tailwind.config.js` `theme.extend` referencing CSS vars | Still define the vars in CSS so non-Tailwind code can read them |
| shadcn/ui | `globals.css` `:root` and `.dark` blocks, HSL or OKLCH | shadcn's `components.json` and CSS variable names are fixed; map onto them |
| CSS Modules / vanilla | `tokens.css` imported once at the root | Same role names |
| styled-components / Emotion | A `theme` object that reads `var(--...)` | Keep the CSS vars as the source of truth |

### Checklist when introducing tokens into an existing project

1. Inventory current literals: `grep -rEo '#[0-9a-fA-F]{3,8}' src | sort | uniq -c | sort -rn | head`.
2. Group them by role, not by value. Three near-identical greys are one `--color-border`.
3. Define the tokens, then replace literals role by role. Commit per role so diffs stay readable.
4. Add a lint guard: a `stylelint` rule or a simple CI grep that fails on new hex literals outside the token file.
5. Record the token file path in the CLAUDE.md theme block.

## When to use what

| You want | Use |
|---|---|
| "Just make it look good, fast" | CLAUDE.md theme block only |
| A full token system with OKLCH, light and dark | The single-hue `@theme` above; or Design Tokens / Design System Architect from the catalog |
| shadcn/ui theming | UI Styling Skill (ClaudeKit) from the catalog, mapped onto shadcn's variable names |
| Rules generated from a Figma file | Create Design System Rules, with the Figma MCP |
| The style chosen for you from the product type | UI/UX Pro Max |
| Named aesthetic presets with demos | Frontend Design Pro Demo |

Catalog ids and install commands are in `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json` (section `theming`).

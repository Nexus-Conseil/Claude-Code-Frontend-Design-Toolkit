---
name: toolkit-catalog
description: Look up which Claude Code skill, plugin, MCP server or config trick solves a frontend or design problem, using the toolkit's structured catalog of 50+ vetted tools (design skills, theming, animation, UI/UX, Figma, browser testing, docs, framework skills, deploy). Use when the user asks "is there a skill for X", "what MCP should I use for Y", "how do I give Claude a browser", "what's the Figma integration", "which tool for animations / tokens / accessibility / visual regression", or wants install commands for any of these.
---

# The toolkit catalog

The catalog is a JSON file bundled with this plugin:

- `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`: sections and tools
- `${CLAUDE_PLUGIN_ROOT}/catalog/stacks.json`: curated bundles of tools to install together

Read the file with the Read tool when a question needs it. It is small (well under 100 KB). Do not answer install questions from memory when the catalog has the entry; commands and marketplace names drift, and the catalog is the maintained source.

## Shape

```jsonc
{
  "version": "…", "updated": "YYYY-MM-DD",
  "sections": [{ "id": "design", "title": "Design Skills", "tagline": "Kill the AI slop", "blurb": "…" }],
  "tools": [{
    "id": "playwright-mcp",            // stable, kebab-case; what other skills reference
    "name": "Playwright MCP",
    "section": "testing",
    "kind": "mcp",                      // skill | plugin | mcp | lsp | cli | config | feature | collection | service
    "author": "Microsoft",
    "summary": "One or two sentences on what it does and why it matters.",
    "install": ["claude mcp add playwright -s user -- npx @playwright/mcp@latest"],   // [] when manual
    "requires": [],                     // other tool ids or prose prerequisites
    "source": "https://github.com/microsoft/playwright-mcp",
    "docs": null,
    "stars": "20k+",                    // display string or null
    "tags": ["browser", "e2e", "screenshots"],
    "notes": "Longer guidance, flags worth knowing, caveats."
  }]
}
```

## How to answer

1. **Map the request to a section first**: design, theming, motion, ux, design-to-code, testing, docs, frameworks, deploy. Then filter tools by tags.
2. **Recommend one tool, name one alternative**, and say why. A list of eight options is not a recommendation.
3. **Quote the install command verbatim from the catalog.** Note the kind: a `skill` costs ~100 tokens idle, an `mcp` server costs thousands at session start (the context-budget skill has the figures). Mention that when the user is about to add a third or fourth server.
4. **State prerequisites** from `requires` (Figma desktop app and seat, a running Storybook, Node version).
5. **If nothing in the catalog fits**, say so, then suggest where to look (the catalog's `further-reading` entries) rather than inventing a tool.
6. For "what should I install for this project", hand off to `/frontend-design-toolkit:recommend`, which reads the project and the stacks file. For "install stack X", `/frontend-design-toolkit:install`.

## Section map (ids)

| id | Covers |
|---|---|
| `design` | Aesthetic direction, anti-slop skills, named styles, UX designer personas |
| `theming` | Tokens, OKLCH palettes, Tailwind @theme, shadcn theming, CLAUDE.md theme blocks, Figma-derived rules |
| `motion` | GSAP, Motion (Framer), React Spring, Lottie, scroll effects, motion audits |
| `ux` | UX research, growth and CRO, accessibility patterns, design vocabulary |
| `design-to-code` | Figma MCP, Code Connect, artifact builders |
| `testing` | Playwright, Chrome DevTools, Storybook, visual regression, web quality audits |
| `docs` | Context7, skill generators from docs sites, scraping |
| `frameworks` | React, Tailwind, shadcn, Three.js, D3, TypeScript LSP, polish skills |
| `deploy` | Vercel, zero-config hosting |

## Maintaining the catalog

Contributors add a tool by appending an object to `tools` and running `npm test` (the validator checks ids, sections, URL shapes and that the README quick-reference table is regenerated with `npm run render`). The README's long-form sections stay hand-written; the table is generated.

---
name: audit
description: Audit this project's frontend design setup for Claude Code (theme block, tokens, browser access, docs access, installed skills and MCP servers, context cost) and produce a gap list with the exact commands to close each gap.
argument-hint: "[--json]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash(claude mcp list:*) Bash(claude plugin list:*) Bash(cat:*) Bash(ls:*) Bash(grep:*) Bash(find:*)
---

# Audit the frontend tooling setup

Produce a scorecard of how well this project is set up for good-looking, verified frontend output, then the shortest path to fix each gap. Arguments: `$ARGUMENTS` (`--json` prints the scorecard as JSON instead of a table).

Read `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json` for install commands; never guess them.

## Checks

Run each check, record **pass**, **partial** or **missing**, and the evidence (file and line, or command output).

| # | Check | Pass when |
|---|---|---|
| 1 | Frontend project | `package.json` has a UI framework or styling dependency |
| 2 | Visual direction locked | `CLAUDE.md` (root or `.claude/`) contains a `## Frontend Theme` block or `<always_use_*_theme>` |
| 3 | Design tokens exist | A `@theme` block, or `:root` custom properties for color and type, or a `tailwind.config` theme extension referencing CSS vars |
| 4 | Tokens are used | Fewer than 10 distinct raw hex literals in `src/` (or the app directory) outside the token file |
| 5 | Typography is deliberate | At least one non-system font family declared and loaded with `font-display` |
| 6 | Dark mode is designed | Dark tokens exist as a second palette (not `filter: invert`) or the project explicitly has no dark mode |
| 7 | Browser for Claude | Playwright MCP or Chrome DevTools MCP present in `.mcp.json`, `claude mcp list`, or `@playwright/cli` in devDependencies |
| 8 | Live docs | Context7 (or equivalent docs MCP) configured |
| 9 | Design-direction skill | Anthropic `frontend-design` plugin or an equivalent design skill enabled (`claude plugin list`), or this plugin's skills present |
| 10 | Accessibility gate | axe, `@axe-core/playwright`, Lighthouse CI, or `eslint-plugin-jsx-a11y` present |
| 11 | Motion respects preferences | If a motion library is present, `prefers-reduced-motion` appears in CSS or in a `useReducedMotion` call |
| 12 | Context budget | Four or fewer MCP servers active across scopes |
| 13 | Component library wired | If Storybook exists, Storybook MCP is configured; if Figma is referenced, Figma MCP is configured |

Checks 1 to 6 are about the project; 7 to 13 about the tooling. If check 1 fails, print that and stop.

## Output

Default: a table (Check, Status, Evidence), then **Gaps**, ordered by impact:

1. Direction and tokens first (checks 2 to 4): they change every future output.
2. Browser access next (7): without it nothing is verified.
3. Then the rest.

Each gap gets one line of why and the exact fix: a slash command from this plugin (`/frontend-design-toolkit:theme`, `/frontend-design-toolkit:install <id>`) or the install command quoted from the catalog. End with a one-line score such as "9 of 13 passing" and the single most valuable next command.

`--json`: `{ "score": {"pass": n, "total": 13}, "checks": [{"id", "name", "status", "evidence"}], "gaps": [{"check", "why", "fix"}] }` and nothing else.

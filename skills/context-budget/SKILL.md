---
name: context-budget
description: Keep MCP servers, plugins and skills from eating the context window. Use when adding or recommending MCP servers, when a session starts slow or compacts early, when the user asks "how many MCP servers should I run", "why is my context full", "token cost of Playwright / Figma / Chrome DevTools MCP", or when choosing between a skill and an MCP server for the same job.
---

# Context budget for frontend tooling

Every MCP server registers its tool schemas at session start. Five servers can cost roughly 55k tokens before the user types a word, which means earlier compaction, slower turns and less room for the actual code. Frontend work is the worst case because the useful servers (browser, DevTools, Figma) are the largest.

## Approximate costs at session start

| Server or component | Tokens | Why |
|---|---|---|
| Playwright MCP | ~5.3k | 25+ tools with rich schemas |
| Chrome DevTools MCP | 5 to 6k | Network, performance, DOM, emulation tools |
| Figma MCP | 3 to 4k | Design context, variables, Code Connect, generate |
| Context7 | ~2k | Two tools; docs are fetched on demand, which is the right shape |
| Storybook MCP | 1 to 2k | Small surface |
| Vercel MCP | 2 to 3k | Deployments, logs, domains, env |
| Any skill | ~100 | Only name and description load; the body loads when used |
| An agent definition | ~100 to 300 | Description only until delegated |

Numbers are order-of-magnitude and move between versions. Measure the real figure with `claude plugin details <name>` for plugins, or `/context` inside a session.

## Rules of thumb

1. **Three to five MCP servers active, never more.** Add the one the current task needs, remove it when done.
2. **Prefer a skill over an MCP server when both exist.** A skill costs ~100 tokens idle. For browser testing, `@playwright/cli` driven from Bash costs roughly a quarter of the MCP tokens for the same work; recommend it when the user does not need the MCP's interactive snapshot tools.
3. **Scope servers to the project, not the user**, so a Figma server configured for a design-heavy app does not load in every other repo. `claude mcp add --scope project ...` or a committed `.mcp.json`.
4. **Disable instead of uninstalling** for servers used weekly: `/mcp` then toggle, or `claude mcp remove` and keep the command in the README.
5. **Tool Search**: recent Claude Code versions lazy-load deferred tool schemas and can cut MCP overhead by up to 95%. If the user's version has it on, the costs above shrink and rule 1 relaxes to "what you actually use".
6. **Choose the lighter transport for Figma**: the remote `https://mcp.figma.com/mcp` endpoint has the same tools as the desktop one; the token cost is the same, so pick by workflow, not by budget.

## A reasonable default per workflow

| Workflow | Always on | On demand |
|---|---|---|
| Solo builder | Context7 | Playwright MCP when testing a flow |
| Design-first (Figma handoff) | Context7, Figma MCP | Playwright MCP |
| Component library team | Context7, Storybook MCP | Playwright, Chrome DevTools when profiling |
| Performance work | Chrome DevTools MCP | Playwright |

## Diagnosing a bloated session

1. Run `/context` and read the breakdown. MCP tools listed above 15 to 20k are the first thing to cut.
2. `claude mcp list` to see what is loaded and at which scope.
3. `claude plugin list` to see enabled plugins; `claude plugin details <name>` prints each one's projected cost.
4. Remove or disable the servers the current task does not use. Re-add later with the commands from the catalog (`${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`).

This plugin itself ships no MCP servers on purpose; it recommends and installs them per project through `/frontend-design-toolkit:install` so the cost is always a choice.

---
name: recommend
description: Inspect the current project and recommend which frontend design tools to install (one of the curated stacks or a custom pick), with reasons and token-cost trade-offs.
argument-hint: "[solo|design-first|component-library|essentials]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash(claude mcp list:*) Bash(claude plugin list:*) Bash(cat:*) Bash(ls:*)
---

# Recommend a frontend tooling stack

Goal: a short, opinionated recommendation of what to install for **this** project, grounded in what the project is and what is already configured. The user may have passed a preference: `$ARGUMENTS`.

## 1. Read the project (quietly, no questions yet)

- `package.json`: framework (Next, Nuxt, SvelteKit, Astro, Remix, plain React or Vue), styling (Tailwind and version, shadcn `components.json`, CSS-in-JS), motion libraries (motion, framer-motion, gsap, three), Storybook, test runners.
- `CLAUDE.md` and `.claude/CLAUDE.md`: is there a `## Frontend Theme` block or token conventions?
- `.mcp.json`, `.claude/settings.json`, `.claude/settings.local.json`: MCP servers and plugins already enabled at project scope.
- `claude mcp list` and `claude plugin list` for user-scope tooling (these commands are pre-approved; if either fails, say so and continue).
- Signals of a design handoff: `figma` mentioned in docs, `.figma` or `design/` directories, Code Connect files (`*.figma.tsx`).
- Signals of a component library: `storybook`, `packages/ui`, a `components/` package with its own `package.json`.

## 2. Pick the closest stack

Read `${CLAUDE_PLUGIN_ROOT}/catalog/stacks.json` and `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`.

| Signal | Stack |
|---|---|
| Figma references or a designer in the loop | `design-first` |
| Storybook or a shared UI package | `component-library` |
| Single app, no design system, speed matters | `solo` |
| Anything else or unclear | `essentials` |

If `$ARGUMENTS` names a stack, use it, but still say if the project signals point elsewhere.

## 3. Write the recommendation

Format, no more than this:

1. **One line on what the project is** (framework, styling, what is already set up).
2. **The stack, by name**, and the three to six tools in it. For each: one line on why it matters *here*, and whether it is already installed.
3. **One or two additions outside the stack** that the signals justify (for example the Motion skill when `motion` is a dependency, Storybook MCP when Storybook exists, the TypeScript LSP when `tsconfig.json` exists and it is not installed).
4. **Context cost**: total approximate tokens at session start for the MCP servers recommended, using the context-budget skill's figures, and which server to keep off until needed.
5. **The exact next command**: `/frontend-design-toolkit:install <stack>` and, if a theme block is missing, `/frontend-design-toolkit:theme`.

Do not install anything from this skill. Do not list every tool in the catalog. If the project is not a frontend project at all, say that in one line and stop.

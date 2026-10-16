---
name: install
description: Install one of the curated frontend tooling stacks (essentials, solo, design-first, component-library) or a single catalog tool by id, running the exact commands from the catalog after showing them.
argument-hint: "<stack-or-tool-id> [--dry-run]"
disable-model-invocation: true
allowed-tools: Read Bash(claude plugin:*) Bash(claude mcp:*) Bash(npx ui-skills:*) Bash(npx skills:*) Bash(cat:*)
---

# Install a stack or a tool

Target: `$ARGUMENTS` (a stack id from `${CLAUDE_PLUGIN_ROOT}/catalog/stacks.json`, or a tool id from `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`). With no argument, list the stacks with one line each and stop.

## Procedure

1. **Resolve the target.** Read both catalog files. A stack expands to its `tools` list; a tool id resolves to one entry. Unknown id: say so, show the closest three ids by name, stop.
2. **Build the command list** from each tool's `install` array, in catalog order. Skip tools whose `install` is empty, and list them separately as "manual" with their `source` URL and a one-line instruction. Collapse duplicate commands (several stacks share Context7 and Playwright).
3. **Check what is already there** with `claude mcp list` and `claude plugin list`. Mark already-installed items and drop their commands.
4. **Show the plan** as a single fenced `bash` block, each command on its own line, with a comment naming the tool. State the approximate context cost of the MCP servers being added (context-budget skill). If `--dry-run` was passed, stop here.
5. **Confirm, then run.** Installing modifies the user's Claude Code configuration, so ask once: "Run these N commands now?" Then run them one at a time with Bash, in order. Marketplace additions (`claude plugin marketplace add …`) always precede the `claude plugin install …` that depends on them. If a command fails, show its output, do not retry it blindly, continue with commands that do not depend on it, and summarise failures at the end.
6. **Verify** with `claude mcp list` and `claude plugin list` again, and print what changed.
7. **Close with the follow-ups** that apply:
   - MCP servers need a restart or `/mcp` to appear; plugins need `/reload-plugins`.
   - If the stack has a `claudeMd` snippet (the design-first stack does), offer to append it to the project's `CLAUDE.md`, show the exact text, and append only after the user agrees.
   - If no theme block exists in `CLAUDE.md`, point to `/frontend-design-toolkit:theme`.

## Scope rules

- MCP servers: default to the scope in the catalog command (`-s user` for general tools, `--scope project` for project-specific ones such as Storybook and Figma). If the user says "just this project", switch `-s user` to `--scope project`.
- Never pass `--dangerously-skip-permissions` or similar flags, never edit `settings.json` by hand from this skill; the CLI commands are the interface.
- Secrets (API keys for Figma remote, Firecrawl, Vercel) are never typed into the command line from this skill. Tell the user which environment variable or `/mcp` auth flow the tool expects and leave it to them.

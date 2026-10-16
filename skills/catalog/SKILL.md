---
name: catalog
description: Browse the toolkit catalog of frontend design tools for Claude Code, by section, tag or free-text query, with install commands.
argument-hint: "[section-id | search terms]"
disable-model-invocation: true
allowed-tools: Read
---

# Browse the catalog

Query: `$ARGUMENTS`

Read `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`.

- **No argument**: print the sections as a table (id, title, tagline, number of tools), then the stacks from `${CLAUDE_PLUGIN_ROOT}/catalog/stacks.json` in one line each. Finish with "`/frontend-design-toolkit:catalog <section>` to drill in."
- **Argument matches a section id** (`design`, `theming`, `motion`, `ux`, `design-to-code`, `testing`, `docs`, `frameworks`, `deploy`): list that section's tools as a table with columns Name, Kind, Author, Stars, Install (first command or "manual"). Below the table, one line per tool with its summary. Note which ones are already installed when that is cheap to tell (a project `.mcp.json` mentioning them).
- **Anything else**: treat it as a case-insensitive search over `name`, `summary`, `tags`, `notes` and `author`. Show up to eight hits ranked by how many fields matched, same table, then the summaries. Zero hits: say so and show the section list.

Always end with the catalog `updated` date and a pointer to `/frontend-design-toolkit:install <id>` for anything the user wants.

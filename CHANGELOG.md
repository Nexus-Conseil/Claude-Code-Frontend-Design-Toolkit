# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-16

The repository becomes an installable Claude Code plugin. The curated list it started as is now a structured catalog the plugin reads.

### Added
- Plugin manifest and a `nexus-conseil` marketplace, installable with `/plugin install frontend-design-toolkit --marketplace Nexus-Conseil/Claude-Code-Frontend-Design-Toolkit`.
- Auto-activating skills: `design-direction`, `site-theming`, `ui-polish-loop`, `context-budget`, `toolkit-catalog`.
- Slash skills: `/frontend-design-toolkit:recommend`, `:install`, `:catalog`, `:theme`, `:audit`, `:design-review`.
- Agents: `design-reviewer`, `stack-advisor`.
- A SessionStart hook that detects frontend projects and reports whether a theme block and a browser MCP are configured.
- `catalog/catalog.json` (42 tools, 9 sections) and `catalog/stacks.json` (4 stacks) with a JSON Schema.
- Validation script, README generator, a `node:test` suite, five `claude plugin eval` cases, and a CI workflow that also runs `claude plugin validate --strict`.
- `LICENSE` (MIT), `CONTRIBUTING.md`, this changelog.

### Changed
- README reorganised around installing and using the plugin; the quick-reference table and the stacks section are generated from the catalog.
- Install commands corrected against the current CLI and upstream repositories: `claude plugin add` (does not exist) replaced by `claude plugin install name@marketplace` with the right marketplace names; `npx ui-skills add` replaced by `npx ui-skills get`; the Figma desktop endpoint moved from `/sse` to `/mcp`; Chrome DevTools MCP attributed to Google with the `chrome-devtools-mcp` package; `uipro-cli` replaced by `ui-ux-pro-max-cli`; `npx add-skill` replaced by `npx skills add`.
- Tools without a marketplace manifest (Design Motion Principles, Three.js Skills, Stitch Skills, PinMe) are listed as skills or CLIs rather than plugins.

[1.0.0]: https://github.com/Nexus-Conseil/Claude-Code-Frontend-Design-Toolkit/releases/tag/frontend-design-toolkit--v1.0.0

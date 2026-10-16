# Contributing

Two kinds of contribution are welcome: new tools for the catalog, and improvements to the plugin's skills, agents and hook.

## Adding a tool to the catalog

1. Append an object to `tools` in `catalog/catalog.json`. Every field is required; use `null` for `docs` and `stars` when unknown and `[]` for `install` when the tool is a manual copy. The shape is documented in `catalog/schema.json` and in `skills/toolkit-catalog/SKILL.md`.
2. Install commands must be ones that exist today. `claude plugin install <name>@<marketplace>` needs a preceding `claude plugin marketplace add <owner/repo>` unless the marketplace is `claude-plugins-official`. Verify the marketplace name in the repo's `.claude-plugin/marketplace.json`. The validator rejects the commands that were wrong in earlier versions of this list (`claude plugin add`, `npx ui-skills add`, the Figma `/sse` endpoint, and a few more).
3. If the tool belongs in a stack, add its id to `catalog/stacks.json`.
4. Regenerate the README tables and run the checks:

   ```bash
   npm run render
   npm run check
   ```

5. Add a paragraph to the matching section of `README.md` if the tool deserves prose. The quick-reference table and the stacks section are generated; do not edit between the `<!-- catalog:…:start/end -->` markers.

Inclusion criteria: specifically useful for frontend or design work, works with Claude Code, maintained or from a trusted source. A high star count or official backing helps but is not required.

## Changing skills, agents or the hook

- Skills live in `skills/<name>/SKILL.md`. The front-matter `name` must equal the directory name. Keep `description` specific and trigger-oriented (it is what Claude matches against) and the file under 500 lines.
- Slash-style skills set `disable-model-invocation: true` and pre-approve only narrow `Bash(cmd:*)` patterns.
- Agents live in `agents/<name>.md` and must not have `Write` or `Edit` in their tool list; they review, they do not change files.
- The hook script `hooks/scripts/detect-frontend.sh` is POSIX `sh`, no dependencies beyond `grep`, `head` and `sed`. Add a fixture under `tests/fixtures/` for every new detection.
- Run `npm run check`, then `claude plugin validate --strict .` if you have the CLI, then try it live with `claude --plugin-dir .` from any frontend project.

## Evals

`evals/` holds cases for `claude plugin eval .`. Each case is a `prompt.md` plus `graders/*.md`. Add a case when you add a capability; keep graders strict enough to fail without the plugin (the eval runs a no-plugin baseline arm by default). Running evals costs API credits, so CI does not run them; run them locally before a release:

```bash
claude plugin eval . --trust-plugin --runs 1
```

## Releasing

1. Bump `version` in `.claude-plugin/plugin.json`, the matching entry in `.claude-plugin/marketplace.json`, and `package.json`.
2. Update `CHANGELOG.md`.
3. `npm run check` and `claude plugin validate --strict .`.
4. Tag with `claude plugin tag .` (it checks that both manifests agree) and push the tag.

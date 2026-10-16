---
name: theme
description: Lock a site-wide visual direction for this project by writing a CLAUDE.md theme block and, when wanted, a Tailwind v4 / CSS design-token file derived from one brand hue.
argument-hint: "[direction, e.g. editorial | brutalist | dark-oled | solarpunk | custom brief]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Edit Write Bash(grep:*) Bash(ls:*)
---

# Lock the theme

Direction requested: `$ARGUMENTS` (may be empty).

Apply the site-theming and design-direction skills. The output of this skill is a change to files in the project, shown as a diff before it is written.

## 1. Discover

- Find `CLAUDE.md` (project root, then `.claude/CLAUDE.md`). Does it already contain `## Frontend Theme` or an `<always_use_*_theme>` block? If yes, this skill *edits* that block; it never adds a second.
- Find existing tokens: `tailwind.config.{js,ts}`, any CSS with `@theme`, `:root {` with `--color` or `--brand` variables, shadcn `components.json`. Note the file path; the theme block must name it.
- Detect the stack (Tailwind version, shadcn, CSS Modules, styled-components) from `package.json`.
- Collect visible brand signals: logo colors in `public/`, an existing primary color literal used most often (`grep -rEoh '#[0-9a-fA-F]{6}' src | sort | uniq -c | sort -rn | head -5`), font imports.

## 2. Decide the direction

- If `$ARGUMENTS` names a direction from the design-direction table, use it.
- If `$ARGUMENTS` is a free brief ("calm fintech, trustworthy, dark"), translate it into one named direction plus two or three adjustments, and say which.
- If empty: propose **one** direction that fits the product signals and ask the user to confirm or name another, in a single question. Do not offer a menu of ten.

## 3. Produce

**A. The CLAUDE.md block** (always). Follow the site-theming template: heading `## Frontend Theme`, a `<always_use_<slug>_theme>` tag, five to eight directives covering type, color (with the brand hue number), layout and shape, motion, and the token file path plus the "never hardcode" rule.

**B. The token file** (when the project has Tailwind v4 or plain CSS and no token system yet, or when the user asks). Use the single-hue OKLCH `@theme` template from site-theming, with the hue derived from the dominant brand color found in step 1 (convert hex to OKLCH hue; state the number). For Tailwind v3, write CSS variables plus the `theme.extend` mapping. For shadcn, map onto shadcn's variable names in `:root` and `.dark` and do not rename them.

**C. Dark mode** tokens in the same file, as a designed second palette.

## 4. Apply

1. Show the full CLAUDE.md block and the token file as they will be written.
2. Write them: edit the existing block in place, or append the block at the end of `CLAUDE.md` (create the file if missing). Create the token file at the stack's conventional path (`src/styles/tokens.css`, `app/globals.css`, or next to the existing global stylesheet) and import it where the global CSS is loaded if it is new.
3. Do not touch components in this skill. Finish with the two or three next steps: replace literals role by role, add the lint guard, run `/frontend-design-toolkit:design-review` on the main page.

Keep the block honest: if the direction forbids gradients, do not emit a gradient token.

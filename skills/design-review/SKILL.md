---
name: design-review
description: Review a page, component or screenshot against the anti-slop checklist, the project's theme block and the polish loop, and return prioritised fixes with code pointers.
argument-hint: "[path, glob, URL or 'changed']"
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash(git diff:*) Bash(git status:*) Agent
context: fork
agent: frontend-design-toolkit:design-reviewer
---

# Design review

Scope: `$ARGUMENTS`. Interpret it as:

- a file path or glob: review those files;
- `changed` or empty: review the files touched in `git diff --name-only HEAD` plus untracked UI files (`git status --porcelain`), limited to `.tsx .jsx .vue .svelte .astro .html .css .scss`;
- a URL: review it through the browser if Playwright or Chrome DevTools MCP is available, otherwise say the URL cannot be opened and ask for the source files.

Follow the design-reviewer agent's procedure: load the project's theme block from `CLAUDE.md` as the standard, apply the design-direction slop checklist, then the ui-polish-loop passes (craft, accessibility, motion and performance), and return the findings ranked by severity with file and line references and a concrete fix for each. Finish with the three fixes that would most change how the page reads, and nothing the user did not ask for.

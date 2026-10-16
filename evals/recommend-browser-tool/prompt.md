---
name: recommend-browser-tool
description: Asking which tool lets Claude see the UI should surface Playwright (MCP or CLI) with a correct install command and a word on context cost.
tags: [catalog, testing]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---
I'm building a Next.js app with Claude Code and it keeps telling me the UI "looks good" without ever seeing it. Which tool should I add so it can actually open the page, click around and take screenshots? Give me the exact install command.

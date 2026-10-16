---
name: pick-direction
description: Claude should commit to a named visual direction and tokens before writing a landing page, and avoid default AI-slop patterns.
tags: [design, direction]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
expected_outcome: A one-sentence direction, a short token block, then the page markup, with no purple gradient and no three-identical-cards layout.
---
Write the HTML and CSS for a landing page for "Ledgerline", a bookkeeping app for freelance photographers. Hero, a section explaining three benefits, and a call to action. Return everything in your reply; do not write files.

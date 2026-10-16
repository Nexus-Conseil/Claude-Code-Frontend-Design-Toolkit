---
type: llm
weight: 2
---
PASS if the response explains that MCP tool schemas load at session start and consume context, gives at least two approximate per-server token figures (for example Playwright around 5k, Chrome DevTools 5 to 6k, Figma 3 to 4k, Context7 around 2k), recommends keeping roughly three to five servers active, AND names at least one concrete mechanism: scoping servers to a project (`--scope project` or `.mcp.json`), disabling via `/mcp` or `claude mcp remove`, or replacing Playwright MCP with `@playwright/cli`.

FAIL if it gives only generic advice ("remove what you don't need") with no numbers and no mechanism, or suggests adding more servers.

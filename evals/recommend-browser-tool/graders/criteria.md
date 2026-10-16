---
type: llm
weight: 2
---
PASS if the response recommends Playwright (the MCP server or the @playwright/cli) as the primary answer, gives an install command that matches one of these forms: `claude mcp add playwright -s user -- npx @playwright/mcp@latest`, `claude plugin install playwright@claude-plugins-official`, or `npm install -g @playwright/cli@latest` followed by `playwright-cli install --skills`, AND mentions either the context/token cost of the MCP server or the lighter CLI alternative.

FAIL if it invents a command such as `claude plugin add ...`, recommends a tool that cannot drive a browser, or gives no concrete command.

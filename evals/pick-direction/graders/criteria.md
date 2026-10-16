---
type: llm
weight: 2
---
PASS if the response, before or alongside the code, states one named visual direction in a sentence (for example "Editorial", "Swiss minimalism", "Dark OLED luxury", or an equally specific custom direction), AND defines colors and type as CSS custom properties or a Tailwind @theme block that the markup then uses, AND the three benefits are not laid out as three identical icon-title-text cards, AND there is no purple or blue-to-purple gradient, AND the display font is not Inter, Roboto or a bare system-ui stack unless the response explicitly justifies that choice.

FAIL if the response jumps straight into generic markup, uses hardcoded hex colors throughout with no token layer, or shows two or more of the slop patterns above without justification.

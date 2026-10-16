---
type: llm
weight: 2
---
PASS if the response contains a `## Frontend Theme` heading followed by a tag of the form `<always_use_<something>_theme>` ... `</always_use_<something>_theme>`, with between four and nine directive lines that cover type, color, layout or shape, and motion, AND names the token file path `src/styles/tokens.css`, AND states a rule against hardcoding values. The directives must fit a brutalist direction (system or mono type, visible borders, no rounded corners, loud color, or similar).

FAIL if the block has no tag, is a long essay rather than directives, omits the token file, or describes a soft, rounded, gradient-heavy style.

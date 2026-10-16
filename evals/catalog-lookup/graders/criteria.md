---
type: llm
weight: 2
---
PASS if the response names "Design Motion Principles" by kylezantos as the answer, gives the install command `npx skills add kylezantos/design-motion-principles` (a manual copy into ~/.claude/skills is also acceptable), and mentions it reviews existing code (for example conditional renders without AnimatePresence).

FAIL if it invents a tool, gives a `claude plugin install` command for this skill (it has no marketplace), or answers only with generic advice about adding animations.

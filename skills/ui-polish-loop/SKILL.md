---
name: ui-polish-loop
description: Finish a generated page properly with a fixed sequence of passes (craft and spacing, accessibility, motion and performance) and a browser check, so UI is verified rather than assumed. Use after generating or materially changing a page, screen or component, or when the user says "polish", "QA the UI", "make sure it works", "check accessibility", "it looks off", "finishing touches" or "before I ship".
---

# The polish loop

Generating the page is a quarter of the job. The rest is a fixed sequence, in this order, because each pass assumes the previous one is done:

```
1. Direction + build      -> the page exists and follows the theme tokens
2. Baseline craft         -> spacing, type, alignment, states
3. Accessibility          -> keyboard, labels, focus, semantics, contrast
4. Motion + performance   -> reduced motion, budgets, layout stability
5. Browser verification   -> look at it, click it, measure it
```

If the external skills from the catalog are installed, each pass maps to one slash command: `/baseline-ui`, `/fixing-accessibility`, `/fixing-motion-performance` (install with `npx ui-skills get <name>`, see `${CLAUDE_PLUGIN_ROOT}/catalog/catalog.json`). When they are not installed, run the checklists below by hand. Do not skip a pass because the tool is missing.

## Pass 2: baseline craft

- Spacing comes from the scale (4px grid). No 13px, 18px, 22px gaps.
- Vertical rhythm: section padding is consistent and larger than inner gaps; related items sit closer than unrelated ones.
- Alignment: text baselines, icon centers and edges line up across a row. Optical alignment beats mathematical for icons next to text.
- Type: one scale, display sizes tracked tighter, measure 45 to 75 characters, no orphan single-word last lines in headlines (use `text-wrap: balance`).
- Every interactive element has distinct `hover`, `focus-visible`, `active`, `disabled` and, where relevant, `loading` states.
- Empty, loading and error states exist for every data view.
- Images have explicit aspect ratios; nothing jumps when they load.
- Dark mode (if present) is a designed palette, not an inversion. Check borders and shadows especially.

## Pass 3: accessibility

- Tab through the whole page. Order is logical, focus is always visible, nothing is a trap.
- Every control has an accessible name: visible label, `aria-label`, or `aria-labelledby`. Icon-only buttons are the usual offenders.
- Landmarks: one `main`, `nav`, `header`, `footer`; headings form an outline without skipped levels.
- Contrast: 4.5:1 body, 3:1 large text and UI boundaries. Check the accent on its foreground, and placeholder text.
- Forms: inputs tied to labels, errors announced and associated (`aria-describedby`), required fields marked in more than color.
- Motion: everything that moves respects `prefers-reduced-motion`.
- Touch targets at least 24x24 CSS px (44x44 preferred on mobile).
- Run an automated pass (axe through Playwright, or Lighthouse) and fix everything it flags; then do the manual keyboard run, which automation cannot replace.

## Pass 4: motion and performance

- Animate only `transform` and `opacity`; no animating `width`, `height`, `top`, `left`, `box-shadow`.
- Durations: 120 to 200ms for micro-interactions, 200 to 400ms for panels, nothing above 600ms except deliberate cinematic moments the direction calls for.
- Entrance animations do not block content; `AnimatePresence` or equivalent for conditional UI that should not pop.
- `prefers-reduced-motion: reduce` turns motion into instant state changes, not slower motion.
- Core Web Vitals targets: LCP under 2.5s, INP under 200ms, CLS under 0.1. Measure with Chrome DevTools MCP, Lighthouse, or `@playwright/cli` with DevTools caps.
- Fonts: `font-display: swap`, preloaded display face, subset if self-hosted.
- Images: modern formats, `srcset`, lazy-load below the fold, never lazy-load the LCP image.
- Bundle: motion libraries tree-shaken (`LazyMotion` for Motion), no full icon packs, no moment.js-class dependencies for one function.

## Pass 5: browser verification

Claude cannot see the UI without a browser. Use whichever is available, in this order of preference:

1. **Playwright MCP** (`browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_click`): walk the primary flow, screenshot each state at 390px and 1280px widths, read the accessibility snapshot.
2. **`@playwright/cli`** from Bash when the MCP is not loaded: same checks at a fraction of the token cost.
3. **Chrome DevTools MCP** for console errors, failed network requests, a performance trace and Core Web Vitals.
4. Plain `curl` and a static HTML check as a last resort; say explicitly that the UI was not viewed.

Report what was verified, at which widths, and what was not. "Looks good" without a screenshot or snapshot is not a verification.

## The division of labour

```
DEVELOP  -> the editor and this plugin's skills
TEST     -> Playwright MCP or @playwright/cli (E2E, cross-browser)
DEBUG    -> Chrome DevTools MCP (performance, network, console)
VERIFY   -> screenshots and accessibility snapshots in the final report
```

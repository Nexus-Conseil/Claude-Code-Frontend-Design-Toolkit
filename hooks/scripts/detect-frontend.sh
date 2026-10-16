#!/bin/sh
# SessionStart hook for the Frontend Design Toolkit plugin.
#
# Looks at the project's package.json and a few well-known files, and when the
# project is a frontend project it hands Claude one short context note: which
# stack was detected, whether CLAUDE.md already locks a visual direction, and
# which plugin command to reach for. When nothing frontend-ish is found it
# prints nothing, so unrelated projects never see it.
#
# No dependencies beyond POSIX sh, grep and head. Set FDT_HOOK_DISABLED=1 to
# silence it entirely.
set -u

[ "${FDT_HOOK_DISABLED:-0}" = "1" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
pkg="$root/package.json"
[ -f "$pkg" ] || exit 0

# Read at most 256 KiB so a pathological package.json cannot stall the session.
manifest=$(head -c 262144 "$pkg" 2>/dev/null) || exit 0
[ -n "$manifest" ] || exit 0

# has_dep NAME -> true when "NAME": appears as a key (dependencies or devDependencies).
has_dep() {
  printf '%s' "$manifest" | grep -Eq "\"$1\"[[:space:]]*:"
}

frameworks=""
add() { frameworks="${frameworks:+$frameworks, }$1"; }

# Meta-frameworks first so the note reads "Next.js + React", not the reverse.
has_dep next && add "Next.js"
has_dep nuxt && add "Nuxt"
has_dep @remix-run/react && add "Remix"
has_dep @sveltejs/kit && add "SvelteKit"
has_dep astro && add "Astro"
has_dep @angular/core && add "Angular"
has_dep solid-js && add "SolidJS"
has_dep react && add "React"
has_dep vue && add "Vue"
has_dep svelte && add "Svelte"
has_dep react-native && add "React Native"

styling=""
adds() { styling="${styling:+$styling, }$1"; }
has_dep tailwindcss && adds "Tailwind"
has_dep @tailwindcss/vite && adds "Tailwind"
has_dep styled-components && adds "styled-components"
has_dep @emotion/react && adds "Emotion"
has_dep @chakra-ui/react && adds "Chakra UI"
has_dep @mui/material && adds "MUI"
has_dep @radix-ui/themes && adds "Radix Themes"
has_dep shadcn && adds "shadcn/ui"
[ -f "$root/components.json" ] && adds "shadcn/ui"

motion=""
addm() { motion="${motion:+$motion, }$1"; }
has_dep motion && addm "Motion"
has_dep framer-motion && addm "Framer Motion"
has_dep gsap && addm "GSAP"
has_dep three && addm "Three.js"
has_dep @react-three/fiber && addm "React Three Fiber"

# Nothing frontend-ish: stay silent.
[ -n "$frameworks$styling$motion" ] || exit 0

# Does CLAUDE.md already lock a visual direction?
theme_note="no theme block in CLAUDE.md yet"
for f in "$root/CLAUDE.md" "$root/.claude/CLAUDE.md"; do
  if [ -f "$f" ] && grep -Eiq '(## *Frontend Theme|<always_use_[a-z0-9_]+_theme>|design tokens|brand[- ]hue)' "$f"; then
    theme_note="CLAUDE.md already carries a theme block"
    break
  fi
done

# Is a browser available to Claude (Playwright / Chrome DevTools MCP) at project scope?
browser_note="no browser MCP in .mcp.json"
if [ -f "$root/.mcp.json" ] && grep -Eiq 'playwright|chrome-devtools' "$root/.mcp.json"; then
  browser_note="browser MCP configured"
fi

detected="$frameworks"
[ -n "$styling" ] && detected="${detected:+$detected; }styling: $styling"
[ -n "$motion" ] && detected="${detected:+$detected; }motion: $motion"

# Dedupe "Tailwind, Tailwind" when both tailwindcss and @tailwindcss/vite are present.
detected=$(printf '%s' "$detected" | sed 's/Tailwind, Tailwind/Tailwind/')

# Strip characters that would break the JSON string. Dependency names are
# already constrained, but CLAUDE_PROJECT_DIR is not echoed, so only quotes
# and backslashes need care.
msg="Frontend Design Toolkit: detected $detected. Setup: $theme_note; $browser_note. Before building UI, pick a visual direction (the design-direction skill applies). Commands: /frontend-design-toolkit:audit to check the setup, /frontend-design-toolkit:theme to lock a site-wide aesthetic, /frontend-design-toolkit:recommend to pick a stack."
msg=$(printf '%s' "$msg" | sed 's/\\/\\\\/g; s/"/\\"/g')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$msg"
exit 0

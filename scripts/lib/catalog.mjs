// Loading, validation and rendering for catalog/catalog.json and catalog/stacks.json.
// Pure functions where possible so the test suite can feed them fixtures.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const KINDS = ['skill', 'plugin', 'mcp', 'lsp', 'cli', 'config', 'feature', 'collection', 'service'];
export const TOOL_FIELDS = ['id', 'name', 'section', 'kind', 'author', 'summary', 'install', 'requires', 'source', 'docs', 'stars', 'tags', 'notes'];

// Commands and strings that were wrong in the original README and must never
// come back. Each entry: a regex and the reason it is rejected.
export const FORBIDDEN_PATTERNS = [
  { pattern: /claude plugin add\b/, reason: '`claude plugin add` does not exist; use `claude plugin install <name>@<marketplace>`' },
  { pattern: /npx ui-skills add\b/, reason: 'the ui-skills CLI has no `add` subcommand; use `npx ui-skills get <skill>`' },
  { pattern: /3845\/sse\b/, reason: 'the Figma desktop /sse endpoint is deprecated; use http://127.0.0.1:3845/mcp' },
  { pattern: /@anthropic-ai\/chrome-devtools-mcp/, reason: 'the package is `chrome-devtools-mcp` (Google), not an @anthropic-ai package' },
  { pattern: /\buipro-cli\b/, reason: '`uipro-cli` is stale; the current package is `ui-ux-pro-max-cli`' },
  { pattern: /npx add-skill\b/, reason: '`add-skill` is deprecated; use `npx skills add <owner/repo>`' },
];

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadCatalog(root) {
  return loadJson(join(root, 'catalog', 'catalog.json'));
}

export function loadStacks(root) {
  return loadJson(join(root, 'catalog', 'stacks.json'));
}

const isHttps = (v) => typeof v === 'string' && v.startsWith('https://');

export function validateCatalog(catalog) {
  const errors = [];
  const err = (m) => errors.push(m);

  if (!/^\d+\.\d+\.\d+$/.test(catalog.version ?? '')) err('version must be semver');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(catalog.updated ?? '')) err('updated must be YYYY-MM-DD');
  if (!Array.isArray(catalog.sections) || catalog.sections.length === 0) err('sections must be a non-empty array');
  if (!Array.isArray(catalog.tools) || catalog.tools.length === 0) err('tools must be a non-empty array');
  if (errors.length) return errors;

  const sectionIds = new Set();
  for (const s of catalog.sections) {
    if (!SLUG.test(s.id ?? '')) err(`section id "${s.id}" is not a slug`);
    if (sectionIds.has(s.id)) err(`duplicate section id "${s.id}"`);
    sectionIds.add(s.id);
    for (const f of ['title', 'tagline', 'blurb']) {
      if (typeof s[f] !== 'string' || !s[f].trim()) err(`section "${s.id}" is missing ${f}`);
    }
  }

  const toolIds = new Set();
  for (const t of catalog.tools) {
    const label = `tool "${t.id ?? '(no id)'}"`;
    for (const f of TOOL_FIELDS) if (!(f in t)) err(`${label} is missing field ${f}`);
    for (const f of Object.keys(t)) if (!TOOL_FIELDS.includes(f)) err(`${label} has unknown field ${f}`);
    if (!SLUG.test(t.id ?? '')) err(`${label}: id is not a slug`);
    if (toolIds.has(t.id)) err(`duplicate tool id "${t.id}"`);
    toolIds.add(t.id);
    if (!sectionIds.has(t.section)) err(`${label}: unknown section "${t.section}"`);
    if (!KINDS.includes(t.kind)) err(`${label}: kind "${t.kind}" not in ${KINDS.join('|')}`);
    if (typeof t.summary !== 'string' || t.summary.length < 20 || t.summary.length > 400) err(`${label}: summary must be 20 to 400 chars`);
    if (!Array.isArray(t.install) || t.install.some((c) => typeof c !== 'string' || !c.trim())) err(`${label}: install must be an array of commands`);
    if (!Array.isArray(t.requires)) err(`${label}: requires must be an array`);
    if (!isHttps(t.source)) err(`${label}: source must be an https URL`);
    if (!(t.docs === null || isHttps(t.docs))) err(`${label}: docs must be null or an https URL`);
    if (!(t.stars === null || (typeof t.stars === 'string' && t.stars.trim()))) err(`${label}: stars must be null or a non-empty string`);
    if (!Array.isArray(t.tags) || t.tags.length === 0 || t.tags.some((x) => !SLUG.test(x))) err(`${label}: tags must be a non-empty array of slugs`);
    if (typeof t.notes !== 'string') err(`${label}: notes must be a string`);

    const text = JSON.stringify(t);
    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      if (pattern.test(text)) err(`${label}: ${reason}`);
    }

    // A `claude plugin install x@mkt` needs its marketplace added first unless
    // the marketplace is the built-in official one.
    const installs = t.install.filter((c) => /^claude plugin install\s/.test(c));
    for (const c of installs) {
      const m = c.match(/@([A-Za-z0-9._-]+)\s*$/);
      if (!m) { err(`${label}: "${c}" must name its marketplace as name@marketplace`); continue; }
      if (m[1] === 'claude-plugins-official') continue;
      const idx = t.install.indexOf(c);
      const before = t.install.slice(0, idx);
      if (!before.some((b) => /^claude plugin marketplace add\s/.test(b))) {
        err(`${label}: "${c}" must be preceded by a "claude plugin marketplace add" command`);
      }
    }
  }

  // Tool-id references inside requires must resolve when they look like ids.
  for (const t of catalog.tools) {
    for (const r of t.requires ?? []) {
      if (SLUG.test(r) && !toolIds.has(r) && r.length > 3 && r.includes('-')) {
        err(`tool "${t.id}": requires "${r}" looks like a tool id but no such tool exists`);
      }
    }
  }

  for (const r of catalog.resources ?? []) {
    if (typeof r.title !== 'string' || !r.title.trim()) err('resource without title');
    if (!isHttps(r.url)) err(`resource "${r.title}" needs an https url`);
  }

  // Every section should have at least one tool.
  for (const id of sectionIds) {
    if (!catalog.tools.some((t) => t.section === id)) err(`section "${id}" has no tools`);
  }

  return errors;
}

export function validateStacks(stacksFile, catalog) {
  const errors = [];
  const toolIds = new Set(catalog.tools.map((t) => t.id));
  if (!Array.isArray(stacksFile.stacks) || stacksFile.stacks.length === 0) return ['stacks must be a non-empty array'];
  const ids = new Set();
  for (const s of stacksFile.stacks) {
    const label = `stack "${s.id}"`;
    if (!SLUG.test(s.id ?? '')) errors.push(`${label}: id is not a slug`);
    if (ids.has(s.id)) errors.push(`duplicate stack id "${s.id}"`);
    ids.add(s.id);
    for (const f of ['name', 'for']) if (typeof s[f] !== 'string' || !s[f].trim()) errors.push(`${label}: missing ${f}`);
    if (!Array.isArray(s.tools) || s.tools.length === 0) errors.push(`${label}: tools must be a non-empty array`);
    for (const t of s.tools ?? []) if (!toolIds.has(t)) errors.push(`${label}: unknown tool id "${t}"`);
    if (new Set(s.tools ?? []).size !== (s.tools ?? []).length) errors.push(`${label}: duplicate tool ids`);
    if (!(s.claudeMd === null || typeof s.claudeMd === 'string')) errors.push(`${label}: claudeMd must be null or a string`);
  }
  return errors;
}

export function toolsById(catalog) {
  return Object.fromEntries(catalog.tools.map((t) => [t.id, t]));
}

// Expand a stack into its ordered, de-duplicated command list plus the tools
// that need a manual install.
export function expandStack(stack, catalog) {
  const byId = toolsById(catalog);
  const seen = new Set();
  const commands = [];
  const manual = [];
  for (const id of stack.tools) {
    const tool = byId[id];
    if (!tool) continue;
    if (tool.install.length === 0) { manual.push(tool); continue; }
    for (const c of tool.install) {
      if (seen.has(c)) continue;
      seen.add(c);
      commands.push({ tool: tool.name, command: c });
    }
  }
  return { commands, manual };
}

const KIND_LABEL = { skill: 'Skill', plugin: 'Plugin', mcp: 'MCP', lsp: 'LSP', cli: 'CLI', config: 'Config', feature: 'Feature', collection: 'Collection', service: 'Service' };

function setupLabel(tool) {
  if (tool.install.length === 0) return tool.kind === 'config' ? 'Copy-paste' : 'Manual';
  if (tool.install.length === 1) return 'One command';
  return `${tool.install.length} commands`;
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|');
}

export function renderQuickReference(catalog) {
  const sectionTitle = Object.fromEntries(catalog.sections.map((s) => [s.id, s.title]));
  const lines = [
    '| Tool | Type | Category | Stars | Setup |',
    '|------|------|----------|-------|-------|',
  ];
  for (const s of catalog.sections) {
    for (const t of catalog.tools.filter((x) => x.section === s.id)) {
      lines.push(`| [${escapeCell(t.name)}](${t.source}) | ${KIND_LABEL[t.kind]} | ${escapeCell(sectionTitle[t.section])} | ${t.stars ?? '—'} | ${setupLabel(t)} |`);
    }
  }
  return lines.join('\n');
}

export function renderStacks(catalog, stacksFile) {
  const out = [];
  for (const s of stacksFile.stacks) {
    const { commands, manual } = expandStack(s, catalog);
    out.push(`### ${s.name} (\`${s.id}\`)`, '', s.for, '', '```bash');
    let lastTool = null;
    for (const { tool, command } of commands) {
      if (tool !== lastTool) { out.push(`# ${tool}`); lastTool = tool; }
      out.push(command);
    }
    out.push('```');
    if (manual.length) {
      out.push('', `Manual: ${manual.map((t) => `[${t.name}](${t.source})`).join(', ')}`);
    }
    if (s.claudeMd) {
      out.push('', 'Add to CLAUDE.md:', '', '```markdown', s.claudeMd.trimEnd(), '```');
    }
    out.push('', `Or in one go: \`/frontend-design-toolkit:install ${s.id}\``, '');
  }
  return out.join('\n').trimEnd();
}

// Replace the text between two HTML comment markers. Throws when a marker is missing.
export function replaceBetweenMarkers(text, name, replacement) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const i = text.indexOf(start);
  const j = text.indexOf(end);
  if (i === -1 || j === -1 || j < i) throw new Error(`markers for "${name}" not found or out of order`);
  return `${text.slice(0, i + start.length)}\n${replacement}\n${text.slice(j)}`;
}

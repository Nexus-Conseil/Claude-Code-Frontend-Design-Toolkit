#!/usr/bin/env node
// Validates the plugin end to end without the Claude Code CLI:
// manifests, catalog, stacks, skills, agents, hooks and cross-references.
// Exit 1 with a list of problems, exit 0 when clean.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN_PATTERNS, loadCatalog, loadJson, loadStacks, validateCatalog, validateStacks } from './lib/catalog.mjs';
import { parseFrontmatter } from './lib/frontmatter.mjs';

export const PLUGIN_NAME = 'frontend-design-toolkit';

export function listSkills(root) {
  const dir = join(root, 'skills');
  return readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory()).sort();
}

export function listAgents(root) {
  return readdirSync(join(root, 'agents')).filter((f) => f.endsWith('.md')).sort();
}

export function validatePlugin(root) {
  const errors = [];
  const err = (m) => errors.push(m);

  // Manifests
  const manifest = loadJson(join(root, '.claude-plugin', 'plugin.json'));
  const marketplace = loadJson(join(root, '.claude-plugin', 'marketplace.json'));
  if (manifest.name !== PLUGIN_NAME) err(`plugin.json name must be ${PLUGIN_NAME}`);
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? '')) err('plugin.json version must be semver');
  if (typeof manifest.description !== 'string' || manifest.description.length < 40) err('plugin.json description too short');
  try { new URL(manifest.homepage); } catch { err('plugin.json homepage must be a URL'); }
  if (!manifest.author?.name) err('plugin.json author.name missing');
  if (manifest.license !== 'MIT') err('plugin.json license must be MIT (matches LICENSE)');
  const entry = marketplace.plugins?.find((p) => p.name === PLUGIN_NAME);
  if (!entry) err(`marketplace.json has no entry for ${PLUGIN_NAME}`);
  else {
    if (entry.version !== manifest.version) err(`marketplace entry version ${entry.version} differs from plugin.json ${manifest.version}`);
    if (!['./', '.'].includes(entry.source)) err('marketplace entry source must be "./" (plugin at repo root)');
  }
  if (!marketplace.owner?.name) err('marketplace.json owner.name missing');

  // Catalog
  const catalog = loadCatalog(root);
  const stacks = loadStacks(root);
  for (const e of validateCatalog(catalog)) err(`catalog: ${e}`);
  for (const e of validateStacks(stacks, catalog)) err(`stacks: ${e}`);

  // Skills
  const skills = listSkills(root);
  const skillNames = new Set();
  for (const dir of skills) {
    const path = join(root, 'skills', dir, 'SKILL.md');
    if (!existsSync(path)) { err(`skills/${dir}: SKILL.md missing`); continue; }
    const text = readFileSync(path, 'utf8');
    const { data, body } = parseFrontmatter(text);
    if (!data) { err(`skills/${dir}: no front matter`); continue; }
    if (data.name !== dir) err(`skills/${dir}: front matter name "${data.name}" must equal the directory name`);
    if (typeof data.description !== 'string' || data.description.length < 60) err(`skills/${dir}: description too short to trigger reliably`);
    if (data.description && data.description.length > 1024) err(`skills/${dir}: description over 1024 chars`);
    if (text.split('\n').length > 500) err(`skills/${dir}: SKILL.md over 500 lines`);
    if (!body.trim()) err(`skills/${dir}: empty body`);
    skillNames.add(dir);
    checkText(`skills/${dir}/SKILL.md`, text, root, err);
    if (data['disable-model-invocation'] === true && !data['argument-hint'] && !['audit'].includes(dir)) {
      // Not an error, slash skills usually take arguments; audit is the exception by design.
    }
  }

  // Agents
  const agentNames = new Set();
  for (const file of listAgents(root)) {
    const text = readFileSync(join(root, 'agents', file), 'utf8');
    const { data, body } = parseFrontmatter(text);
    if (!data) { err(`agents/${file}: no front matter`); continue; }
    if (data.name !== file.replace(/\.md$/, '')) err(`agents/${file}: name must match file name`);
    if (typeof data.description !== 'string' || data.description.length < 40) err(`agents/${file}: description too short`);
    if (!body.trim()) err(`agents/${file}: empty system prompt`);
    if (data.tools && !Array.isArray(data.tools)) err(`agents/${file}: tools should be a list`);
    agentNames.add(data.name);
    checkText(`agents/${file}`, text, root, err);
  }

  // Cross references: /frontend-design-toolkit:<skill> and agent: frontend-design-toolkit:<agent>
  const allText = [...skills.map((d) => readFileSync(join(root, 'skills', d, 'SKILL.md'), 'utf8')), ...listAgents(root).map((f) => readFileSync(join(root, 'agents', f), 'utf8'))].join('\n');
  for (const m of allText.matchAll(new RegExp(`/${PLUGIN_NAME}:([a-z0-9-]+)`, 'g'))) {
    if (!skillNames.has(m[1])) err(`reference to /${PLUGIN_NAME}:${m[1]} but no such skill`);
  }
  for (const m of allText.matchAll(new RegExp(`agent:\\s*${PLUGIN_NAME}:([a-z0-9-]+)`, 'g'))) {
    if (!agentNames.has(m[1])) err(`reference to agent ${PLUGIN_NAME}:${m[1]} but no such agent`);
  }

  // Hooks
  const hooksPath = join(root, 'hooks', 'hooks.json');
  const hooks = loadJson(hooksPath);
  if (!hooks.hooks || typeof hooks.hooks !== 'object') err('hooks.json must wrap events in a top-level "hooks" key');
  for (const [event, groups] of Object.entries(hooks.hooks ?? {})) {
    if (!Array.isArray(groups)) { err(`hooks.json: ${event} must be an array`); continue; }
    for (const g of groups) {
      for (const h of g.hooks ?? []) {
        if (h.type !== 'command') err(`hooks.json: ${event} hook type must be "command"`);
        const m = (h.command ?? '').match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^"' ]+)/);
        if (!m) err(`hooks.json: ${event} command must reference \${CLAUDE_PLUGIN_ROOT}/…`);
        else if (!existsSync(join(root, m[1]))) err(`hooks.json: ${event} script ${m[1]} does not exist`);
        else if (!(statSync(join(root, m[1])).mode & 0o111)) err(`hooks.json: ${m[1]} is not executable`);
        if (typeof h.timeout === 'number' && h.timeout > 30) err(`hooks.json: ${event} timeout ${h.timeout}s is too long for a session-start hook`);
      }
    }
  }

  // No CLAUDE.md at plugin root (not loaded; validator warns)
  if (existsSync(join(root, 'CLAUDE.md'))) err('CLAUDE.md at the plugin root is not loaded by Claude Code; move its content into a skill');

  // README must carry the install line the official validator asks for
  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  if (!readme.includes(`/plugin install ${PLUGIN_NAME} --marketplace Nexus-Conseil/Claude-Code-Frontend-Design-Toolkit`)) {
    err('README.md must contain the one-step install line (/plugin install … --marketplace owner/repo)');
  }
  checkText('README.md', readme, root, err);

  return errors;
}

function checkText(label, text, root, err) {
  for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) err(`${label}: ${reason}`);
  }
  // Every ${CLAUDE_PLUGIN_ROOT}/path reference must exist in the repo.
  for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]+)/g)) {
    if (!existsSync(join(root, m[1]))) err(`${label}: references \${CLAUDE_PLUGIN_ROOT}/${m[1]} which does not exist`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const errors = validatePlugin(root);
  if (errors.length) {
    console.error(`✗ ${errors.length} problem(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('✓ plugin, catalog, stacks, skills, agents and hooks are consistent.');
}

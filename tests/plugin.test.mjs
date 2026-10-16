import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './helpers.mjs';
import { listAgents, listSkills, validatePlugin, PLUGIN_NAME } from '../scripts/validate.mjs';
import { parseFrontmatter } from '../scripts/lib/frontmatter.mjs';

describe('plugin structure', () => {
  test('the whole plugin passes the local validator', () => {
    assert.deepEqual(validatePlugin(root), []);
  });

  test('plugin.json and marketplace.json agree on name and version', () => {
    const manifest = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
    const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
    const entry = marketplace.plugins.find((p) => p.name === PLUGIN_NAME);
    assert.equal(manifest.name, PLUGIN_NAME);
    assert.equal(entry.version, manifest.version);
    assert.equal(marketplace.name, 'nexus-conseil');
  });

  test('ships the expected skills', () => {
    assert.deepEqual(listSkills(root), [
      'audit', 'catalog', 'context-budget', 'design-direction', 'design-review', 'install',
      'recommend', 'site-theming', 'theme', 'toolkit-catalog', 'ui-polish-loop',
    ]);
  });

  test('slash skills are user-only and knowledge skills are model-invocable', () => {
    const slash = ['audit', 'catalog', 'design-review', 'install', 'recommend', 'theme'];
    for (const dir of listSkills(root)) {
      const { data } = parseFrontmatter(readFileSync(join(root, 'skills', dir, 'SKILL.md'), 'utf8'));
      if (slash.includes(dir)) {
        assert.equal(data['disable-model-invocation'], true, `${dir} should be user-invoked only`);
      } else {
        assert.notEqual(data['disable-model-invocation'], true, `${dir} should auto-activate`);
      }
    }
  });

  test('skills that run shell commands pre-approve only narrow Bash patterns', () => {
    for (const dir of listSkills(root)) {
      const { data } = parseFrontmatter(readFileSync(join(root, 'skills', dir, 'SKILL.md'), 'utf8'));
      const allowed = Array.isArray(data['allowed-tools']) ? data['allowed-tools'] : String(data['allowed-tools'] ?? '').split(/\s+/);
      for (const tool of allowed) {
        assert.ok(tool !== 'Bash', `${dir}: bare Bash is pre-approved; scope it with Bash(cmd:*)`);
      }
    }
  });

  test('ships the two agents with system prompts and narrow tool lists', () => {
    assert.deepEqual(listAgents(root), ['design-reviewer.md', 'stack-advisor.md']);
    for (const f of listAgents(root)) {
      const { data, body } = parseFrontmatter(readFileSync(join(root, 'agents', f), 'utf8'));
      assert.ok(body.length > 500, `${f}: system prompt too short`);
      assert.ok(Array.isArray(data.tools) && data.tools.length <= 5, `${f}: tools list should be small`);
      assert.ok(!data.tools.includes('Write') && !data.tools.includes('Edit'), `${f}: review agents must not edit files`);
    }
  });

  test('design-review forks into the design-reviewer agent', () => {
    const { data } = parseFrontmatter(readFileSync(join(root, 'skills/design-review/SKILL.md'), 'utf8'));
    assert.equal(data.context, 'fork');
    assert.equal(data.agent, `${PLUGIN_NAME}:design-reviewer`);
  });

  test('hooks.json uses the wrapped shape and points at an existing executable script', () => {
    const hooks = JSON.parse(readFileSync(join(root, 'hooks/hooks.json'), 'utf8'));
    assert.ok(Array.isArray(hooks.hooks.SessionStart));
    const cmd = hooks.hooks.SessionStart[0].hooks[0].command;
    assert.match(cmd, /\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/scripts\/detect-frontend\.sh/);
    assert.ok(existsSync(join(root, 'hooks/scripts/detect-frontend.sh')));
  });

  test('the plugin ships no MCP servers of its own (context budget is a choice)', () => {
    assert.ok(!existsSync(join(root, '.mcp.json')));
    const manifest = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
    assert.equal(manifest.mcpServers, undefined);
  });

  test('every eval case has a prompt and at least one grader', () => {
    const evals = join(root, 'evals');
    const cases = readdirSync(evals, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'results').map((d) => d.name);
    assert.ok(cases.length >= 4, `only ${cases.length} eval cases`);
    for (const c of cases) {
      assert.ok(existsSync(join(evals, c, 'prompt.md')), `${c}: prompt.md missing`);
      const graders = readdirSync(join(evals, c, 'graders')).filter((f) => f.endsWith('.md'));
      assert.ok(graders.length >= 1, `${c}: no graders`);
      for (const g of graders) {
        const { data } = parseFrontmatter(readFileSync(join(evals, c, 'graders', g), 'utf8'));
        assert.ok(['llm', 'regex', 'tool_used', 'tool_order', 'file_exists', 'baseline'].includes(data.type), `${c}/${g}: unknown grader type ${data.type}`);
      }
    }
  });
});


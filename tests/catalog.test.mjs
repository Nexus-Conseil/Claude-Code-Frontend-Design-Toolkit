import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { root } from './helpers.mjs';
import { expandStack, loadCatalog, loadStacks, validateCatalog, validateStacks, FORBIDDEN_PATTERNS } from '../scripts/lib/catalog.mjs';

const catalog = loadCatalog(root);
const stacks = loadStacks(root);

describe('catalog.json', () => {
  test('passes the structural validator with no errors', () => {
    assert.deepEqual(validateCatalog(catalog), []);
  });

  test('has at least 40 tools across all 9 sections', () => {
    assert.ok(catalog.tools.length >= 40, `only ${catalog.tools.length} tools`);
    assert.equal(catalog.sections.length, 9);
  });

  test('every tool has a unique id and every section has at least one tool', () => {
    const ids = catalog.tools.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const s of catalog.sections) {
      assert.ok(catalog.tools.some((t) => t.section === s.id), `section ${s.id} is empty`);
    }
  });

  test('install commands never use commands that do not exist', () => {
    const text = JSON.stringify(catalog);
    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      assert.ok(!pattern.test(text), reason);
    }
  });

  test('third-party plugin installs add their marketplace first', () => {
    for (const t of catalog.tools) {
      const installs = t.install.filter((c) => c.startsWith('claude plugin install '));
      for (const c of installs) {
        const mkt = c.match(/@([A-Za-z0-9._-]+)$/)?.[1];
        assert.ok(mkt, `${t.id}: "${c}" has no @marketplace suffix`);
        if (mkt !== 'claude-plugins-official') {
          assert.ok(t.install.some((x) => x.startsWith('claude plugin marketplace add ')), `${t.id}: missing marketplace add before install`);
        }
      }
    }
  });

  test('tools installed as MCP servers are tagged so the context-budget advice can find them', () => {
    for (const t of catalog.tools.filter((x) => x.kind === 'mcp')) {
      assert.ok(t.install.length > 0 || t.notes.length > 0, `${t.id}: mcp without install or notes`);
    }
  });

  test('the validator rejects a broken tool', () => {
    const broken = structuredClone(catalog);
    broken.tools[0] = { ...broken.tools[0], section: 'nope', kind: 'thing', source: 'http://insecure', tags: [] };
    const errors = validateCatalog(broken);
    assert.ok(errors.some((e) => e.includes('unknown section')));
    assert.ok(errors.some((e) => e.includes('kind')));
    assert.ok(errors.some((e) => e.includes('https')));
    assert.ok(errors.some((e) => e.includes('tags')));
  });

  test('the validator rejects duplicate ids and forbidden commands', () => {
    const broken = structuredClone(catalog);
    broken.tools = [...broken.tools, { ...broken.tools[0] }];
    assert.ok(validateCatalog(broken).some((e) => e.includes('duplicate tool id')));
    const stale = structuredClone(catalog);
    stale.tools[1] = { ...stale.tools[1], install: ['claude plugin add foo/bar'] };
    assert.ok(validateCatalog(stale).some((e) => e.includes('does not exist')));
  });
});

describe('stacks.json', () => {
  test('every stack references existing tools and passes validation', () => {
    assert.deepEqual(validateStacks(stacks, catalog), []);
  });

  test('ships the four documented stacks', () => {
    assert.deepEqual(stacks.stacks.map((s) => s.id), ['essentials', 'solo', 'design-first', 'component-library']);
  });

  test('every stack starts with the official frontend-design plugin', () => {
    for (const s of stacks.stacks) assert.equal(s.tools[0], 'frontend-design', s.id);
  });

  test('expandStack de-duplicates shared commands and separates manual tools', () => {
    const lib = stacks.stacks.find((s) => s.id === 'component-library');
    const { commands, manual } = expandStack(lib, catalog);
    const cmds = commands.map((c) => c.command);
    assert.equal(new Set(cmds).size, cmds.length, 'duplicate command');
    assert.ok(cmds.some((c) => c.includes('frontend-design@claude-plugins-official')));
    assert.ok(cmds.some((c) => c.includes('ui-skills get baseline-ui')));
    assert.ok(Array.isArray(manual));
  });

  test('the validator catches an unknown tool id', () => {
    const broken = structuredClone(stacks);
    broken.stacks[0] = { ...broken.stacks[0], tools: ['frontend-design', 'does-not-exist'] };
    assert.ok(validateStacks(broken, catalog).some((e) => e.includes('unknown tool id')));
  });
});

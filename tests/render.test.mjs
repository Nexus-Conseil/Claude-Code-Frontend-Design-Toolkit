import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './helpers.mjs';
import { loadCatalog, loadStacks, renderQuickReference, renderStacks, replaceBetweenMarkers } from '../scripts/lib/catalog.mjs';
import { renderReadme } from '../scripts/render-quick-reference.mjs';

const catalog = loadCatalog(root);
const stacks = loadStacks(root);

describe('README generation', () => {
  test('README.md is up to date with the catalog (run `npm run render` if this fails)', () => {
    const readme = readFileSync(join(root, 'README.md'), 'utf8');
    assert.equal(renderReadme(readme, catalog, stacks), readme);
  });

  test('quick reference lists every tool exactly once, grouped by section order', () => {
    const table = renderQuickReference(catalog);
    const rows = table.split('\n').slice(2);
    assert.equal(rows.length, catalog.tools.length);
    const names = rows.map((r) => r.match(/^\| \[(.+?)\]\(/)[1].replace(/\\\|/g, '|'));
    assert.deepEqual(new Set(names).size, catalog.tools.length);
  });

  test('stacks render one bash block per stack with the install skill pointer', () => {
    const md = renderStacks(catalog, stacks);
    for (const s of stacks.stacks) {
      assert.ok(md.includes(`### ${s.name} (\`${s.id}\`)`));
      assert.ok(md.includes(`/frontend-design-toolkit:install ${s.id}`));
    }
    assert.equal((md.match(/```bash/g) ?? []).length, stacks.stacks.length);
    assert.ok(md.includes('## Figma Integration'), 'design-first CLAUDE.md snippet missing');
  });

  test('replaceBetweenMarkers swaps only the inner text and throws on missing markers', () => {
    const src = 'a\n<!-- x:start -->\nold\n<!-- x:end -->\nb';
    assert.equal(replaceBetweenMarkers(src, 'x', 'new'), 'a\n<!-- x:start -->\nnew\n<!-- x:end -->\nb');
    assert.throws(() => replaceBetweenMarkers(src, 'y', 'new'), /markers for "y"/);
  });

  test('rendering is deterministic', () => {
    assert.equal(renderQuickReference(catalog), renderQuickReference(catalog));
    assert.equal(renderStacks(catalog, stacks), renderStacks(catalog, stacks));
  });
});

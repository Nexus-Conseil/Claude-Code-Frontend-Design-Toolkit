#!/usr/bin/env node
// Regenerates the generated blocks of README.md from the catalog:
//   <!-- catalog:quick-reference:start --> … <!-- catalog:quick-reference:end -->
//   <!-- catalog:stacks:start -->          … <!-- catalog:stacks:end -->
//   <!-- catalog:stats:start -->           … <!-- catalog:stats:end -->
// Usage: node scripts/render-quick-reference.mjs [--check]
// --check exits 1 when README.md is out of date instead of rewriting it.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, loadStacks, renderQuickReference, renderStacks, replaceBetweenMarkers } from './lib/catalog.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = join(root, 'README.md');

export function renderReadme(readme, catalog, stacks) {
  const stats = `\`Catalog ${catalog.version}\` · \`updated ${catalog.updated}\` · \`${catalog.tools.length} tools\` · \`${catalog.sections.length} sections\` · \`${stacks.stacks.length} stacks\``;
  let out = replaceBetweenMarkers(readme, 'catalog:stats', stats);
  out = replaceBetweenMarkers(out, 'catalog:quick-reference', renderQuickReference(catalog));
  out = replaceBetweenMarkers(out, 'catalog:stacks', renderStacks(catalog, stacks));
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const readme = readFileSync(readmePath, 'utf8');
  const next = renderReadme(readme, loadCatalog(root), loadStacks(root));
  if (next === readme) {
    console.log('README.md is up to date.');
  } else if (check) {
    console.error('README.md is out of date. Run `npm run render`.');
    process.exit(1);
  } else {
    writeFileSync(readmePath, next);
    console.log('README.md regenerated.');
  }
}

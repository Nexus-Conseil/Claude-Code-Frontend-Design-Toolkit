import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../scripts/lib/frontmatter.mjs';

describe('parseFrontmatter', () => {
  test('parses scalars, block lists, flow lists and booleans', () => {
    const { data, body } = parseFrontmatter(`---
name: demo
description: "Quoted, with: colon"
tools:
  - Read
  - Grep
allowed_tools: [Read, Glob, Skill]
disable-model-invocation: true
---
Body line`);
    assert.equal(data.name, 'demo');
    assert.equal(data.description, 'Quoted, with: colon');
    assert.deepEqual(data.tools, ['Read', 'Grep']);
    assert.deepEqual(data.allowed_tools, ['Read', 'Glob', 'Skill']);
    assert.equal(data['disable-model-invocation'], true);
    assert.equal(body, 'Body line');
  });

  test('joins folded continuation lines into one string', () => {
    const { data } = parseFrontmatter(`---
description: first part
  second part
---
x`);
    assert.equal(data.description, 'first part second part');
  });

  test('returns null data when there is no front matter', () => {
    const { data, body } = parseFrontmatter('# Just markdown');
    assert.equal(data, null);
    assert.equal(body, '# Just markdown');
  });
});

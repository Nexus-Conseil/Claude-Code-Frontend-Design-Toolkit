import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { root, fixtures } from './helpers.mjs';

const script = join(root, 'hooks/scripts/detect-frontend.sh');

function run(fixture, env = {}) {
  const r = spawnSync('sh', [script], {
    env: { PATH: process.env.PATH, CLAUDE_PROJECT_DIR: join(fixtures, fixture), ...env },
    encoding: 'utf8',
  });
  return { ...r, json: r.stdout.trim() ? JSON.parse(r.stdout) : null };
}

describe('SessionStart hook: detect-frontend.sh', () => {
  test('emits valid hookSpecificOutput JSON for a Next.js + Tailwind project', () => {
    const { status, json } = run('next-tailwind');
    assert.equal(status, 0);
    assert.equal(json.hookSpecificOutput.hookEventName, 'SessionStart');
    const ctx = json.hookSpecificOutput.additionalContext;
    assert.match(ctx, /Next\.js, React/);
    assert.match(ctx, /styling: Tailwind(;|\.)/);
    assert.ok(!/Tailwind, Tailwind/.test(ctx), 'duplicate Tailwind label');
    assert.match(ctx, /motion: Motion/);
    assert.match(ctx, /no theme block/);
    assert.match(ctx, /no browser MCP/);
    assert.match(ctx, /\/frontend-design-toolkit:audit/);
  });

  test('reports an existing theme block and browser MCP', () => {
    const { json } = run('next-themed');
    const ctx = json.hookSpecificOutput.additionalContext;
    assert.match(ctx, /already carries a theme block/);
    assert.match(ctx, /browser MCP configured/);
  });

  test('detects a plain Vue project', () => {
    const { json } = run('vue-plain');
    assert.match(json.hookSpecificOutput.additionalContext, /detected Vue\./);
  });

  test('stays silent for a backend-only project', () => {
    const { status, stdout } = run('backend-only');
    assert.equal(status, 0);
    assert.equal(stdout, '');
  });

  test('stays silent when there is no package.json', () => {
    const { status, stdout } = run('empty');
    assert.equal(status, 0);
    assert.equal(stdout, '');
  });

  test('does not crash on a malformed package.json', () => {
    const { status, stdout } = run('malformed');
    assert.equal(status, 0);
    if (stdout.trim()) JSON.parse(stdout); // if it says anything, it must still be JSON
  });

  test('can be disabled with FDT_HOOK_DISABLED=1', () => {
    const { status, stdout } = run('next-tailwind', { FDT_HOOK_DISABLED: '1' });
    assert.equal(status, 0);
    assert.equal(stdout, '');
  });

  test('keeps the context note under the 10,000 character cap', () => {
    const { json } = run('next-tailwind');
    assert.ok(json.hookSpecificOutput.additionalContext.length < 1000);
  });
});

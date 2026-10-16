import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { root } from './helpers.mjs';

const hasClaude = spawnSync('claude', ['--version'], { encoding: 'utf8' }).status === 0;

describe('official validator (claude plugin validate)', { skip: !hasClaude && 'claude CLI not on PATH' }, () => {
  for (const target of ['.', '.claude-plugin/plugin.json', 'skills', 'agents']) {
    test(`\`claude plugin validate --strict ${target}\` passes`, () => {
      const r = spawnSync('claude', ['plugin', 'validate', '--strict', target], { cwd: root, encoding: 'utf8' });
      assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    });
  }
});

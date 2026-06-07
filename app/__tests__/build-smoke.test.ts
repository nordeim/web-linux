/// <reference types="node" />
/**
 * Build smoke test.
 *
 * Runs `vite build` in a child process and asserts the build exits with
 * code 0. This catches CSS minification errors (e.g. the
 * `gap-[--spacing(var(--gap))]` Tailwind v4 syntax that lightningcss
 * could not parse), missing imports, and other issues that the type
 * checker misses.
 *
 * The test is opt-in via `RUN_BUILD_SMOKE=1` so unit-test runs stay
 * fast in normal development. CI should set this env var.
 */
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { resolve } from 'path';

const ENABLED = process.env.RUN_BUILD_SMOKE === '1';

describe.skipIf(!ENABLED)('Build smoke test', () => {
  it('vite build exits with code 0', () => {
    const appDir = resolve(__dirname, '..');
    const result = spawnSync('npx', ['vite', 'build'], {
      cwd: appDir,
      encoding: 'utf-8',
      env: process.env,
      timeout: 120_000,
    });
    if (result.status !== 0) {
      // Surface the last 60 lines of output for diagnosis.
      const tail = (result.stdout + '\n' + result.stderr)
        .split('\n')
        .slice(-60)
        .join('\n');
      throw new Error(`vite build failed (exit ${result.status}):\n${tail}`);
    }
    expect(result.status).toBe(0);
  }, 130_000);
});

/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Verifies that .env files are NOT tracked in git and ARE ignored.
 *
 * The dev .env (app/.env) contains only dev URLs but committing .env is a
 * security anti-pattern. Only .env.example should be tracked.
 */
describe('Repository hygiene - .env files', () => {
  const repoRoot = resolve(__dirname, '../..');

  it('root .gitignore excludes .env', () => {
    const rootGitignore = readFileSync(resolve(repoRoot, '.gitignore'), 'utf-8');
    expect(rootGitignore).toMatch(/^\.env$/m);
  });

  it('app/.gitignore excludes .env', () => {
    const appGitignore = readFileSync(resolve(repoRoot, 'app/.gitignore'), 'utf-8');
    expect(appGitignore).toMatch(/^\.env$/m);
  });

  it('keeps .env.example as the tracked template (informational)', () => {
    const examplePath = resolve(repoRoot, 'app/.env.example');
    expect(existsSync(examplePath)).toBe(true);
  });
});

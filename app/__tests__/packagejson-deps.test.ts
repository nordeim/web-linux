/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Verifies that the app's package.json declares all runtime dependencies
 * that are imported by the app. A `cd app && npm install` should be
 * self-sufficient.
 */
describe('app/package.json dependency declarations', () => {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
  ) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };

  it('declares @xterm/xterm (used by RealTerminal)', () => {
    expect(pkg.dependencies['@xterm/xterm']).toBeTruthy();
  });

  it('declares @xterm/addon-fit (used by RealTerminal)', () => {
    expect(pkg.dependencies['@xterm/addon-fit']).toBeTruthy();
  });

  it('declares @xterm/addon-web-links (used by RealTerminal)', () => {
    expect(pkg.dependencies['@xterm/addon-web-links']).toBeTruthy();
  });

  it('declares zod (used by storage validation)', () => {
    expect(pkg.dependencies['zod']).toBeTruthy();
  });

  it('declares dompurify (used by sanitizeHtml)', () => {
    expect(pkg.dependencies['dompurify']).toBeTruthy();
  });
});

/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('PasswordManager security controls', () => {
  const src = readFileSync(
    resolve(__dirname, '../../apps/PasswordManager.tsx'),
    'utf-8'
  );

  it('contains a visible demo-mode security warning', () => {
    expect(src).toMatch(/[Dd]emo.*[Mm]ode/);
    expect(src).toContain('not securely encrypted');
  });

  it('shows the demo-mode warning at the lock screen (before the authenticated branch)', () => {
    // The lock screen is the first return in the component. The demo warning
    // should appear there too so users see the security caveat before typing a PIN.
    const lockBranchMatch = src.match(/if\s*\(\s*!\s*authenticated\s*\)\s*\{[\s\S]*?\n\s*\}\s*\n\s*return\s*\(/);
    expect(lockBranchMatch, 'expected an `if (!authenticated) { ... } return (` lock branch').not.toBeNull();
    const lockBranch = lockBranchMatch![0];
    expect(lockBranch).toMatch(/[Dd]emo.*[Mm]ode|[Nn]ot securely encrypted/);
  });

  it('reads PIN via safeStoredPin instead of a hardcoded constant', () => {
    expect(src).toMatch(/safeStoredPin/);
  });

  it('has a way to change the PIN (UI handler or state)', () => {
    expect(src).toMatch(/setPin|newPin|changePin/i);
  });
});
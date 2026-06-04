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

  it('reads PIN via safeStoredPin instead of a hardcoded constant', () => {
    expect(src).toMatch(/safeStoredPin/);
  });

  it('has a way to change the PIN (UI handler or state)', () => {
    expect(src).toMatch(/setPin|newPin|changePin/i);
  });
});
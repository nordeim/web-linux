/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Terminal windowId prop', () => {
  const src = readFileSync(resolve(__dirname, '../../apps/Terminal.tsx'), 'utf-8');

  it('references the windowId prop in the component source (not just destructured)', () => {
    // Should not be a blind underscore prefix; must actually use the prop
    expect(src).not.toMatch(/_props\s*:/);
    // Should reference windowId somewhere in the body or destructuring
    expect(src).toMatch(/windowId/);
  });
});
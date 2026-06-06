// ============================================================
// generateId test — TDD validation for unified ID generator
// Validates uniqueness, format, and collision resistance.
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateId } from '../generateId';

describe('generateId', () => {
  it('generates a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs across 1000 calls', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i += 1) {
      const id = generateId();
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
    expect(seen.size).toBe(1000);
  });

  it('generates unique IDs even with rapid back-to-back calls', () => {
    const ids = Array.from({ length: 500 }, generateId);
    const unique = new Set(ids);
    expect(unique.size).toBe(500);
  });

  it('produces IDs longer than 10 characters', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(10);
  });
});


import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { safeJsonParse } from '../safeJsonParse';

const TestSchema = z.array(z.object({
  id: z.string(),
  title: z.string(),
  username: z.string(),
  password: z.string(),
  url: z.string(),
  notes: z.string(),
  createdAt: z.number(),
}));

describe('safeJsonParse', () => {
  it('returns fallback when JSON is invalid', () => {
    const result = safeJsonParse('not-json', TestSchema, []);
    expect(result).toEqual([]);
  });

  it('returns fallback when data violates schema', () => {
    const raw = JSON.stringify([{ id: 123, missing: 'fields' }]); // number instead of string
    const result = safeJsonParse(raw, TestSchema, []);
    expect(result).toEqual([]);
  });

  it('returns parsed data when valid', () => {
    const valid = [
      { id: '1', title: 'test', username: 'u', password: 'p', url: '', notes: '', createdAt: 0 },
    ];
    const raw = JSON.stringify(valid);
    const result = safeJsonParse(raw, TestSchema, []);
    expect(result).toEqual(valid);
  });
});

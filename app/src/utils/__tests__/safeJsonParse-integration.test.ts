/**
 * Integration test: verify safeJsonParse can replace raw JSON.parse
 * in real app localStorage reads.  This test mirrors the pattern we
 * want every app to adopt: load → validate with zod → fallback to default.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { safeJsonParse } from '../safeJsonParse';

const ContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  createdAt: z.number().optional(),
});

const BookmarkSchema = z.object({
  url: z.string(),
  title: z.string(),
});

describe('safeJsonParse integration for app localStorage', () => {
  it('rejects corrupted contacts data gracefully', () => {
    const raw = JSON.stringify([
      { id: 'abc', name: 'Alice', email: 'alice@test.com' },
      { id: 42, name: 'Bob', email: 'bob@test.com' }, // id is number → invalid
    ]);

    const result = safeJsonParse(raw, z.array(ContactSchema), []);
    expect(result).toEqual([]); // fallback on validation failure
  });

  it('accepts valid contacts data', () => {
    const raw = JSON.stringify([
      { id: 'abc', name: 'Alice', email: 'alice@test.com', createdAt: 0 },
    ]);

    const result = safeJsonParse(raw, z.array(ContactSchema), []);
    expect(result).toEqual([
      { id: 'abc', name: 'Alice', email: 'alice@test.com', createdAt: 0 },
    ]);
  });

  it('rejects corrupted bookmarks gracefully', () => {
    const raw = JSON.stringify([{ url: 'http://test.com', badField: true }]); // title missing
    const result = safeJsonParse(raw, z.array(BookmarkSchema), []);
    expect(result).toEqual([]); // fallback on validation failure
  });
});

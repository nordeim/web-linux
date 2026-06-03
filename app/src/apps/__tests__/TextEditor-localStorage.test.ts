import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { safeJsonParse } from '../../utils/safeJsonParse';

// Schema that matches TextEditor's recentFiles structure
const RecentFilesSchema = z.array(z.string());

const STORAGE_KEY = 'texteditor_recent';

describe('TextEditor localStorage validation', () => {
  // Mock localStorage
  let mockStorage: Record<string, string | null> = {};

  beforeEach(() => {
    // Reset storage before each test
    mockStorage = {};

    // Mock localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, value: string) => { mockStorage[key] = value; },
        removeItem: (key: string) => { delete mockStorage[key]; },
      },
      writable: true,
    });
  });

  it('returns empty array when localStorage has no data', () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const result = safeJsonParse(raw ?? '[]', RecentFilesSchema, []);
    expect(result).toEqual([]);
  });

  it('returns empty array when localStorage data is invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{');
    const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
    const result = safeJsonParse(raw, RecentFilesSchema, []);
    expect(result).toEqual([]);
  });

  it('returns empty array when data violates schema (wrong types)', () => {
    // Array of numbers instead of strings
    const invalidData = [123, 456];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidData));
    const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
    const result = safeJsonParse(raw, RecentFilesSchema, []);
    expect(result).toEqual([]);
  });

  it('returns empty array when data is not an array', () => {
    const invalidData = { id: 'test' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidData));
    const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
    const result = safeJsonParse(raw, RecentFilesSchema, []);
    expect(result).toEqual([]);
  });

  it('returns parsed data when valid string array is stored', () => {
    const validData = ['file1-id', 'file2-id', 'file3-id'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validData));
    const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
    const result = safeJsonParse(raw, RecentFilesSchema, []);
    expect(result).toEqual(validData);
  });

  it('filters out non-string entries from mixed array', () => {
    const mixedData = ['file1-id', 123, 'file3-id'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixedData));
    const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
    const result = safeJsonParse(raw, RecentFilesSchema, []);
    // Entire array should fail validation and fall back to default
    expect(result).toEqual([]);
  });

  it('handles null values in localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'null');
    const raw = localStorage.getItem(STORAGE_KEY);
    const result = safeJsonParse(raw ?? '[]', RecentFilesSchema, []);
    expect(result).toEqual([]);
  });
});

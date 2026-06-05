/**
 * Game Highscore Validation Tests
 * 
 * Tests the zod schema pattern for validating game highscores from localStorage.
 * This pattern should be used by all game apps that store highscores.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { safeJsonParse } from '../safeJsonParse';

// Schema for game highscores (non-negative integers)
const HighScoreSchema = z.number().int().min(0);

describe('Game Highscore Validation', () => {
  describe('HighScoreSchema', () => {
    it('accepts valid positive integers', () => {
      expect(HighScoreSchema.safeParse(0).success).toBe(true);
      expect(HighScoreSchema.safeParse(100).success).toBe(true);
      expect(HighScoreSchema.safeParse(999999).success).toBe(true);
    });

    it('rejects negative numbers', () => {
      expect(HighScoreSchema.safeParse(-1).success).toBe(false);
      expect(HighScoreSchema.safeParse(-100).success).toBe(false);
    });

    it('rejects floating point numbers', () => {
      expect(HighScoreSchema.safeParse(1.5).success).toBe(false);
      expect(HighScoreSchema.safeParse(0.1).success).toBe(false);
    });

    it('rejects non-numeric values', () => {
      expect(HighScoreSchema.safeParse('abc').success).toBe(false);
      expect(HighScoreSchema.safeParse(null).success).toBe(false);
      expect(HighScoreSchema.safeParse(undefined).success).toBe(false);
      expect(HighScoreSchema.safeParse({}).success).toBe(false);
    });

    it('rejects NaN', () => {
      expect(HighScoreSchema.safeParse(NaN).success).toBe(false);
    });

    it('rejects Infinity', () => {
      expect(HighScoreSchema.safeParse(Infinity).success).toBe(false);
      expect(HighScoreSchema.safeParse(-Infinity).success).toBe(false);
    });
  });

  describe('safeJsonParse with HighScoreSchema', () => {
    it('returns fallback for corrupted localStorage data', () => {
      const result = safeJsonParse('not-a-number', HighScoreSchema, 0);
      expect(result).toBe(0);
    });

    it('returns fallback for empty string', () => {
      const result = safeJsonParse('', HighScoreSchema, 0);
      expect(result).toBe(0);
    });

    it('returns fallback for null', () => {
      const result = safeJsonParse('null', HighScoreSchema, 0);
      expect(result).toBe(0);
    });

    it('returns fallback for negative number string', () => {
      const result = safeJsonParse('-5', HighScoreSchema, 0);
      expect(result).toBe(0);
    });

    it('returns parsed value for valid highscore', () => {
      const result = safeJsonParse('12345', HighScoreSchema, 0);
      expect(result).toBe(12345);
    });

    it('returns parsed value for zero', () => {
      const result = safeJsonParse('0', HighScoreSchema, 0);
      expect(result).toBe(0);
    });
  });
});

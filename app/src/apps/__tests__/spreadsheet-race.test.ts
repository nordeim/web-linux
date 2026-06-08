/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * H-4: Spreadsheet cell reference validation
 * H-5: Spreadsheet recursion depth cap
 */

describe('Spreadsheet hardening (H-4, H-5)', () => {
  const sheetSrc = readFileSync(resolve(__dirname, '../Spreadsheet.tsx'), 'utf-8');

  describe('H-4: Invalid cell reference validation', () => {
    it('has isValidCellRef helper function', () => {
      expect(sheetSrc).toContain('isValidCellRef');
    });

    it('validates references against COLS and ROWS', () => {
      expect(sheetSrc).toMatch(/COLS\.includes|COLS\.indexOf/);
      expect(sheetSrc).toContain('ROWS');
    });

    it('uses isValidCellRef in the regex replace callback', () => {
      // The replacement should guard evaluateCell calls
      expect(sheetSrc).toMatch(/isValidCellRef\s*\(\s*match/);
    });
  });

  describe('H-5: Recursion depth cap', () => {
    it('has a depth parameter in evaluateCell', () => {
      expect(sheetSrc).toMatch(/evaluateCell.*depth\s*=\s*0|depth.*=.*0/);
    });

    it('increments depth on each recursive call', () => {
      expect(sheetSrc).toMatch(/depth\s*\+\s*1|depth\+1/);
    });

    it('returns an error when depth exceeds the cap', () => {
      expect(sheetSrc).toContain("'#DEPTH!'");
    });
  });
});

import { describe, it, expect } from 'vitest';
import { safeEval } from '../safeEval';

describe('safeEval', () => {
  describe('basic arithmetic', () => {
    it('evaluates addition', () => {
      expect(safeEval('1+2')).toBe(3);
      expect(safeEval('0+0')).toBe(0);
    });

    it('evaluates subtraction', () => {
      expect(safeEval('5-3')).toBe(2);
      expect(safeEval('3-5')).toBe(-2);
    });

    it('evaluates multiplication', () => {
      expect(safeEval('3*4')).toBe(12);
      expect(safeEval('0*99')).toBe(0);
    });

    it('evaluates division', () => {
      expect(safeEval('10/2')).toBe(5);
      expect(safeEval('7/2')).toBe(3.5);
    });

    it('evaluates mixed operations with correct precedence', () => {
      expect(safeEval('1+2*3')).toBe(7);
      expect(safeEval('2*3+4')).toBe(10);
      expect(safeEval('10-2*3')).toBe(4);
      expect(safeEval('10/2+3')).toBe(8);
    });
  });

  describe('decimal numbers', () => {
    it('evaluates decimal addition', () => {
      expect(safeEval('3.5+2.1')).toBeCloseTo(5.6, 5);
    });

    it('evaluates decimal multiplication', () => {
      expect(safeEval('2.5*4')).toBe(10);
      expect(safeEval('0.5*0.5')).toBeCloseTo(0.25, 5);
    });

    it('handles leading dot', () => {
      expect(safeEval('.5+.5')).toBe(1);
    });
  });

  describe('parentheses', () => {
    it('evaluates simple parentheses', () => {
      expect(safeEval('(1+2)*3')).toBe(9);
    });

    it('evaluates nested parentheses', () => {
      expect(safeEval('((1+2)*3)')).toBe(9);
      expect(safeEval('(2+3)*(4-1)')).toBe(15);
    });

    it('handles complex precedence with parentheses', () => {
      expect(safeEval('(1+2*3)*4')).toBe(28);
      expect(safeEval('1+(2+3)*4')).toBe(21);
    });
  });

  describe('exponentiation', () => {
    it('evaluates exponentiation', () => {
      expect(safeEval('2^3')).toBe(8);
    });

    it('evaluates decimal exponent', () => {
      expect(safeEval('4^0.5')).toBe(2);
    });

    it('has correct precedence', () => {
      expect(safeEval('2*3^2')).toBe(18);
      expect(safeEval('(2*3)^2')).toBe(36);
    });
  });

  describe('whitespace handling', () => {
    it('evaluates with spaces', () => {
      expect(safeEval('  1  +  2  ')).toBe(3);
      expect(safeEval('  ( 1 + 2 ) * 3 ')).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('throws on empty string', () => {
      expect(() => safeEval('')).toThrow('Invalid expression');
    });

    it('throws on only whitespace', () => {
      expect(() => safeEval('   ')).toThrow('Invalid expression');
    });

    it('throws on lone operator', () => {
      expect(() => safeEval('+')).toThrow('Invalid expression');
    });
  });

  describe('rejection of invalid input', () => {
    it('throws on letters', () => {
      expect(() => safeEval('a+b')).toThrow('Invalid expression');
      expect(() => safeEval('1+foo')).toThrow('Invalid expression');
    });

    it('throws on special characters', () => {
      expect(() => safeEval('1&2')).toThrow('Invalid expression');
      expect(() => safeEval('1@2')).toThrow('Invalid expression');
    });

    it('throws on SQL injection attempts', () => {
      expect(() => safeEval('1; DROP TABLE')).toThrow('Invalid expression');
    });

    it('throws on unmatched left parenthesis', () => {
      expect(() => safeEval('(1+2')).toThrow('Invalid expression');
    });

    it('throws on unmatched right parenthesis', () => {
      expect(() => safeEval('1+2)')).toThrow('Invalid expression');
    });

    it('throws on empty parentheses', () => {
      expect(() => safeEval('()')).toThrow('Invalid expression');
    });
  });
});

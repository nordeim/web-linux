/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { isValidColor } from '../colorValidation';

describe('isValidColor', () => {
  describe('valid hex colors', () => {
    it('should accept 6-digit hex colors', () => {
      expect(isValidColor('#FF0000')).toBe(true);
      expect(isValidColor('#ff0000')).toBe(true);
      expect(isValidColor('#00FF00')).toBe(true);
      expect(isValidColor('#0000FF')).toBe(true);
    });

    it('should accept 3-digit hex colors', () => {
      expect(isValidColor('#FFF')).toBe(true);
      expect(isValidColor('#fff')).toBe(true);
      expect(isValidColor('#F00')).toBe(true);
    });

    it('should accept 8-digit hex colors with alpha', () => {
      expect(isValidColor('#FF000080')).toBe(true);
      expect(isValidColor('#00FF00FF')).toBe(true);
    });
  });

  describe('valid rgb/rgba colors', () => {
    it('should accept rgb colors', () => {
      expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
      expect(isValidColor('rgb(0, 255, 0)')).toBe(true);
      expect(isValidColor('rgb(0, 0, 255)')).toBe(true);
      expect(isValidColor('rgb(128, 128, 128)')).toBe(true);
    });

    it('should accept rgba colors with alpha', () => {
      expect(isValidColor('rgba(255, 0, 0, 0.5)')).toBe(true);
      expect(isValidColor('rgba(0, 255, 0, 1)')).toBe(true);
      expect(isValidColor('rgba(0, 0, 255, 0.25)')).toBe(true);
    });
  });

  describe('valid hsl/hsla colors', () => {
    it('should accept hsl colors', () => {
      expect(isValidColor('hsl(0, 100%, 50%)')).toBe(true);
      expect(isValidColor('hsl(120, 100%, 50%)')).toBe(true);
      expect(isValidColor('hsl(240, 100%, 50%)')).toBe(true);
    });

    it('should accept hsla colors with alpha', () => {
      expect(isValidColor('hsla(0, 100%, 50%, 0.5)')).toBe(true);
      expect(isValidColor('hsla(120, 100%, 50%, 1)')).toBe(true);
    });
  });

  describe('valid named CSS colors', () => {
    it('should accept basic named colors', () => {
      expect(isValidColor('red')).toBe(true);
      expect(isValidColor('blue')).toBe(true);
      expect(isValidColor('green')).toBe(true);
      expect(isValidColor('white')).toBe(true);
      expect(isValidColor('black')).toBe(true);
    });

    it('should accept CSS-wide keywords', () => {
      expect(isValidColor('transparent')).toBe(true);
      expect(isValidColor('currentcolor')).toBe(true);
      expect(isValidColor('inherit')).toBe(true);
      expect(isValidColor('initial')).toBe(true);
      expect(isValidColor('unset')).toBe(true);
    });

    it('should accept extended named colors', () => {
      expect(isValidColor('aliceblue')).toBe(true);
      expect(isValidColor('coral')).toBe(true);
      expect(isValidColor('tomato')).toBe(true);
      expect(isValidColor('rebeccapurple')).toBe(true);
    });
  });

  describe('invalid colors', () => {
    it('should reject empty strings', () => {
      expect(isValidColor('')).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isValidColor(null as unknown as string)).toBe(false);
      expect(isValidColor(undefined as unknown as string)).toBe(false);
    });

    it('should reject CSS injection attempts', () => {
      expect(isValidColor('javascript:alert(1)')).toBe(false);
      expect(isValidColor('expression(document.cookie)')).toBe(false);
      expect(isValidColor('url(malicious.com)')).toBe(false);
    });

    it('should reject colors with dangerous characters', () => {
      expect(isValidColor('rgb(255, 0, 0); background: red')).toBe(false);
      expect(isValidColor('#FF0000; background: url(evil.com)')).toBe(false);
    });

    it('should reject arbitrary strings', () => {
      expect(isValidColor('not-a-color')).toBe(false);
      expect(isValidColor('random text')).toBe(false);
      expect(isValidColor('12345')).toBe(false);
    });
  });
});

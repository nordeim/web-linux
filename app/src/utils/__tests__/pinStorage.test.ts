/**
 * Tests for password_manager_pin validation behavior.
 *
 * M-7 audit fix: the PIN must be validated with a zod schema before being
 * accepted. Any non-4-digit value is rejected and the default '1234' is used.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { safeStoredPin, PIN_STORAGE_KEY } from '@/utils/pinStorage';

describe('safeStoredPin (M-7)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports the documented storage key', () => {
    expect(PIN_STORAGE_KEY).toBe('password_manager_pin');
  });

  it('returns the default "1234" when nothing is stored', () => {
    expect(safeStoredPin()).toBe('1234');
  });

  it('returns the stored value when it is a valid 4-digit PIN', () => {
    localStorage.setItem('password_manager_pin', '9876');
    expect(safeStoredPin()).toBe('9876');
  });

  it('rejects 3-digit PINs and returns the default', () => {
    localStorage.setItem('password_manager_pin', '123');
    expect(safeStoredPin()).toBe('1234');
  });

  it('rejects 5+ digit PINs and returns the default', () => {
    localStorage.setItem('password_manager_pin', '12345');
    expect(safeStoredPin()).toBe('1234');
  });

  it('rejects non-numeric PINs and returns the default', () => {
    localStorage.setItem('password_manager_pin', 'abcd');
    expect(safeStoredPin()).toBe('1234');
  });

  it('rejects empty string and returns the default', () => {
    localStorage.setItem('password_manager_pin', '');
    expect(safeStoredPin()).toBe('1234');
  });

  it('rejects PINs containing spaces', () => {
    localStorage.setItem('password_manager_pin', '12 4');
    expect(safeStoredPin()).toBe('1234');
  });
});

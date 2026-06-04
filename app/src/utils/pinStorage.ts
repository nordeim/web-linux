/**
 * PIN storage helpers for PasswordManager.
 *
 * M-7 audit fix: validate stored PINs with a zod schema before use. Any value
 * that does not match `^\d{4}$` is discarded and the documented default `1234`
 * is returned instead. This prevents corrupted or attacker-controlled localStorage
 * entries from disabling login.
 */

import { z } from 'zod';

export const PIN_STORAGE_KEY = 'password_manager_pin';
export const DEFAULT_PIN = '1234';

const StoredPinSchema = z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits');

export function safeStoredPin(): string {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    if (!raw) return DEFAULT_PIN;
    const result = StoredPinSchema.safeParse(raw);
    return result.success ? result.data : DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function savePin(pin: string): boolean {
  const result = StoredPinSchema.safeParse(pin);
  if (!result.success) return false;
  try {
    localStorage.setItem(PIN_STORAGE_KEY, result.data);
    return true;
  } catch {
    return false;
  }
}

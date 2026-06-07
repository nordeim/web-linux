import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  emitFileSystemSaveError,
  subscribeFileSystemSaveError,
  isQuotaExceededError,
} from '../fsEvents';

describe('fsEvents', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('delivers save errors to all subscribers', () => {
    const a = vi.fn();
    const b = vi.fn();
    const unsubA = subscribeFileSystemSaveError(a);
    const unsubB = subscribeFileSystemSaveError(b);

    emitFileSystemSaveError({ kind: 'quota-exceeded', message: 'full' });

    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
    expect(a.mock.calls[0][0].kind).toBe('quota-exceeded');

    unsubA();
    unsubB();
  });

  it('stops delivering events after unsubscribe', () => {
    const listener = vi.fn();
    const unsub = subscribeFileSystemSaveError(listener);
    emitFileSystemSaveError({ kind: 'unknown', message: 'x' });
    expect(listener).toHaveBeenCalledOnce();

    unsub();
    emitFileSystemSaveError({ kind: 'unknown', message: 'y' });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('does not let a listener crash other listeners', () => {
    const throwing = vi.fn(() => {
      throw new Error('boom');
    });
    const ok = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const u1 = subscribeFileSystemSaveError(throwing);
    const u2 = subscribeFileSystemSaveError(ok);

    expect(() => emitFileSystemSaveError({ kind: 'unknown', message: 'x' })).not.toThrow();
    expect(throwing).toHaveBeenCalledOnce();
    expect(ok).toHaveBeenCalledOnce();

    u1();
    u2();
    consoleSpy.mockRestore();
  });

  it('isQuotaExceededError detects DOMException-style quota errors', () => {
    const domErr = new Error('mock') as Error & { name: string; code: number };
    domErr.name = 'QuotaExceededError';
    domErr.code = 22;
    expect(isQuotaExceededError(domErr)).toBe(true);
  });

  it('isQuotaExceededError detects quota by message', () => {
    expect(isQuotaExceededError(new Error('Storage quota exceeded'))).toBe(true);
  });

  it('isQuotaExceededError returns false for non-quota errors', () => {
    expect(isQuotaExceededError(new Error('Some other error'))).toBe(false);
    expect(isQuotaExceededError('string-error')).toBe(false);
    expect(isQuotaExceededError(null)).toBe(false);
  });
});

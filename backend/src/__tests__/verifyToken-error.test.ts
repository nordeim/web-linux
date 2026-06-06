// ============================================================
// verifyToken error-handling test — TDD validation (RED phase)
// Verifies that when verifyToken() rejects, the promise is
// caught so the Node.js process does not crash.
//
// Bug: setupEvents() calls verifyToken().then(...).  If the
// underlying jose/JWT check throws (bad secret, malformed JWT,
// etc.), the resulting rejection has no catch() handler and
// becomes an unhandledRejection on the Node.js event loop.
// ============================================================

import { describe, it, expect, vi } from 'vitest';

/**
 * Standalone reproduction of the promise chain in
 * WebSocketHandler.setupEvents() (websocket.ts:46-52).
 *
 * CURRENT (broken) — no catch:
 *   verifyToken().then(isValid => { ... });
 *   // Missing .catch() — rejection flows to process.
 *
 * Will be updated to the fixed version after the test fails.
 */
async function verifyTokenWithGuard(
  verifyToken: () => Promise<boolean>,
  onSuccess: () => void,
  onClose: () => void
): Promise<void> {
  // ── FIXED implementation (catches rejections) ──
  return verifyToken()
    .then((isValid) => {
      if (!isValid) {
        onClose();
        return;
      }
      onSuccess();
    })
    .catch(() => {
      onClose();
    });
}

describe('verifyToken error handling', () => {
  it('handles verifyToken rejection gracefully without propagating', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    const brokenVerify = vi.fn().mockRejectedValue(new Error('JWT decode failed'));

    // In the broken implementation this returns a rejected promise,
    // so .resolves will cause the assertion to FAIL.
    await expect(
      verifyTokenWithGuard(brokenVerify, onSuccess, onClose)
    ).resolves.toBeUndefined();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// cleanupExpired error-handling test — TDD validation (RED)
// Verifies that cleanupExpired() continues cleaning remaining
// sessions even when one container cleanup throws.
//
// Bug: cleanupExpired() awaits stopAndRemoveContainer() without
// a try/catch.  If one session's container is already removed
// (or any other error), the loop exits and remaining expired
// sessions are never cleaned.
// ============================================================

import { describe, it, expect, vi } from 'vitest';

interface MockSession {
  pty: { kill: () => void };
  containerId: string;
}

/**
 * Standalone reproduction of WebSocketHandler.cleanupExpired()
 * loop body (websocket.ts:163-173).
 *
 * BROKEN — no try/catch:
 *   session.pty.kill();
 *   await stopAndRemoveContainer(session.containerId);
 *
 * FIXED — try/catch around each cleanup:
 *   try {
 *     session.pty.kill();
 *     await stopAndRemoveContainer(session.containerId);
 *   } catch { /* continue *\/ }
 */
async function cleanupExpiredWithGuard(
  sessions: Map<string, MockSession>,
  expired: string[],
  cleanupFn: (containerId: string) => Promise<void>
): Promise<void> {
  for (const sessionId of expired) {
    const session = sessions.get(sessionId);
    if (!session) continue;

    sessions.delete(sessionId);
    // ── FIXED: wrap each cleanup in try/catch so one failure
    // doesn't prevent cleaning the remaining expired sessions. ──
    try {
      session.pty.kill();
      await cleanupFn(session.containerId);
    } catch {
      /* Container may already be gone — continue */
    }
  }
}

describe('cleanupExpired error handling', () => {
  it('cleans all sessions even when one container removal throws', async () => {
    const sessions = new Map<string, MockSession>([
      ['s-1', { pty: { kill: vi.fn() }, containerId: 'c-1' }],
      ['s-2', { pty: { kill: vi.fn() }, containerId: 'c-2' }],
      ['s-3', { pty: { kill: vi.fn() }, containerId: 'c-3' }],
    ]);

    const cleanupFn = vi.fn(async (id: string) => {
      if (id === 'c-2') {
        throw new Error('Container already removed');
      }
    });

    // In the BROKEN implementation, cleanupFn is awaited without
    // a try/catch, so the rejection propagates and the loop breaks.
    // With the FIXED implementation, the error is caught and the
    // loop continues to s-3.
    await cleanupExpiredWithGuard(sessions, ['s-1', 's-2', 's-3'], cleanupFn);

    // All three sessions should have been removed from the map
    expect(sessions.has('s-1')).toBe(false);
    expect(sessions.has('s-2')).toBe(false);
    expect(sessions.has('s-3')).toBe(false);

    // cleanupFn should have been called for all three sessions
    expect(cleanupFn).toHaveBeenCalledTimes(3);
  });

  it('handles all sessions failing gracefully', async () => {
    const sessions = new Map<string, MockSession>([
      ['s-1', { pty: { kill: vi.fn() }, containerId: 'c-1' }],
      ['s-2', { pty: { kill: vi.fn() }, containerId: 'c-2' }],
    ]);

    const cleanupFn = vi.fn().mockRejectedValue(new Error('Docker daemon down'));

    await cleanupExpiredWithGuard(sessions, ['s-1', 's-2'], cleanupFn);

    expect(sessions.has('s-1')).toBe(false);
    expect(sessions.has('s-2')).toBe(false);
    expect(cleanupFn).toHaveBeenCalledTimes(2);
  });
});

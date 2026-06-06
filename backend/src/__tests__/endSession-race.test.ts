// ============================================================
// endSession race-guard test — TDD validation
// Verifies that concurrent endSession calls for the same
// sessionId only trigger one round of cleanup side effects.
// ============================================================

import { describe, it, expect, vi } from 'vitest';

interface MockSession {
  pty: { kill: () => void };
  containerId: string;
}

/**
 * Reproduces the guard logic from WebSocketHandler.endSession()
 * so we can test it in isolation without instantiating the
 * full WebSocketHandler (which depends on Docker, WebSocket, etc.).
 */
async function endSessionWithGuard(
  sessions: Map<string, MockSession>,
  sessionId: string,
  cleanupFn: (containerId: string) => Promise<void>
): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) return;

  // Guard: remove immediately to prevent duplicate processing
  // from concurrent calls.  Without this, two callers could
  // both call pty.kill() and cleanupFn() before either
  // reaches sessions.delete(sessionId).
  sessions.delete(sessionId);

  session.pty.kill();
  await cleanupFn(session.containerId);
}

describe('endSession race guard', () => {
  it('only runs cleanup once when called twice for the same session', async () => {
    const cleanupFn = vi.fn().mockResolvedValue(undefined);
    const sessions = new Map<string, MockSession>();
    sessions.set('s-1', {
      pty: { kill: vi.fn() },
      containerId: 'c-1',
    });

    // Fire two concurrent calls
    const p1 = endSessionWithGuard(sessions, 's-1', cleanupFn);
    const p2 = endSessionWithGuard(sessions, 's-1', cleanupFn);
    await Promise.all([p1, p2]);

    // Only one of the two calls should have triggered cleanup
    expect(cleanupFn).toHaveBeenCalledTimes(1);
    expect(sessions.has('s-1')).toBe(false);
  });

  it('handles cleanup for two different sessions independently', async () => {
    const cleanupFn = vi.fn().mockResolvedValue(undefined);
    const sessions = new Map<string, MockSession>();
    sessions.set('s-1', {
      pty: { kill: vi.fn() },
      containerId: 'c-1',
    });
    sessions.set('s-2', {
      pty: { kill: vi.fn() },
      containerId: 'c-2',
    });

    const p1 = endSessionWithGuard(sessions, 's-1', cleanupFn);
    const p2 = endSessionWithGuard(sessions, 's-2', cleanupFn);
    await Promise.all([p1, p2]);

    expect(cleanupFn).toHaveBeenCalledTimes(2);
    expect(sessions.has('s-1')).toBe(false);
    expect(sessions.has('s-2')).toBe(false);
  });
});

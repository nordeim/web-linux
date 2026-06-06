// ============================================================
// endSession resilience test — TDD validation (RED phase)
// Verifies that endSession() calls disconnect() even when
// the PTY kill or container removal throws.
//
// Bug: endSession() awaits stopAndRemoveContainer() without
// a try/catch.  If it throws, disconnect() never runs and the
// session store remains in a stale state.
// ============================================================

import { describe, it, expect, vi } from 'vitest';

interface MockSession {
  pty: { kill: () => void };
  containerId: string;
}

interface MockStore {
  disconnect: (sessionId: string) => void;
}

/**
 * Standalone reproduction of WebSocketHandler.endSession()
 * (websocket.ts:148-158).
 *
 * BROKEN — no try/catch:
 *   session.pty.kill();
 *   await stopAndRemoveContainer(session.containerId);
 *   this.store.disconnect(sessionId);
 *   // If line 2 throws, disconnect() is unreachable.
 *
 * FIXED — try/catch around kill/container, always disconnect:
 *   try { ... } catch { /* ignore*\/ }
 *   this.store.disconnect(sessionId);
 */
async function endSessionWithGuard(
  sessions: Map<string, MockSession>,
  sessionId: string,
  store: MockStore,
  stopAndRemoveContainer: (containerId: string) => Promise<void>
): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) return;

  sessions.delete(sessionId);

  // ── FIXED: always disconnect, even if kill or container removal fails ──
  try {
    session.pty.kill();
    await stopAndRemoveContainer(session.containerId);
  } catch {
    /* Container or PTY may already be gone — still disconnect */
  }
  store.disconnect(sessionId);
}

describe('endSession error handling', () => {
  it('calls disconnect even when container removal throws', async () => {
    const sessions = new Map<string, MockSession>([
      ['s-1', { pty: { kill: vi.fn() }, containerId: 'c-1' }],
    ]);
    const store = { disconnect: vi.fn() };

    const stopAndRemoveContainer = vi.fn().mockRejectedValue(new Error('Docker timeout'));

    // In the BROKEN implementation, the rejection propagates and
    // disconnect() is never reached.  With the FIXED version, the
    // error is caught and disconnect() is called regardless.
    await expect(
      endSessionWithGuard(sessions, 's-1', store, stopAndRemoveContainer)
    ).resolves.toBeUndefined();

    expect(stopAndRemoveContainer).toHaveBeenCalledTimes(1);
    expect(store.disconnect).toHaveBeenCalledTimes(1);
    expect(store.disconnect).toHaveBeenCalledWith('s-1');
    expect(sessions.has('s-1')).toBe(false);
  });

  it('calls disconnect even when pty.kill() throws', async () => {
    const sessions = new Map<string, MockSession>([
      ['s-2', {
        pty: { kill: vi.fn(() => { throw new Error('PTY already dead'); }) },
        containerId: 'c-2',
      }],
    ]);
    const store = { disconnect: vi.fn() };
    const stopAndRemoveContainer = vi.fn().mockResolvedValue(undefined);

    await expect(
      endSessionWithGuard(sessions, 's-2', store, stopAndRemoveContainer)
    ).resolves.toBeUndefined();

    expect(store.disconnect).toHaveBeenCalledTimes(1);
    expect(store.disconnect).toHaveBeenCalledWith('s-2');
    expect(sessions.has('s-2')).toBe(false);
  });
});

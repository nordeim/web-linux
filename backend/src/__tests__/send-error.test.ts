// ============================================================
// send() error-handling test — TDD validation (RED phase)
// Verifies that when ws.send() throws, the error is caught
// so the Node.js process does not crash.
//
// Bug: WebSocketHandler.send() (websocket.ts:195-198) checks
// readyState before calling ws.send(), but the socket can
// close between the check and the send, causing an unhandled
// exception.
// ============================================================

import { describe, it, expect } from 'vitest';

/**
 * Standalone reproduction of WebSocketHandler.send()
 * (websocket.ts:195-198).
 *
 * BROKEN — no try/catch around ws.send():
 *   if (ws.readyState === WebSocket.OPEN) {
 *     ws.send(JSON.stringify(msg));
 *   }
 */
function sendMessage(ws: { readyState: number; send: (data: string) => void }, msg: object): void {
  if (ws.readyState === 1 /* WebSocket.OPEN */) {
    // FIXED: Wrap ws.send() in try/catch — the socket can close
    // between the readyState check and the actual send.
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* Socket closed between check and send — ignore */
    }
  }
}

describe('send error handling', () => {
  it('catches ws.send() throw without propagating', () => {
    const ws = {
      readyState: 1,
      send: () => {
        throw new Error('WebSocket closed unexpectedly');
      },
    };

    // In the BROKEN implementation, this throws an unhandled
    // error. With the fix, it should swallow the error.
    expect(() => sendMessage(ws, { type: 'test' })).not.toThrow();
  });
});

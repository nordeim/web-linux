import { describe, it, expect, vi } from 'vitest';
import { SessionStore } from '../sessionStore.js';

describe('SessionStore', () => {
  it('stores and retrieves a session', () => {
    const store = new SessionStore();
    store.create('sess-1', 'container-1', 'pty-1', 'user-1');

    const session = store.get('sess-1');
    expect(session).toBeTruthy();
    expect(session?.sessionId).toBe('sess-1');
    expect(session?.containerId).toBe('container-1');
    expect(session?.status).toBe('active');
  });

  it('marks a session as disconnected and removes after grace period', () => {
    vi.useFakeTimers();
    const store = new SessionStore({ gracePeriodMs: 50 });
    store.create('sess-2', 'container-2', 'pty-2', 'user-2');
    store.disconnect('sess-2');

    const before = store.get('sess-2');
    expect(before?.status).toBe('disconnected');

    // Advance past the grace period
    vi.advanceTimersByTime(100);
    store.cleanupExpired();

    const after = store.get('sess-2');
    expect(after).toBeNull();
    vi.useRealTimers();
  });

  it('returns all active sessions', () => {
    const store = new SessionStore();
    store.create('sess-3', 'c-3', 'p-3', 'u-3');
    store.create('sess-4', 'c-4', 'p-4', 'u-4');

    const active = store.getActive();
    expect(active).toHaveLength(2);
  });

  it('updates lastActivity on heartbeat', () => {
    const store = new SessionStore();
    store.create('sess-5', 'c-5', 'p-5', 'u-5');

    const before = store.get('sess-5')?.lastActivity ?? 0;
    store.heartbeat('sess-5');
    const after = store.get('sess-5')?.lastActivity ?? 0;

    expect(after).toBeGreaterThanOrEqual(before);
  });
});
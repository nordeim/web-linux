export interface Session {
  sessionId: string;
  containerId: string;
  ptyPid: number;
  userId: string;
  createdAt: number;
  lastActivity: number;
  status: 'active' | 'disconnected' | 'closed';
}

interface SessionStoreOptions {
  gracePeriodMs: number;
  ttlMs?: number;
}

export class SessionStore {
  private sessions = new Map<string, Session>();
  private gracePeriodMs: number;
  private ttlMs?: number;

  constructor(options: SessionStoreOptions = { gracePeriodMs: 300000 }) {
    this.gracePeriodMs = options.gracePeriodMs;
    this.ttlMs = options.ttlMs;
  }

  create(sessionId: string, containerId: string, ptyPid: number, userId: string): Session {
    const now = Date.now();
    const session: Session = {
      sessionId,
      containerId,
      ptyPid,
      userId,
      createdAt: now,
      lastActivity: now,
      status: 'active',
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  get(sessionId: string): Session | null {
    return this.sessions.get(sessionId) ?? null;
  }

  disconnect(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'disconnected';
      session.lastActivity = Date.now();
    }
  }

  close(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  heartbeat(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  getActive(): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'active');
  }

  getDisconnected(): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'disconnected');
  }

  cleanupExpired(): string[] {
    const now = Date.now();
    const expired = new Set<string>();

    for (const [id, session] of this.sessions.entries()) {
      if (session.status === 'disconnected' && now - session.lastActivity > this.gracePeriodMs) {
        this.sessions.delete(id);
        expired.add(id);
      }
      if (this.ttlMs && now - session.createdAt > this.ttlMs) {
        if (!expired.has(id)) {
          this.sessions.delete(id);
          expired.add(id);
        }
      }
    }

    return Array.from(expired);
  }
}
export class SessionStore {
    sessions = new Map();
    gracePeriodMs;
    ttlMs;
    constructor(options = { gracePeriodMs: 300000 }) {
        this.gracePeriodMs = options.gracePeriodMs;
        this.ttlMs = options.ttlMs;
    }
    create(sessionId, containerId, ptyPid, userId) {
        const now = Date.now();
        const session = {
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
    get(sessionId) {
        return this.sessions.get(sessionId) ?? null;
    }
    disconnect(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.status = 'disconnected';
            session.lastActivity = Date.now();
        }
    }
    close(sessionId) {
        this.sessions.delete(sessionId);
    }
    heartbeat(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now();
        }
    }
    getActive() {
        return Array.from(this.sessions.values()).filter((s) => s.status === 'active');
    }
    getDisconnected() {
        return Array.from(this.sessions.values()).filter((s) => s.status === 'disconnected');
    }
    cleanupExpired() {
        const now = Date.now();
        const expired = new Set();
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
//# sourceMappingURL=sessionStore.js.map
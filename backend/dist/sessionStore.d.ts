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
export declare class SessionStore {
    private sessions;
    private gracePeriodMs;
    private ttlMs?;
    constructor(options?: SessionStoreOptions);
    create(sessionId: string, containerId: string, ptyPid: number, userId: string): Session;
    get(sessionId: string): Session | null;
    disconnect(sessionId: string): void;
    close(sessionId: string): void;
    heartbeat(sessionId: string): void;
    getActive(): Session[];
    getDisconnected(): Session[];
    cleanupExpired(): string[];
}
export {};
//# sourceMappingURL=sessionStore.d.ts.map
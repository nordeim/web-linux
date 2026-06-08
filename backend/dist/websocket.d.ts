import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import type { SessionStore } from './sessionStore.js';
export interface WebSocketOptions {
    store: SessionStore;
    verifyToken: (token: string) => Promise<boolean>;
}
export declare class WebSocketHandler {
    private wss;
    private store;
    private verifyToken;
    private sessions;
    private policy;
    private auditLogger;
    constructor(options: WebSocketOptions);
    get server(): WebSocketServer;
    private setupEvents;
    private startSession;
    private wireWebSocket;
    private handleMessage;
    private endSession;
    cleanupExpired(): Promise<void>;
    private send;
    handleUpgrade(request: IncomingMessage, socket: import('net').Socket, head: Buffer): void;
}
//# sourceMappingURL=websocket.d.ts.map
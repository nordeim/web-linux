/**
 * Shared message protocol types for the Real Terminal feature.
 * These types define the contract between the frontend and backend WebSocket communication.
 */
export interface ClientMessage {
    type: 'input' | 'resize' | 'close' | 'heartbeat';
    data?: string;
    cols?: number;
    rows?: number;
}
export interface InputMessage extends ClientMessage {
    type: 'input';
    data: string;
}
export interface ResizeMessage extends ClientMessage {
    type: 'resize';
    cols: number;
    rows: number;
}
export interface CloseMessage extends ClientMessage {
    type: 'close';
}
export interface HeartbeatMessage extends ClientMessage {
    type: 'heartbeat';
}
export interface ServerMessage {
    type: 'init' | 'output' | 'error' | 'heartbeat' | 'heartbeat_ack';
    sessionId?: string;
    data?: string;
    message?: string;
}
export interface InitMessage extends ServerMessage {
    type: 'init';
    sessionId: string;
}
export interface OutputMessage extends ServerMessage {
    type: 'output';
    data: string;
}
export interface ErrorMessage extends ServerMessage {
    type: 'error';
    message: string;
}
export interface HeartbeatAckMessage extends ServerMessage {
    type: 'heartbeat_ack';
}
export interface AuditLogEntry {
    timestamp: string;
    sessionId: string;
    userId?: string;
    command: string;
    action: 'input' | 'blocked' | 'restricted';
    reason?: string;
}
export interface CommandPolicy {
    allowlist?: string[];
    denylist: string[];
    maxCommandLength: number;
    logCommands: boolean;
}
export interface CommandRestrictionResult {
    allowed: boolean;
    reason?: string;
    command: string;
}
//# sourceMappingURL=types.d.ts.map
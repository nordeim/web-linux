import type { AuditLogEntry } from './types.js';
/**
 * Simple audit logger for the Real Terminal feature.
 * In production, this would write to a persistent store (file, database, etc.)
 */
export declare class AuditLogger {
    private logs;
    private maxLogs;
    constructor(options?: {
        maxLogs?: number;
    });
    /**
     * Log a command that was executed
     */
    logCommand(entry: AuditLogEntry): void;
    /**
     * Log a command that was blocked by policy
     */
    logBlocked(sessionId: string, command: string, reason: string): void;
    /**
     * Log a command that was restricted (partially allowed)
     */
    logRestricted(sessionId: string, command: string, reason: string): void;
    /**
     * Get all logs
     */
    getLogs(): AuditLogEntry[];
    /**
     * Get logs for a specific session
     */
    getSessionLogs(sessionId: string): AuditLogEntry[];
    /**
     * Clear all logs
     */
    clear(): void;
    private trimIfNeeded;
}
export declare const auditLogger: AuditLogger;
//# sourceMappingURL=logger.d.ts.map
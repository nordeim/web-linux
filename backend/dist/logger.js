/**
 * Simple audit logger for the Real Terminal feature.
 * In production, this would write to a persistent store (file, database, etc.)
 */
export class AuditLogger {
    logs = [];
    maxLogs;
    constructor(options = {}) {
        this.maxLogs = options.maxLogs ?? 1000;
    }
    /**
     * Log a command that was executed
     */
    logCommand(entry) {
        this.logs.push(entry);
        this.trimIfNeeded();
        console.log(`[AUDIT] ${entry.timestamp} | Session: ${entry.sessionId} | Action: ${entry.action} | Command: ${entry.command}`);
    }
    /**
     * Log a command that was blocked by policy
     */
    logBlocked(sessionId, command, reason) {
        this.logCommand({
            timestamp: new Date().toISOString(),
            sessionId,
            command,
            action: 'blocked',
            reason,
        });
    }
    /**
     * Log a command that was restricted (partially allowed)
     */
    logRestricted(sessionId, command, reason) {
        this.logCommand({
            timestamp: new Date().toISOString(),
            sessionId,
            command,
            action: 'restricted',
            reason,
        });
    }
    /**
     * Get all logs
     */
    getLogs() {
        return [...this.logs];
    }
    /**
     * Get logs for a specific session
     */
    getSessionLogs(sessionId) {
        return this.logs.filter((log) => log.sessionId === sessionId);
    }
    /**
     * Clear all logs
     */
    clear() {
        this.logs = [];
    }
    trimIfNeeded() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }
}
// Singleton instance for the application
export const auditLogger = new AuditLogger();
//# sourceMappingURL=logger.js.map
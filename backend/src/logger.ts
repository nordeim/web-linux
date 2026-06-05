import type { AuditLogEntry } from './types.js';

/**
 * Simple audit logger for the Real Terminal feature.
 * In production, this would write to a persistent store (file, database, etc.)
 */

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number;

  constructor(options: { maxLogs?: number } = {}) {
    this.maxLogs = options.maxLogs ?? 1000;
  }

  /**
   * Log a command that was executed
   */
  logCommand(entry: AuditLogEntry): void {
    this.logs.push(entry);
    this.trimIfNeeded();
    console.log(`[AUDIT] ${entry.timestamp} | Session: ${entry.sessionId} | Action: ${entry.action} | Command: ${entry.command}`);
  }

  /**
   * Log a command that was blocked by policy
   */
  logBlocked(sessionId: string, command: string, reason: string): void {
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
  logRestricted(sessionId: string, command: string, reason: string): void {
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
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs for a specific session
   */
  getSessionLogs(sessionId: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.sessionId === sessionId);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  private trimIfNeeded(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
}

// Singleton instance for the application
export const auditLogger = new AuditLogger();

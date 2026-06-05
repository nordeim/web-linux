import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogger } from '../logger.js';

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger({ maxLogs: 100 });
  });

  it('should log commands', () => {
    logger.logCommand({
      timestamp: '2024-01-01T00:00:00Z',
      sessionId: 'session-1',
      command: 'ls -la',
      action: 'input',
    });

    const logs = logger.getSessionLogs('session-1');
    expect(logs).toHaveLength(1);
    expect(logs[0].command).toBe('ls -la');
    expect(logs[0].action).toBe('input');
  });

  it('should log blocked commands', () => {
    logger.logBlocked('session-1', 'rm -rf /', 'Contains blocked pattern');

    const logs = logger.getSessionLogs('session-1');
    expect(logs).toHaveLength(1);
    expect(logs[0].command).toBe('rm -rf /');
    expect(logs[0].action).toBe('blocked');
    expect(logs[0].reason).toContain('blocked pattern');
  });

  it('should handle multiple sessions', () => {
    logger.logCommand({ timestamp: '2024-01-01T00:00:00Z', sessionId: 'session-1', command: 'echo a', action: 'input' });
    logger.logCommand({ timestamp: '2024-01-01T00:00:01Z', sessionId: 'session-2', command: 'echo b', action: 'input' });

    expect(logger.getSessionLogs('session-1')).toHaveLength(1);
    expect(logger.getSessionLogs('session-2')).toHaveLength(1);
  });

  it('should trim logs when max is reached', () => {
    const smallLogger = new AuditLogger({ maxLogs: 3 });
    smallLogger.logCommand({ timestamp: '2024-01-01T00:00:00Z', sessionId: 's', command: '1', action: 'input' });
    smallLogger.logCommand({ timestamp: '2024-01-01T00:00:01Z', sessionId: 's', command: '2', action: 'input' });
    smallLogger.logCommand({ timestamp: '2024-01-01T00:00:02Z', sessionId: 's', command: '3', action: 'input' });
    smallLogger.logCommand({ timestamp: '2024-01-01T00:00:03Z', sessionId: 's', command: '4', action: 'input' });

    // Should trim to last 3 (maxLogs)
    expect(smallLogger.getLogs()).toHaveLength(3);
    expect(smallLogger.getLogs()[0].command).toBe('2');
  });

  it('should clear all logs', () => {
    logger.logCommand({ timestamp: '2024-01-01T00:00:00Z', sessionId: 's', command: 'ls', action: 'input' });
    expect(logger.getLogs()).toHaveLength(1);

    logger.clear();
    expect(logger.getLogs()).toHaveLength(0);
  });
});

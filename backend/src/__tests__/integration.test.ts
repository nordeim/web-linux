import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandPolicyEngine } from '../policy.js';
import { AuditLogger } from '../logger.js';

describe('Integration: Policy + Logger', () => {
  let policy: CommandPolicyEngine;
  let logger: AuditLogger;

  beforeEach(() => {
    policy = new CommandPolicyEngine();
    logger = new AuditLogger({ maxLogs: 100 });
  });

  it('should log and allow safe commands', () => {
    const result = policy.evaluate('session-1', 'ls -la');
    expect(result.allowed).toBe(true);

    if (result.allowed) {
      logger.logCommand({
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        command: 'ls -la',
        action: 'input',
      });
    }

    const logs = logger.getSessionLogs('session-1');
    expect(logs).toHaveLength(1);
    expect(logs[0].command).toBe('ls -la');
    expect(logs[0].action).toBe('input');
  });

  it('should log and block dangerous commands', () => {
    const result = policy.evaluate('session-1', 'rm -rf /');
    expect(result.allowed).toBe(false);

    if (!result.allowed) {
      logger.logBlocked('session-1', 'rm -rf /', result.reason!);
    }

    const logs = logger.getSessionLogs('session-1');
    expect(logs).toHaveLength(1);
    expect(logs[0].command).toBe('rm -rf /');
    expect(logs[0].action).toBe('blocked');
    expect(logs[0].reason).toContain('rm -rf /');
  });

  it('should handle multiple sessions independently', () => {
    const result1 = policy.evaluate('session-1', 'echo hello');
    if (result1.allowed) {
      logger.logCommand({
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        command: 'echo hello',
        action: 'input',
      });
    }

    const result2 = policy.evaluate('session-2', 'rm -rf /');
    if (!result2.allowed) {
      logger.logBlocked('session-2', 'rm -rf /', result2.reason!);
    }

    expect(logger.getSessionLogs('session-1')).toHaveLength(1);
    expect(logger.getSessionLogs('session-2')).toHaveLength(1);
    expect(logger.getSessionLogs('session-1')[0].command).toBe('echo hello');
    expect(logger.getSessionLogs('session-2')[0].command).toBe('rm -rf /');
  });
});

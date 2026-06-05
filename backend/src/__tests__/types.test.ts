import { describe, it, expect } from 'vitest';
import type { ClientMessage, ServerMessage, AuditLogEntry } from '../types.js';

describe('Message Protocol Types', () => {
  it('should have proper ClientMessage structure for input', () => {
    const msg: ClientMessage = {
      type: 'input',
      data: 'ls -la',
    };
    expect(msg.type).toBe('input');
    expect(msg.data).toBe('ls -la');
  });

  it('should have proper ClientMessage structure for resize', () => {
    const msg: ClientMessage = {
      type: 'resize',
      cols: 80,
      rows: 24,
    };
    expect(msg.type).toBe('resize');
    expect(msg.cols).toBe(80);
    expect(msg.rows).toBe(24);
  });

  it('should have proper ClientMessage structure for close', () => {
    const msg: ClientMessage = {
      type: 'close',
    };
    expect(msg.type).toBe('close');
  });

  it('should have proper ServerMessage structure for init', () => {
    const msg: ServerMessage = {
      type: 'init',
      sessionId: 'test-123',
    };
    expect(msg.type).toBe('init');
    expect(msg.sessionId).toBe('test-123');
  });

  it('should have proper ServerMessage structure for output', () => {
    const msg: ServerMessage = {
      type: 'output',
      data: 'Hello World',
    };
    expect(msg.type).toBe('output');
    expect(msg.data).toBe('Hello World');
  });

  it('should have proper AuditLogEntry structure', () => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: 'test-session',
      command: 'ls -la',
      action: 'input',
    };
    expect(entry.sessionId).toBe('test-session');
    expect(entry.command).toBe('ls -la');
    expect(entry.action).toBe('input');
  });
});

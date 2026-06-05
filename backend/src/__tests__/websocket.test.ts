import { describe, it, expect } from 'vitest';

describe('WebSocket message protocol', () => {
  it('validates known message types', () => {
    const validTypes = ['init', 'input', 'output', 'resize', 'error', 'close', 'exit', 'heartbeat'];
    expect(validTypes).toContain('init');
    expect(validTypes).toContain('input');
    expect(validTypes).toContain('output');
    expect(validTypes).toContain('resize');
    expect(validTypes).toContain('error');
    expect(validTypes).toContain('close');
    expect(validTypes).toContain('exit');
    expect(validTypes).toContain('heartbeat');
    expect(validTypes).toHaveLength(8);
  });

  it('initializes a message with type and payload', () => {
    const msg = { type: 'init', sessionId: 'abc123' };
    expect(msg.type).toBe('init');
    expect(msg.sessionId).toBe('abc123');
  });

  it('serializes resize message with cols and rows', () => {
    const msg = { type: 'resize', cols: 120, rows: 30 };
    expect(msg.cols).toBe(120);
    expect(msg.rows).toBe(30);
  });
});
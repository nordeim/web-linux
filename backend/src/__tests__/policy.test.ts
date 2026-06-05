import { describe, it, expect } from 'vitest';
import { CommandPolicyEngine, defaultPolicy } from '../policy.js';

describe('CommandPolicyEngine', () => {
  it('should allow safe commands', () => {
    const engine = new CommandPolicyEngine(defaultPolicy);
    const result = engine.evaluate('session-1', 'ls -la');
    expect(result.allowed).toBe(true);
    expect(result.command).toBe('ls -la');
  });

  it('should block rm -rf /', () => {
    const engine = new CommandPolicyEngine(defaultPolicy);
    const result = engine.evaluate('session-1', 'rm -rf /');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('rm -rf /');
  });

  it('should block commands exceeding max length', () => {
    const engine = new CommandPolicyEngine({
      ...defaultPolicy,
      maxCommandLength: 10,
    });
    const result = engine.evaluate('session-1', 'echo this is a very long command that should be blocked');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('10 characters');
  });

  it('should update policy dynamically', () => {
    const engine = new CommandPolicyEngine(defaultPolicy);
    engine.updatePolicy({ maxCommandLength: 500 });
    expect(engine.getPolicy().maxCommandLength).toBe(500);
  });
});

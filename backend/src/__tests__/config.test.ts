import { describe, it, expect } from 'vitest';
import { ConfigSchema } from '../config.js';

describe('config', () => {
  it('validates a valid config object', () => {
    const result = ConfigSchema.safeParse({
      PORT: '3001',
      JWT_SECRET: 'my-secret',
      DOCKER_IMAGE: 'ubuntuos-terminal:latest',
      SESSION_TTL: '3600',
      GRACE_PERIOD: '300',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3001);
      expect(result.data.JWT_SECRET).toBe('my-secret');
      expect(result.data.SESSION_TTL).toBe(3600);
      expect(result.data.GRACE_PERIOD).toBe(300);
    }
  });

  it('rejects an invalid port', () => {
    const result = ConfigSchema.safeParse({ PORT: 'not-a-number' });
    expect(result.success).toBe(false);
  });

  it('applies defaults for missing optional values', () => {
    const result = ConfigSchema.safeParse({ JWT_SECRET: 'test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3001);
      expect(result.data.DOCKER_IMAGE).toBe('ubuntuos-terminal:latest');
    }
  });
});
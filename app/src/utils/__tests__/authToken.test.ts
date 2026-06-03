import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, setToken, getToken, clearToken, verifyToken } from '../authToken';

describe('authToken', () => {
  beforeEach(() => {
    clearToken();
  });

  it('should generate a valid JWT with claims', async () => {
    const token = await generateToken('TestUser');
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe('TestUser');
  });

  it('should get/set/clear token in memory', async () => {
    expect(getToken()).toBeNull();

    const token = await generateToken('User');
    setToken(token);
    expect(getToken()).toBe(token);

    clearToken();
    expect(getToken()).toBeNull();
  });
});

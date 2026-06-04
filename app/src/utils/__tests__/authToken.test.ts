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

  it('should throw in production mode to prevent client-side JWT signing', async () => {
    const originalProd = (import.meta.env as Record<string, unknown>).PROD;
    try {
      (import.meta.env as Record<string, unknown>).PROD = true;
      (import.meta.env as Record<string, unknown>).DEV = false;
      await expect(generateToken('User')).rejects.toThrow('Development-only');
    } finally {
      (import.meta.env as Record<string, unknown>).PROD = originalProd;
    }
  });
});

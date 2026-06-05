import { describe, it, expect, beforeAll } from 'vitest';
import { generateToken, verifyToken } from '../auth.js';

describe('auth', () => {
  const secret = 'test-secret-for-vitest-only';
  process.env.JWT_SECRET = secret;

  it('generates a valid signed JWT with userName claim', async () => {
    const token = await generateToken('User');
    expect(token).toBeTruthy();
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifies a valid token and returns payload', async () => {
    const token = await generateToken('User');
    const payload = await verifyToken(token, secret);
    expect(payload).toBeTruthy();
    expect(payload?.sub).toBe('User');
    expect(payload?.aud).toBe('ubuntuos-ws');
  });

  it('rejects an invalid token (bad signature)', async () => {
    const token = await generateToken('User');
    const payload = await verifyToken(token, 'wrong-secret');
    expect(payload).toBeNull();
  });

  it('rejects a tampered token', async () => {
    const token = await generateToken('User');
    const tampered = token.slice(0, -5) + 'XXXXX';
    const payload = await verifyToken(tampered, secret);
    expect(payload).toBeNull();
  });
});
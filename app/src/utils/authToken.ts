// authToken.ts — JWT token generation and management for WebSocket auth
// NOTE: This is a DEVELOPMENT-ONLY implementation.
// Production: use a backend `/auth/token` endpoint (Approach B).

// ---- Development-only secret (DO NOT USE IN PRODUCTION) ----
const DEV_SECRET = 'ubuntuos-dev-secret-do-not-use-in-production';

// In-memory token storage (cleared on page refresh by design)
let currentToken: string | null = null;

/**
 * Base64 encode helper for Node.js and browser compatibility.
 */
function b64encode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  return btoa(str);
}

/**
 * Create a simple HMAC-SHA256 signature.
 * This is a DEV-ONLY implementation. Production must use a backend endpoint.
 */
async function createHmac(message: string, key: string): Promise<string> {
  // Use subtle crypto if available (browser with Web Crypto)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return b64encode(String.fromCharCode(...new Uint8Array(signature)));
  }
  // Fallback: simple hash for dev/testing (NOT secure, NOT for production)
  return b64encode(`${key}:${message}`).slice(0, 43);
}

/**
 * Generate a simple JWT-like token for development.
 * Production must use a backend `/auth/token` endpoint.
 *
 * WARNING: This is NOT cryptographically secure. It is for
 * development and testing only.
 */
export async function generateToken(userName: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userName,
    iat: now,
    exp: now + 86400, // 24 hours
  };

  const encodedHeader = b64encode(JSON.stringify(header));
  const encodedPayload = b64encode(JSON.stringify(payload));
  const toSign = `${encodedHeader}.${encodedPayload}`;
  const signature = await createHmac(toSign, DEV_SECRET);

  return `${toSign}.${signature}`;
}

/**
 * Store the current token in memory.
 */
export function setToken(token: string | null): void {
  currentToken = token;
}

/**
 * Get the current token from memory.
 */
export function getToken(): string | null {
  return currentToken;
}

/**
 * Clear the current token.
 */
export function clearToken(): void {
  currentToken = null;
}

/**
 * Verify a token (for testing purposes). Returns the payload subject or null.
 */
export function verifyToken(token: string): { sub: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

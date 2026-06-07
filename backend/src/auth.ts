import { SignJWT, jwtVerify } from 'jose';

export class JwtSecretMissingError extends Error {
  constructor() {
    super('JWT_SECRET environment variable is required to sign or verify tokens. Refusing to use a silent dev fallback.');
    this.name = 'JwtSecretMissingError';
  }
}

const getSecretFromEnv = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new JwtSecretMissingError();
  }
  return new TextEncoder().encode(secret);
};

export interface TokenPayload {
  sub: string;
  aud: string;
  iat: number;
  exp: number;
}

export async function generateToken(userName: string): Promise<string> {
  const secret = getSecretFromEnv();
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ sub: userName })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('ubuntuos-ws')
    .setIssuedAt(now)
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string, secretOverride?: string): Promise<TokenPayload | null> {
  try {
    const secret = secretOverride
      ? new TextEncoder().encode(secretOverride)
      : getSecretFromEnv();

    const { payload } = await jwtVerify(token, secret, {
      audience: 'ubuntuos-ws',
    });

    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
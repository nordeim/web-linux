import { SignJWT, jwtVerify } from 'jose';

const getSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET ?? 'ubuntuos-dev-secret-change-me';
  return new TextEncoder().encode(secret);
};

export interface TokenPayload {
  sub: string;
  aud: string;
  iat: number;
  exp: number;
}

export async function generateToken(userName: string): Promise<string> {
  const secret = getSecret();
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
      : getSecret();

    const { payload } = await jwtVerify(token, secret, {
      audience: 'ubuntuos-ws',
    });

    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
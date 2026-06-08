import { SignJWT, jwtVerify } from 'jose';
export class JwtSecretMissingError extends Error {
    constructor() {
        super('JWT_SECRET environment variable is required to sign or verify tokens. Refusing to use a silent dev fallback.');
        this.name = 'JwtSecretMissingError';
    }
}
const getSecretFromEnv = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
        throw new JwtSecretMissingError();
    }
    return new TextEncoder().encode(secret);
};
export async function generateToken(userName) {
    const secret = getSecretFromEnv();
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ sub: userName })
        .setProtectedHeader({ alg: 'HS256' })
        .setAudience('ubuntuos-ws')
        .setIssuedAt(now)
        .setExpirationTime('24h')
        .sign(secret);
}
export async function verifyToken(token, secretOverride) {
    try {
        const secret = secretOverride
            ? new TextEncoder().encode(secretOverride)
            : getSecretFromEnv();
        const { payload } = await jwtVerify(token, secret, {
            audience: 'ubuntuos-ws',
        });
        return payload;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=auth.js.map
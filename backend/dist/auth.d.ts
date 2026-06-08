export declare class JwtSecretMissingError extends Error {
    constructor();
}
export interface TokenPayload {
    sub: string;
    aud: string;
    iat: number;
    exp: number;
}
export declare function generateToken(userName: string): Promise<string>;
export declare function verifyToken(token: string, secretOverride?: string): Promise<TokenPayload | null>;
//# sourceMappingURL=auth.d.ts.map
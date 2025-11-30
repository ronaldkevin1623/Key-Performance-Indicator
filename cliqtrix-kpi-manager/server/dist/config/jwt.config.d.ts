export interface JWTPayload {
    userId: string;
    email: string;
    role: 'admin' | 'employee';
    companyId: string;
}
/**
 * Generate access token
 */
export declare const generateAccessToken: (payload: JWTPayload) => string;
/**
 * Generate refresh token
 */
export declare const generateRefreshToken: (userId: string) => string;
/**
 * Verify access token
 */
export declare const verifyAccessToken: (token: string) => JWTPayload;
/**
 * Verify refresh token
 */
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
};
/**
 * Generate token pair (access + refresh)
 */
export declare const generateTokenPair: (payload: JWTPayload) => {
    accessToken: string;
    refreshToken: string;
};
/**
 * Decode token without verification (for debugging)
 */
export declare const decodeToken: (token: string) => JWTPayload | null;
declare const _default: {
    generateAccessToken: (payload: JWTPayload) => string;
    generateRefreshToken: (userId: string) => string;
    verifyAccessToken: (token: string) => JWTPayload;
    verifyRefreshToken: (token: string) => {
        userId: string;
    };
    generateTokenPair: (payload: JWTPayload) => {
        accessToken: string;
        refreshToken: string;
    };
    decodeToken: (token: string) => JWTPayload | null;
};
export default _default;
//# sourceMappingURL=jwt.config.d.ts.map
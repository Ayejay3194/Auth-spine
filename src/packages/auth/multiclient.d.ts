/**
 * Multiclient Authentication Module
 * Handles JWT verification, audience validation, scope checking, and risk state management
 */
export type RiskState = 'ok' | 'restricted' | 'banned';
export type SpineJwtClaims = {
    iss: string;
    sub: string;
    aud: string;
    scp: string[];
    risk: RiskState;
    entitlements: Record<string, boolean>;
};
export type JwtAlgorithm = 'HS256' | 'RS256';
/**
 * Verify HS256 Bearer token and extract claims
 */
export declare function verifyHs256Bearer(authorization: string | undefined, issuer: string, secret: string): Promise<SpineJwtClaims>;
/**
 * Verify Bearer token (HS256 or RS256) and extract claims
 */
export declare function verifyBearer(authorization: string | undefined, issuer: string, options?: {
    alg?: JwtAlgorithm;
    secret?: string;
    publicKey?: string;
}): Promise<SpineJwtClaims>;
/**
 * Validator: Require specific audience (client_id)
 */
export declare function requireAudience(expectedAud: string): (claims: SpineJwtClaims) => void;
/**
 * Validator: Require specific scopes
 */
export declare function requireScopes(requiredScopes: string[]): (claims: SpineJwtClaims) => void;
/**
 * Validator: Deny banned users
 */
export declare function denyIfBanned(): (claims: SpineJwtClaims) => void;
/**
 * Validator: Check if user is restricted
 */
export declare function checkIfRestricted(): (claims: SpineJwtClaims) => {
    restricted: boolean;
    message: string;
} | {
    restricted: boolean;
    message?: undefined;
};
/**
 * Check if user has specific entitlement
 */
export declare function hasEntitlement(entitlementKey: string): (claims: SpineJwtClaims) => boolean;
/**
 * Check if user has any of the given scopes
 */
export declare function hasAnyScope(scopes: string[]): (claims: SpineJwtClaims) => boolean;
/**
 * Check if user has all of the given scopes
 */
export declare function hasAllScopes(scopes: string[]): (claims: SpineJwtClaims) => boolean;

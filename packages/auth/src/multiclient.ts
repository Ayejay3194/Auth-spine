/**
 * Multiclient Authentication Module
 * Handles JWT verification, audience validation, scope checking, and risk state management
 */

import { jwtVerify } from 'jose'
import { AuthError, ErrorCode } from './index'

export type RiskState = 'ok' | 'restricted' | 'banned'

export type SpineJwtClaims = {
  iss: string
  sub: string
  aud: string           // client_id
  scp: string[]         // scopes
  risk: RiskState
  entitlements: Record<string, boolean>
}

/**
 * Verify HS256 Bearer token and extract claims
 */
export async function verifyHs256Bearer(
  authorization: string | undefined,
  issuer: string,
  secret: string
): Promise<SpineJwtClaims> {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('missing_bearer', ErrorCode.AUTH_MISSING_TOKEN)
  }
  
  const token = authorization.slice('Bearer '.length)
  const key = new TextEncoder().encode(secret)
  
  try {
    const { payload } = await jwtVerify(token, key, { issuer })
    const p = payload as any
    
    return {
      iss: String(p.iss),
      sub: String(p.sub),
      aud: String(p.aud),
      scp: Array.isArray(p.scp) ? p.scp.map(String) : [],
      risk: (p.risk ?? 'ok') as RiskState,
      entitlements: (p.entitlements ?? {}) as Record<string, boolean>
    }
  } catch (error: any) {
    throw new AuthError(error?.message || 'Token verification failed', ErrorCode.AUTH_INVALID_TOKEN)
  }
}

/**
 * Validator: Require specific audience (client_id)
 */
export function requireAudience(expectedAud: string) {
  return (claims: SpineJwtClaims) => {
    if (claims.aud !== expectedAud) {
      throw new AuthError(`wrong_audience: expected ${expectedAud}, got ${claims.aud}`, ErrorCode.AUTH_WRONG_CLIENT)
    }
  }
}

/**
 * Validator: Require specific scopes
 */
export function requireScopes(requiredScopes: string[]) {
  return (claims: SpineJwtClaims) => {
    const claimScopes = new Set(claims.scp)
    const missing = requiredScopes.filter(s => !claimScopes.has(s))
    
    if (missing.length > 0) {
      throw new AuthError(`missing_scopes: ${missing.join(', ')}`, ErrorCode.AUTH_MISSING_SCOPE)
    }
  }
}

/**
 * Validator: Deny banned users
 */
export function denyIfBanned() {
  return (claims: SpineJwtClaims) => {
    if (claims.risk === 'banned') {
      throw new AuthError('user_banned', ErrorCode.AUTH_BANNED)
    }
  }
}

/**
 * Validator: Check if user is restricted
 */
export function checkIfRestricted() {
  return (claims: SpineJwtClaims) => {
    if (claims.risk === 'restricted') {
      return { restricted: true, message: 'User account is restricted' }
    }
    return { restricted: false }
  }
}

/**
 * Check if user has specific entitlement
 */
export function hasEntitlement(entitlementKey: string) {
  return (claims: SpineJwtClaims): boolean => {
    return claims.entitlements[entitlementKey] === true
  }
}

/**
 * Check if user has any of the given scopes
 */
export function hasAnyScope(scopes: string[]) {
  return (claims: SpineJwtClaims): boolean => {
    const claimScopes = new Set(claims.scp)
    return scopes.some(s => claimScopes.has(s))
  }
}

/**
 * Check if user has all of the given scopes
 */
export function hasAllScopes(scopes: string[]) {
  return (claims: SpineJwtClaims): boolean => {
    const claimScopes = new Set(claims.scp)
    return scopes.every(s => claimScopes.has(s))
  }
}

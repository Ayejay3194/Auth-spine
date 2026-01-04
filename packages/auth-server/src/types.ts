import { JwtPayload } from 'jose'

export type RiskState = 'ok' | 'restricted' | 'banned'

export interface SpineJwtClaims extends JwtPayload {
  sub: string
  aud: string
  scp: string[]
  risk: RiskState
  entitlements: Record<string, boolean>
}

export interface Session {
  id: string
  userId: string
  clientId: string
  scopes: string[]
  risk: RiskState
  entitlements: Record<string, boolean>
  createdAt: number
  expiresAt: number
}

export interface RefreshToken {
  id: string
  sessionId: string
  userId: string
  expiresAt: number
}

export interface AuditEvent {
  id: string
  eventType: string
  userId?: string
  clientId?: string
  createdAt: number
  metadata?: Record<string, unknown>
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export const ALLOWED_SCOPES = ['read', 'write', 'delete', 'admin'] as const
export type AllowedScope = typeof ALLOWED_SCOPES[number]

export function isValidScope(scope: string): scope is AllowedScope {
  return ALLOWED_SCOPES.includes(scope as AllowedScope)
}

export function validateScopes(scopes: unknown): AllowedScope[] {
  if (!Array.isArray(scopes)) {
    throw new AuthError('Scopes must be an array', 'INVALID_SCOPES', 400)
  }
  
  const validScopes: AllowedScope[] = []
  for (const scope of scopes) {
    if (typeof scope !== 'string') {
      throw new AuthError('Each scope must be a string', 'INVALID_SCOPE_TYPE', 400)
    }
    if (!isValidScope(scope)) {
      throw new AuthError(`Invalid scope: ${scope}`, 'INVALID_SCOPE', 400)
    }
    validScopes.push(scope)
  }
  
  return validScopes
}

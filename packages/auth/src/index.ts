import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

export type RiskState = 'ok' | 'restricted' | 'banned'

export type JwtPayload = {
  userId: string
  email?: string
  role?: string
  // Multiclient extensions
  aud?: string           // client_id
  scp?: string[]         // scopes
  risk?: RiskState
  entitlements?: Record<string, boolean>
}

export type SpineJwtClaims = {
  iss: string
  sub: string
  aud: string           // client_id
  scp: string[]         // scopes
  risk: RiskState
  entitlements: Record<string, boolean>
}

export enum ErrorCode {
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_MISSING_TOKEN = 'AUTH_MISSING_TOKEN',
  AUTH_EXPIRED_TOKEN = 'AUTH_EXPIRED_TOKEN',
  AUTH_WRONG_CLIENT = 'AUTH_WRONG_CLIENT',
  AUTH_MISSING_SCOPE = 'AUTH_MISSING_SCOPE',
  AUTH_BANNED = 'AUTH_BANNED'
}

export class AuthError extends Error {
  public readonly code: ErrorCode

  constructor(message: string, code: ErrorCode) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}

function getKey() {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  return new TextEncoder().encode(secret)
}

export async function generateToken(payload: JwtPayload, opts?: { expiresIn?: string }) {
  const exp = opts?.expiresIn || '24h'
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getKey())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    return payload as any as JwtPayload
  } catch (e: any) {
    throw new AuthError(e?.message || 'Invalid token', ErrorCode.AUTH_UNAUTHORIZED)
  }
}

// Multiclient verification functions
export async function verifyHs256Bearer(authorization: string | undefined, issuer: string, secret: string): Promise<SpineJwtClaims> {
  if (!authorization || !authorization.startsWith('Bearer ')) throw new AuthError('missing_bearer', ErrorCode.AUTH_MISSING_TOKEN)
  const token = authorization.slice('Bearer '.length)
  const key = new TextEncoder().encode(secret)
  const { payload } = await jwtVerify(token, key, { issuer })
  const p = payload as any
  return {
    iss: String(p.iss),
    sub: String(p.sub),
    aud: String(p.aud),
    scp: Array.isArray(p.scp) ? p.scp.map(String) : [],
    risk: (p.risk ?? 'ok'),
    entitlements: (p.entitlements ?? {}) as Record<string, boolean>
  }
}

export function requireAudience(aud: string) {
  return (c: SpineJwtClaims) => { 
    if (c.aud !== aud) throw new AuthError('wrong_audience', ErrorCode.AUTH_WRONG_CLIENT) 
  }
}

export function requireScopes(scopes: string[]) {
  return (c: SpineJwtClaims) => {
    const set = new Set(c.scp)
    for (const s of scopes) if (!set.has(s)) throw new AuthError('missing_scope:' + s, ErrorCode.AUTH_MISSING_SCOPE)
  }
}

export function denyIfBanned() {
  return (c: SpineJwtClaims) => { 
    if (c.risk === 'banned') throw new AuthError('banned', ErrorCode.AUTH_BANNED) 
  }
}

export async function hashPassword(password: string, saltRounds: number = 12) {
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function validateEnv() {
  const required = ['JWT_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new AuthError(
      `Missing required environment variables: ${missing.join(', ')}`,
      ErrorCode.AUTH_UNAUTHORIZED
    )
  }
  
  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12')
  }
}

export * from './password'
export * from './next'

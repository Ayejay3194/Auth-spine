import { SignJWT, jwtVerify } from 'jose'
import { createPrivateKey, createPublicKey, createSecretKey } from 'crypto'
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

type JwtAlgorithm = 'HS256' | 'RS256'

function getAlgorithm(): JwtAlgorithm {
  return (process.env.JWT_ALG ?? 'HS256') as JwtAlgorithm
}

function getSigningKey() {
  const alg = getAlgorithm()
  if (alg === 'HS256') {
    const secret = process.env.JWT_SECRET?.trim()
    if (!secret) {
      throw new AuthError('JWT_SECRET environment variable is required', ErrorCode.AUTH_UNAUTHORIZED)
    }
    return { key: createSecretKey(Buffer.from(secret, 'utf-8')), alg }
  }
  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) throw new AuthError('Missing JWT_PRIVATE_KEY', ErrorCode.AUTH_UNAUTHORIZED)
  return { key: createPrivateKey(privateKey), alg }
}

function getVerifyKey() {
  const alg = getAlgorithm()
  if (alg === 'HS256') {
    const secret = process.env.JWT_SECRET?.trim()
    if (!secret) {
      throw new AuthError('JWT_SECRET environment variable is required', ErrorCode.AUTH_UNAUTHORIZED)
    }
    return { key: createSecretKey(Buffer.from(secret, 'utf-8')), alg }
  }
  const publicKey = process.env.JWT_PUBLIC_KEY
  if (!publicKey) throw new AuthError('Missing JWT_PUBLIC_KEY', ErrorCode.AUTH_UNAUTHORIZED)
  return { key: createPublicKey(publicKey), alg }
}

export async function generateToken(payload: JwtPayload, opts?: { expiresIn?: string }) {
  const exp = opts?.expiresIn || '24h'
  const { key, alg } = getSigningKey()
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key)
}

export async function verifyToken(token: string) {
  try {
    const { key, alg } = getVerifyKey()
    const { payload } = await jwtVerify(token, key, { algorithms: [alg] })
    return payload as any as JwtPayload
  } catch (e: any) {
    throw new AuthError(e?.message || 'Invalid token', ErrorCode.AUTH_UNAUTHORIZED)
  }
}

// Multiclient verification functions
export async function verifyBearer(authorization: string | undefined, issuer: string, options: { alg?: JwtAlgorithm; secret?: string; publicKey?: string } = {}): Promise<SpineJwtClaims> {
  if (!authorization || !authorization.startsWith('Bearer ')) throw new AuthError('missing_bearer', ErrorCode.AUTH_MISSING_TOKEN)
  const token = authorization.slice('Bearer '.length)
  const alg = options.alg ?? getAlgorithm()
  const key = alg === 'HS256'
    ? createSecretKey(Buffer.from(options.secret ?? process.env.JWT_SECRET ?? 'your-secret-key-change-in-production', 'utf-8'))
    : (() => {
        const publicKey = options.publicKey ?? process.env.JWT_PUBLIC_KEY
        if (!publicKey) throw new AuthError('Missing JWT_PUBLIC_KEY', ErrorCode.AUTH_UNAUTHORIZED)
        return createPublicKey(publicKey)
      })()
  const { payload } = await jwtVerify(token, key, { issuer, algorithms: [alg] })
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

export async function verifyHs256Bearer(authorization: string | undefined, issuer: string, secret: string): Promise<SpineJwtClaims> {
  return verifyBearer(authorization, issuer, { alg: 'HS256', secret })
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
export * from './multiclient'

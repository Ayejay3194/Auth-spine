import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

export type JwtPayload = {
  userId: string
  email?: string
  role?: string
}

export enum ErrorCode {
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_MISSING_TOKEN = 'AUTH_MISSING_TOKEN',
  AUTH_EXPIRED_TOKEN = 'AUTH_EXPIRED_TOKEN'
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

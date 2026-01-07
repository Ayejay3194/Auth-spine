/**
 * Authentication Module
 * Handles user authentication, token generation, and validation
 */

import { prisma } from '@/lib/prisma';
import * as jose from 'jose';
import * as argon2 from 'argon2';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Authenticate user with credentials
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  });

  if (!user || !user.password) {
    return null;
  }

  const isValid = await argon2.verify(user.password, credentials.password);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role || 'user'
  };
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(user: AuthUser): Promise<string> {
  const token = await new jose.SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT access token
 */
export async function verifyAccessToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return {
      id: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string
    };
  } catch (error) {
    return null;
  }
}

/**
 * Hash password with argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

/**
 * Verify password hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

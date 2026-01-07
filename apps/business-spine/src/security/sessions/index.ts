/**
 * Session Management Module
 * Database-backed session handling
 */

import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateSessionOptions {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresIn?: number; // seconds, default 24 hours
}

/**
 * Create new session
 */
export async function createSession(options: CreateSessionOptions): Promise<Session> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresIn = options.expiresIn || 86400; // 24 hours default
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  const session = await prisma.session.create({
    data: {
      userId: options.userId,
      token,
      expiresAt,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent
    }
  });

  return session;
}

/**
 * Get session by token
 */
export async function getSession(token: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { token }
  });

  if (!session) {
    return null;
  }

  // Check if expired
  if (session.expiresAt < new Date()) {
    await deleteSession(token);
    return null;
  }

  return session;
}

/**
 * Delete session
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token }
  }).catch(() => {
    // Ignore if session doesn't exist
  });
}

/**
 * Delete all sessions for user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId }
  });
}

/**
 * Extend session expiration
 */
export async function extendSession(token: string, expiresIn: number = 86400): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  
  await prisma.session.update({
    where: { token },
    data: { expiresAt }
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  return result.count;
}

/**
 * Get all sessions for user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gte: new Date()
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

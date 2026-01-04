/**
 * Persistent Session Store
 * 
 * This module provides a database-backed session store to replace
 * the in-memory session storage for better durability and scalability.
 */

import { prisma } from '../business-spine/lib/prisma';
import { Session, RefreshToken } from './types';
import { randomBytes } from 'crypto';

export class SessionStore {
  /**
   * Create a new session
   */
  async createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'expiresAt'>): Promise<Session> {
    const sessionId = randomBytes(16).toString('hex');
    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      const session = await prisma.session.create({
        data: {
          id: sessionId,
          userId: sessionData.userId,
          clientId: sessionData.clientId,
          scopes: sessionData.scopes,
          risk: sessionData.risk,
          entitlements: sessionData.entitlements,
          createdAt: new Date(now),
          expiresAt: new Date(expiresAt)
        }
      });

      return {
        id: session.id,
        userId: session.userId,
        clientId: session.clientId,
        scopes: session.scopes as string[],
        risk: session.risk as 'ok' | 'restricted' | 'banned',
        entitlements: session.entitlements as Record<string, boolean>,
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime()
      };
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session || session.expiresAt < new Date()) {
        // Session expired or not found, clean it up
        if (session) {
          await this.deleteSession(sessionId);
        }
        return null;
      }

      return {
        id: session.id,
        userId: session.userId,
        clientId: session.clientId,
        scopes: session.scopes as string[],
        risk: session.risk as 'ok' | 'restricted' | 'banned',
        entitlements: session.entitlements as Record<string, boolean>,
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime()
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Delete session by ID
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.session.delete({
        where: { id: sessionId }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(tokenData: Omit<RefreshToken, 'id' | 'expiresAt'>): Promise<RefreshToken> {
    const tokenId = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      const refreshToken = await prisma.refreshToken.create({
        data: {
          id: tokenId,
          sessionId: tokenData.sessionId,
          userId: tokenData.userId,
          expiresAt: new Date(expiresAt)
        }
      });

      return {
        id: refreshToken.id,
        sessionId: refreshToken.sessionId,
        userId: refreshToken.userId,
        expiresAt: refreshToken.expiresAt.getTime()
      };
    } catch (error) {
      console.error('Failed to create refresh token:', error);
      throw new Error('Refresh token creation failed');
    }
  }

  /**
   * Get refresh token by ID
   */
  async getRefreshToken(tokenId: string): Promise<RefreshToken | null> {
    try {
      const token = await prisma.refreshToken.findUnique({
        where: { id: tokenId }
      });

      if (!token || token.expiresAt < new Date()) {
        // Token expired or not found, clean it up
        if (token) {
          await this.deleteRefreshToken(tokenId);
        }
        return null;
      }

      return {
        id: token.id,
        sessionId: token.sessionId,
        userId: token.userId,
        expiresAt: token.expiresAt.getTime()
      };
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Delete refresh token by ID
   */
  async deleteRefreshToken(tokenId: string): Promise<boolean> {
    try {
      await prisma.refreshToken.delete({
        where: { id: tokenId }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete refresh token:', error);
      return false;
    }
  }

  /**
   * Delete all refresh tokens for a session
   */
  async deleteRefreshTokensForSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { sessionId }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete refresh tokens for session:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions and tokens
   */
  async cleanupExpired(): Promise<{ sessionsDeleted: number; tokensDeleted: number }> {
    const now = new Date();
    
    try {
      const [sessionsResult, tokensResult] = await Promise.all([
        prisma.session.deleteMany({
          where: { expiresAt: { lt: now } }
        }),
        prisma.refreshToken.deleteMany({
          where: { expiresAt: { lt: now } }
        })
      ]);

      return {
        sessionsDeleted: sessionsResult.count,
        tokensDeleted: tokensResult.count
      };
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return { sessionsDeleted: 0, tokensDeleted: 0 };
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      return sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        clientId: session.clientId,
        scopes: session.scopes as string[],
        risk: session.risk as 'ok' | 'restricted' | 'banned',
        entitlements: session.entitlements as Record<string, boolean>,
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime()
      }));
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

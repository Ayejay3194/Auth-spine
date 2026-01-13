import { prisma } from "@/lib/prisma";

/**
 * Session management with timeout and concurrent session limits
 */

const CONFIG = {
  SESSION_TIMEOUT_MS: parseInt(process.env.SESSION_TIMEOUT_MS || "1800000"), // 30 minutes
  SESSION_ABSOLUTE_TIMEOUT_MS: parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_MS || "86400000"), // 24 hours
  MAX_CONCURRENT_SESSIONS: 1, // Only 1 active session per user
};

/**
 * Check if session is still valid (not expired)
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { expiresAt: true, revokedAt: true, lastActivityAt: true }
  });

  if (!session || session.revokedAt) {
    return false;
  }

  const now = new Date();

  // Check absolute expiration
  if (session.expiresAt < now) {
    return false;
  }

  // Check inactivity timeout
  if (session.lastActivityAt) {
    const inactiveMs = now.getTime() - session.lastActivityAt.getTime();
    if (inactiveMs > CONFIG.SESSION_TIMEOUT_MS) {
      return false;
    }
  }

  return true;
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastActivityAt: new Date() }
  });
}

/**
 * Revoke all other sessions for a user (enforce single session)
 */
export async function revokeOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  await prisma.session.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      revokedAt: null
    },
    data: { revokedAt: new Date() }
  });
}

/**
 * Revoke all sessions for a user (logout everywhere)
 */
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null
    },
    data: { revokedAt: new Date() }
  });
}

/**
 * Clean up expired sessions (call periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });

  return result.count;
}

/**
 * Clean up inactive sessions
 */
export async function cleanupInactiveSessions(): Promise<number> {
  const cutoffTime = new Date(Date.now() - CONFIG.SESSION_TIMEOUT_MS);

  const result = await prisma.session.updateMany({
    where: {
      lastActivityAt: { lt: cutoffTime },
      revokedAt: null
    },
    data: { revokedAt: new Date() }
  });

  return result.count;
}

// Run cleanup every 10 minutes
setInterval(async () => {
  try {
    const expiredCount = await cleanupExpiredSessions();
    const inactiveCount = await cleanupInactiveSessions();
    
    if (expiredCount > 0 || inactiveCount > 0) {
      console.log(`[SessionManager] Cleaned up ${expiredCount} expired and ${inactiveCount} inactive sessions`);
    }
  } catch (error) {
    console.error("[SessionManager] Cleanup error:", error);
  }
}, 10 * 60 * 1000);

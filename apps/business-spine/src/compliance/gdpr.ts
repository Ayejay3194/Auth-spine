/**
 * GDPR Compliance Utilities
 * Data privacy and protection features
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DataExportRequest {
  userId: string;
  email: string;
  requestedAt: Date;
}

export interface DataDeletionRequest {
  userId: string;
  email: string;
  reason?: string;
  requestedAt: Date;
}

/**
 * Export all user data (GDPR Right to Data Portability)
 */
export async function exportUserData(userId: string): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sessions: true,
      bookings: true,
      reviews: true,
      payments: true,
      // Add other related data
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Remove sensitive data
  const { password, ...userData } = user as any;

  return {
    exportedAt: new Date().toISOString(),
    format: 'JSON',
    data: userData,
  };
}

/**
 * Delete all user data (GDPR Right to Erasure)
 */
export async function deleteUserData(userId: string, retainAudit: boolean = true): Promise<void> {
  // Start transaction
  await prisma.$transaction(async (tx) => {
    // Anonymize or delete bookings
    await tx.booking.updateMany({
      where: { clientId: userId },
      data: {
        clientId: null,
        anonymized: true,
      },
    });

    // Delete sessions
    await tx.session.deleteMany({
      where: { userId },
    });

    // Delete reviews
    await tx.review.deleteMany({
      where: { userId },
    });

    // Anonymize payments (keep for accounting)
    await tx.payment.updateMany({
      where: { userId },
      data: {
        userId: null,
        anonymized: true,
      },
    });

    if (retainAudit) {
      // Create audit log entry before deletion
      await tx.auditLog.create({
        data: {
          eventType: 'USER_DELETED',
          userId,
          metadata: { reason: 'GDPR_ERASURE_REQUEST' },
        },
      });
    }

    // Finally, delete user
    await tx.user.delete({
      where: { id: userId },
    });
  });
}

/**
 * Get user consent status
 */
export async function getUserConsent(userId: string) {
  return await prisma.userConsent.findMany({
    where: { userId },
    orderBy: { grantedAt: 'desc' },
  });
}

/**
 * Record user consent
 */
export async function recordConsent(
  userId: string,
  consentType: string,
  granted: boolean,
  metadata?: any
) {
  return await prisma.userConsent.create({
    data: {
      userId,
      consentType,
      granted,
      grantedAt: new Date(),
      metadata,
    },
  });
}

/**
 * Anonymize old data (GDPR Data Minimization)
 */
export async function anonymizeOldData(days: number = 730) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  await prisma.$transaction(async (tx) => {
    // Anonymize old bookings
    await tx.booking.updateMany({
      where: {
        createdAt: { lt: cutoffDate },
        anonymized: false,
      },
      data: {
        clientEmail: 'anonymized@example.com',
        clientPhone: null,
        clientNotes: null,
        anonymized: true,
      },
    });

    // Anonymize old sessions
    await tx.session.deleteMany({
      where: {
        expiresAt: { lt: cutoffDate },
      },
    });
  });
}

/**
 * Get data retention policy
 */
export function getDataRetentionPolicy() {
  return {
    bookings: '2 years',
    sessions: 'Until expiry',
    auditLogs: '7 years',
    payments: '7 years (legal requirement)',
    analytics: '2 years (anonymized)',
  };
}


/**
 * Audit Logging Module
 * Tracks security-relevant events and user actions
 */

import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'user:login'
  | 'user:logout'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'mfa:enroll'
  | 'mfa:verify'
  | 'mfa:disable'
  | 'session:create'
  | 'session:delete'
  | 'permission:grant'
  | 'permission:revoke'
  | 'kill_switch:activate'
  | 'kill_switch:deactivate'
  | 'launch_gate:update'
  | 'data:access'
  | 'data:modify'
  | 'data:delete';

export interface AuditEntry {
  id: string;
  userId: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface CreateAuditOptions {
  userId: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(options: CreateAuditOptions): Promise<AuditEntry> {
  const entry = await prisma.auditLog.create({
    data: {
      userId: options.userId,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId,
      metadata: options.metadata || {},
      ipAddress: options.ipAddress,
      userAgent: options.userAgent
    }
  });

  return entry;
}

/**
 * Get audit logs for user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AuditEntry[]> {
  return prisma.auditLog.findMany({
    where: {
      userId,
      action: options?.action,
      timestamp: {
        gte: options?.startDate,
        lte: options?.endDate
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: options?.limit || 100,
    skip: options?.offset || 0
  });
}

/**
 * Get audit logs for resource
 */
export async function getResourceAuditLogs(
  resource: string,
  resourceId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<AuditEntry[]> {
  return prisma.auditLog.findMany({
    where: {
      resource,
      resourceId
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: options?.limit || 100,
    skip: options?.offset || 0
  });
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  filters: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<AuditEntry[]> {
  return prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      action: filters.action,
      resource: filters.resource,
      timestamp: {
        gte: filters.startDate,
        lte: filters.endDate
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: filters.limit || 100,
    skip: filters.offset || 0
  });
}

/**
 * Delete old audit logs (retention policy)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate
      }
    }
  });

  return result.count;
}

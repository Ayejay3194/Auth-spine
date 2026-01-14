import { AuditEvent, AuditFilter } from './types';

export class AuditStorage {
  private static instance: AuditStorage;

  private constructor() {}

  static getInstance(): AuditStorage {
    if (!AuditStorage.instance) {
      AuditStorage.instance = new AuditStorage();
    }
    return AuditStorage.instance;
  }

  async query(filter: AuditFilter): Promise<AuditEvent[]> {
    try {
      const { prisma } = await import('@spine/shared/prisma');

      const where: any = {};

      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }

      if (filter.eventTypes && filter.eventTypes.length > 0) {
        where.eventType = { in: filter.eventTypes };
      }

      if (filter.categories && filter.categories.length > 0) {
        where.category = { in: filter.categories };
      }

      if (filter.severities && filter.severities.length > 0) {
        where.severity = { in: filter.severities };
      }

      if (filter.userId) {
        where.userId = filter.userId;
      }

      if (filter.clientId) {
        where.clientId = filter.clientId;
      }

      if (filter.sessionId) {
        where.sessionId = filter.sessionId;
      }

      if (filter.success !== undefined) {
        where.success = filter.success;
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 1000,
        skip: filter.offset || 0,
      });

      return logs.map(log => ({
        id: log.id,
        eventType: log.eventType as any,
        category: log.category as any,
        severity: log.severity as any,
        userId: log.userId || undefined,
        clientId: log.clientId || undefined,
        sessionId: log.sessionId || undefined,
        timestamp: log.createdAt.getTime(),
        duration: log.duration || undefined,
        success: log.success,
        metadata: (log.metadata as Record<string, any>) || undefined,
        error: log.error as any,
        context: log.context as any,
      }));
    } catch (error) {
      console.error('[AuditStorage] Query failed:', error);
      return [];
    }
  }

  async count(filter: AuditFilter): Promise<number> {
    try {
      const { prisma } = await import('@spine/shared/prisma');

      const where: any = {};

      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }

      if (filter.eventTypes && filter.eventTypes.length > 0) {
        where.eventType = { in: filter.eventTypes };
      }

      if (filter.categories && filter.categories.length > 0) {
        where.category = { in: filter.categories };
      }

      if (filter.severities && filter.severities.length > 0) {
        where.severity = { in: filter.severities };
      }

      if (filter.userId) where.userId = filter.userId;
      if (filter.clientId) where.clientId = filter.clientId;
      if (filter.sessionId) where.sessionId = filter.sessionId;
      if (filter.success !== undefined) where.success = filter.success;

      return await prisma.auditLog.count({ where });
    } catch (error) {
      console.error('[AuditStorage] Count failed:', error);
      return 0;
    }
  }

  async deleteOlderThan(date: Date): Promise<number> {
    try {
      const { prisma } = await import('@spine/shared/prisma');
      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: date },
        },
      });
      return result.count;
    } catch (error) {
      console.error('[AuditStorage] Delete failed:', error);
      return 0;
    }
  }

  async getById(id: string): Promise<AuditEvent | null> {
    try {
      const { prisma } = await import('@spine/shared/prisma');
      const log = await prisma.auditLog.findUnique({
        where: { id },
      });

      if (!log) return null;

      return {
        id: log.id,
        eventType: log.eventType as any,
        category: log.category as any,
        severity: log.severity as any,
        userId: log.userId || undefined,
        clientId: log.clientId || undefined,
        sessionId: log.sessionId || undefined,
        timestamp: log.createdAt.getTime(),
        duration: log.duration || undefined,
        success: log.success,
        metadata: (log.metadata as Record<string, any>) || undefined,
        error: log.error as any,
        context: log.context as any,
      };
    } catch (error) {
      console.error('[AuditStorage] GetById failed:', error);
      return null;
    }
  }
}

export const auditStorage = AuditStorage.getInstance();

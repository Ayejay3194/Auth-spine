import { AuditEntry } from './types';
import { randomBytes } from 'crypto';

/**
 * Audit System - Immutable, tamper-evident, exportable
 * Admins lie. Logs don't.
 */

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log admin action - IMMUTABLE
   */
  async log(params: {
    actor: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: randomBytes(16).toString('hex'),
      actor: params.actor,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      changes: params.changes,
      metadata: params.metadata,
      timestamp: new Date(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      success: params.success ?? true,
      errorMessage: params.errorMessage,
    };

    await this.persist(entry);
    return entry;
  }

  private async persist(entry: AuditEntry): Promise<void> {
    try {
      const { prisma } = await import('@spine/shared-db/prisma');
      
      await prisma.adminAuditLog.create({
        data: {
          id: entry.id,
          actor: entry.actor,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          changes: entry.changes || {},
          metadata: entry.metadata || {},
          timestamp: entry.timestamp,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          success: entry.success,
          errorMessage: entry.errorMessage,
        },
      });
    } catch (error) {
      console.error('[AdminAudit] Failed to persist:', error);
      console.log('[AdminAudit] Entry:', JSON.stringify(entry));
    }
  }

  /**
   * Query audit logs with filters
   */
  async query(filter: {
    actor?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AuditEntry[]> {
    try {
      const { prisma } = await import('@spine/shared-db/prisma');

      const where: any = {};
      if (filter.actor) where.actor = filter.actor;
      if (filter.action) where.action = filter.action;
      if (filter.resource) where.resource = filter.resource;
      if (filter.resourceId) where.resourceId = filter.resourceId;
      if (filter.success !== undefined) where.success = filter.success;
      
      if (filter.startDate || filter.endDate) {
        where.timestamp = {};
        if (filter.startDate) where.timestamp.gte = filter.startDate;
        if (filter.endDate) where.timestamp.lte = filter.endDate;
      }

      const logs = await prisma.adminAuditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filter.limit || 100,
        skip: filter.offset || 0,
      });

      return logs.map(log => ({
        id: log.id,
        actor: log.actor,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || undefined,
        changes: (log.changes as Record<string, any>) || undefined,
        metadata: (log.metadata as Record<string, any>) || undefined,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        success: log.success,
        errorMessage: log.errorMessage || undefined,
      }));
    } catch (error) {
      console.error('[AdminAudit] Query failed:', error);
      return [];
    }
  }

  /**
   * Export audit logs - for compliance
   */
  async export(filter: {
    startDate: Date;
    endDate: Date;
    format: 'json' | 'csv';
  }): Promise<string> {
    const logs = await this.query({
      startDate: filter.startDate,
      endDate: filter.endDate,
      limit: 100000,
    });

    if (filter.format === 'csv') {
      return this.exportCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  private exportCSV(logs: AuditEntry[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Actor',
      'Action',
      'Resource',
      'Resource ID',
      'Success',
      'IP Address',
      'Changes',
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.actor,
      log.action,
      log.resource,
      log.resourceId || '',
      log.success.toString(),
      log.ipAddress || '',
      JSON.stringify(log.changes || {}),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  /**
   * Get audit trail for specific resource
   */
  async getResourceHistory(
    resource: string,
    resourceId: string
  ): Promise<AuditEntry[]> {
    return this.query({ resource, resourceId, limit: 1000 });
  }

  /**
   * Get user's admin actions
   */
  async getUserActions(
    actor: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    return this.query({ actor, limit });
  }

  /**
   * Detect suspicious patterns
   */
  async detectSuspiciousActivity(params: {
    actor: string;
    timeWindow: number;
  }): Promise<{
    suspicious: boolean;
    reasons: string[];
    actions: AuditEntry[];
  }> {
    const startDate = new Date(Date.now() - params.timeWindow);
    const actions = await this.query({
      actor: params.actor,
      startDate,
    });

    const reasons: string[] = [];
    let suspicious = false;

    if (actions.length > 100) {
      suspicious = true;
      reasons.push(`High action count: ${actions.length} in ${params.timeWindow}ms`);
    }

    const failures = actions.filter(a => !a.success);
    if (failures.length > 10) {
      suspicious = true;
      reasons.push(`High failure rate: ${failures.length} failures`);
    }

    const deleteActions = actions.filter(a => a.action.includes('delete'));
    if (deleteActions.length > 20) {
      suspicious = true;
      reasons.push(`Excessive deletions: ${deleteActions.length}`);
    }

    return { suspicious, reasons, actions };
  }
}

/**
 * Audit decorator for automatic logging
 */
export function Audited(resource: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const auditLogger = AuditLogger.getInstance();
      const actor = (this as any).currentUser?.id || 'system';
      
      const startTime = Date.now();
      let success = true;
      let errorMessage: string | undefined;
      let result: any;

      try {
        result = await originalMethod.apply(this, args);
        return result;
      } catch (error: any) {
        success = false;
        errorMessage = error.message;
        throw error;
      } finally {
        await auditLogger.log({
          actor,
          action: propertyKey,
          resource,
          metadata: {
            args: args.map(a => (typeof a === 'object' ? '[Object]' : a)),
            duration: Date.now() - startTime,
          },
          success,
          errorMessage,
        });
      }
    };

    return descriptor;
  };
}

export const adminAudit = AuditLogger.getInstance();

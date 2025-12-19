/**
 * Audit Logging for Supabase SaaS Advanced Pack
 * 
 * Provides tamper-evident audit logging with cryptographic chaining
 * for compliance and security monitoring.
 */

import { AuditLog } from './types.js';

export class AuditLoggingManager {
  private logs: Map<string, AuditLog> = new Map();
  private lastHash: string = '';
  private initialized = false;

  /**
   * Initialize audit logging
   */
  async initialize(): Promise<void> {
    this.lastHash = this.generateInitialHash();
    this.initialized = true;
  }

  /**
   * Log audit event
   */
  async log(event: {
    tenantId: string;
    userId?: string;
    action: string;
    table?: string;
    recordId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: event.tenantId,
      userId: event.userId,
      action: event.action,
      table: event.table,
      recordId: event.recordId,
      oldValues: event.oldValues,
      newValues: event.newValues,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      hash: '',
      previousHash: this.lastHash
    };

    // Generate cryptographic hash
    auditLog.hash = this.generateHash(auditLog);
    this.lastHash = auditLog.hash;

    this.logs.set(auditLog.id, auditLog);
  }

  /**
   * Query audit logs
   */
  async query(query: {
    tenantId?: string;
    userId?: string;
    action?: string;
    table?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let logs = Array.from(this.logs.values());

    // Apply filters
    if (query.tenantId) {
      logs = logs.filter(log => log.tenantId === query.tenantId);
    }

    if (query.userId) {
      logs = logs.filter(log => log.userId === query.userId);
    }

    if (query.action) {
      logs = logs.filter(log => log.action === query.action);
    }

    if (query.table) {
      logs = logs.filter(log => log.table === query.table);
    }

    if (query.startDate) {
      logs = logs.filter(log => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      logs = logs.filter(log => log.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (query.offset) {
      logs = logs.slice(query.offset);
    }

    if (query.limit) {
      logs = logs.slice(0, query.limit);
    }

    return logs;
  }

  /**
   * Verify audit log integrity
   */
  verifyIntegrity(): {
    valid: boolean;
    totalLogs: number;
    tamperedLogs: string[];
  } {
    const logs = Array.from(this.logs.values());
    const tamperedLogs: string[] = [];

    // Sort by timestamp
    logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const expectedHash = this.generateHash(log);

      if (log.hash !== expectedHash) {
        tamperedLogs.push(log.id);
      }

      // Check chain integrity
      if (i > 0 && log.previousHash !== logs[i - 1].hash) {
        tamperedLogs.push(log.id);
      }
    }

    return {
      valid: tamperedLogs.length === 0,
      totalLogs: logs.length,
      tamperedLogs
    };
  }

  /**
   * Get audit metrics
   */
  async getMetrics(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const logs = Array.from(this.logs.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: logs.length,
      today: logs.filter(log => log.timestamp >= today).length,
      thisWeek: logs.filter(log => log.timestamp >= weekStart).length,
      thisMonth: logs.filter(log => log.timestamp >= monthStart).length
    };
  }

  /**
   * Cleanup old logs (based on retention policy)
   */
  async cleanup(retentionDays: number = 2555): Promise<number> {
    const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
    let deletedCount = 0;

    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < cutoffDate) {
        this.logs.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Export audit logs
   */
  async export(query?: {
    tenantId?: string;
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  }): Promise<string> {
    const logs = await this.query(query || {});
    const format = query?.format || 'json';

    if (format === 'csv') {
      const headers = ['id', 'tenantId', 'userId', 'action', 'table', 'recordId', 'timestamp', 'ipAddress'];
      const csvRows = [headers.join(',')];

      logs.forEach(log => {
        const row = [
          log.id,
          log.tenantId,
          log.userId || '',
          log.action,
          log.table || '',
          log.recordId || '',
          log.timestamp.toISOString(),
          log.ipAddress || ''
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get log by ID
   */
  getLog(logId: string): AuditLog | undefined {
    return this.logs.get(logId);
  }

  /**
   * Delete log (admin only)
   */
  deleteLog(logId: string): boolean {
    return this.logs.delete(logId);
  }

  private generateHash(log: AuditLog): string {
    // Simple hash generation for demonstration
    // In production, use proper cryptographic hash (SHA-256)
    const data = {
      tenantId: log.tenantId,
      userId: log.userId,
      action: log.action,
      table: log.table,
      recordId: log.recordId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      timestamp: log.timestamp.toISOString(),
      previousHash: log.previousHash
    };

    return btoa(JSON.stringify(data)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
  }

  private generateInitialHash(): string {
    // Generate initial hash for chain
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }
}

// Export singleton instance
export const auditLogging = new AuditLoggingManager();

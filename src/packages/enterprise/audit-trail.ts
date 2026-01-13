/**
 * Audit Trail Manager - Comprehensive audit trail system
 */

import { 
  AuditEntry, 
  DataChange, 
  AuditAction, 
  ChangeType,
  TransactionType
} from './types';

export class AuditTrailManager {
  private auditEntries: Map<string, AuditEntry[]> = new Map();

  /**
   * Create comprehensive audit trail for any entity
   */
  async createAuditTrail(
    entityId: string, 
    entityType: string, 
    data: any,
    userId: string = 'system',
    action: AuditAction = AuditAction.CREATE
  ): Promise<AuditEntry[]> {
    const auditEntries: AuditEntry[] = [];

    // Create initial creation entry
    const creationEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      action,
      entityType,
      entityId,
      changes: this.extractChanges(null, data),
      metadata: {
        source: 'audit_trail_manager',
        version: '1.0',
        environment: process.env.NODE_ENV || 'development'
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    auditEntries.push(creationEntry);

    // Store audit entries
    this.storeAuditEntries(entityId, auditEntries);

    // Log to external audit system
    await this.logToExternalSystem(creationEntry);

    return auditEntries;
  }

  /**
   * Log data changes with detailed tracking
   */
  async logDataChange(
    entityId: string,
    entityType: string,
    oldData: any,
    newData: any,
    userId: string,
    context: Record<string, any> = {}
  ): Promise<AuditEntry> {
    const changes = this.extractChanges(oldData, newData);

    if (changes.length === 0) {
      throw new Error('No changes detected');
    }

    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      changes,
      metadata: {
        ...context,
        changeCount: changes.length,
        sensitiveFields: this.identifySensitiveFields(changes)
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    // Store audit entry
    this.storeAuditEntry(entityId, auditEntry);

    // Log to external systems
    await this.logToExternalSystem(auditEntry);

    // Check for suspicious activity
    await this.checkSuspiciousActivity(auditEntry);

    return auditEntry;
  }

  /**
   * Log approval action with enhanced tracking
   */
  async logApproval(
    entityId: string,
    entityType: string,
    approverId: string,
    approvalLevel: number,
    comments?: string,
    previousApprovals?: string[]
  ): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId: approverId,
      action: AuditAction.APPROVE,
      entityType,
      entityId,
      changes: [{
        field: 'approval_status',
        oldValue: previousApprovals ? previousApprovals.join(',') : 'pending',
        newValue: `approved_level_${approvalLevel}`,
        changeType: ChangeType.UPDATE
      }],
      metadata: {
        approvalLevel,
        comments,
        previousApprovers: previousApprovals || [],
        approvalChain: this.buildApprovalChain(previousApprovals, approverId)
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    this.storeAuditEntry(entityId, auditEntry);
    await this.logToExternalSystem(auditEntry);

    return auditEntry;
  }

  /**
   * Log view access with privacy considerations
   */
  async logView(
    entityId: string,
    entityType: string,
    userId: string,
    accessLevel: string = 'read'
  ): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      action: AuditAction.VIEW,
      entityType,
      entityId,
      changes: [], // No changes for view actions
      metadata: {
        accessLevel,
        sessionDuration: this.getSessionDuration(),
        accessMethod: this.getAccessMethod()
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    // Only store sensitive view logs for high-security entities
    if (this.isHighSecurityEntity(entityType)) {
      this.storeAuditEntry(entityId, auditEntry);
      await this.logToExternalSystem(auditEntry);
    }

    return auditEntry;
  }

  /**
   * Log export action with compliance tracking
   */
  async logExport(
    entityId: string,
    entityType: string,
    userId: string,
    exportFormat: string,
    recordCount: number,
    filters?: Record<string, any>
  ): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      action: AuditAction.EXPORT,
      entityType,
      entityId,
      changes: [{
        field: 'export_action',
        oldValue: null,
        newValue: `exported_${exportFormat}_${recordCount}_records`,
        changeType: ChangeType.CREATE
      }],
      metadata: {
        exportFormat,
        recordCount,
        filters,
        complianceChecked: await this.checkExportCompliance(userId, entityType),
        dataRetention: this.getDataRetentionPeriod(entityType)
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    this.storeAuditEntry(entityId, auditEntry);
    await this.logToExternalSystem(auditEntry);

    return auditEntry;
  }

  /**
   * Get audit trail for entity
   */
  async getAuditTrail(entityId: string, options: {
    limit?: number;
    offset?: number;
    dateRange?: { start: Date; end: Date };
    actions?: AuditAction[];
  } = {}): Promise<AuditEntry[]> {
    let entries = this.auditEntries.get(entityId) || [];

    // Filter by date range
    if (options.dateRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= options.dateRange!.start && 
        entry.timestamp <= options.dateRange!.end
      );
    }

    // Filter by actions
    if (options.actions && options.actions.length > 0) {
      entries = entries.filter(entry => 
        options.actions!.includes(entry.action)
      );
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return entries.slice(offset, offset + limit);
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(options: {
    entityId?: string;
    entityType?: string;
    dateRange?: { start: Date; end: Date };
  } = {}): Promise<{
    totalEntries: number;
    actionsBreakdown: Record<AuditAction, number>;
    topUsers: Array<{ userId: string; count: number }>;
    suspiciousActivities: number;
    complianceScore: number;
  }> {
    // Mock implementation - would query actual audit data
    return {
      totalEntries: 0,
      actionsBreakdown: {} as Record<AuditAction, number>,
      topUsers: [],
      suspiciousActivities: 0,
      complianceScore: 100
    };
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditIntegrity(entityId: string): Promise<{
    isValid: boolean;
    issues: string[];
    checksum: string;
  }> {
    const entries = this.auditEntries.get(entityId) || [];
    const issues: string[] = [];

    // Check for missing timestamps
    const missingTimestamps = entries.filter(e => !e.timestamp);
    if (missingTimestamps.length > 0) {
      issues.push(`${missingTimestamps.length} entries missing timestamps`);
    }

    // Check for invalid user IDs
    const invalidUsers = entries.filter(e => !e.userId || e.userId.trim() === '');
    if (invalidUsers.length > 0) {
      issues.push(`${invalidUsers.length} entries with invalid user IDs`);
    }

    // Check for sequence gaps
    const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    for (let i = 1; i < sortedEntries.length; i++) {
      const timeDiff = sortedEntries[i].timestamp.getTime() - sortedEntries[i-1].timestamp.getTime();
      if (timeDiff < 0) {
        issues.push('Audit entries out of chronological order');
        break;
      }
    }

    const checksum = this.calculateChecksum(entries);
    const isValid = issues.length === 0;

    return { isValid, issues, checksum };
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(criteria: {
    entityType?: string;
    dateRange: { start: Date; end: Date };
    includeDetails?: boolean;
  }): Promise<{
    summary: any;
    entries: AuditEntry[];
    complianceMetrics: any;
    recommendations: string[];
  }> {
    // Mock implementation
    return {
      summary: {},
      entries: [],
      complianceMetrics: {},
      recommendations: []
    };
  }

  /**
   * Archive old audit entries
   */
  async archiveAuditEntries(olderThan: Date): Promise<{
    archivedCount: number;
    archivedIds: string[];
  }> {
    const cutoffTime = olderThan.getTime();
    const archivedIds: string[] = [];
    let archivedCount = 0;

    for (const [entityId, entries] of this.auditEntries.entries()) {
      const oldEntries = entries.filter(e => e.timestamp.getTime() < cutoffTime);
      
      if (oldEntries.length > 0) {
        // Archive to cold storage
        await this.archiveToColdStorage(oldEntries);
        
        // Remove from active storage
        const activeEntries = entries.filter(e => e.timestamp.getTime() >= cutoffTime);
        this.auditEntries.set(entityId, activeEntries);
        
        archivedCount += oldEntries.length;
        archivedIds.push(...oldEntries.map(e => e.id));
      }
    }

    return { archivedCount, archivedIds };
  }

  // Private helper methods

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractChanges(oldData: any, newData: any): DataChange[] {
    const changes: DataChange[] = [];

    if (!oldData) {
      // Creation - all fields are new
      for (const [key, value] of Object.entries(newData || {})) {
        changes.push({
          field: key,
          oldValue: null,
          newValue: value,
          changeType: ChangeType.CREATE
        });
      }
    } else if (!newData) {
      // Deletion - all fields are removed
      for (const [key, value] of Object.entries(oldData || {})) {
        changes.push({
          field: key,
          oldValue: value,
          newValue: null,
          changeType: ChangeType.DELETE
        });
      }
    } else {
      // Update - compare fields
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
      
      for (const key of allKeys) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        
        if (oldValue !== newValue) {
          changes.push({
            field: key,
            oldValue,
            newValue,
            changeType: ChangeType.UPDATE
          });
        }
      }
    }

    return changes;
  }

  private identifySensitiveFields(changes: DataChange[]): string[] {
    const sensitivePatterns = [
      /password/i,
      /ssn/i,
      /credit.*card/i,
      /bank.*account/i,
      /social.*security/i,
      /tax.*id/i,
      /driver.*license/i
    ];

    return changes
      .filter(change => 
        sensitivePatterns.some(pattern => pattern.test(change.field))
      )
      .map(change => change.field);
  }

  private buildApprovalChain(previousApprovers: string[], currentApprover: string): string[] {
    return [...previousApprovers, currentApprover];
  }

  private isHighSecurityEntity(entityType: string): boolean {
    const highSecurityTypes = [
      'financial_transaction',
      'payroll',
      'employee_data',
      'customer_pii',
      'audit_log'
    ];
    return highSecurityTypes.includes(entityType);
  }

  private getSessionDuration(): number {
    // Mock implementation
    return Math.floor(Math.random() * 3600); // Random duration in seconds
  }

  private getAccessMethod(): string {
    // Mock implementation
    return 'web_interface';
  }

  private async checkExportCompliance(userId: string, entityType: string): Promise<boolean> {
    // Mock implementation - would check actual compliance rules
    return true;
  }

  private getDataRetentionPeriod(entityType: string): string {
    const retentionPeriods: Record<string, string> = {
      'financial_transaction': '7 years',
      'payroll': '7 years',
      'audit_log': '10 years',
      'user_data': '6 years'
    };
    return retentionPeriods[entityType] || '3 years';
  }

  private getClientIP(): string {
    // Mock implementation - would get actual client IP
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    // Mock implementation - would get actual user agent
    return 'Auth-spine Audit System';
  }

  private storeAuditEntries(entityId: string, entries: AuditEntry[]): void {
    if (!this.auditEntries.has(entityId)) {
      this.auditEntries.set(entityId, []);
    }
    this.auditEntries.get(entityId)!.push(...entries);
  }

  private storeAuditEntry(entityId: string, entry: AuditEntry): void {
    if (!this.auditEntries.has(entityId)) {
      this.auditEntries.set(entityId, []);
    }
    this.auditEntries.get(entityId)!.push(entry);
  }

  private async logToExternalSystem(entry: AuditEntry): Promise<void> {
    // Mock implementation - would log to external audit system
    console.log(`External audit log: ${entry.id} - ${entry.action} on ${entry.entityType}:${entry.entityId}`);
  }

  private async checkSuspiciousActivity(entry: AuditEntry): Promise<void> {
    // Mock implementation - would check for suspicious patterns
    const suspiciousPatterns = [
      // Multiple rapid changes to same entity
      // Access from unusual locations
      // Changes to sensitive fields outside business hours
      // Bulk export of sensitive data
    ];

    // Check patterns and alert if necessary
  }

  private calculateChecksum(entries: AuditEntry[]): string {
    // Simple checksum implementation - would use cryptographic hash in production
    const data = entries.map(e => `${e.id}:${e.timestamp.getTime()}:${e.userId}`).join('|');
    return btoa(data).slice(0, 32);
  }

  private async archiveToColdStorage(entries: AuditEntry[]): Promise<void> {
    // Mock implementation - would archive to cold storage system
    console.log(`Archiving ${entries.length} audit entries to cold storage`);
  }
}

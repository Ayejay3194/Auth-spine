/**
 * Audit logging for SaaS security events
 * Implements critical security control: SaaS-OBS-001
 */

export interface SecurityAuditEvent {
  timestamp: string;
  tenantId: string;
  userId?: string;
  eventType: 'auth_success' | 'auth_failure' | 'permission_denied' | 'boundary_violation' | 'data_access' | 'admin_action';
  resource?: string;
  action?: string;
  ipAddress: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface AuditLogResult {
  success: boolean;
  error?: string;
  eventId?: string;
}

/**
 * Security audit logging system
 */
export class SecurityAuditLogger {
  private logs: SecurityAuditEvent[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    this.startBatchProcessor();
  }

  /**
   * Logs authentication events
   */
  async logAuthEvent(
    tenantId: string,
    userId: string,
    success: boolean,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuditLogResult> {
    const event: SecurityAuditEvent = {
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      eventType: success ? 'auth_success' : 'auth_failure',
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'medium',
      metadata: { authSuccess: success }
    };

    return this.logEvent(event);
  }

  /**
   * Logs permission denied events
   */
  async logPermissionDenied(
    tenantId: string,
    userId: string,
    resource: string,
    action: string,
    ipAddress: string
  ): Promise<AuditLogResult> {
    const event: SecurityAuditEvent = {
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      eventType: 'permission_denied',
      resource,
      action,
      ipAddress,
      severity: 'high',
      metadata: { attemptedAction: action }
    };

    return this.logEvent(event);
  }

  /**
   * Logs tenant boundary violations
   */
  async logBoundaryViolation(
    tenantId: string,
    userId: string,
    violation: string,
    ipAddress: string
  ): Promise<AuditLogResult> {
    const event: SecurityAuditEvent = {
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      eventType: 'boundary_violation',
      ipAddress,
      severity: 'critical',
      metadata: { violation, requiresImmediateAttention: true }
    };

    return this.logEvent(event);
  }

  /**
   * Logs data access events
   */
  async logDataAccess(
    tenantId: string,
    userId: string,
    resource: string,
    action: string,
    ipAddress: string,
    recordCount?: number
  ): Promise<AuditLogResult> {
    const event: SecurityAuditEvent = {
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      eventType: 'data_access',
      resource,
      action,
      ipAddress,
      severity: 'low',
      metadata: { recordCount }
    };

    return this.logEvent(event);
  }

  /**
   * Logs admin actions
   */
  async logAdminAction(
    tenantId: string,
    userId: string,
    action: string,
    target?: string,
    ipAddress: string
  ): Promise<AuditLogResult> {
    const event: SecurityAuditEvent = {
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      eventType: 'admin_action',
      resource: target,
      action,
      ipAddress,
      severity: 'medium',
      metadata: { adminAction: true }
    };

    return this.logEvent(event);
  }

  private async logEvent(event: SecurityAuditEvent): Promise<AuditLogResult> {
    try {
      // Generate unique event ID
      const eventId = this.generateEventId();
      
      // Add event ID to metadata
      event.metadata = { ...event.metadata, eventId };

      // Add to batch
      this.logs.push(event);

      // Check if we need to flush
      if (this.logs.length >= this.batchSize) {
        await this.flushLogs();
      }

      return { success: true, eventId };
    } catch (error) {
      return { success: false, error: 'Failed to log audit event' };
    }
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.logs.length > 0) {
        this.flushLogs();
      }
    }, this.flushInterval);
  }

  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return;

    const batchToFlush = [...this.logs];
    this.logs = [];

    try {
      // In production, this would send to a secure logging service
      // For demo, we'll log to console with structured format
      console.log('[AUDIT_BATCH]', JSON.stringify(batchToFlush, null, 2));
      
      // Also send to SIEM if configured
      await this.sendToSIEM(batchToFlush);
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // In production, implement retry logic
    }
  }

  private async sendToSIEM(logs: SecurityAuditEvent[]): Promise<void> {
    // Implement SIEM integration
    // This could be Splunk, Elasticsearch, Datadog, etc.
    const criticalEvents = logs.filter(log => log.severity === 'critical');
    
    if (criticalEvents.length > 0) {
      console.log('[CRITICAL_SECURITY_EVENTS]', JSON.stringify(criticalEvents, null, 2));
      // Send immediate alert for critical events
    }
  }

  /**
   * Gets audit logs for a tenant (admin only)
   */
  async getTenantAuditLogs(
    tenantId: string,
    filters?: {
      userId?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<SecurityAuditEvent[]> {
    // In production, this would query the audit log database
    // For demo, return empty array
    return [];
  }

  /**
   * Gets security metrics for monitoring
   */
  async getSecurityMetrics(tenantId: string): Promise<{
    authFailures: number;
    permissionDenials: number;
    boundaryViolations: number;
    adminActions: number;
  }> {
    // In production, this would aggregate from audit logs
    return {
      authFailures: 0,
      permissionDenials: 0,
      boundaryViolations: 0,
      adminActions: 0
    };
  }
}

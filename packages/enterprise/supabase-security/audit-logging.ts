/**
 * Audit Logging for Supabase Security & Architecture Pack
 * 
 * Provides comprehensive audit logging with real-time monitoring,
 * security event tracking, and compliance reporting.
 */

import { AuditConfig, SecurityIncident } from './types.js';

export class AuditLoggingManager {
  private config: AuditConfig;
  private events: Map<string, any> = new Map();
  private incidents: Map<string, SecurityIncident> = new Map();
  private initialized = false;

  /**
   * Initialize audit logging system
   */
  async initialize(config: AuditConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Log security event
   */
  async logEvent(event: {
    type: 'auth' | 'data_access' | 'schema_change' | 'security_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    tenantId?: string;
    action: string;
    resource?: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    if (!this.config.enabled) return;

    const auditEvent = {
      id: this.generateEventId(),
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      tenantId: event.tenantId,
      action: event.action,
      resource: event.resource,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      resolved: false
    };

    this.events.set(auditEvent.id, auditEvent);

    // Check if this should create a security incident
    if (event.severity === 'critical' || 
        (event.severity === 'high' && event.type === 'security_violation')) {
      await this.createIncidentFromEvent(auditEvent);
    }

    // Real-time notification if enabled
    if (this.config.enableRealTime) {
      await this.sendRealTimeNotification(auditEvent);
    }
  }

  /**
   * Query security events
   */
  async queryEvents(query: {
    type?: string;
    severity?: string;
    userId?: string;
    tenantId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    let events = Array.from(this.events.values());

    // Apply filters
    if (query.type) {
      events = events.filter(event => event.type === query.type);
    }

    if (query.severity) {
      events = events.filter(event => event.severity === query.severity);
    }

    if (query.userId) {
      events = events.filter(event => event.userId === query.userId);
    }

    if (query.tenantId) {
      events = events.filter(event => event.tenantId === query.tenantId);
    }

    if (query.startDate) {
      events = events.filter(event => event.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      events = events.filter(event => event.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (query.limit) {
      events = events.slice(0, query.limit);
    }

    return events;
  }

  /**
   * Create security incident
   */
  async createIncident(incident: {
    type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers?: number;
    affectedData?: string[];
  }): Promise<SecurityIncident> {
    const securityIncident: SecurityIncident = {
      id: this.generateIncidentId(),
      type: incident.type,
      severity: incident.severity,
      status: 'open',
      description: incident.description,
      affectedUsers: incident.affectedUsers || 0,
      affectedData: incident.affectedData || [],
      detectedAt: new Date(),
      actions: [],
      lessons: []
    };

    this.incidents.set(securityIncident.id, securityIncident);

    // Send immediate notification for critical incidents
    if (incident.severity === 'critical') {
      await this.sendIncidentNotification(securityIncident);
    }

    return securityIncident;
  }

  /**
   * Get active security incidents
   */
  async getActiveIncidents(): Promise<SecurityIncident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.status !== 'resolved');
  }

  /**
   * Update incident status
   */
  async updateIncident(incidentId: string, updates: {
    status?: 'open' | 'investigating' | 'contained' | 'resolved';
    actions?: Array<{
      action: string;
      performedBy: string;
      performedAt: Date;
      description: string;
    }>;
    lessons?: string[];
  }): Promise<SecurityIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const updatedIncident = {
      ...incident,
      ...updates
    };

    if (updates.status === 'resolved') {
      updatedIncident.resolvedAt = new Date();
    }

    this.incidents.set(incidentId, updatedIncident);
    return updatedIncident;
  }

  /**
   * Get audit metrics
   */
  async getMetrics(): Promise<{
    totalEvents: number;
    securityEvents: number;
    resolvedEvents: number;
    pendingEvents: number;
  }> {
    const events = Array.from(this.events.values());
    const securityEvents = events.filter(e => e.type === 'security_violation').length;
    const resolvedEvents = events.filter(e => e.resolved).length;
    const pendingEvents = events.filter(e => !e.resolved).length;

    return {
      totalEvents: events.length,
      securityEvents,
      resolvedEvents,
      pendingEvents
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Cleanup old events based on retention policy
   */
  async cleanup(): Promise<number> {
    const cutoffDate = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000));
    let deletedCount = 0;

    for (const [id, event] of this.events.entries()) {
      if (event.timestamp < cutoffDate) {
        this.events.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Generate audit report
   */
  async generateReport(period: {
    start: Date;
    end: Date;
  }): Promise<{
    period: { start: Date; end: Date };
    summary: {
      totalEvents: number;
      criticalEvents: number;
      highEvents: number;
      mediumEvents: number;
      lowEvents: number;
    };
    topUsers: Array<{ userId: string; eventCount: number }>;
    topActions: Array<{ action: string; eventCount: number }>;
    incidents: SecurityIncident[];
  }> {
    const events = await this.queryEvents({
      startDate: period.start,
      endDate: period.end
    });

    const summary = {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      mediumEvents: events.filter(e => e.severity === 'medium').length,
      lowEvents: events.filter(e => e.severity === 'low').length
    };

    // Top users by event count
    const userEventCounts = new Map<string, number>();
    events.forEach(event => {
      if (event.userId) {
        userEventCounts.set(event.userId, (userEventCounts.get(event.userId) || 0) + 1);
      }
    });

    const topUsers = Array.from(userEventCounts.entries())
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Top actions by event count
    const actionEventCounts = new Map<string, number>();
    events.forEach(event => {
      actionEventCounts.set(event.action, (actionEventCounts.get(event.action) || 0) + 1);
    });

    const topActions = Array.from(actionEventCounts.entries())
      .map(([action, eventCount]) => ({ action, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Incidents in period
    const incidents = Array.from(this.incidents.values())
      .filter(incident => 
        incident.detectedAt >= period.start && incident.detectedAt <= period.end
      );

    return {
      period,
      summary,
      topUsers,
      topActions,
      incidents
    };
  }

  private async createIncidentFromEvent(event: any): Promise<void> {
    const incidentType = this.mapEventToIncidentType(event.type, event.action);
    
    await this.createIncident({
      type: incidentType,
      severity: event.severity,
      description: `Security incident triggered by ${event.action}: ${event.action}`,
      affectedUsers: event.userId ? 1 : 0,
      affectedData: event.resource ? [event.resource] : []
    });
  }

  private mapEventToIncidentType(eventType: string, action: string): 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'other' {
    if (action.includes('unauthorized') || action.includes('forbidden')) {
      return 'unauthorized_access';
    }
    if (action.includes('malware') || action.includes('virus')) {
      return 'malware';
    }
    if (action.includes('ddos') || action.includes('flood')) {
      return 'ddos';
    }
    if (action.includes('breach') || action.includes('exfiltration')) {
      return 'data_breach';
    }
    return 'other';
  }

  private async sendRealTimeNotification(event: any): Promise<void> {
    // Simulate real-time notification
    console.log(`[SECURITY ALERT] ${event.severity.toUpperCase()}: ${event.action} by ${event.userId}`);
  }

  private async sendIncidentNotification(incident: SecurityIncident): Promise<void> {
    // Simulate incident notification
    console.log(`[CRITICAL INCIDENT] ${incident.type}: ${incident.description}`);
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIncidentId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const auditLogging = new AuditLoggingManager();

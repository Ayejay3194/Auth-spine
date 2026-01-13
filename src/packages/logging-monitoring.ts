/**
 * Logging & Monitoring for Security Governance & Enforcement Layer
 * 
 * Provides comprehensive audit logging, security monitoring,
 * and compliance reporting capabilities.
 */

import { SecurityAudit } from './types.js';

export class LoggingMonitoringManager {
  private audits: SecurityAudit[] = [];
  private maxAudits = 10000; // Keep last 10k audit records

  /**
   * Initialize logging and monitoring
   */
  async initialize(): Promise<void> {
    // Setup logging infrastructure
  }

  /**
   * Log security audit event
   */
  log(audit: Omit<SecurityAudit, 'id' | 'timestamp'>): SecurityAudit {
    const securityAudit: SecurityAudit = {
      ...audit,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.audits.push(securityAudit);

    // Maintain audit limit
    if (this.audits.length > this.maxAudits) {
      this.audits = this.audits.slice(-this.maxAudits);
    }

    // Log to external system if configured
    this.writeToExternalLog(securityAudit);

    return securityAudit;
  }

  /**
   * Get audit records
   */
  getAudits(filter?: {
    type?: string;
    severity?: string;
    controlId?: string;
    gateId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityAudit[] {
    let filtered = [...this.audits];

    // Apply filters
    if (filter?.type) {
      filtered = filtered.filter(audit => audit.type === filter.type);
    }

    if (filter?.severity) {
      filtered = filtered.filter(audit => audit.severity === filter.severity);
    }

    if (filter?.controlId) {
      filtered = filtered.filter(audit => audit.controlId === filter.controlId);
    }

    if (filter?.gateId) {
      filtered = filtered.filter(audit => audit.gateId === filter.gateId);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(audit => audit.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(audit => audit.timestamp <= filter.endDate!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Get audit statistics
   */
  getStatistics(timeframe?: {
    startDate?: Date;
    endDate?: Date;
  }): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byControl: Record<string, number>;
    trends: Array<{
      date: string;
      count: number;
    }>;
  } {
    let audits = this.audits;

    if (timeframe) {
      if (timeframe.startDate) {
        audits = audits.filter(audit => audit.timestamp >= timeframe.startDate!);
      }
      if (timeframe.endDate) {
        audits = audits.filter(audit => audit.timestamp <= timeframe.endDate!);
      }
    }

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byControl: Record<string, number> = {};

    audits.forEach(audit => {
      byType[audit.type] = (byType[audit.type] || 0) + 1;
      bySeverity[audit.severity] = (bySeverity[audit.severity] || 0) + 1;
      if (audit.controlId) {
        byControl[audit.controlId] = (byControl[audit.controlId] || 0) + 1;
      }
    });

    // Generate trends (last 7 days)
    const trends = this.generateTrends(audits);

    return {
      total: audits.length,
      byType,
      bySeverity,
      byControl,
      trends
    };
  }

  /**
   * Export audit data
   */
  exportData(format: 'json' | 'csv' = 'json', filter?: {
    startDate?: Date;
    endDate?: Date;
  }): string {
    const audits = this.getAudits(filter);

    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'type', 'severity', 'message', 'controlId', 'gateId', 'userId'];
      const rows = audits.map(audit => [
        audit.id,
        audit.timestamp.toISOString(),
        audit.type,
        audit.severity,
        audit.message,
        audit.controlId || '',
        audit.gateId || '',
        audit.userId || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(audits, null, 2);
  }

  /**
   * Clear audit logs
   */
  clear(olderThan?: Date): number {
    if (olderThan) {
      const beforeCount = this.audits.length;
      this.audits = this.audits.filter(audit => audit.timestamp >= olderThan);
      return beforeCount - this.audits.length;
    } else {
      const count = this.audits.length;
      this.audits = [];
      return count;
    }
  }

  /**
   * Search audit logs
   */
  search(query: string, filters?: {
    type?: string;
    severity?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): SecurityAudit[] {
    const lowerQuery = query.toLowerCase();
    
    return this.audits.filter(audit => {
      // Text search
      const matchesQuery = 
        audit.message.toLowerCase().includes(lowerQuery) ||
        audit.id.toLowerCase().includes(lowerQuery);

      // Apply filters
      if (filters?.type && audit.type !== filters.type) return false;
      if (filters?.severity && audit.severity !== filters.severity) return false;
      if (filters?.userId && audit.userId !== filters.userId) return false;
      if (filters?.startDate && audit.timestamp < filters.startDate) return false;
      if (filters?.endDate && audit.timestamp > filters.endDate) return false;

      return matchesQuery;
    });
  }

  /**
   * Get compliance metrics
   */
  getComplianceMetrics(): {
    auditScore: number;
    violationRate: number;
    criticalViolations: number;
    lastAudit: Date | null;
    complianceTrend: 'improving' | 'stable' | 'declining';
  } {
    const totalAudits = this.audits.length;
    const violations = this.audits.filter(audit => audit.type === 'VIOLATION').length;
    const criticalViolations = this.audits.filter(audit => 
      audit.type === 'VIOLATION' && audit.severity === 'CRITICAL'
    ).length;

    const auditScore = totalAudits > 0 ? Math.max(0, 100 - (violations / totalAudits * 100)) : 100;
    const violationRate = totalAudits > 0 ? (violations / totalAudits * 100) : 0;
    
    const lastAudit = this.audits.length > 0 ? this.audits[0].timestamp : null;
    
    // Calculate trend
    const complianceTrend = this.calculateComplianceTrend();

    return {
      auditScore,
      violationRate,
      criticalViolations,
      lastAudit,
      complianceTrend
    };
  }

  private writeToExternalLog(audit: SecurityAudit): void {
    // In a real implementation, this would write to external logging systems
    console.log(`Security Audit [${audit.severity}]: ${audit.message}`, {
      id: audit.id,
      type: audit.type,
      timestamp: audit.timestamp,
      controlId: audit.controlId,
      userId: audit.userId
    });
  }

  private generateTrends(audits: SecurityAudit[]): Array<{
    date: string;
    count: number;
  }> {
    const trends: Array<{ date: string; count: number }> = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAudits = audits.filter(audit => 
        audit.timestamp.toISOString().split('T')[0] === dateStr
      );

      trends.push({
        date: dateStr,
        count: dayAudits.length
      });
    }

    return trends;
  }

  private calculateComplianceTrend(): 'improving' | 'stable' | 'declining' {
    const recentAudits = this.audits.slice(0, 100); // Last 100 audits
    const olderAudits = this.audits.slice(100, 200); // Previous 100 audits

    if (recentAudits.length === 0 || olderAudits.length === 0) {
      return 'stable';
    }

    const recentViolations = recentAudits.filter(audit => audit.type === 'VIOLATION').length;
    const olderViolations = olderAudits.filter(audit => audit.type === 'VIOLATION').length;

    const recentRate = recentViolations / recentAudits.length;
    const olderRate = olderViolations / olderAudits.length;

    const change = recentRate - olderRate;

    if (change > 0.05) return 'declining';
    if (change < -0.05) return 'improving';
    return 'stable';
  }
}

// Export singleton instance
export const loggingMonitoring = new LoggingMonitoringManager();

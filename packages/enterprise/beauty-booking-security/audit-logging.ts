/**
 * Audit Logging for Beauty Booking Security Pack
 * 
 * Provides comprehensive audit logging with PII access tracking,
 * data change logging, and real-time alerts for beauty booking platforms.
 */

import { AuditConfig, SecurityEvent } from './types.js';

export class AuditLoggingManager {
  private config: AuditConfig;
  private events: Map<string, SecurityEvent> = new Map();
  private piiAccessLog: Map<string, any[]> = new Map();
  private initialized = false;

  /**
   * Initialize audit logging
   */
  async initialize(config: AuditConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Log security event
   */
  async logEvent(event: {
    type: 'authentication' | 'authorization' | 'data_access' | 'pii_access' | 'security_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    domain: 'public' | 'studio' | 'ops';
    action: string;
    resource?: string;
    piiData?: boolean;
    ipAddress: string;
    userAgent: string;
    details?: Record<string, any>;
  }): Promise<void> {
    if (!this.config.enabled) return;

    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      domain: event.domain,
      action: event.action,
      resource: event.resource,
      piiData: event.piiData || false,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      details: event.details || {}
    };

    this.events.set(securityEvent.id, securityEvent);

    // Log PII access separately if enabled
    if (this.config.logPIIAccess && event.piiData) {
      this.logPIIAccess(securityEvent);
    }

    // Send real-time alert for critical events
    if (this.config.enableRealTimeAlerts && 
        (event.severity === 'critical' || event.type === 'security_violation')) {
      await this.sendRealTimeAlert(securityEvent);
    }

    // Log to external systems if needed
    await this.persistEvent(securityEvent);
  }

  /**
   * Query security events
   */
  async queryEvents(query: {
    type?: string;
    severity?: string;
    userId?: string;
    domain?: 'public' | 'studio' | 'ops';
    startDate?: Date;
    endDate?: Date;
    piiData?: boolean;
    limit?: number;
  }): Promise<SecurityEvent[]> {
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

    if (query.domain) {
      events = events.filter(event => event.domain === query.domain);
    }

    if (query.startDate) {
      events = events.filter(event => event.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      events = events.filter(event => event.timestamp <= query.endDate!);
    }

    if (query.piiData !== undefined) {
      events = events.filter(event => event.piiData === query.piiData);
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
   * Get PII access log for user
   */
  async getPIIAccessLog(userId: string, period?: {
    start: Date;
    end: Date;
  }): Promise<any[]> {
    const accessLog = this.piiAccessLog.get(userId) || [];
    
    if (!period) {
      return accessLog;
    }

    return accessLog.filter(entry => 
      entry.timestamp >= period.start && entry.timestamp <= period.end
    );
  }

  /**
   * Get authentication metrics
   */
  async getAuthenticationMetrics(): Promise<{
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    bruteForceAttempts: number;
  }> {
    const authEvents = Array.from(this.events.values())
      .filter(event => event.type === 'authentication');

    const successfulLogins = authEvents.filter(e => 
      e.action.includes('success') || e.action.includes('login')
    ).length;

    const failedLogins = authEvents.filter(e => 
      e.action.includes('failed') || e.action.includes('denied')
    ).length;

    const mfaUsage = authEvents.filter(e => 
      e.action.includes('mfa') || e.details.mfa
    ).length;

    const bruteForceAttempts = authEvents.filter(e => 
      e.action.includes('brute') || e.severity === 'high'
    ).length;

    return {
      totalLogins: authEvents.length,
      successfulLogins,
      failedLogins,
      mfaUsage,
      bruteForceAttempts
    };
  }

  /**
   * Get data access metrics
   */
  async getDataAccessMetrics(): Promise<{
    totalQueries: number;
    piiAccess: number;
    crossDomainAccess: number;
    blockedQueries: number;
  }> {
    const dataEvents = Array.from(this.events.values())
      .filter(event => event.type === 'data_access');

    const piiAccess = dataEvents.filter(e => e.piiData).length;
    const crossDomainAccess = dataEvents.filter(e => 
      e.details.crossDomain || e.action.includes('cross')
    ).length;
    const blockedQueries = dataEvents.filter(e => 
      e.action.includes('denied') || e.action.includes('blocked')
    ).length;

    return {
      totalQueries: dataEvents.length,
      piiAccess,
      crossDomainAccess,
      blockedQueries
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

    // Clean up events
    for (const [id, event] of this.events.entries()) {
      if (event.timestamp < cutoffDate) {
        this.events.delete(id);
        deletedCount++;
      }
    }

    // Clean up PII access logs
    for (const [userId, logs] of this.piiAccessLog.entries()) {
      const filteredLogs = logs.filter(log => log.timestamp >= cutoffDate);
      if (filteredLogs.length !== logs.length) {
        this.piiAccessLog.set(userId, filteredLogs);
        deletedCount += logs.length - filteredLogs.length;
      }
    }

    return deletedCount;
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(period: {
    start: Date;
    end: Date;
  }): Promise<{
    period: { start: Date; end: Date };
    summary: {
      totalEvents: number;
      criticalEvents: number;
      highEvents: number;
      piiAccessEvents: number;
      securityViolations: number;
    };
    domainBreakdown: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    topActions: Array<{ action: string; eventCount: number }>;
    recommendations: string[];
  }> {
    const events = await this.queryEvents({
      startDate: period.start,
      endDate: period.end
    });

    const summary = {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      piiAccessEvents: events.filter(e => e.piiData).length,
      securityViolations: events.filter(e => e.type === 'security_violation').length
    };

    // Domain breakdown
    const domainBreakdown: Record<string, number> = {};
    events.forEach(event => {
      domainBreakdown[event.domain] = (domainBreakdown[event.domain] || 0) + 1;
    });

    // Top users by event count
    const userEventCounts = new Map<string, number>();
    events.forEach(event => {
      if (event.userId) {
        userEventCounts.set(event.userId, (userEventCounts.get(event.userId) || 0) + 1;
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

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, events);

    return {
      period,
      summary,
      domainBreakdown,
      topUsers,
      topActions,
      recommendations
    };
  }

  /**
   * Generate audit configuration
   */
  generateConfig(): {
    database: string;
    logging: string;
    alerts: string;
  } {
    const databaseConfig = this.generateDatabaseConfig();
    const loggingConfig = this.generateLoggingConfig();
    const alertsConfig = this.generateAlertsConfig();

    return {
      database: databaseConfig,
      logging: loggingConfig,
      alerts: alertsConfig
    };
  }

  private logPIIAccess(event: SecurityEvent): void {
    if (!event.userId) return;

    const accessEntry = {
      eventId: event.id,
      timestamp: event.timestamp,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details
    };

    const userLog = this.piiAccessLog.get(event.userId) || [];
    userLog.push(accessEntry);
    this.piiAccessLog.set(event.userId, userLog);
  }

  private async sendRealTimeAlert(event: SecurityEvent): Promise<void> {
    // Simulate real-time alert sending
    console.log(`[AUDIT ALERT] ${event.severity.toUpperCase()}: ${event.action} in ${event.domain} domain`);
    
    if (event.piiData) {
      console.log(`[PII ACCESS] User ${event.userId} accessed PII data`);
    }

    // In production, send to Slack, email, SMS, etc.
  }

  private async persistEvent(event: SecurityEvent): Promise<void> {
    // Simulate persistence to database
    console.log(`[AUDIT LOG] Persisted event: ${event.id}`);
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendations(summary: any, events: SecurityEvent[]): string[] {
    const recommendations = [];

    if (summary.criticalEvents > 0) {
      recommendations.push('Investigate critical security events immediately');
    }

    if (summary.highEvents > summary.totalEvents * 0.1) {
      recommendations.push('Review security policies - high number of high-severity events');
    }

    if (summary.piiAccessEvents > summary.totalEvents * 0.3) {
      recommendations.push('Review PII access patterns and implement stricter controls');
    }

    if (summary.securityViolations > 10) {
      recommendations.push('Strengthen security measures - multiple violations detected');
    }

    const failedAuthEvents = events.filter(e => 
      e.type === 'authentication' && e.action.includes('failed')
    ).length;

    if (failedAuthEvents > 50) {
      recommendations.push('Implement stronger authentication controls');
    }

    return recommendations;
  }

  private generateDatabaseConfig(): string {
    return `
-- Audit Logging Database Schema
-- Generated on ${new Date().toISOString()}

-- Security events table
CREATE TABLE security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('authentication', 'authorization', 'data_access', 'pii_access', 'security_violation')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id uuid REFERENCES users(id),
  domain text NOT NULL CHECK (domain IN ('public', 'studio', 'ops')),
  action text NOT NULL,
  resource text,
  pii_data boolean DEFAULT false,
  ip_address inet NOT NULL,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  details jsonb DEFAULT '{}'
);

-- PII access tracking table
CREATE TABLE pii_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES security_audit_logs(id),
  user_id uuid NOT NULL REFERENCES users(id),
  timestamp timestamptz DEFAULT now(),
  action text NOT NULL,
  resource text NOT NULL,
  ip_address inet NOT NULL,
  user_agent text,
  details jsonb DEFAULT '{}'
);

-- Enable RLS on audit tables
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_access_logs ENABLE ROW LEVEL SECURITY;

-- Audit policies
CREATE POLICY audit_logs_policy ON security_audit_logs
FOR SELECT TO authenticated
USING (
  CASE 
    WHEN request.role() = 'admin' THEN true
    WHEN request.role() = 'manager' AND domain = 'ops' THEN true
    WHEN request.role() = 'stylist' AND domain = 'studio' THEN true
    WHEN request.role() = 'customer' AND user_id = request.user_id() THEN true
    ELSE false
  END
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON security_audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_audit_logs_domain ON security_audit_logs(domain);
CREATE INDEX idx_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX idx_audit_logs_type ON security_audit_logs(type);

CREATE INDEX idx_pii_logs_timestamp ON pii_access_logs(timestamp);
CREATE INDEX idx_pii_logs_user_id ON pii_access_logs(user_id);
`;
  }

  private generateLoggingConfig(): string {
    return `
// Audit Logging Configuration
// Generated on ${new Date().toISOString()}

const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Custom audit logger
const auditLogger = winston.createLogger({
  level: process.env.AUDIT_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'beauty-booking-audit' },
  transports: [
    // File transport for local logging
    new winston.transports.File({
      filename: 'logs/audit-error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/audit-combined.log'
    }),
    
    // Elasticsearch transport for centralized logging
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
      },
      index: 'beauty-booking-audit-logs'
    })
  ]
});

// Audit event formatter
const formatAuditEvent = (event) => {
  return {
    id: event.id,
    type: event.type,
    severity: event.severity,
    userId: event.userId,
    domain: event.domain,
    action: event.action,
    resource: event.resource,
    piiData: event.piiData,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    timestamp: event.timestamp,
    details: event.details
  };
};

// PII access logger with additional security
const piiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'beauty-booking-pii-audit' },
  transports: [
    new winston.transports.File({
      filename: 'logs/pii-access.log',
      level: 'info'
    }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
      },
      index: 'beauty-booking-pii-logs'
    })
  ]
});

module.exports = {
  auditLogger,
  piiLogger,
  formatAuditEvent
};
`;
  }

  private generateAlertsConfig(): string {
    return `
// Audit Alert Configuration
// Generated on ${new Date().toISOString()}

const Slack = require('slack-node');
const nodemailer = require('nodemailer');

// Alert configuration
const alertConfig = {
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: '#security-alerts',
    username: 'Beauty Booking Security'
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    from: process.env.ALERT_FROM_EMAIL,
    to: process.env.ALERT_TO_EMAIL?.split(',')
  },
  thresholds: {
    criticalEvents: 1,
    highEvents: 5,
    piiAccessRate: 0.3,
    failedAuthRate: 0.1
  }
};

// Slack notification
const sendSlackAlert = async (event) => {
  const slack = new Slack();
  slack.setWebhook(alertConfig.slack.webhookUrl);
  
  const message = {
    channel: alertConfig.slack.channel,
    username: alertConfig.slack.username,
    attachments: [{
      color: event.severity === 'critical' ? 'danger' : 
             event.severity === 'high' ? 'warning' : 'good',
      title: \`\${event.severity.toUpperCase()} Security Event\`,
      fields: [
        { title: 'Type', value: event.type, short: true },
        { title: 'Domain', value: event.domain, short: true },
        { title: 'Action', value: event.action, short: true },
        { title: 'User ID', value: event.userId || 'Anonymous', short: true },
        { title: 'IP Address', value: event.ipAddress, short: true },
        { title: 'PII Data', value: event.piiData ? 'Yes' : 'No', short: true }
      ],
      timestamp: Math.floor(event.timestamp.getTime() / 1000)
    }]
  };
  
  return new Promise((resolve, reject) => {
    slack.webhook(message, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};

// Email notification
const sendEmailAlert = async (event) => {
  const transporter = nodemailer.createTransporter(alertConfig.email.smtp);
  
  const mailOptions = {
    from: alertConfig.email.from,
    to: alertConfig.email.to.join(', '),
    subject: \`[\${event.severity.toUpperCase()}] Beauty Booking Security Alert\`,
    html: \`
      <h2>Security Event Alert</h2>
      <p><strong>Severity:</strong> \${event.severity.toUpperCase()}</p>
      <p><strong>Type:</strong> \${event.type}</p>
      <p><strong>Domain:</strong> \${event.domain}</p>
      <p><strong>Action:</strong> \${event.action}</p>
      <p><strong>User ID:</strong> \${event.userId || 'Anonymous'}</p>
      <p><strong>IP Address:</strong> \${event.ipAddress}</p>
      <p><strong>PII Data:</strong> \${event.piiData ? 'Yes' : 'No'}</p>
      <p><strong>Timestamp:</strong> \${event.timestamp.toISOString()}</p>
      \${event.details ? \`<h3>Details</h3><pre>\${JSON.stringify(event.details, null, 2)}</pre>\` : ''}
    \`
  };
  
  return transporter.sendMail(mailOptions);
};

// Alert manager
class AuditAlertManager {
  constructor() {
    this.eventCounts = new Map();
    this.alertCooldowns = new Map();
  }
  
  async processEvent(event) {
    // Check if we should send an alert
    if (event.severity === 'critical') {
      await this.sendAlert(event);
      return;
    }
    
    if (event.severity === 'high') {
      const key = \`high_\${event.domain}\`;
      const count = (this.eventCounts.get(key) || 0) + 1;
      this.eventCounts.set(key, count);
      
      if (count >= alertConfig.thresholds.highEvents) {
        await this.sendAlert(event);
        this.eventCounts.set(key, 0);
      }
    }
    
    if (event.piiData) {
      const key = \`pii_\${event.userId}\`;
      const cooldown = this.alertCooldowns.get(key);
      
      if (!cooldown || Date.now() > cooldown) {
        await this.sendAlert(event);
        this.alertCooldowns.set(key, Date.now() + (5 * 60 * 1000)); // 5 minute cooldown
      }
    }
  }
  
  async sendAlert(event) {
    try {
      await Promise.all([
        sendSlackAlert(event),
        sendEmailAlert(event)
      ]);
      console.log(\`Alert sent for event: \${event.id}\`);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
}

module.exports = {
  alertConfig,
  sendSlackAlert,
  sendEmailAlert,
  AuditAlertManager
};
`;
  }
}

// Export singleton instance
export const auditLogging = new AuditLoggingManager();

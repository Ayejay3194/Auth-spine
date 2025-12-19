/**
 * Service Level Objectives (SLOs) and Alerting Framework
 * Implements reliability monitoring and alerting rules
 */

import { prisma } from '@/lib/prisma';

export interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  metric: string;
  target: number; // percentage (e.g., 99.9)
  period: number; // days
  alertingThreshold: number; // percentage when to alert
  severity: 'critical' | 'warning' | 'info';
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  escalation: {
    level: number;
    notify: string[];
    delay: number; // minutes
  };
}

export const DEFAULT_SLOS: SLO[] = [
  {
    id: 'payment-webhook-success',
    name: 'Payment Webhook Success Rate',
    description: 'Percentage of successful payment webhook deliveries',
    service: 'payments',
    metric: 'webhook_success_rate',
    target: 99.9,
    period: 30,
    alertingThreshold: 99.0,
    severity: 'critical'
  },
  {
    id: 'payment-charge-success',
    name: 'Payment Charge Success Rate',
    description: 'Percentage of successful payment charges',
    service: 'payments',
    metric: 'charge_success_rate',
    target: 99.5,
    period: 30,
    alertingThreshold: 98.0,
    severity: 'critical'
  },
  {
    id: 'booking-conflict-rate',
    name: 'Booking Conflict Rate',
    description: 'Percentage of bookings with conflicts (should be low)',
    service: 'bookings',
    metric: 'conflict_rate',
    target: 0.1, // 0.1% max conflict rate
    period: 7,
    alertingThreshold: 0.5,
    severity: 'warning'
  },
  {
    id: 'booking-confirmation-latency',
    name: 'Booking Confirmation Latency',
    description: 'Average time to confirm bookings (p95)',
    service: 'bookings',
    metric: 'confirmation_latency_p95',
    target: 5000, // 5 seconds
    period: 7,
    alertingThreshold: 10000, // 10 seconds
    severity: 'warning'
  },
  {
    id: 'payroll-run-success',
    name: 'Payroll Run Success Rate',
    description: 'Percentage of successful payroll runs',
    service: 'payroll',
    metric: 'run_success_rate',
    target: 100.0,
    period: 30,
    alertingThreshold: 95.0,
    severity: 'critical'
  },
  {
    id: 'admin-audit-success',
    name: 'Admin Audit Log Success',
    description: 'Percentage of successful audit log writes',
    service: 'admin',
    metric: 'audit_log_success_rate',
    target: 99.9,
    period: 7,
    alertingThreshold: 99.0,
    severity: 'critical'
  },
  {
    id: 'api-response-time',
    name: 'API Response Time',
    description: 'Average API response time (p95)',
    service: 'api',
    metric: 'response_time_p95',
    target: 200, // 200ms
    period: 1,
    alertingThreshold: 500, // 500ms
    severity: 'warning'
  },
  {
    id: 'api-error-rate',
    name: 'API Error Rate',
    description: 'Percentage of API requests returning errors',
    service: 'api',
    metric: 'error_rate',
    target: 1.0, // 1% max error rate
    period: 1,
    alertingThreshold: 5.0, // 5% error rate
    severity: 'critical'
  }
];

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'payment-failure-spike',
    name: 'Payment Failure Spike',
    condition: 'payment_failure_rate > 5%',
    threshold: 5.0,
    severity: 'critical',
    enabled: true,
    escalation: {
      level: 1,
      notify: ['owner', 'on-call'],
      delay: 0
    }
  },
  {
    id: 'payroll-failure',
    name: 'Payroll Run Failure',
    condition: 'payroll_run_failed',
    threshold: 1,
    severity: 'critical',
    enabled: true,
    escalation: {
      level: 1,
      notify: ['owner', 'on-call', 'finance'],
      delay: 0
    }
  },
  {
    id: 'security-breach',
    name: 'Security Breach Detected',
    condition: 'security_alert_triggered',
    threshold: 1,
    severity: 'critical',
    enabled: true,
    escalation: {
      level: 1,
      notify: ['owner', 'on-call', 'security'],
      delay: 0
    }
  },
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    condition: 'error_rate > 10%',
    threshold: 10.0,
    severity: 'warning',
    enabled: true,
    escalation: {
      level: 2,
      notify: ['ops', 'on-call'],
      delay: 5
    }
  },
  {
    id: 'slow-response-time',
    name: 'Slow Response Time',
    condition: 'response_time_p95 > 1s',
    threshold: 1000,
    severity: 'warning',
    enabled: true,
    escalation: {
      level: 3,
      notify: ['ops'],
      delay: 15
    }
  }
];

export class SLOMonitor {
  static async calculateSLOStatus(slo: SLO): Promise<{
    current: number;
    target: number;
    status: 'healthy' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'degrading';
  }> {
    // Get current metric value from monitoring system
    const currentValue = await this.getMetricValue(slo.metric, slo.period);
    
    let status: 'healthy' | 'warning' | 'critical';
    if (currentValue >= slo.target) {
      status = 'healthy';
    } else if (currentValue >= slo.alertingThreshold) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    // Calculate trend (compare with previous period)
    const previousValue = await this.getMetricValue(slo.metric, slo.period * 2);
    const trend = currentValue > previousValue ? 'improving' : 
                  currentValue < previousValue ? 'degrading' : 'stable';

    return {
      current: currentValue,
      target: slo.target,
      status,
      trend
    };
  }

  static async getMetricValue(metric: string, periodDays: number): Promise<number> {
    // This would integrate with your monitoring system (Prometheus, etc.)
    // For now, return mock data
    const mockData: Record<string, number> = {
      'webhook_success_rate': 99.8,
      'charge_success_rate': 99.3,
      'conflict_rate': 0.05,
      'confirmation_latency_p95': 3200,
      'run_success_rate': 100.0,
      'audit_log_success_rate': 99.9,
      'response_time_p95': 180,
      'error_rate': 0.8
    };

    return mockData[metric] || 0;
  }

  static async checkAlertRules(): Promise<AlertRule[]> {
    const triggeredAlerts: AlertRule[] = [];

    for (const rule of ALERT_RULES) {
      if (!rule.enabled) continue;

      const shouldAlert = await this.evaluateAlertCondition(rule);
      if (shouldAlert) {
        triggeredAlerts.push(rule);
        await this.triggerAlert(rule);
      }
    }

    return triggeredAlerts;
  }

  static async evaluateAlertCondition(rule: AlertRule): Promise<boolean> {
    // Evaluate alert condition based on current metrics
    // This would integrate with your monitoring system
    
    switch (rule.id) {
      case 'payment-failure-spike':
        const failureRate = await this.getMetricValue('payment_failure_rate', 1);
        return failureRate > rule.threshold;
      
      case 'high-error-rate':
        const errorRate = await this.getMetricValue('error_rate', 1);
        return errorRate > rule.threshold;
      
      case 'slow-response-time':
        const responseTime = await this.getMetricValue('response_time_p95', 1);
        return responseTime > rule.threshold;
      
      default:
        return false;
    }
  }

  static async triggerAlert(rule: AlertRule): Promise<void> {
    // Log the alert - using console.log for now since auditLog model doesn't exist
    console.log('ALERT TRIGGERED:', {
      ruleId: rule.id,
      name: rule.name,
      severity: rule.severity,
      triggeredAt: new Date(),
      metadata: {
        condition: rule.condition,
        threshold: rule.threshold
      }
    });

    // Send notifications (Slack, email, etc.)
    await this.sendNotifications(rule);
  }

  static async sendNotifications(rule: AlertRule): Promise<void> {
    // Implement notification channels
    console.log(`ALERT: ${rule.name} (${rule.severity})`);
    
    // Would integrate with:
    // - Slack webhook
    // - Email service
    // - SMS service
    // - PagerDuty
  }

  static async getSLODashboard(): Promise<{
    slos: Array<SLO & {
      current: number;
      target: number;
      status: 'healthy' | 'warning' | 'critical';
      trend: 'improving' | 'stable' | 'degrading';
    }>;
    alerts: AlertRule[];
    overallHealth: 'healthy' | 'degraded' | 'critical';
  }> {
    const sloStatuses = await Promise.all(
      DEFAULT_SLOS.map(async (slo) => {
        const status = await this.calculateSLOStatus(slo);
        return {
          ...slo,
          ...status
        };
      })
    );

    const activeAlerts = await this.checkAlertRules();

    // Determine overall health
    const criticalSLOs = sloStatuses.filter(s => s.status === 'critical').length;
    const warningSLOs = sloStatuses.filter(s => s.status === 'warning').length;

    const overallHealth = criticalSLOs > 0 ? 'critical' :
                        warningSLOs > 0 ? 'degraded' : 'healthy';

    return {
      slos: sloStatuses,
      alerts: activeAlerts,
      overallHealth
    };
  }
}

// Background job to check SLOs and send alerts
export async function runSLOChecks(): Promise<void> {
  try {
    const dashboard = await SLOMonitor.getSLODashboard();
    
    // Log summary
    console.log(`SLO Check Complete: ${dashboard.overallHealth}`);
    console.log(`Active Alerts: ${dashboard.alerts.length}`);
    
    // Store in database for historical tracking - using console.log for now
    console.log('SLO SNAPSHOT:', {
      timestamp: new Date(),
      overallHealth: dashboard.overallHealth,
      sloData: dashboard.slos,
      alertCount: dashboard.alerts.length
    });
  } catch (error) {
    console.error('SLO check failed:', error);
  }
}

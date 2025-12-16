/**
 * Monitoring System Type Definitions
 * 
 * Comprehensive type definitions for the enterprise monitoring system
 * with strict typing for maximum type safety and performance.
 */

/**
 * SLO (Service Level Objective) definition
 */
export interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  metric: string;
  target: number; // Target percentage (0-100)
  period: number; // Time period in hours
  alertingThreshold: number; // Alert threshold percentage
  severity: AlertSeverity;
  enabled: boolean;
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Alert rule definition
 */
export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  cooldown: number; // Cooldown period in seconds
  notificationChannels: string[];
}

/**
 * SLO status with calculated metrics
 */
export interface SLOStatus {
  current: number; // Current performance percentage
  target: number; // Target percentage
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  errorBudget: number; // Remaining error budget percentage
  timeUntilBreaching: number | null; // Minutes until SLO breach
}

/**
 * System health check result
 */
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number; // Response time in milliseconds
  lastChecked: Date;
  details?: Record<string, any>;
}

/**
 * Monitoring dashboard data
 */
export interface MonitoringDashboard {
  slos: Array<SLO & SLOStatus>;
  alerts: AlertRule[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
  healthChecks: HealthCheck[];
  lastUpdated: Date;
}

/**
 * Metric data point
 */
export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  labels?: Record<string, string>;
}

/**
 * Time series data for metrics
 */
export interface TimeSeriesData {
  metric: string;
  dataPoints: MetricDataPoint[];
  aggregation: 'avg' | 'sum' | 'min' | 'max';
}

/**
 * Alert notification channel
 */
export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'pagerduty' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** SLO check interval in minutes */
  sloCheckInterval?: number;
  /** Health check interval in minutes */
  healthCheckInterval?: number;
  /** Alert cooldown in minutes */
  alertCooldown?: number;
  /** Enable historical data retention */
  enableHistory?: boolean;
  /** Data retention period in days */
  retentionPeriod?: number;
  /** Notification channels */
  notificationChannels?: NotificationChannel[];
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

/**
 * Monitoring service interface
 */
export interface IMonitoringService {
  getSLOs(): Promise<SLO[]>;
  getSLOStatus(sloId: string): Promise<SLOStatus>;
  getAlerts(): Promise<AlertRule[]>;
  getHealthChecks(): Promise<HealthCheck[]>;
  triggerSLOCheck(): Promise<void>;
  triggerHealthCheck(): Promise<void>;
}

/**
 * Alert manager interface
 */
export interface IAlertManager {
  sendAlert(alert: AlertRule, context: any): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  getActiveAlerts(): Promise<AlertRule[]>;
}

// Enterprise Monitoring Suite - Enterprise Monitoring
// Exports enterprise monitoring-related functionality

// Enterprise Monitoring Components
export { default as EnterpriseMonitoringDashboard } from './components/EnterpriseMonitoringDashboard';
export { default as EnterpriseMetrics } from './components/EnterpriseMetrics';
export { default as EnterpriseAlerts } from './components/EnterpriseAlerts';

// Enterprise Monitoring Hooks
export { default as useEnterpriseMonitoring } from './hooks/useEnterpriseMonitoring';
export { default as useEnterpriseMetrics } from './hooks/useEnterpriseMetrics';

// Enterprise Monitoring Services
export { default as enterpriseMonitoringService } from './services/enterpriseMonitoringService';

// Enterprise Monitoring Types
export interface EnterpriseMonitoring {
  id: string;
  tenantId: string;
  service: string;
  metrics: {
    performance: PerformanceMetrics;
    availability: AvailabilityMetrics;
    usage: UsageMetrics;
    errors: ErrorMetrics;
  };
  alerts: MonitoringAlert[];
  dashboards: MonitoringDashboard[];
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface AvailabilityMetrics {
  uptime: number;
  downtime: number;
  errorRate: number;
}

export interface UsageMetrics {
  activeUsers: number;
  requestsPerMinute: number;
  dataTransferred: number;
}

export interface ErrorMetrics {
  errorCount: number;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
  }>;
}

export interface MonitoringAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isDefault: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  query: string;
  visualization: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
}

// Enterprise Monitoring Constants
export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

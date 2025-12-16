/**
 * Monitoring Configuration - Default configurations for monitoring
 */

import { SLO, AlertSeverity } from './types';

export const defaultSLOs: SLO[] = [
  {
    id: 'api-response-time',
    name: 'API Response Time',
    description: '95th percentile response time',
    service: 'api',
    metric: 'response_time_p95',
    target: 95,
    period: 24,
    alertingThreshold: 90,
    severity: AlertSeverity.WARNING,
    enabled: true
  }
];

export const defaultMonitoringConfig = {
  sloCheckInterval: 5,
  healthCheckInterval: 1,
  alertCooldown: 10,
  enableHistory: true,
  retentionPeriod: 30
};

/**
 * Enterprise Monitoring Package
 * 
 * Comprehensive monitoring and alerting system with:
 * - Service Level Objectives (SLOs) tracking
 * - Real-time alerting with multiple channels
 * - Performance metrics collection
 * - Health checks and system status
 * - Historical data analysis
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { SLOMonitor, SLO, AlertRule, AlertSeverity } from './slo-monitor';
export { MonitoringService } from './service';
export { HealthChecker } from './health-checker';
export { AlertManager } from './alert-manager';

// Re-export commonly used utilities
export * from './metrics';
export * from './types';
export * from './utils';

// Default exports for easy usage
export { defaultSLOs } from './config';
export { runSLOChecks } from './scheduler';

/**
 * Test file to verify analytics module imports work correctly
 */

// Test importing all analytics components
import { AnalyticsEngine } from './analytics-engine.js';
import { MetricsCollector } from './metrics-collector.js';
import { ReportGenerator } from './report-generator.js';
import { DashboardManager } from './dashboard-manager.js';
import { Logger } from './logger.js';

// Test importing types
import type { 
  AnalyticsConfig, 
  AnalyticsEvent, 
  MetricSnapshot, 
  KPIData,
  ReportConfig,
  DashboardConfig 
} from './analytics-engine.js';

// Test that imports work by creating instances
const logger = new Logger({ level: 'info', format: 'simple', service: 'test' });
const config: AnalyticsConfig = {
  enabled: true,
  retentionDays: 365,
  realTimeTracking: true,
  batchProcessing: true,
  dataWarehouse: {
    enabled: true,
    syncInterval: 'hourly'
  },
  privacy: {
    anonymizePII: true,
    retentionPolicy: 'strict'
  }
};

const analytics = new AnalyticsEngine(config);
const metricsCollector = new MetricsCollector(config);
const reportGenerator = new ReportGenerator(config);
const dashboardManager = new DashboardManager(config);

console.log('✅ All analytics imports working correctly');
export { analytics, logger };

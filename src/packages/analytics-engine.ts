/**
 * Core Analytics Engine for Auth-spine
 * Provides comprehensive analytics and event tracking capabilities
 */

import { Logger } from './logger.js';
import { MetricsCollector } from './metrics-collector.js';
import { ReportGenerator } from './report-generator.js';
import { DashboardManager } from './dashboard-manager.js';
import { AnalyticsConfig, AnalyticsEvent, MetricSnapshot, KPIData, ReportConfig, DashboardConfig } from './types.js';

export { AnalyticsConfig, AnalyticsEvent, MetricSnapshot, KPIData, ReportConfig, DashboardConfig } from './types.js';

export class AnalyticsEngine {
  private config: AnalyticsConfig;
  private logger: Logger;
  private metricsCollector: MetricsCollector;
  private reportGenerator: ReportGenerator;
  private dashboardManager: DashboardManager;
  private isInitialized: boolean = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.logger = new Logger({ 
      level: 'info', 
      format: 'json',
      service: 'analytics-engine'
    });
    
    this.metricsCollector = new MetricsCollector(config);
    this.reportGenerator = new ReportGenerator(config);
    this.dashboardManager = new DashboardManager(config);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing Analytics Engine...');
      
      // Initialize components
      await this.metricsCollector.initialize();
      await this.reportGenerator.initialize();
      await this.dashboardManager.initialize();
      
      // Setup data warehouse sync if enabled
      if (this.config.dataWarehouse.enabled) {
        await this.setupDataWarehouseSync();
      }
      
      // Setup retention cleanup
      if (this.config.retentionDays > 0) {
        await this.setupRetentionCleanup();
      }
      
      this.isInitialized = true;
      this.logger.info('Analytics Engine initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize Analytics Engine', error);
      throw error;
    }
  }

  /**
   * Track analytics events
   */
  async trackEvent(eventData: Partial<AnalyticsEvent>): Promise<void> {
    if (!this.config.enabled || !this.isInitialized) {
      return;
    }

    try {
      const event: AnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        occurredAt: new Date(),
        createdAt: new Date(),
        event: eventData.event || 'unknown',
        actorId: eventData.actorId,
        actorEmail: eventData.actorEmail,
        actorRole: eventData.actorRole,
        sessionId: eventData.sessionId,
        entity: eventData.entity,
        entityId: eventData.entityId,
        path: eventData.path,
        method: eventData.method,
        status: eventData.status,
        durationMs: eventData.durationMs,
        props: eventData.props
      };

      // Apply privacy settings
      if (this.config.privacy.anonymizePII) {
        event.actorEmail = this.anonymizeEmail(event.actorEmail);
      }

      await this.metricsCollector.recordEvent(event);
      this.logger.debug('Event tracked', { event: event.event, id: event.id });
      
    } catch (error) {
      this.logger.error('Failed to track event', error);
    }
  }

  /**
   * Record metric snapshots
   */
  async recordMetric(
    metric: string, 
    value: number | { number?: number; cents?: number },
    asOfDate?: Date,
    dimensions?: any
  ): Promise<void> {
    if (!this.config.enabled || !this.isInitialized) {
      return;
    }

    try {
      const snapshot: MetricSnapshot = {
        id: `ms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        asOfDate: asOfDate || new Date(),
        metric,
        valueNumber: typeof value === 'object' ? value.number : value,
        valueCents: typeof value === 'object' ? value.cents : undefined,
        dims: dimensions,
        createdAt: new Date()
      };

      await this.metricsCollector.recordSnapshot(snapshot);
      this.logger.debug('Metric recorded', { metric, value: snapshot.valueNumber || snapshot.valueCents });
      
    } catch (error) {
      this.logger.error('Failed to record metric', error);
    }
  }

  /**
   * Get KPI data for dashboard
   */
  async getKPIs(metrics: string[], timeWindow?: string): Promise<KPIData[]> {
    if (!this.isInitialized) {
      throw new Error('Analytics Engine not initialized');
    }

    try {
      const kpis: KPIData[] = [];
      
      for (const metric of metrics) {
        const current = await this.metricsCollector.getLatestValue(metric);
        const previous = await this.metricsCollector.getPreviousValue(metric, timeWindow);
        
        const change = current && previous ? current - previous : undefined;
        const changePercent = current && previous && previous !== 0 ? 
          ((current - previous) / previous) * 100 : undefined;
        
        const trend = change && change > 0 ? 'up' : 
                     change && change < 0 ? 'down' : 'stable';

        kpis.push({
          metric,
          value: current || 0,
          previousValue: previous,
          change,
          changePercent,
          trend,
          lastUpdated: new Date()
        });
      }

      return kpis;
      
    } catch (error) {
      this.logger.error('Failed to get KPIs', error);
      throw error;
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(config: ReportConfig): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Analytics Engine not initialized');
    }

    try {
      this.logger.info('Generating report', { reportId: config.id, type: config.type });
      
      const reportData = await this.reportGenerator.generate(config);
      
      // Track report generation
      await this.trackEvent({
        event: 'report_generated',
        entity: 'Report',
        entityId: config.id,
        props: { type: config.type, format: config.format }
      });

      return reportData;
      
    } catch (error) {
      this.logger.error('Failed to generate report', error);
      throw error;
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(dashboardId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Analytics Engine not initialized');
    }

    try {
      const dashboard = await this.dashboardManager.getDashboard(dashboardId);
      const widgetData = await this.dashboardManager.getWidgetData(dashboard);
      
      return {
        dashboard,
        data: widgetData,
        lastUpdated: new Date()
      };
      
    } catch (error) {
      this.logger.error('Failed to get dashboard data', error);
      throw error;
    }
  }

  /**
   * Query analytics events
   */
  async queryEvents(filters: {
    event?: string;
    entity?: string;
    actorEmail?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AnalyticsEvent[]> {
    if (!this.isInitialized) {
      throw new Error('Analytics Engine not initialized');
    }

    try {
      return await this.metricsCollector.queryEvents(filters);
      
    } catch (error) {
      this.logger.error('Failed to query events', error);
      throw error;
    }
  }

  /**
   * Get metric history
   */
  async getMetricHistory(
    metric: string, 
    startDate: Date, 
    endDate: Date,
    dimensions?: any
  ): Promise<MetricSnapshot[]> {
    if (!this.isInitialized) {
      throw new Error('Analytics Engine not initialized');
    }

    try {
      return await this.metricsCollector.getMetricHistory(metric, startDate, endDate, dimensions);
      
    } catch (error) {
      this.logger.error('Failed to get metric history', error);
      throw error;
    }
  }

  /**
   * Compute daily snapshots
   */
  async computeDailySnapshots(days: number = 30): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Analytics Engine not initialized');
    }

    try {
      this.logger.info('Computing daily snapshots', { days });
      
      await this.metricsCollector.computeDailySnapshots(days);
      
      // Track computation
      await this.trackEvent({
        event: 'snapshots_computed',
        props: { days }
      });
      
      this.logger.info('Daily snapshots computed successfully');
      
    } catch (error) {
      this.logger.error('Failed to compute daily snapshots', error);
      throw error;
    }
  }

  /**
   * Get analytics health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
    metrics: any;
  }> {
    try {
      const metrics = await this.metricsCollector.getHealthMetrics();
      const reports = await this.reportGenerator.getHealthMetrics();
      const dashboards = await this.dashboardManager.getHealthMetrics();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      // Determine overall health
      if (metrics.errorRate > 0.1 || reports.errorRate > 0.1 || dashboards.errorRate > 0.1) {
        status = 'unhealthy';
      } else if (metrics.errorRate > 0.05 || reports.errorRate > 0.05 || dashboards.errorRate > 0.05) {
        status = 'degraded';
      }
      
      return {
        status,
        details: {
          initialized: this.isInitialized,
          enabled: this.config.enabled,
          components: {
            metrics,
            reports,
            dashboards
          }
        },
        metrics: {
          eventsProcessed: metrics.eventsProcessed,
          snapshotsGenerated: metrics.snapshotsGenerated,
          reportsGenerated: reports.reportsGenerated,
          dashboardsActive: dashboards.activeDashboards
        }
      };
      
    } catch (error: any) {
      this.logger.error('Failed to get health status', error);
      return {
        status: 'unhealthy',
        details: { error: error?.message || 'Unknown error' },
        metrics: {}
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('Analytics configuration updated', updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // Private helper methods

  private async setupDataWarehouseSync(): Promise<void> {
    // Implementation for data warehouse synchronization
    this.logger.info('Setting up data warehouse sync', { 
      interval: this.config.dataWarehouse.syncInterval 
    });
  }

  private async setupRetentionCleanup(): Promise<void> {
    // Implementation for retention cleanup
    this.logger.info('Setting up retention cleanup', { 
      retentionDays: this.config.retentionDays 
    });
  }

  private anonymizeEmail(email?: string): string | undefined {
    if (!email) return undefined;
    
    const [username, domain] = email.split('@');
    if (!username || !domain) return undefined;
    
    const anonymizedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${anonymizedUsername}@${domain}`;
  }
}

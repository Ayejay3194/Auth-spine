/**
 * Dashboard Manager for Auth-spine Analytics
 * Manages dashboard layouts, widgets, and data sources
 */

import { Logger } from './logger.js';
import { AnalyticsConfig } from './types.js';
import { MetricsCollector } from './metrics-collector.js';

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  columns: number;
  rows: number;
  widgets: WidgetPosition[];
  theme: 'light' | 'dark';
  refreshInterval: number;
}

export interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: DataSource;
  config: any;
  permissions: string[];
  refreshInterval: number;
}

export type WidgetType = 'kpi' | 'chart' | 'table' | 'metric' | 'gauge' | 'trend' | 'list' | 'text';
export type DataSource = 'metrics' | 'events' | 'reports' | 'external' | 'custom';

export interface DashboardData {
  dashboard: DashboardLayout;
  widgets: WidgetData[];
  lastUpdated: Date;
  refreshInterval: number;
}

export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  error?: string;
  lastUpdated: Date;
}

export class DashboardManager {
  private config: AnalyticsConfig;
  private logger: Logger;
  private metricsCollector: MetricsCollector;
  private isInitialized: boolean = false;
  private dashboards: Map<string, DashboardLayout> = new Map();
  private widgets: Map<string, WidgetConfig> = new Map();
  private dashboardData: Map<string, DashboardData> = new Map();

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.logger = new Logger({ 
      level: 'info', 
      format: 'json',
      service: 'dashboard-manager'
    });
    this.metricsCollector = new MetricsCollector(config);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing Dashboard Manager...');
      
      // Initialize metrics collector for real data
      await this.metricsCollector.initialize();
      
      // Load default dashboards
      await this.loadDefaultDashboards();
      
      // Load default widgets
      await this.loadDefaultWidgets();
      
      this.isInitialized = true;
      this.logger.info('Dashboard Manager initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize Dashboard Manager', error);
      throw error;
    }
  }

  /**
   * Get dashboard layout
   */
  async getDashboard(dashboardId: string): Promise<DashboardLayout> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }
    return dashboard;
  }

  /**
   * Get dashboard with widget data
   */
  async getDashboardData(dashboardId: string): Promise<DashboardData> {
    const dashboard = await this.getDashboard(dashboardId);
    const widgets: WidgetData[] = [];

    for (const widgetPos of dashboard.widgets) {
      const widgetConfig = this.widgets.get(widgetPos.widgetId);
      if (widgetConfig) {
        const widgetData = await this.getWidgetData(widgetConfig);
        widgets.push(widgetData);
      }
    }

    const dashboardData: DashboardData = {
      dashboard,
      widgets,
      lastUpdated: new Date(),
      refreshInterval: dashboard.refreshInterval
    };

    this.dashboardData.set(dashboardId, dashboardData);
    return dashboardData;
  }

  /**
   * Create new dashboard
   */
  async createDashboard(layout: DashboardLayout): Promise<void> {
    this.dashboards.set(layout.id, layout);
    this.logger.info('Dashboard created', { dashboardId: layout.id });
  }

  /**
   * Update dashboard layout
   */
  async updateDashboard(dashboardId: string, updates: Partial<DashboardLayout>): Promise<void> {
    const existing = await this.getDashboard(dashboardId);
    const updated = { ...existing, ...updates };
    this.dashboards.set(dashboardId, updated);
    this.logger.info('Dashboard updated', { dashboardId });
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId: string): Promise<void> {
    this.dashboards.delete(dashboardId);
    this.dashboardData.delete(dashboardId);
    this.logger.info('Dashboard deleted', { dashboardId });
  }

  /**
   * Get widget configuration
   */
  async getWidget(widgetId: string): Promise<WidgetConfig> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget not found: ${widgetId}`);
    }
    return widget;
  }

  /**
   * Create new widget
   */
  async createWidget(widget: WidgetConfig): Promise<void> {
    this.widgets.set(widget.id, widget);
    this.logger.info('Widget created', { widgetId: widget.id, type: widget.type });
  }

  /**
   * Update widget configuration
   */
  async updateWidget(widgetId: string, updates: Partial<WidgetConfig>): Promise<void> {
    const existing = await this.getWidget(widgetId);
    const updated = { ...existing, ...updates };
    this.widgets.set(widgetId, updated);
    this.logger.info('Widget updated', { widgetId });
  }

  /**
   * Delete widget
   */
  async deleteWidget(widgetId: string): Promise<void> {
    this.widgets.delete(widgetId);
    this.logger.info('Widget deleted', { widgetId });
  }

  /**
   * Get widget data
   */
  async getWidgetData(widgetConfig: WidgetConfig): Promise<WidgetData> {
    try {
      const data = await this.fetchWidgetData(widgetConfig);
      
      return {
        id: widgetConfig.id,
        type: widgetConfig.type,
        title: widgetConfig.title,
        data,
        lastUpdated: new Date()
      };
      
    } catch (error: any) {
      this.logger.error('Failed to get widget data', error);
      
      return {
        id: widgetConfig.id,
        type: widgetConfig.type,
        title: widgetConfig.title,
        data: null,
        error: error?.message || 'Unknown error',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get available dashboard templates
   */
  getDashboardTemplates(): DashboardLayout[] {
    return Array.from(this.dashboards.values()).filter(d => 
      d.id.includes('template') || d.id.includes('default')
    );
  }

  /**
   * Get available widget types
   */
  getWidgetTypes(): WidgetType[] {
    return ['kpi', 'chart', 'table', 'metric', 'gauge', 'trend', 'list', 'text'];
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics(): Promise<{
    activeDashboards: number;
    totalWidgets: number;
    errorRate: number;
    averageRefreshTime: number;
  }> {
    return {
      activeDashboards: this.dashboards.size,
      totalWidgets: this.widgets.size,
      errorRate: 0, // Would be tracked in production
      averageRefreshTime: 0
    };
  }

  // Private helper methods

  private async loadDefaultDashboards(): Promise<void> {
    const defaultDashboards: DashboardLayout[] = [
      {
        id: 'executive_dashboard',
        name: 'Executive Dashboard',
        description: 'High-level overview for executive team',
        columns: 4,
        rows: 4,
        widgets: [
          { widgetId: 'mrr_kpi', x: 0, y: 0, width: 2, height: 1 },
          { widgetId: 'headcount_kpi', x: 2, y: 0, width: 2, height: 1 },
          { widgetId: 'revenue_chart', x: 0, y: 1, width: 4, height: 2 },
          { widgetId: 'top_customers_table', x: 0, y: 3, width: 4, height: 1 }
        ],
        theme: 'light',
        refreshInterval: 300000 // 5 minutes
      },
      {
        id: 'hr_dashboard',
        name: 'HR Dashboard',
        description: 'HR metrics and workforce analytics',
        columns: 3,
        rows: 4,
        widgets: [
          { widgetId: 'headcount_kpi', x: 0, y: 0, width: 1, height: 1 },
          { widgetId: 'turnover_kpi', x: 1, y: 0, width: 1, height: 1 },
          { widgetId: 'payroll_kpi', x: 2, y: 0, width: 1, height: 1 },
          { widgetId: 'hiring_chart', x: 0, y: 1, width: 3, height: 2 },
          { widgetId: 'department_table', x: 0, y: 3, width: 3, height: 1 }
        ],
        theme: 'light',
        refreshInterval: 600000 // 10 minutes
      },
      {
        id: 'finance_dashboard',
        name: 'Finance Dashboard',
        description: 'Financial metrics and cash flow',
        columns: 3,
        rows: 4,
        widgets: [
          { widgetId: 'cash_balance_kpi', x: 0, y: 0, width: 1, height: 1 },
          { widgetId: 'ar_kpi', x: 1, y: 0, width: 1, height: 1 },
          { widgetId: 'ap_kpi', x: 2, y: 0, width: 1, height: 1 },
          { widgetId: 'cash_flow_chart', x: 0, y: 1, width: 3, height: 2 },
          { widgetId: 'aging_table', x: 0, y: 3, width: 3, height: 1 }
        ],
        theme: 'light',
        refreshInterval: 300000 // 5 minutes
      },
      {
        id: 'operations_dashboard',
        name: 'Operations Dashboard',
        description: 'Operational efficiency metrics',
        columns: 3,
        rows: 4,
        widgets: [
          { widgetId: 'uptime_kpi', x: 0, y: 0, width: 1, height: 1 },
          { widgetId: 'compliance_kpi', x: 1, y: 0, width: 1, height: 1 },
          { widgetId: 'error_rate_kpi', x: 2, y: 0, width: 1, height: 1 },
          { widgetId: 'performance_chart', x: 0, y: 1, width: 3, height: 2 },
          { widgetId: 'events_table', x: 0, y: 3, width: 3, height: 1 }
        ],
        theme: 'light',
        refreshInterval: 60000 // 1 minute
      }
    ];

    defaultDashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.id, dashboard);
    });

    this.logger.info('Default dashboards loaded', { count: defaultDashboards.length });
  }

  private async loadDefaultWidgets(): Promise<void> {
    const defaultWidgets: WidgetConfig[] = [
      // KPI Widgets
      {
        id: 'mrr_kpi',
        type: 'kpi',
        title: 'Monthly Recurring Revenue',
        dataSource: 'metrics',
        config: { metric: 'mrr', format: 'currency', showTrend: true },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'headcount_kpi',
        type: 'kpi',
        title: 'Total Headcount',
        dataSource: 'metrics',
        config: { metric: 'headcount', format: 'number', showTrend: true },
        permissions: ['hr', 'executive'],
        refreshInterval: 600000
      },
      {
        id: 'cash_balance_kpi',
        type: 'kpi',
        title: 'Cash Balance',
        dataSource: 'metrics',
        config: { metric: 'cashBalance', format: 'currency', showTrend: true },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'turnover_kpi',
        type: 'kpi',
        title: 'Turnover Rate',
        dataSource: 'metrics',
        config: { metric: 'turnoverRate', format: 'percentage', showTrend: true },
        permissions: ['hr', 'executive'],
        refreshInterval: 600000
      },
      {
        id: 'payroll_kpi',
        type: 'kpi',
        title: 'Payroll Costs',
        dataSource: 'metrics',
        config: { metric: 'payrollCosts', format: 'currency', showTrend: true },
        permissions: ['hr', 'finance', 'executive'],
        refreshInterval: 600000
      },
      {
        id: 'ar_kpi',
        type: 'kpi',
        title: 'A/R Outstanding',
        dataSource: 'metrics',
        config: { metric: 'arOutstanding', format: 'currency', showTrend: true },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'ap_kpi',
        type: 'kpi',
        title: 'A/P Outstanding',
        dataSource: 'metrics',
        config: { metric: 'apOutstanding', format: 'currency', showTrend: true },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'uptime_kpi',
        type: 'gauge',
        title: 'System Uptime',
        dataSource: 'metrics',
        config: { metric: 'systemUptime', format: 'percentage', min: 95, max: 100 },
        permissions: ['operations', 'executive'],
        refreshInterval: 60000
      },
      {
        id: 'compliance_kpi',
        type: 'gauge',
        title: 'Compliance Score',
        dataSource: 'metrics',
        config: { metric: 'complianceScore', format: 'percentage', min: 0, max: 100 },
        permissions: ['compliance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'error_rate_kpi',
        type: 'kpi',
        title: 'Error Rate',
        dataSource: 'metrics',
        config: { metric: 'errorRate', format: 'percentage', showTrend: true },
        permissions: ['operations', 'executive'],
        refreshInterval: 60000
      },
      
      // Chart Widgets
      {
        id: 'revenue_chart',
        type: 'chart',
        title: 'Revenue Trend',
        dataSource: 'metrics',
        config: { 
          metrics: ['mrr'], 
          timeWindow: '12months', 
          chartType: 'line',
          showLegend: true 
        },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'hiring_chart',
        type: 'chart',
        title: 'Hiring Trends',
        dataSource: 'metrics',
        config: { 
          metrics: ['headcount'], 
          timeWindow: '6months', 
          chartType: 'bar',
          showLegend: true 
        },
        permissions: ['hr', 'executive'],
        refreshInterval: 600000
      },
      {
        id: 'cash_flow_chart',
        type: 'chart',
        title: 'Cash Flow',
        dataSource: 'metrics',
        config: { 
          metrics: ['cashBalance'], 
          timeWindow: '3months', 
          chartType: 'area',
          showLegend: true 
        },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'performance_chart',
        type: 'chart',
        title: 'System Performance',
        dataSource: 'metrics',
        config: { 
          metrics: ['systemUptime', 'errorRate'], 
          timeWindow: '7days', 
          chartType: 'line',
          showLegend: true 
        },
        permissions: ['operations', 'executive'],
        refreshInterval: 60000
      },
      
      // Table Widgets
      {
        id: 'top_customers_table',
        type: 'table',
        title: 'Top Customers',
        dataSource: 'metrics',
        config: { 
          metric: 'top_customers', 
          limit: 10,
          columns: ['name', 'revenue', 'growth']
        },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'department_table',
        type: 'table',
        title: 'Department Breakdown',
        dataSource: 'metrics',
        config: { 
          metric: 'department_breakdown', 
          columns: ['department', 'employees', 'avgSalary']
        },
        permissions: ['hr', 'executive'],
        refreshInterval: 600000
      },
      {
        id: 'aging_table',
        type: 'table',
        title: 'Aging Report',
        dataSource: 'metrics',
        config: { 
          metric: 'aging_report', 
          columns: ['customer', 'amount', 'daysOutstanding']
        },
        permissions: ['finance', 'executive'],
        refreshInterval: 300000
      },
      {
        id: 'events_table',
        type: 'table',
        title: 'Recent Events',
        dataSource: 'events',
        config: { 
          limit: 20,
          columns: ['timestamp', 'event', 'user', 'status']
        },
        permissions: ['operations', 'executive'],
        refreshInterval: 60000
      }
    ];

    defaultWidgets.forEach(widget => {
      this.widgets.set(widget.id, widget);
    });

    this.logger.info('Default widgets loaded', { count: defaultWidgets.length });
  }

  private async fetchWidgetData(widgetConfig: WidgetConfig): Promise<any> {
    // Mock data fetching - in production would query actual analytics data
    switch (widgetConfig.type) {
      case 'kpi':
        return this.fetchKPIData(widgetConfig);
      case 'chart':
        return this.fetchChartData(widgetConfig);
      case 'table':
        return this.fetchTableData(widgetConfig);
      case 'gauge':
        return this.fetchGaugeData(widgetConfig);
      default:
        return { message: 'Data not available' };
    }
  }

  private async fetchKPIData(widgetConfig: WidgetConfig): Promise<any> {
    const metric = widgetConfig.config.metric;
    
    try {
      const latest = await this.metricsCollector.getLatestValue(metric);
      const previous = await this.metricsCollector.getPreviousValue(metric, '30d');
      const change = latest && previous ? ((latest - previous) / previous) * 100 : 0;
      
      return {
        value: latest || 0,
        change: Math.abs(change),
        trend: change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable'
      };
    } catch {
      // Return default fallback when no data available
      return { value: 0, change: 0, trend: 'stable' };
    }
  }

  private async fetchChartData(widgetConfig: WidgetConfig): Promise<any> {
    const now = new Date();
    const labels: string[] = [];
    const datasets: any[] = [];
    
    const metrics = widgetConfig.config.metrics || [];
    
    // Build labels from last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    // Get real data for each metric
    for (const metric of metrics) {
      const dataPoints: number[] = [];
      try {
        const history = await this.metricsCollector.getMetricHistory(metric, new Date(now.getFullYear(), now.getMonth() - 5, 1), now);
        // Map history to data points
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const snapshot = history.find(h => h.asOfDate.getMonth() === monthStart.getMonth());
          dataPoints.push(snapshot?.valueNumber || 0);
        }
      } catch {
        // Fallback to empty data if metric not available
        dataPoints.push(...Array(6).fill(0));
      }
      datasets.push({ label: metric, data: dataPoints });
    }

    return { labels, datasets };
  }

  private async fetchTableData(widgetConfig: WidgetConfig): Promise<any> {
    const metric = widgetConfig.config.metric;
    const limit = widgetConfig.config.limit || 10;
    
    try {
      const history = await this.metricsCollector.getMetricHistory(metric, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
      
      if (history.length > 0) {
        return history.slice(0, limit).map((h: any) => ({
          ...h.dims,
          value: h.valueNumber || 0,
          timestamp: h.asOfDate
        }));
      }
      
      // Return empty array if no data available
      return [];
    } catch {
      return [];
    }
  }

  private async fetchGaugeData(widgetConfig: WidgetConfig): Promise<any> {
    const metric = widgetConfig.config.metric;
    
    try {
      const latest = await this.metricsCollector.getLatestValue(metric);
      const value = latest || 0;
      
      // Determine status based on value thresholds
      const min = widgetConfig.config.min || 0;
      const max = widgetConfig.config.max || 100;
      const percentage = ((value - min) / (max - min)) * 100;
      
      let status = 'unknown';
      if (percentage >= 90) status = 'excellent';
      else if (percentage >= 70) status = 'good';
      else if (percentage >= 50) status = 'fair';
      else status = 'poor';
      
      return { value, status };
    } catch {
      return { value: 0, status: 'unknown' };
    }
  }
}

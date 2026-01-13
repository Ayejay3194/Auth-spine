/**
 * Dashboard Manager for Auth-spine Analytics
 * Manages dashboard layouts, widgets, and data sources
 */

import { Logger } from './logger.js';
import { AnalyticsConfig } from './types.js';

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
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing Dashboard Manager...');
      
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
    const mockKPIData: Record<string, any> = {
      mrr: { value: 125000, change: 5.2, trend: 'up' },
      headcount: { value: 145, change: 2.1, trend: 'up' },
      cashBalance: { value: 450000, change: -2.1, trend: 'down' },
      turnoverRate: { value: 8.5, change: -1.2, trend: 'down' },
      payrollCosts: { value: 280000, change: 3.5, trend: 'up' },
      arOutstanding: { value: 78000, change: 8.5, trend: 'up' },
      apOutstanding: { value: 45000, change: -3.2, trend: 'down' },
      errorRate: { value: 0.2, change: -0.1, trend: 'down' }
    };

    const metric = widgetConfig.config.metric;
    return mockKPIData[metric] || { value: 0, change: 0, trend: 'stable' };
  }

  private async fetchChartData(widgetConfig: WidgetConfig): Promise<any> {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const mockChartData = {
      mrr: [100000, 105000, 110000, 118000, 122000, 125000],
      headcount: [135, 138, 140, 142, 143, 145],
      cashBalance: [420000, 435000, 445000, 460000, 455000, 450000],
      systemUptime: [99.8, 99.9, 99.7, 99.9, 99.95, 99.9],
      errorRate: [0.5, 0.3, 0.4, 0.2, 0.3, 0.2]
    };

    const metrics = widgetConfig.config.metrics || [];
    const datasets = metrics.map((metric: string) => ({
      label: metric,
      data: mockChartData[metric as keyof typeof mockChartData] || []
    }));

    return { labels, datasets };
  }

  private async fetchTableData(widgetConfig: WidgetConfig): Promise<any> {
    const mockTableData = {
      top_customers: [
        { name: 'Customer A', revenue: 25000, growth: 12.5 },
        { name: 'Customer B', revenue: 18000, growth: 8.3 },
        { name: 'Customer C', revenue: 15000, growth: -2.1 }
      ],
      department_breakdown: [
        { department: 'Engineering', employees: 45, avgSalary: 95000 },
        { department: 'Sales', employees: 25, avgSalary: 75000 },
        { department: 'Marketing', employees: 15, avgSalary: 65000 }
      ],
      aging_report: [
        { customer: 'Customer X', amount: 15000, daysOutstanding: 45 },
        { customer: 'Customer Y', amount: 8500, daysOutstanding: 30 },
        { customer: 'Customer Z', amount: 5200, daysOutstanding: 15 }
      ],
      events: [
        { timestamp: '2024-12-16 10:30', event: 'User Login', user: 'john@example.com', status: 'Success' },
        { timestamp: '2024-12-16 10:25', event: 'Report Generated', user: 'jane@example.com', status: 'Success' },
        { timestamp: '2024-12-16 10:20', event: 'Payment Processed', user: 'system', status: 'Success' }
      ]
    };

    const metric = widgetConfig.config.metric;
    return mockTableData[metric as keyof typeof mockTableData] || [];
  }

  private async fetchGaugeData(widgetConfig: WidgetConfig): Promise<any> {
    const mockGaugeData: Record<string, any> = {
      systemUptime: { value: 99.9, status: 'excellent' },
      complianceScore: { value: 94.5, status: 'good' }
    };

    const metric = widgetConfig.config.metric;
    return mockGaugeData[metric] || { value: 0, status: 'unknown' };
  }
}

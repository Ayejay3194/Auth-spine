/**
 * HR Payroll Analytics Suite for Auth-spine
 * Comprehensive analytics and reporting for HR, Payroll, and Business Operations
 */

export { AnalyticsEngine } from './analytics-engine.js';
export { MetricsCollector } from './metrics-collector.js';
export { ReportGenerator } from './report-generator.js';
export { DashboardManager } from './dashboard-manager.js';
export { Logger } from './logger.js';

export type {
  AnalyticsConfig,
  AnalyticsEvent,
  MetricSnapshot,
  KPIData,
  ReportConfig,
  DashboardConfig
} from './types.js';

export type {
  MetricsConfig,
  MetricDefinition,
  AggregationType,
  TimeWindow
} from './metrics-collector.js';

export type {
  ReportType,
  ReportFormat,
  ReportData,
  ScheduleConfig
} from './report-generator.js';

export type {
  DashboardLayout,
  WidgetConfig,
  WidgetType,
  DataSource
} from './dashboard-manager.js';

/**
 * Default analytics configuration for Auth-spine
 */
export const defaultAnalyticsConfig: AnalyticsConfig = {
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

/**
 * Pre-configured KPIs for business operations
 */
export const businessKPIs = {
  financial: {
    mrr: 'Monthly Recurring Revenue',
    cashBalance: 'Cash Balance',
    arOutstanding: 'Accounts Receivable',
    apOutstanding: 'Accounts Payable',
    grossMargin: 'Gross Margin',
    netProfit: 'Net Profit'
  },
  hr: {
    headcount: 'Total Headcount',
    turnoverRate: 'Employee Turnover Rate',
    timeToHire: 'Average Time to Hire',
    payrollCosts: 'Payroll Costs',
    ptoBalance: 'PTO Balance',
    productivity: 'Productivity Index'
  },
  operations: {
    invoiceCycle: 'Invoice Processing Time',
    paymentCycle: 'Payment Processing Time',
    complianceScore: 'Compliance Score',
    auditEvents: 'Audit Events',
    systemUptime: 'System Uptime',
    errorRate: 'Error Rate'
  }
} as const;

/**
 * Pre-configured dashboards
 */
export const dashboardTemplates = {
  executive: {
    name: 'Executive Dashboard',
    description: 'High-level overview for executive team',
    widgets: [
      { type: 'kpi', metrics: ['mrr', 'headcount', 'cashBalance'] },
      { type: 'chart', metric: 'revenue_trend', timeWindow: '12months' },
      { type: 'table', metric: 'top_customers', limit: 10 }
    ]
  },
  hr: {
    name: 'HR Dashboard',
    description: 'HR metrics and workforce analytics',
    widgets: [
      { type: 'kpi', metrics: ['headcount', 'turnoverRate', 'payrollCosts'] },
      { type: 'chart', metric: 'hiring_trend', timeWindow: '6months' },
      { type: 'table', metric: 'department_breakdown' }
    ]
  },
  finance: {
    name: 'Finance Dashboard',
    description: 'Financial metrics and cash flow',
    widgets: [
      { type: 'kpi', metrics: ['cashBalance', 'arOutstanding', 'apOutstanding'] },
      { type: 'chart', metric: 'cash_flow', timeWindow: '3months' },
      { type: 'table', metric: 'aging_report' }
    ]
  },
  operations: {
    name: 'Operations Dashboard',
    description: 'Operational efficiency metrics',
    widgets: [
      { type: 'kpi', metrics: ['complianceScore', 'systemUptime', 'errorRate'] },
      { type: 'chart', metric: 'transaction_volume', timeWindow: '7days' },
      { type: 'table', metric: 'recent_events', limit: 20 }
    ]
  }
} as const;

/**
 * Quick factory function to create analytics engine
 */
export function createAnalyticsEngine(config?: Partial<AnalyticsConfig>): AnalyticsEngine {
  const { AnalyticsEngine } = require('./analytics-engine.js');
  const finalConfig = { ...defaultAnalyticsConfig, ...config };
  return new AnalyticsEngine(finalConfig);
}

/**
 * Business metrics definitions
 */
export const metricDefinitions = {
  // Financial Metrics
  mrr: {
    name: 'Monthly Recurring Revenue',
    description: 'Predictable monthly revenue from subscriptions',
    type: 'currency',
    aggregation: 'sum',
    category: 'financial'
  },
  cashBalance: {
    name: 'Cash Balance',
    description: 'Current cash on hand',
    type: 'currency',
    aggregation: 'latest',
    category: 'financial'
  },
  arOutstanding: {
    name: 'Accounts Receivable Outstanding',
    description: 'Total unpaid customer invoices',
    type: 'currency',
    aggregation: 'sum',
    category: 'financial'
  },
  apOutstanding: {
    name: 'Accounts Payable Outstanding',
    description: 'Total unpaid vendor bills',
    type: 'currency',
    aggregation: 'sum',
    category: 'financial'
  },
  
  // HR Metrics
  headcount: {
    name: 'Total Headcount',
    description: 'Number of active employees',
    type: 'count',
    aggregation: 'count',
    category: 'hr'
  },
  turnoverRate: {
    name: 'Employee Turnover Rate',
    description: 'Percentage of employees who left in period',
    type: 'percentage',
    aggregation: 'rate',
    category: 'hr'
  },
  payrollCosts: {
    name: 'Payroll Costs',
    description: 'Total payroll expenses in period',
    type: 'currency',
    aggregation: 'sum',
    category: 'hr'
  },
  
  // Operations Metrics
  invoiceCycle: {
    name: 'Invoice Processing Time',
    description: 'Average time to process invoices',
    type: 'duration',
    aggregation: 'average',
    category: 'operations'
  },
  complianceScore: {
    name: 'Compliance Score',
    description: 'Overall compliance health score',
    type: 'score',
    aggregation: 'average',
    category: 'operations'
  }
} as const;

/**
 * Event tracking utilities
 */
export const eventCategories = {
  user: 'User Actions',
  system: 'System Events',
  business: 'Business Events',
  security: 'Security Events',
  compliance: 'Compliance Events',
  performance: 'Performance Events'
} as const;

/**
 * Time window presets
 */
export const timeWindows = {
  today: { name: 'Today', days: 1 },
  yesterday: { name: 'Yesterday', days: 1 },
  last7days: { name: 'Last 7 Days', days: 7 },
  last30days: { name: 'Last 30 Days', days: 30 },
  thisMonth: { name: 'This Month', days: 30 },
  lastMonth: { name: 'Last Month', days: 30 },
  thisQuarter: { name: 'This Quarter', days: 90 },
  lastQuarter: { name: 'Last Quarter', days: 90 },
  thisYear: { name: 'This Year', days: 365 },
  last12months: { name: 'Last 12 Months', days: 365 }
} as const;

/**
 * Export utilities for external integration
 */
export const analyticsUtils = {
  formatCurrency: (amountCents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amountCents / 100);
  },
  
  formatPercentage: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  },
  
  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },
  
  calculateGrowthRate: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
  
  calculateMovingAverage: (values: number[], period: number): number[] => {
    const result: number[] = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }
};

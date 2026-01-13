/**
 * Financial Reporting Dashboard
 * 
 * Comprehensive financial reporting and analytics dashboard for enterprise
 * financial operations, reporting, and analysis.
 */

export * from './revenue-analytics.js';
export * from './expense-tracking.js';
export * from './financial-planning.js';
export * from './compliance-reporting.js';

// Main exports
export { FinancialReportingDashboard } from './financial-reporting-dashboard.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_FINANCIAL_REPORTING_CONFIG = {
  revenue: {
    enabled: true,
    analytics: true,
    forecasting: true,
    segmentation: true,
    reporting: true
  },
  expenses: {
    enabled: true,
    tracking: true,
    categorization: true,
    budgeting: true,
    optimization: true
  },
  planning: {
    enabled: true,
    budgeting: true,
    forecasting: true,
    scenarios: true,
    analysis: true
  },
  compliance: {
    enabled: true,
    reporting: true,
    audits: true,
    regulations: true,
    documentation: true
  }
};

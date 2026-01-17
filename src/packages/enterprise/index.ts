/**
 * Enterprise Module Index
 *
 * Consolidated, organized entry points for enterprise functionality.
 */

export * as audit from './audit/index.js';
export * as compliance from './compliance/index.js';
export * as security from './security/index.js';
export * as supabase from './supabase/index.js';
export * as operations from './operations/index.js';
export * as finance from './finance/index.js';
export * as platform from './platform/index.js';

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

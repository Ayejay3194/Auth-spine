/**
 * Vibe Coding Disasters Kit
 * 
 * A comprehensive risk register and guardrail system for preventing common development disasters.
 * Use this as preflight checks, PR review rubric, security gates, and "don't embarrass yourself in prod" enforcement.
 */

export * from './risk-register.js';
export * from './checklist-generator.js';
export * from './severity-scoring.js';
export * from './templates/index.js';

// Main exports
export { VibeCodingDisasters } from './vibe-coding-disasters.js';
export { RiskRegister, RiskItem, RiskCategory, SeverityLevel } from './types.js';

// Default configuration
export const DEFAULT_CONFIG = {
  enableBlocking: true,
  blockOnCritical: true,
  blockOnHigh: false,
  requireSignoff: true,
  autoGeneratePR: true,
  categories: [
    'SECURITY_VULNERABILITIES',
    'DATABASE_DISASTERS',
    'FINANCIAL_BUSINESS_DISASTERS',
    'LEGAL_COMPLIANCE_DISASTERS',
    'OPERATIONAL_DISASTERS',
    'ANALYTICS_TRACKING_DISASTERS',
    'CONFIGURATION_SETTINGS_DISASTERS',
    'CRON_SCHEDULED_TASKS_DISASTERS',
    'EDGE_CASES_RARE_FAILURES',
    'EMAIL_NOTIFICATIONS_DISASTERS',
    'IMPORT_EXPORT_DISASTERS',
    'LOCALIZATION_I18N_DISASTERS',
    'MIGRATION_DISASTERS',
    'MOBILE_DISASTERS',
    'MULTI_TENANCY_DISASTERS',
    'QUEUE_BACKGROUND_JOBS_DISASTERS',
    'SEARCH_FILTERING_DISASTERS',
    'WEBSOCKET_REALTIME_DISASTERS'
  ]
};

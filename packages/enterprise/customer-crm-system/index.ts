/**
 * Customer CRM System
 * 
 * Comprehensive customer relationship management system for enterprise
 * customer operations, sales, marketing, and support.
 */

export * from './customer-management.js';
export * from './sales-automation.js';
export * from './marketing-automation.js';
export * from './support-management.js';

// Main exports
export { CustomerCRMSystem } from './customer-crm-system.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_CRM_CONFIG = {
  customers: {
    enabled: true,
    profiles: true,
    segmentation: true,
    lifecycle: true,
    analytics: true
  },
  sales: {
    enabled: true,
    pipeline: true,
    automation: true,
    forecasting: true,
    reporting: true
  },
  marketing: {
    enabled: true,
    campaigns: true,
    automation: true,
    analytics: true,
    personalization: true
  },
  support: {
    enabled: true,
    tickets: true,
    knowledge: true,
    automation: true,
    analytics: true
  }
};

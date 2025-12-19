/**
 * Supabase SaaS Advanced Pack
 * 
 * Advanced SaaS features for Supabase including multi-tenancy,
 * subscription management, billing integration, and enterprise features.
 */

export * from './multi-tenancy.js';
export * from './subscription-management.js';
export * from './billing-integration.js';
export * from './enterprise-features.js';

// Main exports
export { SupabaseSaasAdvancedPack } from './supabase-saas-advanced-pack.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SAAS_ADVANCED_CONFIG = {
  multiTenancy: {
    enabled: true,
    dataIsolation: true,
    tenantRouting: true,
    resourceSharing: true,
    tenantManagement: true
  },
  subscription: {
    enabled: true,
    plans: true,
    trials: true,
    upgrades: true,
    cancellations: true
  },
  billing: {
    enabled: true,
    integration: true,
    invoices: true,
    payments: true,
    reporting: true
  },
  enterprise: {
    enabled: true,
    sso: true,
    audit: true,
    compliance: true,
    support: true
  }
};

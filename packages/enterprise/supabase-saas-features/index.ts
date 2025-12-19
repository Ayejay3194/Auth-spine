/**
 * Supabase SaaS Features Pack
 * 
 * Comprehensive SaaS features including multi-tenant architecture,
 * advanced database patterns, realtime, storage, API integrations,
 * billing, and compliance operations.
 */

export * from './multi-tenant-architecture.js';
export * from './advanced-database-patterns.js';
export * from './realtime-features.js';
export * from './storage-media.js';
export * from './api-integrations.js';
export * from './billing-features.js';
export * from './compliance-operations.js';
export * from './cli-local-tools.js';

// Main exports
export { SupabaseSaasFeatures } from './supabase-saas-features.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_SAAS_CONFIG = {
  multiTenant: {
    enabled: true,
    isolationLevel: 'schema',
    tenantIdentification: 'subdomain',
    provisioning: 'automatic'
  },
  database: {
    enableAdvancedPatterns: true,
    enableSoftDeletes: true,
    enableAuditing: true,
    enableCaching: true
  },
  realtime: {
    enablePresence: true,
    enableBroadcast: true,
    enableCollaboration: true
  },
  storage: {
    enableMultiTenant: true,
    enableCDN: true,
    enableTransformations: true
  },
  api: {
    enableRateLimiting: true,
    enableWebhooks: true,
    enableGraphQL: false
  },
  billing: {
    enableSubscriptions: true,
    enableUsageTracking: true,
    enableInvoicing: true
  },
  compliance: {
    enableGDPR: true,
    enableSOC2: true,
    enableAuditLogs: true
  }
};

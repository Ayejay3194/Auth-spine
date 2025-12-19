/**
 * Supabase SaaS Features Pack
 * 
 * Comprehensive SaaS features for Supabase including multi-tenancy,
 * advanced database patterns, realtime features, storage, API integrations,
 * billing, compliance operations, and CLI tools.
 */

export * from './capability-map.js';
export * from './multi-tenant.js';
export * from './advanced-db-patterns.js';
export * from './realtime-features.js';
export * from './storage-media.js';
export * from './api-integrations.js';
export * from './billing.js';
export * from './compliance-ops.js';
export * from './cli-local.js';

// Main exports
export { SupabaseSaasFeaturesPack } from './supabase-saas-features-pack.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SAAS_FEATURES_CONFIG = {
  capabilityMap: {
    enabled: true,
    features: true,
    mapping: true,
    documentation: true
  },
  multiTenant: {
    enabled: true,
    resolution: true,
    middleware: true,
    migrations: true,
    rls: true
  },
  advancedDb: {
    enabled: true,
    softDelete: true,
    auditTrail: true,
    versioning: true,
    hierarchy: true
  },
  realtime: {
    enabled: true,
    chat: true,
    presence: true,
    notifications: true
  },
  storage: {
    enabled: true,
    policies: true,
    media: true,
    thumbnails: true
  },
  api: {
    enabled: true,
    keys: true,
    webhooks: true,
    replayProtection: true
  },
  billing: {
    enabled: true,
    plans: true,
    gating: true,
    webhooks: true
  },
  compliance: {
    enabled: true,
    dataExport: true,
    dataDeletion: true,
    impersonation: true
  },
  cli: {
    enabled: true,
    local: true,
    structure: true,
    tools: true
  }
};

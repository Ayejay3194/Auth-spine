/**
 * Supabase Advanced Features Pack
 * 
 * Comprehensive Supabase advanced features including authentication,
 * real-time, storage, edge functions, monitoring, and security.
 */

export * from './advanced-auth.js';
export * from './realtime-features.js';
export * from './storage-advanced.js';
export * from './edge-functions.js';
export * from './monitoring-analytics.js';
export * from './security-enhanced.js';

// Main exports
export { SupabaseAdvancedFeaturesPack } from './supabase-advanced-features-pack.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_ADVANCED_CONFIG = {
  auth: {
    enabled: true,
    multiFactor: true,
    sso: true,
    rbac: true,
    sessionManagement: true,
    passwordPolicies: true
  },
  realtime: {
    enabled: true,
    presence: true,
    broadcast: true,
    channels: true,
    collaboration: true
  },
  storage: {
    enabled: true,
    cdn: true,
    transformations: true,
    encryption: true,
    versioning: true,
    policies: true
  },
  edgeFunctions: {
    enabled: true,
    scheduled: true,
    webhooks: true,
    caching: true,
    monitoring: true
  },
  monitoring: {
    enabled: true,
    metrics: true,
    logs: true,
    alerts: true,
    dashboards: true
  },
  security: {
    enabled: true,
    rls: true,
    audit: true,
    encryption: true,
    accessControl: true
  }
};

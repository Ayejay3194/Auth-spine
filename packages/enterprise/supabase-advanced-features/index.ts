/**
 * Supabase Advanced Features Pack
 * 
 * Comprehensive advanced features for Supabase including SQL extensions,
 * Edge Functions, TypeScript SDK layer, and testing utilities.
 */

export * from './sql-extensions.js';
export * from './monitoring-views.js';
export * from './audit-logging.js';
export * from './storage-policies.js';
export * from './edge-functions.js';
export * from './realtime-helpers.js';
export * from './search-helpers.js';
export * from './db-admin-tools.js';

// Main exports
export { SupabaseAdvancedFeatures } from './supabase-advanced-features.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_ADVANCED_CONFIG = {
  sql: {
    enableExtensions: true,
    enableMonitoring: true,
    enableAudit: true,
    enableSearch: true
  },
  edgeFunctions: {
    enableMiddleware: true,
    enableAuthGate: true,
    enableRateLimit: true,
    enableWebhooks: true,
    enableCronJobs: true
  },
  realtime: {
    enablePresence: true,
    enableBroadcast: true,
    enableChannels: true
  },
  storage: {
    enableSignedUrls: true,
    enablePolicies: true,
    enableResumableUploads: true
  },
  testing: {
    enableDBTests: true,
    enableAPITests: true,
    enableRLSTests: true
  }
};

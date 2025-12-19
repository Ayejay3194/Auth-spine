/**
 * Supabase SaaS Advanced Pack 2
 * 
 * Advanced SaaS features with Next.js integration,
 * enhanced configurations, and enterprise-grade capabilities.
 */

export * from './nextjs-integration.js';
export * from './advanced-config.js';
export * from './enterprise-features.js';
export * from './performance-optimization.js';
export * from './security-enhancements.js';

// Main exports
export { SupabaseSaaSAdvanced2 } from './supabase-saas-advanced-2.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_SAAS_ADVANCED_2_CONFIG = {
  nextjs: {
    enabled: true,
    appDir: true,
    middleware: true,
    apiRoutes: true,
    pages: {
      dashboard: true,
      billing: true,
      settings: true,
      admin: true
    }
  },
  database: {
    advanced: true,
    pooling: true,
    ssl: true,
    backups: true,
    monitoring: true
  },
  auth: {
    mfa: true,
    sso: true,
    rbac: true,
    sessions: true,
    providers: ['email', 'google', 'github', 'saml']
  },
  storage: {
    cdn: true,
    transformations: true,
    encryption: true,
    versioning: true,
    multiRegion: true
  },
  functions: {
    edge: true,
    scheduled: true,
    webhooks: true,
    caching: true,
    monitoring: true
  },
  realtime: {
    presence: true,
    broadcast: true,
    collaboration: true,
    notifications: true,
    channels: true
  }
};

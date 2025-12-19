/**
 * Supabase Security Pack
 * 
 * Comprehensive security framework for Supabase including authentication,
 * authorization, data protection, monitoring, and compliance.
 */

export * from './auth-security.js';
export * from './data-protection.js';
export * from './access-control.js';
export * from './security-monitoring.js';
export * from './compliance-framework.js';

// Main exports
export { SupabaseSecurityPack } from './supabase-security-pack.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_SECURITY_CONFIG = {
  auth: {
    enabled: true,
    mfa: true,
    sso: true,
    sessionManagement: true,
    passwordPolicies: true
  },
  dataProtection: {
    enabled: true,
    encryption: true,
    masking: true,
    backup: true,
    retention: true
  },
  accessControl: {
    enabled: true,
    rls: true,
    rbac: true,
    apiKeys: true,
    permissions: true
  },
  monitoring: {
    enabled: true,
    audit: true,
    alerts: true,
    logging: true,
    analytics: true
  },
  compliance: {
    enabled: true,
    frameworks: true,
    reporting: true,
    evidence: true,
    assessments: true
  }
};

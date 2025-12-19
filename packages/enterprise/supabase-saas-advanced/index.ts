/**
 * Supabase SaaS/PaaS Advanced Pack
 * 
 * A starter enforcement layer for building a multi-tenant SaaS on Supabase + Postgres.
 * Provides patterns + scaffolding to ship without cross-tenant leaks.
 */

export * from './tenant-isolation.js';
export * from './rls-policies.js';
export * from './audit-logging.js';
export * from './quota-management.js';
export * from './api-keys.js';
export * from './edge-functions.js';
export * from './security-headers.js';
export * from './testing-suite.js';

// Main exports
export { SupabaseSaaSAdvanced } from './supabase-saas-advanced.js';
export { 
  TenantContext,
  RLSPolicy,
  AuditLog,
  QuotaLimit,
  APIKey,
  EdgeFunction,
  SecurityHeader
} from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_SAAS_CONFIG = {
  enableTenantIsolation: true,
  enableRLSPolicies: true,
  enableAuditLogging: true,
  enableQuotaManagement: true,
  enableAPIKeys: true,
  enableEdgeFunctions: true,
  enableSecurityHeaders: true,
  tenantIdClaim: 'tenant_id',
  auditRetention: 2555, // 7 years in days
  quotaEnforcement: 'strict', // 'strict' | 'lenient' | 'disabled'
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 100,
    burstLimit: 200,
    storage: 'redis' // 'memory' | 'redis' | 'upstash'
  },
  security: {
    webhookSecret: true,
    hmacValidation: true,
    replayProtection: true,
    signedUploads: true,
    csrfProtection: true
  },
  testing: {
    enablePolicyTests: true,
    enableUnitTests: true,
    enableIntegrationTests: true,
    testDatabase: 'test_saas'
  }
};

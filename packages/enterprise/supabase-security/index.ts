/**
 * Supabase Security & Architecture Pack
 * 
 * Luxury Booking Platform – Hardened Setup
 * 
 * This pack gives you Supabase-first security with:
 * - Auth + MFA
 * - Row Level Security (RLS)
 * - Ops vs Public separation
 * - Storage security
 * - Audit logging
 * - Production-safe defaults
 */

export * from './authentication.js';
export * from './row-level-security.js';
export * from './storage-security.js';
export * from './audit-logging.js';
export * from './ops-separation.js';
export * from './production-config.js';

// Main exports
export { SupabaseSecurity } from './supabase-security.js';
export { 
  SecurityConfig,
  AuthConfig,
  RLSConfig,
  StorageConfig,
  AuditConfig,
  OpsConfig
} from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_SECURITY_CONFIG = {
  authentication: {
    enableMFA: true,
    enableSSO: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5
    },
    sessionTimeout: 3600, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 900, // 15 minutes
    enablePasswordless: true
  },
  rowLevelSecurity: {
    enabled: true,
    enforceOnAllTables: true,
    bypassForServiceRole: true,
    enableTenantIsolation: true,
    enableRoleBasedAccess: true
  },
  storage: {
    enableVirusScanning: true,
    enableContentValidation: true,
    maxFileSize: 104857600, // 100MB
    allowedTypes: ['image/*', 'application/pdf', 'text/*'],
    enableSignedURLs: true,
    urlExpiration: 3600,
    enableVersioning: true
  },
  audit: {
    enabled: true,
    logLevel: 'info',
    retentionDays: 2555, // 7 years
    logFailedAuth: true,
    logDataAccess: true,
    logSchemaChanges: true,
    enableRealTime: true
  },
  ops: {
    enableOpsSeparation: true,
    opsDatabase: 'ops_db',
    publicDatabase: 'public_db',
    enableOpsAuth: true,
    opsRoles: ['ops_admin', 'ops_user'],
    enableOpsAudit: true
  },
  production: {
    enableSSL: true,
    enableBackup: true,
    backupRetention: 30,
    enableMonitoring: true,
    enableAlerts: true,
    enableRateLimiting: true,
    enableCORS: true,
    allowedOrigins: ['https://yourdomain.com']
  }
};

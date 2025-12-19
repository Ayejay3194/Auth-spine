/**
 * SaaS/PaaS Security Suite
 * 
 * Comprehensive security controls for multi-tenant, subscription-based,
 * and internet-facing platforms with enterprise-grade protection.
 */

export * from './multi-tenant-security.js';
export * from './subscription-security.js';
export * from './tenant-isolation.js';
export * from './access-controls.js';
export * from './data-protection.js';
export * from './compliance-framework.js';
export * from './security-monitoring.js';
export * from './controls-catalog.js';

// Main exports
export { SaasPaasSecurity } from './saas-paas-security.js';
export { 
  SecurityConfig,
  TenantConfig,
  SubscriptionConfig,
  ComplianceConfig,
  MonitoringConfig
} from './types.js';

// Default configuration
export const DEFAULT_SAAS_PAAS_SECURITY_CONFIG = {
  multiTenant: {
    enableTenantIsolation: true,
    enableTenantSpecificSSL: true,
    enableTenantSpecificDomains: true,
    enableTenantSpecificStorage: true,
    enableTenantSpecificDatabases: true,
    enableTenantLevelMonitoring: true,
    enableTenantLevelCompliance: true
  },
  subscription: {
    enableSubscriptionBasedAccess: true,
    enableFeatureLevelControls: true,
    enableUsageBasedLimiting: true,
    enableSubscriptionSecurity: true,
    enableBillingSecurity: true,
    enableLicenseManagement: true
  },
  accessControls: {
    enableRBAC: true,
    enableABAC: true,
    enableTenantLevelRoles: true,
    enableCrossTenantAccessControl: true,
    enablePrivilegedAccessManagement: true,
    enableJustInTimeAccess: true
  },
  dataProtection: {
    enableEncryptionAtRest: true,
    enableEncryptionInTransit: true,
    enableTenantSpecificEncryption: true,
    enableDataClassification: true,
    enableDataLossPrevention: true,
    enableDataRetentionPolicies: true
  },
  compliance: {
    enableSOC2: true,
    enableISO27001: true,
    enableGDPR: true,
    enableHIPAA: false,
    enablePCI: false,
    enableCustomFrameworks: true
  },
  monitoring: {
    enableRealTimeMonitoring: true,
    enableTenantLevelMetrics: true,
    enableSecurityEventCorrelation: true,
    enableAutomatedThreatDetection: true,
    enableComplianceMonitoring: true,
    enablePerformanceMonitoring: true
  }
};

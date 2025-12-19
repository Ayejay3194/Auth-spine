/**
 * SaaS PaaS Security Checklist Package
 * 
 * Comprehensive security checklist for SaaS and PaaS platforms
 * covering authentication, data protection, infrastructure,
 * compliance, and operational security.
 */

export * from './security-checklist.js';
export * from './compliance-checklist.js';
export * from './operational-checklist.js';
export * from './assessment-tools.js';

// Main exports
export { SaasPaasSecurityChecklist } from './saas-paas-security-checklist.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SECURITY_CHECKLIST_CONFIG = {
  authentication: {
    enabled: true,
    mfa: true,
    sso: true,
    rbac: true,
    passwordPolicy: true,
    sessionManagement: true
  },
  dataProtection: {
    enabled: true,
    encryption: true,
    dataMasking: true,
    keyManagement: true,
    dataClassification: true,
    privacyControls: true
  },
  infrastructure: {
    enabled: true,
    networkSecurity: true,
    cloudSecurity: true,
    containerSecurity: true,
    apiSecurity: true,
    monitoring: true
  },
  compliance: {
    enabled: true,
    frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA'],
    controls: true,
    audits: true,
    reporting: true
  },
  operational: {
    enabled: true,
  incidentResponse: true,
  backupRecovery: true,
  changeManagement: true,
  vendorManagement: true,
  training: true
  }
};

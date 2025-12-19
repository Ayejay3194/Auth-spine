/**
 * Comprehensive Platform Security Package
 * 
 * Enterprise-grade security framework covering authentication,
 * authorization, data protection, network security, infrastructure,
 * secrets management, CI/CD security, monitoring, compliance,
 * and more.
 */

export * from './auth-authorization.js';
export * from './application-security.js';
export * from './data-protection.js';
export * from './network-security.js';
export * from './infrastructure-security.js';
export * from './secrets-management.js';
export * from './cicd-security.js';
export * from './monitoring-incident-response.js';
export * from './compliance-governance.js';
export * from './physical-security.js';
export * from './supply-chain-security.js';
export * from './client-security.js';
export * from './testing-backup.js';
export * from './advanced-security.js';

// Main exports
export { ComprehensivePlatformSecurity } from './comprehensive-platform-security.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_COMPREHENSIVE_SECURITY_CONFIG = {
  authentication: {
    enabled: true,
    mfa: true,
    sso: true,
    rbac: true,
    passwordPolicy: true,
    sessionManagement: true
  },
  application: {
    enabled: true,
    inputValidation: true,
    outputEncoding: true,
    csrfProtection: true,
    rateLimiting: true,
    securityHeaders: true
  },
  dataProtection: {
    enabled: true,
    encryption: true,
    dataMasking: true,
    keyManagement: true,
    dataClassification: true,
    privacyControls: true
  },
  network: {
    enabled: true,
    firewall: true,
    ddosProtection: true,
    loadBalancing: true,
    networkSegmentation: true,
    vpnAccess: true
  },
  infrastructure: {
    enabled: true,
    hardening: true,
    patchManagement: true,
    monitoring: true,
    logging: true,
    backup: true
  },
  secrets: {
    enabled: true,
    vault: true,
    rotation: true,
    audit: true,
    accessControl: true,
    encryption: true
  },
  cicd: {
    enabled: true,
    codeScanning: true,
    dependencyScanning: true,
    pipelineSecurity: true,
    artifactSigning: true,
    environmentProtection: true
  },
  monitoring: {
    enabled: true,
    securityMonitoring: true,
    threatDetection: true,
    incidentResponse: true,
    forensics: true,
    reporting: true
  },
  compliance: {
    enabled: true,
    frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA'],
    controls: true,
    audits: true,
    reporting: true,
    documentation: true
  }
};

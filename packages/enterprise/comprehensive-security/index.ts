/**
 * Comprehensive Platform Security Package
 * 
 * A full, end-to-end security blueprint for modern online platforms.
 * Designed to prevent internal leakage, external compromise, compliance failures,
 * and operational security debt.
 */

export * from './security-blueprint.js';
export * from './auth-authorization.js';
export * from './application-security.js';
export * from './data-protection.js';
export * from './network-security.js';
export * from './infrastructure-security.js';
export * from './secrets-management.js';
export * from './ci-cd-security.js';
export * from './monitoring-incident-response.js';
export * from './compliance-governance.js';
export * from './physical-security.js';
export * from './supply-chain-security.js';
export * from './client-security.js';
export * from './testing-backup.js';
export * from './emerging-security.js';

// Main exports
export { ComprehensiveSecurity } from './comprehensive-security.js';
export { 
  SecurityDomain,
  SecurityControl,
  SecurityPolicy,
  SecurityAssessment,
  SecurityBlueprint
} from './types.js';

// Default configuration
export const DEFAULT_COMPREHENSIVE_SECURITY_CONFIG = {
  enableAllDomains: true,
  enforceControls: true,
  auditMode: false,
  complianceFrameworks: [
    'SOC2',
    'ISO27001',
    'NIST-CSF',
    'GDPR',
    'HIPAA',
    'PCI-DSS'
  ],
  securityDomains: [
    'authentication',
    'authorization',
    'application-security',
    'data-protection',
    'encryption',
    'network-security',
    'infrastructure-security',
    'secrets-management',
    'ci-cd-security',
    'monitoring',
    'incident-response',
    'compliance',
    'governance',
    'physical-security',
    'supply-chain',
    'client-security',
    'testing',
    'backup-recovery',
    'emerging-threats'
  ],
  assessmentFrequency: 'quarterly',
  reportFormat: 'detailed',
  autoRemediation: false,
  alertThreshold: 'medium'
};

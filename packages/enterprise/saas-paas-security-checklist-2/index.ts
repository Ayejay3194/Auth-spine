/**
 * SaaS PaaS Security Checklist Pack 2
 * 
 * Enhanced security checklist framework for SaaS and PaaS platforms
 * with additional modules and structured assessments.
 */

export * from './enhanced-checklist.js';
export * from './structured-assessments.js';
export * from './compliance-modules.js';

// Main exports
export { SaasPaasSecurityChecklist2 } from './saas-paas-security-checklist-2.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SECURITY_CHECKLIST_2_CONFIG = {
  enhanced: {
    enabled: true,
    advancedControls: true,
    automatedAssessments: true,
    continuousMonitoring: true,
    threatModeling: true
  },
  structured: {
    enabled: true,
    riskAssessments: true,
    gapAnalysis: true,
    maturityModels: true,
    benchmarking: true
  },
  compliance: {
    enabled: true,
    frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST'],
    automatedCompliance: true,
    evidenceCollection: true,
    auditReadiness: true
  }
};

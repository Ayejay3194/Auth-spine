/**
 * Compliance and Governance Layer
 * 
 * Comprehensive compliance and governance framework for enterprise operations
 * including regulatory compliance, policy management, audit trails, and governance controls.
 */

export * from './regulatory-compliance.js';
export * from './policy-management.js';
export * from './audit-trail.js';
export * from './governance-controls.js';

// Main exports
export { ComplianceGovernanceLayer } from './compliance-governance-layer.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_COMPLIANCE_GOVERNANCE_CONFIG = {
  compliance: {
    enabled: true,
    frameworks: true,
    assessments: true,
    reporting: true,
    monitoring: true
  },
  policy: {
    enabled: true,
    management: true,
    enforcement: true,
    reviews: true,
    documentation: true
  },
  audit: {
    enabled: true,
    logging: true,
    trails: true,
    reporting: true,
    archiving: true
  },
  governance: {
    enabled: true,
    controls: true,
    risk: true,
    oversight: true,
    compliance: true
  }
};

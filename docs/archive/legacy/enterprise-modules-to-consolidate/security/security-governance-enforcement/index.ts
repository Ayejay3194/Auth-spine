/**
 * Security Governance Enforcement
 * 
 * Comprehensive security governance framework with automated enforcement,
 * AI-powered monitoring, risk management, and compliance controls.
 */

export * from './governance-controls.js';
export * from './automated-enforcement.js';
export * from './risk-management.js';
export * from './ai-monitoring.js';

// Main exports
export { SecurityGovernanceEnforcement } from './security-governance-enforcement.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_GOVERNANCE_ENFORCEMENT_CONFIG = {
  governance: {
    enabled: true,
    policyEnforcement: true,
    complianceControls: true,
    auditAutomation: true,
    reporting: true
  },
  enforcement: {
    enabled: true,
    automatedControls: true,
    realTimeMonitoring: true,
    violationDetection: true,
    remediationAutomation: true
  },
  risk: {
    enabled: true,
    riskAssessment: true,
    threatModeling: true,
    vulnerabilityManagement: true,
    riskMitigation: true
  },
  ai: {
    enabled: true,
    anomalyDetection: true,
    predictiveAnalysis: true,
    threatIntelligence: true,
    automatedResponse: true
  }
};

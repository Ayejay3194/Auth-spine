/**
 * Security Next-Level Suite
 * 
 * This bundle adds the final maturity layers:
 * 1) Compliance Crosswalks (SOC2, ISO, NIST, PCI)
 * 2) Automated Enforcement & Guardrails
 * 3) Executive Security Dashboard & Metrics
 * 
 * This turns security from a checklist into an operating system.
 */

export * from './compliance-crosswalks.js';
export * from './automated-enforcement.js';
export * from './executive-dashboard.js';

// Main exports
export { SecurityNextLevel } from './security-next-level.js';
export { 
  ComplianceCrosswalk,
  EnforcementGuardrail,
  ExecutiveMetric,
  SecurityOperatingSystem
} from './types.js';

// Default configuration
export const DEFAULT_SECURITY_NEXT_LEVEL_CONFIG = {
  enableComplianceCrosswalks: true,
  enableAutomatedEnforcement: true,
  enableExecutiveDashboard: true,
  frameworks: ['SOC2', 'ISO27001', 'NIST-CSF', 'PCI-DSS'],
  enforcementMode: 'monitor', // 'monitor' | 'enforce' | 'block'
  dashboardRefreshInterval: 300000, // 5 minutes
  alertThresholds: {
    critical: 90,
    high: 75,
    medium: 50,
    low: 25
  },
  crosswalkMappings: {
    'SOC2': ['Trust Services Criteria'],
    'ISO27001': ['Annex A Controls'],
    'NIST-CSF': ['Core Functions'],
    'PCI-DSS': ['Requirement Controls']
  }
};

/**
 * Security Governance & Enforcement Layer
 * 
 * This repository turns security requirements into ENFORCED controls.
 * No control = no deploy.
 */

export * from './control-registry.js';
export * from './security-gates.js';
export * from './ai-trust-boundary.js';
export * from './risk-acceptance.js';
export * from './runtime-enforcement.js';
export * from './logging-monitoring.js';

// Main exports
export { SecurityGovernance } from './security-governance.js';
export { 
  SecurityControl, 
  SecurityGate, 
  RiskAcceptance,
  AITrustBoundary,
  RuntimeEnforcement
} from './types.js';

// Default configuration
export const DEFAULT_SECURITY_CONFIG = {
  enforceControls: true,
  blockOnFailure: true,
  requireRiskAcceptance: true,
  enableRuntimeEnforcement: true,
  enableCIGates: true,
  enableAITrustBoundary: true,
  logLevel: 'info',
  auditRetention: 2555, // 7 years in days
  riskAcceptanceExpiration: 90, // days
  controlCategories: [
    'authentication',
    'authorization',
    'data-protection',
    'ai-security',
    'infrastructure',
    'logging',
    'monitoring'
  ]
};

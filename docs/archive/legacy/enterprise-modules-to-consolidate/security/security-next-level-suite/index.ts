/**
 * Security Next Level Suite
 * 
 * Advanced security framework with next-generation compliance,
 * automated enforcement, and comprehensive dashboard capabilities.
 */

export * from './next-level-compliance.js';
export * from './automated-enforcement.js';
export * from './security-dashboard.js';

// Main exports
export { SecurityNextLevelSuite } from './security-next-level-suite.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SECURITY_NEXT_LEVEL_CONFIG = {
  compliance: {
    enabled: true,
    advancedFrameworks: true,
    continuousMonitoring: true,
    predictiveCompliance: true,
    automatedAuditing: true
  },
  enforcement: {
    enabled: true,
    intelligentControls: true,
    adaptivePolicies: true,
    realTimeResponse: true,
    automatedRemediation: true
  },
  dashboard: {
    enabled: true,
    realTimeMetrics: true,
    threatVisualization: true,
    complianceReporting: true,
    executiveInsights: true
  }
};

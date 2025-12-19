/**
 * Governance & Drift Control Layer
 * 
 * The final layer that prevents system drift, preserves original intent at scale,
 * and avoids quiet degradation of quality, culture, and trust.
 */

export * from './drift-controller.js';
export * from './intent-registry.js';
export * from './signal-monitor.js';
export * from './continuity-guard.js';
export * from './culture-preservation.js';
export * from './power-balancing.js';

// Main exports
export { GovernanceDriftControl } from './governance-drift-control.js';
export { 
  ProductIntent, 
  DriftSignal, 
  ContinuityMetric,
  CultureIndicator,
  PowerBalance
} from './types.js';

// Default configuration
export const DEFAULT_GOVERNANCE_CONFIG = {
  enableIntentValidation: true,
  enableDriftDetection: true,
  enableContinuityMonitoring: true,
  enableCulturePreservation: true,
  enablePowerBalancing: true,
  driftThreshold: 0.15, // 15% drift threshold
  reviewInterval: 7 * 24 * 60 * 60 * 1000, // 1 week
  alertThreshold: 0.1, // 10% alert threshold
  autoCorrection: false, // Require manual review
  governanceLayers: [
    'intent',
    'implementation',
    'operations',
    'culture',
    'power'
  ]
};

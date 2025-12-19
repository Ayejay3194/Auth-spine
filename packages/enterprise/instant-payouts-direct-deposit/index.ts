/**
 * Instant Payouts Direct Deposit
 * 
 * Comprehensive instant payout and direct deposit system for enterprise
 * financial operations, payment processing, and fund management.
 */

export * from './payout-processing.js';
export * from './direct-deposit.js';
export * from './compliance-monitoring.js';
export * from './reliability-engine.js';

// Main exports
export { InstantPayoutsDirectDeposit } from './instant-payouts-direct-deposit.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_INSTANT_PAYOUTS_CONFIG = {
  payouts: {
    enabled: true,
    processing: true,
    validation: true,
    scheduling: true,
    tracking: true
  },
  directDeposit: {
    enabled: true,
    verification: true,
    routing: true,
    settlement: true,
    reconciliation: true
  },
  compliance: {
    enabled: true,
    monitoring: true,
    reporting: true,
    riskAssessment: true,
    auditTrail: true
  },
  reliability: {
    enabled: true,
    monitoring: true,
    failover: true,
    scaling: true,
    performance: true
  }
};

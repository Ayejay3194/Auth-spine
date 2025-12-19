/**
 * Adapters for Ops Dashboard
 * 
 * Provides adapter interfaces for integrating with external systems
 * like payment processors, payroll systems, POS systems, etc.
 */

export * from './payments.js';
export * from './payroll.js';
export * from './pos.js';
export * from './database.js';
export * from './notifications.js';
export * from './audit.js';

// Adapter registry
export { AdapterRegistry } from './adapter-registry.js';

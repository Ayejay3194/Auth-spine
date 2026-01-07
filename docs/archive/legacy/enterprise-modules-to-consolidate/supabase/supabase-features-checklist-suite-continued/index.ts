/**
 * Supabase Features Checklist Suite Continued
 * 
 * Extended checklist suite for advanced Supabase features including
 * AI capabilities, catalog management, functions, observability, and testing.
 */

export * from './ai-features.js';
export * from './catalog-management.js';
export * from './function-extensions.js';
export * from './observability-suite.js';
export * from './testing-framework.js';

// Main exports
export { SupabaseFeaturesChecklistSuiteContinued } from './supabase-features-checklist-suite-continued.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_FEATURES_CHECKLIST_CONTINUED_CONFIG = {
  ai: {
    enabled: true,
    models: true,
    embeddings: true,
    completion: true,
    analysis: true
  },
  catalog: {
    enabled: true,
    schemas: true,
    tables: true,
    relationships: true,
    documentation: true
  },
  functions: {
    enabled: true,
    edge: true,
    database: true,
    webhooks: true,
    scheduled: true
  },
  observability: {
    enabled: true,
    metrics: true,
    logging: true,
    tracing: true,
    alerting: true
  },
  testing: {
    enabled: true,
    unit: true,
    integration: true,
    e2e: true,
    performance: true
  }
};

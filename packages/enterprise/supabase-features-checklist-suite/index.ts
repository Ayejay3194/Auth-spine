/**
 * Supabase Features Checklist Suite
 * 
 * Comprehensive checklist framework for Supabase SaaS and PaaS features
 * with validation, implementation guidance, and best practices.
 */

export * from './feature-checklist.js';
export * from './implementation-guide.js';
export * from './validation-tools.js';
export * from './best-practices.js';

// Main exports
export { SupabaseFeaturesChecklistSuite } from './supabase-features-checklist-suite.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_FEATURES_CHECKLIST_CONFIG = {
  checklist: {
    enabled: true,
    categories: true,
    validation: true,
    tracking: true,
    reporting: true
  },
  implementation: {
    enabled: true,
    guidance: true,
    templates: true,
    examples: true,
    documentation: true
  },
  validation: {
    enabled: true,
    automated: true,
    manual: true,
    testing: true,
    compliance: true
  },
  bestPractices: {
    enabled: true,
    patterns: true,
    guidelines: true,
    recommendations: true,
    optimization: true
  }
};

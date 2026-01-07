/**
 * Supabase SaaS Checklist Pack
 * 
 * Comprehensive checklist framework for Supabase SaaS implementations
 * covering architecture, security, compliance, and best practices.
 */

export * from './checklist-manager.js';
export * from './implementation-checklist.js';
export * from './security-checklist.js';
export * from './compliance-checklist.js';

// Main exports
export { SupabaseSaasChecklistPack } from './supabase-saas-checklist-pack.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SAAS_CHECKLIST_CONFIG = {
  checklist: {
    enabled: true,
    categories: true,
    validation: true,
    tracking: true,
    reporting: true
  },
  implementation: {
    enabled: true,
    phases: true,
    tasks: true,
    dependencies: true,
    milestones: true
  },
  security: {
    enabled: true,
    controls: true,
    assessments: true,
    monitoring: true,
  },
  compliance: {
    enabled: true,
    frameworks: true,
    controls: true,
    evidence: true,
    audits: true
  }
};

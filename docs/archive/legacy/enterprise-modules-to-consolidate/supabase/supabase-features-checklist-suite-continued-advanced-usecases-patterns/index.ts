/**
 * Supabase Features Checklist Suite Continued - Advanced Use Cases & Patterns
 * 
 * Advanced implementation patterns and use cases for Supabase features including
 * real-time collaboration, advanced security patterns, performance optimization,
 * and enterprise-grade architectures.
 */

export * from './realtime-collaboration.js';
export * from './advanced-security-patterns.js';
export * from './performance-optimization.js';
export * from './enterprise-architecture.js';
export * from './scalability-patterns.js';

// Main exports
export { SupabaseFeaturesChecklistSuiteContinuedAdvancedUseCasesPatterns } from './supabase-features-checklist-suite-continued-advanced-usecases-patterns.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_FEATURES_CHECKLIST_CONTINUED_ADVANCED_CONFIG = {
  realtime: {
    enabled: true,
    collaboration: true,
    synchronization: true,
    conflictResolution: true,
    presence: true
  },
  security: {
    enabled: true,
    advancedAuth: true,
    dataEncryption: true,
    auditLogging: true,
    threatDetection: true
  },
  performance: {
    enabled: true,
    caching: true,
    optimization: true,
    monitoring: true,
    tuning: true
  },
  architecture: {
    enabled: true,
    microservices: true,
    eventDriven: true,
    cqrs: true,
    saga: true
  },
  scalability: {
    enabled: true,
    horizontalScaling: true,
    loadBalancing: true,
    dataPartitioning: true,
    autoScaling: true
  }
};

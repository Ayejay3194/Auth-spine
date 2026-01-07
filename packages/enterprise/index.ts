/**
 * Enterprise Packages Main Entry Point
 * 
 * This file exports all enterprise packages and provides a unified interface
 * for accessing all enterprise functionality across the Auth-spine platform.
 */

// Core Enterprise Packages
export * from './analytics/index.js';
export * from './audit/index.js';
export * from './booking/index.js';
export * from './inventory/index.js';
export * from './monitoring/index.js';
export * from './payroll/index.js';
export * from './rbac/index.js';
export * from './security/index.js';
export * from './validation/index.js';

// Security Packages
export * from './beauty-booking-security/index.js';
export * from './comprehensive-platform-security/index.js';
export * from './comprehensive-security/index.js';
export * from './saas-paas-security/index.js';
export * from './security-governance/index.js';
// Archived security modules (moved to docs/archive/legacy/enterprise-modules-to-consolidate/security/):
// - saas-paas-security-checklist, saas-paas-security-checklist-2
// - saas-security, saas-security-starter-kit
// - security-defense-layer, security-governance-enforcement
// - security-next-level, security-next-level-suite

// Supabase Packages
export * from './supabase-advanced/index.js';
export * from './supabase-advanced-features/index.js';
export * from './supabase-at-home/index.js';
export * from './supabase-features-checklist-suite/index.js';
export * from './supabase-saas-advanced/index.js';
export * from './supabase-saas-features/index.js';
export * from './supabase-security/index.js';
// Archived supabase modules (moved to docs/archive/legacy/enterprise-modules-to-consolidate/supabase/):
// - supabase-advanced-features-pack, supabase-at-home-pack
// - supabase-features-checklist-suite-continued, supabase-features-checklist-suite-continued-advanced-usecases-patterns
// - supabase-saas-advanced-2, supabase-saas-advanced-pack
// - supabase-saas-checklist-pack, supabase-saas-features-pack, supabase-security-pack

// Business Operations
export * from './customer-crm-system/index.js';
export * from './financial-reporting-dashboard/index.js';
export * from './instant-payouts-direct-deposit/index.js';
export * from './ops-dashboard/index.js';

// Governance and Compliance
export * from './compliance-governance-layer/index.js';
export * from './governance-drift/index.js';
export * from './legal-compliance/index.js';

// Advanced Features
export * from './kill-switches/index.js';
export * from './launch-gate/index.js';
export * from './nlu/index.js';
export * from './vibe-coding-disasters/index.js';

// New Platform Modules
export * from './platform/index.js';

// Enterprise Orchestrator
import { EnterpriseOrchestrator } from './orchestrator.js';

export { EnterpriseOrchestrator };

/**
 * Enterprise Package Manager
 * 
 * Main class for managing all enterprise packages and their interactions.
 */
export class EnterprisePackageManager {
  private orchestrator: EnterpriseOrchestrator;
  private initialized = false;

  constructor() {
    this.orchestrator = new EnterpriseOrchestrator();
  }

  /**
   * Initialize all enterprise packages
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.orchestrator.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize enterprise packages:', error);
      throw error;
    }
  }

  /**
   * Get enterprise orchestrator instance
   */
  getOrchestrator(): EnterpriseOrchestrator {
    return this.orchestrator;
  }

  /**
   * Get health status of all enterprise packages
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    packages: Record<string, boolean>;
  }> {
    try {
      return await this.orchestrator.getHealthStatus();
    } catch (error) {
      console.error('Failed to get enterprise health status:', error);
      return {
        overall: false,
        packages: {}
      };
    }
  }

  /**
   * Get metrics from all enterprise packages
   */
  async getMetrics(): Promise<Record<string, any>> {
    try {
      return await this.orchestrator.getMetrics();
    } catch (error) {
      console.error('Failed to get enterprise metrics:', error);
      return {};
    }
  }

  /**
   * Cleanup all enterprise packages
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    await this.orchestrator.cleanup();
  }
}

// Default export for easy importing
export default EnterprisePackageManager;

// Create and export a default instance
export const enterprisePackageManager = new EnterprisePackageManager();

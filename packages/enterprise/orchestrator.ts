/**
 * Enterprise Orchestrator
 * 
 * Central orchestrator for managing all enterprise packages and their interactions.
 * Provides unified interfaces for initialization, health monitoring, and metrics collection.
 */

import { complianceGovernanceLayer } from './compliance-governance-layer/compliance-governance-layer.js';
import { comprehensiveSecurity } from './comprehensive-security/comprehensive-security.js';
import { comprehensivePlatformSecurity } from './comprehensive-platform-security/comprehensive-platform-security.js';
import { securityGovernance } from './security-governance/security-governance.js';
import { opsDashboard } from './ops-dashboard/ops-dashboard.js';

// Import all verified enterprise packages
import { analytics } from './analytics/analytics-engine.js';
import { audit } from './audit/factory.js';
import { booking } from './booking/booking.js';
import { inventory } from './inventory/inventory.js';
import { monitoring } from './monitoring/service.js';
import { payroll } from './payroll/payroll.js';
import { rbac } from './rbac/rbac.js';
import { security } from './security/security.js';
import { validation } from './validation/service.js';

// Security packages
import { beautyBookingSecurity } from './beauty-booking-security/beauty-booking-security.js';
import { saasPaasSecurity } from './saas-paas-security/saas-paas-security.js';
import { saasPaasSecurityChecklist } from './saas-paas-security-checklist/saas-paas-security-checklist.js';
import { saasPaasSecurityChecklist2 } from './saas-paas-security-checklist-2/saas-paas-security-checklist-2.js';
import { saasSecurity } from './saas-security/saas-security.js';
import { saasSecurityStarterKit } from './saas-security-starter-kit/saas-security-starter-kit.js';
import { securityDefenseLayer } from './security-defense-layer/security-defense-layer.js';
import { securityGovernanceEnforcement } from './security-governance-enforcement/security-governance-enforcement.js';
import { securityNextLevel } from './security-next-level/security-next-level.js';
import { securityNextLevelSuite } from './security-next-level-suite/security-next-level-suite.js';

// Supabase packages
import { supabaseAdvanced } from './supabase-advanced/index.js';
import { supabaseAdvancedFeatures } from './supabase-advanced-features/supabase-advanced-features.js';
import { supabaseAdvancedFeaturesPack } from './supabase-advanced-features-pack/supabase-advanced-features-pack.js';
import { supabaseAtHome } from './supabase-at-home/supabase-at-home.js';
import { supabaseAtHomePack } from './supabase-at-home-pack/supabase-at-home-pack.js';
import { supabaseFeaturesChecklistSuite } from './supabase-features-checklist-suite/supabase-features-checklist-suite.js';
import { supabaseFeaturesChecklistSuiteContinued } from './supabase-features-checklist-suite-continued/supabase-features-checklist-suite-continued.js';
import { supabaseFeaturesChecklistSuiteContinuedAdvancedUsecasesPatterns } from './supabase-features-checklist-suite-continued-advanced-usecases-patterns/supabase-features-checklist-suite-continued-advanced-usecases-patterns.js';
import { supabaseSaasAdvanced } from './supabase-saas-advanced/supabase-saas-advanced.js';
import { supabaseSaasAdvanced2 } from './supabase-saas-advanced-2/supabase-saas-advanced-2.js';
import { supabaseSaasAdvancedPack } from './supabase-saas-advanced-pack/supabase-saas-advanced-pack.js';
import { supabaseSaasChecklistPack } from './supabase-saas-checklist-pack/supabase-saas-checklist-pack.js';
import { supabaseSaasFeatures } from './supabase-saas-features/supabase-saas-features.js';
import { supabaseSaasFeaturesPack } from './supabase-saas-features-pack/supabase-saas-features-pack.js';
import { supabaseSecurity } from './supabase-security/supabase-security.js';
import { supabaseSecurityPack } from './supabase-security-pack/supabase-security-pack.js';

// Business operations
import { customerCrmSystem } from './customer-crm-system/customer-crm-system.js';
import { financialReportingDashboard } from './financial-reporting-dashboard/financial-reporting-dashboard.js';
import { instantPayoutsDirectDeposit } from './instant-payouts-direct-deposit/instant-payouts-direct-deposit.js';

// Governance and compliance
import { governanceDrift } from './governance-drift/governance-drift-control.js';
import { legalCompliance } from './legal-compliance/legal-compliance.js';

// Advanced features
import { killSwitches } from './kill-switches/manager.js';
import { launchGate } from './launch-gate/launch-gate.js';
import { nlu } from './nlu/nlu.js';
import { vibeCodingDisasters } from './vibe-coding-disasters/vibe-coding-disasters.js';
import { AIPlatformManager } from './ai-platform/manager.js';

// Insight Core - Unified AI/ML Spine
import * as insightCore from '@auth-spine/insight-core';

export class EnterpriseOrchestrator {
  private packages: Map<string, any> = new Map();
  private initialized = false;

  constructor() {
    // Register all enterprise packages
    this.registerPackages();
  }

  /**
   * Register all enterprise packages
   */
  private registerPackages(): void {
    // Core Governance and Compliance
    this.packages.set('complianceGovernanceLayer', complianceGovernanceLayer);
    this.packages.set('comprehensiveSecurity', comprehensiveSecurity);
    this.packages.set('comprehensivePlatformSecurity', comprehensivePlatformSecurity);
    this.packages.set('securityGovernance', securityGovernance);
    this.packages.set('opsDashboard', opsDashboard);

    // Core Enterprise Packages
    this.packages.set('analytics', analytics);
    this.packages.set('audit', audit);
    this.packages.set('booking', booking);
    this.packages.set('inventory', inventory);
    this.packages.set('monitoring', monitoring);
    this.packages.set('payroll', payroll);
    this.packages.set('rbac', rbac);
    this.packages.set('security', security);
    this.packages.set('validation', validation);

    // Security Packages
    this.packages.set('beautyBookingSecurity', beautyBookingSecurity);
    this.packages.set('saasPaasSecurity', saasPaasSecurity);
    this.packages.set('saasPaasSecurityChecklist', saasPaasSecurityChecklist);
    this.packages.set('saasPaasSecurityChecklist2', saasPaasSecurityChecklist2);
    this.packages.set('saasSecurity', saasSecurity);
    this.packages.set('saasSecurityStarterKit', saasSecurityStarterKit);
    this.packages.set('securityDefenseLayer', securityDefenseLayer);
    this.packages.set('securityGovernanceEnforcement', securityGovernanceEnforcement);
    this.packages.set('securityNextLevel', securityNextLevel);
    this.packages.set('securityNextLevelSuite', securityNextLevelSuite);

    // Supabase Packages
    this.packages.set('supabaseAdvanced', supabaseAdvanced);
    this.packages.set('supabaseAdvancedFeatures', supabaseAdvancedFeatures);
    this.packages.set('supabaseAdvancedFeaturesPack', supabaseAdvancedFeaturesPack);
    this.packages.set('supabaseAtHome', supabaseAtHome);
    this.packages.set('supabaseAtHomePack', supabaseAtHomePack);
    this.packages.set('supabaseFeaturesChecklistSuite', supabaseFeaturesChecklistSuite);
    this.packages.set('supabaseFeaturesChecklistSuiteContinued', supabaseFeaturesChecklistSuiteContinued);
    this.packages.set('supabaseFeaturesChecklistSuiteContinuedAdvancedUsecasesPatterns', supabaseFeaturesChecklistSuiteContinuedAdvancedUsecasesPatterns);
    this.packages.set('supabaseSaasAdvanced', supabaseSaasAdvanced);
    this.packages.set('supabaseSaasAdvanced2', supabaseSaasAdvanced2);
    this.packages.set('supabaseSaasAdvancedPack', supabaseSaasAdvancedPack);
    this.packages.set('supabaseSaasChecklistPack', supabaseSaasChecklistPack);
    this.packages.set('supabaseSaasFeatures', supabaseSaasFeatures);
    this.packages.set('supabaseSaasFeaturesPack', supabaseSaasFeaturesPack);
    this.packages.set('supabaseSecurity', supabaseSecurity);
    this.packages.set('supabaseSecurityPack', supabaseSecurityPack);

    // Business Operations
    this.packages.set('customerCrmSystem', customerCrmSystem);
    this.packages.set('financialReportingDashboard', financialReportingDashboard);
    this.packages.set('instantPayoutsDirectDeposit', instantPayoutsDirectDeposit);

    // Governance and Compliance
    this.packages.set('governanceDrift', governanceDrift);
    this.packages.set('legalCompliance', legalCompliance);

    // Advanced Features
    this.packages.set('killSwitches', killSwitches);
    this.packages.set('launchGate', launchGate);
    this.packages.set('nlu', nlu);
    this.packages.set('vibeCodingDisasters', vibeCodingDisasters);

    // AI/ML Platform
    this.packages.set('aiPlatform', new AIPlatformManager());
  }

  /**
   * Initialize all enterprise packages
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const initPromises = Array.from(this.packages.entries()).map(async ([name, pkg]) => {
      try {
        if (pkg && typeof pkg.initialize === 'function') {
          await pkg.initialize();
          console.log(`✅ Initialized enterprise package: ${name}`);
        } else {
          console.warn(`⚠️ Package ${name} does not have initialize method`);
        }
      } catch (error) {
        console.error(`❌ Failed to initialize package ${name}:`, error);
        // Continue with other packages instead of failing completely
        console.log(`⚠️ Continuing with package ${name} initialization failed`);
      }
    });

    await Promise.allSettled(initPromises);
    this.initialized = true;
    console.log(`🚀 Enterprise orchestrator initialized with ${this.packages.size} packages`);
  }

  /**
   * Get health status of all enterprise packages
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    packages: Record<string, boolean>;
  }> {
    const healthStatus: Record<string, boolean> = {};
    let overallHealthy = true;

    for (const [name, pkg] of this.packages) {
      try {
        if (pkg && typeof pkg.getHealthStatus === 'function') {
          const isHealthy = await pkg.getHealthStatus();
          healthStatus[name] = isHealthy;
          if (!isHealthy) {
            overallHealthy = false;
          }
        } else {
          healthStatus[name] = true; // Assume healthy if no health check
        }
      } catch (error) {
        console.error(`Health check failed for ${name}:`, error);
        healthStatus[name] = false;
        overallHealthy = false;
      }
    }

    return {
      overall: overallHealthy,
      packages: healthStatus
    };
  }

  /**
   * Get metrics from all enterprise packages
   */
  async getMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};

    for (const [name, pkg] of this.packages) {
      try {
        if (pkg && typeof pkg.getMetrics === 'function') {
          metrics[name] = await pkg.getMetrics();
        }
      } catch (error) {
        console.error(`Failed to get metrics for ${name}:`, error);
        metrics[name] = { error: error.message };
      }
    }

    return metrics;
  }

  /**
   * Get specific package instance
   */
  getPackage(name: string): any {
    return this.packages.get(name);
  }

  /**
   * List all registered packages
   */
  listPackages(): string[] {
    return Array.from(this.packages.keys());
  }

  /**
   * Add a new package to the orchestrator
   */
  addPackage(name: string, pkg: any): void {
    this.packages.set(name, pkg);
  }

  /**
   * Remove a package from the orchestrator
   */
  removePackage(name: string): void {
    this.packages.delete(name);
  }

  /**
   * Cleanup all enterprise packages
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.packages.entries()).map(async ([name, pkg]) => {
      try {
        if (pkg && typeof pkg.cleanup === 'function') {
          await pkg.cleanup();
        }
      } catch (error) {
        console.error(`Failed to cleanup package ${name}:`, error);
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.initialized = false;
  }

  /**
   * Generate comprehensive enterprise report
   */
  async generateEnterpriseReport(): Promise<{
    summary: any;
    health: any;
    metrics: any;
    packages: any[];
  }> {
    const health = await this.getHealthStatus();
    const metrics = await this.getMetrics();
    const packages = this.listPackages();

    return {
      summary: {
        totalPackages: packages.length,
        healthyPackages: Object.values(health.packages).filter(Boolean).length,
        overallHealth: health.overall,
        initialized: this.initialized
      },
      health,
      metrics,
      packages: packages.map(name => ({
        name,
        healthy: health.packages[name] || false,
        hasMetrics: metrics[name] && !metrics[name].error
      }))
    };
  }
}

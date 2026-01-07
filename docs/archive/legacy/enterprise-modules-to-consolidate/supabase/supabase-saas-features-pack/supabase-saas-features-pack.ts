/**
 * Main Supabase SaaS Features Pack Class
 * 
 * Comprehensive SaaS features for Supabase including multi-tenancy,
 * advanced database patterns, realtime features, storage, API integrations,
 * billing, compliance operations, and CLI tools.
 */

import { SaasFeaturesConfig, SaasFeaturesMetrics, SaaSCapability, Tenant } from './types.js';
import { capabilityMap } from './capability-map.js';
import { multiTenant } from './multi-tenant.js';
import { advancedDbPatterns } from './advanced-db-patterns.js';
import { realtimeFeatures } from './realtime-features.js';
import { storageMedia } from './storage-media.js';
import { apiIntegrations } from './api-integrations.js';
import { billing } from './billing.js';
import { complianceOps } from './compliance-ops.js';
import { cliLocal } from './cli-local.js';

export class SupabaseSaasFeaturesPack {
  private config: SaasFeaturesConfig;
  private initialized = false;

  constructor(config: Partial<SaasFeaturesConfig> = {}) {
    this.config = {
      capabilityMap: {
        enabled: true,
        features: true,
        mapping: true,
        documentation: true,
        ...config.capabilityMap
      },
      multiTenant: {
        enabled: true,
        resolution: true,
        middleware: true,
        migrations: true,
        rls: true,
        ...config.multiTenant
      },
      advancedDb: {
        enabled: true,
        softDelete: true,
        auditTrail: true,
        versioning: true,
        hierarchy: true,
        ...config.advancedDb
      },
      realtime: {
        enabled: true,
        chat: true,
        presence: true,
        notifications: true,
        ...config.realtime
      },
      storage: {
        enabled: true,
        policies: true,
        media: true,
        thumbnails: true,
        ...config.storage
      },
      api: {
        enabled: true,
        keys: true,
        webhooks: true,
        replayProtection: true,
        ...config.api
      },
      billing: {
        enabled: true,
        plans: true,
        gating: true,
        webhooks: true,
        ...config.billing
      },
      compliance: {
        enabled: true,
        dataExport: true,
        dataDeletion: true,
        impersonation: true,
        ...config.compliance
      },
      cli: {
        enabled: true,
        local: true,
        structure: true,
        tools: true,
        ...config.cli
      }
    };
  }

  /**
   * Initialize the Supabase SaaS features pack
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all SaaS feature components
      await capabilityMap.initialize(this.config.capabilityMap);
      await multiTenant.initialize(this.config.multiTenant);
      await advancedDbPatterns.initialize(this.config.advancedDb);
      await realtimeFeatures.initialize(this.config.realtime);
      await storageMedia.initialize(this.config.storage);
      await apiIntegrations.initialize(this.config.api);
      await billing.initialize(this.config.billing);
      await complianceOps.initialize(this.config.compliance);
      await cliLocal.initialize(this.config.cli);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase SaaS features pack:', error);
      throw error;
    }
  }

  /**
   * Setup capability mapping
   */
  async setupCapabilityMap(): Promise<void> {
    if (!this.config.capabilityMap.enabled) {
      throw new Error('Capability mapping not enabled');
    }

    try {
      await capabilityMap.setupFeatures();
      await capabilityMap.setupMapping();
      await capabilityMap.setupDocumentation();
    } catch (error) {
      console.error('Failed to setup capability mapping:', error);
      throw error;
    }
  }

  /**
   * Setup multi-tenancy
   */
  async setupMultiTenant(): Promise<void> {
    if (!this.config.multiTenant.enabled) {
      throw new Error('Multi-tenancy not enabled');
    }

    try {
      await multiTenant.setupResolution();
      await multiTenant.setupMiddleware();
      await multiTenant.setupMigrations();
      await multiTenant.setupRLS();
    } catch (error) {
      console.error('Failed to setup multi-tenancy:', error);
      throw error;
    }
  }

  /**
   * Setup advanced database patterns
   */
  async setupAdvancedDbPatterns(): Promise<void> {
    if (!this.config.advancedDb.enabled) {
      throw new Error('Advanced database patterns not enabled');
    }

    try {
      await advancedDbPatterns.setupSoftDelete();
      await advancedDbPatterns.setupAuditTrail();
      await advancedDbPatterns.setupVersioning();
      await advancedDbPatterns.setupHierarchy();
    } catch (error) {
      console.error('Failed to setup advanced database patterns:', error);
      throw error;
    }
  }

  /**
   * Setup realtime features
   */
  async setupRealtimeFeatures(): Promise<void> {
    if (!this.config.realtime.enabled) {
      throw new Error('Realtime features not enabled');
    }

    try {
      await realtimeFeatures.setupChat();
      await realtimeFeatures.setupPresence();
      await realtimeFeatures.setupNotifications();
    } catch (error) {
      console.error('Failed to setup realtime features:', error);
      throw error;
    }
  }

  /**
   * Setup storage and media
   */
  async setupStorageMedia(): Promise<void> {
    if (!this.config.storage.enabled) {
      throw new Error('Storage and media not enabled');
    }

    try {
      await storageMedia.setupPolicies();
      await storageMedia.setupMedia();
      await storageMedia.setupThumbnails();
    } catch (error) {
      console.error('Failed to setup storage and media:', error);
      throw error;
    }
  }

  /**
   * Setup API integrations
   */
  async setupApiIntegrations(): Promise<void> {
    if (!this.config.api.enabled) {
      throw new Error('API integrations not enabled');
    }

    try {
      await apiIntegrations.setupKeys();
      await apiIntegrations.setupWebhooks();
      await apiIntegrations.setupReplayProtection();
    } catch (error) {
      console.error('Failed to setup API integrations:', error);
      throw error;
    }
  }

  /**
   * Setup billing
   */
  async setupBilling(): Promise<void> {
    if (!this.config.billing.enabled) {
      throw new Error('Billing not enabled');
    }

    try {
      await billing.setupPlans();
      await billing.setupGating();
      await billing.setupWebhooks();
    } catch (error) {
      console.error('Failed to setup billing:', error);
      throw error;
    }
  }

  /**
   * Setup compliance operations
   */
  async setupComplianceOps(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Compliance operations not enabled');
    }

    try {
      await complianceOps.setupDataExport();
      await complianceOps.setupDataDeletion();
      await complianceOps.setupImpersonation();
    } catch (error) {
      console.error('Failed to setup compliance operations:', error);
      throw error;
    }
  }

  /**
   * Setup CLI local tools
   */
  async setupCliLocal(): Promise<void> {
    if (!this.config.cli.enabled) {
      throw new Error('CLI local tools not enabled');
    }

    try {
      await cliLocal.setupLocal();
      await cliLocal.setupStructure();
      await cliLocal.setupTools();
    } catch (error) {
      console.error('Failed to setup CLI local tools:', error);
      throw error;
    }
  }

  /**
   * Get SaaS capabilities
   */
  async getSaaSCapabilities(): Promise<SaaSCapability[]> {
    try {
      return await capabilityMap.getCapabilities();
    } catch (error) {
      console.error('Failed to get SaaS capabilities:', error);
      throw error;
    }
  }

  /**
   * Get tenants
   */
  async getTenants(): Promise<Tenant[]> {
    try {
      return await multiTenant.getTenants();
    } catch (error) {
      console.error('Failed to get tenants:', error);
      throw error;
    }
  }

  /**
   * Create tenant
   */
  async createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      return await multiTenant.createTenant(tenant);
    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw error;
    }
  }

  /**
   * Get SaaS features metrics
   */
  async getMetrics(): Promise<SaasFeaturesMetrics> {
    try {
      const capabilityMapMetrics = await capabilityMap.getMetrics();
      const multiTenantMetrics = await multiTenant.getMetrics();
      const advancedDbMetrics = await advancedDbPatterns.getMetrics();
      const realtimeMetrics = await realtimeFeatures.getMetrics();
      const storageMetrics = await storageMedia.getMetrics();
      const apiMetrics = await apiIntegrations.getMetrics();
      const billingMetrics = await billing.getMetrics();
      const complianceMetrics = await complianceOps.getMetrics();
      const cliMetrics = await cliLocal.getMetrics();

      return {
        capabilityMap: capabilityMapMetrics,
        multiTenant: multiTenantMetrics,
        advancedDb: advancedDbMetrics,
        realtime: realtimeMetrics,
        storage: storageMetrics,
        api: apiMetrics,
        billing: billingMetrics,
        compliance: complianceMetrics,
        cli: cliMetrics,
        overall: {
          featureCoverage: Math.floor((capabilityMapMetrics.featuresMapped + capabilityMapMetrics.coveragePercentage) / 2),
          implementationProgress: Math.floor((multiTenantMetrics.tenantsActive + advancedDbMetrics.softDeleteImplemented) / 2),
          integrationScore: Math.floor((realtimeMetrics.connectionsActive + apiMetrics.apiCalls) / 2),
          maturityLevel: Math.floor((billingMetrics.plansActive + complianceMetrics.complianceScore) / 2)
        }
      };
    } catch (error) {
      console.error('Failed to get SaaS features metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(): Promise<{
    summary: any;
    capabilityMap: any;
    multiTenant: any;
    advancedDb: any;
    realtime: any;
    storage: any;
    api: any;
    billing: any;
    compliance: any;
    cli: any;
    recommendations: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          featureCoverage: metrics.overall.featureCoverage,
          implementationProgress: metrics.overall.implementationProgress,
          integrationScore: metrics.overall.integrationScore,
          maturityLevel: metrics.overall.maturityLevel
        },
        capabilityMap: {
          featuresMapped: metrics.capabilityMap.featuresMapped,
          documentationCreated: metrics.capabilityMap.documentationCreated,
          mappingAccuracy: metrics.capabilityMap.mappingAccuracy,
          coveragePercentage: metrics.capabilityMap.coveragePercentage
        },
        multiTenant: {
          tenantsActive: metrics.multiTenant.tenantsActive,
          resolutionEfficiency: metrics.multiTenant.resolutionEfficiency,
          middlewarePerformance: metrics.multiTenant.middlewarePerformance,
          rlsPoliciesApplied: metrics.multiTenant.rlsPoliciesApplied
        },
        advancedDb: {
          softDeleteImplemented: metrics.advancedDb.softDeleteImplemented,
          auditTrailEntries: metrics.advancedDb.auditTrailEntries,
          versionedRecords: metrics.advancedDb.versionedRecords,
          hierarchyNodes: metrics.advancedDb.hierarchyNodes
        },
        realtime: {
          chatMessages: metrics.realtime.chatMessages,
          presenceUpdates: metrics.realtime.presenceUpdates,
          notificationsSent: metrics.realtime.notificationsSent,
          connectionsActive: metrics.realtime.connectionsActive
        },
        storage: {
          policiesCreated: metrics.storage.policiesCreated,
          mediaFilesStored: metrics.storage.mediaFilesStored,
          thumbnailsGenerated: metrics.storage.thumbnailsGenerated,
          storageUsed: metrics.storage.storageUsed
        },
        api: {
          keysGenerated: metrics.api.keysGenerated,
          webhooksProcessed: metrics.api.webhooksProcessed,
          replayPrevented: metrics.api.replayPrevented,
          apiCalls: metrics.api.apiCalls
        },
        billing: {
          plansActive: metrics.billing.plansActive,
          gatingRules: metrics.billing.gatingRules,
          webhookEvents: metrics.billing.webhookEvents,
          revenueProcessed: metrics.billing.revenueProcessed
        },
        compliance: {
          dataExports: metrics.compliance.dataExports,
          dataDeletions: metrics.compliance.dataDeletions,
          impersonationSessions: metrics.compliance.impersonationSessions,
          complianceScore: metrics.compliance.complianceScore
        },
        cli: {
          localProjects: metrics.cli.localProjects,
          structureValidated: metrics.cli.structureValidated,
          toolsUsed: metrics.cli.toolsUsed,
          commandsExecuted: metrics.cli.commandsExecuted
        },
        recommendations: [
          {
            priority: 'high',
            description: 'Enhance multi-tenant data isolation'
          },
          {
            priority: 'medium',
            description: 'Optimize realtime connection management'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SaasFeaturesConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SaasFeaturesConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    capabilityMap: boolean;
    multiTenant: boolean;
    advancedDb: boolean;
    realtime: boolean;
    storage: boolean;
    api: boolean;
    billing: boolean;
    compliance: boolean;
    cli: boolean;
  }> {
    try {
      const capabilityMap = this.config.capabilityMap.enabled ? await capabilityMap.getHealthStatus() : true;
      const multiTenant = this.config.multiTenant.enabled ? await multiTenant.getHealthStatus() : true;
      const advancedDb = this.config.advancedDb.enabled ? await advancedDbPatterns.getHealthStatus() : true;
      const realtime = this.config.realtime.enabled ? await realtimeFeatures.getHealthStatus() : true;
      const storage = this.config.storage.enabled ? await storageMedia.getHealthStatus() : true;
      const api = this.config.api.enabled ? await apiIntegrations.getHealthStatus() : true;
      const billing = this.config.billing.enabled ? await billing.getHealthStatus() : true;
      const compliance = this.config.compliance.enabled ? await complianceOps.getHealthStatus() : true;
      const cli = this.config.cli.enabled ? await cliLocal.getHealthStatus() : true;

      return {
        overall: this.initialized && capabilityMap && multiTenant && advancedDb && realtime && storage && api && billing && compliance && cli,
        capabilityMap,
        multiTenant,
        advancedDb,
        realtime,
        storage,
        api,
        billing,
        compliance,
        cli
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        capabilityMap: false,
        multiTenant: false,
        advancedDb: false,
        realtime: false,
        storage: false,
        api: false,
        billing: false,
        compliance: false,
        cli: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await capabilityMap.cleanup();
    await multiTenant.cleanup();
    await advancedDbPatterns.cleanup();
    await realtimeFeatures.cleanup();
    await storageMedia.cleanup();
    await apiIntegrations.cleanup();
    await billing.cleanup();
    await complianceOps.cleanup();
    await cliLocal.cleanup();
  }
}

// Export default instance
export const supabaseSaasFeaturesPack = new SupabaseSaasFeaturesPack();

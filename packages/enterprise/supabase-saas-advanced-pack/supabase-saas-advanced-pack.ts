/**
 * Main Supabase SaaS Advanced Pack Class
 * 
 * Advanced SaaS features for Supabase including multi-tenancy,
 * subscription management, billing integration, and enterprise features.
 */

import { SaasAdvancedConfig, SaasAdvancedMetrics, Tenant, SubscriptionPlan, BillingIntegration } from './types.js';
import { multiTenancy } from './multi-tenancy.js';
import { subscriptionManagement } from './subscription-management.js';
import { billingIntegration } from './billing-integration.js';
import { enterpriseFeatures } from './enterprise-features.js';

export class SupabaseSaasAdvancedPack {
  private config: SaasAdvancedConfig;
  private initialized = false;

  constructor(config: Partial<SaasAdvancedConfig> = {}) {
    this.config = {
      multiTenancy: {
        enabled: true,
        dataIsolation: true,
        tenantRouting: true,
        resourceSharing: true,
        tenantManagement: true,
        ...config.multiTenancy
      },
      subscription: {
        enabled: true,
        plans: true,
        trials: true,
        upgrades: true,
        cancellations: true,
        ...config.subscription
      },
      billing: {
        enabled: true,
        integration: true,
        invoices: true,
        payments: true,
        reporting: true,
        ...config.billing
      },
      enterprise: {
        enabled: true,
        sso: true,
        audit: true,
        compliance: true,
        support: true,
        ...config.enterprise
      }
    };
  }

  /**
   * Initialize the Supabase SaaS advanced pack
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all SaaS advanced components
      await multiTenancy.initialize(this.config.multiTenancy);
      await subscriptionManagement.initialize(this.config.subscription);
      await billingIntegration.initialize(this.config.billing);
      await enterpriseFeatures.initialize(this.config.enterprise);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase SaaS advanced pack:', error);
      throw error;
    }
  }

  /**
   * Setup multi-tenancy
   */
  async setupMultiTenancy(): Promise<void> {
    if (!this.config.multiTenancy.enabled) {
      throw new Error('Multi-tenancy not enabled');
    }

    try {
      await multiTenancy.setupDataIsolation();
      await multiTenancy.setupTenantRouting();
      await multiTenancy.setupResourceSharing();
      await multiTenancy.setupTenantManagement();
    } catch (error) {
      console.error('Failed to setup multi-tenancy:', error);
      throw error;
    }
  }

  /**
   * Setup subscription management
   */
  async setupSubscriptionManagement(): Promise<void> {
    if (!this.config.subscription.enabled) {
      throw new Error('Subscription management not enabled');
    }

    try {
      await subscriptionManagement.setupPlans();
      await subscriptionManagement.setupTrials();
      await subscriptionManagement.setupUpgrades();
      await subscriptionManagement.setupCancellations();
    } catch (error) {
      console.error('Failed to setup subscription management:', error);
      throw error;
    }
  }

  /**
   * Setup billing integration
   */
  async setupBillingIntegration(): Promise<void> {
    if (!this.config.billing.enabled) {
      throw new Error('Billing integration not enabled');
    }

    try {
      await billingIntegration.setupIntegration();
      await billingIntegration.setupInvoices();
      await billingIntegration.setupPayments();
      await billingIntegration.setupReporting();
    } catch (error) {
      console.error('Failed to setup billing integration:', error);
      throw error;
    }
  }

  /**
   * Setup enterprise features
   */
  async setupEnterpriseFeatures(): Promise<void> {
    if (!this.config.enterprise.enabled) {
      throw new Error('Enterprise features not enabled');
    }

    try {
      await enterpriseFeatures.setupSSO();
      await enterpriseFeatures.setupAudit();
      await enterpriseFeatures.setupCompliance();
      await enterpriseFeatures.setupSupport();
    } catch (error) {
      console.error('Failed to setup enterprise features:', error);
      throw error;
    }
  }

  /**
   * Get tenants
   */
  async getTenants(): Promise<Tenant[]> {
    try {
      return await multiTenancy.getTenants();
    } catch (error) {
      console.error('Failed to get tenants:', error);
      throw error;
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await subscriptionManagement.getPlans();
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get billing integration
   */
  async getBillingIntegration(): Promise<BillingIntegration> {
    try {
      return await billingIntegration.getIntegration();
    } catch (error) {
      console.error('Failed to get billing integration:', error);
      throw error;
    }
  }

  /**
   * Create tenant
   */
  async createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      return await multiTenancy.createTenant(tenant);
    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw error;
    }
  }

  /**
   * Get SaaS advanced metrics
   */
  async getMetrics(): Promise<SaasAdvancedMetrics> {
    try {
      const multiTenancyMetrics = await multiTenancy.getMetrics();
      const subscriptionMetrics = await subscriptionManagement.getMetrics();
      const billingMetrics = await billingIntegration.getMetrics();
      const enterpriseMetrics = await enterpriseFeatures.getMetrics();

      return {
        multiTenancy: multiTenancyMetrics,
        subscription: subscriptionMetrics,
        billing: billingMetrics,
        enterprise: enterpriseMetrics,
        overall: {
          tenantGrowth: Math.floor((multiTenancyMetrics.activeTenants + subscriptionMetrics.activeSubscriptions) / 2),
          revenueGrowth: Math.floor((billingMetrics.revenueRecognition + billingMetrics.collectionRate) / 2),
          churnRate: Math.floor(subscriptionMetrics.cancellationRate * 0.8),
          enterpriseAdoption: Math.floor((enterpriseMetrics.ssoLogins + enterpriseMetrics.enterpriseRevenue) / 2)
        }
      };
    } catch (error) {
      console.error('Failed to get SaaS advanced metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(): Promise<{
    summary: any;
    multiTenancy: any;
    subscription: any;
    billing: any;
    enterprise: any;
    recommendations: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          tenantGrowth: metrics.overall.tenantGrowth,
          revenueGrowth: metrics.overall.revenueGrowth,
          churnRate: metrics.overall.churnRate,
          enterpriseAdoption: metrics.overall.enterpriseAdoption
        },
        multiTenancy: {
          activeTenants: metrics.multiTenancy.activeTenants,
          dataIsolationScore: metrics.multiTenancy.dataIsolationScore,
          routingEfficiency: metrics.multiTenancy.routingEfficiency,
          resourceUtilization: metrics.multiTenancy.resourceUtilization
        },
        subscription: {
          activeSubscriptions: metrics.subscription.activeSubscriptions,
          trialConversions: metrics.subscription.trialConversions,
          upgradeRate: metrics.subscription.upgradeRate,
          revenuePerUser: metrics.subscription.revenuePerUser
        },
        billing: {
          invoicesGenerated: metrics.billing.invoicesGenerated,
          paymentsProcessed: metrics.billing.paymentsProcessed,
          billingAccuracy: metrics.billing.billingAccuracy,
          revenueRecognition: metrics.billing.revenueRecognition
        },
        enterprise: {
          ssoLogins: metrics.enterprise.ssoLogins,
          auditEvents: metrics.enterprise.auditEvents,
          complianceScore: metrics.enterprise.complianceScore,
          enterpriseRevenue: metrics.enterprise.enterpriseRevenue
        },
        recommendations: [
          {
            priority: 'high',
            description: 'Optimize tenant resource allocation'
          },
          {
            priority: 'medium',
            description: 'Improve trial conversion rates'
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
  getConfig(): SaasAdvancedConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SaasAdvancedConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    multiTenancy: boolean;
    subscription: boolean;
    billing: boolean;
    enterprise: boolean;
  }> {
    try {
      const multiTenancy = this.config.multiTenancy.enabled ? await multiTenancy.getHealthStatus() : true;
      const subscription = this.config.subscription.enabled ? await subscriptionManagement.getHealthStatus() : true;
      const billing = this.config.billing.enabled ? await billingIntegration.getHealthStatus() : true;
      const enterprise = this.config.enterprise.enabled ? await enterpriseFeatures.getHealthStatus() : true;

      return {
        overall: this.initialized && multiTenancy && subscription && billing && enterprise,
        multiTenancy,
        subscription,
        billing,
        enterprise
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        multiTenancy: false,
        subscription: false,
        billing: false,
        enterprise: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await multiTenancy.cleanup();
    await subscriptionManagement.cleanup();
    await billingIntegration.cleanup();
    await enterpriseFeatures.cleanup();
  }
}

// Export default instance
export const supabaseSaasAdvancedPack = new SupabaseSaasAdvancedPack();

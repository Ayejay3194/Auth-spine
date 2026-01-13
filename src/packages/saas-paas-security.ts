/**
 * Main SaaS/PaaS Security Class
 * 
 * Comprehensive security controls for multi-tenant, subscription-based,
 * and internet-facing platforms with enterprise-grade protection.
 */

import { 
  SecurityConfig,
  SecurityMetrics,
  SecurityIncident,
  ComplianceReport,
  Tenant,
  Subscription
} from './types.js';
import { multiTenantSecurity } from './multi-tenant-security.js';
import { subscriptionSecurity } from './subscription-security.js';
import { accessControls } from './access-controls.js';
import { dataProtection } from './data-protection.js';
import { complianceFramework } from './compliance-framework.js';
import { securityMonitoring } from './security-monitoring.js';
import { controlsCatalog } from './controls-catalog.js';

export class SaasPaasSecurity {
  private config: SecurityConfig;
  private tenants: Map<string, Tenant> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private initialized = false;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      multiTenant: {
        enableTenantIsolation: true,
        enableTenantSpecificSSL: true,
        enableTenantSpecificDomains: true,
        enableTenantSpecificStorage: true,
        enableTenantSpecificDatabases: true,
        enableTenantLevelMonitoring: true,
        enableTenantLevelCompliance: true
      },
      subscription: {
        enableSubscriptionBasedAccess: true,
        enableFeatureLevelControls: true,
        enableUsageBasedLimiting: true,
        enableSubscriptionSecurity: true,
        enableBillingSecurity: true,
        enableLicenseManagement: true
      },
      accessControls: {
        enableRBAC: true,
        enableABAC: true,
        enableTenantLevelRoles: true,
        enableCrossTenantAccessControl: true,
        enablePrivilegedAccessManagement: true,
        enableJustInTimeAccess: true
      },
      dataProtection: {
        enableEncryptionAtRest: true,
        enableEncryptionInTransit: true,
        enableTenantSpecificEncryption: true,
        enableDataClassification: true,
        enableDataLossPrevention: true,
        enableDataRetentionPolicies: true
      },
      compliance: {
        enableSOC2: true,
        enableISO27001: true,
        enableGDPR: true,
        enableHIPAA: false,
        enablePCI: false,
        enableCustomFrameworks: true
      },
      monitoring: {
        enableRealTimeMonitoring: true,
        enableTenantLevelMetrics: true,
        enableSecurityEventCorrelation: true,
        enableAutomatedThreatDetection: true,
        enableComplianceMonitoring: true,
        enablePerformanceMonitoring: true
      },
      ...config
    };
  }

  /**
   * Initialize the SaaS/PaaS security system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await multiTenantSecurity.initialize(this.config.multiTenant);
      await subscriptionSecurity.initialize(this.config.subscription);
      await accessControls.initialize(this.config.accessControls);
      await dataProtection.initialize(this.config.dataProtection);
      await complianceFramework.initialize(this.config.compliance);
      await securityMonitoring.initialize(this.config.monitoring);
      await controlsCatalog.initialize();

      this.loadDefaultTenants();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SaaS/PaaS Security:', error);
      throw error;
    }
  }

  /**
   * Create new tenant
   */
  async createTenant(tenant: {
    name: string;
    domain?: string;
    subscriptionTier: 'basic' | 'professional' | 'enterprise' | 'custom';
    securityLevel: 'standard' | 'enhanced' | 'maximum';
    settings: {
      enableMFA: boolean;
      enableSSO: boolean;
      enableCustomBranding: boolean;
      enableAPIAccess: boolean;
      dataResidency: string;
      complianceRequirements: Array<'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom'>;
    };
  }): Promise<Tenant> {
    const tenantId = this.generateTenantId();
    const isolation = await multiTenantSecurity.createTenantIsolation(tenantId, tenant.securityLevel);
    
    const newTenant: Tenant = {
      id: tenantId,
      name: tenant.name,
      domain: tenant.domain,
      status: 'trial',
      subscriptionTier: tenant.subscriptionTier,
      securityLevel: tenant.securityLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: tenant.settings,
      limits: this.getTenantLimits(tenant.subscriptionTier),
      usage: {
        users: 0,
        storage: 0,
        apiCalls: 0,
        bandwidth: 0,
        lastUpdated: new Date()
      },
      isolation
    };

    this.tenants.set(tenantId, newTenant);
    
    // Create subscription
    await this.createSubscription({
      tenantId,
      tier: tenant.subscriptionTier,
      billingCycle: 'monthly',
      features: this.getTierFeatures(tenant.subscriptionTier),
      security: {
        enableMFA: tenant.settings.enableMFA,
        enableSSO: tenant.settings.enableSSO,
        enableAuditLogs: true,
        enableEncryption: true,
        enableBackup: true
      }
    });

    return newTenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Create subscription
   */
  async createSubscription(subscription: {
    tenantId: string;
    tier: 'basic' | 'professional' | 'enterprise' | 'custom';
    billingCycle: 'monthly' | 'annual';
    features: string[];
    security: {
      enableMFA: boolean;
      enableSSO: boolean;
      enableAuditLogs: boolean;
      enableEncryption: boolean;
      enableBackup: boolean;
    };
  }): Promise<Subscription> {
    const subscriptionId = this.generateSubscriptionId();
    const limits = this.getTenantLimits(subscription.tier);
    
    const newSubscription: Subscription = {
      id: subscriptionId,
      tenantId: subscription.tenantId,
      tier: subscription.tier,
      status: 'active',
      billingCycle: subscription.billingCycle,
      price: this.getTierPrice(subscription.tier, subscription.billingCycle),
      currency: 'USD',
      features: subscription.features,
      limits,
      usage: {
        currentUsers: 0,
        currentStorage: 0,
        currentApiCalls: 0,
        currentBandwidth: 0,
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      security: subscription.security,
      createdAt: new Date(),
      updatedAt: new Date(),
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    this.subscriptions.set(subscriptionId, newSubscription);
    return newSubscription;
  }

  /**
   * Check tenant access permissions
   */
  async checkTenantAccess(tenantId: string, resource: string, action: string, context?: any): Promise<{
    allowed: boolean;
    reason?: string;
    subscriptionValid: boolean;
    withinLimits: boolean;
  }> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return {
        allowed: false,
        reason: 'Tenant not found',
        subscriptionValid: false,
        withinLimits: false
      };
    }

    // Check tenant status
    if (tenant.status !== 'active') {
      return {
        allowed: false,
        reason: `Tenant is ${tenant.status}`,
        subscriptionValid: false,
        withinLimits: true
      };
    }

    // Check subscription
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.tenantId === tenantId && sub.status === 'active');
    
    if (!subscription) {
      return {
        allowed: false,
        reason: 'No active subscription',
        subscriptionValid: false,
        withinLimits: true
      };
    }

    // Check feature access
    const hasFeature = subscription.features.includes(resource);
    if (!hasFeature) {
      return {
        allowed: false,
        reason: 'Feature not included in subscription',
        subscriptionValid: true,
        withinLimits: true
      };
    }

    // Check usage limits
    const withinLimits = await this.checkUsageLimits(tenantId, resource);
    if (!withinLimits) {
      return {
        allowed: false,
        reason: 'Usage limits exceeded',
        subscriptionValid: true,
        withinLimits: false
      };
    }

    // Check access controls
    const accessResult = await accessControls.checkAccess(tenantId, resource, action, context);
    
    return {
      allowed: accessResult.allowed,
      reason: accessResult.reason,
      subscriptionValid: true,
      withinLimits: true
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom', period: {
    start: Date;
    end: Date;
  }): Promise<ComplianceReport> {
    return await complianceFramework.generateReport(framework, period);
  }

  /**
   * Create security incident
   */
  async createSecurityIncident(incident: {
    tenantId?: string;
    type: 'data_breach' | 'security_violation' | 'service_outage' | 'compliance_breach' | 'threat_detected';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    affectedAssets: string[];
    affectedUsers?: number;
  }): Promise<SecurityIncident> {
    return await securityMonitoring.createIncident(incident);
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const tenantMetrics = this.getTenantMetrics();
    const subscriptionMetrics = this.getSubscriptionMetrics();
    const accessMetrics = await accessControls.getMetrics();
    const dataMetrics = await dataProtection.getMetrics();
    const complianceMetrics = await complianceFramework.getMetrics();
    const monitoringMetrics = await securityMonitoring.getMetrics();

    return {
      tenants: tenantMetrics,
      subscriptions: subscriptionMetrics,
      access: accessMetrics,
      data: dataMetrics,
      compliance: complianceMetrics,
      monitoring: monitoringMetrics
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      multiTenantSecurity: boolean;
      subscriptionSecurity: boolean;
      accessControls: boolean;
      dataProtection: boolean;
      complianceFramework: boolean;
      securityMonitoring: boolean;
      controlsCatalog: boolean;
    };
    overall: boolean;
    securityScore: number;
  }> {
    const components = {
      multiTenantSecurity: await multiTenantSecurity.getHealthStatus(),
      subscriptionSecurity: await subscriptionSecurity.getHealthStatus(),
      accessControls: await accessControls.getHealthStatus(),
      dataProtection: await dataProtection.getHealthStatus(),
      complianceFramework: await complianceFramework.getHealthStatus(),
      securityMonitoring: await securityMonitoring.getHealthStatus(),
      controlsCatalog: await controlsCatalog.getHealthStatus()
    };

    const overall = this.initialized && Object.values(components).every(status => status);
    const securityScore = this.calculateSecurityScore();

    return {
      initialized: this.initialized,
      components,
      overall,
      securityScore
    };
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }

  private async checkUsageLimits(tenantId: string, resource: string): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.tenantId === tenantId && sub.status === 'active');
    
    if (!subscription) return false;

    switch (resource) {
      case 'users':
        return tenant.usage.users < subscription.limits.users;
      case 'storage':
        return tenant.usage.storage < subscription.limits.storage;
      case 'api_calls':
        return tenant.usage.apiCalls < subscription.limits.apiCalls;
      case 'bandwidth':
        return tenant.usage.bandwidth < subscription.limits.bandwidth;
      default:
        return subscription.features.includes(resource);
    }
  }

  private getTenantLimits(tier: 'basic' | 'professional' | 'enterprise' | 'custom') {
    const limits = {
      basic: { users: 10, storage: 10737418240, apiCalls: 10000, bandwidth: 107374182400 },
      professional: { users: 100, storage: 107374182400, apiCalls: 100000, bandwidth: 1073741824000 },
      enterprise: { users: 1000, storage: 1073741824000, apiCalls: 1000000, bandwidth: 10737418240000 },
      custom: { users: 10000, storage: 10737418240000, apiCalls: 10000000, bandwidth: 107374182400000 }
    };
    return limits[tier];
  }

  private getTierFeatures(tier: 'basic' | 'professional' | 'enterprise' | 'custom'): string[] {
    const features = {
      basic: ['basic_analytics', 'email_support', 'api_access'],
      professional: ['advanced_analytics', 'priority_support', 'sso', 'custom_domains'],
      enterprise: ['premium_analytics', 'dedicated_support', 'advanced_sso', 'white_label', 'custom_integrations'],
      custom: ['all_features', 'custom_development', 'dedicated_infrastructure', 'custom_compliance']
    };
    return features[tier];
  }

  private getTierPrice(tier: 'basic' | 'professional' | 'enterprise' | 'custom', cycle: 'monthly' | 'annual'): number {
    const basePrices = {
      basic: 99,
      professional: 499,
      enterprise: 1999,
      custom: 9999
    };
    const multiplier = cycle === 'annual' ? 0.8 : 1;
    return Math.round(basePrices[tier] * multiplier);
  }

  private getTenantMetrics(): SecurityMetrics['tenants'] {
    const tenants = Array.from(this.tenants.values());
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      trial: tenants.filter(t => t.status === 'trial').length,
      suspended: tenants.filter(t => t.status === 'suspended').length,
      expired: tenants.filter(t => t.status === 'expired').length
    };
  }

  private getSubscriptionMetrics(): SecurityMetrics['subscriptions'] {
    const subscriptions = Array.from(this.subscriptions.values());
    const byTier = {
      basic: subscriptions.filter(s => s.tier === 'basic').length,
      professional: subscriptions.filter(s => s.tier === 'professional').length,
      enterprise: subscriptions.filter(s => s.tier === 'enterprise').length,
      custom: subscriptions.filter(s => s.tier === 'custom').length
    };
    
    const revenue = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    return {
      total: subscriptions.length,
      byTier,
      revenue,
      churnRate: 0.05 // Simulated
    };
  }

  private calculateSecurityScore(): number {
    let score = 100;

    // Deduct points for missing security features
    if (!this.config.multiTenant.enableTenantIsolation) score -= 20;
    if (!this.config.accessControls.enableRBAC) score -= 15;
    if (!this.config.dataProtection.enableEncryptionAtRest) score -= 15;
    if (!this.config.compliance.enableSOC2) score -= 10;
    if (!this.config.monitoring.enableRealTimeMonitoring) score -= 10;
    if (!this.config.subscription.enableSubscriptionSecurity) score -= 10;

    return Math.max(0, score);
  }

  private loadDefaultTenants(): void {
    // Load default tenants for demonstration
    const defaultTenants = [
      {
        id: 'tenant_demo_1',
        name: 'Demo Company',
        domain: 'demo.example.com',
        status: 'active' as const,
        subscriptionTier: 'professional' as const,
        securityLevel: 'enhanced' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          enableMFA: true,
          enableSSO: true,
          enableCustomBranding: true,
          enableAPIAccess: true,
          dataResidency: 'us-east-1',
          complianceRequirements: ['SOC2', 'GDPR']
        },
        limits: this.getTenantLimits('professional'),
        usage: {
          users: 25,
          storage: 5368709120,
          apiCalls: 25000,
          bandwidth: 268435456000,
          lastUpdated: new Date()
        },
        isolation: {
          databaseSchema: 'tenant_demo_1',
          storageBucket: 'tenant-demo-1-storage',
          encryptionKey: 'key_demo_1',
          networkSegment: 'segment_demo_1'
        }
      }
    ];

    defaultTenants.forEach(tenant => {
      this.tenants.set(tenant.id, tenant);
    });
  }

  private generateTenantId(): string {
    return 'tenant_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  private generateSubscriptionId(): string {
    return 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }
}

// Export default instance
export const saasPaasSecurity = new SaasPaasSecurity();

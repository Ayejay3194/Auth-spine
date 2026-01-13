/**
 * Main Supabase SaaS Advanced Class
 * 
 * A starter enforcement layer for building multi-tenant SaaS applications
 * with proper tenant isolation, security, and management features.
 */

import { 
  SupabaseSaaSConfig,
  TenantContext,
  SaaSMetrics,
  RateLimitResult,
  TenantIsolationResult
} from './types.js';
import { tenantIsolation } from './tenant-isolation.js';
import { rlsPolicies } from './rls-policies.js';
import { auditLogging } from './audit-logging.js';
import { quotaManagement } from './quota-management.js';
import { apiKeys } from './api-keys.js';
import { edgeFunctions } from './edge-functions.js';
import { securityHeaders } from './security-headers.js';

export class SupabaseSaaSAdvanced {
  private config: SupabaseSaaSConfig;
  private initialized = false;

  constructor(config: Partial<SupabaseSaaSConfig> = {}) {
    this.config = {
      enableTenantIsolation: true,
      enableRLSPolicies: true,
      enableAuditLogging: true,
      enableQuotaManagement: true,
      enableAPIKeys: true,
      enableEdgeFunctions: true,
      enableSecurityHeaders: true,
      tenantIdClaim: 'tenant_id',
      auditRetention: 2555,
      quotaEnforcement: 'strict',
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        burstLimit: 200,
        storage: 'memory'
      },
      security: {
        webhookSecret: true,
        hmacValidation: true,
        replayProtection: true,
        signedUploads: true,
        csrfProtection: true
      },
      testing: {
        enablePolicyTests: true,
        enableUnitTests: true,
        enableIntegrationTests: true,
        testDatabase: 'test_saas'
      },
      ...config
    };
  }

  /**
   * Initialize the Supabase SaaS advanced system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.config.enableTenantIsolation) {
        await tenantIsolation.initialize();
      }

      if (this.config.enableRLSPolicies) {
        await rlsPolicies.initialize();
      }

      if (this.config.enableAuditLogging) {
        await auditLogging.initialize();
      }

      if (this.config.enableQuotaManagement) {
        await quotaManagement.initialize();
      }

      if (this.config.enableAPIKeys) {
        await apiKeys.initialize();
      }

      if (this.config.enableEdgeFunctions) {
        await edgeFunctions.initialize();
      }

      if (this.config.enableSecurityHeaders) {
        await securityHeaders.initialize();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase SaaS Advanced:', error);
      throw error;
    }
  }

  /**
   * Get tenant context from request
   */
  async getTenantContext(request: {
    jwt?: string;
    headers?: Record<string, string>;
  }): Promise<TenantIsolationResult | null> {
    if (!this.config.enableTenantIsolation) {
      return null;
    }

    return await tenantIsolation.getContext(request);
  }

  /**
   * Create new tenant
   */
  async createTenant(tenant: Omit<TenantContext, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantContext> {
    return await tenantIsolation.createTenant(tenant);
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<TenantContext | null> {
    return await tenantIsolation.getTenant(tenantId);
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, updates: Partial<TenantContext>): Promise<TenantContext> {
    return await tenantIsolation.updateTenant(tenantId, updates);
  }

  /**
   * Enforce rate limiting
   */
  async enforceRateLimit(tenantId: string, identifier: string): Promise<RateLimitResult> {
    if (!this.config.rateLimiting.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000),
        limit: this.config.rateLimiting.requestsPerMinute,
        windowMs: 60000
      };
    }

    return await tenantIsolation.enforceRateLimit(tenantId, identifier, {
      requestsPerMinute: this.config.rateLimiting.requestsPerMinute,
      burstLimit: this.config.rateLimiting.burstLimit,
      storage: this.config.rateLimiting.storage
    });
  }

  /**
   * Check quota limits
   */
  async checkQuota(tenantId: string, type: string, amount: number = 1): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
    resetAt: Date;
  }> {
    if (!this.config.enableQuotaManagement) {
      return {
        allowed: true,
        current: 0,
        limit: Infinity,
        remaining: Infinity,
        resetAt: new Date(Date.now() + 86400000)
      };
    }

    return await quotaManagement.checkQuota(tenantId, type, amount, this.config.quotaEnforcement);
  }

  /**
   * Log audit event
   */
  async logAudit(event: {
    tenantId: string;
    userId?: string;
    action: string;
    table?: string;
    recordId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    if (!this.config.enableAuditLogging) {
      return;
    }

    await auditLogging.log(event);
  }

  /**
   * Query audit logs
   */
  async queryAuditLogs(query: {
    tenantId?: string;
    userId?: string;
    action?: string;
    table?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return await auditLogging.query(query);
  }

  /**
   * Create API key
   */
  async createAPIKey(tenantId: string, keyData: {
    name: string;
    scopes: string[];
    permissions?: string[];
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }): Promise<any> {
    if (!this.config.enableAPIKeys) {
      throw new Error('API keys are disabled');
    }

    return await apiKeys.createKey(tenantId, keyData);
  }

  /**
   * Validate API key
   */
  async validateAPIKey(keyHash: string, requiredScopes?: string[]): Promise<{
    valid: boolean;
    tenantId?: string;
    scopes: string[];
    expiresAt?: Date;
  }> {
    if (!this.config.enableAPIKeys) {
      return { valid: false, scopes: [] };
    }

    return await apiKeys.validateKey(keyHash, requiredScopes);
  }

  /**
   * Deploy edge function
   */
  async deployEdgeFunction(functionData: {
    name: string;
    description: string;
    runtime: 'deno' | 'nodejs';
    entryPoint: string;
    environment?: Record<string, string>;
    secrets?: string[];
    tenantIsolated?: boolean;
    rateLimit?: {
      requestsPerMinute: number;
      burstLimit: number;
    };
  }): Promise<any> {
    if (!this.config.enableEdgeFunctions) {
      throw new Error('Edge functions are disabled');
    }

    return await edgeFunctions.deploy(functionData);
  }

  /**
   * Get security headers
   */
  getSecurityHeaders(): Record<string, string> {
    if (!this.config.enableSecurityHeaders) {
      return {};
    }

    return securityHeaders.getHeaders();
  }

  /**
   * Generate signed upload URL
   */
  async generateSignedUploadURL(tenantId: string, options: {
    bucket: string;
    key: string;
    expiresIn?: number;
    maxFileSize?: number;
    allowedTypes?: string[];
    conditions?: Array<{
      operation: string;
      value: string;
    }>;
  }): Promise<{
    url: string;
    fields: Record<string, string>;
    expiresAt: Date;
  }> {
    if (!this.config.security.signedUploads) {
      throw new Error('Signed uploads are disabled');
    }

    return await edgeFunctions.generateSignedUploadURL(tenantId, options);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!this.config.security.hmacValidation) {
      return true;
    }

    return edgeFunctions.verifyWebhookSignature(payload, signature, secret);
  }

  /**
   * Get SaaS metrics
   */
  async getMetrics(): Promise<SaaSMetrics> {
    const tenants = await tenantIsolation.getMetrics();
    const usage = await quotaManagement.getUsageMetrics();
    const quotas = await quotaManagement.getQuotaMetrics();
    const keys = await apiKeys.getMetrics();
    const audits = await auditLogging.getMetrics();

    return {
      tenants,
      usage,
      quotas,
      apiKeys: keys,
      auditLogs: audits
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SupabaseSaaSConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get configuration
   */
  getConfig(): SupabaseSaaSConfig {
    return { ...this.config };
  }

  /**
   * Health check
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      tenantIsolation: boolean;
      rlsPolicies: boolean;
      auditLogging: boolean;
      quotaManagement: boolean;
      apiKeys: boolean;
      edgeFunctions: boolean;
      securityHeaders: boolean;
    };
    overall: boolean;
  }> {
    const components = {
      tenantIsolation: this.config.enableTenantIsolation && this.initialized,
      rlsPolicies: this.config.enableRLSPolicies && this.initialized,
      auditLogging: this.config.enableAuditLogging && this.initialized,
      quotaManagement: this.config.enableQuotaManagement && this.initialized,
      apiKeys: this.config.enableAPIKeys && this.initialized,
      edgeFunctions: this.config.enableEdgeFunctions && this.initialized,
      securityHeaders: this.config.enableSecurityHeaders && this.initialized
    };

    const overall = this.initialized && Object.values(components).every(status => status);

    return {
      initialized: this.initialized,
      components,
      overall
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

// Export default instance
export const supabaseSaaSAdvanced = new SupabaseSaaSAdvanced();

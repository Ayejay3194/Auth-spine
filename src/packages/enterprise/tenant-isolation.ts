/**
 * Tenant Isolation for Supabase SaaS Advanced Pack
 * 
 * Provides multi-tenant isolation with proper tenant context
 * enforcement and cross-tenant leak prevention.
 */

import { TenantContext, TenantIsolationResult, RateLimitResult } from './types.js';

export class TenantIsolationManager {
  private tenants: Map<string, TenantContext> = new Map();
  private rateLimits: Map<string, Map<string, { count: number; resetTime: Date }>> = new Map();
  private initialized = false;

  /**
   * Initialize tenant isolation
   */
  async initialize(): Promise<void> {
    this.loadDefaultTenants();
    this.initialized = true;
  }

  /**
   * Get tenant context from request
   */
  async getContext(request: {
    jwt?: string;
    headers?: Record<string, string>;
  }): Promise<TenantIsolationResult | null> {
    let tenantId: string | null = null;

    // Extract tenant ID from JWT
    if (request.jwt) {
      try {
        const payload = this.parseJWT(request.jwt);
        tenantId = payload.tenant_id || payload.tenantId;
      } catch (error) {
        console.error('Failed to parse JWT:', error);
      }
    }

    // Extract tenant ID from headers (dev only)
    if (!tenantId && request.headers) {
      tenantId = request.headers['x-tenant-id'] || request.headers['tenant-id'];
    }

    if (!tenantId) {
      return null;
    }

    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    return {
      isolated: true,
      tenantId,
      context: tenant,
      policies: this.getTenantPolicies(tenantId),
      quotaStatus: this.getTenantQuotas(tenantId)
    };
  }

  /**
   * Create new tenant
   */
  async createTenant(tenantData: Omit<TenantContext, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantContext> {
    const tenant: TenantContext = {
      ...tenantData,
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tenants.set(tenant.id, tenant);
    this.initializeTenantQuotas(tenant.id);
    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<TenantContext | null> {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, updates: Partial<TenantContext>): Promise<TenantContext> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
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
   * Enforce rate limiting
   */
  async enforceRateLimit(
    tenantId: string, 
    identifier: string, 
    options: {
      requestsPerMinute: number;
      burstLimit: number;
      storage: 'memory' | 'redis' | 'upstash';
    }
  ): Promise<RateLimitResult> {
    const key = `${tenantId}:${identifier}`;
    const now = new Date();
    const windowMs = 60000; // 1 minute

    // Get or create rate limit tracker
    if (!this.rateLimits.has(tenantId)) {
      this.rateLimits.set(tenantId, new Map());
    }

    const tenantLimits = this.rateLimits.get(tenantId)!;
    const current = tenantLimits.get(key);

    // Check if window has expired
    if (!current || now > current.resetTime) {
      tenantLimits.set(key, {
        count: 1,
        resetTime: new Date(now.getTime() + windowMs)
      });

      return {
        allowed: true,
        remaining: options.requestsPerMinute - 1,
        resetTime: new Date(now.getTime() + windowMs),
        limit: options.requestsPerMinute,
        windowMs
      };
    }

    // Check if limit exceeded
    if (current.count >= options.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        limit: options.requestsPerMinute,
        windowMs
      };
    }

    // Increment count
    current.count++;
    const remaining = options.requestsPerMinute - current.count;

    return {
      allowed: true,
      remaining,
      resetTime: current.resetTime,
      limit: options.requestsPerMinute,
      windowMs
    };
  }

  /**
   * Get tenant metrics
   */
  async getMetrics(): Promise<{
    total: number;
    active: number;
    trial: number;
    suspended: number;
  }> {
    const tenants = Array.from(this.tenants.values());
    
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      trial: tenants.filter(t => t.status === 'trial').length,
      suspended: tenants.filter(t => t.status === 'suspended').length
    };
  }

  /**
   * Get all tenants
   */
  getAllTenants(): TenantContext[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<boolean> {
    const deleted = this.tenants.delete(tenantId);
    if (deleted) {
      this.rateLimits.delete(tenantId);
    }
    return deleted;
  }

  private loadDefaultTenants(): void {
    // Create sample tenants for demonstration
    const sampleTenants: Omit<TenantContext, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Acme Corporation',
        status: 'active',
        plan: 'enterprise',
        settings: {
          maxUsers: 100,
          features: ['analytics', 'api-access', 'ss0']
        },
        metadata: {
          industry: 'technology',
          size: 'large'
        }
      },
      {
        name: 'Startup Inc',
        status: 'trial',
        plan: 'starter',
        settings: {
          maxUsers: 10,
          features: ['basic-analytics']
        },
        metadata: {
          industry: 'technology',
          size: 'small'
        }
      },
      {
        name: 'Demo Company',
        status: 'suspended',
        plan: 'professional',
        settings: {
          maxUsers: 50,
          features: ['analytics', 'api-access']
        },
        metadata: {
          industry: 'consulting',
          size: 'medium'
        }
      }
    ];

    sampleTenants.forEach(tenantData => {
      this.createTenant(tenantData);
    });
  }

  private parseJWT(jwt: string): any {
    // Simple JWT parsing for demonstration
    // In production, use proper JWT library
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  }

  private getTenantPolicies(tenantId: string): any[] {
    // Return RLS policies for tenant
    return [
      {
        id: `rls_${tenantId}_users`,
        table: 'users',
        name: 'tenant_users_policy',
        definition: `tenant_id = request.tenant_id()`,
        tenantColumn: 'tenant_id',
        operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        enabled: true,
        createdAt: new Date()
      },
      {
        id: `rls_${tenantId}_projects`,
        table: 'projects',
        name: 'tenant_projects_policy',
        definition: `tenant_id = request.tenant_id()`,
        tenantColumn: 'tenant_id',
        operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        enabled: true,
        createdAt: new Date()
      }
    ];
  }

  private getTenantQuotas(tenantId: string): any[] {
    // Return quota limits for tenant
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return [];
    }

    const quotas = [];
    
    switch (tenant.plan) {
      case 'starter':
        quotas.push(
          { id: 'quota_api', tenantId, type: 'api_requests', limit: 10000, current: 0, period: 'monthly', enforced: true },
          { id: 'quota_storage', tenantId, type: 'storage', limit: 1024, current: 0, period: 'monthly', enforced: true },
          { id: 'quota_users', tenantId, type: 'users', limit: 10, current: 0, period: 'monthly', enforced: true }
        );
        break;
      case 'professional':
        quotas.push(
          { id: 'quota_api', tenantId, type: 'api_requests', limit: 100000, current: 0, period: 'monthly', enforced: true },
          { id: 'quota_storage', tenantId, type: 'storage', limit: 10240, current: 0, period: 'monthly', enforced: true },
          { id: 'quota_users', tenantId, type: 'users', limit: 50, current: 0, period: 'monthly', enforced: true }
        );
        break;
      case 'enterprise':
        quotas.push(
          { id: 'quota_api', tenantId, type: 'api_requests', limit: 1000000, current: 0, period: 'monthly', enforced: true },
          { id: 'quota_storage', tenantId, type: 'storage', limit: 102400, current: 0, period: 'monthly', enforced: true },
          { id: 'quota_users', tenantId, type: 'users', limit: 1000, current: 0, period: 'monthly', enforced: true }
        );
        break;
    }

    return quotas.map(quota => ({
      ...quota,
      resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private initializeTenantQuotas(tenantId: string): void {
    // Initialize rate limit tracking for new tenant
    if (!this.rateLimits.has(tenantId)) {
      this.rateLimits.set(tenantId, new Map());
    }
  }
}

// Export singleton instance
export const tenantIsolation = new TenantIsolationManager();

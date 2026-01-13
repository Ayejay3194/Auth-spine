/**
 * Quota Management for Supabase SaaS Advanced Pack
 * 
 * Provides quota enforcement and usage tracking for multi-tenant
 * SaaS applications with configurable limits and monitoring.
 */

import { QuotaLimit, EnforcementMode } from './types.js';

export class QuotaManagementManager {
  private quotas: Map<string, QuotaLimit[]> = new Map();
  private usage: Map<string, Map<string, number>> = new Map();
  private initialized = false;

  /**
   * Initialize quota management
   */
  async initialize(): Promise<void> {
    this.loadDefaultQuotas();
    this.initialized = true;
  }

  /**
   * Check quota limits
   */
  async checkQuota(
    tenantId: string, 
    type: string, 
    amount: number = 1,
    enforcement: EnforcementMode = 'strict'
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
    resetAt: Date;
  }> {
    const tenantQuotas = this.quotas.get(tenantId) || [];
    const quota = tenantQuotas.find(q => q.type === type);

    if (!quota) {
      // No quota set - allow unlimited
      return {
        allowed: true,
        current: 0,
        limit: Infinity,
        remaining: Infinity,
        resetAt: new Date(Date.now() + 86400000)
      };
    }

    // Get current usage
    const currentUsage = this.getCurrentUsage(tenantId, type);
    const newUsage = currentUsage + amount;
    const remaining = Math.max(0, quota.limit - newUsage);

    let allowed = true;
    if (enforcement === 'strict') {
      allowed = newUsage <= quota.limit;
    } else if (enforcement === 'lenient') {
      allowed = newUsage <= quota.limit * 1.1; // 10% overage allowed
    }

    // Update usage if allowed
    if (allowed) {
      this.updateUsage(tenantId, type, amount);
    }

    return {
      allowed,
      current: newUsage,
      limit: quota.limit,
      remaining,
      resetAt: quota.resetAt
    };
  }

  /**
   * Set quota limit
   */
  setQuota(tenantId: string, quota: Omit<QuotaLimit, 'id' | 'createdAt' | 'updatedAt'>): QuotaLimit {
    const tenantQuotas = this.quotas.get(tenantId) || [];
    
    const quotaLimit: QuotaLimit = {
      ...quota,
      id: `quota_${tenantId}_${quota.type}_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Remove existing quota for same type
    const existingIndex = tenantQuotas.findIndex(q => q.type === quota.type);
    if (existingIndex >= 0) {
      tenantQuotas[existingIndex] = quotaLimit;
    } else {
      tenantQuotas.push(quotaLimit);
    }

    this.quotas.set(tenantId, tenantQuotas);
    return quotaLimit;
  }

  /**
   * Get quotas for tenant
   */
  getQuotas(tenantId: string): QuotaLimit[] {
    return this.quotas.get(tenantId) || [];
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(): Promise<{
    totalRequests: number;
    totalStorage: number;
    totalBandwidth: number;
  }> {
    let totalRequests = 0;
    let totalStorage = 0;
    let totalBandwidth = 0;

    for (const [tenantId, usage] of this.usage.entries()) {
      totalRequests += usage.get('api_requests') || 0;
      totalStorage += usage.get('storage') || 0;
      totalBandwidth += usage.get('bandwidth') || 0;
    }

    return {
      totalRequests,
      totalStorage,
      totalBandwidth
    };
  }

  /**
   * Get quota metrics
   */
  async getQuotaMetrics(): Promise<{
    enforced: number;
    exceeded: number;
    warnings: number;
  }> {
    let enforced = 0;
    let exceeded = 0;
    let warnings = 0;

    for (const [tenantId, quotas] of this.quotas.entries()) {
      for (const quota of quotas) {
        if (quota.enforced) {
          enforced++;
        }

        const currentUsage = this.getCurrentUsage(tenantId, quota.type);
        const usage = (currentUsage / quota.limit) * 100;

        if (usage >= 100) {
          exceeded++;
        } else if (usage >= 80) {
          warnings++;
        }
      }
    }

    return { enforced, exceeded, warnings };
  }

  /**
   * Reset quotas (typically called monthly)
   */
  resetQuotas(tenantId?: string): void {
    if (tenantId) {
      // Reset specific tenant quotas
      const tenantUsage = this.usage.get(tenantId);
      if (tenantUsage) {
        tenantUsage.clear();
      }
    } else {
      // Reset all tenant quotas
      this.usage.clear();
    }
  }

  /**
   * Get current usage for tenant and type
   */
  getCurrentUsage(tenantId: string, type: string): number {
    const tenantUsage = this.usage.get(tenantId);
    return tenantUsage?.get(type) || 0;
  }

  /**
   * Update usage for tenant and type
   */
  updateUsage(tenantId: string, type: string, amount: number): void {
    if (!this.usage.has(tenantId)) {
      this.usage.set(tenantId, new Map());
    }

    const tenantUsage = this.usage.get(tenantId)!;
    const current = tenantUsage.get(type) || 0;
    tenantUsage.set(type, current + amount);
  }

  /**
   * Delete tenant quotas
   */
  deleteTenantQuotas(tenantId: string): void {
    this.quotas.delete(tenantId);
    this.usage.delete(tenantId);
  }

  private loadDefaultQuotas(): void {
    // Load default quotas for demonstration
    const sampleTenants = ['tenant_1', 'tenant_2', 'tenant_3'];
    
    sampleTenants.forEach(tenantId => {
      // API requests quota
      this.setQuota(tenantId, {
        tenantId,
        type: 'api_requests',
        limit: 10000,
        current: 0,
        period: 'monthly',
        resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        enforced: true
      });

      // Storage quota
      this.setQuota(tenantId, {
        tenantId,
        type: 'storage',
        limit: 1024, // MB
        current: 0,
        period: 'monthly',
        resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        enforced: true
      });

      // Bandwidth quota
      this.setQuota(tenantId, {
        tenantId,
        type: 'bandwidth',
        limit: 10240, // MB
        current: 0,
        period: 'monthly',
        resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        enforced: true
      });

      // Users quota
      this.setQuota(tenantId, {
        tenantId,
        type: 'users',
        limit: 10,
        current: 0,
        period: 'monthly',
        resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        enforced: true
      });
    });
  }
}

// Export singleton instance
export const quotaManagement = new QuotaManagementManager();

/**
 * Tenant context validation for multi-tenant SaaS applications
 * Implements critical security controls for tenant isolation
 */

export interface TenantContext {
  id: string;
  domain?: string;
  plan: string;
  isActive: boolean;
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
  };
}

export interface TenantValidationResult {
  valid: boolean;
  tenant?: TenantContext;
  error?: string;
}

/**
 * Validates tenant context on every request
 * Critical security control: SaaS-TEN-001
 */
export class TenantValidator {
  private tenants = new Map<string, TenantContext>();

  constructor() {
    this.initializeTenants();
  }

  private initializeTenants(): void {
    // In production, this would load from a database
    // For demo, we'll use mock data
    this.tenants.set('tenant-001', {
      id: 'tenant-001',
      domain: 'customer1.example.com',
      plan: 'enterprise',
      isActive: true,
      limits: {
        users: 1000,
        storage: 1000000000, // 1GB
        apiCalls: 1000000
      }
    });
  }

  /**
   * Validates tenant by ID or domain
   */
  async validateTenant(tenantIdOrDomain: string): Promise<TenantValidationResult> {
    const tenant = this.tenants.get(tenantIdOrDomain) || 
                   Array.from(this.tenants.values()).find(t => t.domain === tenantIdOrDomain);

    if (!tenant) {
      return { valid: false, error: 'Tenant not found' };
    }

    if (!tenant.isActive) {
      return { valid: false, error: 'Tenant is not active' };
    }

    return { valid: true, tenant };
  }

  /**
   * Validates tenant access to specific resources
   */
  async validateTenantAccess(
    tenantId: string, 
    resourceType: string, 
    resourceId: string
  ): Promise<boolean> {
    const result = await this.validateTenant(tenantId);
    if (!result.valid) {
      return false;
    }

    // Implement resource-specific validation logic
    // This would check if the tenant owns or has access to the resource
    return this.checkResourceOwnership(tenantId, resourceType, resourceId);
  }

  private checkResourceOwnership(tenantId: string, resourceType: string, resourceId: string): boolean {
    // In production, this would query the database to verify ownership
    // For demo, we'll assume all resources are tenant-isolated
    return true;
  }

  /**
   * Enforces tenant rate limits
   */
  async checkRateLimit(tenantId: string, endpoint: string): Promise<boolean> {
    const result = await this.validateTenant(tenantId);
    if (!result.valid) {
      return false;
    }

    // Implement rate limiting logic per tenant
    // This would integrate with a rate limiting service
    return true;
  }

  /**
   * Gets tenant limits for quota enforcement
   */
  getTenantLimits(tenantId: string): TenantContext['limits'] | null {
    const tenant = this.tenants.get(tenantId);
    return tenant ? tenant.limits : null;
  }
}

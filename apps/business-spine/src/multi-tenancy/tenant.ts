// Tenant management module

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  branding: {
    logo: string;
    colors: Record<string, string>;
    customDomain?: string;
    favicon?: string;
  };
  features: string[];
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: Date;
  };
  settings: {
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tenants = new Map<string, Tenant>();

export function getTenantFromRequest(request: any): string {
  const host = request.headers?.get?.('host') || '';
  const subdomain = host.split('.')[0];
  return subdomain;
}

export function registerTenant(tenant: Tenant): void {
  tenants.set(tenant.id, tenant);
}

export function getTenant(tenantId: string): Tenant | undefined {
  return tenants.get(tenantId);
}

export function getTenantByDomain(domain: string): Tenant | undefined {
  for (const tenant of tenants.values()) {
    if (tenant.domain === domain || tenant.subdomain === domain) {
      return tenant;
    }
  }
  return undefined;
}

export function getTenantBranding(tenantId: string) {
  const tenant = getTenant(tenantId);
  return tenant?.branding || {};
}

export function isTenantFeatureEnabled(tenantId: string, feature: string): boolean {
  const tenant = getTenant(tenantId);
  return tenant?.features.includes(feature) || false;
}

export function getTenantSettings(tenantId: string) {
  const tenant = getTenant(tenantId);
  return tenant?.settings || {
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  };
}

export function updateTenantSubscription(
  tenantId: string,
  subscription: Partial<Tenant['subscription']>
): void {
  const tenant = getTenant(tenantId);
  if (tenant) {
    tenant.subscription = { ...tenant.subscription, ...subscription };
  }
}

export function listTenants(): Tenant[] {
  return Array.from(tenants.values());
}

export function deleteTenant(tenantId: string): boolean {
  return tenants.delete(tenantId);
}

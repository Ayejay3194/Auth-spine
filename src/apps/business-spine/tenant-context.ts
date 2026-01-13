/**
 * Tenant context resolver (Next.js / Node)
 * - Derive tenant from host/custom domain mapping
 * - Validate membership
 * - Attach to request context
 */
export type Tenant = {
  id: string;
  slug: string;
  status: "ACTIVE"|"SUSPENDED"|"DELETED";
  plan: string;
  region: string;
};

export type TenantContext = {
  tenant: Tenant;
  userId?: string;
  role?: string;
  scopes?: string[];
};

export async function resolveTenantFromHost(host: string): Promise<{ slug: string } | null> {
  // Example: tenantA.app.com -> tenantA
  const parts = host.split(".");
  if (parts.length < 3) return null;
  return { slug: parts[0] };
}

export async function loadTenant(slug: string): Promise<Tenant | null> {
  // Query DB: tenants where slug=...
  return null;
}

export async function assertTenantActive(t: Tenant) {
  if (t.status !== "ACTIVE") throw new Error("TENANT_INACTIVE");
}

export function requireTenant(ctx: TenantContext | null): asserts ctx is TenantContext {
  if (!ctx?.tenant?.id) throw new Error("TENANT_REQUIRED");
}

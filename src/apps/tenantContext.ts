/**
 * Tenant context derivation: the app should set tenant_id claim in JWT if possible.
 * This helper is the "last mile" where you ensure every server call is tenant-scoped.
 */
export function requireTenantId(headers: Headers): string {
  const tid = headers.get("x-tenant-id");
  if (!tid) throw new Error("Missing x-tenant-id");
  return tid;
}

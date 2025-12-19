import type { TenantId } from "../ops/types.js";

/**
 * Use this as a single choke point so you can audit that EVERY query is tenant-scoped.
 * In real code, your ORM layer should enforce this automatically.
 */
export function scopeWhere<T extends Record<string, any>>(where: T, tenantId: TenantId): T & { tenantId: TenantId } {
  return { ...where, tenantId };
}

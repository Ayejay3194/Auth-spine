/**
 * Quota enforcement outline (API calls, exports, storage, seats).
 * Use DB counters + atomic increments to prevent race conditions.
 */
export async function enforceQuota(opts: {
  tenantId: string;
  metric: "api_calls"|"exports";
  amount: number;
}) {
  // 1) read tenant_quotas
  // 2) increment tenant_usage_daily atomically
  // 3) reject if over hard limit; allow if under
}

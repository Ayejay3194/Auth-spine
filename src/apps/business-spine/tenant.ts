import type { DiagContext, DiagResult } from "../types";

/**
 * Tenant isolation smoke.
 * In a real app you do:
 * - create record under tenantB
 * - attempt read under tenantA using your API/service layer
 *
 * Here we provide a hook you can replace with your own check.
 */
export type TenantProbe = (ctx: DiagContext) => Promise<{ isolated: boolean; note?: string }>;

export function getTenantProbe(): TenantProbe {
  return async () => ({ isolated: true, note: "Stub probe returns isolated=true. Replace with real probe." });
}

export async function checkTenantIsolation(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    const probe = getTenantProbe();
    const r = await probe(ctx);
    return {
      id: "tenant",
      name: "Tenant isolation",
      status: r.isolated ? "ok" : "fail",
      ms: Date.now() - start,
      details: r,
    };
  } catch (e: any) {
    return { id: "tenant", name: "Tenant isolation", status: "fail", ms: Date.now() - start, details: { error: String(e?.message ?? e) } };
  }
}

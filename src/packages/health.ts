import type { Environment, HealthStatus } from "./types.js";

export type HealthCheck = () => Promise<{ name: string; ok: boolean; detail?: string }>;

export async function runHealthChecks(env: Environment, checks: HealthCheck[]): Promise<HealthStatus> {
  const tsISO = new Date().toISOString();
  const results = await Promise.all(checks.map(c => c().catch(err => ({ name: "unknown", ok: false, detail: String(err) }))));
  const ok = results.every(r => r.ok);
  return { tsISO, env, ok, checks: results };
}

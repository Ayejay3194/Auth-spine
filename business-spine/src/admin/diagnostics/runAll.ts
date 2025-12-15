import type { DiagContext, DiagResult, RunResponse } from "./types";
import { summarize } from "./types";
import { checkDb } from "./adapters/db";
import { checkRedis } from "./adapters/redis";
import { checkQueue } from "./adapters/queue";
import { checkAudit } from "./adapters/audit";
import { checkTenantIsolation } from "./adapters/tenant";
import { checkWebhookReplay } from "./adapters/webhooks";

export async function runAll(ctx: DiagContext): Promise<RunResponse> {
  const runId = `run_${Math.random().toString(36).slice(2)}`;
  const at = new Date().toISOString();

  const checks: Array<Promise<DiagResult>> = [
    checkDb(ctx),
    checkRedis(ctx),
    checkQueue(ctx),
    checkAudit(ctx),
    checkTenantIsolation(ctx),
    checkWebhookReplay(ctx),
  ];

  const results = await Promise.all(checks);
  return { runId, at, results, summary: summarize(results) };
}

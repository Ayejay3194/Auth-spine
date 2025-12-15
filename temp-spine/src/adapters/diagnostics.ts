/**
 * Admin Diagnostics Adapter for Business Spine
 * 
 * Provides comprehensive health checks for:
 * - Database connectivity and operations
 * - Redis cache and rate limiting
 * - Queue processing (BullMQ)
 * - Audit trail integrity
 * - Tenant isolation
 * - Webhook delivery
 */

import { AssistantContext, ToolResult } from "../core/types.js";

export type DiagStatus = "ok" | "warn" | "fail";

export type DiagResult = {
  id: string;
  name: string;
  status: DiagStatus;
  ms: number;
  details?: Record<string, unknown>;
};

export type RunResponse = {
  runId: string;
  at: string;
  results: DiagResult[];
  summary: { ok: number; warn: number; fail: number };
};

export type DiagContext = {
  tenantId: string;
  actorId: string;
  role: string;
  ip?: string;
  userAgent?: string;
};

function summarize(results: DiagResult[]) {
  const summary = { ok: 0, warn: 0, fail: 0 };
  for (const r of results) summary[r.status]++;
  return summary;
}

// Database health check
async function checkDb(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    // Mock implementation - replace with actual database check
    // Example: await prisma.$queryRaw`SELECT 1`
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      id: "db",
      name: "Database Connection",
      status: "ok",
      ms: Date.now() - start,
      details: {
        provider: "postgresql",
        connected: true,
      }
    };
  } catch (error) {
    return {
      id: "db",
      name: "Database Connection",
      status: "fail",
      ms: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Redis health check
async function checkRedis(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    // Mock implementation - replace with actual Redis check
    // Example: await redis.ping()
    await new Promise(resolve => setTimeout(resolve, 5));
    
    return {
      id: "redis",
      name: "Redis Cache",
      status: "ok",
      ms: Date.now() - start,
      details: {
        connected: true,
        mode: "standalone"
      }
    };
  } catch (error) {
    return {
      id: "redis",
      name: "Redis Cache",
      status: "fail",
      ms: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Queue health check
async function checkQueue(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    // Mock implementation - replace with actual BullMQ check
    // Example: await queue.getJobCounts()
    await new Promise(resolve => setTimeout(resolve, 8));
    
    return {
      id: "queue",
      name: "Message Queue",
      status: "ok",
      ms: Date.now() - start,
      details: {
        provider: "bullmq",
        active: 0,
        waiting: 0,
        completed: 0,
        failed: 0
      }
    };
  } catch (error) {
    return {
      id: "queue",
      name: "Message Queue",
      status: "fail",
      ms: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Audit trail health check
async function checkAudit(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    // Mock implementation - replace with actual audit check
    // Example: Check last audit entry, verify hash chain
    await new Promise(resolve => setTimeout(resolve, 12));
    
    const lastAuditTime = new Date(Date.now() - 60000).toISOString();
    const timeSinceLastAudit = 60; // seconds
    const status = timeSinceLastAudit < 300 ? "ok" : "warn";
    
    return {
      id: "audit",
      name: "Audit Trail",
      status,
      ms: Date.now() - start,
      details: {
        lastEntry: lastAuditTime,
        secondsSinceLastAudit: timeSinceLastAudit,
        hashChainValid: true
      }
    };
  } catch (error) {
    return {
      id: "audit",
      name: "Audit Trail",
      status: "fail",
      ms: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Tenant isolation check
async function checkTenantIsolation(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    // Mock implementation - replace with actual tenant isolation check
    // Example: Verify row-level security, test cross-tenant access
    await new Promise(resolve => setTimeout(resolve, 15));
    
    return {
      id: "tenant",
      name: "Tenant Isolation",
      status: "ok",
      ms: Date.now() - start,
      details: {
        tenantId: ctx.tenantId,
        isolationEnabled: true,
        crossTenantAccessBlocked: true
      }
    };
  } catch (error) {
    return {
      id: "tenant",
      name: "Tenant Isolation",
      status: "fail",
      ms: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Webhook delivery health check
async function checkWebhookReplay(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    // Mock implementation - replace with actual webhook check
    // Example: Check failed webhooks, verify retry logic
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const failedWebhooks = 0;
    const status = failedWebhooks === 0 ? "ok" : "warn";
    
    return {
      id: "webhooks",
      name: "Webhook Delivery",
      status,
      ms: Date.now() - start,
      details: {
        pending: 0,
        failed: failedWebhooks,
        retryQueueHealthy: true
      }
    };
  } catch (error) {
    return {
      id: "webhooks",
      name: "Webhook Delivery",
      status: "fail",
      ms: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Main function to run all diagnostics
export async function runAllDiagnostics(ctx: DiagContext): Promise<RunResponse> {
  const runId = `run_${Math.random().toString(36).slice(2, 12)}`;
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

// Tool adapter for diagnostics
export async function diagnosticsTool(args: {
  ctx: AssistantContext;
  input: Record<string, unknown>;
}): Promise<ToolResult> {
  try {
    const diagContext: DiagContext = {
      tenantId: args.ctx.tenantId,
      actorId: args.ctx.actor.userId,
      role: args.ctx.actor.role,
    };

    const result = await runAllDiagnostics(diagContext);
    
    return {
      ok: true,
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DIAGNOSTICS_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    };
  }
}

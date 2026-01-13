import type { DiagContext, DiagResult } from "../types";

/**
 * Redis adapter via ioredis (optional).
 * If you use Upstash REST, swap implementation.
 */
export async function checkRedis(_ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  const url = process.env.REDIS_URL;
  if (!url) return { id: "redis", name: "Redis", status: "warn", ms: Date.now() - start, details: { message: "REDIS_URL not set" } };

  try {
    let pong = "";
    try {
      const { default: Redis } = await import("ioredis");
      const r = new (Redis as any)(url, { maxRetriesPerRequest: 1 });
      pong = await r.ping();
      await r.quit();
    } catch {
      // If ioredis isn't installed, just surface a warning
      return { id: "redis", name: "Redis", status: "warn", ms: Date.now() - start, details: { message: "Install ioredis to enable live Redis ping" } };
    }
    return { id: "redis", name: "Redis", status: pong === "PONG" ? "ok" : "warn", ms: Date.now() - start, details: { pong } };
  } catch (e: any) {
    return { id: "redis", name: "Redis", status: "fail", ms: Date.now() - start, details: { error: String(e?.message ?? e) } };
  }
}

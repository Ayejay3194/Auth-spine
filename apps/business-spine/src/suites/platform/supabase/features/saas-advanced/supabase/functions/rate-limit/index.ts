/**
 * Simple rate limiter (in-memory). Swap for Redis/KV for real deployments.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Key = string;

const buckets = new Map<Key, { count: number; resetAt: number }>();

function nowMs() {
  return Date.now();
}

function take(key: Key, limit: number, windowMs: number) {
  const n = nowMs();
  const b = buckets.get(key);
  if (!b || n >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: n + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: n + windowMs };
  }
  if (b.count >= limit) return { allowed: false, remaining: 0, resetAt: b.resetAt };
  b.count += 1;
  return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt };
}

serve(async (req) => {
  const tenantId = req.headers.get("x-tenant-id") ?? "unknown";
  const apiKeyId = req.headers.get("x-api-key-id") ?? "anon";
  const limit = Number(req.headers.get("x-rate-limit") ?? "60");
  const windowMs = Number(req.headers.get("x-rate-window-ms") ?? String(60_000));

  const key = `${tenantId}:${apiKeyId}`;
  const res = take(key, limit, windowMs);

  return new Response(JSON.stringify(res), {
    headers: {
      "content-type": "application/json",
      "x-ratelimit-limit": String(limit),
      "x-ratelimit-remaining": String(res.remaining),
      "x-ratelimit-reset": String(Math.floor(res.resetAt / 1000)),
    },
    status: res.allowed ? 200 : 429,
  });
});

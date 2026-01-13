import { redis } from "@/src/redis/client";

export async function rateLimit(key: string, windowSeconds: number, max: number) {
  const r = redis();
  const bucketKey = `rl:${key}:${Math.floor(Date.now() / (windowSeconds*1000))}`;
  const n = await r.incr(bucketKey);
  if (n === 1) await r.expire(bucketKey, windowSeconds);
  return { ok: n <= max, remaining: Math.max(0, max - n) };
}

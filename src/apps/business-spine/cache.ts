import { redis } from "@/src/redis/client";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = redis();
  const v = await r.get(key);
  return v ? (JSON.parse(v) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60) {
  const r = redis();
  await r.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(prefix: string) {
  const r = redis();
  const keys = await r.keys(prefix + "*");
  if (keys.length) await r.del(keys);
}

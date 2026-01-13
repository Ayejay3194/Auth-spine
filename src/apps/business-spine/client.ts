import Redis from "ioredis";
let _redis: Redis | null = null;

export function redis() {
  if (_redis) return _redis;
  const url = process.env.REDIS_URL;
  if (!url) {
    // Return a mock redis client during build time
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return {} as any;
    }
    throw new Error("REDIS_URL missing");
  }
  _redis = new Redis(url, { maxRetriesPerRequest: 3 });
  return _redis;
}

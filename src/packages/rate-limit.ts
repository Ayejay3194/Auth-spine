/**
 * Simple in-memory rate limiter (for demo/development).
 * - Use Redis or similar for production.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60_000
): { allowed: boolean; resetAt?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, resetAt: entry.resetAt };
}

// Helper to get client IP for rate limiting
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] ?? real ?? "unknown";
  return ip.trim();
}

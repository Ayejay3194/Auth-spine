import type { SupabaseClient } from "./types";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: string;
}

/**
 * Calls the atomic rate limiting RPC function.
 * Requires the `rate_limit_hit` function (see `sql/audit.sql`).
 */
export async function hitRateLimit(
  sb: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const { data, error } = await sb.rpc("rate_limit_hit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Rate limit RPC returned no data");
  }

  const row = data[0];
  return {
    ok: Boolean(row.ok),
    remaining: Number(row.remaining),
    resetAt: row.reset_at,
  };
}

/**
 * Helper to build a rate limit key for common patterns.
 */
export function buildRateLimitKey(
  type: "auth" | "api" | "upload",
  identifier: string
): string {
  return `${type}:${identifier}`;
}

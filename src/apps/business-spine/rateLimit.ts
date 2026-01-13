import type { SupabaseClient } from "@supabase/supabase-js";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: string; // ISO
}

export interface RateLimiter {
  hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

/**
 * Postgres-backed rate limiter using an upsert + window bucket.
 * Storage table: app_rate_limits (see sql/app_rate_limits.sql)
 */
export class PostgresRateLimiter implements RateLimiter {
  constructor(private sb: SupabaseClient) {}

  async hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const bucket = Math.floor(Date.now() / (windowSeconds * 1000));

    const { data, error } = await this.sb
      .rpc("rate_limit_hit", { p_key: key, p_bucket: bucket, p_limit: limit, p_window_seconds: windowSeconds })
      .single();

    if (error) throw error;

    return {
      ok: Boolean(data.ok),
      remaining: Number(data.remaining),
      resetAt: String(data.reset_at),
    };
  }
}

import { json, type Middleware } from "./middleware.ts";

function ipKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

export function rateLimit(options: { name: string; limit: number; windowSeconds: number }): Middleware {
  return (next) => async (req, ctx) => {
    const supabase = ctx.supabase;
    if (!supabase) return json({ error: "server_misconfig" }, { status: 500 });

    const key = `${options.name}:${ipKey(req)}`;
    const { data, error } = await supabase.rpc("app_rate_limit_hit", {
      p_key: key,
      p_limit: options.limit,
      p_window_seconds: options.windowSeconds,
    });

    if (error) return json({ error: "rate_limit_error", details: error.message }, { status: 500 });

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.ok) {
      return json({ error: "rate_limited", resetAt: row?.reset_at }, { status: 429, headers: { "Retry-After": String(options.windowSeconds) } });
    }

    return next(req, ctx);
  };
}

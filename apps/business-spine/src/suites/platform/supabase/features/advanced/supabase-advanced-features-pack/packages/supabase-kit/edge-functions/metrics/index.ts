import { compose, json } from "../_shared/middleware.ts";
import { withSupabase, requireAuth, requireRole } from "../_shared/auth.ts";
import { rateLimit } from "../_shared/rateLimit.ts";

const handler = async (_req: Request, ctx: any) => {
  const { data: tableSizes, error: e1 } = await ctx.supabase.from("app_monitor_table_sizes").select("*").limit(50);
  if (e1) return json({ error: "query_failed", details: e1.message }, { status: 500 });

  const { data: indexUsage, error: e2 } = await ctx.supabase.from("app_monitor_index_usage").select("*").limit(50);
  if (e2) return json({ error: "query_failed", details: e2.message }, { status: 500 });

  return json({ tableSizes, indexUsage });
};

Deno.serve(
  compose(handler, [
    withSupabase(Deno.env.toObject()),
    rateLimit({ name: "metrics", limit: 60, windowSeconds: 60 }),
    requireAuth(),
    requireRole(["admin"]),
  ])
);

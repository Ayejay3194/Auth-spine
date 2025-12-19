import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json, type Middleware } from "./middleware.ts";

export interface AuthedContext {
  user: { id: string; email?: string | null; role?: string | null };
}

export function withSupabase(env: Record<string, string>): Middleware {
  return (next) => async (req, ctx) => {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    ctx.supabase = supabase;
    return next(req, ctx);
  };
}

export function requireAuth(): Middleware {
  return (next) => async (req, ctx) => {
    const supabase = ctx.supabase as ReturnType<typeof createClient> | undefined;
    if (!supabase) return json({ error: "server_misconfig", message: "Supabase client missing" }, { status: 500 });

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return json({ error: "unauthorized" }, { status: 401 });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return json({ error: "unauthorized" }, { status: 401 });

    ctx.user = { id: data.user.id, email: data.user.email };
    return next(req, ctx);
  };
}

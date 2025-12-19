/**
 * Support JIT access workflow starter.
 * This is *separate* from customer auth. Log everything. Time-limit everything.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey);

  const body = await req.json().catch(() => ({}));
  const mode = body.mode as string; // request | approve | revoke
  const tenantId = body.tenantId as string;
  const supportUserId = body.supportUserId as string;

  if (!mode || !tenantId || !supportUserId) return new Response("bad request", { status: 400 });

  // In real life: require separate admin auth for these endpoints.
  const { data, error } = await supabase.rpc("support_jit", {
    p_mode: mode,
    p_tenant_id: tenantId,
    p_support_user_id: supportUserId,
    p_minutes: Number(body.minutes ?? 30),
  });

  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify({ ok: true, data }), { headers: { "content-type": "application/json" } });
});

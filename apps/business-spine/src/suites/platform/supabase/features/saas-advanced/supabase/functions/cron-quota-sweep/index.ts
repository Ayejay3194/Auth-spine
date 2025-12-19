/**
 * Scheduled quota sweep: enforce hard limits (example: suspend tenant when exceeding).
 * Wire this to Supabase Scheduled Functions/Cron.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (_req) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey);

  // Example: find tenants exceeding project quota
  const { data, error } = await supabase.rpc("quota_sweep_projects");
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  return new Response(JSON.stringify({ ok: true, data }), { headers: { "content-type": "application/json" } });
});

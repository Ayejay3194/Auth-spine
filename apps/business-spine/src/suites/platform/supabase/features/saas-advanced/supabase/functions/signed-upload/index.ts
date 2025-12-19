/**
 * Signed upload URL generator (pattern).
 * Requires service role key if you mint signed URLs server-side.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  const { tenantId, path, bucket } = await req.json().catch(() => ({}));
  if (!tenantId || !path || !bucket) return new Response("bad request", { status: 400 });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey);

  // Enforce tenant path prefix
  if (!String(path).startsWith(`${tenantId}/`)) {
    return new Response("path must start with tenantId/", { status: 403 });
  }

  // Signed upload URL (10 minutes)
  const expiresIn = 600;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path, expiresIn);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });

  return new Response(JSON.stringify({ data }), { headers: { "content-type": "application/json" } });
});

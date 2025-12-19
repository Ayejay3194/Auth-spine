// Supabase Edge Function: signed webhook receiver (Deno)
// - Verifies HMAC signature
// - Enforces JWT (optional)
// - Logs structured event

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmacSha256Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET") ?? "";
  if (!secret) return new Response("Missing WEBHOOK_SECRET", { status: 500 });

  const body = await req.text();
  const given = req.headers.get("x-signature") ?? "";
  const expected = await hmacSha256Hex(secret, body);

  if (!timingSafeEqual(given, expected)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // TODO: parse and act
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log(JSON.stringify({
    at: new Date().toISOString(),
    event: "webhook.received",
    size: body.length,
  }));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
});

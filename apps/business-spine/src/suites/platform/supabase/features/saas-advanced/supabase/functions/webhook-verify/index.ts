/**
 * Webhook verification (HMAC) + replay protection skeleton.
 * Replace `getWebhookSecret()` and `isReplay()` with real storage (KV/Redis).
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const REPLAY_TTL_MS = 5 * 60 * 1000;
const replayCache = new Map<string, number>();

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

async function hmacSHA256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

async function getWebhookSecret(tenantId: string): Promise<string> {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret) {
    throw new Error(`Missing WEBHOOK_SECRET for tenant ${tenantId}`);
  }
  return secret;
}

async function isReplay(tenantId: string, id: string): Promise<boolean> {
  const key = `${tenantId}:${id}`;
  const now = Date.now();
  for (const [cachedKey, expiresAt] of replayCache.entries()) {
    if (expiresAt <= now) replayCache.delete(cachedKey);
  }
  if (replayCache.has(key)) return true;
  replayCache.set(key, now + REPLAY_TTL_MS);
  return false;
}

serve(async (req) => {
  const tenantId = req.headers.get("x-tenant-id") ?? "";
  const sigHeader = req.headers.get("x-signature") ?? "";
  const idHeader = req.headers.get("x-webhook-id") ?? crypto.randomUUID();
  const tsHeader = req.headers.get("x-webhook-timestamp") ?? "";

  if (!tenantId || !sigHeader || !tsHeader) {
    return new Response("missing headers", { status: 400 });
  }

  if (await isReplay(tenantId, idHeader)) {
    return new Response("replay detected", { status: 409 });
  }

  const bodyText = await req.text();

  // Common pattern: sign "{timestamp}.{body}"
  const signedPayload = `${tsHeader}.${bodyText}`;
  const secret = await getWebhookSecret(tenantId);
  const expected = await hmacSHA256(secret, signedPayload);

  // Assume sigHeader is hex
  const provided = Uint8Array.from(sigHeader.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) ?? []);
  const ok = timingSafeEqual(expected, provided);

  if (!ok) return new Response("invalid signature", { status: 401 });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
});

import crypto from "crypto";

/**
 * Stripe-style webhook verification (HMAC).
 * Provider-specific: use their exact signature scheme in prod.
 */
export function verifyWebhook(rawBody: string, signatureHeader: string, secret: string) {
  const mac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(mac));
  } catch {
    return false;
  }
}

import crypto from "node:crypto";

export function signWebhook(secret: string, body: string, ts: string) {
  return crypto.createHmac("sha256", secret).update(ts + "." + body).digest("hex");
}

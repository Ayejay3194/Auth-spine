import crypto from "crypto";

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey() {
  return "sk_" + crypto.randomBytes(24).toString("hex");
}

// Store hash only, never the raw key.

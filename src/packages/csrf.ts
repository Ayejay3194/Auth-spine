import { randomBytes } from "crypto";

/**
 * Simple CSRF token utilities.
 * - In production, store tokens in Redis or DB with expiration.
 */
const store = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex");
  const expires = Date.now() + 3_600_000; // 1 hour
  store.set(sessionId, { token, expires });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const entry = store.get(sessionId);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    store.delete(sessionId);
    return false;
  }
  return entry.token === token;
}

// Cleanup expired tokens (run periodically)
export function cleanupCSRFTokens(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expires) {
      store.delete(key);
    }
  }
}

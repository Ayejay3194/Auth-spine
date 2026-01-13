/**
 * Simple in-memory rate limiter for authentication endpoints
 * Tracks failed login attempts per IP address
 * Implements exponential backoff
 */

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60 * 1000, // 1 minute
  LOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  LOCK_THRESHOLD: 10, // Lock after 10 failed attempts
};

/**
 * Check if IP is rate limited
 */
export function isRateLimited(ip: string): boolean {
  const entry = rateLimitStore.get(ip);
  if (!entry) return false;

  const now = Date.now();

  // Check if currently locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return true;
  }

  // Clear lock if expired
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    entry.lockedUntil = undefined;
    entry.attempts = 0;
  }

  // Reset attempts if window expired
  if (now - entry.lastAttempt > CONFIG.WINDOW_MS) {
    entry.attempts = 0;
  }

  return false;
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);

  if (!entry) {
    entry = { attempts: 0, lastAttempt: now };
    rateLimitStore.set(ip, entry);
  }

  // Reset if window expired
  if (now - entry.lastAttempt > CONFIG.WINDOW_MS) {
    entry.attempts = 0;
  }

  entry.attempts++;
  entry.lastAttempt = now;

  // Lock if threshold exceeded
  if (entry.attempts >= CONFIG.LOCK_THRESHOLD) {
    entry.lockedUntil = now + CONFIG.LOCK_DURATION_MS;
  }
}

/**
 * Record a successful login (clears rate limit)
 */
export function recordSuccessfulAttempt(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Get remaining time until rate limit expires (in seconds)
 */
export function getRateLimitRemainingSeconds(ip: string): number {
  const entry = rateLimitStore.get(ip);
  if (!entry || !entry.lockedUntil) return 0;

  const remaining = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  for (const [ip, entry] of rateLimitStore.entries()) {
    // Delete if no activity for 1 hour
    if (now - entry.lastAttempt > 60 * 60 * 1000) {
      entriesToDelete.push(ip);
    }
  }

  entriesToDelete.forEach(ip => rateLimitStore.delete(ip));
}

// Cleanup every 10 minutes
setInterval(cleanupRateLimitStore, 10 * 60 * 1000);

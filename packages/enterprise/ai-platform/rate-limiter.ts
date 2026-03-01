/**
 * Rate Limiter
 * 
 * Token bucket rate limiting for API protection.
 * 
 * Features:
 * - Token bucket algorithm
 * - Per-user/tenant rate limiting
 * - Multiple limit tiers (free, pro, enterprise)
 * - Burst handling
 * - Rate limit headers
 * - Distributed rate limiting support
 * - Automatic cleanup of expired buckets
 */

export interface RateLimitConfig {
  maxTokens: number;          // Maximum tokens in bucket
  refillRate: number;         // Tokens added per interval
  refillInterval: number;     // Interval in milliseconds
  burstSize?: number;         // Max burst size (default: maxTokens)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;        // Seconds until retry
  limit: number;
}

export interface TokenBucket {
  key: string;
  tokens: number;
  maxTokens: number;
  refillRate: number;
  refillInterval: number;
  lastRefill: number;
  requests: number;
  blocked: number;
}

/**
 * Rate limit tiers
 */
export const RateLimitTiers = {
  free: {
    maxTokens: 100,
    refillRate: 10,
    refillInterval: 60 * 1000  // 10 requests per minute
  },
  pro: {
    maxTokens: 1000,
    refillRate: 100,
    refillInterval: 60 * 1000  // 100 requests per minute
  },
  enterprise: {
    maxTokens: 10000,
    refillRate: 1000,
    refillInterval: 60 * 1000  // 1000 requests per minute
  },
  unlimited: {
    maxTokens: Number.MAX_SAFE_INTEGER,
    refillRate: Number.MAX_SAFE_INTEGER,
    refillInterval: 1000
  }
};

/**
 * Token Bucket Rate Limiter
 */
export class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private cleanupTimer?: NodeJS.Timeout;
  private cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.startCleanup();
  }

  /**
   * Check if request is allowed
   */
  async check(
    key: string,
    config: RateLimitConfig,
    cost = 1
  ): Promise<RateLimitResult> {
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = this.createBucket(key, config);
      this.buckets.set(key, bucket);
    }

    // Refill tokens
    this.refill(bucket);

    // Check if enough tokens
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      bucket.requests++;

      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: this.getResetTime(bucket),
        limit: bucket.maxTokens
      };
    } else {
      bucket.blocked++;

      const retryAfter = Math.ceil(
        (cost - bucket.tokens) / bucket.refillRate * (bucket.refillInterval / 1000)
      );

      return {
        allowed: false,
        remaining: 0,
        resetAt: this.getResetTime(bucket),
        retryAfter,
        limit: bucket.maxTokens
      };
    }
  }

  /**
   * Get bucket stats for a key
   */
  getStats(key: string): TokenBucket | null {
    const bucket = this.buckets.get(key);
    if (!bucket) return null;

    this.refill(bucket);
    return { ...bucket };
  }

  /**
   * Get all bucket stats
   */
  getAllStats(): TokenBucket[] {
    return Array.from(this.buckets.values()).map(bucket => {
      this.refill(bucket);
      return { ...bucket };
    });
  }

  /**
   * Reset bucket for a key
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all buckets
   */
  clear(): void {
    this.buckets.clear();
  }

  /**
   * Stop the rate limiter
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Create new token bucket
   */
  private createBucket(key: string, config: RateLimitConfig): TokenBucket {
    return {
      key,
      tokens: config.maxTokens,
      maxTokens: config.maxTokens,
      refillRate: config.refillRate,
      refillInterval: config.refillInterval,
      lastRefill: Date.now(),
      requests: 0,
      blocked: 0
    };
  }

  /**
   * Refill tokens in bucket
   */
  private refill(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const intervals = Math.floor(elapsed / bucket.refillInterval);

    if (intervals > 0) {
      const tokensToAdd = intervals * bucket.refillRate;
      bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  /**
   * Get time when bucket will be fully refilled
   */
  private getResetTime(bucket: TokenBucket): number {
    if (bucket.tokens >= bucket.maxTokens) {
      return Date.now();
    }

    const tokensNeeded = bucket.maxTokens - bucket.tokens;
    const intervalsNeeded = Math.ceil(tokensNeeded / bucket.refillRate);
    return bucket.lastRefill + (intervalsNeeded * bucket.refillInterval);
  }

  /**
   * Start cleanup timer to remove old buckets
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Remove buckets that haven't been accessed recently
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key);
      }
    }
  }
}

/**
 * Rate limiter middleware helper
 */
export class RateLimiterMiddleware {
  private limiter: RateLimiter;
  private defaultConfig: RateLimitConfig;

  constructor(defaultTier: keyof typeof RateLimitTiers = 'free') {
    this.limiter = new RateLimiter();
    this.defaultConfig = RateLimitTiers[defaultTier];
  }

  /**
   * Create rate limit middleware for Express/Fastify
   */
  middleware(options?: {
    keyGenerator?: (req: any) => string;
    tier?: keyof typeof RateLimitTiers;
    cost?: number;
    onLimit?: (req: any, result: RateLimitResult) => void;
  }) {
    const keyGen = options?.keyGenerator || ((req: any) => req.ip || 'unknown');
    const config = options?.tier ? RateLimitTiers[options.tier] : this.defaultConfig;
    const cost = options?.cost || 1;

    return async (req: any, res: any, next: any) => {
      const key = keyGen(req);
      const result = await this.limiter.check(key, config, cost);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetAt);

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter);
        
        if (options?.onLimit) {
          options.onLimit(req, result);
        }

        res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter
        });
        return;
      }

      next();
    };
  }

  /**
   * Get limiter instance
   */
  getLimiter(): RateLimiter {
    return this.limiter;
  }

  /**
   * Stop the middleware
   */
  stop(): void {
    this.limiter.stop();
  }
}

/**
 * Per-user rate limiter with tier management
 */
export class UserRateLimiter {
  private limiter: RateLimiter;
  private userTiers = new Map<string, keyof typeof RateLimitTiers>();

  constructor() {
    this.limiter = new RateLimiter();
  }

  /**
   * Set tier for a user
   */
  setUserTier(userId: string, tier: keyof typeof RateLimitTiers): void {
    this.userTiers.set(userId, tier);
  }

  /**
   * Get tier for a user
   */
  getUserTier(userId: string): keyof typeof RateLimitTiers {
    return this.userTiers.get(userId) || 'free';
  }

  /**
   * Check rate limit for user
   */
  async check(userId: string, cost = 1): Promise<RateLimitResult> {
    const tier = this.getUserTier(userId);
    const config = RateLimitTiers[tier];
    return this.limiter.check(userId, config, cost);
  }

  /**
   * Get stats for user
   */
  getStats(userId: string): TokenBucket | null {
    return this.limiter.getStats(userId);
  }

  /**
   * Get all user stats
   */
  getAllStats(): Array<TokenBucket & { tier: keyof typeof RateLimitTiers }> {
    const allStats = this.limiter.getAllStats();
    return allStats.map(stats => ({
      ...stats,
      tier: this.getUserTier(stats.key)
    }));
  }

  /**
   * Reset user rate limit
   */
  reset(userId: string): void {
    this.limiter.reset(userId);
  }

  /**
   * Stop the rate limiter
   */
  stop(): void {
    this.limiter.stop();
  }
}

/**
 * Distributed rate limiter using Redis (stub)
 */
export class DistributedRateLimiter {
  private localLimiter: RateLimiter;

  constructor(config?: { redisUrl?: string }) {
    // For now, use local rate limiter
    // In production, this would use Redis
    this.localLimiter = new RateLimiter();
    
    console.warn('DistributedRateLimiter: Using local limiter fallback. Connect to Redis for distributed rate limiting.');
  }

  async check(key: string, config: RateLimitConfig, cost = 1): Promise<RateLimitResult> {
    // In production: use Redis INCR, EXPIRE for atomic operations
    return this.localLimiter.check(key, config, cost);
  }

  getStats(key: string): TokenBucket | null {
    return this.localLimiter.getStats(key);
  }

  reset(key: string): void {
    this.localLimiter.reset(key);
  }

  stop(): void {
    this.localLimiter.stop();
  }
}

export { RateLimiter };

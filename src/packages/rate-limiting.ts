/**
 * Rate Limiting for Beauty Booking Security Pack
 * 
 * Provides rate limiting and brute force protection for
 * beauty booking platforms with domain-specific rules.
 */

import { RateLimitingConfig, RateLimitResult } from './types.js';

export class RateLimitingManager {
  private config: RateLimitingConfig;
  private rateLimits: Map<string, Map<string, { count: number; resetTime: Date }>> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> = new Map();
  private initialized = false;

  /**
   * Initialize rate limiting
   */
  async initialize(config: RateLimitingConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Check rate limit
   */
  async checkLimit(identifier: string, domain: 'public' | 'studio' | 'ops'): Promise<RateLimitResult> {
    if (!this.config.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000),
        limit: Infinity
      };
    }

    // Check if user is locked out due to brute force attempts
    const lockoutStatus = this.checkLockout(identifier);
    if (lockoutStatus.locked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: lockoutStatus.lockedUntil!,
        retryAfter: Math.ceil((lockoutStatus.lockedUntil!.getTime() - Date.now()) / 1000)
      };
    }

    const rule = this.config.rules[domain];
    if (!rule) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000),
        limit: Infinity
      };
    }

    const key = `${domain}:${identifier}`;
    const now = new Date();

    // Get or create rate limit tracker
    if (!this.rateLimits.has(domain)) {
      this.rateLimits.set(domain, new Map());
    }

    const domainLimits = this.rateLimits.get(domain)!;
    const current = domainLimits.get(identifier);

    // Check if window has expired
    if (!current || now > current.resetTime) {
      domainLimits.set(identifier, {
        count: 1,
        resetTime: new Date(now.getTime() + rule.window)
      });

      return {
        allowed: true,
        remaining: rule.requests - 1,
        resetTime: new Date(now.getTime() + rule.window),
        limit: rule.requests
      };
    }

    // Check if limit exceeded
    if (current.count >= rule.requests) {
      // Record failed attempt for brute force protection
      this.recordFailedAttempt(identifier);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime.getTime() - Date.now()) / 1000),
        limit: rule.requests
      };
    }

    // Increment count
    current.count++;
    const remaining = rule.requests - current.count;

    return {
      allowed: true,
      remaining,
      resetTime: current.resetTime,
      limit: rule.requests
    };
  }

  /**
   * Record successful attempt (clears failed attempts)
   */
  recordSuccess(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  /**
   * Record failed attempt for brute force protection
   */
  recordFailedAttempt(identifier: string): void {
    if (!this.config.enableBruteForceProtection) {
      return;
    }

    const attempts = this.failedAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();

    // Check if should lock out
    if (attempts.count >= this.config.maxFailedAttempts) {
      attempts.lockedUntil = new Date(Date.now() + this.config.lockoutDuration);
    }

    this.failedAttempts.set(identifier, attempts);
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(identifier: string, domain: 'public' | 'studio' | 'ops'): Promise<{
    current: number;
    limit: number;
    remaining: number;
    resetTime: Date;
    lockedUntil?: Date;
  }> {
    const rule = this.config.rules[domain];
    if (!rule) {
      return {
        current: 0,
        limit: Infinity,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000)
      };
    }

    const key = `${domain}:${identifier}`;
    const domainLimits = this.rateLimits.get(domain);
    const current = domainLimits?.get(identifier);
    const lockoutStatus = this.checkLockout(identifier);

    return {
      current: current?.count || 0,
      limit: rule.requests,
      remaining: Math.max(0, rule.requests - (current?.count || 0)),
      resetTime: current?.resetTime || new Date(Date.now() + rule.window),
      lockedUntil: lockoutStatus.lockedUntil
    };
  }

  /**
   * Reset rate limit for identifier
   */
  resetRateLimit(identifier: string, domain: 'public' | 'studio' | 'ops'): void {
    const domainLimits = this.rateLimits.get(domain);
    if (domainLimits) {
      domainLimits.delete(identifier);
    }
  }

  /**
   * Clear lockout for identifier
   */
  clearLockout(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Get rate limiting metrics
   */
  async getMetrics(): Promise<{
    totalRequests: number;
    blockedRequests: number;
    lockedOutUsers: number;
    averageRequestsPerMinute: number;
  }> {
    let totalRequests = 0;
    let blockedRequests = 0;
    let lockedOutUsers = 0;

    // Count current requests and blocked requests
    for (const [domain, limits] of this.rateLimits.entries()) {
      for (const [identifier, limit] of limits.entries()) {
        totalRequests += limit.count;
        const rule = this.config.rules[domain as keyof typeof this.config.rules];
        if (rule && limit.count >= rule.requests) {
          blockedRequests++;
        }
      }
    }

    // Count locked out users
    for (const [identifier, attempts] of this.failedAttempts.entries()) {
      if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
        lockedOutUsers++;
      }
    }

    return {
      totalRequests,
      blockedRequests,
      lockedOutUsers,
      averageRequestsPerMinute: Math.round(totalRequests / 10) // Simplified calculation
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let cleanedCount = 0;
    const now = new Date();

    // Clean up expired rate limits
    for (const [domain, limits] of this.rateLimits.entries()) {
      for (const [identifier, limit] of limits.entries()) {
        if (now > limit.resetTime) {
          limits.delete(identifier);
          cleanedCount++;
        }
      }
    }

    // Clean up expired lockouts
    for (const [identifier, attempts] of this.failedAttempts.entries()) {
      if (attempts.lockedUntil && now > attempts.lockedUntil) {
        this.failedAttempts.delete(identifier);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Generate rate limiting configuration
   */
  generateConfig(): {
    redis: string;
    nginx: string;
    express: string;
  } {
    const redisConfig = this.generateRedisConfig();
    const nginxConfig = this.generateNginxConfig();
    const expressConfig = this.generateExpressConfig();

    return {
      redis: redisConfig,
      nginx: nginxConfig,
      express: expressConfig
    };
  }

  private checkLockout(identifier: string): { locked: boolean; lockedUntil?: Date } {
    const attempts = this.failedAttempts.get(identifier);
    if (!attempts || !attempts.lockedUntil) {
      return { locked: false };
    }

    if (attempts.lockedUntil <= new Date()) {
      // Lockout expired
      this.failedAttempts.delete(identifier);
      return { locked: false };
    }

    return { locked: true, lockedUntil: attempts.lockedUntil };
  }

  private generateRedisConfig(): string {
    return `
# Redis Rate Limiting Configuration
# Generated on ${new Date().toISOString()}

# Rate limiting Lua script
local rate_limit_key = KEYS[1]
local identifier = KEYS[2]
local current_time = tonumber(ARGV[1])
limit = tonumber(ARGV[2])
window = tonumber(ARGV[3])

local current = redis.call('GET', rate_limit_key .. ':' .. identifier)
if current then
  current = tonumber(current)
else
  current = 0
end

if current < limit then
  redis.call('INCR', rate_limit_key .. ':' .. identifier)
  redis.call('EXPIRE', rate_limit_key .. ':' .. identifier, window / 1000)
  return {1, limit - current - 1}
else
  return {0, 0}
end

# Failed attempts tracking
local failed_attempts_key = KEYS[3]
local max_attempts = tonumber(ARGV[4])
local lockout_duration = tonumber(ARGV[5])

local failed = redis.call('GET', failed_attempts_key .. ':' .. identifier)
if failed then
  failed = tonumber(failed)
else
  failed = 0
end

if failed >= max_attempts then
  redis.call('SETEX', failed_attempts_key .. ':locked:' .. identifier, lockout_duration / 1000, '1')
  return {0, 0, 1}
end

redis.call('INCR', failed_attempts_key .. ':' .. identifier)
redis.call('EXPIRE', failed_attempts_key .. ':' .. identifier, lockout_duration / 1000)
return {1, limit - current - 1, 0}
`;
  }

  private generateNginxConfig(): string {
    return `
# Nginx Rate Limiting Configuration
# Generated on ${new Date().toISOString()}

# Define rate limiting zones
limit_req_zone $binary_remote_addr zone=public_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=studio_limit:10m rate=50r/s;
limit_req_zone $binary_remote_addr zone=ops_limit:10m rate=100r/s;

# Brute force protection zones
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 443 ssl http2;
    server_name app.beautybooking.com;
    
    # Apply rate limiting
    limit_req zone=public_limit burst=20 nodelay;
    
    # Authentication endpoints with stricter limits
    location /api/auth {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://backend;
    }
    
    location / {
        proxy_pass http://backend;
    }
}

server {
    listen 443 ssl http2;
    server_name studio.beautybooking.com;
    
    # Apply rate limiting
    limit_req zone=studio_limit burst=50 nodelay;
    
    # Authentication endpoints with stricter limits
    location /api/auth {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://studio_backend;
    }
    
    location / {
        proxy_pass http://studio_backend;
    }
}

server {
    listen 443 ssl http2;
    server_name ops.beautybooking.com;
    
    # Apply rate limiting
    limit_req zone=ops_limit burst=100 nodelay;
    
    # Authentication endpoints with stricter limits
    location /api/auth {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://ops_backend;
    }
    
    location / {
        proxy_pass http://ops_backend;
    }
}
`;
  }

  private generateExpressConfig(): string {
    return `
// Express Rate Limiting Configuration
// Generated on ${new Date().toISOString()}

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Rate limiting rules for different domains
const rateLimitRules = {
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  studio: {
    windowMs: 60 * 1000, // 1 minute
    max: 500, // requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  ops: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Create rate limiters for each domain
const createRateLimiter = (domain) => {
  const rule = rateLimitRules[domain];
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: \`rl:\${domain}:\`,
    }),
    windowMs: rule.windowMs,
    max: rule.max,
    message: rule.message,
    standardHeaders: rule.standardHeaders,
    legacyHeaders: rule.legacyHeaders,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/status';
    }
  });
};

// Authentication rate limiting (stricter)
const authRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  skipSuccessfulRequests: true
});

// Brute force protection
const createBruteForceProtection = () => {
  const failedAttempts = new Map();
  
  return {
    recordFailure: (identifier) => {
      const attempts = failedAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };
      attempts.count++;
      attempts.lastAttempt = new Date();
      
      if (attempts.count >= 5) {
        attempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      failedAttempts.set(identifier, attempts);
    },
    
    isLocked: (identifier) => {
      const attempts = failedAttempts.get(identifier);
      if (!attempts || !attempts.lockedUntil) {
        return false;
      }
      
      if (attempts.lockedUntil <= new Date()) {
        failedAttempts.delete(identifier);
        return false;
      }
      
      return true;
    },
    
    recordSuccess: (identifier) => {
      failedAttempts.delete(identifier);
    }
  };
};

module.exports = {
  createRateLimiter,
  authRateLimiter,
  createBruteForceProtection,
  rateLimitRules
};
`;
  }
}

// Export singleton instance
export const rateLimiting = new RateLimitingManager();

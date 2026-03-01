/**
 * Rate Limiter Integration Tests
 * 
 * Tests for rate limiting functionality covering:
 * - Token bucket algorithm
 * - Multiple tiers (Free, Pro, Enterprise, Unlimited)
 * - Token refill mechanics
 * - Burst handling
 * - User management
 * - Rate limit enforcement
 */

import { RateLimiter, UserRateLimiter, RateLimitTiers } from '../rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  afterEach(() => {
    limiter.stop();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const config = { maxTokens: 10, refillRate: 1, refillInterval: 1000 };
      
      const result = await limiter.check('user1', config, 1);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThanOrEqual(10);
      expect(result.limit).toBe(10);
    });

    it('should block requests exceeding limit', async () => {
      const config = { maxTokens: 2, refillRate: 1, refillInterval: 1000 };
      
      // Use up all tokens
      await limiter.check('user1', config, 2);
      
      // This should be blocked
      const result = await limiter.check('user1', config, 1);
      
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track remaining tokens', async () => {
      const config = { maxTokens: 10, refillRate: 1, refillInterval: 1000 };
      
      const result1 = await limiter.check('user1', config, 3);
      expect(result1.remaining).toBe(7);
      
      const result2 = await limiter.check('user1', config, 2);
      expect(result2.remaining).toBe(5);
    });

    it('should provide reset time', async () => {
      const config = { maxTokens: 5, refillRate: 5, refillInterval: 1000 };
      
      const result = await limiter.check('user1', config, 5);
      
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Token Refill', () => {
    it('should refill tokens over time', async () => {
      const config = { maxTokens: 10, refillRate: 5, refillInterval: 100 }; // 5 tokens per 100ms
      
      // Use some tokens
      await limiter.check('user1', config, 8);
      let stats = limiter.getStats('user1');
      expect(stats?.tokens).toBe(2);
      
      // Wait for refill
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Check again - should have refilled
      await limiter.check('user1', config, 0); // Just check, don't consume
      stats = limiter.getStats('user1');
      expect(stats?.tokens).toBeGreaterThan(2);
    });

    it('should not exceed max tokens', async () => {
      const config = { maxTokens: 10, refillRate: 5, refillInterval: 100 };
      
      // Start with full bucket
      await limiter.check('user1', config, 0);
      
      // Wait for multiple refill intervals
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check tokens - should be capped at maxTokens
      const stats = limiter.getStats('user1');
      expect(stats?.tokens).toBeLessThanOrEqual(10);
    });

    it('should refill in intervals', async () => {
      const config = { maxTokens: 100, refillRate: 10, refillInterval: 100 };
      
      // Use half the tokens
      await limiter.check('user1', config, 50);
      
      // Wait for one interval
      await new Promise(resolve => setTimeout(resolve, 120));
      
      const stats = limiter.getStats('user1');
      // Should have refilled ~10 tokens
      expect(stats?.tokens).toBeGreaterThanOrEqual(50);
      expect(stats?.tokens).toBeLessThanOrEqual(70);
    });
  });

  describe('Per-User Isolation', () => {
    it('should track limits separately per user', async () => {
      const config = { maxTokens: 5, refillRate: 1, refillInterval: 1000 };
      
      // User 1 uses tokens
      await limiter.check('user1', config, 4);
      const stats1 = limiter.getStats('user1');
      expect(stats1?.tokens).toBe(1);
      
      // User 2 has full bucket
      await limiter.check('user2', config, 0);
      const stats2 = limiter.getStats('user2');
      expect(stats2?.tokens).toBe(5);
    });

    it('should not affect other users when one is limited', async () => {
      const config = { maxTokens: 2, refillRate: 1, refillInterval: 1000 };
      
      // Block user1
      await limiter.check('user1', config, 2);
      const blocked = await limiter.check('user1', config, 1);
      expect(blocked.allowed).toBe(false);
      
      // User2 should still work
      const allowed = await limiter.check('user2', config, 1);
      expect(allowed.allowed).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset user bucket', async () => {
      const config = { maxTokens: 5, refillRate: 1, refillInterval: 1000 };
      
      // Use tokens
      await limiter.check('user1', config, 5);
      let stats = limiter.getStats('user1');
      expect(stats?.tokens).toBe(0);
      
      // Reset
      limiter.reset('user1');
      
      // Should have fresh bucket
      await limiter.check('user1', config, 0);
      stats = limiter.getStats('user1');
      expect(stats?.tokens).toBe(5);
    });

    it('should clear all buckets', () => {
      const config = { maxTokens: 5, refillRate: 1, refillInterval: 1000 };
      
      limiter.check('user1', config, 1);
      limiter.check('user2', config, 1);
      
      limiter.clear();
      
      const allStats = limiter.getAllStats();
      expect(allStats.length).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track request counts', async () => {
      const config = { maxTokens: 10, refillRate: 1, refillInterval: 1000 };
      
      await limiter.check('user1', config, 1);
      await limiter.check('user1', config, 1);
      await limiter.check('user1', config, 1);
      
      const stats = limiter.getStats('user1');
      expect(stats?.requests).toBe(3);
    });

    it('should track blocked requests', async () => {
      const config = { maxTokens: 2, refillRate: 1, refillInterval: 1000 };
      
      await limiter.check('user1', config, 2); // Use all tokens
      await limiter.check('user1', config, 1); // Blocked
      await limiter.check('user1', config, 1); // Blocked
      
      const stats = limiter.getStats('user1');
      expect(stats?.blocked).toBe(2);
    });

    it('should get all user stats', async () => {
      const config = { maxTokens: 5, refillRate: 1, refillInterval: 1000 };
      
      await limiter.check('user1', config, 1);
      await limiter.check('user2', config, 1);
      await limiter.check('user3', config, 1);
      
      const allStats = limiter.getAllStats();
      expect(allStats.length).toBe(3);
      expect(allStats.every(s => s.requests === 1)).toBe(true);
    });
  });

  describe('Variable Cost', () => {
    it('should handle different request costs', async () => {
      const config = { maxTokens: 10, refillRate: 1, refillInterval: 1000 };
      
      // Expensive request
      await limiter.check('user1', config, 5);
      const stats1 = limiter.getStats('user1');
      expect(stats1?.tokens).toBe(5);
      
      // Cheap request
      await limiter.check('user1', config, 1);
      const stats2 = limiter.getStats('user1');
      expect(stats2?.tokens).toBe(4);
    });

    it('should block when cost exceeds available tokens', async () => {
      const config = { maxTokens: 10, refillRate: 1, refillInterval: 1000 };
      
      await limiter.check('user1', config, 7); // 3 tokens left
      
      // Try expensive request
      const result = await limiter.check('user1', config, 5);
      expect(result.allowed).toBe(false);
    });
  });
});

describe('UserRateLimiter', () => {
  let limiter: UserRateLimiter;

  beforeEach(() => {
    limiter = new UserRateLimiter();
  });

  afterEach(() => {
    limiter.stop();
  });

  describe('User Tiers', () => {
    it('should default to free tier', async () => {
      const tier = limiter.getUserTier('user1');
      expect(tier).toBe('free');
    });

    it('should set user tier', () => {
      limiter.setUserTier('user1', 'pro');
      expect(limiter.getUserTier('user1')).toBe('pro');
      
      limiter.setUserTier('user2', 'enterprise');
      expect(limiter.getUserTier('user2')).toBe('enterprise');
    });

    it('should apply correct limits for free tier', async () => {
      limiter.setUserTier('user1', 'free');
      
      // Free tier: 100 max tokens, refill 10 per minute
      const result = await limiter.check('user1', 1);
      expect(result.limit).toBe(RateLimitTiers.free.maxTokens);
    });

    it('should apply correct limits for pro tier', async () => {
      limiter.setUserTier('user1', 'pro');
      
      // Pro tier: 1000 max tokens
      const result = await limiter.check('user1', 1);
      expect(result.limit).toBe(RateLimitTiers.pro.maxTokens);
    });

    it('should apply correct limits for enterprise tier', async () => {
      limiter.setUserTier('user1', 'enterprise');
      
      // Enterprise tier: 10000 max tokens
      const result = await limiter.check('user1', 1);
      expect(result.limit).toBe(RateLimitTiers.enterprise.maxTokens);
    });

    it('should have no limits for unlimited tier', async () => {
      limiter.setUserTier('user1', 'unlimited');
      
      // Unlimited tier
      const result1 = await limiter.check('user1', 1000000);
      expect(result1.allowed).toBe(true);
      
      const result2 = await limiter.check('user1', 1000000);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('Tier Enforcement', () => {
    it('should enforce free tier limits', async () => {
      limiter.setUserTier('user1', 'free');
      
      // Use all free tier tokens (100)
      await limiter.check('user1', RateLimitTiers.free.maxTokens);
      
      // Should be blocked
      const result = await limiter.check('user1', 1);
      expect(result.allowed).toBe(false);
    });

    it('should allow more requests for pro tier', async () => {
      limiter.setUserTier('user1', 'pro');
      
      // Use free tier amount (would block free user)
      await limiter.check('user1', RateLimitTiers.free.maxTokens + 1);
      
      // Should still work for pro
      const result = await limiter.check('user1', 1);
      expect(result.allowed).toBe(true);
    });
  });

  describe('User Statistics', () => {
    it('should get stats for specific user', async () => {
      limiter.setUserTier('user1', 'pro');
      await limiter.check('user1', 10);
      
      const stats = limiter.getStats('user1');
      expect(stats).toBeTruthy();
      expect(stats?.requests).toBe(1);
    });

    it('should get all users with tiers', async () => {
      limiter.setUserTier('user1', 'free');
      limiter.setUserTier('user2', 'pro');
      limiter.setUserTier('user3', 'enterprise');
      
      await limiter.check('user1', 1);
      await limiter.check('user2', 1);
      await limiter.check('user3', 1);
      
      const allStats = limiter.getAllStats();
      expect(allStats.length).toBe(3);
      expect(allStats.some(s => s.tier === 'free')).toBe(true);
      expect(allStats.some(s => s.tier === 'pro')).toBe(true);
      expect(allStats.some(s => s.tier === 'enterprise')).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset specific user', async () => {
      limiter.setUserTier('user1', 'free');
      
      // Use tokens
      await limiter.check('user1', 50);
      
      // Reset
      limiter.reset('user1');
      
      // Should have fresh bucket
      const result = await limiter.check('user1', RateLimitTiers.free.maxTokens);
      expect(result.allowed).toBe(true);
    });
  });
});

describe('RateLimitTiers', () => {
  it('should have all required tiers', () => {
    expect(RateLimitTiers.free).toBeDefined();
    expect(RateLimitTiers.pro).toBeDefined();
    expect(RateLimitTiers.enterprise).toBeDefined();
    expect(RateLimitTiers.unlimited).toBeDefined();
  });

  it('should have increasing limits', () => {
    expect(RateLimitTiers.pro.maxTokens).toBeGreaterThan(RateLimitTiers.free.maxTokens);
    expect(RateLimitTiers.enterprise.maxTokens).toBeGreaterThan(RateLimitTiers.pro.maxTokens);
  });

  it('should have valid refill configurations', () => {
    Object.values(RateLimitTiers).forEach(tier => {
      expect(tier.maxTokens).toBeGreaterThan(0);
      expect(tier.refillRate).toBeGreaterThan(0);
      expect(tier.refillInterval).toBeGreaterThan(0);
    });
  });
});

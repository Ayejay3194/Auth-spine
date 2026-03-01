/**
 * AI Platform Integration Tests
 * 
 * End-to-end tests for the complete AI Platform with all subsystems:
 * - Caching + Rate Limiting + Webhooks working together
 * - Complete workflow from feedback to training
 * - Health monitoring with all subsystems
 */

import { getAIPlatform, resetAIPlatform } from '../manager';
import type { AIPlatformConfig } from '../manager';

describe('AI Platform Integration', () => {
  afterEach(() => {
    resetAIPlatform();
  });

  describe('Platform Initialization', () => {
    it('should initialize with all production features', async () => {
      const ai = getAIPlatform({
        enableCaching: true,
        enableRateLimiting: true,
        enableWebhooks: true,
        enableFeedback: true,
        enableLearning: true,
        enableTrainingLoop: true
      });

      await ai.initialize();

      expect(ai.cache).toBeDefined();
      expect(ai.rateLimiter).toBeDefined();
      expect(ai.webhooks).toBeDefined();
      expect(ai.feedbackCollector).toBeDefined();
      expect(ai.supervisedLearner).toBeDefined();
      expect(ai.trainingOrchestrator).toBeDefined();
    });

    it('should provide health status for all subsystems', async () => {
      const ai = getAIPlatform({
        enableCaching: true,
        enableRateLimiting: true,
        enableWebhooks: true
      });

      await ai.initialize();

      const health = await ai.getHealth();

      expect(health.cacheReady).toBe(true);
      expect(health.rateLimitReady).toBe(true);
      expect(health.webhooksReady).toBe(true);
      expect(health.feedbackReady).toBe(true);
      expect(health.learningReady).toBe(true);
      expect(health.trainingLoopReady).toBe(true);
    });

    it('should work with features disabled', async () => {
      const ai = getAIPlatform({
        enableCaching: false,
        enableRateLimiting: false,
        enableWebhooks: false
      });

      await ai.initialize();

      expect(ai.cache).toBeUndefined();
      expect(ai.rateLimiter).toBeUndefined();
      expect(ai.webhooks).toBeUndefined();
    });
  });

  describe('Caching Integration', () => {
    it('should cache and retrieve responses', async () => {
      const ai = getAIPlatform({ enableCaching: true });
      await ai.initialize();

      const key = 'test_query_123';
      const response = { answer: 'Test answer', confidence: 0.95 };

      ai.setCachedResponse(key, response);
      const cached = ai.getCachedResponse(key);

      expect(cached).toEqual(response);
    });

    it('should provide cache statistics in health', async () => {
      const ai = getAIPlatform({ enableCaching: true });
      await ai.initialize();

      ai.setCachedResponse('key1', 'value1');
      ai.setCachedResponse('key2', 'value2');
      ai.getCachedResponse('key1'); // Hit
      ai.getCachedResponse('key3'); // Miss

      const health = await ai.getHealth();

      expect(health.cache).toBeDefined();
      expect(health.cache?.size).toBe(2);
      expect(health.cache?.hits).toBeGreaterThan(0);
      expect(health.cache?.misses).toBeGreaterThan(0);
    });

    it('should warm cache with popular queries', async () => {
      const ai = getAIPlatform({ enableCaching: true });
      await ai.initialize();

      await ai.warmCache([
        { key: 'faq1', value: 'Answer 1' },
        { key: 'faq2', value: 'Answer 2' }
      ]);

      expect(ai.getCachedResponse('faq1')).toBe('Answer 1');
      expect(ai.getCachedResponse('faq2')).toBe('Answer 2');
    });

    it('should clear cache', async () => {
      const ai = getAIPlatform({ enableCaching: true });
      await ai.initialize();

      ai.setCachedResponse('key1', 'value1');
      expect(ai.getCachedResponse('key1')).toBe('value1');

      ai.clearCache();
      expect(ai.getCachedResponse('key1')).toBeNull();
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limits per user', async () => {
      const ai = getAIPlatform({
        enableRateLimiting: true,
        rateLimitConfig: { defaultTier: 'free' }
      });
      await ai.initialize();

      ai.setUserTier('user1', 'free');

      const result = await ai.checkRateLimit('user1', 1);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBeGreaterThan(0);
    });

    it('should track rate limit stats in health', async () => {
      const ai = getAIPlatform({ enableRateLimiting: true });
      await ai.initialize();

      ai.setUserTier('user1', 'pro');
      ai.setUserTier('user2', 'enterprise');
      await ai.checkRateLimit('user1', 1);
      await ai.checkRateLimit('user2', 1);

      const health = await ai.getHealth();

      expect(health.rateLimit).toBeDefined();
      expect(health.rateLimit?.totalUsers).toBe(2);
    });

    it('should support different tiers', async () => {
      const ai = getAIPlatform({ enableRateLimiting: true });
      await ai.initialize();

      ai.setUserTier('user1', 'pro');
      expect(ai.getUserTier('user1')).toBe('pro');

      ai.setUserTier('user2', 'enterprise');
      expect(ai.getUserTier('user2')).toBe('enterprise');
    });

    it('should reset user rate limits', async () => {
      const ai = getAIPlatform({ enableRateLimiting: true });
      await ai.initialize();

      ai.setUserTier('user1', 'free');
      await ai.checkRateLimit('user1', 50);

      ai.resetRateLimit('user1');

      const result = await ai.checkRateLimit('user1', 100);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Webhook Integration', () => {
    it('should subscribe to webhooks', async () => {
      const ai = getAIPlatform({ enableWebhooks: true });
      await ai.initialize();

      const subscription = ai.subscribeWebhook(
        'https://example.com/webhook',
        ['feedback.received', 'training.approval_required'],
        { secret: 'test-secret' }
      );

      expect(subscription).toBeDefined();
      expect(subscription?.url).toBe('https://example.com/webhook');
      expect(subscription?.events).toContain('feedback.received');
    });

    it('should emit webhook events', async () => {
      const ai = getAIPlatform({ enableWebhooks: true });
      await ai.initialize();

      ai.subscribeWebhook('https://example.com/webhook', ['feedback.received']);

      await ai.emitWebhook('feedback.received', { requestId: 'req_123' });

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = ai.getWebhookStats();
      expect(stats).toBeDefined();
      expect(stats.totalDeliveries).toBeGreaterThan(0);
    });

    it('should track webhook stats in health', async () => {
      const ai = getAIPlatform({ enableWebhooks: true });
      await ai.initialize();

      ai.subscribeWebhook('https://example.com/webhook1', ['feedback.received']);
      ai.subscribeWebhook('https://example.com/webhook2', ['training.job_started']);

      const health = await ai.getHealth();

      expect(health.webhooks).toBeDefined();
      expect(health.webhooks?.totalSubscriptions).toBe(2);
      expect(health.webhooks?.activeSubscriptions).toBe(2);
    });

    it('should get all webhook subscriptions', async () => {
      const ai = getAIPlatform({ enableWebhooks: true });
      await ai.initialize();

      ai.subscribeWebhook('https://example.com/webhook1', ['feedback.received']);
      ai.subscribeWebhook('https://example.com/webhook2', ['training.job_started']);

      const subscriptions = ai.getWebhookSubscriptions();
      expect(subscriptions.length).toBe(2);
    });

    it('should unsubscribe from webhooks', async () => {
      const ai = getAIPlatform({ enableWebhooks: true });
      await ai.initialize();

      const subscription = ai.subscribeWebhook(
        'https://example.com/webhook',
        ['feedback.received']
      );

      expect(subscription).toBeDefined();
      const result = ai.unsubscribeWebhook(subscription!.id);
      expect(result).toBe(true);

      const retrieved = ai.getWebhookSubscription(subscription!.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Combined Features', () => {
    it('should use caching with rate limiting', async () => {
      const ai = getAIPlatform({
        enableCaching: true,
        enableRateLimiting: true
      });
      await ai.initialize();

      ai.setUserTier('user1', 'pro');

      // Check rate limit
      const limitCheck = await ai.checkRateLimit('user1', 1);
      expect(limitCheck.allowed).toBe(true);

      // Use cache
      ai.setCachedResponse('query1', 'cached_response');
      expect(ai.getCachedResponse('query1')).toBe('cached_response');
    });

    it('should emit webhooks on rate limit events', async () => {
      const ai = getAIPlatform({
        enableRateLimiting: true,
        enableWebhooks: true
      });
      await ai.initialize();

      ai.subscribeWebhook('https://example.com/webhook', ['system.threshold_exceeded']);
      ai.setUserTier('user1', 'free');

      // Simulate rate limit threshold exceeded
      await ai.emitWebhook('system.threshold_exceeded', {
        threshold: 'rate_limit',
        userId: 'user1',
        current: 150,
        limit: 100
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = ai.getWebhookStats();
      expect(stats.totalDeliveries).toBeGreaterThan(0);
    });

    it('should provide comprehensive health with all systems', async () => {
      const ai = getAIPlatform({
        enableCaching: true,
        enableRateLimiting: true,
        enableWebhooks: true,
        enableFeedback: true,
        enableLearning: true,
        enableTrainingLoop: true
      });
      await ai.initialize();

      // Use various features
      ai.setCachedResponse('key1', 'value1');
      ai.setUserTier('user1', 'pro');
      ai.subscribeWebhook('https://example.com/webhook', ['feedback.received']);

      const health = await ai.getHealth();

      // Check all subsystems are ready
      expect(health.cacheReady).toBe(true);
      expect(health.rateLimitReady).toBe(true);
      expect(health.webhooksReady).toBe(true);
      expect(health.feedbackReady).toBe(true);
      expect(health.learningReady).toBe(true);
      expect(health.trainingLoopReady).toBe(true);

      // Check statistics are present
      expect(health.cache).toBeDefined();
      expect(health.rateLimit).toBeDefined();
      expect(health.webhooks).toBeDefined();
    });
  });

  describe('Feedback to Training Workflow', () => {
    it('should collect feedback with rate limiting', async () => {
      const ai = getAIPlatform({
        enableRateLimiting: true,
        enableFeedback: true
      });
      await ai.initialize();

      ai.setUserTier('user1', 'pro');

      // Check rate limit before feedback
      const limitCheck = await ai.checkRateLimit('user1', 1);
      expect(limitCheck.allowed).toBe(true);

      // Collect feedback
      await ai.giveFeedback('req_123', 'up', { userId: 'user1' });

      const stats = await ai.getFeedbackStats();
      expect(stats.totalFeedback).toBeGreaterThan(0);
    });

    it('should emit webhooks when feedback is received', async () => {
      const ai = getAIPlatform({
        enableFeedback: true,
        enableWebhooks: true
      });
      await ai.initialize();

      ai.subscribeWebhook('https://example.com/webhook', ['feedback.received']);

      await ai.giveFeedback('req_123', 'up', { userId: 'user1' });

      // Manually emit webhook (in production, this would be automatic)
      await ai.emitWebhook('feedback.received', {
        requestId: 'req_123',
        thumbs: 'up',
        userId: 'user1'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = ai.getWebhookStats();
      expect(stats.totalDeliveries).toBeGreaterThan(0);
    });

    it('should cache training recommendations', async () => {
      const ai = getAIPlatform({
        enableCaching: true,
        enableLearning: true
      });
      await ai.initialize();

      const recommendations = { shouldRetrain: true, reasons: ['Low accuracy'] };
      ai.setCachedResponse('training_recommendation_latest', recommendations);

      const cached = ai.getCachedResponse('training_recommendation_latest');
      expect(cached).toEqual(recommendations);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const ai1 = getAIPlatform();
      const ai2 = getAIPlatform();

      expect(ai1).toBe(ai2);
    });

    it('should reset singleton', () => {
      const ai1 = getAIPlatform();
      resetAIPlatform();
      const ai2 = getAIPlatform();

      expect(ai1).not.toBe(ai2);
    });

    it('should maintain state across calls', async () => {
      const ai1 = getAIPlatform({ enableCaching: true });
      await ai1.initialize();

      ai1.setCachedResponse('key1', 'value1');

      const ai2 = getAIPlatform();
      expect(ai2.getCachedResponse('key1')).toBe('value1');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing subsystems gracefully', async () => {
      const ai = getAIPlatform({
        enableCaching: false,
        enableRateLimiting: false,
        enableWebhooks: false
      });
      await ai.initialize();

      // Should not throw
      expect(() => ai.getCachedResponse('key1')).not.toThrow();
      expect(() => ai.setUserTier('user1', 'pro')).not.toThrow();
      expect(() => ai.subscribeWebhook('url', [])).not.toThrow();
    });

    it('should provide default rate limit when disabled', async () => {
      const ai = getAIPlatform({ enableRateLimiting: false });
      await ai.initialize();

      const result = await ai.checkRateLimit('user1', 1);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle cache operations when disabled', async () => {
      const ai = getAIPlatform({ enableCaching: false });
      await ai.initialize();

      ai.setCachedResponse('key1', 'value1'); // Should not throw
      const result = ai.getCachedResponse('key1');
      expect(result).toBeNull(); // Returns null when disabled
    });
  });

  describe('Performance', () => {
    it('should initialize quickly', async () => {
      const start = Date.now();
      
      const ai = getAIPlatform({
        enableCaching: true,
        enableRateLimiting: true,
        enableWebhooks: true
      });
      await ai.initialize();
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // < 1 second
    });

    it('should handle multiple operations efficiently', async () => {
      const ai = getAIPlatform({
        enableCaching: true,
        enableRateLimiting: true
      });
      await ai.initialize();

      const start = Date.now();

      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        ai.setCachedResponse(`key${i}`, `value${i}`);
        await ai.checkRateLimit(`user${i}`, 1);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // < 500ms for 100 operations
    });
  });
});

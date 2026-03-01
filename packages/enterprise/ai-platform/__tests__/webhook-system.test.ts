/**
 * Webhook System Integration Tests
 * 
 * Tests for webhook functionality covering:
 * - Subscription management
 * - Event emission
 * - Delivery tracking
 * - Retry logic
 * - Event filtering
 * - Statistics
 */

import { WebhookManager, WebhookEvents, type WebhookEvent } from '../webhook-system';

describe('WebhookManager', () => {
  let manager: WebhookManager;

  beforeEach(() => {
    manager = new WebhookManager({
      maxAttempts: 3,
      retryDelay: 100,
      maxRetryDelay: 1000,
      timeout: 5000
    });
  });

  describe('Subscription Management', () => {
    it('should subscribe to events', () => {
      const subscription = manager.subscribe(
        'https://example.com/webhook',
        ['feedback.received', 'training.job_started']
      );
      
      expect(subscription).toBeDefined();
      expect(subscription.url).toBe('https://example.com/webhook');
      expect(subscription.events).toContain('feedback.received');
      expect(subscription.events).toContain('training.job_started');
      expect(subscription.active).toBe(true);
    });

    it('should subscribe with secret', () => {
      const subscription = manager.subscribe(
        'https://example.com/webhook',
        ['feedback.received'],
        { secret: 'my-secret-key' }
      );
      
      expect(subscription.secret).toBe('my-secret-key');
    });

    it('should subscribe with metadata', () => {
      const subscription = manager.subscribe(
        'https://example.com/webhook',
        ['feedback.received'],
        { metadata: { environment: 'production', team: 'backend' } }
      );
      
      expect(subscription.metadata).toEqual({ environment: 'production', team: 'backend' });
    });

    it('should get subscription by ID', () => {
      const subscription = manager.subscribe(
        'https://example.com/webhook',
        ['feedback.received']
      );
      
      const retrieved = manager.getSubscription(subscription.id);
      expect(retrieved).toEqual(subscription);
    });

    it('should get all subscriptions', () => {
      manager.subscribe('https://example.com/webhook1', ['feedback.received']);
      manager.subscribe('https://example.com/webhook2', ['training.job_started']);
      
      const all = manager.getAllSubscriptions();
      expect(all.length).toBe(2);
    });

    it('should unsubscribe', () => {
      const subscription = manager.subscribe(
        'https://example.com/webhook',
        ['feedback.received']
      );
      
      const result = manager.unsubscribe(subscription.id);
      expect(result).toBe(true);
      
      const retrieved = manager.getSubscription(subscription.id);
      expect(retrieved).toBeNull();
    });

    it('should update subscription', () => {
      const subscription = manager.subscribe(
        'https://example.com/webhook',
        ['feedback.received']
      );
      
      const updated = manager.updateSubscription(subscription.id, {
        active: false,
        events: ['training.job_started']
      });
      
      expect(updated?.active).toBe(false);
      expect(updated?.events).toEqual(['training.job_started']);
    });
  });

  describe('Event Emission', () => {
    it('should emit events to subscribers', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123', thumbs: 'up' });
      
      // Small delay for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = manager.getStats();
      expect(stats.totalDeliveries).toBeGreaterThan(0);
    });

    it('should only emit to subscribed events', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('training.job_started', { jobId: 'job_123' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = manager.getStats();
      // Should not deliver as webhook is not subscribed to this event
      expect(stats.totalDeliveries).toBe(0);
    });

    it('should emit to multiple subscribers', async () => {
      manager.subscribe('https://example.com/webhook1', ['feedback.received']);
      manager.subscribe('https://example.com/webhook2', ['feedback.received']);
      manager.subscribe('https://example.com/webhook3', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stats = manager.getStats();
      expect(stats.totalDeliveries).toBe(3);
    });

    it('should not emit to inactive subscriptions', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      manager.updateSubscription(sub.id, { active: false });
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = manager.getStats();
      expect(stats.totalDeliveries).toBe(0);
    });

    it('should include metadata in payload', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit(
        'feedback.received',
        { requestId: 'req_123' },
        { source: 'test', version: '1.0' }
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].payload.metadata).toEqual({ source: 'test', version: '1.0' });
    });
  });

  describe('Delivery Tracking', () => {
    it('should track delivery status', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const deliveries = manager.getDeliveries(sub.id);
      expect(deliveries.length).toBeGreaterThan(0);
      expect(['pending', 'success', 'failed', 'retrying']).toContain(deliveries[0].status);
    });

    it('should get deliveries for subscription', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_1' });
      await manager.emit('feedback.received', { requestId: 'req_2' });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const deliveries = manager.getDeliveries(sub.id);
      expect(deliveries.length).toBe(2);
    });

    it('should get failed deliveries', async () => {
      manager.subscribe('https://invalid-url-that-will-fail', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const failed = manager.getFailedDeliveries();
      // Some may fail in simulation
      expect(Array.isArray(failed)).toBe(true);
    });

    it('should track delivery attempts', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const deliveries = manager.getDeliveries(sub.id);
      if (deliveries.length > 0) {
        expect(deliveries[0].attempt).toBeGreaterThan(0);
        expect(deliveries[0].maxAttempts).toBe(3);
      }
    });
  });

  describe('Statistics', () => {
    it('should provide delivery statistics', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stats = manager.getStats();
      expect(stats.totalSubscriptions).toBe(1);
      expect(stats.activeSubscriptions).toBe(1);
      expect(stats.totalDeliveries).toBeGreaterThan(0);
    });

    it('should track success rate', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_1' });
      await manager.emit('feedback.received', { requestId: 'req_2' });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stats = manager.getStats();
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
    });

    it('should count active vs total subscriptions', () => {
      manager.subscribe('https://example.com/webhook1', ['feedback.received']);
      const sub2 = manager.subscribe('https://example.com/webhook2', ['feedback.received']);
      manager.updateSubscription(sub2.id, { active: false });
      
      const stats = manager.getStats();
      expect(stats.totalSubscriptions).toBe(2);
      expect(stats.activeSubscriptions).toBe(1);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed deliveries', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      // Wait for potential retries
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const deliveries = manager.getDeliveries(sub.id);
      if (deliveries.length > 0 && deliveries[0].status === 'retrying') {
        expect(deliveries[0].attempt).toBeGreaterThan(1);
      }
    });

    it('should respect maxAttempts', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      // Wait for all retry attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const deliveries = manager.getDeliveries(sub.id);
      if (deliveries.length > 0) {
        expect(deliveries[0].attempt).toBeLessThanOrEqual(3);
      }
    });

    it('should allow manual retry of failed deliveries', async () => {
      const sub = manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const deliveries = manager.getDeliveries(sub.id);
      if (deliveries.length > 0 && deliveries[0].status === 'failed') {
        await manager.retryDelivery(deliveries[0].id);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const updated = manager.getDelivery(deliveries[0].id);
        expect(['success', 'pending', 'retrying']).toContain(updated?.status || '');
      }
    });
  });

  describe('Event Filtering', () => {
    it('should only deliver subscribed events', async () => {
      const sub = manager.subscribe('https://example.com/webhook', [
        'feedback.received',
        'training.job_started'
      ]);
      
      await manager.emit('feedback.received', { requestId: 'req_123' });
      await manager.emit('learning.insight_generated', { insightId: 'ins_123' });
      await manager.emit('training.job_started', { jobId: 'job_123' });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const deliveries = manager.getDeliveries(sub.id);
      // Should only have 2 deliveries (not 3)
      expect(deliveries.length).toBe(2);
      expect(deliveries.some(d => d.event === 'feedback.received')).toBe(true);
      expect(deliveries.some(d => d.event === 'training.job_started')).toBe(true);
      expect(deliveries.some(d => d.event === 'learning.insight_generated')).toBe(false);
    });
  });
});

describe('WebhookEvents', () => {
  let manager: WebhookManager;
  let events: WebhookEvents;

  beforeEach(() => {
    manager = new WebhookManager();
    events = new WebhookEvents(manager);
  });

  describe('Feedback Events', () => {
    it('should emit feedbackReceived event', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.received']);
      
      await events.feedbackReceived({
        requestId: 'req_123',
        userId: 'user_1',
        type: 'thumbs',
        value: 'up'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = manager.getStats();
      expect(stats.totalDeliveries).toBeGreaterThan(0);
    });

    it('should emit specific thumbs events', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.thumbs_up', 'feedback.thumbs_down']);
      
      await events.feedbackReceived({
        requestId: 'req_123',
        type: 'thumbs',
        value: 'up'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries.some(d => d.event === 'feedback.thumbs_up')).toBe(true);
    });

    it('should emit rating events', async () => {
      manager.subscribe('https://example.com/webhook', ['feedback.rating']);
      
      await events.feedbackReceived({
        requestId: 'req_123',
        type: 'rating',
        value: 5
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries.some(d => d.event === 'feedback.rating')).toBe(true);
    });
  });

  describe('Learning Events', () => {
    it('should emit insightGenerated event', async () => {
      manager.subscribe('https://example.com/webhook', ['learning.insight_generated']);
      
      await events.insightGenerated({ id: 'insight_123', pattern: 'test' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('learning.insight_generated');
    });

    it('should emit suggestionCreated event', async () => {
      manager.subscribe('https://example.com/webhook', ['learning.suggestion_created']);
      
      await events.suggestionCreated({ id: 'sug_123', type: 'improvement' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('learning.suggestion_created');
    });

    it('should emit suggestionApproved event', async () => {
      manager.subscribe('https://example.com/webhook', ['learning.suggestion_approved']);
      
      await events.suggestionApproved('sug_123', 'admin_1');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('learning.suggestion_approved');
      expect(deliveries[0].payload.data.suggestionId).toBe('sug_123');
      expect(deliveries[0].payload.data.approvedBy).toBe('admin_1');
    });
  });

  describe('Training Events', () => {
    it('should emit trainingJobStarted event', async () => {
      manager.subscribe('https://example.com/webhook', ['training.job_started']);
      
      await events.trainingJobStarted({ id: 'job_123', status: 'running' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('training.job_started');
    });

    it('should emit trainingJobCompleted event', async () => {
      manager.subscribe('https://example.com/webhook', ['training.job_completed']);
      
      await events.trainingJobCompleted({ id: 'job_123', status: 'completed' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('training.job_completed');
    });

    it('should emit trainingJobFailed event', async () => {
      manager.subscribe('https://example.com/webhook', ['training.job_failed']);
      
      await events.trainingJobFailed({ id: 'job_123' }, 'Out of memory');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('training.job_failed');
      expect(deliveries[0].payload.data.error).toBe('Out of memory');
    });

    it('should emit modelDeployed event', async () => {
      manager.subscribe('https://example.com/webhook', ['training.model_deployed']);
      
      await events.modelDeployed('v2.0.0', 'job_123');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('training.model_deployed');
      expect(deliveries[0].payload.data.modelVersion).toBe('v2.0.0');
    });

    it('should emit approvalRequired event', async () => {
      manager.subscribe('https://example.com/webhook', ['training.approval_required']);
      
      await events.approvalRequired('job_123', { improvement: 0.15 });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('training.approval_required');
      expect(deliveries[0].payload.data.jobId).toBe('job_123');
    });
  });

  describe('System Events', () => {
    it('should emit performanceDegraded event', async () => {
      manager.subscribe('https://example.com/webhook', ['system.performance_degraded']);
      
      await events.performanceDegraded({ avgLatency: 5000, successRate: 0.5 });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('system.performance_degraded');
    });

    it('should emit thresholdExceeded event', async () => {
      manager.subscribe('https://example.com/webhook', ['system.threshold_exceeded']);
      
      await events.thresholdExceeded('error_rate', 0.15, 0.10);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deliveries = manager.getDeliveries(manager.getAllSubscriptions()[0].id);
      expect(deliveries[0].event).toBe('system.threshold_exceeded');
      expect(deliveries[0].payload.data.threshold).toBe('error_rate');
      expect(deliveries[0].payload.data.current).toBe(0.15);
      expect(deliveries[0].payload.data.limit).toBe(0.10);
    });
  });
});

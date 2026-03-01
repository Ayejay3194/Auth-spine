/**
 * Webhook System
 * 
 * Event-driven webhook notifications for AI platform events.
 * 
 * Features:
 * - Event subscription management
 * - Retry logic with exponential backoff
 * - Webhook signature verification
 * - Event filtering
 * - Delivery tracking
 * - Failed delivery alerts
 * - Batch event delivery
 */

export type WebhookEvent =
  | 'feedback.received'
  | 'feedback.thumbs_up'
  | 'feedback.thumbs_down'
  | 'feedback.rating'
  | 'feedback.suggestion'
  | 'learning.insight_generated'
  | 'learning.suggestion_created'
  | 'learning.suggestion_approved'
  | 'learning.suggestion_rejected'
  | 'training.job_started'
  | 'training.job_completed'
  | 'training.job_failed'
  | 'training.model_deployed'
  | 'training.approval_required'
  | 'system.health_check_failed'
  | 'system.performance_degraded'
  | 'system.threshold_exceeded';

export interface WebhookSubscription {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;            // For signature verification
  active: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  url: string;
  attempt: number;
  maxAttempts: number;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  statusCode?: number;
  error?: string;
  sentAt?: Date;
  responseTime?: number;
}

export interface WebhookConfig {
  maxAttempts?: number;
  retryDelay?: number;         // Initial retry delay (ms)
  maxRetryDelay?: number;      // Max retry delay (ms)
  timeout?: number;            // Request timeout (ms)
  batchSize?: number;          // Events per batch
  batchDelay?: number;         // Delay between batches (ms)
}

/**
 * Webhook Manager
 */
export class WebhookManager {
  private subscriptions = new Map<string, WebhookSubscription>();
  private deliveries: WebhookDelivery[] = [];
  private config: Required<WebhookConfig>;
  private eventQueue: WebhookPayload[] = [];
  private processing = false;

  constructor(config?: WebhookConfig) {
    this.config = {
      maxAttempts: 3,
      retryDelay: 1000,          // 1 second
      maxRetryDelay: 60000,      // 1 minute
      timeout: 10000,            // 10 seconds
      batchSize: 10,
      batchDelay: 1000,
      ...config
    };
  }

  /**
   * Subscribe to webhook events
   */
  subscribe(
    url: string,
    events: WebhookEvent[],
    options?: {
      secret?: string;
      metadata?: Record<string, any>;
    }
  ): WebhookSubscription {
    const subscription: WebhookSubscription = {
      id: this.generateId(),
      url,
      events,
      secret: options?.secret,
      active: true,
      metadata: options?.metadata,
      createdAt: new Date()
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from webhook
   */
  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get subscription
   */
  getSubscription(subscriptionId: string): WebhookSubscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Get all subscriptions
   */
  getAllSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Update subscription
   */
  updateSubscription(
    subscriptionId: string,
    updates: Partial<Omit<WebhookSubscription, 'id' | 'createdAt'>>
  ): WebhookSubscription | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    Object.assign(subscription, updates);
    return subscription;
  }

  /**
   * Emit event to subscribers
   */
  async emit(event: WebhookEvent, data: any, metadata?: Record<string, any>): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date(),
      data,
      metadata
    };

    // Find matching subscriptions
    const subscribers = Array.from(this.subscriptions.values()).filter(
      sub => sub.active && sub.events.includes(event)
    );

    // Queue deliveries
    for (const subscriber of subscribers) {
      const delivery: WebhookDelivery = {
        id: this.generateId(),
        subscriptionId: subscriber.id,
        event,
        payload,
        url: subscriber.url,
        attempt: 0,
        maxAttempts: this.config.maxAttempts,
        status: 'pending'
      };

      this.deliveries.push(delivery);
      this.eventQueue.push(payload);
    }

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Get delivery status
   */
  getDelivery(deliveryId: string): WebhookDelivery | null {
    return this.deliveries.find(d => d.id === deliveryId) || null;
  }

  /**
   * Get deliveries for subscription
   */
  getDeliveries(subscriptionId: string, limit = 100): WebhookDelivery[] {
    return this.deliveries
      .filter(d => d.subscriptionId === subscriptionId)
      .slice(-limit);
  }

  /**
   * Get failed deliveries
   */
  getFailedDeliveries(): WebhookDelivery[] {
    return this.deliveries.filter(d => d.status === 'failed');
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery || delivery.status !== 'failed') return;

    delivery.status = 'pending';
    delivery.attempt = 0;
    delivery.error = undefined;

    // Process immediately
    await this.deliverWebhook(delivery);
  }

  /**
   * Get webhook statistics
   */
  getStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    pendingDeliveries: number;
    successRate: number;
  } {
    const totalDeliveries = this.deliveries.length;
    const successful = this.deliveries.filter(d => d.status === 'success').length;
    const failed = this.deliveries.filter(d => d.status === 'failed').length;
    const pending = this.deliveries.filter(d => d.status === 'pending' || d.status === 'retrying').length;

    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: Array.from(this.subscriptions.values()).filter(s => s.active).length,
      totalDeliveries,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      pendingDeliveries: pending,
      successRate: totalDeliveries > 0 ? successful / totalDeliveries : 0
    };
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const pending = this.deliveries.filter(d => d.status === 'pending');

      for (const delivery of pending) {
        await this.deliverWebhook(delivery);
        
        // Add delay between batches
        if (pending.indexOf(delivery) % this.config.batchSize === 0) {
          await this.delay(this.config.batchDelay);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Deliver webhook with retries
   */
  private async deliverWebhook(delivery: WebhookDelivery): Promise<void> {
    const subscription = this.subscriptions.get(delivery.subscriptionId);
    if (!subscription) {
      delivery.status = 'failed';
      delivery.error = 'Subscription not found';
      return;
    }

    delivery.attempt++;
    delivery.status = delivery.attempt > 1 ? 'retrying' : 'pending';

    try {
      const startTime = Date.now();

      // In production, use fetch or axios
      // For now, simulate webhook delivery
      const success = await this.simulateWebhookDelivery(
        delivery.url,
        delivery.payload,
        subscription.secret
      );

      delivery.responseTime = Date.now() - startTime;
      delivery.sentAt = new Date();

      if (success) {
        delivery.status = 'success';
        delivery.statusCode = 200;
      } else {
        throw new Error('Delivery failed');
      }

    } catch (error) {
      delivery.error = error instanceof Error ? error.message : String(error);
      delivery.statusCode = 500;

      // Retry with exponential backoff
      if (delivery.attempt < delivery.maxAttempts) {
        const retryDelay = Math.min(
          this.config.retryDelay * Math.pow(2, delivery.attempt - 1),
          this.config.maxRetryDelay
        );

        await this.delay(retryDelay);
        await this.deliverWebhook(delivery);
      } else {
        delivery.status = 'failed';
      }
    }
  }

  /**
   * Simulate webhook delivery (replace with actual HTTP request)
   */
  private async simulateWebhookDelivery(
    url: string,
    payload: WebhookPayload,
    secret?: string
  ): Promise<boolean> {
    // In production, use fetch:
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Webhook-Signature': secret ? this.generateSignature(payload, secret) : ''
    //   },
    //   body: JSON.stringify(payload),
    //   timeout: this.config.timeout
    // });
    // return response.ok;

    // Simulate success/failure
    console.log(`[Webhook] Delivering to ${url}:`, payload.event);
    return Math.random() > 0.1; // 90% success rate
  }

  /**
   * Generate webhook signature (HMAC)
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    // In production, use crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
    return 'simulated-signature';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Webhook event helpers
 */
export class WebhookEvents {
  private manager: WebhookManager;

  constructor(manager: WebhookManager) {
    this.manager = manager;
  }

  /**
   * Emit feedback received event
   */
  async feedbackReceived(data: {
    requestId: string;
    userId?: string;
    type: string;
    value: any;
  }): Promise<void> {
    await this.manager.emit('feedback.received', data);

    // Also emit specific event
    if (data.type === 'thumbs') {
      const event = data.value === 'up' ? 'feedback.thumbs_up' : 'feedback.thumbs_down';
      await this.manager.emit(event, data);
    } else if (data.type === 'rating') {
      await this.manager.emit('feedback.rating', data);
    } else if (data.type === 'suggestion') {
      await this.manager.emit('feedback.suggestion', data);
    }
  }

  /**
   * Emit learning insight generated
   */
  async insightGenerated(insight: any): Promise<void> {
    await this.manager.emit('learning.insight_generated', insight);
  }

  /**
   * Emit suggestion created
   */
  async suggestionCreated(suggestion: any): Promise<void> {
    await this.manager.emit('learning.suggestion_created', suggestion);
  }

  /**
   * Emit suggestion approved
   */
  async suggestionApproved(suggestionId: string, approvedBy: string): Promise<void> {
    await this.manager.emit('learning.suggestion_approved', { suggestionId, approvedBy });
  }

  /**
   * Emit training job started
   */
  async trainingJobStarted(job: any): Promise<void> {
    await this.manager.emit('training.job_started', job);
  }

  /**
   * Emit training job completed
   */
  async trainingJobCompleted(job: any): Promise<void> {
    await this.manager.emit('training.job_completed', job);
  }

  /**
   * Emit training job failed
   */
  async trainingJobFailed(job: any, error: string): Promise<void> {
    await this.manager.emit('training.job_failed', { job, error });
  }

  /**
   * Emit model deployed
   */
  async modelDeployed(modelVersion: string, jobId: string): Promise<void> {
    await this.manager.emit('training.model_deployed', { modelVersion, jobId });
  }

  /**
   * Emit approval required
   */
  async approvalRequired(jobId: string, details: any): Promise<void> {
    await this.manager.emit('training.approval_required', { jobId, ...details });
  }

  /**
   * Emit performance degraded
   */
  async performanceDegraded(metrics: any): Promise<void> {
    await this.manager.emit('system.performance_degraded', metrics);
  }

  /**
   * Emit threshold exceeded
   */
  async thresholdExceeded(threshold: string, current: number, limit: number): Promise<void> {
    await this.manager.emit('system.threshold_exceeded', { threshold, current, limit });
  }
}

export { WebhookManager };

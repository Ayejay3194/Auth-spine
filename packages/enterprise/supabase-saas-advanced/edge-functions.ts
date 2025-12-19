/**
 * Edge Functions for Supabase SaaS Advanced Pack
 * 
 * Provides Deno-based edge functions for webhook verification,
 * rate limiting, signed uploads, and other SaaS operations.
 */

import { EdgeFunction, WebhookConfig, SignedUploadPolicy } from './types.js';

export class EdgeFunctionsManager {
  private functions: Map<string, EdgeFunction> = new Map();
  private webhooks: Map<string, WebhookConfig> = new Map();
  private uploadPolicies: Map<string, SignedUploadPolicy> = new Map();
  private initialized = false;

  /**
   * Initialize edge functions
   */
  async initialize(): Promise<void> {
    this.loadDefaultFunctions();
    this.initialized = true;
  }

  /**
   * Deploy edge function
   */
  async deploy(functionData: {
    name: string;
    description: string;
    runtime: 'deno' | 'nodejs';
    entryPoint: string;
    environment?: Record<string, string>;
    secrets?: string[];
    tenantIsolated?: boolean;
    rateLimit?: {
      requestsPerMinute: number;
      burstLimit: number;
    };
  }): Promise<EdgeFunction> {
    const edgeFunction: EdgeFunction = {
      id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: functionData.name,
      description: functionData.description,
      runtime: functionData.runtime,
      entryPoint: functionData.entryPoint,
      environment: functionData.environment || {},
      secrets: functionData.secrets || [],
      enabled: true,
      tenantIsolated: functionData.tenantIsolated || false,
      rateLimit: functionData.rateLimit,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.functions.set(edgeFunction.id, edgeFunction);
    return edgeFunction;
  }

  /**
   * Get all functions
   */
  getAllFunctions(): EdgeFunction[] {
    return Array.from(this.functions.values());
  }

  /**
   * Get function by ID
   */
  getFunction(functionId: string): EdgeFunction | undefined {
    return this.functions.get(functionId);
  }

  /**
   * Enable/disable function
   */
  toggleFunction(functionId: string, enabled: boolean): void {
    const func = this.functions.get(functionId);
    if (func) {
      func.enabled = enabled;
      func.updatedAt = new Date();
    }
  }

  /**
   * Delete function
   */
  deleteFunction(functionId: string): boolean {
    return this.functions.delete(functionId);
  }

  /**
   * Generate signed upload URL
   */
  async generateSignedUploadURL(tenantId: string, options: {
    bucket: string;
    key: string;
    expiresIn?: number;
    maxFileSize?: number;
    allowedTypes?: string[];
    conditions?: Array<{
      operation: string;
      value: string;
    }>;
  }): Promise<{
    url: string;
    fields: Record<string, string>;
    expiresAt: Date;
  }> {
    const expiresIn = options.expiresIn || 3600; // 1 hour default
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    const policy: SignedUploadPolicy = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      bucket: options.bucket,
      key: options.key,
      expiresAt,
      conditions: options.conditions || [],
      maxFileSize: options.maxFileSize || 10485760, // 10MB default
      allowedTypes: options.allowedTypes || ['image/*', 'application/pdf'],
      createdAt: new Date()
    };

    this.uploadPolicies.set(policy.id, policy);

    // Generate signed URL and fields
    const url = `https://${options.bucket}.supabase.co/storage/v1/upload`;
    const fields = {
      key: options.key,
      policy: this.generatePolicyString(policy),
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      'x-amz-credential': this.generateCredential(),
      'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''),
      'x-amz-signature': this.generateSignature(policy)
    };

    return { url, fields, expiresAt };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHMAC(payload, secret);
    return signature === expectedSignature;
  }

  /**
   * Create webhook configuration
   */
  createWebhook(webhookData: {
    tenantId: string;
    url: string;
    secret: string;
    events: string[];
    retryPolicy?: {
      maxRetries: number;
      backoffMs: number;
    };
  }): WebhookConfig {
    const webhook: WebhookConfig = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: webhookData.tenantId,
      url: webhookData.url,
      secret: webhookData.secret,
      events: webhookData.events,
      isActive: true,
      retryPolicy: webhookData.retryPolicy || {
        maxRetries: 3,
        backoffMs: 1000
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Get webhooks by tenant
   */
  getWebhooksByTenant(tenantId: string): WebhookConfig[] {
    return Array.from(this.webhooks.values()).filter(webhook => 
      webhook.tenantId === tenantId
    );
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(webhookId: string, data: any): Promise<{
    success: boolean;
    attempts: number;
    error?: string;
  }> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || !webhook.isActive) {
      return { success: false, attempts: 0, error: 'Webhook not found or inactive' };
    }

    let attempts = 0;
    let lastError: string | undefined;

    for (let i = 0; i <= webhook.retryPolicy.maxRetries; i++) {
      attempts++;
      
      try {
        const payload = JSON.stringify(data);
        const signature = this.generateHMAC(payload, webhook.secret);
        
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-ID': webhook.id
          },
          body: payload
        });

        if (response.ok) {
          return { success: true, attempts };
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Wait before retry
      if (i < webhook.retryPolicy.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, webhook.retryPolicy.backoffMs * (i + 1)));
      }
    }

    return { success: false, attempts, error: lastError };
  }

  /**
   * Cleanup expired upload policies
   */
  cleanupExpiredPolicies(): number {
    let deletedCount = 0;
    const now = new Date();

    for (const [id, policy] of this.uploadPolicies.entries()) {
      if (policy.expiresAt < now) {
        this.uploadPolicies.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  private loadDefaultFunctions(): void {
    // Load default edge functions
    this.deploy({
      name: 'webhook-verify',
      description: 'Verify webhook signatures with HMAC and replay protection',
      runtime: 'deno',
      entryPoint: 'webhook-verify/index.ts',
      environment: {
        REPLAY_WINDOW: '300000' // 5 minutes
      },
      secrets: ['WEBHOOK_SECRET'],
      tenantIsolated: true
    });

    this.deploy({
      name: 'rate-limit',
      description: 'Per-tenant and per-key rate limiting',
      runtime: 'deno',
      entryPoint: 'rate-limit/index.ts',
      environment: {
        REDIS_URL: 'redis://localhost:6379',
        DEFAULT_LIMIT: '100',
        DEFAULT_BURST: '200'
      },
      tenantIsolated: true,
      rateLimit: {
        requestsPerMinute: 1000,
        burstLimit: 2000
      }
    });

    this.deploy({
      name: 'signed-upload',
      description: 'Generate signed upload URLs with policies',
      runtime: 'deno',
      entryPoint: 'signed-upload/index.ts',
      environment: {
        STORAGE_URL: 'https://your-project.supabase.co/storage/v1',
        DEFAULT_MAX_SIZE: '10485760'
      },
      tenantIsolated: true
    });

    this.deploy({
      name: 'cron-quota-sweep',
      description: 'Scheduled quota enforcement job',
      runtime: 'deno',
      entryPoint: 'cron-quota-sweep/index.ts',
      environment: {
        ENFORCEMENT_MODE: 'strict',
        NOTIFICATION_WEBHOOK: 'https://your-app.com/webhooks/quota'
      },
      tenantIsolated: false
    });

    this.deploy({
      name: 'admin-support-jit',
      description: 'Support access request/approve/expire system',
      runtime: 'deno',
      entryPoint: 'admin-support-jit/index.ts',
      environment: {
        ACCESS_DURATION: '3600',
        APPROVAL_WEBHOOK: 'https://your-app.com/webhooks/support-access'
      },
      secrets: ['ADMIN_JWT_SECRET'],
      tenantIsolated: false
    });
  }

  private generatePolicyString(policy: SignedUploadPolicy): string {
    const policyData = {
      expiration: policy.expiresAt.toISOString(),
      conditions: [
        { bucket: policy.bucket },
        { key: policy.key },
        ['content-length-range', 0, policy.maxFileSize],
        ...policy.conditions.map(c => [c.operation, c.value])
      ]
    };

    return btoa(JSON.stringify(policyData));
  }

  private generateCredential(): string {
    const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    return `your-access-key/${date}/auto/s3/aws4_request`;
  }

  private generateSignature(policy: SignedUploadPolicy): string {
    // Simple signature generation - use AWS SDK in production
    return btoa(JSON.stringify(policy)).substring(0, 64);
  }

  private generateHMAC(payload: string, secret: string): string {
    // Simple HMAC generation - use crypto library in production
    const combined = payload + secret;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
  }
}

// Export singleton instance
export const edgeFunctions = new EdgeFunctionsManager();

/**
 * API Integrations for Supabase SaaS Features Pack
 * 
 * Provides API integrations including rate limiting, webhooks,
 * REST API, and GraphQL capabilities.
 */

import { APIIntegration, WebhookConfiguration } from './types.js';

export class APIIntegrationsManager {
  private supabaseClient: any;
  private config: any;
  private integrations: Map<string, APIIntegration> = new Map();
  private webhooks: Map<string, WebhookConfiguration> = new Map();
  private rateLimiters: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize API integrations
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    this.config = config;
    await this.loadIntegrations();
    await this.setupRateLimiting();
    await this.setupWebhooks();
    this.initialized = true;
  }

  /**
   * Create API integration
   */
  async createIntegration(integrationData: {
    name: string;
    type: 'webhook' | 'rest' | 'graphql' | 'websocket';
    endpoint: string;
    authentication: {
      type: 'bearer' | 'basic' | 'api_key' | 'oauth';
      credentials: Record<string, string>;
    };
    rateLimit?: {
      requests: number;
      window: number;
      burst?: number;
    };
    configuration?: Record<string, any>;
  }): Promise<APIIntegration> {
    const integrationId = this.generateIntegrationId();
    
    const integration: APIIntegration = {
      id: integrationId,
      name: integrationData.name,
      type: integrationData.type,
      endpoint: integrationData.endpoint,
      authentication: integrationData.authentication,
      rateLimit: integrationData.rateLimit || {
        requests: 100,
        window: 60000,
        burst: 150
      },
      webhooks: [],
      status: 'active'
    };

    try {
      // Store integration
      await this.storeIntegration(integration);
      this.integrations.set(integrationId, integration);

      // Setup rate limiting
      if (this.config.enableRateLimiting) {
        await this.setupRateLimiter(integrationId, integration.rateLimit);
      }

      return integration;
    } catch (error) {
      console.error('Failed to create integration:', error);
      throw error;
    }
  }

  /**
   * Get integration
   */
  async getIntegration(integrationId: string): Promise<APIIntegration | null> {
    const cached = this.integrations.get(integrationId);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabaseClient
        .from('api_integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (error || !data) return null;

      const integration = this.mapIntegrationFromDB(data);
      this.integrations.set(integrationId, integration);
      return integration;
    } catch (error) {
      console.error('Failed to get integration:', error);
      return null;
    }
  }

  /**
   * Update integration
   */
  async updateIntegration(integrationId: string, updates: Partial<APIIntegration>): Promise<APIIntegration> {
    const existing = await this.getIntegration(integrationId);
    if (!existing) {
      throw new Error('Integration not found');
    }

    const updated = { ...existing, ...updates };

    try {
      await this.updateIntegrationRecord(updated);
      this.integrations.set(integrationId, updated);
      return updated;
    } catch (error) {
      console.error('Failed to update integration:', error);
      throw error;
    }
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    try {
      await this.deleteIntegrationRecord(integrationId);
      this.integrations.delete(integrationId);
      this.rateLimiters.delete(integrationId);
    } catch (error) {
      console.error('Failed to delete integration:', error);
      throw error;
    }
  }

  /**
   * Send webhook
   */
  async sendWebhook(event: string, data: any, options: {
    integrationId?: string;
    retries?: number;
    timeout?: number;
  } = {}): Promise<{
    success: boolean;
    attempts: number;
    results: Array<{
      integrationId: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    if (!this.config.enableWebhooks) {
      throw new Error('Webhooks not enabled');
    }

    const integrations = options.integrationId 
      ? [await this.getIntegration(options.integrationId)].filter(Boolean) as APIIntegration[]
      : Array.from(this.integrations.values()).filter(i => i.type === 'webhook');

    const results = [];
    let overallSuccess = true;

    for (const integration of integrations) {
      try {
        const result = await this.sendWebhookToIntegration(integration, event, data, options);
        results.push(result);
        
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        results.push({
          integrationId: integration.id,
          success: false,
          error: error.message
        });
        overallSuccess = false;
      }
    }

    return {
      success: overallSuccess,
      attempts: results.length,
      results
    };
  }

  /**
   * Make API call
   */
  async makeAPICall(integrationId: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  } = {}): Promise<{
    data: any;
    status: number;
    headers: Record<string, string>;
  }> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Check rate limit
    if (this.config.enableRateLimiting) {
      const canProceed = await this.checkRateLimit(integrationId);
      if (!canProceed) {
        throw new Error('Rate limit exceeded');
      }
    }

    try {
      const url = options.path ? `${integration.endpoint}/${options.path}` : integration.endpoint;
      const queryString = options.query ? `?${new URLSearchParams(options.query).toString()}` : '';
      const fullUrl = `${url}${queryString}`;

      const headers = {
        'Content-Type': 'application/json',
        ...this.buildAuthHeaders(integration.authentication),
        ...options.headers
      };

      const response = await fetch(fullUrl, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const data = await response.json();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data,
        status: response.status,
        headers: responseHeaders
      };
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    webhookCalls: number;
    apiCalls: number;
    errors: number;
    avgResponseTime: number;
  }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('api_integration_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const metrics = data || [];
      return {
        totalIntegrations: this.integrations.size,
        activeIntegrations: Array.from(this.integrations.values()).filter(i => i.status === 'active').length,
        webhookCalls: metrics.filter((m: any) => m.type === 'webhook').length,
        apiCalls: metrics.filter((m: any) => m.type === 'api').length,
        errors: metrics.filter((m: any) => m.status >= 400).length,
        avgResponseTime: metrics.reduce((sum: number, m: any) => sum + (m.response_time || 0), 0) / metrics.length || 0
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return {
        totalIntegrations: 0,
        activeIntegrations: 0,
        webhookCalls: 0,
        apiCalls: 0,
        errors: 0,
        avgResponseTime: 0
      };
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate SQL scripts
   */
  generateSQL(): string {
    return `
-- Supabase SaaS Features - API Integrations
-- Generated on ${new Date().toISOString()}

-- API integrations table
CREATE TABLE IF NOT EXISTS api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('webhook', 'rest', 'graphql', 'websocket')),
  endpoint TEXT NOT NULL,
  authentication JSONB NOT NULL,
  rate_limit JSONB DEFAULT '{"requests": 100, "window": 60000}',
  configuration JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook configurations table
CREATE TABLE IF NOT EXISTS webhook_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES api_integrations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  retries INTEGER DEFAULT 3,
  timeout INTEGER DEFAULT 10000,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API call logs table
CREATE TABLE IF NOT EXISTS api_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES api_integrations(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  status INTEGER NOT NULL,
  response_time INTEGER, -- milliseconds
  request_size INTEGER,
  response_size INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES api_integrations(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL, -- IP, user ID, etc.
  requests INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, identifier, window_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_integrations_type ON api_integrations(type);
CREATE INDEX IF NOT EXISTS idx_api_integrations_status ON api_integrations(status);
CREATE INDEX IF NOT EXISTS idx_webhook_configurations_integration_id ON webhook_configurations(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configurations_event ON webhook_configurations(event);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_integration_id ON api_call_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_created_at ON api_call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_integration_id ON rate_limits(integration_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Row Level Security
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own integrations" ON api_integrations
FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::UUID
);

CREATE POLICY "Users can manage their own integrations" ON api_integrations
FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id', true)::UUID
);

CREATE POLICY "Service role has full access to integrations" ON api_integrations
FOR ALL USING (auth.role() = 'service_role');

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  integration_id UUID,
  identifier TEXT DEFAULT 'anonymous',
  max_requests INTEGER DEFAULT 100,
  window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  -- Get or create rate limit record
  INSERT INTO rate_limits (integration_id, identifier, window_start)
  VALUES (integration_id, identifier, NOW())
  ON CONFLICT (integration_id, identifier, window_start)
  DO UPDATE SET requests = rate_limits.requests + 1
  RETURNING requests INTO current_count;
  
  -- Check if limit exceeded
  IF current_count > max_requests THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Webhook signature verification function
CREATE OR REPLACE FUNCTION verify_webhook_signature(
  payload TEXT,
  signature TEXT,
  secret TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- This would implement HMAC verification
  -- For now, return true as placeholder
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- API call logging function
CREATE OR REPLACE FUNCTION log_api_call(
  integration_id UUID,
  method TEXT,
  url TEXT,
  status INTEGER,
  response_time INTEGER,
  request_size INTEGER DEFAULT NULL,
  response_size INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api_call_logs (
    integration_id, method, url, status, response_time, 
    request_size, response_size, error_message
  ) VALUES (
    integration_id, method, url, status, response_time,
    request_size, response_size, error_message
  );
END;
$$ LANGUAGE plpgsql;

-- Cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule('api-cleanup', '0 * * * *', 'SELECT cleanup_rate_limits();');

-- Grant permissions
GRANT SELECT ON api_integrations TO authenticated;
GRANT INSERT ON api_integrations TO authenticated;
GRANT UPDATE ON api_integrations TO authenticated;
GRANT DELETE ON api_integrations TO authenticated;

GRANT SELECT ON webhook_configurations TO authenticated;
GRANT INSERT ON webhook_configurations TO authenticated;
GRANT UPDATE ON webhook_configurations TO authenticated;
GRANT DELETE ON webhook_configurations TO authenticated;

GRANT SELECT ON api_call_logs TO authenticated;
GRANT INSERT ON api_call_logs TO authenticated;

GRANT ALL ON api_integrations TO service_role;
GRANT ALL ON webhook_configurations TO service_role;
GRANT ALL ON api_call_logs TO service_role;
GRANT ALL ON rate_limits TO service_role;

GRANT EXECUTE ON FUNCTION check_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_webhook_signature(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_api_call(UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limits() TO service_role;
`;
  }

  private async loadIntegrations(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient
        .from('api_integrations')
        .select('*');

      if (error) throw error;

      (data || []).forEach((integrationData: any) => {
        const integration = this.mapIntegrationFromDB(integrationData);
        this.integrations.set(integration.id, integration);
      });
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  }

  private async setupRateLimiting(): Promise<void> {
    if (!this.config.enableRateLimiting) {
      return;
    }

    console.log('Setting up rate limiting');
  }

  private async setupWebhooks(): Promise<void> {
    if (!this.config.enableWebhooks) {
      return;
    }

    console.log('Setting up webhooks');
  }

  private async setupRateLimiter(integrationId: string, rateLimit: any): Promise<void> {
    // Setup rate limiter for integration
    this.rateLimiters.set(integrationId, {
      requests: rateLimit.requests,
      window: rateLimit.window,
      burst: rateLimit.burst
    });
  }

  private async checkRateLimit(integrationId: string): Promise<boolean> {
    const rateLimiter = this.rateLimiters.get(integrationId);
    if (!rateLimiter) {
      return true;
    }

    // Check rate limit using database function
    const { data, error } = await this.supabaseClient.rpc('check_rate_limit', {
      integration_id: integrationId,
      max_requests: rateLimiter.requests,
      window_seconds: Math.floor(rateLimiter.window / 1000)
    });

    if (error) throw error;

    return data;
  }

  private async sendWebhookToIntegration(
    integration: APIIntegration, 
    event: string, 
    data: any, 
    options: any
  ): Promise<{
    integrationId: string;
    success: boolean;
    error?: string;
  }> {
    const retries = options.retries || 3;
    const timeout = options.timeout || 10000;
    let lastError: string | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const payload = {
          event,
          data,
          timestamp: new Date().toISOString(),
          attempt: attempt + 1
        };

        const signature = this.generateSignature(JSON.stringify(payload), integration.authentication.credentials.secret || '');

        const response = await fetch(integration.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Supabase-SaaS-Features/1.0',
            'X-Webhook-Signature': signature,
            ...this.buildAuthHeaders(integration.authentication)
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeout)
        });

        if (response.ok) {
          // Log successful webhook
          await this.logWebhookCall(integration.id, event, response.status, 0);
          
          return {
            integrationId: integration.id,
            success: true
          };
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        lastError = error.message;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Log failed webhook
    await this.logWebhookCall(integration.id, event, 0, 0, lastError);

    return {
      integrationId: integration.id,
      success: false,
      error: lastError
    };
  }

  private buildAuthHeaders(authentication: any): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (authentication.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${authentication.credentials.token}`;
        break;
      case 'basic':
        const encoded = btoa(`${authentication.credentials.username}:${authentication.credentials.password}`);
        headers['Authorization'] = `Basic ${encoded}`;
        break;
      case 'api_key':
        headers[authentication.credentials.header || 'X-API-Key'] = authentication.credentials.key;
        break;
      case 'oauth':
        headers['Authorization'] = `Bearer ${authentication.credentials.access_token}`;
        break;
    }

    return headers;
  }

  private generateSignature(payload: string, secret: string): string {
    // Generate HMAC signature for webhook verification
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    return crypto.subtle.sign('HMAC', keyData, messageData).then(signature => {
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }) as any;
  }

  private async logWebhookCall(
    integrationId: string, 
    event: string, 
    status: number, 
    responseTime: number, 
    error?: string
  ): Promise<void> {
    try {
      await this.supabaseClient.rpc('log_api_call', {
        integration_id: integrationId,
        method: 'POST',
        url: 'webhook',
        status,
        response_time: responseTime,
        error_message: error
      });
    } catch (logError) {
      console.error('Failed to log webhook call:', logError);
    }
  }

  private async storeIntegration(integration: APIIntegration): Promise<void> {
    const { error } = await this.supabaseClient
      .from('api_integrations')
      .insert({
        id: integration.id,
        name: integration.name,
        type: integration.type,
        endpoint: integration.endpoint,
        authentication: integration.authentication,
        rate_limit: integration.rateLimit,
        configuration: {},
        status: integration.status
      });

    if (error) throw error;
  }

  private async updateIntegrationRecord(integration: APIIntegration): Promise<void> {
    const { error } = await this.supabaseClient
      .from('api_integrations')
      .update({
        name: integration.name,
        type: integration.type,
        endpoint: integration.endpoint,
        authentication: integration.authentication,
        rate_limit: integration.rateLimit,
        configuration: {},
        status: integration.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id);

    if (error) throw error;
  }

  private async deleteIntegrationRecord(integrationId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('api_integrations')
      .delete()
      .eq('id', integrationId);

    if (error) throw error;
  }

  private mapIntegrationFromDB(data: any): APIIntegration {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      endpoint: data.endpoint,
      authentication: data.authentication,
      rateLimit: data.rate_limit,
      webhooks: [],
      status: data.status
    };
  }

  private generateIntegrationId(): string {
    return `integration_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const apiIntegrations = new APIIntegrationsManager();

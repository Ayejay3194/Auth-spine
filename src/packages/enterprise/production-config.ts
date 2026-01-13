/**
 * Production Configuration for Supabase Security & Architecture Pack
 * 
 * Provides production-safe defaults, SSL configuration, backup,
 * monitoring, alerts, and rate limiting for luxury booking platforms.
 */

import { ProductionConfig } from './types.js';

export class ProductionConfigManager {
  private config: ProductionConfig;
  private monitoring: Map<string, any> = new Map();
  private alerts: Map<string, any> = new Map();
  private rateLimiters: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize production configuration
   */
  async initialize(config: ProductionConfig): Promise<void> {
    this.config = config;
    this.loadDefaultMonitoring();
    this.loadDefaultAlerts();
    this.loadDefaultRateLimiters();
    this.initialized = true;
  }

  /**
   * Get SSL configuration
   */
  getSSLConfig(): {
    enabled: boolean;
    certificatePath?: string;
    privateKeyPath?: string;
    protocols: string[];
    ciphers: string[];
  } {
    return {
      enabled: this.config.enableSSL,
      certificatePath: '/etc/ssl/certs/supabase.crt',
      privateKeyPath: '/etc/ssl/private/supabase.key',
      protocols: ['TLSv1.2', 'TLSv1.3'],
      ciphers: [
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305'
      ]
    };
  }

  /**
   * Get backup configuration
   */
  getBackupConfig(): {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    retention: number;
    compression: boolean;
    encryption: boolean;
    destination: 'local' | 's3' | 'gcs';
    destinationConfig: Record<string, any>;
  } {
    return {
      enabled: this.config.enableBackup,
      frequency: 'daily',
      retention: this.config.backupRetention,
      compression: true,
      encryption: true,
      destination: 's3',
      destinationConfig: {
        bucket: 'supabase-backups',
        region: 'us-west-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    };
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): {
    enabled: boolean;
    metrics: {
      performance: boolean;
      security: boolean;
      usage: boolean;
      errors: boolean;
    };
    endpoints: string[];
    interval: number;
  } {
    return {
      enabled: this.config.enableMonitoring,
      metrics: {
        performance: true,
        security: true,
        usage: true,
        errors: true
      },
      endpoints: [
        '/health',
        '/metrics',
        '/status',
        '/security/metrics'
      ],
      interval: 30000 // 30 seconds
    };
  }

  /**
   * Get alert configuration
   */
  getAlertConfig(): {
    enabled: boolean;
    channels: {
      email: string[];
      slack: string[];
      webhook: string[];
    };
    thresholds: {
      errorRate: number;
      responseTime: number;
      authFailures: number;
      storageUsage: number;
    };
  } {
    return {
      enabled: this.config.enableAlerts,
      channels: {
        email: ['admin@luxurybooking.com', 'devops@luxurybooking.com'],
        slack: ['https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'],
        webhook: ['https://your-monitoring-system.com/webhooks/alerts']
      },
      thresholds: {
        errorRate: 5.0, // 5%
        responseTime: 2000, // 2 seconds
        authFailures: 10, // 10 failures per minute
        storageUsage: 80.0 // 80%
      }
    };
  }

  /**
   * Get rate limiting configuration
   */
  getRateLimitConfig(): {
    enabled: boolean;
    rules: Array<{
      name: string;
      limit: number;
      window: number;
      scope: 'global' | 'per_ip' | 'per_user' | 'per_tenant';
    }>;
  } {
    return {
      enabled: this.config.enableRateLimiting,
      rules: [
        {
          name: 'api_requests',
          limit: 1000,
          window: 60000, // 1 minute
          scope: 'per_user'
        },
        {
          name: 'auth_attempts',
          limit: 5,
          window: 900000, // 15 minutes
          scope: 'per_ip'
        },
        {
          name: 'file_uploads',
          limit: 10,
          window: 60000, // 1 minute
          scope: 'per_user'
        },
        {
          name: 'database_queries',
          limit: 10000,
          window: 60000, // 1 minute
          scope: 'per_tenant'
        }
      ]
    };
  }

  /**
   * Get CORS configuration
   */
  getCORSConfig(): {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  } {
    return {
      enabled: this.config.enableCORS,
      allowedOrigins: this.config.allowedOrigins,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Client-Info',
        'X-Tenant-ID',
        'apikey'
      ],
      credentials: true,
      maxAge: 86400 // 24 hours
    };
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(ruleName: string, identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    if (!this.config.enableRateLimiting) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000)
      };
    }

    const rule = this.getRateLimitConfig().rules.find(r => r.name === ruleName);
    if (!rule) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000)
      };
    }

    const key = `${ruleName}:${identifier}`;
    const limiter = this.rateLimiters.get(key) || {
      count: 0,
      resetTime: new Date(Date.now() + rule.window)
    };

    // Reset if window expired
    if (new Date() > limiter.resetTime) {
      limiter.count = 0;
      limiter.resetTime = new Date(Date.now() + rule.window);
    }

    const allowed = limiter.count < rule.limit;
    if (allowed) {
      limiter.count++;
    }

    this.rateLimiters.set(key, limiter);

    return {
      allowed,
      remaining: Math.max(0, rule.limit - limiter.count),
      resetTime: limiter.resetTime
    };
  }

  /**
   * Trigger alert
   */
  async triggerAlert(alert: {
    type: 'error' | 'security' | 'performance' | 'usage';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: Record<string, any>;
  }): Promise<void> {
    if (!this.config.enableAlerts) return;

    const alertConfig = this.getAlertConfig();
    const alertId = this.generateAlertId();

    const alertData = {
      id: alertId,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      details: alert.details || {},
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alertId, alertData);

    // Send to all channels
    await this.sendAlertToChannels(alertData, alertConfig.channels);
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate production configuration SQL
   */
  generateProductionSQL(): string {
    return `
-- Supabase Security - Production Configuration
-- Generated on ${new Date().toISOString()}

-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/supabase.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/supabase.key';

-- Configure connection limits
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET superuser_reserved_connections = 3;

-- Set timezone
ALTER SYSTEM SET timezone = 'UTC';

-- Enable logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Configure shared buffers
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Enable pg_stat_statements for monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Configure monitoring views
CREATE VIEW production_metrics AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables;

-- Create backup function
CREATE OR REPLACE FUNCTION production.create_backup()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_name text;
BEGIN
  backup_name := 'backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS');
  
  -- Create backup
  EXECUTE format('CREATE TABLE %s AS SELECT * FROM users', backup_name);
  
  -- Log backup creation
  INSERT INTO production.backup_logs (backup_name, created_at, success)
  VALUES (backup_name, now(), true);
  
  RETURN backup_name;
END;
$$;

-- Create backup logs table
CREATE TABLE IF NOT EXISTS production.backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  success boolean DEFAULT false,
  size_bytes bigint,
  error_message text
);

-- Enable RLS on backup logs
ALTER TABLE production.backup_logs ENABLE ROW LEVEL SECURITY;

-- Create production schema
CREATE SCHEMA IF NOT EXISTS production;

-- Create monitoring functions
CREATE OR REPLACE FUNCTION production.check_system_health()
RETURNS TABLE(
  metric text,
  value numeric,
  status text,
  threshold numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'database_size'::text,
    pg_database_size(current_database())::numeric,
    CASE 
      WHEN pg_database_size(current_database()) > 10737418240 THEN 'warning'::text
      ELSE 'ok'::text
    END,
    10737418240::numeric
  UNION ALL
  SELECT 
    'active_connections'::text,
    count(*)::numeric,
    CASE 
      WHEN count(*) > 180 THEN 'warning'::text
      ELSE 'ok'::text
    END,
    180::numeric
  FROM pg_stat_activity
  WHERE state = 'active';
END;
$$;
`;
  }

  private async sendAlertToChannels(alert: any, channels: any): Promise<void> {
    // Send email alerts
    for (const email of channels.email) {
      await this.sendEmailAlert(email, alert);
    }

    // Send Slack alerts
    for (const webhook of channels.slack) {
      await this.sendSlackAlert(webhook, alert);
    }

    // Send webhook alerts
    for (const webhook of channels.webhook) {
      await this.sendWebhookAlert(webhook, alert);
    }
  }

  private async sendEmailAlert(email: string, alert: any): Promise<void> {
    // Simulate email sending
    console.log(`[EMAIL ALERT] To: ${email}, Subject: [${alert.severity.toUpperCase()}] ${alert.message}`);
  }

  private async sendSlackAlert(webhook: string, alert: any): Promise<void> {
    // Simulate Slack notification
    console.log(`[SLACK ALERT] Webhook: ${webhook}, Message: [${alert.severity.toUpperCase()}] ${alert.message}`);
  }

  private async sendWebhookAlert(webhook: string, alert: any): Promise<void> {
    // Simulate webhook call
    console.log(`[WEBHOOK ALERT] URL: ${webhook}, Alert: ${alert.message}`);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadDefaultMonitoring(): void {
    // Load default monitoring configuration
    this.monitoring.set('performance', {
      enabled: true,
      metrics: ['response_time', 'throughput', 'error_rate'],
      interval: 30000
    });

    this.monitoring.set('security', {
      enabled: true,
      metrics: ['auth_failures', 'blocked_requests', 'security_events'],
      interval: 60000
    });

    this.monitoring.set('usage', {
      enabled: true,
      metrics: ['active_users', 'storage_usage', 'api_calls'],
      interval: 300000
    });
  }

  private loadDefaultAlerts(): void {
    // Load default alert configuration
    this.alerts.set('error_rate', {
      threshold: 5.0,
      enabled: true,
      severity: 'high'
    });

    this.alerts.set('response_time', {
      threshold: 2000,
      enabled: true,
      severity: 'medium'
    });

    this.alerts.set('auth_failures', {
      threshold: 10,
      enabled: true,
      severity: 'critical'
    });
  }

  private loadDefaultRateLimiters(): void {
    // Initialize rate limiters
    this.rateLimiters.clear();
  }
}

// Export singleton instance
export const productionConfig = new ProductionConfigManager();

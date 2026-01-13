/**
 * Billing Features for Supabase SaaS Features Pack
 * 
 * Provides subscription management, usage tracking, and
 * invoicing capabilities for SaaS applications.
 */

import { BillingConfiguration, BillingPlan, UsageMetric, InvoiceTemplate } from './types.js';

export class BillingFeaturesManager {
  private supabaseClient: any;
  private config: BillingConfiguration;
  private plans: Map<string, BillingPlan> = new Map();
  private usageMetrics: Map<string, UsageMetric> = new Map();
  private initialized = false;

  /**
   * Initialize billing features
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    this.config = {
      subscriptions: {
        enabled: config.enableSubscriptions || true,
        plans: [],
        trials: {
          enabled: true,
          duration: 14,
          features: ['basic_features']
        }
      },
      usage: {
        tracking: config.enableUsageTracking || true,
        metrics: [],
        retention: 2555 // 7 years
      },
      invoicing: {
        enabled: config.enableInvoicing || true,
        provider: 'stripe',
        automation: true,
        templates: []
      }
    };
    
    await this.loadPlans();
    await this.loadUsageMetrics();
    await this.setupBilling();
    this.initialized = true;
  }

  /**
   * Create subscription
   */
  async createSubscription(subscriptionData: {
    tenantId: string;
    planId: string;
    paymentMethodId: string;
    trial?: boolean;
    metadata?: Record<string, any>;
  }): Promise<{
    subscriptionId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }> {
    if (!this.config.subscriptions.enabled) {
      throw new Error('Subscriptions not enabled');
    }

    const plan = this.plans.get(subscriptionData.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    try {
      // Create subscription in database
      const subscriptionId = this.generateSubscriptionId();
      const now = new Date();
      const periodEnd = this.calculatePeriodEnd(now, plan.interval);

      const { data, error } = await this.supabaseClient
        .from('tenant_subscriptions')
        .insert({
          id: subscriptionId,
          tenant_id: subscriptionData.tenantId,
          plan_id: subscriptionData.planId,
          status: subscriptionData.trial ? 'trialing' : 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_end: subscriptionData.trial ? new Date(now.getTime() + this.config.subscriptions.trials.duration * 24 * 60 * 60 * 1000).toISOString() : null,
          metadata: subscriptionData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Create subscription in payment provider
      if (this.config.invoicing.enabled) {
        await this.createProviderSubscription(data, subscriptionData.paymentMethodId);
      }

      return {
        subscriptionId: data.id,
        status: data.status,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end)
      };
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(tenantId: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tenant_subscriptions')
        .select(`
          *,
          billing_plans(*)
        `)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(tenantId: string, updates: {
    planId?: string;
    paymentMethodId?: string;
    cancelAtPeriodEnd?: boolean;
  }): Promise<any> {
    try {
      const subscription = await this.getSubscription(tenantId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const updateData: any = {};
      
      if (updates.planId) {
        updateData.plan_id = updates.planId;
        // Handle plan change logic
        await this.handlePlanChange(subscription, updates.planId);
      }

      if (updates.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
      }

      const { data, error } = await this.supabaseClient
        .from('tenant_subscriptions')
        .update(updateData)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(tenantId: string, immediate: boolean = false): Promise<void> {
    try {
      const subscription = await this.getSubscription(tenantId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (immediate) {
        // Cancel immediately
        await this.supabaseClient
          .from('tenant_subscriptions')
          .update({ status: 'canceled' })
          .eq('tenant_id', tenantId);

        // Cancel in payment provider
        if (this.config.invoicing.enabled) {
          await this.cancelProviderSubscription(subscription);
        }
      } else {
        // Cancel at period end
        await this.supabaseClient
          .from('tenant_subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('tenant_id', tenantId);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Track usage
   */
  async trackUsage(tenantId: string, metric: string, value: number, metadata: any = {}): Promise<void> {
    if (!this.config.usage.tracking) {
      throw new Error('Usage tracking not enabled');
    }

    try {
      const usageMetric = this.usageMetrics.get(metric);
      if (!usageMetric) {
        throw new Error('Usage metric not found');
      }

      // Record usage
      await this.supabaseClient
        .from('tenant_usage')
        .insert({
          tenant_id: tenantId,
          metric_name: metric,
          metric_value: value,
          unit: usageMetric.unit,
          period_start: this.getCurrentPeriodStart().toISOString(),
          period_end: this.getCurrentPeriodEnd().toISOString(),
          metadata
        });

      // Check if tenant exceeds limits
      await this.checkUsageLimits(tenantId, metric, value);
    } catch (error) {
      console.error('Failed to track usage:', error);
      throw error;
    }
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(tenantId?: string): Promise<any> {
    try {
      let query = this.supabaseClient
        .from('tenant_usage')
        .select(`
          metric_name,
          SUM(metric_value) as total_value,
          unit,
          period_start,
          period_end
        `)
        .gte('period_start', this.getCurrentPeriodStart().toISOString())
        .lte('period_end', this.getCurrentPeriodEnd().toISOString())
        .groupBy('metric_name, unit, period_start, period_end');

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get usage metrics:', error);
      return [];
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(tenantId: string, period: { start: Date; end: Date }): Promise<{
    invoiceId: string;
    status: string;
    amount: number;
    currency: string;
    dueDate: Date;
  }> {
    if (!this.config.invoicing.enabled) {
      throw new Error('Invoicing not enabled');
    }

    try {
      const subscription = await this.getSubscription(tenantId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = this.plans.get(subscription.plan_id);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Calculate usage-based charges
      const usageCharges = await this.calculateUsageCharges(tenantId, period);
      
      // Calculate total amount
      const totalAmount = plan.price + usageCharges;

      // Create invoice
      const invoiceId = this.generateInvoiceId();
      const dueDate = new Date(period.end.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const { data, error } = await this.supabaseClient
        .from('invoices')
        .insert({
          id: invoiceId,
          tenant_id: tenantId,
          subscription_id: subscription.id,
          amount: totalAmount,
          currency: plan.currency,
          status: 'draft',
          period_start: period.start.toISOString(),
          period_end: period.end.toISOString(),
          due_date: dueDate.toISOString(),
          line_items: [
            {
              description: `${plan.name} - ${plan.interval}`,
              quantity: 1,
              unit_price: plan.price,
              amount: plan.price
            },
            ...(usageCharges > 0 ? [{
              description: 'Usage charges',
              quantity: 1,
              unit_price: usageCharges,
              amount: usageCharges
            }] : [])
          ]
        })
        .select()
        .single();

      if (error) throw error;

      // Create invoice in payment provider
      if (this.config.invoicing.enabled) {
        await this.createProviderInvoice(data);
      }

      return {
        invoiceId: data.id,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        dueDate: new Date(data.due_date)
      };
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }

  /**
   * Get billing metrics
   */
  async getBillingMetrics(): Promise<{
    revenue: number;
    mrr: number;
    arr: number;
    ltv: number;
  }> {
    try {
      // Mock implementation - would calculate actual metrics
      return {
        revenue: 50000,
        mrr: 10000,
        arr: 120000,
        ltv: 2500
      };
    } catch (error) {
      console.error('Failed to get billing metrics:', error);
      return {
        revenue: 0,
        mrr: 0,
        arr: 0,
        ltv: 0
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
-- Supabase SaaS Features - Billing Features
-- Generated on ${new Date().toISOString()}

-- Billing plans table
CREATE TABLE IF NOT EXISTS billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features TEXT[] DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant subscriptions table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES billing_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void', 'uncollectible')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_method_id TEXT NOT NULL,
  brand TEXT,
  last4 TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage metrics table
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('counter', 'gauge', 'histogram')),
  unit TEXT NOT NULL,
  aggregation TEXT NOT NULL CHECK (aggregation IN ('sum', 'avg', 'max', 'min')),
  retention INTEGER DEFAULT 2555,
  pricing JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant usage table
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL REFERENCES usage_metrics(name),
  metric_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, metric_name, period_start, period_end)
);

-- Billing events table
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_plan_id ON tenant_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_current_period ON tenant_subscriptions(current_period_start, current_period_end);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant_id ON payment_methods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_metric_name ON tenant_usage(metric_name);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_period ON tenant_usage(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_billing_events_tenant_id ON billing_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON billing_events(created_at);

-- Row Level Security
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscriptions" ON tenant_subscriptions
FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Users can view their own invoices" ON invoices
FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Users can manage their own payment methods" ON payment_methods
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Users can view their own usage" ON tenant_usage
FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Service role has full access to billing" ON billing_plans
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to subscriptions" ON tenant_subscriptions
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to invoices" ON invoices
FOR ALL USING (auth.role() = 'service_role');

-- Billing functions
CREATE OR REPLACE FUNCTION calculate_subscription_cost(
  plan_id UUID,
  usage_data JSONB DEFAULT '{}'
)
RETURNS NUMERIC AS $$
DECLARE
  plan_cost NUMERIC;
  usage_cost NUMERIC := 0;
BEGIN
  -- Get base plan cost
  SELECT price INTO plan_cost
  FROM billing_plans
  WHERE id = calculate_subscription_cost.plan_id;
  
  -- Calculate usage-based costs
  FOR metric IN SELECT jsonb_object_keys(usage_data) AS metric_name LOOP
    DECLARE
      metric_usage NUMERIC;
      metric_price NUMERIC;
    BEGIN
      metric_usage := (usage_data ->> metric)::NUMERIC;
      
      SELECT (pricing->>'unit_price')::NUMERIC INTO metric_price
      FROM usage_metrics
      WHERE name = metric;
      
      usage_cost := usage_cost + (metric_usage * metric_price);
    END;
  END LOOP;
  
  RETURN plan_cost + usage_cost;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  month_part := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';
  
  RETURN 'INV-' || year_part || '-' || month_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_usage_limits(
  tenant_id UUID,
  metric_name TEXT,
  additional_usage NUMERIC
)
RETURNS TABLE(
  limit_exceeded BOOLEAN,
  current_usage NUMERIC,
  limit_value NUMERIC
) AS $$
DECLARE
  subscription_record RECORD;
  plan_limits JSONB;
  current_period_usage NUMERIC := 0;
  limit_value NUMERIC;
BEGIN
  -- Get tenant's subscription and plan
  SELECT ts.*, bp.limits INTO subscription_record
  FROM tenant_subscriptions ts
  JOIN billing_plans bp ON ts.plan_id = bp.id
  WHERE ts.tenant_id = check_usage_limits.tenant_id
    AND ts.status = 'active';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0;
    RETURN;
  END IF;
  
  -- Get current usage for this period
  SELECT COALESCE(SUM(metric_value), 0) INTO current_period_usage
  FROM tenant_usage
  WHERE tenant_id = check_usage_limits.tenant_id
    AND metric_name = check_usage_limits.metric_name
    AND period_start >= subscription_record.current_period_start
    AND period_end <= subscription_record.current_period_end;
  
  -- Get limit for this metric
  limit_value := (subscription_record.limits ->> metric_name)::NUMERIC;
  
  -- Check if limit would be exceeded
  RETURN QUERY SELECT 
    (current_period_usage + additional_usage > limit_value) AS limit_exceeded,
    current_period_usage,
    limit_value;
END;
$$ LANGUAGE plpgsql;

-- Insert default billing plans
INSERT INTO billing_plans (name, price, currency, interval, features, limits) VALUES
  ('Free', 0, 'USD', 'month', ARRAY['basic_features', 'support'], '{"users": 3, "storage": 1073741824, "api_calls": 1000}'),
  ('Starter', 29, 'USD', 'month', ARRAY['basic_features', 'api_access', 'email_support'], '{"users": 10, "storage": 10737418240, "api_calls": 10000}'),
  ('Pro', 99, 'USD', 'month', ARRAY['advanced_features', 'api_access', 'priority_support', 'custom_domains'], '{"users": 50, "storage": 107374182400, "api_calls": 100000}'),
  ('Enterprise', 299, 'USD', 'month', ARRAY['all_features', 'dedicated_support', 'sla', 'custom_integrations'], '{"users": 1000, "storage": 1073741824000, "api_calls": 1000000}')
ON CONFLICT DO NOTHING;

-- Insert default usage metrics
INSERT INTO usage_metrics (name, type, unit, aggregation, pricing) VALUES
  ('api_calls', 'counter', 'calls', 'sum', '{"unit_price": 0.001}'),
  ('storage', 'gauge', 'bytes', 'max', '{"unit_price": 0.0000001}'),
  ('bandwidth', 'counter', 'bytes', 'sum', '{"unit_price": 0.0000001}'),
  ('users', 'gauge', 'users', 'max', '{"unit_price": 5}')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT ON billing_plans TO authenticated;
GRANT SELECT ON tenant_subscriptions TO authenticated;
GRANT SELECT ON invoices TO authenticated;
GRANT ALL ON payment_methods TO authenticated;
GRANT SELECT ON tenant_usage TO authenticated;
GRANT SELECT ON billing_events TO authenticated;

GRANT ALL ON billing_plans TO service_role;
GRANT ALL ON tenant_subscriptions TO service_role;
GRANT ALL ON invoices TO service_role;
GRANT ALL ON payment_methods TO service_role;
GRANT ALL ON tenant_usage TO service_role;
GRANT ALL ON billing_events TO service_role;

GRANT EXECUTE ON FUNCTION calculate_subscription_cost(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO service_role;
GRANT EXECUTE ON FUNCTION check_usage_limits(UUID, TEXT, NUMERIC) TO authenticated;
`;
  }

  private async loadPlans(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient
        .from('billing_plans')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      (data || []).forEach((planData: any) => {
        const plan: BillingPlan = {
          id: planData.id,
          name: planData.name,
          price: planData.price,
          currency: planData.currency,
          interval: planData.interval,
          features: planData.features || [],
          limits: planData.limits || {},
          metadata: planData.metadata || {}
        };
        this.plans.set(plan.id, plan);
      });
    } catch (error) {
      console.error('Failed to load billing plans:', error);
    }
  }

  private async loadUsageMetrics(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient
        .from('usage_metrics')
        .select('*');

      if (error) throw error;

      (data || []).forEach((metricData: any) => {
        const metric: UsageMetric = {
          id: metricData.id,
          name: metricData.name,
          type: metricData.type,
          unit: metricData.unit,
          aggregation: metricData.aggregation,
          retention: metricData.retention
        };
        this.usageMetrics.set(metric.name, metric);
      });
    } catch (error) {
      console.error('Failed to load usage metrics:', error);
    }
  }

  private async setupBilling(): Promise<void> {
    console.log('Setting up billing features');
  }

  private calculatePeriodEnd(startDate: Date, interval: string): Date {
    const endDate = new Date(startDate);
    
    if (interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return endDate;
  }

  private getCurrentPeriodStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getCurrentPeriodEnd(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  private async createProviderSubscription(subscription: any, paymentMethodId: string): Promise<void> {
    // Create subscription in payment provider (Stripe, etc.)
    console.log('Creating provider subscription');
  }

  private async handlePlanChange(subscription: any, newPlanId: string): Promise<void> {
    // Handle subscription plan change logic
    console.log('Handling plan change');
  }

  private async cancelProviderSubscription(subscription: any): Promise<void> {
    // Cancel subscription in payment provider
    console.log('Canceling provider subscription');
  }

  private async checkUsageLimits(tenantId: string, metric: string, value: number): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.rpc('check_usage_limits', {
        tenant_id: tenantId,
        metric_name: metric,
        additional_usage: value
      });

      if (error) throw error;

      if (data?.limit_exceeded) {
        // Send notification about limit exceeded
        console.log(`Usage limit exceeded for tenant ${tenantId}, metric ${metric}`);
      }
    } catch (error) {
      console.error('Failed to check usage limits:', error);
    }
  }

  private async calculateUsageCharges(tenantId: string, period: { start: Date; end: Date }): Promise<number> {
    // Calculate usage-based charges
    return 0; // Mock implementation
  }

  private async createProviderInvoice(invoice: any): Promise<void> {
    // Create invoice in payment provider
    console.log('Creating provider invoice');
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateInvoiceId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const billingFeatures = new BillingFeaturesManager();

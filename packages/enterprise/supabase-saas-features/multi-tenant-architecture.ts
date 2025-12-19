/**
 * Multi-Tenant Architecture for Supabase SaaS Features Pack
 * 
 * Provides comprehensive multi-tenancy with schema isolation,
 * tenant provisioning, and management capabilities.
 */

import { Tenant, TenantSettings, MultiTenantEnvironment, TenantProvisioningWorkflow } from './types.js';

export class MultiTenantArchitectureManager {
  private supabaseClient: any;
  private config: any;
  private tenants: Map<string, Tenant> = new Map();
  private schemas: Map<string, any> = new Map();
  private provisioning: Map<string, TenantProvisioningWorkflow> = new Map();
  private initialized = false;

  /**
   * Initialize multi-tenant architecture
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    this.config = config;
    await this.loadTenants();
    await this.setupTenantIsolation();
    this.initialized = true;
  }

  /**
   * Create tenant
   */
  async createTenant(tenantData: {
    name: string;
    slug: string;
    domain?: string;
    customDomain?: string;
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    settings?: any;
  }): Promise<Tenant> {
    const tenantId = this.generateTenantId();
    
    const tenant: Tenant = {
      id: tenantId,
      name: tenantData.name,
      slug: tenantData.slug,
      domain: tenantData.domain,
      customDomain: tenantData.customDomain,
      status: 'trial',
      plan: tenantData.plan,
      settings: tenantData.settings || this.getDefaultSettings(tenantData.plan),
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Start provisioning workflow
      const workflow = await this.startProvisioningWorkflow(tenant);
      this.provisioning.set(tenantId, workflow);

      // Create tenant record
      await this.createTenantRecord(tenant);
      
      // Provision tenant resources
      await this.provisionTenant(tenant);

      // Update tenant status
      tenant.status = 'active';
      await this.updateTenantRecord(tenant);

      this.tenants.set(tenantId, tenant);

      return tenant;
    } catch (error) {
      console.error('Failed to create tenant:', error);
      tenant.status = 'inactive';
      throw error;
    }
  }

  /**
   * Get tenant
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    const cached = this.tenants.get(tenantId);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabaseClient
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error || !data) return null;

      const tenant = this.mapTenantFromDB(data);
      this.tenants.set(tenantId, tenant);
      return tenant;
    } catch (error) {
      console.error('Failed to get tenant:', error);
      return null;
    }
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const existing = await this.getTenant(tenantId);
    if (!existing) {
      throw new Error('Tenant not found');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    try {
      await this.updateTenantRecord(updated);
      this.tenants.set(tenantId, updated);
      return updated;
    } catch (error) {
      console.error('Failed to update tenant:', error);
      throw error;
    }
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    try {
      // Start deprovisioning workflow
      await this.startDeprovisioningWorkflow(tenant);

      // Delete tenant resources
      await this.deprovisionTenant(tenant);

      // Delete tenant record
      await this.deleteTenantRecord(tenantId);

      this.tenants.delete(tenantId);
      this.provisioning.delete(tenantId);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant by identifier
   */
  async getTenantByIdentifier(identifier: string): Promise<Tenant | null> {
    try {
      let query = this.supabaseClient.from('tenants').select('*');
      
      // Check different identifier types based on configuration
      switch (this.config.tenantIdentification) {
        case 'subdomain':
          query = query.eq('slug', identifier);
          break;
        case 'custom_domain':
          query = query.eq('custom_domain', identifier);
          break;
        case 'header':
          // Header-based identification handled at middleware level
          break;
        case 'path':
          query = query.eq('slug', identifier);
          break;
      }

      const { data, error } = await query.single();

      if (error || !data) return null;

      return this.mapTenantFromDB(data);
    } catch (error) {
      console.error('Failed to get tenant by identifier:', error);
      return null;
    }
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<{
    total: number;
    active: number;
    trial: number;
    churned: number;
  }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tenants')
        .select('status');

      if (error) throw error;

      const tenants = data || [];
      return {
        total: tenants.length,
        active: tenants.filter((t: any) => t.status === 'active').length,
        trial: tenants.filter((t: any) => t.status === 'trial').length,
        churned: tenants.filter((t: any) => t.status === 'suspended').length
      };
    } catch (error) {
      console.error('Failed to get tenant metrics:', error);
      return { total: 0, active: 0, trial: 0, churned: 0 };
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
-- Supabase SaaS Features - Multi-Tenant Architecture
-- Generated on ${new Date().toISOString()}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  custom_domain TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'inactive', 'suspended', 'trial')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  permissions JSONB DEFAULT '[]',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create tenant subscriptions table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant usage metrics table
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant audit log table
CREATE TABLE IF NOT EXISTS tenant_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_period ON tenant_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_log_tenant_id ON tenant_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_log_created_at ON tenant_audit_log(created_at);

-- Row Level Security policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit_log ENABLE ROW LEVEL SECURITY;

-- Tenants RLS policies
CREATE POLICY "Users can view their own tenants" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

-- Tenant users RLS policies
CREATE POLICY "Users can view their tenant memberships" ON tenant_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON tenant_users
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role has full access to tenant users" ON tenant_users
  FOR ALL USING (auth.role() = 'service_role');

-- Tenant subscriptions RLS policies
CREATE POLICY "Users can view their tenant subscriptions" ON tenant_subscriptions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to tenant subscriptions" ON tenant_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Tenant usage RLS policies
CREATE POLICY "Users can view their tenant usage" ON tenant_usage
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to tenant usage" ON tenant_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Tenant audit log RLS policies
CREATE POLICY "Users can view their tenant audit logs" ON tenant_audit_log
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to tenant audit logs" ON tenant_audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- Functions for tenant management
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  schema_name TEXT;
BEGIN
  schema_name := 'tenant_' || tenant_id::text;
  
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Grant permissions to the tenant role
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO tenant_%I', schema_name, tenant_id);
  EXECUTE format('GRANT CREATE ON SCHEMA %I TO tenant_%I', schema_name, tenant_id);
  
  -- Create default tables in tenant schema
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  ', schema_name);
  
  EXECUTE format('GRANT ALL ON %I.projects TO tenant_%I', schema_name, tenant_id);
  EXECUTE format('GRANT ALL ON SEQUENCE %I.projects_id_seq TO tenant_%I', schema_name, tenant_id);
  
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION drop_tenant_schema(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  schema_name TEXT;
BEGIN
  schema_name := 'tenant_' || tenant_id::text;
  
  EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
  
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at 
  BEFORE UPDATE ON tenant_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at 
  BEFORE UPDATE ON tenant_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tenant role creation function
CREATE OR REPLACE FUNCTION create_tenant_role(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  role_name TEXT;
BEGIN
  role_name := 'tenant_' || tenant_id::text;
  
  EXECUTE format('CREATE ROLE %I', role_name);
  EXECUTE format('GRANT %I TO authenticated', role_name);
  
END;
$$ LANGUAGE plpgsql;

-- Tenant role deletion function
CREATE OR REPLACE FUNCTION drop_tenant_role(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  role_name TEXT;
BEGIN
  role_name := 'tenant_' || tenant_id::text;
  
  EXECUTE format('DROP ROLE IF EXISTS %I', role_name);
  
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT SELECT ON tenants TO authenticated;
GRANT SELECT ON tenant_users TO authenticated;
GRANT SELECT ON tenant_subscriptions TO authenticated;
GRANT SELECT ON tenant_usage TO authenticated;
GRANT SELECT ON tenant_audit_log TO authenticated;

-- Grant permissions to service role
GRANT ALL ON tenants TO service_role;
GRANT ALL ON tenant_users TO service_role;
GRANT ALL ON tenant_subscriptions TO service_role;
GRANT ALL ON tenant_usage TO service_role;
GRANT ALL ON tenant_audit_log TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_context(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION create_tenant_schema(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION drop_tenant_schema(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION create_tenant_role(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION drop_tenant_role(UUID) TO service_role;
`;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    this.tenants.clear();
    this.schemas.clear();
    this.provisioning.clear();
  }

  private async loadTenants(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tenants')
        .select('*');

      if (error) throw error;

      (data || []).forEach((tenantData: any) => {
        const tenant = this.mapTenantFromDB(tenantData);
        this.tenants.set(tenant.id, tenant);
      });
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }

  private async setupTenantIsolation(): Promise<void> {
    // Setup isolation based on configuration
    switch (this.config.isolationLevel) {
      case 'schema':
        await this.setupSchemaIsolation();
        break;
      case 'row_level':
        await this.setupRowLevelIsolation();
        break;
      case 'database':
        await this.setupDatabaseIsolation();
        break;
    }
  }

  private async setupSchemaIsolation(): Promise<void> {
    // Schema isolation setup
    console.log('Setting up schema isolation for multi-tenancy');
  }

  private async setupRowLevelIsolation(): Promise<void> {
    // Row-level isolation setup
    console.log('Setting up row-level isolation for multi-tenancy');
  }

  private async setupDatabaseIsolation(): Promise<void> {
    // Database isolation setup
    console.log('Setting up database isolation for multi-tenancy');
  }

  private async startProvisioningWorkflow(tenant: Tenant): Promise<TenantProvisioningWorkflow> {
    const workflow: TenantProvisioningWorkflow = {
      steps: [
        { id: 'create_record', name: 'Create tenant record', status: 'pending' },
        { id: 'create_schema', name: 'Create tenant schema', status: 'pending' },
        { id: 'create_role', name: 'Create tenant role', status: 'pending' },
        { id: 'setup_policies', name: 'Setup security policies', status: 'pending' },
        { id: 'configure_storage', name: 'Configure storage bucket', status: 'pending' }
      ],
      progress: 0,
      estimatedDuration: 30000 // 30 seconds
    };

    this.provisioning.set(tenant.id, workflow);
    return workflow;
  }

  private async startDeprovisioningWorkflow(tenant: Tenant): Promise<void> {
    console.log(`Starting deprovisioning for tenant: ${tenant.id}`);
  }

  private async createTenantRecord(tenant: Tenant): Promise<void> {
    const { error } = await this.supabaseClient
      .from('tenants')
      .insert({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        customDomain: tenant.customDomain,
        status: tenant.status,
        plan: tenant.plan,
        settings: tenant.settings,
        metadata: tenant.metadata
      });

    if (error) throw error;
  }

  private async updateTenantRecord(tenant: Tenant): Promise<void> {
    const { error } = await this.supabaseClient
      .from('tenants')
      .update({
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        customDomain: tenant.customDomain,
        status: tenant.status,
        plan: tenant.plan,
        settings: tenant.settings,
        metadata: tenant.metadata,
        updated_at: tenant.updatedAt
      })
      .eq('id', tenant.id);

    if (error) throw error;
  }

  private async deleteTenantRecord(tenantId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('tenants')
      .delete()
      .eq('id', tenantId);

    if (error) throw error;
  }

  private async provisionTenant(tenant: Tenant): Promise<void> {
    try {
      // Create tenant schema
      if (this.config.isolationLevel === 'schema') {
        await this.supabaseClient.rpc('create_tenant_schema', { tenant_id: tenant.id });
      }

      // Create tenant role
      await this.supabaseClient.rpc('create_tenant_role', { tenant_id: tenant.id });

      // Setup storage bucket
      if (this.config.storage?.enableMultiTenant) {
        await this.setupTenantStorage(tenant);
      }

      console.log(`Tenant provisioned successfully: ${tenant.id}`);
    } catch (error) {
      console.error('Failed to provision tenant:', error);
      throw error;
    }
  }

  private async deprovisionTenant(tenant: Tenant): Promise<void> {
    try {
      // Drop tenant schema
      if (this.config.isolationLevel === 'schema') {
        await this.supabaseClient.rpc('drop_tenant_schema', { tenant_id: tenant.id });
      }

      // Drop tenant role
      await this.supabaseClient.rpc('drop_tenant_role', { tenant_id: tenant.id });

      // Remove storage bucket
      if (this.config.storage?.enableMultiTenant) {
        await this.removeTenantStorage(tenant);
      }

      console.log(`Tenant deprovisioned successfully: ${tenant.id}`);
    } catch (error) {
      console.error('Failed to deprovision tenant:', error);
      throw error;
    }
  }

  private async setupTenantStorage(tenant: Tenant): Promise<void> {
    // Setup tenant-specific storage bucket
    console.log(`Setting up storage for tenant: ${tenant.id}`);
  }

  private async removeTenantStorage(tenant: Tenant): Promise<void> {
    // Remove tenant-specific storage bucket
    console.log(`Removing storage for tenant: ${tenant.id}`);
  }

  private getDefaultSettings(plan: string): TenantSettings {
    return {
      branding: {
        theme: 'light'
      },
      features: {
        enableAPI: plan !== 'free',
        enableWebhooks: plan === 'pro' || plan === 'enterprise',
        enableCustomDomains: plan === 'enterprise'
      },
      limits: {
        users: plan === 'free' ? 3 : plan === 'starter' ? 10 : plan === 'pro' ? 50 : 1000,
        storage: plan === 'free' ? 1024 * 1024 * 100 : plan === 'starter' ? 1024 * 1024 * 1024 : plan === 'pro' ? 1024 * 1024 * 1024 * 10 : 1024 * 1024 * 1024 * 100,
        apiCalls: plan === 'free' ? 1000 : plan === 'starter' ? 10000 : plan === 'pro' ? 100000 : 1000000
      },
      notifications: {
        email: true,
        sms: plan !== 'free',
        push: plan === 'pro' || plan === 'enterprise'
      }
    };
  }

  private mapTenantFromDB(data: any): Tenant {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      customDomain: data.custom_domain,
      status: data.status,
      plan: data.plan,
      settings: data.settings || {},
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const multiTenantArchitecture = new MultiTenantArchitectureManager();

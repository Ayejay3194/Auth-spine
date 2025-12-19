/**
 * RLS Policies for Supabase SaaS Advanced Pack
 * 
 * Provides Row Level Security policies for tenant isolation
 * and data protection in multi-tenant applications.
 */

import { RLSPolicy } from './types.js';

export class RLSPoliciesManager {
  private policies: Map<string, RLSPolicy> = new Map();
  private initialized = false;

  /**
   * Initialize RLS policies
   */
  async initialize(): Promise<void> {
    this.loadDefaultPolicies();
    this.initialized = true;
  }

  /**
   * Get all policies
   */
  getAllPolicies(): RLSPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policies by table
   */
  getPoliciesByTable(table: string): RLSPolicy[] {
    return Array.from(this.policies.values()).filter(policy => 
      policy.table === table
    );
  }

  /**
   * Get policies by tenant
   */
  getPoliciesByTenant(tenantId: string): RLSPolicy[] {
    return Array.from(this.policies.values()).filter(policy => 
      policy.id.includes(tenantId)
    );
  }

  /**
   * Create policy
   */
  createPolicy(policy: Omit<RLSPolicy, 'id' | 'createdAt'>): RLSPolicy {
    const rlsPolicy: RLSPolicy = {
      ...policy,
      id: `rls_${policy.table}_${Date.now()}`,
      createdAt: new Date()
    };

    this.policies.set(rlsPolicy.id, rlsPolicy);
    return rlsPolicy;
  }

  /**
   * Enable/disable policy
   */
  togglePolicy(policyId: string, enabled: boolean): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.enabled = enabled;
    }
  }

  /**
   * Delete policy
   */
  deletePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  /**
   * Generate SQL for policy
   */
  generatePolicySQL(policy: RLSPolicy): string {
    const operations = policy.operations.join(', ');
    
    return `
-- Policy: ${policy.name}
CREATE POLICY "${policy.name}" ON "${policy.table}"
FOR ${operations}
TO authenticated
USING (${policy.definition})
WITH CHECK (${policy.definition});

-- Enable RLS on table
ALTER TABLE "${policy.table}" ENABLE ROW LEVEL SECURITY;
    `.trim();
  }

  /**
   * Generate all policies SQL
   */
  generateAllPoliciesSQL(): string {
    const policies = Array.from(this.policies.values());
    const sqlStatements = policies.map(policy => this.generatePolicySQL(policy));
    
    return `
-- Supabase SaaS Advanced - RLS Policies
-- Generated on ${new Date().toISOString()}

${sqlStatements.join('\n\n')}

-- Helper function to get tenant_id from request
CREATE OR REPLACE FUNCTION request.tenant_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tenant_id text;
BEGIN
  -- Extract tenant_id from JWT claims
  SELECT current_setting('request.jwt.claims', true)::json->>'tenant_id' 
  INTO tenant_id;
  
  -- Fallback to header for development
  IF tenant_id IS NULL THEN
    SELECT current_setting('request.headers', true)::json->>'x-tenant-id'
    INTO tenant_id;
  END IF;
  
  RETURN tenant_id;
END;
$$;
    `.trim();
  }

  private loadDefaultPolicies(): void {
    // User table policies
    this.createPolicy({
      table: 'users',
      name: 'tenant_isolation_users',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });

    // Projects table policies
    this.createPolicy({
      table: 'projects',
      name: 'tenant_isolation_projects',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });

    // Documents table policies
    this.createPolicy({
      table: 'documents',
      name: 'tenant_isolation_documents',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });

    // Audit logs policies (read-only for tenants)
    this.createPolicy({
      table: 'audit_logs',
      name: 'tenant_read_audit_logs',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT'],
      enabled: true
    });

    // API keys policies
    this.createPolicy({
      table: 'api_keys',
      name: 'tenant_isolation_api_keys',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });

    // Usage metrics policies (read-only for tenants)
    this.createPolicy({
      table: 'usage_metrics',
      name: 'tenant_read_usage_metrics',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT'],
      enabled: true
    });

    // Tenant settings policies
    this.createPolicy({
      table: 'tenant_settings',
      name: 'tenant_isolation_settings',
      definition: 'id = request.tenant_id()',
      tenantColumn: 'id',
      operations: ['SELECT', 'UPDATE'],
      enabled: true
    });

    // Invitations policies
    this.createPolicy({
      table: 'invitations',
      name: 'tenant_isolation_invitations',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });

    // Webhooks policies
    this.createPolicy({
      table: 'webhooks',
      name: 'tenant_isolation_webhooks',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });

    // Files table policies
    this.createPolicy({
      table: 'files',
      name: 'tenant_isolation_files',
      definition: 'tenant_id = request.tenant_id()',
      tenantColumn: 'tenant_id',
      operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      enabled: true
    });
  }
}

// Export singleton instance
export const rlsPolicies = new RLSPoliciesManager();

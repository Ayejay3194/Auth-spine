/**
 * Example usage of the Supabase SaaS Advanced Pack
 * 
 * This example demonstrates how to use the Supabase SaaS advanced features
 * for building multi-tenant applications with proper isolation and security.
 */

import { 
  SupabaseSaaSAdvanced, 
  supabaseSaaSAdvanced
} from './index.js';

// Example 1: Basic Supabase SaaS initialization
export async function basicSupabaseSaaSInitialization() {
  console.log('=== Basic Supabase SaaS Advanced Initialization ===\n');

  await supabaseSaaSAdvanced.initialize();
  console.log('✅ Supabase SaaS Advanced system initialized successfully');

  const healthStatus = await supabaseSaaSAdvanced.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Tenant management
export async function tenantManagement() {
  console.log('\n=== Tenant Management ===\n');

  // Create new tenant
  const newTenant = await supabaseSaaSAdvanced.createTenant({
    name: 'Demo Company',
    status: 'trial',
    plan: 'starter',
    settings: {
      maxUsers: 10,
      features: ['basic-analytics', 'api-access']
    },
    metadata: {
      industry: 'technology',
      size: 'small'
    }
  });
  console.log('✅ Created new tenant:');
  console.log(`  - ID: ${newTenant.id}`);
  console.log(`  - Name: ${newTenant.name}`);
  console.log(`  - Status: ${newTenant.status}`);
  console.log(`  - Plan: ${newTenant.plan}`);

  // Get tenant by ID
  const retrievedTenant = await supabaseSaaSAdvanced.getTenant(newTenant.id);
  console.log(`✅ Retrieved tenant: ${retrievedTenant?.name}`);

  // Update tenant
  const updatedTenant = await supabaseSaaSAdvanced.updateTenant(newTenant.id, {
    status: 'active',
    plan: 'professional',
    settings: {
      maxUsers: 50,
      features: ['advanced-analytics', 'api-access', 'sso']
    }
  });
  console.log(`✅ Updated tenant plan: ${updatedTenant.plan}`);

  // Get tenant context from request
  const context = await supabaseSaaSAdvanced.getTenantContext({
    jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnRfMSJ9.test'
  });
  console.log(`✅ Tenant context: ${context ? context.tenantId : 'Not found'}`);
}

// Example 3: Rate limiting enforcement
export async function rateLimitingEnforcement() {
  console.log('\n=== Rate Limiting Enforcement ===\n');

  const tenantId = 'tenant_1';
  const identifier = 'user_123';

  // Check rate limit (should be allowed)
  const result1 = await supabaseSaaSAdvanced.enforceRateLimit(tenantId, identifier);
  console.log('✅ Rate limit check 1:');
  console.log(`  - Allowed: ${result1.allowed}`);
  console.log(`  - Remaining: ${result1.remaining}`);
  console.log(`  - Limit: ${result1.limit}`);

  // Simulate multiple requests
  for (let i = 0; i < 5; i++) {
    await supabaseSaaSAdvanced.enforceRateLimit(tenantId, identifier);
  }

  // Check rate limit again
  const result2 = await supabaseSaaSAdvanced.enforceRateLimit(tenantId, identifier);
  console.log('\n✅ Rate limit check after 5 requests:');
  console.log(`  - Allowed: ${result2.allowed}`);
  console.log(`  - Remaining: ${result2.remaining}`);
}

// Example 4: Quota management
export async function quotaManagement() {
  console.log('\n=== Quota Management ===\n');

  const tenantId = 'tenant_1';

  // Check API quota
  const apiQuota = await supabaseSaaSAdvanced.checkQuota(tenantId, 'api_requests', 10);
  console.log('✅ API quota check:');
  console.log(`  - Allowed: ${apiQuota.allowed}`);
  console.log(`  - Current: ${apiQuota.current}`);
  console.log(`  - Limit: ${apiQuota.limit}`);
  console.log(`  - Remaining: ${apiQuota.remaining}`);

  // Check storage quota
  const storageQuota = await supabaseSaaSAdvanced.checkQuota(tenantId, 'storage', 100);
  console.log('\n✅ Storage quota check:');
  console.log(`  - Allowed: ${storageQuota.allowed}`);
  console.log(`  - Current: ${storageQuota.current}`);
  console.log(`  - Limit: ${storageQuota.limit}`);

  // Check user quota
  const userQuota = await supabaseSaaSAdvanced.checkQuota(tenantId, 'users', 1);
  console.log('\n✅ User quota check:');
  console.log(`  - Allowed: ${userQuota.allowed}`);
  console.log(`  - Current: ${userQuota.current}`);
  console.log(`  - Limit: ${userQuota.limit}`);
}

// Example 5: Audit logging
export async function auditLogging() {
  console.log('\n=== Audit Logging ===\n');

  const tenantId = 'tenant_1';
  const userId = 'user_123';

  // Log various audit events
  await supabaseSaaSAdvanced.logAudit({
    tenantId,
    userId,
    action: 'user.login',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Web Browser)'
  });

  await supabaseSaaSAdvanced.logAudit({
    tenantId,
    userId,
    action: 'project.create',
    table: 'projects',
    recordId: 'proj_123',
    newValues: {
      name: 'New Project',
      description: 'A new project'
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Web Browser)'
  });

  await supabaseSaaSAdvanced.logAudit({
    tenantId,
    userId,
    action: 'data.export',
    table: 'users',
    oldValues: { count: 100 },
    newValues: { count: 101 },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Web Browser)'
  });

  console.log('✅ Logged 3 audit events');

  // Query audit logs
  const auditLogs = await supabaseSaaSAdvanced.queryAuditLogs({
    tenantId,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    limit: 10
  });

  console.log(`✅ Retrieved ${auditLogs.length} audit logs`);
  auditLogs.forEach(log => {
    console.log(`  - ${log.action}: ${log.timestamp.toISOString()}`);
  });
}

// Example 6: API key management
export async function apiKeyManagement() {
  console.log('\n=== API Key Management ===\n');

  const tenantId = 'tenant_1';

  // Create API key
  const apiKey = await supabaseSaaSAdvanced.createAPIKey(tenantId, {
    name: 'Production API Key',
    scopes: ['read', 'write'],
    permissions: ['users:read', 'projects:write'],
    metadata: { environment: 'production' }
  });

  console.log('✅ Created API key:');
  console.log(`  - ID: ${apiKey.id}`);
  console.log(`  - Name: ${apiKey.name}`);
  console.log(`  - Scopes: ${apiKey.scopes.join(', ')}`);
  console.log(`  - Active: ${apiKey.isActive}`);

  // Validate API key (simulated hash)
  const validation = await supabaseSaaSAdvanced.validateAPIKey('test_hash', ['read']);
  console.log('\n✅ API key validation:');
  console.log(`  - Valid: ${validation.valid}`);
  console.log(`  - Tenant ID: ${validation.tenantId}`);
  console.log(`  - Scopes: ${validation.scopes.join(', ')}`);

  // Create read-only API key
  const readOnlyKey = await supabaseSaaSAdvanced.createAPIKey(tenantId, {
    name: 'Read-only Key',
    scopes: ['read'],
    permissions: ['users:read', 'projects:read'],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    metadata: { environment: 'staging' }
  });

  console.log('\n✅ Created read-only API key with expiration');
}

// Example 7: Edge functions
export async function edgeFunctions() {
  console.log('\n=== Edge Functions ===\n');

  // Deploy edge function
  const webhookFunction = await supabaseSaaSAdvanced.deployEdgeFunction({
    name: 'webhook-processor',
    description: 'Process incoming webhooks with verification',
    runtime: 'deno',
    entryPoint: 'webhook-processor/index.ts',
    environment: {
      WEBHOOK_SECRET: 'secret-key',
      MAX_RETRIES: '3'
    },
    secrets: ['WEBHOOK_SECRET'],
    tenantIsolated: true,
    rateLimit: {
      requestsPerMinute: 60,
      burstLimit: 120
    }
  });

  console.log('✅ Deployed edge function:');
  console.log(`  - ID: ${webhookFunction.id}`);
  console.log(`  - Name: ${webhookFunction.name}`);
  console.log(`  - Runtime: ${webhookFunction.runtime}`);
  console.log(`  - Tenant Isolated: ${webhookFunction.tenantIsolated}`);

  // Generate signed upload URL
  const uploadURL = await supabaseSaaSAdvanced.generateSignedUploadURL('tenant_1', {
    bucket: 'uploads',
    key: 'user-documents/file.pdf',
    expiresIn: 3600,
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg']
  });

  console.log('\n✅ Generated signed upload URL:');
  console.log(`  - URL: ${uploadURL.url}`);
  console.log(`  - Key: ${uploadURL.fields.key}`);
  console.log(`  - Expires: ${uploadURL.expiresAt.toISOString()}`);

  // Verify webhook signature
  const payload = JSON.stringify({ event: 'user.created', data: { id: 123 } });
  const secret = 'webhook-secret';
  const signature = 'generated-signature';
  
  const isValid = supabaseSaaSAdvanced.verifyWebhookSignature(payload, signature, secret);
  console.log(`\n✅ Webhook signature valid: ${isValid}`);
}

// Example 8: Security headers
export async function securityHeaders() {
  console.log('\n=== Security Headers ===\n');

  // Get security headers
  const headers = supabaseSaaSAdvanced.getSecurityHeaders();
  console.log('✅ Security headers:');
  Object.entries(headers).forEach(([name, value]) => {
    console.log(`  - ${name}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  });

  // Generate CSP for specific tenant
  const config = supabaseSaaSAdvanced.getConfig();
  console.log('\n✅ Security configuration:');
  console.log(`  - Tenant ID Claim: ${config.tenantIdClaim}`);
  console.log(`  - HMAC Validation: ${config.security.hmacValidation}`);
  console.log(`  - Replay Protection: ${config.security.replayProtection}`);
  console.log(`  - Signed Uploads: ${config.security.signedUploads}`);
  console.log(`  - CSRF Protection: ${config.security.csrfProtection}`);
}

// Example 9: SaaS metrics and monitoring
export async function saasMetricsMonitoring() {
  console.log('\n=== SaaS Metrics and Monitoring ===\n');

  // Get comprehensive metrics
  const metrics = await supabaseSaaSAdvanced.getMetrics();
  console.log('✅ SaaS Metrics:');
  
  console.log('\n  Tenant Metrics:');
  console.log(`    - Total: ${metrics.tenants.total}`);
  console.log(`    - Active: ${metrics.tenants.active}`);
  console.log(`    - Trial: ${metrics.tenants.trial}`);
  console.log(`    - Suspended: ${metrics.tenants.suspended}`);

  console.log('\n  Usage Metrics:');
  console.log(`    - Total Requests: ${metrics.usage.totalRequests}`);
  console.log(`    - Total Storage: ${metrics.usage.totalStorage} MB`);
  console.log(`    - Total Bandwidth: ${metrics.usage.totalBandwidth} MB`);

  console.log('\n  Quota Metrics:');
  console.log(`    - Enforced: ${metrics.quotas.enforced}`);
  console.log(`    - Exceeded: ${metrics.quotas.exceeded}`);
  console.log(`    - Warnings: ${metrics.quotas.warnings}`);

  console.log('\n  API Key Metrics:');
  console.log(`    - Total: ${metrics.apiKeys.total}`);
  console.log(`    - Active: ${metrics.apiKeys.active}`);
  console.log(`    - Expired: ${metrics.apiKeys.expired}`);

  console.log('\n  Audit Log Metrics:');
  console.log(`    - Total: ${metrics.auditLogs.total}`);
  console.log(`    - Today: ${metrics.auditLogs.today}`);
  console.log(`    - This Week: ${metrics.auditLogs.thisWeek}`);
  console.log(`    - This Month: ${metrics.auditLogs.thisMonth}`);
}

// Example 10: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const config = supabaseSaaSAdvanced.getConfig();
  console.log('✅ Current Configuration:');
  console.log(`  - Enable Tenant Isolation: ${config.enableTenantIsolation}`);
  console.log(`  - Enable RLS Policies: ${config.enableRLSPolicies}`);
  console.log(`  - Enable Audit Logging: ${config.enableAuditLogging}`);
  console.log(`  - Enable Quota Management: ${config.enableQuotaManagement}`);
  console.log(`  - Enable API Keys: ${config.enableAPIKeys}`);
  console.log(`  - Enable Edge Functions: ${config.enableEdgeFunctions}`);
  console.log(`  - Enable Security Headers: ${config.enableSecurityHeaders}`);

  console.log('\n  Rate Limiting:');
  console.log(`    - Enabled: ${config.rateLimiting.enabled}`);
  console.log(`    - Requests/Minute: ${config.rateLimiting.requestsPerMinute}`);
  console.log(`    - Burst Limit: ${config.rateLimiting.burstLimit}`);
  console.log(`    - Storage: ${config.rateLimiting.storage}`);

  console.log('\n  Security:');
  console.log(`    - Webhook Secret: ${config.security.webhookSecret}`);
  console.log(`    - HMAC Validation: ${config.security.hmacValidation}`);
  console.log(`    - Replay Protection: ${config.security.replayProtection}`);
  console.log(`    - Signed Uploads: ${config.security.signedUploads}`);
  console.log(`    - CSRF Protection: ${config.security.csrfProtection}`);

  // Update configuration
  supabaseSaaSAdvanced.updateConfig({
    quotaEnforcement: 'strict',
    rateLimiting: {
      ...config.rateLimiting,
      requestsPerMinute: 200,
      burstLimit: 400
    },
    auditRetention: 3650 // 10 years
  });

  console.log('\n✅ Configuration updated');
  
  const updatedConfig = supabaseSaaSAdvanced.getConfig();
  console.log(`✅ New quota enforcement: ${updatedConfig.quotaEnforcement}`);
  console.log(`✅ New rate limit: ${updatedConfig.rateLimiting.requestsPerMinute}/min`);
  console.log(`✅ New audit retention: ${updatedConfig.auditRetention} days`);
}

// Example 11: Complete SaaS workflow
export async function completeSaaSWorkflow() {
  console.log('\n=== Complete SaaS Workflow ===\n');

  console.log('✅ Starting complete SaaS workflow...');

  // Step 1: Create tenant
  const tenant = await supabaseSaaSAdvanced.createTenant({
    name: 'Workflow Test Company',
    status: 'active',
    plan: 'professional',
    settings: {
      maxUsers: 25,
      features: ['analytics', 'api-access', 'webhooks']
    },
    metadata: {
      industry: 'software',
      size: 'medium'
    }
  });
  console.log(`✅ Created tenant: ${tenant.name}`);

  // Step 2: Set up API key
  const apiKey = await supabaseSaaSAdvanced.createAPIKey(tenant.id, {
    name: 'Workflow API Key',
    scopes: ['read', 'write'],
    permissions: ['*']
  });
  console.log(`✅ Created API key: ${apiKey.name}`);

  // Step 3: Configure quotas
  await supabaseSaaSAdvanced.checkQuota(tenant.id, 'users', 5);
  console.log('✅ Configured user quotas');

  // Step 4: Deploy edge function
  const edgeFunction = await supabaseSaaSAdvanced.deployEdgeFunction({
    name: 'workflow-processor',
    description: 'Process workflow events',
    runtime: 'deno',
    entryPoint: 'workflow/index.ts',
    tenantIsolated: true
  });
  console.log(`✅ Deployed edge function: ${edgeFunction.name}`);

  // Step 5: Log setup events
  await supabaseSaaSAdvanced.logAudit({
    tenantId: tenant.id,
    action: 'tenant.setup.completed',
    newValues: {
      plan: tenant.plan,
      features: tenant.settings.features,
      apiKeyCount: 1,
      functionsDeployed: 1
    }
  });
  console.log('✅ Logged setup completion');

  // Step 6: Test rate limiting
  const rateLimitResult = await supabaseSaaSAdvanced.enforceRateLimit(tenant.id, 'workflow_test');
  console.log(`✅ Rate limiting test: ${rateLimitResult.allowed ? 'Allowed' : 'Blocked'}`);

  // Step 7: Generate metrics report
  const metrics = await supabaseSaaSAdvanced.getMetrics();
  console.log('\n✅ Workflow Metrics Summary:');
  console.log(`  - Tenants: ${metrics.tenants.total} total, ${metrics.tenants.active} active`);
  console.log(`  - API Keys: ${metrics.apiKeys.total} total, ${metrics.apiKeys.active} active`);
  console.log(`  - Audit Events: ${metrics.auditLogs.total} total`);

  console.log('\n✅ Complete SaaS workflow completed successfully');
}

// Example 12: Testing and validation
export async function testingAndValidation() {
  console.log('\n=== Testing and Validation ===\n');

  const config = supabaseSaaSAdvanced.getConfig();
  
  if (config.testing.enablePolicyTests) {
    console.log('✅ SQL Policy Tests:');
    console.log('  - Tenant isolation tests');
    console.log('  - RLS policy validation');
    console.log('  - API key scope tests');
    console.log('  - Quota enforcement tests');
  }

  if (config.testing.enableUnitTests) {
    console.log('\n✅ Unit Tests:');
    console.log('  - Edge function tests');
    console.log('  - Rate limiting tests');
    console.log('  - Webhook verification tests');
    console.log('  - Signed upload tests');
  }

  if (config.testing.enableIntegrationTests) {
    console.log('\n✅ Integration Tests:');
    console.log('  - End-to-end tenant workflows');
    console.log('  - Multi-tenant isolation');
    console.log('  - Security boundary validation');
    console.log('  - Performance under load');
  }

  console.log(`\n✅ Test database: ${config.testing.testDatabase}`);
  console.log('✅ All test suites configured and ready');
}

// Run all examples
export async function runAllExamples() {
  console.log('Supabase SaaS Advanced Pack - Example Usage\n');
  console.log('==========================================\n');

  try {
    await basicSupabaseSaaSInitialization();
    await tenantManagement();
    await rateLimitingEnforcement();
    await quotaManagement();
    await auditLogging();
    await apiKeyManagement();
    await edgeFunctions();
    await securityHeaders();
    await saasMetricsMonitoring();
    await configurationManagement();
    await completeSaaSWorkflow();
    await testingAndValidation();

    console.log('\n=== All Examples Completed Successfully ===');
  } catch (error: any) {
    console.error('Error running examples:', error.message);
    console.error(error.stack);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

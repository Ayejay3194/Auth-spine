# Supabase SaaS/PaaS Advanced Pack

A starter enforcement layer for building a multi-tenant SaaS on Supabase + Postgres. It does not magically enable every Postgres feature in your checklist (some are Postgres-native, some are Supabase product features, some require custom code), but it gives you the **patterns + scaffolding** so you can actually ship it without cross-tenant leaks.

## What's Inside

### Database (SQL / migrations)
- **Tenant isolation tables** + helper functions
- **RLS policies** (tenant-context enforced)
- **Audit log** with tamper-evident chaining
- **Quotas + usage counters**
- **API keys** (hash-only storage) + scope checks
- **Example partitioning/indexing patterns**
- **Triggers**: updated_at, immutable fields, audit hooks

### Edge Functions (Deno)
- `webhook-verify` (HMAC signature + replay protection skeleton)
- `rate-limit` (per-tenant/per-key limiter; plug in Redis/Upstash later)
- `signed-upload` (create signed upload URL policies)
- `cron-quota-sweep` (scheduled quota enforcement job)
- `admin-support-jit` (support access request/approve/expire)

### App integration snippets
- **Next.js middleware** security headers + CSP
- **Tenant context derivation** pattern
- **Client/server Supabase helpers**

### Testing
- **SQL policy tests** (pgTAP-style template)
- **Vitest unit tests** for edge functions
- **Basic CI workflow** skeleton

## Key Idea: Tenant Context on Every Request

- **DB side**: `request.tenant_id()` reads a tenant id from JWT claims (preferred) or request headers (dev only).
- **RLS**: Every table policy checks `tenant_id = request.tenant_id()`.
- **App**: You set tenant claim on login (custom JWT / auth hook) or route through an edge function that mints a scoped session.

## Quick Start (Local)

1. Install Supabase CLI
2. `supabase init`
3. Copy this pack into your repo (or use as a base)
4. `supabase start`
5. Apply migrations:
   ```bash
   supabase db reset
   ```

> The SQL here is written to be readable and auditable. You should adapt table names + claims mapping to your auth model.

## Files to Read First

- `supabase/migrations/0001_tenant_core.sql`
- `supabase/migrations/0002_rls_policies.sql`
- `supabase/migrations/0003_audit_logs.sql`
- `supabase/functions/webhook-verify/index.ts`
- `next/middleware.ts` (security headers)

## Installation

```bash
npm install @auth-spine/supabase-saas-advanced
```

## Quick Start

```typescript
import { supabaseSaaSAdvanced } from '@auth-spine/supabase-saas-advanced';

// Initialize the SaaS system
await supabaseSaaSAdvanced.initialize();

// Create new tenant
const tenant = await supabaseSaaSAdvanced.createTenant({
  name: 'Acme Corporation',
  status: 'active',
  plan: 'enterprise',
  settings: {
    maxUsers: 100,
    features: ['analytics', 'api-access', 'sso']
  }
});

// Get tenant context from request
const context = await supabaseSaaSAdvanced.getTenantContext({
  jwt: 'your-jwt-token'
});

// Enforce rate limiting
const rateLimit = await supabaseSaaSAdvanced.enforceRateLimit(
  tenant.id, 
  'user_123'
);

// Check quota limits
const quota = await supabaseSaaSAdvanced.checkQuota(
  tenant.id, 
  'api_requests', 
  10
);
```

## API Reference

### Main Class: SupabaseSaaSAdvanced

#### Initialization

```typescript
await supabaseSaaSAdvanced.initialize();
```

#### Tenant Management

```typescript
// Create tenant
const tenant = await supabaseSaaSAdvanced.createTenant({
  name: 'Company Name',
  status: 'active',
  plan: 'professional',
  settings: { /* tenant settings */ },
  metadata: { /* tenant metadata */ }
});

// Get tenant
const tenant = await supabaseSaaSAdvanced.getTenant(tenantId);

// Update tenant
const updated = await supabaseSaaSAdvanced.updateTenant(tenantId, {
  status: 'suspended',
  plan: 'enterprise'
});
```

#### Tenant Context & Isolation

```typescript
// Get tenant context from request
const context = await supabaseSaaSAdvanced.getTenantContext({
  jwt: 'jwt-with-tenant-claim',
  headers: { 'x-tenant-id': 'tenant-id' }
});

// Context includes:
// - tenant isolation status
// - tenant context object
// - applicable RLS policies
// - quota status
```

#### Rate Limiting

```typescript
// Enforce rate limiting
const result = await supabaseSaaSAdvanced.enforceRateLimit(
  tenantId, 
  identifier, // user ID, API key, etc.
  {
    requestsPerMinute: 100,
    burstLimit: 200,
    storage: 'redis' // 'memory' | 'redis' | 'upstash'
  }
);

// Result includes:
// - allowed: boolean
// - remaining: number
// - resetTime: Date
// - limit: number
```

#### Quota Management

```typescript
// Check quota limits
const quota = await supabaseSaaSAdvanced.checkQuota(
  tenantId, 
  'api_requests', // quota type
  10, // amount to consume
  'strict' // enforcement mode: 'strict' | 'lenient' | 'disabled'
);

// Quota types: 'api_requests', 'storage', 'bandwidth', 'users', 'seats'
// Periods: 'daily', 'monthly', 'yearly', 'lifetime'
```

#### Audit Logging

```typescript
// Log audit event
await supabaseSaaSAdvanced.logAudit({
  tenantId: 'tenant_1',
  userId: 'user_123',
  action: 'user.login',
  table: 'users',
  recordId: 'user_123',
  oldValues: { /* previous state */ },
  newValues: { /* new state */ },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Query audit logs
const logs = await supabaseSaaSAdvanced.queryAuditLogs({
  tenantId: 'tenant_1',
  action: 'user.login',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  limit: 100
});
```

#### API Key Management

```typescript
// Create API key
const apiKey = await supabaseSaaSAdvanced.createAPIKey(tenantId, {
  name: 'Production Key',
  scopes: ['read', 'write'],
  permissions: ['users:read', 'projects:write'],
  expiresAt: new Date('2024-12-31'),
  metadata: { environment: 'production' }
});

// Validate API key
const validation = await supabaseSaaSAdvanced.validateAPIKey(
  keyHash, 
  ['read', 'write'] // required scopes
);

// Scopes: 'read', 'write', 'admin', 'billing', 'support'
```

#### Edge Functions

```typescript
// Deploy edge function
const func = await supabaseSaaSAdvanced.deployEdgeFunction({
  name: 'webhook-processor',
  description: 'Process webhooks with verification',
  runtime: 'deno',
  entryPoint: 'webhook-processor/index.ts',
  environment: { /* env vars */ },
  secrets: ['WEBHOOK_SECRET'],
  tenantIsolated: true,
  rateLimit: {
    requestsPerMinute: 60,
    burstLimit: 120
  }
});

// Generate signed upload URL
const upload = await supabaseSaaSAdvanced.generateSignedUploadURL(tenantId, {
  bucket: 'uploads',
  key: 'user-files/document.pdf',
  expiresIn: 3600,
  maxFileSize: 10485760, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg']
});

// Verify webhook signature
const isValid = supabaseSaaSAdvanced.verifyWebhookSignature(
  payload, 
  signature, 
  secret
);
```

#### Security Headers

```typescript
// Get security headers
const headers = supabaseSaaSAdvanced.getSecurityHeaders();
// Returns: Record<string, string>

// Generate CSP for tenant
const csp = supabaseSaaSAdvanced.generateCSP(tenantId, {
  customDomains: ['your-domain.com'],
  allowInline: false,
  allowEval: false
});
```

## Database Schema

### Core Tables

```sql
-- Tenants
CREATE TABLE tenants (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL,
  plan text NOT NULL,
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users (tenant-isolated)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES tenants(id),
  email text NOT NULL,
  -- other user fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs (tamper-evident)
CREATE TABLE audit_logs (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  hash text NOT NULL,
  previous_hash text NOT NULL
);
```

### RLS Policies

All tables have RLS policies that check `tenant_id = request.tenant_id()`:

```sql
-- Example user table policy
CREATE POLICY tenant_isolation_users ON users
FOR ALL TO authenticated
USING (tenant_id = request.tenant_id())
WITH CHECK (tenant_id = request.tenant_id());
```

## Configuration

```typescript
interface SupabaseSaaSConfig {
  enableTenantIsolation: boolean;    // Enable tenant isolation
  enableRLSPolicies: boolean;         // Enable RLS policies
  enableAuditLogging: boolean;        // Enable audit logging
  enableQuotaManagement: boolean;     // Enable quota management
  enableAPIKeys: boolean;             // Enable API keys
  enableEdgeFunctions: boolean;       // Enable edge functions
  enableSecurityHeaders: boolean;     // Enable security headers
  tenantIdClaim: string;              // JWT claim for tenant ID
  auditRetention: number;             // Audit retention (days)
  quotaEnforcement: 'strict' | 'lenient' | 'disabled';
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
    storage: 'memory' | 'redis' | 'upstash';
  };
  security: {
    webhookSecret: boolean;
    hmacValidation: boolean;
    replayProtection: boolean;
    signedUploads: boolean;
    csrfProtection: boolean;
  };
  testing: {
    enablePolicyTests: boolean;
    enableUnitTests: boolean;
    enableIntegrationTests: boolean;
    testDatabase: string;
  };
}
```

## Security Features

### Tenant Isolation
- **JWT-based tenant context** extraction
- **Row Level Security** on all tables
- **Cross-tenant leak prevention**
- **Tenant-specific rate limiting**

### Audit Logging
- **Tamper-evident chaining** with cryptographic hashes
- **Complete audit trail** of all data changes
- **Configurable retention** policies
- **Export capabilities** for compliance

### API Security
- **Hash-only API key storage**
- **Scope-based permissions**
- **Rate limiting per tenant/key**
- **Automatic key rotation**

### Webhook Security
- **HMAC signature verification**
- **Replay attack prevention**
- **Configurable retry policies**
- **Tenant-isolated webhooks**

## Integration Examples

### Next.js Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply security headers
  const headers = supabaseSaaSAdvanced.getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Set CSP based on tenant
  const tenantId = request.headers.get('x-tenant-id');
  if (tenantId) {
    const csp = supabaseSaaSAdvanced.generateCSP(tenantId);
    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}
```

### Client-Side Integration

```typescript
// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseSaaSAdvanced } from '@auth-spine/supabase-saas-advanced';

export function createSupabaseClient(jwt?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : '',
        },
      },
    }
  );
}
```

### Server-Side Integration

```typescript
// app/api/protected/route.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('access-token')?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // Tenant context is automatically enforced by RLS
  const { data, error } = await supabase.from('projects').select('*');
  
  return Response.json({ data, error });
}
```

## Testing

### SQL Policy Tests

```sql
-- Test tenant isolation
SELECT lives_ok(
  'SELECT set_config(''request.jwt.claims'', ''{"tenant_id": "tenant_1"}'', true)',
  'Set tenant context'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM users WHERE tenant_id = ''tenant_1''',
  'SELECT 1',
  'Can read own tenant users'
);
```

### Edge Function Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Webhook Verification', () => {
  it('should verify valid webhook signature', () => {
    const payload = JSON.stringify({ test: 'data' });
    const secret = 'test-secret';
    const signature = generateHMAC(payload, secret);

    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
  });
});
```

## Best Practices

### Tenant Isolation
1. **Always validate tenant context** on every request
2. **Use RLS policies** for all tenant-specific tables
3. **Implement proper JWT claims** for tenant identification
4. **Test cross-tenant access** thoroughly

### Security
1. **Enable all security headers** in production
2. **Use short-lived tokens** for API keys
3. **Implement proper rate limiting** per tenant
4. **Log all security events** for audit trails

### Performance
1. **Index tenant_id columns** properly
2. **Use connection pooling** for multi-tenant access
3. **Implement caching** for tenant configurations
4. **Monitor quota usage** to prevent abuse

## Examples

See `example-usage.ts` for comprehensive examples of:
- System initialization
- Tenant management
- Rate limiting enforcement
- Quota management
- Audit logging
- API key management
- Edge functions
- Security headers
- Metrics monitoring
- Configuration management
- Complete SaaS workflows
- Testing and validation

## Health Monitoring

```typescript
// Check system health
const health = await supabaseSaaSAdvanced.getHealthStatus();
console.log(`SaaS system healthy: ${health.overall}`);
```

## Contributing

1. Follow security best practices
2. Implement proper tenant isolation
3. Add comprehensive test coverage
4. Update documentation for new features
5. Ensure compliance with data protection regulations

## License

MIT License - see LICENSE file for details.

---

**A starter enforcement layer for building multi-tenant SaaS without cross-tenant leaks.**

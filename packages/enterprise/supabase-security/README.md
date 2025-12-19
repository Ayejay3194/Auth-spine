# Supabase Security & Architecture Pack

Luxury Booking Platform – Hardened Setup

This pack gives you **Supabase-first security** with:
- **Auth + MFA**
- **Row Level Security (RLS)**
- **Ops vs Public separation**
- **Storage security**
- **Audit logging**
- **Production-safe defaults**

This is the *correct* way to use Supabase for a multi-role booking platform.

## What's Inside

### Authentication & Authorization
- **Multi-factor authentication (MFA)** with TOTP support
- **Single Sign-On (SSO)** integration
- **Strong password policies** with complexity requirements
- **Session management** with configurable timeouts
- **Account lockout** protection against brute force
- **Passwordless authentication** options
- **Role-based access control** (Admin, Operator, User, Guest)

### Row Level Security (RLS)
- **Tenant isolation** for multi-tenant applications
- **Role-based data access** controls
- **Cross-tenant leak prevention**
- **Fine-grained permissions** per table and operation
- **Automatic policy enforcement** on all database operations
- **Service role bypass** for administrative tasks

### Storage Security
- **Virus scanning** for all uploaded files
- **Content validation** and type checking
- **File size limits** and type restrictions
- **Signed URLs** with expiration
- **Version control** for file management
- **Tenant-isolated storage buckets**

### Audit Logging
- **Comprehensive event logging** for all security events
- **Real-time monitoring** and alerting
- **Tamper-evident audit trails**
- **Configurable retention** policies
- **Security incident tracking** and management
- **Compliance reporting** capabilities

### Operations Separation
- **Separate ops database** for administrative operations
- **Role-based ops access** (ops_admin, ops_user)
- **Ops audit logging** for all administrative actions
- **Secure connection management** with timeouts
- **Query execution logging** and monitoring

### Production Configuration
- **SSL/TLS encryption** with modern cipher suites
- **Automated backups** with compression and encryption
- **Performance monitoring** and metrics collection
- **Real-time alerts** for security events
- **Rate limiting** per user, IP, and tenant
- **CORS configuration** for web applications

## Quick Start

```bash
npm install @auth-spine/supabase-security
```

```typescript
import { supabaseSecurity } from '@auth-spine/supabase-security';

// Initialize the security system
await supabaseSecurity.initialize();

// Authenticate with MFA
const auth = await supabaseSecurity.authenticate({
  email: 'admin@luxurybooking.com',
  password: 'SecurePassword123!',
  mfaCode: '123456',
  tenantId: 'tenant_1'
});

// Validate session and permissions
const session = await supabaseSecurity.validateSession(auth.session!.id, ['users:read']);

// Enforce RLS on database operations
const rls = await supabaseSecurity.enforceRLS({
  table: 'bookings',
  operation: 'SELECT',
  userId: 'user_1',
  tenantId: 'tenant_1'
});

// Secure file upload
const upload = await supabaseSecurity.secureUpload({
  name: 'property-image.jpg',
  type: 'image/jpeg',
  size: 1024 * 1024,
  content: fileBuffer,
  userId: 'user_1',
  tenantId: 'tenant_1'
});
```

## API Reference

### Main Class: SupabaseSecurity

#### Initialization

```typescript
await supabaseSecurity.initialize();
```

#### Authentication

```typescript
// Authenticate user
const result = await supabaseSecurity.authenticate({
  email: string;
  password: string;
  mfaCode?: string;
  tenantId?: string;
});

// Returns: { success, user?, session?, requiresMFA?, error? }

// Validate session
const validation = await supabaseSecurity.validateSession(
  sessionToken: string,
  requiredPermissions?: string[]
);

// Returns: { valid, user?, permissions, error? }
```

#### Row Level Security

```typescript
// Enforce RLS on operations
const result = await supabaseSecurity.enforceRLS({
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  userId: string;
  tenantId?: string;
  data?: any;
});

// Returns: { allowed, reason?, modifiedQuery? }
```

#### Storage Security

```typescript
// Secure file upload
const result = await supabaseSecurity.secureUpload({
  name: string;
  type: string;
  size: number;
  content: Buffer;
  userId: string;
  tenantId?: string;
});

// Returns: { success, url?, error?, virusDetected? }

// Generate secure download URL
const url = await supabaseSecurity.generateSecureURL(
  path: string,
  {
    userId: string;
    tenantId?: string;
    expiresIn?: number;
  }
);

// Returns: { url, expiresAt }
```

#### Audit Logging

```typescript
// Log security event
await supabaseSecurity.logSecurityEvent({
  type: 'auth' | 'data_access' | 'schema_change' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  tenantId?: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
});

// Query events
const events = await supabaseSecurity.queryEvents({
  type?: string;
  severity?: string;
  userId?: string;
  tenantId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
});
```

#### Security Incidents

```typescript
// Create security incident
const incident = await supabaseSecurity.createSecurityIncident({
  type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers?: number;
  affectedData?: string[];
});

// Get active incidents
const activeIncidents = await supabaseSecurity.getActiveIncidents();

// Update incident
const updated = await supabaseSecurity.updateIncident(incidentId, {
  status?: 'open' | 'investigating' | 'contained' | 'resolved';
  actions?: Array<{ action, performedBy, performedAt, description }>;
  lessons?: string[];
});
```

## Database Schema

### Core Security Tables

```sql
-- Users with security fields
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'operator', 'user', 'guest')),
  tenant_id text NOT NULL,
  mfa_enabled boolean DEFAULT false,
  mfa_secret text,
  passwordless_enabled boolean DEFAULT false,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,
  password_changed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security audit logs
CREATE TABLE security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  severity text NOT NULL,
  user_id uuid REFERENCES users(id),
  tenant_id text,
  action text NOT NULL,
  resource text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false
);

-- Security incidents
CREATE TABLE security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  description text NOT NULL,
  affected_users integer DEFAULT 0,
  affected_data text[],
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  actions jsonb DEFAULT '[]',
  lessons text[] DEFAULT '{}'
);
```

### RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation ON users
FOR ALL TO authenticated
USING (tenant_id = request.tenant_id())
WITH CHECK (tenant_id = request.tenant_id());

-- Role-based access policies
CREATE POLICY role_based_access ON users
FOR SELECT TO authenticated
USING (
  CASE 
    WHEN request.role() = 'admin' THEN true
    WHEN request.role() = 'operator' THEN true
    WHEN request.role() = 'user' AND id = request.user_id() THEN true
    ELSE false
  END
);
```

## Configuration

```typescript
interface SecurityConfig {
  authentication: {
    enableMFA: boolean;
    enableSSO: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventReuse: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    enablePasswordless: boolean;
  };
  rowLevelSecurity: {
    enabled: boolean;
    enforceOnAllTables: boolean;
    bypassForServiceRole: boolean;
    enableTenantIsolation: boolean;
    enableRoleBasedAccess: boolean;
  };
  storage: {
    enableVirusScanning: boolean;
    enableContentValidation: boolean;
    maxFileSize: number;
    allowedTypes: string[];
    enableSignedURLs: boolean;
    urlExpiration: number;
    enableVersioning: boolean;
  };
  audit: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
    logFailedAuth: boolean;
    logDataAccess: boolean;
    logSchemaChanges: boolean;
    enableRealTime: boolean;
  };
  ops: {
    enableOpsSeparation: boolean;
    opsDatabase: string;
    publicDatabase: string;
    enableOpsAuth: boolean;
    opsRoles: string[];
    enableOpsAudit: boolean;
  };
  production: {
    enableSSL: boolean;
    enableBackup: boolean;
    backupRetention: number;
    enableMonitoring: boolean;
    enableAlerts: boolean;
    enableRateLimiting: boolean;
    enableCORS: boolean;
    allowedOrigins: string[];
  };
}
```

## Security Features

### Authentication Security
- **Multi-factor authentication** with TOTP
- **Strong password policies** with complexity requirements
- **Account lockout** after failed attempts
- **Session management** with automatic expiration
- **Passwordless authentication** options
- **SSO integration** for enterprise environments

### Data Protection
- **Row Level Security** for tenant isolation
- **Role-based access control** for all operations
- **Cross-tenant leak prevention**
- **Audit logging** for all data access
- **Encryption at rest** and in transit
- **Secure file storage** with virus scanning

### Monitoring & Alerting
- **Real-time security monitoring**
- **Automated threat detection**
- **Security incident management**
- **Compliance reporting**
- **Performance monitoring**
- **Custom alert rules**

### Production Hardening
- **SSL/TLS encryption** with modern ciphers
- **Automated backups** with encryption
- **Rate limiting** and DDoS protection
- **CORS configuration** for web apps
- **Security headers** for browsers
- **Operations separation** for admin tasks

## Integration Examples

### Next.js Integration

```typescript
// pages/api/auth/login.ts
import { supabaseSecurity } from '@auth-spine/supabase-security';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, mfaCode } = req.body;
    
    const result = await supabaseSecurity.authenticate({
      email,
      password,
      mfaCode,
      tenantId: req.headers['x-tenant-id']
    });

    if (result.success) {
      res.status(200).json({ 
        user: result.user,
        session: result.session 
      });
    } else {
      res.status(401).json({ 
        error: result.error,
        requiresMFA: result.requiresMFA 
      });
    }
  }
}
```

### Middleware for Session Validation

```typescript
// middleware/auth.ts
import { supabaseSecurity } from '@auth-spine/supabase-security';

export async function validateAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const validation = await supabaseSecurity.validateSession(token);
  
  if (!validation.valid) {
    return res.status(401).json({ error: validation.error });
  }

  req.user = validation.user;
  req.permissions = validation.permissions;
  next();
}
```

### File Upload Handler

```typescript
// pages/api/upload.ts
import { supabaseSecurity } from '@auth-spine/supabase-security';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { file, userId, tenantId } = req.body;
    
    const result = await supabaseSecurity.secureUpload({
      name: file.name,
      type: file.type,
      size: file.size,
      content: Buffer.from(file.content, 'base64'),
      userId,
      tenantId
    });

    if (result.success) {
      res.status(200).json({ url: result.url });
    } else {
      res.status(400).json({ 
        error: result.error,
        virusDetected: result.virusDetected 
      });
    }
  }
}
```

## Best Practices

### Authentication
1. **Enable MFA** for all admin and operator accounts
2. **Use strong password policies** with regular expiration
3. **Implement account lockout** after failed attempts
4. **Monitor authentication** for suspicious patterns
5. **Use session timeouts** appropriate for sensitivity

### Data Security
1. **Enable RLS on all tables** with tenant isolation
2. **Use role-based access** for all operations
3. **Log all data access** for audit trails
4. **Encrypt sensitive data** at rest and in transit
5. **Regular security reviews** of access patterns

### Operations
1. **Separate ops and public databases**
2. **Use dedicated ops roles** with minimal privileges
3. **Audit all administrative actions**
4. **Use secure connections** for ops access
5. **Implement backup verification** procedures

## Examples

See `example-usage.ts` for comprehensive examples of:
- System initialization
- Authentication with MFA
- Session validation and permissions
- Row Level Security enforcement
- Secure file upload and storage
- Security event logging and monitoring
- Security incident management
- User security profiles
- Security metrics and reporting
- Production configuration
- Complete security workflows
- Configuration management

## Health Monitoring

```typescript
// Check system health
const health = await supabaseSecurity.getHealthStatus();
console.log(`Security system healthy: ${health.overall}`);
console.log(`Security score: ${health.securityScore}/100`);
```

## Contributing

1. Follow security best practices
2. Implement comprehensive testing
3. Update documentation for new features
4. Ensure compliance with security standards
5. Use proper error handling and logging

## License

MIT License - see LICENSE file for details.

---

**The hardened Supabase security setup for luxury booking platforms.**

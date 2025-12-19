# Beauty Booking Security Pack

A **drop-in security kit** for beauty booking platforms with comprehensive domain separation, RBAC/ABAC, and compliance features.

This pack gives you **enterprise-grade security** with:
- **Domain separation** (public vs studio vs ops)
- **RBAC/ABAC patterns** with dynamic permissions
- **Security headers** and CSP templates
- **Rate limiting** and brute force protection
- **Audit logging** with PII access tracking
- **Incident response** playbooks and automation
- **CI security gates** (SAST, deps scan, secret scan, SBOM)
- **Threat modeling** and data flow analysis
- **Compliance evidence** collection (SOC2, GDPR, CCPA)

This is the *correct* way to secure beauty booking platforms with proper isolation and regulatory compliance.

## What's Inside

### Domain Separation & Isolation
- **Multi-domain architecture** (app., studio., ops.)
- **Cross-domain isolation** with strict security controls
- **Network segmentation** between operational domains
- **Context-aware security** policies per domain
- **Domain-specific CSP** and security headers

### Authentication & Authorization
- **Role-based access control** (Customer, Stylist, Manager, Admin)
- **Attribute-based access control** with dynamic permissions
- **Location and time-based restrictions**
- **IP whitelisting** for sensitive operations
- **Privilege escalation prevention**

### Security Headers & CSP
- **Comprehensive security headers** for all domains
- **Content Security Policy** tailored per domain
- **CSRF protection** with token validation
- **HSTS** and transport security
- **X-Frame-Options** and clickjacking protection

### Rate Limiting & Protection
- **Domain-specific rate limits** (100/500/1000/2000 req/min)
- **Brute force protection** with account lockout
- **IP-based and user-based limiting**
- **Configurable windows** and burst handling
- **Real-time monitoring** and alerts

### Audit Logging & Monitoring
- **Comprehensive event logging** for all security events
- **PII access tracking** with detailed audit trails
- **Real-time alerts** for critical events
- **Configurable retention** policies (2555 days default)
- **Evidence collection** for compliance

### Incident Response
- **Automated incident creation** and escalation
- **Response playbooks** for different incident types
- **Multi-channel notifications** (email, Slack, SMS)
- **Status tracking** and resolution workflows
- **Post-incident reviews** and lessons learned

### CI/CD Security Gates
- **Static Application Security Testing (SAST)**
- **Dependency scanning** with vulnerability detection
- **Secret scanning** across codebase
- **Container security** scanning
- **Software Bill of Materials (SBOM)** generation
- **Compliance checks** in pipeline

### Threat Modeling
- **STRIDE analysis** for all components
- **Data flow diagrams** and trust boundaries
- **Attack tree analysis** for critical assets
- **Risk assessment** and mitigation planning
- **Security controls** mapping

### Compliance & Evidence
- **SOC2 compliance** evidence collection
- **GDPR data protection** procedures
- **CCPA privacy** requirements
- **Automated reporting** and metrics
- **Evidence management** with approval workflows

## Quick Start

```bash
npm install @auth-spine/beauty-booking-security
```

```typescript
import { beautyBookingSecurity } from '@auth-spine/beauty-booking-security';

// Initialize the security system
await beautyBookingSecurity.initialize();

// Get domain context
const context = await beautyBookingSecurity.getDomainContext('app.beautybooking.com');

// Check user permissions
const permissions = await beautyBookingSecurity.checkPermissions(
  'stylist_123',
  'bookings',
  'write',
  { location: 'salon', time: '14:00' }
);

// Enforce rate limiting
const rateLimit = await beautyBookingSecurity.enforceRateLimit(
  '192.168.1.100',
  'public'
);

// Log security event
await beautyBookingSecurity.logEvent({
  type: 'authentication',
  severity: 'medium',
  userId: 'customer_456',
  domain: 'public',
  action: 'user.login.success',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});
```

## API Reference

### Main Class: BeautyBookingSecurity

#### Initialization

```typescript
await beautyBookingSecurity.initialize();
```

#### Domain Management

```typescript
// Get domain context
const context = await beautyBookingSecurity.getDomainContext(hostname);

// Returns: { domain, context, securityHeaders }

// Validate domain separation
const validation = await beautyBookingSecurity.validateDomainSeparation();

// Returns: { valid, violations }
```

#### Permission Management

```typescript
// Check permissions
const result = await beautyBookingSecurity.checkPermissions(
  userId: string,
  resource: string,
  action: string,
  context?: any
);

// Returns: { allowed, reason?, permissions }
```

#### Rate Limiting

```typescript
// Enforce rate limit
const result = await beautyBookingSecurity.enforceRateLimit(
  identifier: string,
  domain: 'public' | 'studio' | 'ops'
);

// Returns: { allowed, remaining, resetTime, retryAfter? }
```

#### Security Headers

```typescript
// Get security headers for domain
const headers = beautyBookingSecurity.getSecurityHeaders(domain);

// Returns: Record<string, string>
```

#### Audit Logging

```typescript
// Log security event
await beautyBookingSecurity.logEvent({
  type: 'authentication' | 'authorization' | 'data_access' | 'pii_access' | 'security_violation',
  severity: 'low' | 'medium' | 'high' | 'critical',
  userId?: string,
  domain: 'public' | 'studio' | 'ops',
  action: string,
  resource?: string,
  piiData?: boolean,
  ipAddress: string,
  userAgent: string,
  details?: Record<string, any>
});
```

#### Incident Management

```typescript
// Create incident
const incident = await beautyBookingSecurity.createIncident({
  type: 'data_breach' | 'security_incident' | 'service_outage' | 'compliance_violation',
  severity: 'low' | 'medium' | 'high' | 'critical',
  title: string,
  description: string,
  affectedDomains: ('public' | 'studio' | 'ops')[],
  affectedUsers?: number
});

// Get active incidents
const incidents = await beautyBookingSecurity.getActiveIncidents();
```

#### Compliance

```typescript
// Generate compliance report
const report = await beautyBookingSecurity.generateComplianceReport(
  framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA',
  period: { start: Date, end: Date }
);

// Returns: ComplianceReport
```

## Domain Architecture

### Public Domain (`app.beautybooking.com`)
- **Purpose**: Customer-facing booking platform
- **Security**: Strict CSP, rate limiting, public access controls
- **Headers**: X-Frame-Options: DENY, strict CSP
- **Rate Limit**: 100 requests/minute per IP

### Studio Domain (`studio.beautybooking.com`)
- **Purpose**: Stylist management and scheduling
- **Security**: Professional access, same-origin policies
- **Headers**: X-Frame-Options: SAMEORIGIN, moderate CSP
- **Rate Limit**: 500 requests/minute per user

### Operations Domain (`ops.beautybooking.com`)
- **Purpose**: Administrative operations and management
- **Security**: IP restrictions, enhanced monitoring
- **Headers**: X-Frame-Options: DENY, strict CSP
- **Rate Limit**: 1000 requests/minute per admin

## Configuration

```typescript
interface SecurityConfig {
  separation: {
    enableDomainSeparation: boolean;
    domains: {
      public: string;
      studio: string;
      ops: string;
    };
    enableCrossDomainIsolation: boolean;
    enableNetworkSegmentation: boolean;
  };
  rbac: {
    enableRBAC: boolean;
    enableABAC: boolean;
    roles: Record<UserRole, string[]>;
    attributes: string[];
    enableDynamicPermissions: boolean;
  };
  security: {
    enableCSRFProtection: boolean;
    enableSecurityHeaders: boolean;
    enableCSP: boolean;
    enableHSTS: boolean;
    enableXFrameOptions: boolean;
    enableXContentTypeOptions: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    rules: Record<UserRole, { requests: number; window: number }>;
    enableBruteForceProtection: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
  audit: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    logPIIAccess: boolean;
    logDataChanges: boolean;
    logAuthentication: boolean;
    retentionDays: number;
    enableRealTimeAlerts: boolean;
  };
  incident: {
    enableIncidentResponse: boolean;
    severityLevels: SeverityLevel[];
    autoEscalation: boolean;
    notificationChannels: string[];
    responsePlaybooks: boolean;
  };
  compliance: {
    enableSOC2: boolean;
    enableGDPR: boolean;
    enableCCPA: boolean;
    enableHIPAA: boolean;
    evidenceCollection: boolean;
    auditTrail: boolean;
    dataRetention: boolean;
  };
}
```

## Security Features

### Authentication Security
- **Multi-factor authentication** support
- **Role-based access control** with least privilege
- **Attribute-based access** with context awareness
- **Session management** with proper timeouts
- **Account lockout** protection

### Data Protection
- **Domain isolation** prevents cross-domain data leaks
- **PII access logging** for compliance
- **Encryption at rest** and in transit
- **Data masking** for sensitive information
- **Audit trails** for all data access

### Network Security
- **Rate limiting** prevents abuse and attacks
- **DDoS protection** with automatic blocking
- **IP whitelisting** for sensitive operations
- **Network segmentation** between domains
- **Security headers** protect against common attacks

### Monitoring & Alerting
- **Real-time monitoring** of security events
- **Automated alerts** for critical incidents
- **Comprehensive logging** with retention policies
- **Security metrics** and reporting
- **Threat detection** and response

## Integration Examples

### Next.js Middleware

```typescript
// middleware.ts
import { beautyBookingSecurity } from '@auth-spine/beauty-booking-security';

export async function middleware(req) {
  const hostname = req.headers.get('host') || '';
  
  // Get domain context
  const context = await beautyBookingSecurity.getDomainContext(hostname);
  
  // Apply security headers
  Object.entries(context.securityHeaders).forEach(([key, value]) => {
    req.headers.set(key, value);
  });
  
  // Rate limiting
  const clientIP = req.ip || req.headers.get('x-forwarded-for');
  const rateLimit = await beautyBookingSecurity.enforceRateLimit(
    clientIP,
    context.domain
  );
  
  if (!rateLimit.allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  return NextResponse.next();
}
```

### Express.js Integration

```typescript
// app.ts
import express from 'express';
import { beautyBookingSecurity } from '@auth-spine/beauty-booking-security';

const app = express();

// Security middleware
app.use(async (req, res, next) => {
  const hostname = req.hostname;
  const context = await beautyBookingSecurity.getDomainContext(hostname);
  
  // Apply security headers
  Object.entries(context.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  next();
});

// Rate limiting middleware
app.use('/api', async (req, res, next) => {
  const clientIP = req.ip;
  const domain = req.hostname.includes('studio') ? 'studio' : 'public';
  
  const rateLimit = await beautyBookingSecurity.enforceRateLimit(clientIP, domain);
  
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
});
```

### Authentication Endpoint

```typescript
// routes/auth.ts
app.post('/api/auth/login', async (req, res) => {
  const { email, password, mfaCode } = req.body;
  const clientIP = req.ip;
  
  try {
    // Log authentication attempt
    await beautyBookingSecurity.logEvent({
      type: 'authentication',
      severity: 'medium',
      userId: email,
      domain: 'public',
      action: 'user.login.attempt',
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'],
      details: { method: 'password' }
    });
    
    // Authenticate user (your logic here)
    const user = await authenticateUser(email, password, mfaCode);
    
    if (user) {
      // Log successful login
      await beautyBookingSecurity.logEvent({
        type: 'authentication',
        severity: 'low',
        userId: user.id,
        domain: 'public',
        action: 'user.login.success',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent']
      });
      
      res.json({ user, token: generateToken(user) });
    } else {
      // Log failed login
      await beautyBookingSecurity.logEvent({
        type: 'authentication',
        severity: 'medium',
        userId: email,
        domain: 'public',
        action: 'user.login.failed',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent']
      });
      
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});
```

## Compliance

### SOC2 Compliance
- **Control environment** documentation
- **Risk assessment** procedures
- **Monitoring activities** logging
- **Access controls** with audit trails
- **Change management** processes
- **System operations** monitoring
- **Logical and physical access** controls

### GDPR Compliance
- **Lawful basis** for data processing
- **Data subject rights** implementation
- **Consent management** procedures
- **Data protection** by design
- **Security of processing** measures
- **Breach notification** procedures
- **Data protection** impact assessments

### CCPA Compliance
- **Right to know** implementation
- **Right to delete** procedures
- **Right to opt-out** mechanisms
- **Non-discrimination** policies
- **Privacy notice** updates
- **Data brokerage** opt-outs
- **Consumer request** tracking

## Examples

See `example-usage.ts` for comprehensive examples of:
- System initialization and domain context
- RBAC/ABAC permission checking
- Rate limiting enforcement
- Security headers and CSP
- Audit logging and monitoring
- Incident response management
- Compliance reporting
- Security assessments
- Threat modeling
- Domain separation validation
- Complete security workflows
- Configuration management

## Health Monitoring

```typescript
// Check system health
const health = await beautyBookingSecurity.getHealthStatus();
console.log(`Security system healthy: ${health.overall}`);
console.log(`Security score: ${health.securityScore}/100`);
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/security.yml
name: Security Checks
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run SAST
        uses: securecodewarrior/github-action-add-sarif@v1
      - name: Dependency Scan
        run: npm audit
      - name: Secret Scan
        uses: trufflesecurity/trufflehog@main
```

### Docker Security

```dockerfile
# Dockerfile
FROM node:18-alpine
RUN npm install @auth-spine/beauty-booking-security
COPY . .
RUN npm run security:check
CMD ["npm", "start"]
```

## Best Practices

### Domain Separation
1. **Use strict CSP** policies for each domain
2. **Implement proper CORS** configurations
3. **Monitor cross-domain** access attempts
4. **Regular security reviews** of domain configurations
5. **Network segmentation** between domains

### Access Control
1. **Apply principle of least privilege**
2. **Use role-based access** for permissions
3. **Implement attribute-based** controls for context
4. **Regular access reviews** and cleanup
5. **Monitor privilege escalation** attempts

### Monitoring & Logging
1. **Log all security events** with proper context
2. **Implement real-time alerts** for critical events
3. **Regular security metrics** review
4. **Maintain audit trails** for compliance
5. **Monitor PII access** patterns

### Incident Response
1. **Have documented playbooks** for all scenarios
2. **Test incident response** procedures regularly
3. **Automate escalation** where possible
4. **Post-incident reviews** for learning
5. **Maintain communication** plans

## Contributing

1. Follow security best practices
2. Implement comprehensive testing
3. Update documentation for new features
4. Ensure compliance with security standards
5. Use proper error handling and logging

## License

MIT License - see LICENSE file for details.

---

**The comprehensive security kit for beauty booking platforms.**

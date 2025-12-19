# Security Governance & Enforcement Layer

This repository turns security requirements into ENFORCED controls. No control = no deploy.

## Purpose

- **Enforce Security Controls** - Turn security policies into automated enforcement
- **CI/CD Security Gates** - Block deployments that don't meet security requirements
- **AI Trust Boundary Enforcement** - Prevent unauthorized AI data access and operations
- **Explicit Risk Acceptance** - Manage and track security risk acceptances with expiration
- **Runtime Enforcement** - Enforce security controls at application runtime
- **Comprehensive Auditing** - Complete audit trail of all security events

## Key Concepts

- **Control Registry** - Authoritative registry of all security controls
- **CI Security Gates** - Automated security validation in CI/CD pipeline
- **AI Trust Boundary** - Security boundaries for AI operations
- **Risk Acceptance** - Formal process for accepting security risks
- **Runtime Enforcement** - Real-time security control enforcement

## Features

- **Security Control Management** - Define, validate, and enforce security controls
- **Multi-Stage Security Gates** - Pre-commit, build, test, deploy, and runtime gates
- **Risk Acceptance Workflow** - Request, approve, and manage security exceptions
- **AI Security Boundaries** - Prevent unauthorized AI data access and model execution
- **Runtime Security Enforcement** - Data sanitization, access control, encryption, and audit
- **Comprehensive Audit Logging** - Complete security event tracking and reporting
- **Compliance Reporting** - Automated compliance assessment and reporting

## Installation

```bash
npm install @auth-spine/security-governance
```

## Quick Start

```typescript
import { securityGovernance } from '@auth-spine/security-governance';

// Initialize the security governance system
await securityGovernance.initialize();

// Add a security control
const control = securityGovernance.addControl({
  description: 'TLS enforced for all traffic',
  severity: 'CRITICAL',
  enforcement: 'CI',
  evidence: 'https_redirect + HSTS headers',
  status: 'REQUIRED',
  category: 'authentication'
});

// Run security gates
const result = await securityGovernance.runSecurityGates('deploy', {
  environment: 'production'
});

if (!result.success) {
  console.log('Deployment blocked due to security violations');
  result.violations.forEach(v => console.log(v.message));
}
```

## API Reference

### Main Class: SecurityGovernance

#### Initialization

```typescript
await securityGovernance.initialize();
```

#### Security Control Management

```typescript
// Add control
const control = securityGovernance.addControl({
  description: 'Control description',
  severity: 'CRITICAL',
  enforcement: 'CI',
  evidence: 'Implementation evidence',
  status: 'REQUIRED',
  category: 'authentication',
  framework: ['OWASP', 'NIST'],
  implementation: {
    type: 'code',
    location: 'path/to/implementation',
    automated: true
  },
  validation: {
    type: 'test',
    script: 'test-script.js',
    frequency: 'build'
  }
});

// Get controls
const allControls = securityGovernance.getAllControls();
const criticalControls = securityGovernance.getAllControls().filter(c => c.severity === 'CRITICAL');
```

#### Security Gates

```typescript
// Run security gates
const result = await securityGovernance.runSecurityGates('deploy', {
  environment: 'production',
  branch: 'main'
});

// Add custom gate
const gate = securityGovernance.addGate({
  name: 'Custom Security Gate',
  description: 'Custom security validation',
  stage: 'deploy',
  controls: ['SEC-001', 'SEC-002'],
  enforcement: 'BLOCK',
  config: { /* gate config */ },
  enabled: true
});
```

#### Risk Acceptance

```typescript
// Request risk acceptance
const acceptance = securityGovernance.requestRiskAcceptance({
  controlId: 'SEC-001',
  reason: 'Temporary exception for legacy system',
  owner: 'team@company.com',
  approver: 'security@company.com',
  expirationDate: new Date('2024-12-31'),
  mitigationPlan: 'Plan to address the security issue'
});

// Approve risk acceptance
securityGovernance.approveRiskAcceptance(acceptance.id, 'security@company.com');

// Get active acceptances
const activeAcceptances = securityGovernance.getActiveRiskAcceptances();
```

#### AI Trust Boundary

```typescript
// Check AI operation
const result = securityGovernance.checkAITrustBoundary({
  type: 'data-access',
  model: 'gpt-4',
  dataType: 'public',
  operation: 'SELECT analytics',
  userId: 'user-123'
});

if (!result.allowed) {
  console.log('AI operation blocked:', result.violation?.description);
}

// Get AI violations
const violations = securityGovernance.getAIViolations();
```

#### Runtime Enforcement

```typescript
// Enforce runtime security
const result = securityGovernance.enforceRuntime({
  operation: 'access-sensitive-data',
  user: 'user-123',
  permissions: ['read'],
  data: { /* data to process */ }
});

if (!result.success) {
  console.log('Operation blocked due to security policy');
}
```

## Configuration

```typescript
interface SecurityConfig {
  enforceControls: boolean;        // Enable control enforcement
  blockOnFailure: boolean;         // Block on security failures
  requireRiskAcceptance: boolean;   // Require risk acceptance for exceptions
  enableRuntimeEnforcement: boolean; // Enable runtime enforcement
  enableCIGates: boolean;          // Enable CI/CD security gates
  enableAITrustBoundary: boolean;  // Enable AI trust boundaries
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  auditRetention: number;          // Audit retention period in days
  riskAcceptanceExpiration: number; // Default expiration in days
  controlCategories: string[];     // Enabled control categories
}
```

## Security Controls

### Control Types

- **Authentication** - Identity and access management controls
- **Authorization** - Permission and privilege controls
- **Data Protection** - Encryption, sanitization, and privacy controls
- **AI Security** - AI-specific security controls
- **Infrastructure** - System and network security controls
- **Logging** - Audit and monitoring controls
- **Monitoring** - Security monitoring and alerting

### Enforcement Types

- **CI** - Enforced during CI/CD pipeline
- **RUNTIME** - Enforced at application runtime
- **MANUAL** - Requires manual validation
- **AUTOMATED** - Automatically validated and enforced

### Severity Levels

- **CRITICAL** - Must be implemented, blocks deployment
- **HIGH** - Strongly recommended, may block in strict mode
- **MEDIUM** - Recommended, warnings in non-strict mode
- **LOW** - Optional, informational only

## Security Gates

### Gate Stages

1. **Pre-commit** - Local development checks
2. **Commit** - Repository validation
3. **Build** - Build-time security validation
4. **Test** - Security testing integration
5. **Deploy** - Pre-deployment security checks
6. **Runtime** - Production security enforcement

### Gate Configuration

```typescript
const gate = {
  name: 'Production Security Gate',
  stage: 'deploy',
  controls: ['SEC-AUTH-001', 'SEC-DATA-004'],
  enforcement: 'BLOCK',  // BLOCK | WARN | LOG
  conditions: {
    environment: ['production'],
    branch: ['main', 'release/*']
  },
  config: {
    runPenetrationTests: false,
    validateCertificates: true
  },
  enabled: true
};
```

## AI Trust Boundary

### Boundary Types

- **Data Access** - Controls AI access to sensitive data
- **Model Execution** - Controls which AI models can be executed
- **API Calls** - Controls external API calls made by AI
- **File Operations** - Controls file system access by AI

### Boundary Configuration

```typescript
const boundary = {
  name: 'Database Access Control',
  type: 'data-access',
  restrictions: {
    allowedModels: ['gpt-4', 'claude-3'],
    allowedDataTypes: ['public', 'analytics'],
    blockedOperations: ['SELECT *', 'DELETE', 'UPDATE'],
    maxTokens: 4000
  },
  enforcement: 'STRICT',  // STRICT | PERMISSIVE | MONITOR
  monitoring: {
    logLevel: 'WARN',
    auditLog: true,
    realTimeAlerts: true
  }
};
```

## Risk Acceptance

### Acceptance Process

1. **Request** - Team requests risk acceptance for a control
2. **Review** - Security team reviews the request
3. **Approval** - Risk acceptance approved by authorized person
4. **Tracking** - System tracks acceptance and expiration
5. **Expiration** - Acceptances automatically expire and block deploys

### Acceptance Fields

```typescript
const riskAcceptance = {
  controlId: 'SEC-001',
  reason: 'Detailed reason for acceptance',
  owner: 'team@company.com',
  approver: 'security@company.com',
  expirationDate: new Date('2024-12-31'),
  mitigationPlan: 'Plan to address the security issue',
  evidence: ['evidence1.pdf', 'evidence2.doc']
};
```

## Runtime Enforcement

### Enforcement Types

- **Data Sanitization** - Automatically sanitize sensitive data
- **Access Control** - Enforce authentication and authorization
- **Encryption** - Ensure data encryption at rest and in transit
- **Audit** - Log all security-relevant events
- **Rate Limiting** - Prevent abuse and DoS attacks

### Enforcement Configuration

```typescript
const enforcement = {
  name: 'Data Sanitization',
  type: 'data-sanitization',
  config: {
    sanitizePII: true,
    sanitizeCredentials: true,
    allowedFields: ['id', 'name'],
    blockedFields: ['password', 'ssn', 'credit_card']
  },
  enabled: true,
  enforcement: 'SANITIZE'  // BLOCK | SANITIZE | LOG | ALERT
};
```

## Audit and Monitoring

### Audit Events

- **CONTROL_VALIDATION** - Security control validation results
- **VIOLATION** - Security policy violations
- **RISK_ACCEPTANCE** - Risk acceptance events
- **COMPLIANCE_CHECK** - Compliance assessment results

### Monitoring Features

- Real-time security event logging
- Comprehensive audit trails
- Security metrics and dashboards
- Automated compliance reporting
- Alert and notification system

## Compliance Reporting

### Supported Frameworks

- **OWASP** - Web application security
- **NIST** - Cybersecurity framework
- **SOC2** - Service organization controls
- **ISO27001** - Information security management
- **GDPR** - Data protection regulation
- **HIPAA** - Healthcare information protection

### Report Features

- Automated compliance scoring
- Gap analysis and recommendations
- Risk assessment and tracking
- Historical compliance trends
- Executive summary reports

## Integration Examples

### CI/CD Pipeline Integration

```yaml
# GitHub Actions example
- name: Security Gates
  run: |
    npx @auth-spine/security-governance run-gates \
      --stage deploy \
      --environment ${{ github.ref_name }}
```

### Docker Integration

```dockerfile
# Runtime enforcement
COPY security-governance.config.js ./
RUN npx @auth-spine/security-governance enforce-runtime
```

### Kubernetes Integration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-governance
data:
  config.json: |
    {
      "enforceControls": true,
      "blockOnFailure": true,
      "enableRuntimeEnforcement": true
    }
```

## Best Practices

### Control Management

1. **Start Critical** - Begin with critical security controls
2. **Automate Everything** - Automate validation and enforcement
3. **Document Clearly** - Clear implementation and validation evidence
4. **Review Regularly** - Quarterly control reviews and updates
5. **Test Thoroughly** - Comprehensive testing of all controls

### Risk Acceptance

1. **Use Sparingly** - Risk acceptances should be exceptions, not the rule
2. **Set Clear Expirations** - Never accept indefinite risk
3. **Require Mitigation** - Always have a mitigation plan
4. **Track Everything** - Complete audit trail of all acceptances
5. **Review Regularly** - Monthly review of active acceptances

### AI Security

1. **Principle of Least Privilege** - Minimum necessary data access
2. **Strict Boundaries** - Enforce trust boundaries strictly
3. **Comprehensive Monitoring** - Log all AI operations
4. **Regular Reviews** - Review AI security policies quarterly
5. **Human Oversight** - Maintain human review and oversight

## Examples

See `example-usage.ts` for comprehensive examples of:
- System initialization
- Security control management
- Security gate execution
- Risk acceptance workflow
- AI trust boundary enforcement
- Runtime security enforcement
- Audit and monitoring
- Compliance reporting
- Configuration management
- Health checks
- Automated workflows

## Health Monitoring

```typescript
// Check system health
const health = await securityGovernance.getHealthStatus();
console.log(`Security governance healthy: ${health.overall}`);
```

## Contributing

1. Follow security best practices
2. Implement proper validation and error handling
3. Add comprehensive test coverage
4. Update documentation for new controls
5. Ensure compliance with security standards

## License

MIT License - see LICENSE file for details.

---

**No control = no deploy. Security governance that actually enforces security.**

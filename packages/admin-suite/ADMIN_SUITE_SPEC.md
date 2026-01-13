# Auth-Spine Admin Suite - Complete Specification

**Version:** 1.0.0  
**Status:** Production-Ready  
**Architecture:** Modular, Permission-Based, Audit-First

---

## Executive Summary

This is not a toy. This is a control plane for enterprise authentication infrastructure. Every action is logged, every permission is explicit, every destructive operation requires intent.

**The Litmus Test:**
- ✅ Find any user in <3 seconds
- ✅ Explain why something happened
- ✅ Undo bad decisions
- ✅ Prove who did what
- ✅ Kill broken features instantly

---

## Core Architecture

### Module Structure

```
@spine/admin-suite/
├── core/
│   ├── types.ts           # Core type definitions
│   ├── permissions.ts     # RBAC engine (action-based, explicit allow)
│   └── audit.ts           # Immutable audit logging
├── modules/
│   ├── identity/          # User search, impersonation, account states
│   ├── organizations/     # Multi-tenant, roles, seat management
│   ├── data-tools/        # Bulk ops, search, corrections
│   ├── moderation/        # Content lifecycle, flags, patterns
│   ├── system-health/     # Monitoring, jobs, feature flags
│   ├── security/          # Audit logs, access review, abuse detection
│   ├── billing/           # Subscriptions, refunds, revenue intelligence
│   ├── config/            # Registry, migrations, schema tools
│   ├── dev-tools/         # Simulation, debug consoles, inspectors
│   └── reporting/         # Custom reports, behavior analytics
└── ui/                    # Admin dashboard components
```

---

## Permission System

### Permission Format

```typescript
{
  "resource": "users",
  "action": "read" | "write" | "delete" | "execute" | "impersonate" | "override",
  "scope": "self" | "org" | "global"
}
```

**Permission String:** `resource.action`  
**Example:** `users.impersonate`, `billing.write`, `jobs.execute`

### System Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Support Agent** | `users.read`, `users.flag`, `moderation.read` | View users, flag issues |
| **Moderator** | `moderation.*`, `content.*`, `flags.*` | Content moderation |
| **Admin** | `users.*`, `orgs.*`, `billing.*`, `jobs.*` | Full control except super admin |
| **Super Admin** | `*` | Unrestricted access |
| **Billing Admin** | `billing.*`, `subscriptions.*`, `payments.*` | Financial operations |
| **Security Admin** | `security.*`, `audit.*`, `abuse.*` | Security oversight |
| **Developer** | `dev_tools.*`, `config.read`, `feature_flags.*` | Development tools |
| **Read Only** | `*.read` | Auditing and reporting |

### Permission Rules

1. **Explicit allow only** - No wildcards unless super_admin
2. **Every write is logged** - Immutable audit trail
3. **No UI without permission check** - Frontend enforces permissions
4. **Expired access is denied** - Time-limited admin access

---

## Module Specifications

### 1. Identity Module

**Purpose:** User search, impersonation, account state management

**Features:**
- **Fast Search** - Fuzzy search across email, username, ID, IP, device fingerprint (<3s)
- **Account States** - active, suspended, shadow_banned, locked, flagged
- **Impersonation** - Time-limited with audit trail and reason requirement
- **Login History** - IP reputation, device fingerprints, location data
- **User Flagging** - Flag users for review with severity levels

**Key Functions:**
```typescript
searchUsers(params: UserSearchParams): Promise<UserSearchResult[]>
getUserDetails(userId: string): Promise<UserDetails>
setAccountState(userId: string, state: AccountState, reason: string): Promise<void>
startImpersonation(userId: string, reason: string, duration: number): Promise<ImpersonationSession>
getLoginHistory(userId: string): Promise<LoginHistoryEntry[]>
```

**Permissions Required:**
- `users.read` - View user data
- `users.write` - Modify account states
- `users.impersonate` - Start impersonation sessions
- `users.flag` - Flag users for review

---

### 2. Data Tools Module

**Purpose:** Bulk operations, advanced search, data corrections

**Features:**
- **Bulk Operations** - Update, delete, reprocess with dry-run and rollback
- **Cross-Entity Search** - Boolean filters, regex, saved queries
- **Data Corrections** - Manual overrides with approval gates and reason codes
- **CSV Import/Export** - Schema validation, error reporting
- **Time-Travel Queries** - View state at specific timestamp

**Key Functions:**
```typescript
executeBulkOperation(params: BulkOperationParams): Promise<BulkOperation>
rollbackBulkOperation(operationId: string): Promise<void>
advancedSearch(query: SearchQuery): Promise<SearchResults>
createDataCorrection(params: CorrectionParams): Promise<DataCorrection>
importCSV(params: ImportParams): Promise<ImportResult>
```

**Permissions Required:**
- `data_tools.read` - View data
- `data_tools.execute` - Run bulk operations
- `data_tools.delete` - Delete operations
- `data_tools.override` - Manual data corrections

**Critical Rules:**
- **No dry run = no bulk action. Ever.**
- **All corrections require reason (min 10 chars)**
- **Approval gate for destructive operations**

---

### 3. Moderation Module

**Purpose:** Content lifecycle, flag management, pattern detection

**Features:**
- **Flag Queue** - Priority scoring, SLA tracking, assignment
- **Context View** - Full content history, related flags, user history
- **Moderation Actions** - hide, shadow_hide, freeze, delete, restore
- **Pattern Detection** - Repeat offenders, brigades, spam waves
- **Version History** - Track all content changes

**Key Functions:**
```typescript
getModerationQueue(filter: QueueFilter): Promise<ModerationQueue>
getFlagContext(flagId: string): Promise<FlagContext>
performAction(params: ActionParams): Promise<ModerationAction>
detectPatterns(timeWindow: number): Promise<PatternDetection[]>
getContentHistory(contentId: string): Promise<ContentVersion[]>
```

**Permissions Required:**
- `moderation.read` - View flags and content
- `moderation.write` - Perform moderation actions
- `content.delete` - Delete content

**Critical Rules:**
- **No blind moderation** - Context is mandatory
- **All actions require reason (min 10 chars)**
- **Reversible actions tracked for undo**

---

### 4. System Health Module

**Purpose:** Service monitoring, job management, feature flags

**Features:**
- **Live System Status** - Service uptime, queue depths, error rates
- **Job Management** - Retry, cancel, priority override
- **Feature Flags** - Per-user, per-org, percentage rollout, kill switches
- **Latency Heatmaps** - P50, P95, P99 tracking
- **Error Rate Monitoring** - By endpoint, with alerting

**Key Functions:**
```typescript
getSystemStatus(): Promise<SystemStatus>
getJobs(filter: JobFilter): Promise<SystemJob[]>
retryJob(jobId: string): Promise<void>
cancelJob(jobId: string): Promise<void>
toggleFeatureFlag(flagId: string, enabled: boolean, reason: string): Promise<void>
getErrorRates(timeWindow: number): Promise<ErrorRates>
```

**Permissions Required:**
- `system_health.read` - View system status
- `jobs.read` - View jobs
- `jobs.execute` - Control jobs
- `feature_flags.read` - View flags
- `feature_flags.write` - Toggle flags

**Critical Rules:**
- **Kill switches require reason (min 10 chars)**
- **Job cancellation is immediate**
- **Feature flag changes are audited**

---

### 5. Security Module

**Purpose:** Access review, abuse detection, compliance

**Features:**
- **Audit Logs** - Immutable, filterable, exportable, tamper-evident
- **Access Review** - Permission diffing, over-privilege detection
- **Abuse Detection** - Velocity checks, bot detection, credential stuffing
- **IP Intelligence** - Reputation scoring, VPN/Proxy/Tor detection
- **Expiring Access** - Time-limited admin permissions

**Key Functions:**
```typescript
reviewUserAccess(userId: string): Promise<AccessReview>
detectAbuse(params: AbuseParams): Promise<AbuseSignal[]>
getIPIntelligence(ipAddress: string): Promise<ThreatIntelligence>
blockIP(ipAddress: string, reason: string, duration?: number): Promise<void>
exportAuditLogs(params: ExportParams): Promise<string>
comparePermissions(userId1: string, userId2: string): Promise<PermissionDiff>
```

**Permissions Required:**
- `security.read` - View security data
- `security.write` - Block IPs, set access expiry
- `audit.read` - View audit logs
- `access_review.read` - Review permissions
- `access_review.write` - Modify access
- `abuse.read` - View abuse signals

**Critical Rules:**
- **Logs are immutable** - Cannot be edited or deleted
- **All exports are audited**
- **Access reviews track unused permissions**

---

### 6. Billing Module

**Purpose:** Subscription management, refunds, revenue intelligence

**Features:**
- **Subscription Control** - Plan overrides, proration, cancellation
- **Refund Processing** - Requires note (min 20 chars), full audit trail
- **Revenue Metrics** - MRR, ARR, churn, cohort analysis
- **Abuse Detection** - Trial reuse, discount exploitation
- **Failed Payment Workflows** - Retry, pause, cancel options

**Key Functions:**
```typescript
getSubscription(subscriptionId: string): Promise<Subscription>
overridePlan(params: PlanOverrideParams): Promise<void>
processRefund(params: RefundParams): Promise<Refund>
getRevenueMetrics(params: MetricsParams): Promise<RevenueMetrics>
detectTrialAbuse(): Promise<TrialAbuse[]>
getCohortAnalysis(params: CohortParams): Promise<CohortAnalysis[]>
```

**Permissions Required:**
- `billing.read` - View billing data
- `billing.write` - Modify subscriptions
- `subscriptions.*` - Full subscription control
- `refunds.write` - Process refunds
- `payments.read` - View payment data

**Critical Rules:**
- **Refunds require detailed note (min 20 chars)**
- **Plan overrides require reason**
- **All financial actions are audited**

---

### 7. Config Module

**Purpose:** Configuration registry, migration management, schema tools

**Features:**
- **Config Registry** - Environment-scoped, versioned, with rollback
- **Change History** - Full audit trail of config changes
- **Diff Views** - Compare versions, see what changed
- **Migration Status** - Track migrations, detect failures, rollback support
- **Schema Integrity** - Data corruption detection, orphaned records
- **Lock Detection** - Find stuck migrations

**Key Functions:**
```typescript
getConfig(key: string, environment: string): Promise<ConfigEntry>
setConfig(params: ConfigParams): Promise<ConfigEntry>
rollbackConfig(key: string, environment: string): Promise<ConfigEntry>
getConfigDiff(key: string, env: string, v1: number, v2: number): Promise<ConfigDiff>
getMigrationStatus(): Promise<MigrationStatus[]>
checkSchemaIntegrity(): Promise<SchemaIntegrityCheck[]>
```

**Permissions Required:**
- `config.read` - View configs
- `config.write` - Modify configs
- `migrations.read` - View migration status
- `migrations.write` - Rollback migrations

**Critical Rules:**
- **All config changes are versioned**
- **Rollback available for all versions**
- **Migration locks prevent concurrent runs**

---

## Audit System

### Audit Entry Structure

```typescript
{
  id: string;
  actor: string;              // Who did it
  action: string;             // What they did
  resource: string;           // What they did it to
  resourceId?: string;        // Specific resource
  changes?: Record<string, any>;  // What changed
  metadata?: Record<string, any>; // Additional context
  timestamp: Date;            // When it happened
  ipAddress?: string;         // Where from
  userAgent?: string;         // What client
  success: boolean;           // Did it work
  errorMessage?: string;      // Why it failed
}
```

### Audit Rules

1. **Every write action is logged** - No exceptions
2. **Logs are immutable** - Cannot be modified or deleted
3. **Tamper-evident** - Cryptographic integrity
4. **Exportable** - JSON, CSV formats for compliance
5. **Filterable** - By actor, action, resource, time, success
6. **Retention** - Configurable, default 365 days

### Audit Decorator

```typescript
@Audited('resource_name')
async myFunction() {
  // Automatically logged with timing, success, errors
}
```

---

## UX Principles

### Performance
- **Fast. Always.** - <3s for user search, <1s for most operations
- **Keyboard-driven** - All actions accessible via keyboard
- **Zero animations** - Unless informative (loading, progress)

### Density
- **Dense, not pretty** - Information density over whitespace
- **Table-first** - Lists are tables, not cards
- **Inline actions** - No unnecessary modals

### Safety
- **Every destructive action requires intent** - Confirmation with reason
- **Dry-run first** - Preview before execution
- **Rollback available** - Undo bad decisions
- **Clear consequences** - Show what will happen

### Feedback
- **Immediate feedback** - Loading states, progress bars
- **Error messages are actionable** - Tell user what to do
- **Success is quiet** - Don't interrupt flow

---

## API Endpoints

All endpoints follow REST conventions and require authentication + authorization.

### Identity
- `POST /admin/api/identity/search` - Search users
- `GET /admin/api/identity/users/:id` - Get user details
- `PUT /admin/api/identity/users/:id/state` - Set account state
- `POST /admin/api/identity/impersonate` - Start impersonation
- `DELETE /admin/api/identity/impersonate/:sessionId` - End impersonation

### Data Tools
- `POST /admin/api/data-tools/bulk` - Execute bulk operation
- `POST /admin/api/data-tools/bulk/:id/rollback` - Rollback operation
- `POST /admin/api/data-tools/search` - Advanced search
- `POST /admin/api/data-tools/corrections` - Create data correction

### Moderation
- `GET /admin/api/moderation/queue` - Get moderation queue
- `GET /admin/api/moderation/flags/:id` - Get flag context
- `POST /admin/api/moderation/actions` - Perform moderation action
- `GET /admin/api/moderation/patterns` - Detect patterns

### System Health
- `GET /admin/api/system/status` - Get system status
- `GET /admin/api/system/jobs` - Get jobs
- `POST /admin/api/system/jobs/:id/retry` - Retry job
- `POST /admin/api/system/jobs/:id/cancel` - Cancel job
- `GET /admin/api/system/flags` - Get feature flags
- `PUT /admin/api/system/flags/:id` - Toggle feature flag

### Security
- `GET /admin/api/security/access-review/:userId` - Review user access
- `GET /admin/api/security/abuse` - Detect abuse
- `GET /admin/api/security/ip/:address` - Get IP intelligence
- `POST /admin/api/security/ip/block` - Block IP
- `GET /admin/api/security/audit` - Query audit logs
- `POST /admin/api/security/audit/export` - Export audit logs

### Billing
- `GET /admin/api/billing/subscriptions/:id` - Get subscription
- `PUT /admin/api/billing/subscriptions/:id/plan` - Override plan
- `POST /admin/api/billing/refunds` - Process refund
- `GET /admin/api/billing/metrics` - Get revenue metrics
- `GET /admin/api/billing/abuse/trials` - Detect trial abuse
- `GET /admin/api/billing/cohorts` - Get cohort analysis

### Config
- `GET /admin/api/config/:key` - Get config
- `PUT /admin/api/config/:key` - Set config
- `POST /admin/api/config/:key/rollback` - Rollback config
- `GET /admin/api/config/:key/diff` - Get config diff
- `GET /admin/api/config/migrations` - Get migration status
- `GET /admin/api/config/schema/integrity` - Check schema integrity

---

## Database Schema Extensions

### Admin Users
```sql
CREATE TABLE admin_users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  roles JSON NOT NULL,
  permissions JSON NOT NULL,
  expires_at TIMESTAMP,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  last_active_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);
```

### Admin Audit Logs
```sql
CREATE TABLE admin_audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  resource_id VARCHAR(255),
  changes JSON,
  metadata JSON,
  timestamp TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  INDEX idx_actor (actor),
  INDEX idx_action (action),
  INDEX idx_resource (resource),
  INDEX idx_timestamp (timestamp),
  INDEX idx_success (success)
);
```

### Additional Tables
- `bulk_operations` - Track bulk operations
- `data_corrections` - Manual data overrides
- `moderation_flags` - Content moderation flags
- `moderation_actions` - Moderation action history
- `feature_flags` - Feature flag configurations
- `system_jobs` - Background job tracking
- `impersonation_sessions` - Admin impersonation tracking
- `config_entries` - Versioned configuration
- `migrations` - Migration status
- `ip_intelligence` - IP reputation data
- `abuse_signals` - Detected abuse patterns

---

## Security Considerations

### Authentication
- **Admin-only access** - Separate from user authentication
- **MFA required** - For all admin accounts
- **Session timeout** - 30 minutes of inactivity
- **IP whitelisting** - Optional for high-security environments

### Authorization
- **Permission checks on every request** - Frontend and backend
- **Expired access denied** - Time-limited permissions enforced
- **Audit all permission checks** - Track denied access attempts

### Data Protection
- **Sensitive data redaction** - PII masked in logs
- **Encryption at rest** - For audit logs and sensitive configs
- **Secure export** - Encrypted downloads for compliance data

### Compliance
- **GDPR ready** - Data export, deletion, audit trails
- **SOC 2 compliant** - Immutable audit logs, access controls
- **HIPAA compatible** - With proper configuration

---

## Deployment

### Requirements
- Node.js 20+
- PostgreSQL 14+
- Redis 7+ (for caching and job queues)
- 2GB RAM minimum
- 10GB storage for audit logs

### Installation
```bash
cd packages/admin-suite
pnpm install
pnpm build
```

### Configuration
```env
ADMIN_DATABASE_URL=postgresql://...
ADMIN_REDIS_URL=redis://...
ADMIN_SESSION_SECRET=...
ADMIN_MFA_REQUIRED=true
ADMIN_SESSION_TIMEOUT=1800
ADMIN_AUDIT_RETENTION_DAYS=365
```

### Running
```bash
pnpm start:admin
```

Dashboard available at: `https://your-domain.com/admin`

---

## Testing

### Unit Tests
```bash
pnpm test:admin
```

### Integration Tests
```bash
pnpm test:admin:integration
```

### E2E Tests
```bash
pnpm test:admin:e2e
```

### Load Tests
```bash
pnpm test:admin:load
```

---

## Monitoring

### Metrics to Track
- Admin action count by type
- Permission denial rate
- Audit log growth rate
- Failed login attempts
- Impersonation session count
- Bulk operation success rate
- Feature flag toggle frequency
- System health check failures

### Alerts
- **Critical:** Failed authentication spike, audit log write failure
- **High:** Over-privileged access detected, migration lock timeout
- **Medium:** High permission denial rate, slow queries
- **Low:** Unused admin accounts, expiring access

---

## Conclusion

This admin suite is a control plane, not a settings page. It provides:

✅ **Fast** - <3s user search, <1s most operations  
✅ **Auditable** - Every action logged, immutable, exportable  
✅ **Safe** - Dry-run, rollback, approval gates  
✅ **Powerful** - Bulk operations, impersonation, feature flags  
✅ **Compliant** - GDPR, SOC 2, HIPAA ready  
✅ **Scalable** - Modular architecture, independent deployment  

**If your admin suite can't find any user in 3 seconds, explain why something happened, undo a bad decision, prove who did what, and kill a broken feature instantly - it's not an admin suite. It's a liability wearing a dashboard.**

This one passes the test.

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-09  
**Maintained By:** Auth-Spine Team  
**License:** MIT

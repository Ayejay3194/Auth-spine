# Auth-Spine Audit Reporting System

## Overview

The Auth-Spine Audit Reporting System is a comprehensive solution for tracking, analyzing, and reporting on all functions and operations within your Auth-Spine deployment. It provides real-time monitoring, historical analysis, anomaly detection, and detailed reporting capabilities.

## Architecture

### Core Components

1. **Audit Logger** (`@spine/audit-reporting/logger`)
   - Captures all events with automatic categorization
   - In-memory buffer for recent events
   - Persistent database storage
   - Function call wrapping with automatic timing

2. **Audit Storage** (`@spine/audit-reporting/storage`)
   - Database-backed persistent storage
   - Advanced querying and filtering
   - Efficient indexing for fast retrieval
   - Automatic cleanup of old data

3. **Analytics Engine** (`@spine/audit-reporting/analytics`)
   - Metrics calculation (success rates, durations, counts)
   - Anomaly detection (failure spikes, performance issues)
   - Trend identification (usage patterns, peak hours)
   - Time-series data generation

4. **Report Generator** (`@spine/audit-reporting/report-generator`)
   - Consolidated report creation
   - Multiple export formats (JSON, CSV, HTML)
   - Insights and recommendations
   - Scheduled report support

5. **Consolidator** (`@spine/audit-reporting/consolidator`)
   - Group events by multiple dimensions
   - Merge reports across time periods
   - Comparison reports
   - Multi-filter consolidation

6. **Audit Hooks** (`@spine/audit-reporting/hooks`)
   - Function decorators
   - Express/Next.js middleware
   - Automatic event capture
   - Context extraction

## Installation

### 1. Add Package to Workspace

```bash
cd packages/audit-reporting
pnpm install
pnpm build
```

### 2. Update Database Schema

Add the AuditLog model to your Prisma schema:

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  eventType   String
  category    String
  severity    String
  userId      String?
  clientId    String?
  sessionId   String?
  duration    Int?
  success     Boolean  @default(true)
  metadata    Json     @default("{}")
  error       Json?
  context     Json?
  createdAt   DateTime @default(now())

  @@index([eventType])
  @@index([category])
  @@index([severity])
  @@index([userId])
  @@index([clientId])
  @@index([sessionId])
  @@index([createdAt])
  @@index([success])
  @@map("audit_logs")
}
```

Run migrations:

```bash
pnpm prisma migrate dev --name add_audit_logs
```

### 3. Install in Business-Spine

```bash
cd apps/business-spine
pnpm add @spine/audit-reporting
```

## Usage Examples

### Basic Event Logging

```typescript
import { auditLogger } from '@spine/audit-reporting';

// Log authentication success
await auditLogger.log({
  eventType: 'AUTH_SUCCESS',
  userId: user.id,
  clientId: client.id,
  success: true,
  metadata: { method: 'password', ip: req.ip }
});

// Log authentication failure
await auditLogger.log({
  eventType: 'AUTH_FAILED',
  success: false,
  metadata: { email: req.body.email },
  error: { message: 'Invalid credentials', code: 'AUTH_001' }
});
```

### Function Call Auditing

```typescript
import { auditLogger } from '@spine/audit-reporting';

// Wrap any async function with automatic auditing
const result = await auditLogger.logFunctionCall(
  'processPayment',
  async () => {
    return await processPayment(userId, amount);
  },
  {
    userId,
    metadata: { amount, currency: 'USD' }
  }
);
```

### Using Decorators

```typescript
import { auditDecorator } from '@spine/audit-reporting';

class UserService {
  @auditDecorator('USER_ACTION', {
    extractUserId: (target, userId) => userId,
    extractMetadata: (target, userId, action) => ({ action })
  })
  async updateUser(userId: string, action: string) {
    // Your logic here
  }
}
```

### Express Middleware Integration

```typescript
import express from 'express';
import { AuditMiddleware } from '@spine/audit-reporting';

const app = express();

// Add audit middleware to track all API calls
app.use(AuditMiddleware.express());

// Your routes...
```

### Generating Reports

```typescript
import { reportGenerator } from '@spine/audit-reporting';

// Generate daily report
const report = await reportGenerator.generateReport(
  'Daily Security Report',
  {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(),
    categories: ['authentication', 'security']
  },
  {
    includeInsights: true,
    includeRecommendations: true
  }
);

// Export to different formats
const jsonExport = reportGenerator.exportToJSON(report);
const csvExport = reportGenerator.exportToCSV(report);
const htmlExport = reportGenerator.exportToHTML(report);
```

### Grouping and Consolidation

```typescript
import { reportGenerator, auditConsolidator } from '@spine/audit-reporting';

// Group events by event type
const grouped = await reportGenerator.groupAuditData(
  {
    startDate: new Date('2024-01-01'),
    endDate: new Date()
  },
  'eventType'
);

console.log('Groups:', grouped.groups.length);
grouped.groups.forEach(group => {
  console.log(`${group.key}: ${group.count} events`);
});

// Consolidate multiple time periods
const consolidated = await auditConsolidator.consolidateByFilters({
  name: 'Weekly Consolidation',
  filters: [
    { startDate: week1Start, endDate: week1End },
    { startDate: week2Start, endDate: week2End },
    { startDate: week3Start, endDate: week3End }
  ]
});
```

### Comparison Reports

```typescript
import { auditConsolidator } from '@spine/audit-reporting';

// Compare this week vs last week
const comparison = await auditConsolidator.createComparisonReport(
  { startDate: lastWeekStart, endDate: lastWeekEnd },
  { startDate: thisWeekStart, endDate: thisWeekEnd },
  'Week-over-Week Analysis'
);

console.log('Event count change:', comparison.comparison.eventCountChange);
console.log('Success rate change:', comparison.comparison.successRateChange);
```

## Integration Points

### 1. Auth Server Integration

Update `packages/auth-server/src/server.ts`:

```typescript
import { auditLogger } from '@spine/audit-reporting';

// Replace existing recordAudit function
async function recordAudit(eventType: string, data?: { userId?: string; clientId?: string; metadata?: Record<string, unknown> }): Promise<void> {
  await auditLogger.log({
    eventType: eventType as any,
    userId: data?.userId,
    clientId: data?.clientId,
    success: !eventType.includes('FAILED'),
    metadata: data?.metadata
  });
}
```

### 2. AppContext Integration

Update `apps/business-spine/src/suites/core/providers/AppContext.tsx`:

```typescript
import { auditLogger } from '@spine/audit-reporting';

const addNotification = useCallback((message: string, type: NotificationType) => {
  // Existing logic...
  
  // Log user notification
  auditLogger.log({
    eventType: 'USER_ACTION',
    success: true,
    metadata: { action: 'notification', type, message }
  });
}, []);
```

### 3. API Routes

All API routes in `apps/business-spine/app/api/` can use the middleware:

```typescript
import { AuditMiddleware } from '@spine/audit-reporting';

export async function GET(req: NextRequest) {
  // Middleware will automatically log this request
  AuditMiddleware.nextjs()(req, null, () => {});
  
  // Your logic...
}
```

## Dashboard Access

The audit dashboard is available at:

```
http://localhost:3000/audit
```

Features:
- Real-time metrics overview
- Event filtering and search
- Export to JSON, CSV, HTML
- Time range selection (1h, 24h, 7d, 30d)
- Insights and recommendations
- Top users and clients
- Event type breakdown
- Recent events table

## Event Types Reference

### Authentication Events
- `AUTH_SUCCESS` - Successful authentication
- `AUTH_FAILED` - Failed authentication attempt
- `MFA_REQUIRED` - MFA challenge required
- `MFA_FAILED` - MFA verification failed

### Session Events
- `REFRESH_SUCCESS` - Token refresh successful
- `REFRESH_FAILED` - Token refresh failed
- `SESSION_REVOKED` - Session manually revoked

### OAuth Events
- `OAUTH_PASSWORD_SUCCESS` - OAuth password grant success
- `OAUTH_REFRESH_SUCCESS` - OAuth refresh token success

### Authorization Events
- `PERMISSIONS_UPDATED` - User permissions changed

### API Events
- `API_CALL` - General API call
- `ERROR` - Application error

### Security Events
- `SECURITY_ALERT` - Security threat detected

### Performance Events
- `PERFORMANCE_WARNING` - Performance degradation

### Data Events
- `DATA_ACCESS` - Data access logged

### Configuration Events
- `CONFIGURATION_CHANGE` - System configuration changed

### User Events
- `USER_ACTION` - User-initiated action

## Categories

Events are automatically categorized:

- **authentication** - Login, logout, MFA
- **authorization** - Permissions, roles
- **session** - Session lifecycle
- **api** - API calls, errors
- **security** - Security alerts
- **performance** - Performance issues
- **data** - Data operations
- **configuration** - Config changes
- **user** - User actions

## Severity Levels

- **info** - Normal operations
- **warning** - Potential issues
- **error** - Errors and failures
- **critical** - Critical issues requiring immediate attention

## Best Practices

### 1. Log Strategically
- Log all authentication attempts
- Log permission changes
- Log critical operations
- Log errors with context

### 2. Include Metadata
```typescript
await auditLogger.log({
  eventType: 'USER_ACTION',
  userId: user.id,
  metadata: {
    action: 'profile_update',
    fields: ['email', 'name'],
    previousEmail: oldEmail,
    newEmail: newEmail
  }
});
```

### 3. Use Function Wrapping
```typescript
// Instead of manual logging
const result = await auditLogger.logFunctionCall(
  'criticalOperation',
  () => performOperation(),
  { userId, metadata: { operationType: 'payment' } }
);
```

### 4. Schedule Regular Reports
```typescript
// Daily security report
setInterval(async () => {
  const report = await reportGenerator.generateReport(
    'Daily Security Report',
    {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      categories: ['security', 'authentication']
    },
    { includeInsights: true, includeRecommendations: true }
  );
  
  // Email or store report
  await emailReport(report);
}, 24 * 60 * 60 * 1000);
```

### 5. Monitor Anomalies
```typescript
import { auditAnalytics } from '@spine/audit-reporting';

// Check for anomalies every hour
setInterval(async () => {
  const anomalies = await auditAnalytics.detectAnomalies({
    startDate: new Date(Date.now() - 60 * 60 * 1000),
    endDate: new Date()
  });
  
  for (const anomaly of anomalies) {
    if (anomaly.severity === 'critical') {
      await alertOps(anomaly);
    }
  }
}, 60 * 60 * 1000);
```

### 6. Clean Up Old Data
```typescript
import { auditStorage } from '@spine/audit-reporting';

// Delete logs older than 90 days
const deleted = await auditStorage.deleteOlderThan(
  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
);
console.log(`Deleted ${deleted} old audit logs`);
```

## Performance Considerations

1. **Indexing** - All critical fields are indexed for fast queries
2. **Batching** - Events are written asynchronously
3. **Buffer** - In-memory buffer for recent events
4. **Limits** - Default query limit of 1000 events
5. **Pagination** - Use offset/limit for large result sets

## Security

1. **Access Control** - Restrict audit dashboard to admins
2. **Data Retention** - Implement retention policies
3. **Encryption** - Sensitive metadata should be encrypted
4. **Audit the Auditor** - Log access to audit logs

## Troubleshooting

### Events Not Appearing

Check:
1. Database connection is working
2. Prisma schema includes AuditLog model
3. Migrations have been run
4. Logger persistence is enabled

### Slow Queries

Solutions:
1. Add more specific filters
2. Reduce time range
3. Use pagination
4. Check database indexes

### High Memory Usage

Solutions:
1. Reduce buffer size
2. Implement data archival
3. Use streaming for large exports

## API Endpoints

### Generate Report
```
POST /api/audit/report
Body: { startDate, endDate, eventTypes, categories, severities, userId, clientId }
```

### Export Report
```
POST /api/audit/export?format=json|csv|html
Body: { reportId, startDate, endDate }
```

### Query Events
```
GET /api/audit/events?startDate=...&endDate=...&eventTypes=...&limit=100
```

## Conclusion

The Auth-Spine Audit Reporting System provides enterprise-grade auditing capabilities with minimal integration effort. It ensures compliance, security, and operational visibility across your entire authentication infrastructure.

For support or questions, refer to the package README or contact the Auth-Spine team.

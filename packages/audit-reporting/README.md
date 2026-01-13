# @spine/audit-reporting

Comprehensive audit reporting and analytics system for Auth-Spine. This package provides powerful tools to track, analyze, and report on all functions and operations within your Auth-Spine deployment.

## Features

- **Comprehensive Event Logging** - Track all authentication, authorization, API calls, and system events
- **Advanced Analytics** - Calculate metrics, detect anomalies, and identify trends
- **Report Generation** - Create detailed reports in JSON, CSV, and HTML formats
- **Report Consolidation** - Group and merge reports across different time periods and filters
- **Audit Hooks** - Easy integration with existing functions and middleware
- **Real-time Monitoring** - In-memory buffer for recent events
- **Persistent Storage** - Database-backed audit log storage

## Installation

```bash
pnpm add @spine/audit-reporting
```

## Quick Start

### Basic Logging

```typescript
import { auditLogger } from '@spine/audit-reporting';

// Log an event
await auditLogger.log({
  eventType: 'AUTH_SUCCESS',
  userId: 'user-123',
  clientId: 'client-abc',
  success: true,
  metadata: { method: 'password' }
});

// Log a function call with automatic timing
const result = await auditLogger.logFunctionCall(
  'processPayment',
  async () => {
    return await processPayment(userId, amount);
  },
  { userId, metadata: { amount } }
);
```

### Generate Reports

```typescript
import { reportGenerator } from '@spine/audit-reporting';

// Generate a report for the last 24 hours
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
const json = reportGenerator.exportToJSON(report);
const csv = reportGenerator.exportToCSV(report);
const html = reportGenerator.exportToHTML(report);
```

### Group and Consolidate Data

```typescript
import { reportGenerator, auditConsolidator } from '@spine/audit-reporting';

// Group events by type
const grouped = await reportGenerator.groupAuditData(
  { startDate: new Date('2024-01-01'), endDate: new Date() },
  'eventType'
);

// Consolidate multiple reports
const consolidated = await auditConsolidator.consolidateReports([
  report1,
  report2,
  report3
]);

// Compare two time periods
const comparison = await auditConsolidator.createComparisonReport(
  { startDate: lastWeekStart, endDate: lastWeekEnd },
  { startDate: thisWeekStart, endDate: thisWeekEnd },
  'Week-over-Week Comparison'
);
```

### Use Audit Hooks

```typescript
import { createAuditHook, auditDecorator, AuditMiddleware } from '@spine/audit-reporting';

// Wrap a function with audit logging
const authenticateUser = createAuditHook(
  'authenticateUser',
  'AUTH_SUCCESS',
  async (email: string, password: string) => {
    // Your authentication logic
  },
  {
    extractUserId: (email) => email,
    extractMetadata: (email) => ({ email })
  }
);

// Use as a decorator
class AuthService {
  @auditDecorator('AUTH_SUCCESS', {
    extractUserId: (target, email) => email
  })
  async login(email: string, password: string) {
    // Your login logic
  }
}

// Add to Express middleware
app.use(AuditMiddleware.express());

// Add to Next.js API routes
export default async function handler(req, res) {
  AuditMiddleware.nextjs()(req, res, () => {
    // Your API logic
  });
}
```

## Event Types

The system tracks the following event types:

- **Authentication**: `AUTH_SUCCESS`, `AUTH_FAILED`, `MFA_REQUIRED`, `MFA_FAILED`
- **Session**: `REFRESH_SUCCESS`, `REFRESH_FAILED`, `SESSION_REVOKED`
- **OAuth**: `OAUTH_PASSWORD_SUCCESS`, `OAUTH_REFRESH_SUCCESS`
- **Authorization**: `PERMISSIONS_UPDATED`
- **API**: `API_CALL`, `ERROR`
- **Security**: `SECURITY_ALERT`
- **Performance**: `PERFORMANCE_WARNING`
- **Data**: `DATA_ACCESS`
- **Configuration**: `CONFIGURATION_CHANGE`
- **User**: `USER_ACTION`

## Categories

Events are automatically categorized:

- `authentication` - Login, logout, MFA events
- `authorization` - Permission and role changes
- `session` - Session creation, refresh, revocation
- `api` - API calls and errors
- `security` - Security alerts and threats
- `performance` - Performance warnings and slowdowns
- `data` - Data access and modifications
- `configuration` - System configuration changes
- `user` - User-initiated actions

## Severity Levels

- `info` - Normal operations
- `warning` - Potential issues
- `error` - Errors and failures
- `critical` - Critical security or system issues

## Analytics Features

### Metrics Calculation

```typescript
import { auditAnalytics } from '@spine/audit-reporting';

const metrics = await auditAnalytics.calculateMetrics({
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});

console.log(metrics.totalEvents);
console.log(metrics.successRate);
console.log(metrics.eventsByType);
console.log(metrics.topUsers);
console.log(metrics.timeSeriesData);
```

### Anomaly Detection

```typescript
const anomalies = await auditAnalytics.detectAnomalies({
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date()
});

// Returns anomalies like:
// - High failure rates
// - Spike in failures
// - Performance degradation
// - Suspicious activity
```

### Trend Identification

```typescript
const trends = await auditAnalytics.identifyTrends({
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date()
});

// Returns trends like:
// - Peak usage hours
// - Authentication issues
// - Slow performance patterns
```

## Report Structure

```typescript
interface ConsolidatedReport {
  id: string;
  title: string;
  description?: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  filters: AuditFilter;
  metrics: AuditMetrics;
  events: AuditEvent[];
  insights: ReportInsight[];
  recommendations: string[];
}
```

## Filtering

```typescript
interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  userId?: string;
  clientId?: string;
  sessionId?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}
```

## Best Practices

1. **Use appropriate event types** - Choose the most specific event type for your use case
2. **Include metadata** - Add relevant context to help with debugging and analysis
3. **Set up scheduled reports** - Generate regular reports to monitor system health
4. **Monitor anomalies** - Set up alerts for critical anomalies
5. **Archive old data** - Use `auditStorage.deleteOlderThan()` to manage storage
6. **Use grouping** - Group data by relevant dimensions for better insights
7. **Export reports** - Share reports in appropriate formats (HTML for stakeholders, CSV for analysis)

## Integration Examples

### With Auth Server

```typescript
import { auditLogger } from '@spine/audit-reporting';

async function authenticateUser(email: string, password: string) {
  const startTime = Date.now();
  try {
    const user = await verifyCredentials(email, password);
    await auditLogger.log({
      eventType: 'AUTH_SUCCESS',
      userId: user.id,
      success: true,
      duration: Date.now() - startTime,
      metadata: { email, method: 'password' }
    });
    return user;
  } catch (error) {
    await auditLogger.log({
      eventType: 'AUTH_FAILED',
      success: false,
      duration: Date.now() - startTime,
      metadata: { email },
      error: { message: error.message }
    });
    throw error;
  }
}
```

### With AppContext

```typescript
import { auditLogger } from '@spine/audit-reporting';

export function useAppContext() {
  const addNotification = useCallback((message: string, type: NotificationType) => {
    // Existing notification logic
    
    // Log user action
    auditLogger.log({
      eventType: 'USER_ACTION',
      success: true,
      metadata: { action: 'notification_shown', type, message }
    });
  }, []);
}
```

## API Reference

See [API.md](./API.md) for complete API documentation.

## License

MIT

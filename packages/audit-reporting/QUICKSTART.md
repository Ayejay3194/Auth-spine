# Audit Reporting Quick Start

Get the Auth-Spine audit reporting system up and running in 5 minutes.

## Step 1: Install Package (1 min)

```bash
cd packages/audit-reporting
pnpm install
pnpm build
```

## Step 2: Update Database Schema (2 min)

Add to your Prisma schema:

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
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

Run migration:

```bash
pnpm prisma migrate dev --name add_audit_logs
```

## Step 3: Start Logging (1 min)

```typescript
import { auditLogger } from '@spine/audit-reporting';

// Log an event
await auditLogger.log({
  eventType: 'AUTH_SUCCESS',
  userId: 'user-123',
  success: true,
  metadata: { method: 'password' }
});
```

## Step 4: Generate Your First Report (1 min)

```typescript
import { reportGenerator } from '@spine/audit-reporting';

const report = await reportGenerator.generateReport(
  'My First Report',
  {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date()
  },
  { includeInsights: true }
);

console.log('Total events:', report.metrics.totalEvents);
console.log('Success rate:', report.metrics.successRate);
```

## Step 5: View Dashboard (Optional)

Access the dashboard at:
```
http://localhost:3000/audit
```

## Next Steps

- Read the [full guide](./AUDIT_SYSTEM_GUIDE.md)
- Check [integration examples](./INTEGRATION_EXAMPLES.md)
- Review [API documentation](./README.md)

## Common Use Cases

### Log Authentication
```typescript
await auditLogger.log({
  eventType: 'AUTH_SUCCESS',
  userId: user.id,
  clientId: client.id,
  success: true
});
```

### Log API Calls
```typescript
await auditLogger.logFunctionCall(
  'processPayment',
  () => processPayment(userId, amount),
  { userId, metadata: { amount } }
);
```

### Export Report
```typescript
const html = reportGenerator.exportToHTML(report);
const csv = reportGenerator.exportToCSV(report);
const json = reportGenerator.exportToJSON(report);
```

### Detect Anomalies
```typescript
import { auditAnalytics } from '@spine/audit-reporting';

const anomalies = await auditAnalytics.detectAnomalies({
  startDate: new Date(Date.now() - 60 * 60 * 1000),
  endDate: new Date()
});
```

That's it! You're now tracking and reporting on all your Auth-Spine operations.

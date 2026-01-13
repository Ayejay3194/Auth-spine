# Audit Reporting Integration Examples

## Table of Contents
1. [Auth Server Integration](#auth-server-integration)
2. [AppContext Integration](#appcontext-integration)
3. [API Routes Integration](#api-routes-integration)
4. [Custom Function Integration](#custom-function-integration)
5. [Scheduled Reports](#scheduled-reports)
6. [Real-time Monitoring](#real-time-monitoring)

## Auth Server Integration

### Replace Existing Audit Function

In `packages/auth-server/src/server.ts`:

```typescript
import { auditLogger } from '@spine/audit-reporting';

// Replace the existing recordAudit function
async function recordAudit(
  eventType: string,
  data?: { userId?: string; clientId?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  await auditLogger.log({
    eventType: eventType as any,
    userId: data?.userId,
    clientId: data?.clientId,
    success: !eventType.includes('FAILED'),
    metadata: data?.metadata,
  });
}
```

### Enhanced Authentication Logging

```typescript
import { auditLogger } from '@spine/audit-reporting';

async function authenticateUser(opts: {
  email: string;
  password: string;
  clientId: string;
  mfaCode?: string;
  recordAuditEvents: boolean;
}): Promise<AuthResult> {
  const startTime = Date.now();
  const user = userByEmail.get(opts.email.toLowerCase());
  
  if (!user) {
    if (opts.recordAuditEvents) {
      await auditLogger.log({
        eventType: 'AUTH_FAILED',
        clientId: opts.clientId,
        success: false,
        duration: Date.now() - startTime,
        metadata: { email: opts.email, reason: 'user_not_found' },
        error: { message: 'Invalid credentials', code: 'AUTH_001' },
      });
    }
    return { error: 'invalid_credentials', status: 401 };
  }

  const passwordMatch = await bcrypt.compare(opts.password, user.password);
  if (!passwordMatch) {
    if (opts.recordAuditEvents) {
      await auditLogger.log({
        eventType: 'AUTH_FAILED',
        userId: user.id,
        clientId: opts.clientId,
        success: false,
        duration: Date.now() - startTime,
        metadata: { reason: 'invalid_password' },
        error: { message: 'Invalid credentials', code: 'AUTH_002' },
      });
    }
    return { error: 'invalid_credentials', status: 401 };
  }

  if (user.mfa?.enabled) {
    if (!opts.mfaCode) {
      await auditLogger.log({
        eventType: 'MFA_REQUIRED',
        userId: user.id,
        clientId: opts.clientId,
        success: true,
        duration: Date.now() - startTime,
        metadata: { mfaMethod: user.mfa.method },
      });
      return { error: 'mfa_required', status: 401 };
    }
    
    if (opts.mfaCode !== user.mfa.code) {
      await auditLogger.log({
        eventType: 'MFA_FAILED',
        userId: user.id,
        clientId: opts.clientId,
        success: false,
        duration: Date.now() - startTime,
        error: { message: 'Invalid MFA code', code: 'MFA_001' },
      });
      return { error: 'invalid_mfa_code', status: 401 };
    }
  }

  await auditLogger.log({
    eventType: 'AUTH_SUCCESS',
    userId: user.id,
    clientId: opts.clientId,
    success: true,
    duration: Date.now() - startTime,
    metadata: { method: 'password', mfaUsed: !!user.mfa?.enabled },
  });

  return { user };
}
```

## AppContext Integration

In `apps/business-spine/src/suites/core/providers/AppContext.tsx`:

```typescript
import { auditLogger } from '@spine/audit-reporting';

export function AppProvider({ children }: { children: ReactNode }) {
  // Existing state...

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUI(prev => ({ ...prev, theme }));
    
    auditLogger.log({
      eventType: 'USER_ACTION',
      success: true,
      metadata: { action: 'theme_change', theme },
    });
  }, []);

  const setActiveModal = useCallback((modal: ModalType) => {
    setUI(prev => ({ ...prev, activeModal: modal }));
    
    if (modal) {
      auditLogger.log({
        eventType: 'USER_ACTION',
        success: true,
        metadata: { action: 'modal_open', modalType: modal },
      });
    }
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };
    
    setUI(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification],
    }));

    auditLogger.log({
      eventType: 'USER_ACTION',
      success: true,
      metadata: { 
        action: 'notification_shown', 
        type, 
        message: message.substring(0, 100) 
      },
    });

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  // Rest of component...
}
```

## API Routes Integration

### Next.js API Route with Middleware

```typescript
// apps/business-spine/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@spine/audit-reporting';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const userId = request.headers.get('x-user-id');
  
  try {
    const users = await fetchUsers();
    
    await auditLogger.log({
      eventType: 'API_CALL',
      userId: userId || undefined,
      success: true,
      duration: Date.now() - startTime,
      metadata: {
        endpoint: '/api/users',
        method: 'GET',
        resultCount: users.length,
      },
      context: {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: '/api/users',
        method: 'GET',
      },
    });
    
    return NextResponse.json({ users });
  } catch (error: any) {
    await auditLogger.log({
      eventType: 'ERROR',
      userId: userId || undefined,
      success: false,
      duration: Date.now() - startTime,
      metadata: {
        endpoint: '/api/users',
        method: 'GET',
      },
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const userId = request.headers.get('x-user-id');
  
  try {
    const body = await request.json();
    const newUser = await createUser(body);
    
    await auditLogger.log({
      eventType: 'DATA_ACCESS',
      userId: userId || undefined,
      success: true,
      duration: Date.now() - startTime,
      metadata: {
        endpoint: '/api/users',
        method: 'POST',
        action: 'user_created',
        newUserId: newUser.id,
      },
    });
    
    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    await auditLogger.log({
      eventType: 'ERROR',
      userId: userId || undefined,
      success: false,
      duration: Date.now() - startTime,
      error: {
        message: error.message,
        code: error.code,
      },
    });
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

### Using Function Wrapper

```typescript
import { auditLogger } from '@spine/audit-reporting';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  return auditLogger.logFunctionCall(
    'GET /api/users',
    async () => {
      const users = await fetchUsers();
      return NextResponse.json({ users });
    },
    {
      userId: userId || undefined,
      metadata: {
        endpoint: '/api/users',
        method: 'GET',
      },
    }
  );
}
```

## Custom Function Integration

### Service Layer Integration

```typescript
import { createAuditHook } from '@spine/audit-reporting';

class PaymentService {
  async processPayment(userId: string, amount: number, currency: string) {
    // Wrap with audit hook
    return createAuditHook(
      'processPayment',
      'API_CALL',
      async () => {
        // Your payment logic
        const result = await stripe.charges.create({
          amount,
          currency,
          customer: userId,
        });
        return result;
      },
      {
        extractUserId: () => userId,
        extractMetadata: () => ({ amount, currency }),
      }
    )();
  }
}
```

### Using Decorators

```typescript
import { auditDecorator } from '@spine/audit-reporting';

class UserService {
  @auditDecorator('DATA_ACCESS', {
    extractUserId: (target, userId) => userId,
    extractMetadata: (target, userId, updates) => ({
      action: 'user_update',
      fields: Object.keys(updates),
    }),
  })
  async updateUser(userId: string, updates: Partial<User>) {
    const user = await db.user.update({
      where: { id: userId },
      data: updates,
    });
    return user;
  }

  @auditDecorator('DATA_ACCESS', {
    extractUserId: (target, userId) => userId,
    extractMetadata: (target, userId) => ({ action: 'user_delete' }),
  })
  async deleteUser(userId: string) {
    await db.user.delete({ where: { id: userId } });
  }

  @auditDecorator('PERMISSIONS_UPDATED', {
    extractUserId: (target, userId) => userId,
    extractMetadata: (target, userId, role) => ({ newRole: role }),
  })
  async updateUserRole(userId: string, role: string) {
    await db.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
```

## Scheduled Reports

### Daily Security Report

```typescript
import { reportGenerator } from '@spine/audit-reporting';
import { sendEmail } from './email-service';

// Run daily at midnight
async function generateDailySecurityReport() {
  const report = await reportGenerator.generateReport(
    'Daily Security Report',
    {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      categories: ['authentication', 'security', 'authorization'],
    },
    {
      includeInsights: true,
      includeRecommendations: true,
      description: 'Daily security and authentication activity report',
    }
  );

  // Export to HTML for email
  const htmlReport = reportGenerator.exportToHTML(report);

  // Send to security team
  await sendEmail({
    to: 'security-team@company.com',
    subject: `Daily Security Report - ${new Date().toLocaleDateString()}`,
    html: htmlReport,
  });

  // Also save to file system
  const fs = require('fs');
  fs.writeFileSync(
    `/reports/security-${Date.now()}.html`,
    htmlReport
  );
}

// Schedule with cron or setInterval
setInterval(generateDailySecurityReport, 24 * 60 * 60 * 1000);
```

### Weekly Performance Report

```typescript
import { reportGenerator, auditAnalytics } from '@spine/audit-reporting';

async function generateWeeklyPerformanceReport() {
  const report = await reportGenerator.generateReport(
    'Weekly Performance Report',
    {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      categories: ['api', 'performance'],
    },
    {
      includeInsights: true,
      includeRecommendations: true,
    }
  );

  // Detect performance anomalies
  const anomalies = await auditAnalytics.detectAnomalies({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');

  if (criticalAnomalies.length > 0) {
    // Alert ops team
    await alertOpsTeam({
      title: 'Critical Performance Issues Detected',
      anomalies: criticalAnomalies,
      report,
    });
  }

  // Export and store
  const csvReport = reportGenerator.exportToCSV(report);
  await uploadToS3(`reports/performance-${Date.now()}.csv`, csvReport);
}
```

### Monthly Compliance Report

```typescript
import { reportGenerator, auditConsolidator } from '@spine/audit-reporting';

async function generateMonthlyComplianceReport() {
  // Get all authentication events for the month
  const authReport = await reportGenerator.generateReport(
    'Monthly Authentication Report',
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      categories: ['authentication'],
    }
  );

  // Get all data access events
  const dataReport = await reportGenerator.generateReport(
    'Monthly Data Access Report',
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      categories: ['data'],
    }
  );

  // Get all permission changes
  const permissionReport = await reportGenerator.generateReport(
    'Monthly Permission Changes',
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      eventTypes: ['PERMISSIONS_UPDATED'],
    }
  );

  // Consolidate all reports
  const consolidated = await auditConsolidator.consolidateReports([
    authReport,
    dataReport,
    permissionReport,
  ]);

  // Export to PDF (requires additional PDF library)
  const htmlReport = reportGenerator.exportToHTML(consolidated);
  // const pdfReport = await convertHTMLToPDF(htmlReport);

  // Store for compliance
  await storeComplianceReport({
    month: new Date().toISOString().slice(0, 7),
    report: consolidated,
    html: htmlReport,
  });
}
```

## Real-time Monitoring

### Anomaly Detection Service

```typescript
import { auditAnalytics, auditLogger } from '@spine/audit-reporting';

class AnomalyMonitor {
  private checkInterval = 5 * 60 * 1000; // 5 minutes
  private timer: NodeJS.Timeout | null = null;

  start() {
    this.timer = setInterval(() => this.checkForAnomalies(), this.checkInterval);
    console.log('Anomaly monitor started');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async checkForAnomalies() {
    try {
      const anomalies = await auditAnalytics.detectAnomalies({
        startDate: new Date(Date.now() - this.checkInterval),
        endDate: new Date(),
      });

      for (const anomaly of anomalies) {
        await auditLogger.log({
          eventType: 'SECURITY_ALERT',
          success: false,
          metadata: {
            anomalyType: anomaly.type,
            description: anomaly.description,
            data: anomaly.data,
          },
        });

        if (anomaly.severity === 'critical') {
          await this.handleCriticalAnomaly(anomaly);
        }
      }
    } catch (error) {
      console.error('Anomaly check failed:', error);
    }
  }

  private async handleCriticalAnomaly(anomaly: any) {
    // Send alert to ops team
    await sendSlackAlert({
      channel: '#security-alerts',
      message: `🚨 Critical Anomaly Detected: ${anomaly.description}`,
      data: anomaly.data,
    });

    // Log to incident management system
    await createIncident({
      title: `Security Anomaly: ${anomaly.type}`,
      description: anomaly.description,
      severity: 'critical',
      data: anomaly.data,
    });
  }
}

// Start monitoring
const monitor = new AnomalyMonitor();
monitor.start();
```

### Real-time Dashboard Updates

```typescript
import { auditLogger } from '@spine/audit-reporting';
import { Server } from 'socket.io';

const io = new Server(server);

// Extend audit logger to emit events
class RealtimeAuditLogger {
  async log(event: any) {
    // Log to database
    await auditLogger.log(event);

    // Emit to connected dashboards
    io.emit('audit:event', event);

    // Emit critical events to separate channel
    if (event.severity === 'critical') {
      io.emit('audit:critical', event);
    }
  }
}

// Client-side dashboard
const socket = io.connect('http://localhost:3000');

socket.on('audit:event', (event) => {
  // Update dashboard in real-time
  updateDashboard(event);
});

socket.on('audit:critical', (event) => {
  // Show critical alert
  showCriticalAlert(event);
});
```

### Performance Monitoring

```typescript
import { auditLogger } from '@spine/audit-reporting';

class PerformanceMonitor {
  private slowThreshold = 2000; // 2 seconds

  async monitorEndpoint(
    endpoint: string,
    fn: () => Promise<any>,
    userId?: string
  ) {
    const startTime = Date.now();
    let success = true;
    let error: any = undefined;

    try {
      const result = await fn();
      return result;
    } catch (err: any) {
      success = false;
      error = {
        message: err.message,
        code: err.code,
        stack: err.stack,
      };
      throw err;
    } finally {
      const duration = Date.now() - startTime;

      // Log all requests
      await auditLogger.log({
        eventType: 'API_CALL',
        userId,
        success,
        duration,
        metadata: { endpoint },
        error,
      });

      // Log slow requests separately
      if (duration > this.slowThreshold) {
        await auditLogger.log({
          eventType: 'PERFORMANCE_WARNING',
          userId,
          success: true,
          duration,
          metadata: {
            endpoint,
            threshold: this.slowThreshold,
            slowBy: duration - this.slowThreshold,
          },
        });
      }
    }
  }
}

// Usage
const monitor = new PerformanceMonitor();

export async function GET(request: NextRequest) {
  return monitor.monitorEndpoint(
    '/api/users',
    async () => {
      const users = await fetchUsers();
      return NextResponse.json({ users });
    },
    request.headers.get('x-user-id') || undefined
  );
}
```

## Summary

These integration examples demonstrate how to:
- Replace existing audit functions with the new system
- Add comprehensive logging to authentication flows
- Track user actions in the UI layer
- Monitor API endpoints and performance
- Generate scheduled reports for compliance
- Detect and respond to anomalies in real-time
- Create custom monitoring solutions

The audit reporting system is designed to be flexible and can be integrated at any level of your application stack.

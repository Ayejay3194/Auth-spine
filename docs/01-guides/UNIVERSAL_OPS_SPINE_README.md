# Universal Operations Spine

**A plug-and-play operational backbone for ANY business application**

## 🌍 Universal by Design

This operational spine is **completely industry-agnostic**. It's designed to be dropped into any Node.js/TypeScript application, regardless of industry vertical:

- ✅ **SaaS Platforms** - Multi-tenant apps, subscription services
- ✅ **E-commerce** - Online stores, marketplaces, payment processing
- ✅ **Fintech** - Banking apps, trading platforms, payment processors
- ✅ **Healthcare** - Patient portals, telemedicine, health records systems
- ✅ **Education** - Learning management systems, course platforms
- ✅ **Logistics** - Fleet management, delivery tracking, warehouse systems
- ✅ **Real Estate** - Property management, rental platforms
- ✅ **Hospitality** - Booking systems, reservation management
- ✅ **Professional Services** - Scheduling, client management, invoicing
- ✅ **Any Other Industry** - Zero domain-specific assumptions built in!

## 🎯 What Is It?

The Universal Operations Spine is a modular, framework-agnostic set of operational contracts and reference implementations for:

- **Authentication & Authorization Operations** - Monitor logins, OAuth, JWT, sessions
- **Audit & Compliance** - Immutable audit trails for every sensitive action
- **Feature Flags & Rollouts** - Runtime configuration with tenant-specific overrides
- **Incident Response** - Automated detection, mitigation recommendations, rollback plans
- **Health Checks & Monitoring** - System health, metrics, alerting
- **Multi-Tenancy** - Tenant isolation, cross-tenant protection
- **Operational Runbooks** - Best-practice playbooks for common incidents
- **ML-Powered Triage** - Optional machine learning for incident ranking

## 🚀 What It Is NOT

- ❌ Not a full application
- ❌ Not a UI framework
- ❌ Not industry-specific business logic
- ❌ Not a replacement for your product features
- ❌ Not tied to any specific framework or database

## 🏗️ Core Modules

### 1. Audit System (`src/audit/`)
```typescript
import { makeAuditEntry } from "@/src/audit/audit";

const entry = makeAuditEntry({
  tsISO: new Date().toISOString(),
  env: "prod",
  action: "AUTH_LOGIN",
  actorUserId: "user_123",
  surface: "api",
  meta: { ip: "1.2.3.4" }
});
```

**Use Cases:**
- Compliance (SOC 2, HIPAA, PCI-DSS, GDPR)
- Security investigations
- Customer support debugging
- Forensic analysis

### 2. Feature Flags (`src/flags/`)
```typescript
import { FeatureFlagController } from "@/src/flags/flag_controller";

const controller = new FeatureFlagController(store, "prod");

// Enable/disable features at runtime
await controller.setFlag({
  key: "new_checkout_flow",
  newValue: true,
  actorUserId: "admin_123",
  tenantId: "tenant_abc", // Optional: tenant-specific override
  reason: "Gradual rollout to 10% of users"
});

// Check if enabled
const enabled = await controller.getBool("new_checkout_flow");
```

**Use Cases:**
- Gradual feature rollouts
- A/B testing
- Emergency kill switches
- Tenant-specific customization
- Maintenance mode toggles

### 3. Incident Response (`src/ops-spine/`)
```typescript
import { runAuthOpsSpine } from "@/src/ops-spine/spine/authOpsSpine";

const response = runAuthOpsSpine({
  event_id: "evt_123",
  incident_type: "FAILED_LOGINS_SPIKE",
  severity_guess: 2,
  occurred_at: new Date().toISOString(),
  metrics_snapshot: { failed_logins_1h: 150 }
});

console.log(response.decision);
// Output: "Contain likely brute force and protect legitimate users."

console.log(response.steps);
// Output: Actionable steps to mitigate the incident

console.log(response.recommended_flags);
// Output: Feature flags to enable (e.g., rate limiting, CAPTCHA)
```

**Supported Incident Types (Universal):**
- `FAILED_LOGINS_SPIKE` - Every app has login failures
- `PASSWORD_RESET_FAILURES` - Every app has password resets
- `OAUTH_CALLBACK_ERRORS` - Most apps use OAuth
- `JWT_VALIDATION_ERRORS` - Most apps use JWTs
- `SESSION_ANOMALIES` - Every app has sessions
- `TENANT_LEAK_RISK` - Multi-tenant apps need isolation
- `SUSPICIOUS_ADMIN_LOGIN` - Every app has admin users
- `EMAIL_VERIFICATION_FAILURES` - Most apps verify emails

### 4. Health Checks (`src/ops/health.ts`)
```typescript
import { runHealthChecks } from "@/src/ops/health";

const checks = [
  async () => ({ name: "database", ok: await checkDB() }),
  async () => ({ name: "redis", ok: await checkRedis() }),
  async () => ({ name: "stripe", ok: await checkStripe() }),
  async () => ({ name: "s3", ok: await checkS3() }),
];

const status = await runHealthChecks("prod", checks);
// Returns: { ok: boolean, checks: [...], tsISO: "..." }
```

**Use Cases:**
- Kubernetes readiness/liveness probes
- Load balancer health checks
- Monitoring dashboards
- Incident detection

### 5. Multi-Tenancy (`src/tenancy/`)
```typescript
import { TenantScope } from "@/src/tenancy/tenant_scope";

// Ensure operations are scoped to a tenant
const scope = new TenantScope(tenantId);
// All queries/operations within scope are tenant-isolated
```

**Use Cases:**
- SaaS applications
- Marketplaces
- B2B platforms
- Any multi-customer system

## 📦 Installation & Integration

### Step 1: Copy the Operational Modules

Copy the following directories into your project:

```bash
your-app/
├── src/
│   ├── audit/           # Copy this
│   ├── flags/           # Copy this
│   ├── ops/             # Copy this
│   ├── ops-spine/       # Copy this
│   ├── ops-runtime/     # Copy this
│   ├── ops-connectors/  # Copy this
│   ├── tenancy/         # Copy this
│   ├── types-ops/       # Copy this
│   └── utils/           # Copy stable_id.ts
```

### Step 2: Install Dependencies

```bash
npm install lucide-react  # For UI components (optional)
```

### Step 3: Add Database Tables

Add the `AuthOpsLog` model to your Prisma schema (or equivalent for your ORM):

```prisma
model AuthOpsLog {
  id         String   @id @default(cuid())
  type       String
  occurredAt DateTime @default(now())
  tenantId   String?
  userId     String?
  provider   String?

  @@index([occurredAt(sort: Desc)])
  @@index([type])
  @@map("auth_ops_logs")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_auth_ops_logs
```

### Step 4: Configure Environment Variables

```bash
# Your app name (used in notifications)
APP_NAME=YourAppName

# Operations configuration
OPSSPINE_ADMIN_EMAIL=ops@yourcompany.com
OPSSPINE_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
OPSSPINE_NOTIFY_MODE=webhook  # or: email, log
```

### Step 5: Add API Routes (Optional)

For Next.js applications, add the operational API routes:

```typescript
// app/api/ops/auth/route.ts
import { NextResponse } from "next/server";
import { deriveAuthIncidents } from "@/src/ops-spine/alerts/authAlertRules";
import { runAuthOpsSpine } from "@/src/ops-spine/spine/authOpsSpine";

export async function POST(req: Request) {
  const body = await req.json();
  const incidents = deriveAuthIncidents(body.metrics, body.context);
  
  const results = [];
  for (const event of incidents) {
    const response = runAuthOpsSpine(event);
    results.push({ event, response });
  }
  
  return NextResponse.json({ ok: true, incidents: results });
}
```

## 🎨 Customization for Your Industry

### Example 1: E-commerce Platform

```typescript
// Custom incident type for your industry
const customIncident = {
  event_id: "evt_456",
  incident_type: "PAYMENT_FAILURES_SPIKE" as any,
  severity_guess: 2,
  occurred_at: new Date().toISOString(),
  metrics_snapshot: { failed_payments_1h: 50 }
};

// Extend the ops spine with your industry logic
function runEcommerceOpsSpine(event) {
  if (event.incident_type === "PAYMENT_FAILURES_SPIKE") {
    return {
      decision: "Check payment gateway status",
      steps: [
        "Verify Stripe/PayPal API status",
        "Check webhook delivery",
        "Review recent payment config changes"
      ],
      // ... more recommendations
    };
  }
  return runAuthOpsSpine(event); // Fall back to universal auth ops
}
```

### Example 2: Healthcare Application

```typescript
// Add HIPAA-compliant audit logging
import { makeAuditEntry, auditMetaSafe } from "@/src/audit/audit";

function logPatientAccess(patientId: string, doctorId: string) {
  const entry = makeAuditEntry({
    tsISO: new Date().toISOString(),
    env: "prod",
    action: "DATA_EXPORT", // Using universal audit action
    actorUserId: doctorId,
    subjectUserId: patientId,
    surface: "ehr",
    meta: auditMetaSafe({ 
      reason: "patient_chart_view",
      ip: req.ip 
    })
  });
  
  // Store entry in your audit log
  await auditStore.save(entry);
}
```

### Example 3: SaaS Platform

```typescript
// Multi-tenant feature flags
import { FeatureFlagController } from "@/src/flags/flag_controller";

const controller = new FeatureFlagController(store, "prod");

// Enable new feature for specific tenant only
await controller.setFlag({
  key: "new_dashboard",
  newValue: true,
  actorUserId: "admin_123",
  tenantId: "enterprise_customer_xyz",
  reason: "Early access for enterprise customer"
});

// In your app code
if (await controller.getBool("new_dashboard", tenantId)) {
  // Show new dashboard
} else {
  // Show old dashboard
}
```

## 🔧 Extending the Spine

### Add Custom Notification Providers

```typescript
// src/ops-spine/providers/pagerduty.ts
import { AdminNotification } from "../../types-ops/opsAuth";

export class PagerDutyProvider {
  constructor(private apiKey: string) {}
  
  async send(n: AdminNotification) {
    await fetch("https://api.pagerduty.com/incidents", {
      method: "POST",
      headers: { 
        "Authorization": `Token token=${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        incident: {
          type: "incident",
          title: n.subject,
          body: { type: "incident_body", details: n.body }
        }
      })
    });
  }
}
```

### Add Custom Incident Types

```typescript
// Extend the incident detection system
export function deriveCustomIncidents(metrics: any, context: any) {
  const incidents = [];
  
  // Your industry-specific logic
  if (metrics.checkout_abandonment_rate > 0.5) {
    incidents.push({
      event_id: generateId(),
      incident_type: "HIGH_CART_ABANDONMENT",
      severity_guess: 1,
      occurred_at: new Date().toISOString(),
      metrics_snapshot: metrics
    });
  }
  
  return incidents;
}
```

## 📚 Best Practices

### 1. Always Log Sensitive Actions
```typescript
// ❌ Bad: No audit trail
async function deleteUserAccount(userId: string) {
  await db.user.delete({ where: { id: userId } });
}

// ✅ Good: Audit trail created
async function deleteUserAccount(userId: string, actorId: string) {
  await db.user.delete({ where: { id: userId } });
  
  await auditStore.save(makeAuditEntry({
    tsISO: new Date().toISOString(),
    env: "prod",
    action: "DATA_DELETE",
    actorUserId: actorId,
    subjectUserId: userId,
    surface: "admin_panel"
  }));
}
```

### 2. Use Feature Flags for Risky Changes
```typescript
// ✅ Good: Can instantly rollback
const newAlgorithm = await flags.getBool("new_recommendation_algorithm");

if (newAlgorithm) {
  return generateRecommendationsV2(user);
} else {
  return generateRecommendationsV1(user);
}
```

### 3. Always Provide Rollback Plans
```typescript
// Every operational action should have a rollback plan
const response = runAuthOpsSpine(incident);

console.log(response.rollback_plan);
// ["Disable rate limiting if false positives spike", ...]
```

## 🤝 Contributing

This is a universal spine designed for maximum reusability. When contributing:

1. **Keep it generic** - No industry-specific assumptions
2. **Document everything** - Other industries need to understand
3. **Provide examples** - Show how to adapt to different use cases
4. **Test thoroughly** - Many businesses will depend on this

## 📄 License

This operational spine is designed to be freely used in any project, any industry, any use case.

## 🆘 Support

For questions, issues, or customization help, see the main project documentation.

---

**Remember:** This is the boring backbone that prevents 80% of launch pain. It's not exciting, but it's essential. Drop it into your app and focus on building your actual product! 🚀



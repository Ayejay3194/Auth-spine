# Ops Dashboard Spine Kit

Portable Operations + Finance + Employee dashboard scaffold. Built to plug into your existing auth/tenant spine and scale from "dad bookings" to "multi-location chaos."

## Features

- **Next.js Admin Dashboard** with 9 integrated modules:
  - Executive (KPIs + alerts)
  - Finance (Revenue, Expenses, P&L)
  - POS & Payments (transactions, refunds, settlement)
  - Payroll & Compensation (runs, commission rules, exports)
  - Scheduling ↔ Labor (utilization, capacity, no-show risk)
  - Inventory (items, reorder rules, usage)
  - Vendors & Subscriptions (contracts, renewals, spend)
  - Compliance (audit log viewer, approvals queue)
  - Reports & Exports (CSV export stubs)

- **Feature-flag gating** for every module
- **Audit/event schema** + "receipts-first" ops scaffolding
- **Admin notifications interface** (stub): webhook adapter pattern
- **Adapter system** for easy integration with external systems
- **Real-time updates** and configurable refresh intervals
- **Multi-tenant support** with per-tenant configurations

## Installation

```bash
npm install @auth-spine/ops-dashboard
```

## Quick Start

```typescript
import { opsDashboard, DashboardContext } from '@auth-spine/ops-dashboard';

// Initialize dashboard for user
const context: DashboardContext = {
  userId: 'user_123',
  tenantId: 'tenant_456',
  permissions: {
    canView: ['executive', 'finance', 'payroll'],
    canEdit: ['finance'],
    canDelete: [],
    canAdmin: false
  },
  flags: {},
  config: {
    enabledModules: ['executive', 'finance', 'payroll'],
    theme: 'default',
    layout: 'sidebar',
    refreshInterval: 30000,
    enableNotifications: true,
    enableAuditLog: true,
    enableRealTimeUpdates: true
  }
};

await opsDashboard.initialize(context);

// Get dashboard summary
const summary = await opsDashboard.getSummary(context);
console.log(`Dashboard has ${summary.kpis.length} KPIs and ${summary.alerts.length} alerts`);
```

## Modules

### Executive Dashboard
High-level overview and KPIs for executives
- Health scores and system metrics
- Revenue and growth trends
- User engagement statistics
- Operational efficiency metrics

### Finance
Revenue, expenses, and financial reporting
- Monthly/annual revenue tracking
- Expense categorization and analysis
- Profit & loss statements
- Financial KPIs and forecasting

### POS & Payments
Point of sale and payment processing
- Transaction monitoring and analysis
- Refund tracking and rates
- Settlement status and reconciliation
- Payment method analytics

### Payroll & Compensation
Payroll runs and compensation management
- Payroll run scheduling and monitoring
- Salary and commission tracking
- Tax filing and compliance
- Employee compensation analytics

### Scheduling & Labor
Employee scheduling and labor management
- Utilization rates and capacity planning
- Scheduling efficiency metrics
- Overtime tracking and costs
- No-show analysis and prevention

### Inventory
Inventory management and tracking
- Stock levels and reorder points
- Inventory valuation and turnover
- Usage analytics and forecasting
- Supplier performance metrics

### Vendors & Subscriptions
Vendor management and subscription tracking
- Contract management and renewals
- Subscription cost optimization
- Vendor performance tracking
- Spend analysis and budgeting

### Compliance
Audit logs and compliance management
- Audit trail viewing and filtering
- Compliance violation tracking
- Certification management
- Regulatory reporting

### Reports & Exports
Report generation and data exports
- Custom report creation
- Scheduled report generation
- Data export in multiple formats
- Analytics and business intelligence

## API Reference

### Main Class: OpsDashboard

#### Initialization

```typescript
const dashboard = new OpsDashboard(config);
await dashboard.initialize(context);
```

#### Dashboard Operations

```typescript
// Get dashboard summary
const summary = await dashboard.getSummary(context);

// Get available modules
const modules = await dashboard.getAvailableModules(context);

// Get module-specific data
const financeData = await dashboard.getModuleData('finance', context);

// Get module KPIs
const kpis = await dashboard.getModuleKPIs('finance', context);

// Get module alerts
const alerts = await dashboard.getModuleAlerts('finance', context);
```

#### Widget Management

```typescript
// Add custom widget
dashboard.addWidget({
  id: 'custom-widget',
  type: 'chart',
  title: 'Custom Chart',
  moduleId: 'finance',
  data: { /* chart data */ },
  config: { /* chart config */ },
  position: { x: 0, y: 0, width: 4, height: 2 }
});

// Remove widget
dashboard.removeWidget('custom-widget');
```

#### Alert Management

```typescript
// Add alert
dashboard.addAlert({
  id: 'alert-1',
  type: 'warning',
  title: 'Low Inventory',
  message: '5 items are running low',
  timestamp: new Date(),
  acknowledged: false,
  moduleId: 'inventory'
});

// Acknowledge alert
dashboard.acknowledgeAlert('alert-1');
```

### Feature Flags

```typescript
import { featureFlagManager } from '@auth-spine/ops-dashboard';

// Check if module is enabled
const enabled = await featureFlagManager.isEnabled('module.finance', 'tenant_456');

// Enable/disable module
featureFlagManager.setFlag('module.finance', true);

// Get enabled modules
const modules = featureFlagManager.getEnabledModules();
```

### Adapters

```typescript
import { adapterRegistry, PaymentsAdapter } from '@auth-spine/ops-dashboard';

// Register adapter
adapterRegistry.register(new PaymentsAdapter(), {
  name: 'payments',
  type: 'payments',
  enabled: true,
  config: {
    provider: 'stripe',
    apiKey: 'sk_test_...'
  }
});

// Initialize adapters
await adapterRegistry.initializeAll();

// Get adapter data
const paymentsAdapter = adapterRegistry.get('payments');
const data = await paymentsAdapter.getData({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});
```

## Configuration

### Dashboard Configuration

```typescript
interface DashboardConfig {
  enabledModules: ModuleType[];
  theme: 'default' | 'dark' | 'compact';
  layout: 'sidebar' | 'top' | 'grid';
  refreshInterval: number;
  enableNotifications: boolean;
  enableAuditLog: boolean;
  enableRealTimeUpdates: boolean;
}
```

### User Permissions

```typescript
interface UserPermissions {
  canView: ModuleType[];
  canEdit: ModuleType[];
  canDelete: ModuleType[];
  canAdmin: boolean;
}
```

## Integration Examples

### Payment System Integration

```typescript
// Configure Stripe adapter
const stripeAdapter = new PaymentsAdapter();
await stripeAdapter.initialize({
  provider: 'stripe',
  apiKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
});

// Process payment
const transaction = await stripeAdapter.processPayment({
  amount: 9999,
  currency: 'USD',
  paymentMethodId: 'pm_123',
  customerId: 'cust_456'
});
```

### Payroll System Integration

```typescript
// Configure payroll adapter
const payrollAdapter = new PayrollAdapter();
await payrollAdapter.initialize({
  provider: 'adp',
  apiKey: process.env.ADP_API_KEY,
  companyId: process.env.ADP_COMPANY_ID
});

// Run payroll
const payrollRun = await payrollAdapter.runPayroll('2024-01');
```

### Real-time Updates

```typescript
// Enable real-time updates
const dashboard = new OpsDashboard({
  enableRealTimeUpdates: true,
  refreshInterval: 30000 // 30 seconds
});

// Listen for updates
setInterval(async () => {
  await dashboard.refresh(context);
  const summary = await dashboard.getSummary(context);
  // Update UI with new data
}, 30000);
```

## Health Monitoring

```typescript
// Check system health
const health = await opsDashboard.getHealthStatus();

console.log('Dashboard:', health.dashboard ? '✅' : '❌');
console.log('Overall:', health.overall ? '✅' : '❌');

// Check individual components
Object.entries(health.modules).forEach(([module, status]) => {
  console.log(`${module}: ${status ? '✅' : '❌'}`);
});
```

## Data Export

```typescript
// Export dashboard configuration
const config = opsDashboard.exportConfiguration();

// Import configuration to new dashboard
const newDashboard = new OpsDashboard();
newDashboard.importConfiguration(config);
```

## Security & Compliance

- **Role-based access control** with granular permissions
- **Audit logging** for all operations
- **Multi-tenant isolation** with per-tenant data
- **Feature flags** for controlled feature rollout
- **Data encryption** in transit and at rest
- **Compliance reporting** and audit trails

## Performance Optimization

- **Lazy loading** of module data
- **Configurable refresh intervals** to reduce API calls
- **Caching** of frequently accessed data
- **Real-time updates** only when enabled
- **Health monitoring** for proactive issue detection

## Extending the Dashboard

### Custom Modules

```typescript
// Create custom module handler
class CustomModuleHandler implements ModuleHandler {
  async initialize(): Promise<void> {
    // Initialize custom module
  }

  async getData(context: any): Promise<any> {
    // Return custom module data
  }
}

// Register custom module
moduleRegistry.register('custom', {
  module: {
    id: 'custom',
    name: 'Custom Module',
    description: 'Custom business logic',
    icon: 'custom-icon',
    path: '/admin/custom',
    enabled: true,
    requiredPermissions: ['view.custom']
  },
  handler: new CustomModuleHandler()
});
```

### Custom Adapters

```typescript
// Create custom adapter
class CustomAdapter implements Adapter {
  name = 'custom';
  type = 'custom';

  async initialize(config: any): Promise<void> {
    // Initialize custom adapter
  }

  async connect(): Promise<boolean> {
    // Connect to external system
  }

  async getData(query: any): Promise<any> {
    // Fetch data from external system
  }
}

// Register custom adapter
adapterRegistry.register(new CustomAdapter(), {
  name: 'custom',
  type: 'custom',
  enabled: true,
  config: { /* custom config */ }
});
```

## Examples

See `example-usage.ts` for comprehensive examples of:
- Dashboard initialization
- Module data retrieval
- Feature flags management
- Adapter configuration
- Dashboard customization
- Health monitoring
- Configuration management
- Real-time updates

## Contributing

1. Follow the established module structure
2. Implement proper TypeScript types
3. Add comprehensive error handling
4. Include health checks for adapters
5. Write tests for new functionality
6. Update documentation

## License

MIT License - see LICENSE file for details.

---

**Built to scale from "dad bookings" to "multi-location chaos" - your operations command center awaits.**

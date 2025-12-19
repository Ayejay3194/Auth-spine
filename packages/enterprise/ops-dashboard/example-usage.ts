/**
 * Example usage of the Ops Dashboard Spine Kit
 * 
 * This example demonstrates how to use the kit to:
 * - Initialize the dashboard
 * - Configure modules and feature flags
 * - Get dashboard data and KPIs
 * - Manage adapters and notifications
 */

import { 
  OpsDashboard, 
  opsDashboard,
  DashboardContext,
  UserPermissions,
  ModuleType
} from './index.js';

// Example 1: Basic dashboard initialization
export async function basicDashboardInitialization() {
  console.log('=== Basic Dashboard Initialization ===\n');

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
  console.log('✅ Dashboard initialized successfully');

  const summary = await opsDashboard.getSummary(context);
  console.log(`✅ Retrieved summary with ${summary.kpis.length} KPIs and ${summary.alerts.length} alerts`);
}

// Example 2: Module-specific data retrieval
export async function moduleDataRetrieval() {
  console.log('\n=== Module Data Retrieval ===\n');

  const context: DashboardContext = {
    userId: 'user_123',
    tenantId: 'tenant_456',
    permissions: {
      canView: ['executive', 'finance', 'payroll', 'pos'],
      canEdit: ['finance'],
      canDelete: [],
      canAdmin: false
    },
    flags: {},
    config: {
      enabledModules: ['executive', 'finance', 'payroll', 'pos'],
      theme: 'default',
      layout: 'sidebar',
      refreshInterval: 30000,
      enableNotifications: true,
      enableAuditLog: true,
      enableRealTimeUpdates: true
    }
  };

  await opsDashboard.initialize(context);

  // Get finance module data
  const financeData = await opsDashboard.getModuleData('finance', context);
  console.log('✅ Finance module data:');
  console.log(`  - Revenue: $${financeData.revenue.total.toLocaleString()}`);
  console.log(`  - Expenses: $${financeData.expenses.total.toLocaleString()}`);
  console.log(`  - Profit Margin: ${financeData.profitLoss.margin}%`);

  // Get payroll module data
  const payrollData = await opsDashboard.getModuleData('payroll', context);
  console.log('\n✅ Payroll module data:');
  console.log(`  - Total Payroll: $${payrollData.compensation.totalPayroll.toLocaleString()}`);
  console.log(`  - Average Salary: $${payrollData.compensation.averageSalary.toLocaleString()}`);
  console.log(`  - Completed Runs: ${payrollData.runs.completed}`);

  // Get module KPIs
  const financeKPIs = await opsDashboard.getModuleKPIs('finance', context);
  console.log('\n✅ Finance KPIs:');
  financeKPIs.forEach(kpi => {
    console.log(`  - ${kpi.title}: ${kpi.value} (${kpi.trend})`);
  });
}

// Example 3: Feature flags management
export async function featureFlagsManagement() {
  console.log('\n=== Feature Flags Management ===\n');

  const { featureFlagManager } = await import('./feature-flags.js');

  // Check enabled modules
  const enabledModules = featureFlagManager.getEnabledModules();
  console.log('✅ Enabled modules:');
  enabledModules.forEach(module => {
    console.log(`  - ${module}`);
  });

  // Check specific flag
  const financeEnabled = await featureFlagManager.isEnabled('module.finance', 'tenant_456');
  console.log(`\n✅ Finance module enabled: ${financeEnabled}`);

  // Add custom flag
  featureFlagManager.addCustomFlag({
    key: 'module.custom-analytics',
    enabled: true,
    description: 'Custom analytics module for advanced reporting'
  });

  const customFlags = featureFlagManager.getCustomFlags();
  console.log(`\n✅ Custom flags: ${customFlags.length}`);
}

// Example 4: Adapter configuration and usage
export async function adapterConfiguration() {
  console.log('\n=== Adapter Configuration ===\n');

  const { adapterRegistry } = await import('./adapters/index.js');
  const { PaymentsAdapter } = await import('./adapters/payments.js');

  // Register payments adapter
  adapterRegistry.register(new PaymentsAdapter(), {
    name: 'payments',
    type: 'payments',
    enabled: true,
    config: {
      provider: 'stripe',
      apiKey: 'sk_test_...',
      webhookSecret: 'whsec_...'
    }
  });

  // Initialize adapters
  await adapterRegistry.initializeAll();
  console.log('✅ All adapters initialized');

  // Check adapter health
  const health = await adapterRegistry.checkHealth();
  console.log('\n✅ Adapter health:');
  Object.entries(health).forEach(([name, isHealthy]) => {
    console.log(`  - ${name}: ${isHealthy ? '✅' : '❌'}`);
  });

  // Get payments data
  const paymentsAdapter = adapterRegistry.get('payments');
  if (paymentsAdapter) {
    const paymentsData = await paymentsAdapter.getData({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    });
    console.log('\n✅ Payments data:');
    console.log(`  - Total transactions: ${paymentsData.metrics.totalTransactions}`);
    console.log(`  - Total volume: $${paymentsData.metrics.totalVolume.toLocaleString()}`);
    console.log(`  - Success rate: ${paymentsData.metrics.successRate}%`);
  }
}

// Example 5: Dashboard customization
export async function dashboardCustomization() {
  console.log('\n=== Dashboard Customization ===\n');

  // Create custom dashboard configuration
  const customDashboard = new OpsDashboard({
    enabledModules: ['executive', 'finance', 'inventory'],
    theme: 'dark',
    layout: 'top',
    refreshInterval: 60000,
    enableNotifications: true,
    enableAuditLog: true,
    enableRealTimeUpdates: false
  });

  const context: DashboardContext = {
    userId: 'user_123',
    tenantId: 'tenant_456',
    permissions: {
      canView: ['executive', 'finance', 'inventory'],
      canEdit: ['finance'],
      canDelete: [],
      canAdmin: false
    },
    flags: {},
    config: customDashboard.getConfig()
  };

  await customDashboard.initialize(context);
  console.log('✅ Custom dashboard initialized');

  // Add custom widget
  customDashboard.addWidget({
    id: 'custom-revenue-chart',
    type: 'chart',
    title: 'Revenue Trend',
    moduleId: 'finance',
    data: {
      chartType: 'line',
      data: [
        { month: 'Jan', revenue: 100000 },
        { month: 'Feb', revenue: 110000 },
        { month: 'Mar', revenue: 125000 }
      ]
    },
    config: {
      showLegend: true,
      colors: ['#3b82f6', '#10b981']
    },
    position: { x: 0, y: 0, width: 6, height: 4 }
  });

  // Add custom alert
  customDashboard.addAlert({
    id: 'low-inventory-alert',
    type: 'warning',
    title: 'Low Inventory Alert',
    message: '5 items are running low on stock',
    timestamp: new Date(),
    acknowledged: false,
    moduleId: 'inventory',
    actionUrl: '/admin/inventory'
  });

  const summary = await customDashboard.getSummary(context);
  console.log(`✅ Custom dashboard summary:`);
  console.log(`  - KPIs: ${summary.kpis.length}`);
  console.log(`  - Alerts: ${summary.alerts.length}`);
  console.log(`  - Widgets: ${summary.widgets.length}`);
  console.log(`  - Modules: ${summary.modules.length}`);
}

// Example 6: Health monitoring
export async function healthMonitoring() {
  console.log('\n=== Health Monitoring ===\n');

  const health = await opsDashboard.getHealthStatus();
  console.log('✅ System Health Status:');
  console.log(`  - Dashboard: ${health.dashboard ? '✅' : '❌'}`);
  console.log(`  - Overall: ${health.overall ? '✅' : '❌'}`);

  console.log('\n✅ Module Health:');
  Object.entries(health.modules).forEach(([module, isHealthy]) => {
    console.log(`  - ${module}: ${isHealthy ? '✅' : '❌'}`);
  });

  console.log('\n✅ Adapter Health:');
  Object.entries(health.adapters).forEach(([adapter, isHealthy]) => {
    console.log(`  - ${adapter}: ${isHealthy ? '✅' : '❌'}`);
  });
}

// Example 7: Configuration export/import
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Export current configuration
  const exportedConfig = opsDashboard.exportConfiguration();
  console.log('✅ Configuration exported:');
  console.log(`  - Modules: ${exportedConfig.config.enabledModules.length}`);
  console.log(`  - Widgets: ${exportedConfig.widgets.length}`);
  console.log(`  - Alerts: ${exportedConfig.alerts.length}`);

  // Create new dashboard with imported config
  const newDashboard = new OpsDashboard();
  newDashboard.importConfiguration(exportedConfig);
  console.log('✅ Configuration imported to new dashboard');

  const newConfig = newDashboard.getConfig();
  console.log(`✅ New dashboard has ${newConfig.enabledModules.length} modules enabled`);
}

// Example 8: Real-time updates
export async function realTimeUpdates() {
  console.log('\n=== Real-time Updates ===\n');

  const context: DashboardContext = {
    userId: 'user_123',
    tenantId: 'tenant_456',
    permissions: {
      canView: ['executive', 'finance'],
      canEdit: ['finance'],
      canDelete: [],
      canAdmin: false
    },
    flags: {},
    config: {
      enabledModules: ['executive', 'finance'],
      theme: 'default',
      layout: 'sidebar',
      refreshInterval: 5000, // 5 seconds for demo
      enableNotifications: true,
      enableAuditLog: true,
      enableRealTimeUpdates: true
    }
  };

  await opsDashboard.initialize(context);

  console.log('✅ Real-time updates enabled');
  console.log('✅ Dashboard will refresh every 5 seconds');

  // Simulate real-time updates
  let updateCount = 0;
  const updateInterval = setInterval(async () => {
    await opsDashboard.refresh(context);
    updateCount++;
    console.log(`✅ Dashboard refreshed (${updateCount}/3)`);
    
    if (updateCount >= 3) {
      clearInterval(updateInterval);
      console.log('✅ Real-time updates demo completed');
    }
  }, 5000);
}

// Run all examples
export async function runAllExamples() {
  console.log('Ops Dashboard Spine Kit - Example Usage\n');
  console.log('========================================\n');

  try {
    await basicDashboardInitialization();
    await moduleDataRetrieval();
    await featureFlagsManagement();
    await adapterConfiguration();
    await dashboardCustomization();
    await healthMonitoring();
    await configurationManagement();
    await realTimeUpdates();

    console.log('\n=== All Examples Completed Successfully ===');
  } catch (error: any) {
    console.error('Error running examples:', error.message);
    console.error(error.stack);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

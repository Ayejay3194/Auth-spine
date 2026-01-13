/**
 * Example Usage of HR Payroll Analytics Suite
 * Demonstrates comprehensive analytics implementation for Auth-spine
 */

import { 
  AnalyticsEngine, 
  createAnalyticsEngine, 
  defaultAnalyticsConfig,
  businessKPIs,
  dashboardTemplates,
  metricDefinitions,
  analyticsUtils
} from './index.js';

/**
 * Example: Setting up the Analytics Engine
 */
export async function setupAnalyticsEngine(): Promise<AnalyticsEngine> {
  // Create analytics engine with custom configuration
  const config = {
    ...defaultAnalyticsConfig,
    retentionDays: 730, // 2 years retention
    dataWarehouse: {
      enabled: true,
      syncInterval: 'hourly' as const
    },
    privacy: {
      anonymizePII: true,
      retentionPolicy: 'strict' as const
    }
  };

  const analytics = createAnalyticsEngine(config);
  await analytics.initialize();
  
  console.log('✅ Analytics Engine initialized successfully');
  return analytics;
}

/**
 * Example: Tracking business events
 */
export async function trackBusinessEvents(analytics: AnalyticsEngine): Promise<void> {
  // Track user actions
  await analytics.trackEvent({
    event: 'user_login',
    entity: 'User',
    entityId: 'user_123',
    actorEmail: 'john@example.com',
    actorRole: 'MANAGER',
    path: '/dashboard',
    method: 'GET',
    status: 200,
    durationMs: 145
  });

  // Track business transactions
  await analytics.trackEvent({
    event: 'invoice_created',
    entity: 'Invoice',
    entityId: 'inv_456',
    actorEmail: 'sarah@example.com',
    actorRole: 'ACCOUNTANT',
    props: {
      amount: 5000,
      customerId: 'cust_789',
      currency: 'USD'
    }
  });

  // Track payroll operations
  await analytics.trackEvent({
    event: 'payroll_processed',
    entity: 'PayRun',
    entityId: 'payrun_101',
    actorEmail: 'hr@example.com',
    actorRole: 'HR',
    props: {
      employeeCount: 45,
      totalAmount: 125000,
      processingTime: 2340
    }
  });

  console.log('✅ Business events tracked successfully');
}

/**
 * Example: Recording key metrics
 */
export async function recordKeyMetrics(analytics: AnalyticsEngine): Promise<void> {
  const now = new Date();
  
  // Financial metrics
  await analytics.recordMetric('mrr', { number: 125000 }, now);
  await analytics.recordMetric('cashBalance', { cents: 45000000 }, now);
  await analytics.recordMetric('arOutstanding', { cents: 7800000 }, now);
  await analytics.recordMetric('apOutstanding', { cents: 4500000 }, now);
  
  // HR metrics
  await analytics.recordMetric('headcount', 145, now);
  await analytics.recordMetric('turnoverRate', 8.5, now);
  await analytics.recordMetric('payrollCosts', { cents: 28000000 }, now);
  
  // Operations metrics
  await analytics.recordMetric('systemUptime', 99.9, now);
  await analytics.recordMetric('complianceScore', 94.5, now);
  await analytics.recordMetric('errorRate', 0.2, now);

  console.log('✅ Key metrics recorded successfully');
}

/**
 * Example: Getting KPI data for dashboard
 */
export async function getDashboardKPIs(analytics: AnalyticsEngine): Promise<void> {
  const kpiMetrics = [
    'mrr', 'cashBalance', 'headcount', 'turnoverRate', 
    'systemUptime', 'complianceScore'
  ];

  const kpis = await analytics.getKPIs(kpiMetrics, '30d');

  console.log('\n📊 Dashboard KPIs:');
  kpis.forEach((kpi: any) => {
    const trend = kpi.trend === 'up' ? '📈' : kpi.trend === 'down' ? '📉' : '➡️';
    const change = kpi.changePercent ? `${kpi.changePercent.toFixed(1)}%` : 'N/A';
    
    let formattedValue = kpi.value.toString();
    if (kpi.metric.includes('Balance') || kpi.metric.includes('mrr') || kpi.metric.includes('Costs')) {
      formattedValue = analyticsUtils.formatCurrency(kpi.value * 100);
    } else if (kpi.metric.includes('Rate') || kpi.metric.includes('Score')) {
      formattedValue = analyticsUtils.formatPercentage(kpi.value / 100);
    }

    console.log(`  ${trend} ${kpi.metric}: ${formattedValue} (${change})`);
  });
}

/**
 * Example: Generating analytics reports
 */
export async function generateReports(analytics: AnalyticsEngine): Promise<void> {
  // Financial report
  const financialReport = await analytics.generateReport({
    id: 'financial_monthly',
    name: 'Monthly Financial Report',
    description: 'Comprehensive financial performance overview',
    type: 'financial',
    recipients: ['finance@company.com', 'executives@company.com'],
    metrics: ['mrr', 'cashBalance', 'arOutstanding', 'apOutstanding'],
    format: 'pdf'
  });

  console.log('✅ Financial report generated:', financialReport.title);
  console.log(`   Sections: ${financialReport.sections.length}`);
  console.log(`   Key insights: ${financialReport.summary.keyInsights.length}`);

  // HR report
  const hrReport = await analytics.generateReport({
    id: 'hr_weekly',
    name: 'Weekly HR Dashboard',
    description: 'HR metrics and workforce analytics',
    type: 'hr',
    recipients: ['hr@company.com'],
    metrics: ['headcount', 'turnoverRate', 'payrollCosts'],
    format: 'excel'
  });

  console.log('✅ HR report generated:', hrReport.title);
  console.log(`   Data quality: ${hrReport.summary.dataQuality}`);
}

/**
 * Example: Creating custom dashboards
 */
export async function createCustomDashboard(analytics: AnalyticsEngine): Promise<void> {
  const dashboardConfig = {
    id: 'custom_ops_dashboard',
    name: 'Custom Operations Dashboard',
    description: 'Real-time operations monitoring',
    layout: {
      columns: 4,
      rows: 3,
      widgets: [
        { type: 'kpi', metrics: ['systemUptime'], position: { x: 0, y: 0, w: 1, h: 1 } },
        { type: 'kpi', metrics: ['errorRate'], position: { x: 1, y: 0, w: 1, h: 1 } },
        { type: 'chart', metrics: ['transactionVolume'], position: { x: 0, y: 1, w: 4, h: 2 } }
      ]
    },
    refreshInterval: 60000 // 1 minute
  };

  // Create dashboard using dashboard manager
  const dashboardManager = (analytics as any).dashboardManager;
  await dashboardManager.createDashboard(dashboardConfig.layout);

  console.log('✅ Custom dashboard created:', dashboardConfig.name);
}

/**
 * Example: Querying analytics events
 */
export async function queryAnalyticsEvents(analytics: AnalyticsEngine): Promise<void> {
  // Query recent events
  const recentEvents = await analytics.queryEvents({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    limit: 10
  });

  console.log('\n📋 Recent Analytics Events:');
  recentEvents.forEach((event: any, index: number) => {
    console.log(`  ${index + 1}. ${event.event} by ${event.actorEmail} at ${event.occurredAt.toISOString()}`);
  });

  // Query specific event types
  const invoiceEvents = await analytics.queryEvents({
    event: 'invoice_created',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    limit: 5
  });

  console.log(`\n📄 Invoice Events (Last 7 days): ${invoiceEvents.length}`);
}

/**
 * Example: Getting metric history
 */
export async function getMetricHistory(analytics: AnalyticsEngine): Promise<void> {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const endDate = new Date();

  const mrrHistory = await analytics.getMetricHistory('mrr', startDate, endDate);
  
  console.log('\n📈 MRR History (Last 30 days):');
  mrrHistory.slice(-7).forEach((snapshot: any) => {
    const date = snapshot.asOfDate.toISOString().slice(0, 10);
    const value = analyticsUtils.formatCurrency((snapshot.valueNumber || 0) * 100);
    console.log(`  ${date}: ${value}`);
  });
}

/**
 * Example: Computing daily snapshots
 */
export async function computeDailySnapshots(analytics: AnalyticsEngine): Promise<void> {
  console.log('🔄 Computing daily snapshots...');
  
  await analytics.computeDailySnapshots(30);
  
  console.log('✅ Daily snapshots computed successfully');
}

/**
 * Example: Analytics health monitoring
 */
export async function monitorAnalyticsHealth(analytics: AnalyticsEngine): Promise<void> {
  const health = await analytics.getHealthStatus();
  
  console.log('\n🏥 Analytics Health Status:');
  console.log(`  Status: ${health.status.toUpperCase()}`);
  console.log(`  Initialized: ${health.details.initialized}`);
  console.log(`  Enabled: ${health.details.enabled}`);
  
  console.log('\n📊 Component Metrics:');
  Object.entries(health.metrics).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

/**
 * Example: Business intelligence insights
 */
export async function generateBusinessInsights(analytics: AnalyticsEngine): Promise<void> {
  const insights = {
    financial: await analyzeFinancialTrends(analytics),
    hr: await analyzeHRTrends(analytics),
    operations: await analyzeOperationsTrends(analytics)
  };

  console.log('\n💡 Business Intelligence Insights:');
  
  console.log('\n💰 Financial Insights:');
  insights.financial.forEach(insight => {
    console.log(`  • ${insight}`);
  });
  
  console.log('\n👥 HR Insights:');
  insights.hr.forEach(insight => {
    console.log(`  • ${insight}`);
  });
  
  console.log('\n⚙️ Operations Insights:');
  insights.operations.forEach(insight => {
    console.log(`  • ${insight}`);
  });
}

/**
 * Complete analytics workflow example
 */
export async function runCompleteAnalyticsExample(): Promise<void> {
  console.log('🚀 Starting HR Payroll Analytics Suite Example\n');
  
  try {
    // 1. Setup analytics engine
    console.log('1. Setting up Analytics Engine...');
    const analytics = await setupAnalyticsEngine();
    
    // 2. Track business events
    console.log('\n2. Tracking business events...');
    await trackBusinessEvents(analytics);
    
    // 3. Record key metrics
    console.log('\n3. Recording key metrics...');
    await recordKeyMetrics(analytics);
    
    // 4. Get dashboard KPIs
    console.log('\n4. Getting dashboard KPIs...');
    await getDashboardKPIs(analytics);
    
    // 5. Generate reports
    console.log('\n5. Generating analytics reports...');
    await generateReports(analytics);
    
    // 6. Create custom dashboard
    console.log('\n6. Creating custom dashboard...');
    await createCustomDashboard(analytics);
    
    // 7. Query analytics events
    console.log('\n7. Querying analytics events...');
    await queryAnalyticsEvents(analytics);
    
    // 8. Get metric history
    console.log('\n8. Getting metric history...');
    await getMetricHistory(analytics);
    
    // 9. Compute daily snapshots
    console.log('\n9. Computing daily snapshots...');
    await computeDailySnapshots(analytics);
    
    // 10. Monitor health
    console.log('\n10. Monitoring analytics health...');
    await monitorAnalyticsHealth(analytics);
    
    // 11. Generate business insights
    console.log('\n11. Generating business insights...');
    await generateBusinessInsights(analytics);
    
    console.log('\n✅ Analytics example completed successfully!');
    
  } catch (error) {
    console.error('❌ Analytics example failed:', error);
    throw error;
  }
}

// Helper functions for business insights

async function analyzeFinancialTrends(analytics: AnalyticsEngine): Promise<string[]> {
  const kpis = await analytics.getKPIs(['mrr', 'cashBalance', 'arOutstanding']);
  const insights = [];
  
  if (kpis[0]?.changePercent && kpis[0].changePercent > 5) {
    insights.push('MRR growth is strong (>5%) - consider scaling operations');
  }
  
  if (kpis[1]?.changePercent && kpis[1].changePercent < -10) {
    insights.push('Cash balance declining significantly - review cash flow management');
  }
  
  if (kpis[2]?.changePercent && kpis[2].changePercent > 15) {
    insights.push('Accounts receivable growing faster than revenue - review collection process');
  }
  
  return insights;
}

async function analyzeHRTrends(analytics: AnalyticsEngine): Promise<string[]> {
  const kpis = await analytics.getKPIs(['headcount', 'turnoverRate']);
  const insights = [];
  
  if (kpis[1]?.value && kpis[1].value > 10) {
    insights.push('High turnover rate (>10%) - investigate employee satisfaction');
  }
  
  if (kpis[0]?.changePercent && kpis[0].changePercent > 10) {
    insights.push('Rapid headcount growth - ensure onboarding capacity');
  }
  
  return insights;
}

async function analyzeOperationsTrends(analytics: AnalyticsEngine): Promise<string[]> {
  const kpis = await analytics.getKPIs(['systemUptime', 'errorRate', 'complianceScore']);
  const insights = [];
  
  if (kpis[0]?.value && kpis[0].value < 99) {
    insights.push('System uptime below 99% - investigate reliability issues');
  }
  
  if (kpis[1]?.value && kpis[1].value > 1) {
    insights.push('Error rate above 1% - review system stability');
  }
  
  if (kpis[2]?.value && kpis[2].value < 90) {
    insights.push('Compliance score below 90% - address compliance gaps');
  }
  
  return insights;
}

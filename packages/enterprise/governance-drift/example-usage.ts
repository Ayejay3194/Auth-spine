/**
 * Example usage of the Governance & Drift Control Layer
 * 
 * This example demonstrates how to use the layer to:
 * - Prevent system drift
 * - Preserve original intent at scale
 * - Monitor degeneration signals
 * - Maintain continuity metrics
 * - Preserve organizational culture
 * - Balance power distribution
 */

import { 
  GovernanceDriftControl, 
  governanceDriftControl
} from './index.js';

// Example 1: Basic governance drift control initialization
export async function basicGovernanceInitialization() {
  console.log('=== Basic Governance Drift Control Initialization ===\n');

  await governanceDriftControl.initialize();
  console.log('✅ Governance Drift Control system initialized successfully');

  const healthStatus = await governanceDriftControl.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Intent registration and validation
export async function intentManagement() {
  console.log('\n=== Intent Management ===\n');

  // Register a new product intent
  const intent = governanceDriftControl.registerIntent({
    feature: 'User Dashboard Analytics',
    for: 'product_managers',
    solves: 'Provide real-time insights into user behavior and product usage patterns',
    doesNotSolve: 'Individual user tracking or personal data analysis',
    misuse: ['Performance monitoring', 'Individual user surveillance'],
    success: 'Product managers can identify usage trends and make data-driven decisions within 5 minutes',
    failure: 'Product managers rely on manual data extraction and analysis taking hours',
    owner: 'product-team@company.com'
  });
  console.log('✅ Registered product intent');
  console.log(`  - Intent ID: ${intent.intentId}`);
  console.log(`  - Feature: ${intent.feature}`);
  console.log(`  - Status: ${intent.status}`);

  // Validate the intent
  const validation = await governanceDriftControl.validateIntent(intent.intentId);
  console.log(`✅ Intent validation: ${validation.validationStatus}`);
  console.log(`  - Issues found: ${validation.issues.length}`);
  if (validation.issues.length > 0) {
    validation.issues.forEach((issue, index) => {
      console.log(`    ${index + 1}. ${issue.description} (${issue.severity})`);
    });
  }

  // Update intent status
  const updatedIntent = governanceDriftControl.getIntent(intent.intentId);
  if (updatedIntent) {
    governanceDriftControl.updateIntentStatus(intent.intentId, 'approved', 'product-lead@company.com');
    console.log('✅ Intent status updated to "approved"');
  }

  // Get all intents
  const allIntents = governanceDriftControl.getAllIntents();
  console.log(`✅ Total registered intents: ${allIntents.length}`);
}

// Example 3: Drift monitoring and signal detection
export async function driftMonitoring() {
  console.log('\n=== Drift Monitoring and Signal Detection ===\n');

  // Get active drift signals
  const signals = governanceDriftControl.getDriftSignals();
  console.log('✅ Active drift signals:');
  signals.forEach(signal => {
    console.log(`  - ${signal.title}: ${signal.severity} (${(signal.driftPercentage * 100).toFixed(1)}% drift)`);
  });

  // Get comprehensive drift assessment
  const assessment = await governanceDriftControl.getDriftAssessment();
  console.log('\n✅ Drift Assessment Results:');
  console.log(`  - Overall Score: ${(assessment.overallScore * 100).toFixed(1)}%`);
  console.log(`  - Drift Level: ${assessment.driftLevel}`);
  console.log(`  - Active Signals: ${assessment.signals.length}`);
  console.log(`  - Continuity Metrics: ${assessment.continuityMetrics.length}`);
  console.log(`  - Culture Indicators: ${assessment.cultureIndicators.length}`);
  console.log(`  - Power Balances: ${assessment.powerBalances.length}`);

  console.log('\n✅ Recommendations:');
  assessment.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });

  // Acknowledge a signal if any exist
  if (signals.length > 0) {
    governanceDriftControl.acknowledgeSignal(signals[0].id, 'governance@company.com');
    console.log(`✅ Acknowledged signal: ${signals[0].title}`);
  }
}

// Example 4: Continuity monitoring
export async function continuityMonitoring() {
  console.log('\n=== Continuity Monitoring ===\n');

  // Get continuity metrics
  const metrics = governanceDriftControl.getContinuityMetrics();
  console.log('✅ Continuity Metrics:');
  metrics.forEach(metric => {
    console.log(`  - ${metric.name}: ${metric.currentValue} (target: ${metric.targetValue}) - ${metric.status}`);
  });

  // Update a metric value
  if (metrics.length > 0) {
    const testMetric = metrics[0];
    const newValue = testMetric.targetValue * 0.95; // 5% below target
    governanceDriftControl.updateMetric(testMetric.id, newValue);
    console.log(`✅ Updated metric "${testMetric.name}" to ${newValue}`);
  }

  // Analyze metric trends
  const healthyMetrics = metrics.filter(m => m.status === 'healthy').length;
  const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
  console.log(`✅ Metric Status Summary:`);
  console.log(`  - Healthy: ${healthyMetrics}/${metrics.length}`);
  console.log(`  - Critical: ${criticalMetrics}/${metrics.length}`);
}

// Example 5: Culture preservation
export async function culturePreservation() {
  console.log('\n=== Culture Preservation ===\n');

  // Get culture indicators
  const indicators = governanceDriftControl.getCultureIndicators();
  console.log('✅ Culture Indicators:');
  indicators.forEach(indicator => {
    console.log(`  - ${indicator.name}: ${indicator.currentValue}/1.0 (${indicator.status}, ${indicator.trend})`);
  });

  // Assess overall culture health
  const cultureHealth = governanceDriftControl.assessCultureHealth();
  console.log('\n✅ Culture Health Assessment:');
  console.log(`  - Overall: ${cultureHealth.overall}`);
  console.log(`  - Score: ${(cultureHealth.score * 100).toFixed(1)}%`);
  
  console.log('\n✅ Culture Recommendations:');
  cultureHealth.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });

  // Analyze by category
  console.log('\n✅ Culture by Category:');
  Object.entries(cultureHealth.byCategory).forEach(([category, indicator]) => {
    console.log(`  - ${category}: ${indicator.status} (${indicator.trend})`);
  });
}

// Example 6: Power balancing
export async function powerBalancing() {
  console.log('\n=== Power Balancing ===\n');

  // Get power balances
  const balances = governanceDriftControl.getPowerBalances();
  console.log('✅ Power Balances:');
  balances.forEach(balance => {
    console.log(`  - ${balance.name}: ${balance.health} (balance: ${balance.balance.toFixed(2)})`);
    balance.participants.forEach(participant => {
      console.log(`    - ${participant.role}: ${(participant.influence * 100).toFixed(1)}% influence (${participant.count} people)`);
    });
  });

  // Analyze power distribution
  const distribution = governanceDriftControl.analyzePowerDistribution();
  console.log('\n✅ Power Distribution Analysis:');
  console.log(`  - Overall: ${distribution.overall}`);
  console.log(`  - Risks: ${distribution.risks.length}`);
  
  if (distribution.risks.length > 0) {
    console.log('\n✅ Identified Risks:');
    distribution.risks.forEach((risk, index) => {
      console.log(`  ${index + 1}. ${risk}`);
    });
  }

  console.log('\n✅ Power Balancing Recommendations:');
  distribution.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
}

// Example 7: Alert management
export async function alertManagement() {
  console.log('\n=== Alert Management ===\n');

  // Get active alerts
  const alerts = governanceDriftControl.getActiveAlerts();
  console.log('✅ Active Alerts:');
  alerts.forEach(alert => {
    console.log(`  - ${alert.title}: ${alert.severity} (${alert.type})`);
    console.log(`    ${alert.message}`);
    if (alert.assignedTo) {
      console.log(`    Assigned to: ${alert.assignedTo}`);
    }
  });

  // Acknowledge an alert if any exist
  if (alerts.length > 0) {
    governanceDriftControl.acknowledgeAlert(alerts[0].id, 'governance@company.com');
    console.log(`✅ Acknowledged alert: ${alerts[0].title}`);
  }

  // Alert summary by severity
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
  console.log('\n✅ Alert Summary:');
  console.log(`  - Critical: ${criticalAlerts}`);
  console.log(`  - Warning: ${warningAlerts}`);
  console.log(`  - Total: ${alerts.length}`);
}

// Example 8: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const config = governanceDriftControl.getConfig();
  console.log('✅ Current Configuration:');
  console.log(`  - Intent Validation: ${config.enableIntentValidation}`);
  console.log(`  - Drift Detection: ${config.enableDriftDetection}`);
  console.log(`  - Continuity Monitoring: ${config.enableContinuityMonitoring}`);
  console.log(`  - Culture Preservation: ${config.enableCulturePreservation}`);
  console.log(`  - Power Balancing: ${config.enablePowerBalancing}`);
  console.log(`  - Drift Threshold: ${(config.driftThreshold * 100).toFixed(1)}%`);
  console.log(`  - Alert Threshold: ${(config.alertThreshold * 100).toFixed(1)}%`);

  // Update configuration
  governanceDriftControl.updateConfig({
    driftThreshold: 0.2, // Increase to 20%
    alertThreshold: 0.15, // Increase to 15%
    enableNotifications: true
  });
  console.log('✅ Updated configuration with new thresholds');

  // Get updated configuration
  const updatedConfig = governanceDriftControl.getConfig();
  console.log(`✅ New drift threshold: ${(updatedConfig.driftThreshold * 100).toFixed(1)}%`);
  console.log(`✅ New alert threshold: ${(updatedConfig.alertThreshold * 100).toFixed(1)}%`);
}

// Example 9: Comprehensive governance health check
export async function comprehensiveHealthCheck() {
  console.log('\n=== Comprehensive Governance Health Check ===\n');

  // Get drift assessment
  const assessment = await governanceDriftControl.getDriftAssessment();
  
  // Get culture health
  const cultureHealth = governanceDriftControl.assessCultureHealth();
  
  // Get power distribution
  const powerDistribution = governanceDriftControl.analyzePowerDistribution();
  
  // Get system health
  const systemHealth = await governanceDriftControl.getHealthStatus();

  console.log('✅ Comprehensive Health Summary:');
  console.log(`  - System Health: ${systemHealth.overall ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`  - Drift Level: ${assessment.driftLevel}`);
  console.log(`  - Culture Health: ${cultureHealth.overall}`);
  console.log(`  - Power Balance: ${powerDistribution.overall}`);
  console.log(`  - Active Alerts: ${governanceDriftControl.getActiveAlerts().length}`);
  console.log(`  - Active Signals: ${assessment.signals.length}`);

  // Calculate overall governance score
  const driftScore = 1 - assessment.overallScore; // Invert so higher is better
  const cultureScore = cultureHealth.score;
  const powerScore = powerDistribution.overall === 'balanced' ? 1 : powerDistribution.overall === 'skewed' ? 0.5 : 0;
  const overallGovernanceScore = (driftScore + cultureScore + powerScore) / 3;

  console.log(`\n✅ Overall Governance Score: ${(overallGovernanceScore * 100).toFixed(1)}%`);

  // Generate priority actions
  const priorityActions: string[] = [];
  
  if (assessment.driftLevel !== 'none') {
    priorityActions.push(`Address drift level: ${assessment.driftLevel}`);
  }
  
  if (cultureHealth.overall === 'concerning') {
    priorityActions.push('Immediate culture intervention required');
  }
  
  if (powerDistribution.overall === 'concentrated') {
    priorityActions.push('Urgent power rebalancing needed');
  }

  if (priorityActions.length === 0) {
    priorityActions.push('All governance metrics are healthy - maintain current practices');
  }

  console.log('\n✅ Priority Actions:');
  priorityActions.forEach((action, index) => {
    console.log(`  ${index + 1}. ${action}`);
  });
}

// Example 10: Automated governance workflow
export async function automatedGovernanceWorkflow() {
  console.log('\n=== Automated Governance Workflow ===\n');

  console.log('✅ Starting automated governance workflow...');

  // Step 1: Check system health
  const systemHealth = await governanceDriftControl.getHealthStatus();
  if (!systemHealth.overall) {
    console.log('❌ System health check failed - aborting workflow');
    return;
  }
  console.log('✅ System health check passed');

  // Step 2: Run drift assessment
  const assessment = await governanceDriftControl.getDriftAssessment();
  console.log(`✅ Drift assessment completed: ${assessment.driftLevel} drift level`);

  // Step 3: Check for critical signals
  const criticalSignals = assessment.signals.filter(s => s.severity === 'critical');
  if (criticalSignals.length > 0) {
    console.log(`⚠️  Found ${criticalSignals.length} critical signals - requiring immediate attention`);
    criticalSignals.forEach(signal => {
      console.log(`    - ${signal.title}: ${signal.description}`);
    });
  }

  // Step 4: Validate recent intents
  const recentIntents = governanceDriftControl.getAllIntents().slice(-5);
  console.log(`✅ Validating ${recentIntents.length} recent intents...`);
  
  for (const intent of recentIntents) {
    const validation = await governanceDriftControl.validateIntent(intent.intentId);
    if (validation.validationStatus !== 'valid') {
      console.log(`⚠️  Intent "${intent.feature}" has validation issues`);
    }
  }

  // Step 5: Update continuity metrics
  const metrics = governanceDriftControl.getContinuityMetrics();
  console.log(`✅ Updated ${metrics.length} continuity metrics`);

  // Step 6: Generate governance report
  const report = {
    timestamp: new Date(),
    driftAssessment: assessment,
    cultureHealth: governanceDriftControl.assessCultureHealth(),
    powerDistribution: governanceDriftControl.analyzePowerDistribution(),
    activeAlerts: governanceDriftControl.getActiveAlerts(),
    systemHealth
  };

  console.log('✅ Governance report generated');
  console.log(`  - Report timestamp: ${report.timestamp.toISOString()}`);
  console.log(`  - Overall drift: ${assessment.driftLevel}`);
  console.log(`  - Active alerts: ${report.activeAlerts.length}`);

  console.log('\n✅ Automated governance workflow completed successfully');
}

// Run all examples
export async function runAllExamples() {
  console.log('Governance & Drift Control Layer - Example Usage\n');
  console.log('===============================================\n');

  try {
    await basicGovernanceInitialization();
    await intentManagement();
    await driftMonitoring();
    await continuityMonitoring();
    await culturePreservation();
    await powerBalancing();
    await alertManagement();
    await configurationManagement();
    await comprehensiveHealthCheck();
    await automatedGovernanceWorkflow();

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

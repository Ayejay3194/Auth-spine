/**
 * Example usage of the Security Next-Level Suite
 * 
 * This example demonstrates how to use the security next-level suite that
 * turns security from a checklist into an operating system with:
 * - Compliance crosswalks (SOC2, ISO, NIST, PCI)
 * - Automated enforcement & guardrails
 * - Executive security dashboard & metrics
 */

import { 
  SecurityNextLevel, 
  securityNextLevel
} from './index.js';

// Example 1: Basic security next-level initialization
export async function basicSecurityNextLevelInitialization() {
  console.log('=== Basic Security Next-Level Initialization ===\n');

  await securityNextLevel.initialize();
  console.log('✅ Security Next-Level system initialized successfully');

  const healthStatus = await securityNextLevel.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Security operating system status
export async function securityOperatingSystemStatus() {
  console.log('\n=== Security Operating System Status ===\n');

  const osStatus = securityNextLevel.getOperatingSystemStatus();
  console.log('✅ Security Operating System Status:');
  console.log(`  - ID: ${osStatus.id}`);
  console.log(`  - Name: ${osStatus.name}`);
  console.log(`  - Version: ${osStatus.version}`);
  console.log(`  - Status: ${osStatus.status}`);
  console.log(`  - Last Health Check: ${osStatus.lastHealthCheck.toISOString()}`);

  console.log('\n✅ Component Status:');
  Object.entries(osStatus.components).forEach(([component, status]) => {
    console.log(`  - ${component}: ${status ? '✅ Active' : '❌ Inactive'}`);
  });

  console.log('\n✅ Operating System Metrics:');
  console.log(`  - Overall Score: ${osStatus.metrics.overallScore.toFixed(1)}%`);
  console.log(`  - Compliance Rate: ${osStatus.metrics.complianceRate.toFixed(1)}%`);
  console.log(`  - Risk Level: ${osStatus.metrics.riskLevel}`);
  console.log(`  - Incident Count: ${osStatus.metrics.incidentCount}`);
  console.log(`  - Control Coverage: ${osStatus.metrics.controlCoverage.toFixed(1)}%`);
}

// Example 3: Compliance crosswalks management
export async function complianceCrosswalksManagement() {
  console.log('\n=== Compliance Crosswalks Management ===\n');

  // Get all compliance crosswalks
  const allCrosswalks = securityNextLevel.getComplianceCrosswalks();
  console.log('✅ All Compliance Crosswalks:');
  (allCrosswalks as any[]).forEach(crosswalk => {
    console.log(`  - ${crosswalk.framework}: ${crosswalk.controls.length} controls (Maturity: ${crosswalk.maturity})`);
  });

  // Get specific framework crosswalk
  const soc2Crosswalk = securityNextLevel.getComplianceCrosswalks('SOC2') as any;
  console.log('\n✅ SOC2 Crosswalk Details:');
  console.log(`  - Framework: ${soc2Crosswalk.framework}`);
  console.log(`  - Total Controls: ${soc2Crosswalk.controls.length}`);
  console.log(`  - Maturity: ${soc2Crosswalk.maturity}`);

  // Show control categories
  const categories = [...new Set(soc2Crosswalk.controls.map((c: any) => c.category))];
  console.log(`  - Categories: ${categories.join(', ')}`);

  // Show implemented controls
  const implementedControls = soc2Crosswalk.controls.filter((c: any) => c.status === 'implemented');
  console.log(`  - Implemented Controls: ${implementedControls.length}/${soc2Crosswalk.controls.length}`);

  // Get control mappings
  const mappings = securityNextLevel.getComplianceCrosswalks();
  console.log('\n✅ Framework Mappings Available:');
  console.log('  - SOC2 ↔ ISO27001');
  console.log('  - SOC2 ↔ NIST-CSF');
  console.log('  - SOC2 ↔ PCI-DSS');
  console.log('  - ISO27001 ↔ NIST-CSF');
  console.log('  - ISO27001 ↔ PCI-DSS');
  console.log('  - NIST-CSF ↔ PCI-DSS');
}

// Example 4: Compliance gaps analysis
export async function complianceGapsAnalysis() {
  console.log('\n=== Compliance Gaps Analysis ===\n');

  const frameworks = ['SOC2', 'ISO27001', 'NIST-CSF', 'PCI-DSS'] as const;

  frameworks.forEach(framework => {
    const gaps = (securityNextLevel.getComplianceCrosswalks(framework) as any).getComplianceGaps(framework);
    console.log(`✅ ${framework} Compliance Gaps:`);
    console.log(`  - Total Gaps: ${gaps.length}`);
    
    const criticalGaps = gaps.filter((g: any) => g.severity === 'critical');
    const highGaps = gaps.filter((g: any) => g.severity === 'high');
    
    console.log(`  - Critical: ${criticalGaps.length}`);
    console.log(`  - High: ${highGaps.length}`);
    
    if (gaps.length > 0) {
      console.log('  - Sample Gaps:');
      gaps.slice(0, 3).forEach((gap: any) => {
        console.log(`    * ${gap.title}: ${gap.severity.toUpperCase()}`);
      });
    }
  });
}

// Example 5: Automated enforcement management
export async function automatedEnforcementManagement() {
  console.log('\n=== Automated Enforcement Management ===\n');

  // Get all enforcement guardrails
  const allGuardrails = securityNextLevel.getEnforcementGuardrails();
  console.log('✅ All Enforcement Guardrails:');
  console.log(`  - Total Guardrails: ${allGuardrails.length}`);

  // Show guardrails by category
  const categories = ['code', 'config', 'access', 'data', 'network'];
  categories.forEach(category => {
    const categoryGuardrails = securityNextLevel.getEnforcementGuardrails(category);
    console.log(`  - ${category}: ${categoryGuardrails.length} guardrails`);
  });

  // Show active guardrails
  const activeGuardrails = allGuardrails.filter(g => g.enabled);
  console.log(`  - Active Guardrails: ${activeGuardrails.length}`);

  // Show guardrail details
  console.log('\n✅ Sample Guardrails:');
  allGuardrails.slice(0, 3).forEach(guardrail => {
    console.log(`  - ${guardrail.name}:`);
    console.log(`    * Type: ${guardrail.type}`);
    console.log(`    * Enforcement: ${guardrail.enforcement}`);
    console.log(`    * Severity: ${guardrail.severity}`);
    console.log(`    * Executions: ${guardrail.metrics.executions}`);
    console.log(`    * Violations: ${guardrail.metrics.violations}`);
  });
}

// Example 6: Guardrail execution
export async function guardrailExecution() {
  console.log('\n=== Guardrail Execution ===\n');

  // Execute code security guardrail
  const codeGuardrail = securityNextLevel.getEnforcementGuardrails('code')[0];
  if (codeGuardrail) {
    const result = await (securityNextLevel as any).executeGuardrail(codeGuardrail.id, {
      trigger: 'git_commit',
      hasSecrets: false,
      fileCount: 5
    });
    
    console.log('✅ Code Guardrail Execution:');
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Blocked: ${result.blocked}`);
    console.log(`  - Violations: ${result.violations.length}`);
    console.log(`  - Actions: ${result.actions.length}`);
  }

  // Execute data security guardrail
  const dataGuardrail = securityNextLevel.getEnforcementGuardrails('data')[0];
  if (dataGuardrail) {
    const result = await (securityNextLevel as any).executeGuardrail(dataGuardrail.id, {
      trigger: 'data_access',
      containsPII: true,
      hasAuthorization: true
    });
    
    console.log('\n✅ Data Guardrail Execution:');
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Blocked: ${result.blocked}`);
    console.log(`  - Violations: ${result.violations.length}`);
  }
}

// Example 7: Executive dashboard management
export async function executiveDashboardManagement() {
  console.log('\n=== Executive Dashboard Management ===\n');

  // Get executive dashboard
  const dashboard = securityNextLevel.getExecutiveDashboard();
  console.log('✅ Executive Dashboard:');
  console.log(`  - ID: ${dashboard.id}`);
  console.log(`  - Title: ${dashboard.title}`);
  console.log(`  - Sections: ${dashboard.sections.length}`);
  console.log(`  - Refresh Interval: ${dashboard.refreshInterval / 1000}s`);
  console.log(`  - Last Refreshed: ${dashboard.lastRefreshed.toISOString()}`);

  // Show dashboard sections
  console.log('\n✅ Dashboard Sections:');
  dashboard.sections.forEach(section => {
    console.log(`  - ${section.title}: ${section.widgets.length} widgets`);
  });

  // Get security metrics
  const metrics = securityNextLevel.getSecurityMetrics();
  console.log('\n✅ Security Metrics Overview:');
  console.log(`  - Overall Score: ${metrics.overall.toFixed(1)}%`);
  console.log(`  - KPIs: ${metrics.kpis.length}`);
  console.log(`  - Active Alerts: ${metrics.alerts.length}`);

  // Show metrics by category
  console.log('\n✅ Metrics by Category:');
  Object.entries(metrics.byCategory).forEach(([category, categoryMetrics]) => {
    console.log(`  - ${category}: ${(categoryMetrics as any).length} metrics`);
  });
}

// Example 8: Security metrics analysis
export async function securityMetricsAnalysis() {
  console.log('\n=== Security Metrics Analysis ===\n');

  const metrics = securityNextLevel.getSecurityMetrics();

  // Show KPI metrics
  console.log('✅ Key Performance Indicators:');
  metrics.kpis.forEach((kpi: any) => {
    console.log(`  - ${kpi.name}: ${kpi.value}${kpi.unit} (${kpi.status})`);
  });

  // Show critical metrics
  const criticalMetrics = metrics.kpis.filter((m: any) => m.status === 'critical');
  if (criticalMetrics.length > 0) {
    console.log('\n✅ Critical Metrics:');
    criticalMetrics.forEach((metric: any) => {
      console.log(`  - ${metric.name}: ${metric.value}${metric.unit} (Target: ${metric.target}${metric.unit})`);
    });
  }

  // Show at-risk metrics
  const atRiskMetrics = metrics.kpis.filter((m: any) => m.status === 'at-risk');
  if (atRiskMetrics.length > 0) {
    console.log('\n✅ At-Risk Metrics:');
    atRiskMetrics.forEach((metric: any) => {
      console.log(`  - ${metric.name}: ${metric.value}${metric.unit} (Target: ${metric.target}${metric.unit})`);
    });
  }

  // Show metric trends
  console.log('\n✅ Metric Trends:');
  const improvingMetrics = metrics.kpis.filter((m: any) => m.trend === 'improving');
  const decliningMetrics = metrics.kpis.filter((m: any) => m.trend === 'declining');
  console.log(`  - Improving: ${improvingMetrics.length}`);
  console.log(`  - Stable: ${metrics.kpis.length - improvingMetrics.length - decliningMetrics.length}`);
  console.log(`  - Declining: ${decliningMetrics.length}`);
}

// Example 9: Alert management
export async function alertManagement() {
  console.log('\n=== Alert Management ===\n');

  // Get active alerts
  const activeAlerts = securityNextLevel.getActiveAlerts();
  console.log('✅ Active Security Alerts:');
  console.log(`  - Total Alerts: ${activeAlerts.length}`);

  // Show alerts by severity
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const highAlerts = activeAlerts.filter(a => a.severity === 'high');
  const mediumAlerts = activeAlerts.filter(a => a.severity === 'medium');
  
  console.log(`  - Critical: ${criticalAlerts.length}`);
  console.log(`  - High: ${highAlerts.length}`);
  console.log(`  - Medium: ${mediumAlerts.length}`);

  // Show alert details
  if (activeAlerts.length > 0) {
    console.log('\n✅ Recent Alerts:');
    activeAlerts.slice(0, 5).forEach(alert => {
      console.log(`  - [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.description}`);
      console.log(`    * Timestamp: ${alert.timestamp.toISOString()}`);
      console.log(`    * Acknowledged: ${alert.acknowledged ? 'Yes' : 'No'}`);
    });
  }

  // Acknowledge an alert if any exist
  if (activeAlerts.length > 0) {
    const alertToAcknowledge = activeAlerts[0];
    securityNextLevel.acknowledgeAlert(alertToAcknowledge.id, 'security-lead@company.com');
    console.log(`\n✅ Acknowledged alert: ${alertToAcknowledge.title}`);
  }
}

// Example 10: Comprehensive security assessment
export async function comprehensiveSecurityAssessment() {
  console.log('\n=== Comprehensive Security Assessment ===\n');

  // Run comprehensive assessment
  const assessment = await (securityNextLevel as any).runComprehensiveAssessment();
  console.log('✅ Comprehensive Security Assessment Results:');
  console.log(`  - Overall Score: ${assessment.overallScore.toFixed(1)}%`);
  console.log(`  - Compliance Results: ${Object.keys(assessment.complianceResults).length} frameworks`);
  console.log(`  - Enforcement Results: ${assessment.enforcementResults.effectiveness.toFixed(1)}% effectiveness`);
  console.log(`  - Dashboard Metrics: ${assessment.dashboardMetrics.overall.toFixed(1)}% overall`);
  console.log(`  - Active Alerts: ${assessment.alerts.length}`);

  // Show compliance results
  console.log('\n✅ Compliance Results:');
  Object.entries(assessment.complianceResults).forEach(([framework, result]: [string, any]) => {
    console.log(`  - ${framework}: ${result.complianceRate.toFixed(1)}% (${result.status})`);
  });

  // Show enforcement results
  console.log('\n✅ Enforcement Results:');
  console.log(`  - Total Guardrails: ${assessment.enforcementResults.totalGuardrails}`);
  console.log(`  - Active Guardrails: ${assessment.enforcementResults.activeGuardrails}`);
  console.log(`  - Total Executions: ${assessment.enforcementResults.totalExecutions}`);
  console.log(`  - Total Violations: ${assessment.enforcementResults.totalViolations}`);
  console.log(`  - Effectiveness: ${assessment.enforcementResults.effectiveness.toFixed(1)}%`);
  console.log(`  - Violation Rate: ${assessment.enforcementResults.violationRate.toFixed(1)}%`);

  // Show recommendations
  console.log('\n✅ Recommendations:');
  assessment.recommendations.forEach((rec: string, index: number) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
}

// Example 11: Security operating system workflow
export async function securityOperatingSystemWorkflow() {
  console.log('\n=== Security Operating System Workflow ===\n');

  console.log('✅ Starting security operating system workflow...');

  // Step 1: Check system health
  const healthStatus = await securityNextLevel.getHealthStatus();
  if (!healthStatus.overall) {
    console.log('❌ System health check failed - aborting workflow');
    return;
  }
  console.log('✅ System health check passed');

  // Step 2: Check operating system status
  const osStatus = securityNextLevel.getOperatingSystemStatus();
  console.log(`✅ Security OS status: ${osStatus.status}`);
  console.log(`✅ Overall score: ${osStatus.metrics.overallScore.toFixed(1)}%`);

  // Step 3: Check compliance status
  const complianceResults = await (securityNextLevel as any).assessCompliance();
  const avgCompliance = Object.values(complianceResults).reduce((sum: number, result: any) => sum + result.complianceRate, 0) / Object.keys(complianceResults).length;
  console.log(`✅ Average compliance: ${avgCompliance.toFixed(1)}%`);

  // Step 4: Check enforcement effectiveness
  const enforcementResults = await (securityNextLevel as any).assessEnforcement();
  console.log(`✅ Enforcement effectiveness: ${enforcementResults.effectiveness.toFixed(1)}%`);

  // Step 5: Check dashboard metrics
  const dashboardMetrics = (securityNextLevel as any).getDashboardMetrics();
  console.log(`✅ Dashboard metrics: ${dashboardMetrics.overall.toFixed(1)}% overall`);

  // Step 6: Check for active alerts
  const activeAlerts = securityNextLevel.getActiveAlerts();
  if (activeAlerts.length > 0) {
    console.log(`⚠️  ${activeAlerts.length} active alerts require attention`);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      console.log(`    * ${criticalAlerts.length} critical alerts need immediate action`);
    }
  }

  // Step 7: Generate comprehensive report
  const assessment = await (securityNextLevel as any).runComprehensiveAssessment();
  console.log('✅ Comprehensive assessment completed');
  console.log(`  - Overall score: ${assessment.overallScore.toFixed(1)}%`);
  console.log(`  - Recommendations: ${assessment.recommendations.length}`);

  console.log('\n✅ Security operating system workflow completed successfully');
}

// Example 12: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const config = securityNextLevel.getConfig();
  console.log('✅ Current Configuration:');
  console.log(`  - Enable Compliance Crosswalks: ${config.enableComplianceCrosswalks}`);
  console.log(`  - Enable Automated Enforcement: ${config.enableAutomatedEnforcement}`);
  console.log(`  - Enable Executive Dashboard: ${config.enableExecutiveDashboard}`);
  console.log(`  - Frameworks: ${config.frameworks.join(', ')}`);
  console.log(`  - Enforcement Mode: ${config.enforcementMode}`);
  console.log(`  - Dashboard Refresh Interval: ${config.dashboardRefreshInterval / 1000}s`);

  // Show alert thresholds
  console.log('\n✅ Alert Thresholds:');
  Object.entries(config.alertThresholds).forEach(([level, threshold]) => {
    console.log(`  - ${level}: ${threshold}%`);
  });

  // Update configuration
  securityNextLevel.updateConfig({
    enforcementMode: 'enforce',
    dashboardRefreshInterval: 180000, // 3 minutes
    alertThresholds: {
      critical: 95,
      high: 80,
      medium: 60,
      low: 40
    }
  });
  console.log('\n✅ Configuration updated');

  // Get updated configuration
  const updatedConfig = securityNextLevel.getConfig();
  console.log(`✅ New enforcement mode: ${updatedConfig.enforcementMode}`);
  console.log(`✅ New refresh interval: ${updatedConfig.dashboardRefreshInterval / 1000}s`);
  console.log(`✅ New critical threshold: ${updatedConfig.alertThresholds.critical}%`);
}

// Run all examples
export async function runAllExamples() {
  console.log('Security Next-Level Suite - Example Usage\n');
  console.log('=====================================\n');

  try {
    await basicSecurityNextLevelInitialization();
    await securityOperatingSystemStatus();
    await complianceCrosswalksManagement();
    await complianceGapsAnalysis();
    await automatedEnforcementManagement();
    await guardrailExecution();
    await executiveDashboardManagement();
    await securityMetricsAnalysis();
    await alertManagement();
    await comprehensiveSecurityAssessment();
    await securityOperatingSystemWorkflow();
    await configurationManagement();

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

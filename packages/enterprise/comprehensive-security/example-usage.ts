/**
 * Example usage of the Comprehensive Platform Security Package
 * 
 * This example demonstrates how to use the comprehensive security blueprint
 * covering all security domains from authentication to emerging threats.
 */

import { 
  ComprehensiveSecurity, 
  comprehensiveSecurity
} from './index.js';

// Example 1: Basic comprehensive security initialization
export async function basicComprehensiveSecurityInitialization() {
  console.log('=== Basic Comprehensive Security Initialization ===\n');

  await comprehensiveSecurity.initialize();
  console.log('✅ Comprehensive Security system initialized successfully');

  const healthStatus = await comprehensiveSecurity.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Security blueprint management
export async function securityBlueprintManagement() {
  console.log('\n=== Security Blueprint Management ===\n');

  const blueprint = comprehensiveSecurity.getSecurityBlueprint();
  console.log('✅ Security Blueprint Retrieved');
  console.log(`  - Blueprint ID: ${blueprint.id}`);
  console.log(`  - Version: ${blueprint.version}`);
  console.log(`  - Domains: ${blueprint.domains.length}`);
  console.log(`  - Controls: ${blueprint.controls.length}`);
  console.log(`  - Frameworks: ${blueprint.frameworks.join(', ')}`);

  // Get controls by domain
  const authControls = comprehensiveSecurity.getControls('authentication');
  console.log(`✅ Authentication controls: ${authControls.length}`);
  
  const appSecurityControls = comprehensiveSecurity.getControls('application-security');
  console.log(`✅ Application security controls: ${appSecurityControls.length}`);

  // Get all controls
  const allControls = comprehensiveSecurity.getControls();
  console.log(`✅ Total security controls: ${allControls.length}`);

  // Show control categories
  const criticalControls = allControls.filter(c => c.severity === 'critical');
  const highControls = allControls.filter(c => c.severity === 'high');
  console.log(`✅ Critical controls: ${criticalControls.length}`);
  console.log(`✅ High severity controls: ${highControls.length}`);
}

// Example 3: Comprehensive security assessment
export async function comprehensiveSecurityAssessment() {
  console.log('\n=== Comprehensive Security Assessment ===\n');

  // Run assessment for all domains
  const assessment = await comprehensiveSecurity.runAssessment();
  console.log('✅ Comprehensive Security Assessment Completed');
  console.log(`  - Assessment ID: ${assessment.id}`);
  console.log(`  - Overall Score: ${assessment.results.overallScore.toFixed(1)}%`);
  console.log(`  - Domains Assessed: ${assessment.scope.domains.length}`);
  console.log(`  - Controls Validated: ${assessment.results.controlResults.length}`);
  console.log(`  - Risks Identified: ${assessment.risks.length}`);

  // Show domain scores
  console.log('\n✅ Domain Scores:');
  Object.entries(assessment.results.domainScores).forEach(([domain, score]) => {
    const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
    console.log(`  ${status} ${domain}: ${score.toFixed(1)}%`);
  });

  // Show critical risks
  const criticalRisks = assessment.risks.filter(r => r.level === 'critical');
  if (criticalRisks.length > 0) {
    console.log('\n✅ Critical Risks:');
    criticalRisks.forEach(risk => {
      console.log(`  - ${risk.title}: ${risk.description}`);
    });
  }

  // Show recommendations
  console.log('\n✅ Recommendations:');
  assessment.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
}

// Example 4: Domain-specific assessments
export async function domainSpecificAssessments() {
  console.log('\n=== Domain-Specific Assessments ===\n');

  const domains = ['authentication', 'application-security', 'data-protection', 'network-security'];

  for (const domain of domains) {
    const assessment = await comprehensiveSecurity.runAssessment([domain as any]);
    const score = assessment.results.domainScores[domain as any];
    const status = score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Weak';
    
    console.log(`✅ ${domain}: ${score.toFixed(1)}% (${status})`);
  }
}

// Example 5: Security metrics and monitoring
export async function securityMetricsMonitoring() {
  console.log('\n=== Security Metrics and Monitoring ===\n');

  // Get security metrics for all domains
  const metrics = comprehensiveSecurity.getMetrics();
  console.log('✅ Security Metrics Retrieved');
  
  metrics.forEach(domain => {
    console.log(`\n  ${domain.domain}: ${domain.health.toUpperCase()}`);
    domain.metrics.forEach(metric => {
      const trend = metric.trend === 'improving' ? '📈' : metric.trend === 'declining' ? '📉' : '➡️';
      console.log(`    ${trend} ${metric.name}: ${metric.value.toFixed(1)}% (target: ${metric.target}%)`);
    });
  });

  // Get overall health summary
  const healthyDomains = metrics.filter(m => m.health === 'healthy').length;
  const warningDomains = metrics.filter(m => m.health === 'warning').length;
  const criticalDomains = metrics.filter(m => m.health === 'critical').length;
  
  console.log('\n✅ Domain Health Summary:');
  console.log(`  - Healthy: ${healthyDomains}/${metrics.length}`);
  console.log(`  - Warning: ${warningDomains}/${metrics.length}`);
  console.log(`  - Critical: ${criticalDomains}/${metrics.length}`);
}

// Example 6: Compliance status monitoring
export async function complianceStatusMonitoring() {
  console.log('\n=== Compliance Status Monitoring ===\n');

  // Get overall compliance status
  const complianceStatus = comprehensiveSecurity.getComplianceStatus();
  console.log('✅ Overall Compliance Status:');
  
  complianceStatus.forEach(framework => {
    const score = framework.score.toFixed(1);
    const status = framework.status.toUpperCase();
    console.log(`  - ${framework.framework}: ${score}% (${status})`);
  });

  // Get specific framework compliance
  const soc2Compliance = comprehensiveSecurity.getComplianceStatus('SOC2');
  console.log(`\n✅ SOC2 Compliance Details:`);
  console.log(`  - Score: ${soc2Compliance.score.toFixed(1)}%`);
  console.log(`  - Status: ${soc2Compliance.status}`);
  console.log(`  - Last Assessed: ${soc2Compliance.lastAssessed.toISOString().split('T')[0]}`);
}

// Example 7: Security incident management
export async function securityIncidentManagement() {
  console.log('\n=== Security Incident Management ===\n');

  // Get all security incidents
  const allIncidents = comprehensiveSecurity.getIncidents();
  console.log('✅ Security Incidents Retrieved');
  console.log(`  - Total incidents: ${allIncidents.length}`);

  // Get incidents by severity
  const criticalIncidents = comprehensiveSecurity.getIncidents({ severity: 'critical' });
  const highIncidents = comprehensiveSecurity.getIncidents({ severity: 'high' });
  const openIncidents = comprehensiveSecurity.getIncidents({ status: 'open' });
  
  console.log(`  - Critical incidents: ${criticalIncidents.length}`);
  console.log(`  - High incidents: ${highIncidents.length}`);
  console.log(`  - Open incidents: ${openIncidents.length}`);

  // Show recent incidents
  const recentIncidents = comprehensiveSecurity.getIncidents({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
  });
  
  console.log('\n✅ Recent Incidents (Last 7 days):');
  recentIncidents.forEach(incident => {
    console.log(`  - ${incident.title}: ${incident.severity} (${incident.status})`);
  });
}

// Example 8: Security reporting
export async function securityReporting() {
  console.log('\n=== Security Reporting ===\n');

  // Generate executive report
  const executiveReport = await comprehensiveSecurity.generateReport('executive');
  console.log('✅ Executive Report Generated');
  console.log(`  - Report Type: ${executiveReport.type}`);
  console.log(`  - Overall Score: ${executiveReport.summary.overallScore.toFixed(1)}%`);
  console.log(`  - Critical Issues: ${executiveReport.summary.criticalIssues}`);
  console.log(`  - Open Incidents: ${executiveReport.summary.openIncidents}`);

  // Generate detailed report
  const detailedReport = await comprehensiveSecurity.generateReport('detailed');
  console.log('\n✅ Detailed Report Generated');
  console.log(`  - Assessment Results: ${detailedReport.details.assessment.results.controlResults.length} controls`);
  console.log(`  - Metrics: ${detailedReport.details.metrics.length} domains`);
  console.log(`  - Incidents: ${detailedReport.details.incidents.length} incidents`);

  // Generate compliance report
  const complianceReport = await comprehensiveSecurity.generateReport('compliance');
  console.log('\n✅ Compliance Report Generated');
  console.log(`  - Compliance Status: ${Object.keys(complianceReport.summary.complianceStatus).length} frameworks`);
}

// Example 9: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const config = comprehensiveSecurity.getConfig();
  console.log('✅ Current Configuration:');
  console.log(`  - Enable All Domains: ${config.enableAllDomains}`);
  console.log(`  - Enforce Controls: ${config.enforceControls}`);
  console.log(`  - Audit Mode: ${config.auditMode}`);
  console.log(`  - Compliance Frameworks: ${config.complianceFrameworks.join(', ')}`);
  console.log(`  - Assessment Frequency: ${config.assessmentFrequency}`);
  console.log(`  - Report Format: ${config.reportFormat}`);
  console.log(`  - Auto Remediation: ${config.autoRemediation}`);
  console.log(`  - Alert Threshold: ${config.alertThreshold}`);

  // Update configuration
  comprehensiveSecurity.updateConfig({
    assessmentFrequency: 'monthly',
    alertThreshold: 'high',
    autoRemediation: true
  });
  console.log('\n✅ Configuration Updated');

  // Get updated configuration
  const updatedConfig = comprehensiveSecurity.getConfig();
  console.log(`✅ New assessment frequency: ${updatedConfig.assessmentFrequency}`);
  console.log(`✅ New alert threshold: ${updatedConfig.alertThreshold}`);
  console.log(`✅ Auto remediation enabled: ${updatedConfig.autoRemediation}`);
}

// Example 10: Comprehensive security health check
export async function comprehensiveSecurityHealthCheck() {
  console.log('\n=== Comprehensive Security Health Check ===\n');

  // Get system health
  const systemHealth = await comprehensiveSecurity.getHealthStatus();
  console.log('✅ System Health Status:');
  console.log(`  - Overall: ${systemHealth.overall ? '✅ Healthy' : '❌ Unhealthy'}`);
  
  Object.entries(systemHealth.components).forEach(([component, status]) => {
    console.log(`  - ${component}: ${status ? '✅' : '❌'}`);
  });

  // Get security blueprint status
  const blueprint = comprehensiveSecurity.getSecurityBlueprint();
  console.log(`\n✅ Security Blueprint Status:`);
  console.log(`  - Version: ${blueprint.version}`);
  console.log(`  - Maturity: ${blueprint.maturity}`);
  console.log(`  - Last Updated: ${blueprint.lastUpdated.toISOString().split('T')[0]}`);
  console.log(`  - Next Review: ${blueprint.nextReview.toISOString().split('T')[0]}`);

  // Get control coverage
  const allControls = comprehensiveSecurity.getControls();
  const implementedControls = allControls.filter(c => c.status === 'implemented').length;
  const controlCoverage = (implementedControls / allControls.length) * 100;
  
  console.log(`\n✅ Control Coverage:`);
  console.log(`  - Total Controls: ${allControls.length}`);
  console.log(`  - Implemented: ${implementedControls}`);
  console.log(`  - Coverage: ${controlCoverage.toFixed(1)}%`);

  // Get compliance overview
  const complianceStatus = comprehensiveSecurity.getComplianceStatus();
  const avgCompliance = complianceStatus.reduce((sum, f) => sum + f.score, 0) / complianceStatus.length;
  
  console.log(`\n✅ Compliance Overview:`);
  console.log(`  - Average Compliance: ${avgCompliance.toFixed(1)}%`);
  console.log(`  - Compliant Frameworks: ${complianceStatus.filter(f => f.status === 'compliant').length}`);

  // Get incident summary
  const incidents = comprehensiveSecurity.getIncidents();
  const openIncidents = incidents.filter(i => ['open', 'investigating'].includes(i.status));
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  
  console.log(`\n✅ Incident Summary:`);
  console.log(`  - Total Incidents: ${incidents.length}`);
  console.log(`  - Open Incidents: ${openIncidents.length}`);
  console.log(`  - Critical Incidents: ${criticalIncidents.length}`);

  // Calculate overall security score
  const overallScore = (controlCoverage + avgCompliance) / 2;
  const securityPosture = overallScore >= 90 ? 'Excellent' : overallScore >= 80 ? 'Strong' : overallScore >= 70 ? 'Moderate' : 'Needs Improvement';
  
  console.log(`\n✅ Overall Security Score: ${overallScore.toFixed(1)}% (${securityPosture})`);

  // Generate priority actions
  const priorityActions: string[] = [];
  
  if (controlCoverage < 90) {
    priorityActions.push('Increase security control implementation coverage');
  }
  
  if (avgCompliance < 85) {
    priorityActions.push('Address compliance gaps across frameworks');
  }
  
  if (openIncidents.length > 5) {
    priorityActions.push('Reduce backlog of open security incidents');
  }
  
  if (criticalIncidents.length > 0) {
    priorityActions.push('Address critical security incidents immediately');
  }

  if (priorityActions.length === 0) {
    priorityActions.push('Security posture is strong - maintain current controls and monitoring');
  }

  console.log('\n✅ Priority Actions:');
  priorityActions.forEach((action, index) => {
    console.log(`  ${index + 1}. ${action}`);
  });
}

// Example 11: Automated security workflow
export async function automatedSecurityWorkflow() {
  console.log('\n=== Automated Security Workflow ===\n');

  console.log('✅ Starting automated comprehensive security workflow...');

  // Step 1: Check system health
  const systemHealth = await comprehensiveSecurity.getHealthStatus();
  if (!systemHealth.overall) {
    console.log('❌ System health check failed - aborting workflow');
    return;
  }
  console.log('✅ System health check passed');

  // Step 2: Run comprehensive assessment
  const assessment = await comprehensiveSecurity.runAssessment();
  console.log(`✅ Comprehensive assessment completed: ${assessment.results.overallScore.toFixed(1)}% overall score`);

  // Step 3: Check for critical risks
  const criticalRisks = assessment.risks.filter(r => r.level === 'critical');
  if (criticalRisks.length > 0) {
    console.log(`⚠️  Found ${criticalRisks.length} critical risks - requiring immediate attention`);
    criticalRisks.forEach(risk => {
      console.log(`    - ${risk.title}: ${risk.description}`);
    });
  }

  // Step 4: Check compliance status
  const complianceStatus = comprehensiveSecurity.getComplianceStatus();
  const nonCompliantFrameworks = complianceStatus.filter(f => f.status !== 'compliant');
  if (nonCompliantFrameworks.length > 0) {
    console.log(`⚠️  ${nonCompliantFrameworks.length} frameworks not fully compliant`);
  }

  // Step 5: Check security metrics
  const metrics = comprehensiveSecurity.getMetrics();
  const criticalDomains = metrics.filter(m => m.health === 'critical');
  if (criticalDomains.length > 0) {
    console.log(`⚠️  ${criticalDomains.length} domains in critical state`);
  }

  // Step 6: Check open incidents
  const openIncidents = comprehensiveSecurity.getIncidents({ status: 'open' });
  if (openIncidents.length > 0) {
    console.log(`⚠️  ${openIncidents.length} open security incidents`);
  }

  // Step 7: Generate comprehensive report
  const report = await comprehensiveSecurity.generateReport('detailed');
  console.log('✅ Comprehensive security report generated');
  console.log(`  - Report timestamp: ${report.timestamp.toISOString()}`);
  console.log(`  - Overall score: ${report.summary.overallScore.toFixed(1)}%`);
  console.log(`  - Critical issues: ${report.summary.criticalIssues}`);
  console.log(`  - Open incidents: ${report.summary.openIncidents}`);

  console.log('\n✅ Automated comprehensive security workflow completed successfully');
}

// Run all examples
export async function runAllExamples() {
  console.log('Comprehensive Platform Security Package - Example Usage\n');
  console.log('====================================================\n');

  try {
    await basicComprehensiveSecurityInitialization();
    await securityBlueprintManagement();
    await comprehensiveSecurityAssessment();
    await domainSpecificAssessments();
    await securityMetricsMonitoring();
    await complianceStatusMonitoring();
    await securityIncidentManagement();
    await securityReporting();
    await configurationManagement();
    await comprehensiveSecurityHealthCheck();
    await automatedSecurityWorkflow();

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

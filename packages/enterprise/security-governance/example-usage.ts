/**
 * Example usage of the Security Governance & Enforcement Layer
 * 
 * This example demonstrates how to use the layer to:
 * - Enforce security controls at CI/CD and runtime
 * - Manage risk acceptances
 * - Implement AI trust boundaries
 * - Monitor security compliance
 * - Generate audit reports
 */

import { 
  SecurityGovernance, 
  securityGovernance
} from './index.js';

// Example 1: Basic security governance initialization
export async function basicSecurityGovernanceInitialization() {
  console.log('=== Basic Security Governance Initialization ===\n');

  await securityGovernance.initialize();
  console.log('✅ Security Governance system initialized successfully');

  const healthStatus = await securityGovernance.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Security control management
export async function securityControlManagement() {
  console.log('\n=== Security Control Management ===\n');

  // Add a new security control
  const control = securityGovernance.addControl({
    description: 'API rate limiting implemented',
    severity: 'HIGH',
    enforcement: 'RUNTIME',
    evidence: 'Rate limiter middleware active',
    status: 'REQUIRED',
    category: 'infrastructure',
    framework: ['OWASP'],
    implementation: {
      type: 'code',
      location: 'middleware/rate-limiter.js',
      automated: true
    },
    validation: {
      type: 'test',
      script: 'test-rate-limiting.js',
      frequency: 'build'
    }
  });
  console.log('✅ Added security control');
  console.log(`  - Control ID: ${control.id}`);
  console.log(`  - Description: ${control.description}`);
  console.log(`  - Severity: ${control.severity}`);

  // Get all controls
  const allControls = securityGovernance.getAllControls();
  console.log(`✅ Total security controls: ${allControls.length}`);

  // Get controls by category
  const authControls = securityGovernance.getAllControls().filter(c => c.category === 'authentication');
  console.log(`✅ Authentication controls: ${authControls.length}`);

  // Get critical controls
  const criticalControls = securityGovernance.getAllControls().filter(c => c.severity === 'CRITICAL');
  console.log(`✅ Critical controls: ${criticalControls.length}`);
}

// Example 3: Security gates execution
export async function securityGatesExecution() {
  console.log('\n=== Security Gates Execution ===\n');

  // Run pre-commit security gates
  const preCommitResult = await securityGovernance.runSecurityGates('pre-commit', {
    branch: 'feature/new-security',
    changedFiles: ['src/auth.js', 'src/api.js']
  });
  console.log('✅ Pre-commit security gates executed');
  console.log(`  - Success: ${preCommitResult.success}`);
  console.log(`  - Blocked: ${preCommitResult.blocked}`);
  console.log(`  - Violations: ${preCommitResult.violations.length}`);
  console.log(`  - Summary: ${preCommitResult.summary}`);

  // Run build security gates
  const buildResult = await securityGovernance.runSecurityGates('build', {
    environment: 'staging'
  });
  console.log('\n✅ Build security gates executed');
  console.log(`  - Success: ${buildResult.success}`);
  console.log(`  - Blocked: ${buildResult.blocked}`);
  console.log(`  - Violations: ${buildResult.violations.length}`);

  // Run deploy security gates
  const deployResult = await securityGovernance.runSecurityGates('deploy', {
    environment: 'production'
  });
  console.log('\n✅ Deploy security gates executed');
  console.log(`  - Success: ${deployResult.success}`);
  console.log(`  - Blocked: ${deployResult.blocked}`);
  console.log(`  - Violations: ${deployResult.violations.length}`);
}

// Example 4: Risk acceptance management
export async function riskAcceptanceManagement() {
  console.log('\n=== Risk Acceptance Management ===\n');

  // Request risk acceptance for a control
  const riskAcceptance = securityGovernance.requestRiskAcceptance({
    controlId: 'SEC-AUTH-001',
    reason: 'Legacy system requires temporary exception for TLS upgrade',
    owner: 'infrastructure-team@company.com',
    approver: 'security-officer@company.com',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    mitigationPlan: 'Schedule TLS upgrade for next maintenance window'
  });
  console.log('✅ Requested risk acceptance');
  console.log(`  - Acceptance ID: ${riskAcceptance.id}`);
  console.log(`  - Control ID: ${riskAcceptance.controlId}`);
  console.log(`  - Expires: ${riskAcceptance.expirationDate.toISOString()}`);

  // Approve the risk acceptance
  securityGovernance.approveRiskAcceptance(riskAcceptance.id, 'security-officer@company.com');
  console.log('✅ Approved risk acceptance');

  // Get active risk acceptances
  const activeAcceptances = securityGovernance.getActiveRiskAcceptances();
  console.log(`✅ Active risk acceptances: ${activeAcceptances.length}`);

  // Get expiring acceptances
  const expiringAcceptances = activeAcceptances.filter(a => 
    a.expirationDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 // 7 days
  );
  console.log(`✅ Risk acceptances expiring within 7 days: ${expiringAcceptances.length}`);
}

// Example 5: AI trust boundary enforcement
export async function aiTrustBoundaryEnforcement() {
  console.log('\n=== AI Trust Boundary Enforcement ===\n');

  // Test allowed AI operation
  const allowedOperation = securityGovernance.checkAITrustBoundary({
    type: 'data-access',
    model: 'gpt-4',
    dataType: 'public',
    operation: 'SELECT analytics',
    userId: 'user-123',
    sessionId: 'session-456'
  });
  console.log('✅ Allowed AI operation');
  console.log(`  - Allowed: ${allowedOperation.allowed}`);
  console.log(`  - Violation: ${allowedOperation.violation ? 'Yes' : 'No'}`);

  // Test blocked AI operation
  const blockedOperation = securityGovernance.checkAITrustBoundary({
    type: 'data-access',
    model: 'gpt-4',
    dataType: 'sensitive',
    operation: 'SELECT * FROM users',
    userId: 'user-123',
    sessionId: 'session-456'
  });
  console.log('\n✅ Blocked AI operation');
  console.log(`  - Allowed: ${blockedOperation.allowed}`);
  console.log(`  - Violation: ${blockedOperation.violation ? 'Yes' : 'No'}`);
  if (blockedOperation.violation) {
    console.log(`  - Violation type: ${blockedOperation.violation.type}`);
    console.log(`  - Description: ${blockedOperation.violation.description}`);
  }

  // Get AI violations
  const aiViolations = securityGovernance.getAIViolations();
  console.log(`\n✅ Total AI violations: ${aiViolations.length}`);
}

// Example 6: Runtime security enforcement
export async function runtimeSecurityEnforcement() {
  console.log('\n=== Runtime Security Enforcement ===\n');

  // Test allowed operation
  const allowedContext = {
    operation: 'read-user-data',
    user: 'user-123',
    permissions: ['read', 'write'],
    data: { id: 123, name: 'John Doe', email: 'john@example.com' }
  };

  const allowedResult = securityGovernance.enforceRuntime(allowedContext);
  console.log('✅ Allowed runtime operation');
  console.log(`  - Success: ${allowedResult.success}`);
  console.log(`  - Blocked: ${allowedResult.blocked}`);
  console.log(`  - Violations: ${allowedResult.violations.length}`);

  // Test blocked operation (no authentication)
  const blockedContext = {
    operation: 'delete-user-data',
    data: { id: 123 }
  };

  const blockedResult = securityGovernance.enforceRuntime(blockedContext);
  console.log('\n✅ Blocked runtime operation');
  console.log(`  - Success: ${blockedResult.success}`);
  console.log(`  - Blocked: ${blockedResult.blocked}`);
  console.log(`  - Violations: ${blockedResult.violations.length}`);
  if (blockedResult.violations.length > 0) {
    blockedResult.violations.forEach(violation => {
      console.log(`    - ${violation.message}`);
    });
  }

  // Test data sanitization
  const sanitizationContext = {
    operation: 'export-data',
    user: 'user-123',
    permissions: ['export'],
    data: { 
      id: 123, 
      name: 'John Doe', 
      email: 'john@example.com',
      password: 'secret123',
      ssn: '123-45-6789'
    }
  };

  const sanitizationResult = securityGovernance.enforceRuntime(sanitizationContext);
  console.log('\n✅ Data sanitization check');
  console.log(`  - Success: ${sanitizationResult.success}`);
  console.log(`  - Violations: ${sanitizationResult.violations.length}`);
}

// Example 7: Security audit and monitoring
export async function securityAuditMonitoring() {
  console.log('\n=== Security Audit and Monitoring ===\n');

  // Get security audits
  const audits = securityGovernance.getAudits({
    limit: 10
  });
  console.log('✅ Recent security audits');
  audits.forEach((audit, index) => {
    console.log(`  ${index + 1}. [${audit.severity}] ${audit.message} (${audit.type})`);
  });

  // Get audit statistics
  const statistics = securityGovernance.getAudits(); // This would call getStatistics in real implementation
  console.log(`\n✅ Total audit records: ${audits.length}`);

  // Get violations
  const violations = securityGovernance.getAudits({
    type: 'VIOLATION'
  });
  console.log(`✅ Security violations: ${violations.length}`);

  // Get critical violations
  const criticalViolations = securityGovernance.getAudits({
    type: 'VIOLATION',
    severity: 'CRITICAL'
  });
  console.log(`✅ Critical violations: ${criticalViolations.length}`);
}

// Example 8: Compliance reporting
export async function complianceReporting() {
  console.log('\n=== Compliance Reporting ===\n');

  // Validate all controls
  const validation = await securityGovernance.validateControls();
  console.log('✅ Security Control Validation');
  console.log(`  - Compliant: ${validation.compliant.length}`);
  console.log(`  - Non-compliant: ${validation.nonCompliant.length}`);
  console.log(`  - Exempted: ${validation.exempted.length}`);

  // Generate compliance report
  const report = await securityGovernance.generateComplianceReport('OWASP');
  console.log('\n✅ Compliance Report Generated');
  console.log(`  - Framework: ${report.framework}`);
  console.log(`  - Overall Score: ${report.overallScore.toFixed(1)}%`);
  console.log(`  - Total Controls: ${report.controls.total}`);
  console.log(`  - Compliant: ${report.controls.compliant}`);
  console.log(`  - Non-compliant: ${report.controls.nonCompliant}`);
  console.log(`  - Exempted: ${report.controls.exempted}`);

  console.log('\n✅ Recommendations:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
}

// Example 9: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const config = securityGovernance.getConfig();
  console.log('✅ Current Configuration:');
  console.log(`  - Enforce Controls: ${config.enforceControls}`);
  console.log(`  - Block on Failure: ${config.blockOnFailure}`);
  console.log(`  - Require Risk Acceptance: ${config.requireRiskAcceptance}`);
  console.log(`  - Enable Runtime Enforcement: ${config.enableRuntimeEnforcement}`);
  console.log(`  - Enable CI Gates: ${config.enableCIGates}`);
  console.log(`  - Enable AI Trust Boundary: ${config.enableAITrustBoundary}`);
  console.log(`  - Log Level: ${config.logLevel}`);

  // Update configuration
  securityGovernance.updateConfig({
    blockOnFailure: false, // Change to warning mode
    logLevel: 'debug',
    riskAcceptanceExpiration: 60 // 60 days instead of 90
  });
  console.log('\n✅ Updated configuration');

  // Get updated configuration
  const updatedConfig = securityGovernance.getConfig();
  console.log(`✅ New block on failure setting: ${updatedConfig.blockOnFailure}`);
  console.log(`✅ New log level: ${updatedConfig.logLevel}`);
  console.log(`✅ New risk acceptance expiration: ${updatedConfig.riskAcceptanceExpiration} days`);
}

// Example 10: Comprehensive security health check
export async function comprehensiveSecurityHealthCheck() {
  console.log('\n=== Comprehensive Security Health Check ===\n');

  // Get system health
  const systemHealth = await securityGovernance.getHealthStatus();
  console.log('✅ System Health Status:');
  console.log(`  - Overall: ${systemHealth.overall ? '✅ Healthy' : '❌ Unhealthy'}`);
  
  Object.entries(systemHealth.components).forEach(([component, status]) => {
    console.log(`  - ${component}: ${status ? '✅' : '❌'}`);
  });

  // Get control validation results
  const validation = await securityGovernance.validateControls();
  console.log('\n✅ Security Controls Status:');
  console.log(`  - Total: ${validation.compliant.length + validation.nonCompliant.length + validation.exempted.length}`);
  console.log(`  - Compliant: ${validation.compliant.length}`);
  console.log(`  - Non-compliant: ${validation.nonCompliant.length}`);
  console.log(`  - Exempted: ${validation.exempted.length}`);

  // Get active risk acceptances
  const activeRiskAcceptances = securityGovernance.getActiveRiskAcceptances();
  console.log(`\n✅ Risk Acceptances: ${activeRiskAcceptances.length} active`);

  // Get AI violations
  const aiViolations = securityGovernance.getAIViolations();
  console.log(`✅ AI Violations: ${aiViolations.length} total`);

  // Get recent violations
  const recentViolations = securityGovernance.getAudits({
    type: 'VIOLATION',
    limit: 5
  });
  console.log(`✅ Recent Violations: ${recentViolations.length}`);

  // Calculate overall security score
  const totalControls = validation.compliant.length + validation.nonCompliant.length;
  const complianceRate = totalControls > 0 ? (validation.compliant.length / totalControls) * 100 : 0;
  const riskAcceptanceRate = activeRiskAcceptances.length > 0 ? (activeRiskAcceptances.length / totalControls) * 100 : 0;
  
  console.log('\n✅ Security Metrics:');
  console.log(`  - Compliance Rate: ${complianceRate.toFixed(1)}%`);
  console.log(`  - Risk Acceptance Rate: ${riskAcceptanceRate.toFixed(1)}%`);
  console.log(`  - Violation Rate: ${recentViolations.length > 0 ? 'High' : 'Low'}`);

  // Generate priority actions
  const priorityActions: string[] = [];
  
  if (validation.nonCompliant.length > 0) {
    priorityActions.push(`Address ${validation.nonCompliant.length} non-compliant controls`);
  }
  
  if (recentViolations.length > 5) {
    priorityActions.push('High number of recent violations - investigate immediately');
  }
  
  if (aiViolations.length > 10) {
    priorityActions.push('AI trust boundary violations require attention');
  }

  if (priorityActions.length === 0) {
    priorityActions.push('Security posture is healthy - maintain current controls');
  }

  console.log('\n✅ Priority Actions:');
  priorityActions.forEach((action, index) => {
    console.log(`  ${index + 1}. ${action}`);
  });
}

// Example 11: Automated security workflow
export async function automatedSecurityWorkflow() {
  console.log('\n=== Automated Security Workflow ===\n');

  console.log('✅ Starting automated security workflow...');

  // Step 1: Check system health
  const systemHealth = await securityGovernance.getHealthStatus();
  if (!systemHealth.overall) {
    console.log('❌ System health check failed - aborting workflow');
    return;
  }
  console.log('✅ System health check passed');

  // Step 2: Run security gates
  const gateResult = await securityGovernance.runSecurityGates('build');
  if (!gateResult.success) {
    console.log('⚠️  Security gates failed - requires attention');
    gateResult.violations.forEach(violation => {
      console.log(`    - ${violation.message}`);
    });
  } else {
    console.log('✅ Security gates passed');
  }

  // Step 3: Validate controls
  const validation = await securityGovernance.validateControls();
  console.log(`✅ Control validation completed: ${validation.compliant.length}/${validation.compliant.length + validation.nonCompliant.length} compliant`);

  // Step 4: Check risk acceptances
  const expiringAcceptances = securityGovernance.getActiveRiskAcceptances().filter(a => 
    a.expirationDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
  );
  
  if (expiringAcceptances.length > 0) {
    console.log(`⚠️  ${expiringAcceptances.length} risk acceptances expiring soon`);
    expiringAcceptances.forEach(acceptance => {
      console.log(`    - ${acceptance.controlId}: expires ${acceptance.expirationDate.toISOString().split('T')[0]}`);
    });
  }

  // Step 5: Generate compliance report
  const report = await securityGovernance.generateComplianceReport();
  console.log(`✅ Compliance report generated: ${report.overallScore.toFixed(1)}% overall score`);

  // Step 6: Check AI violations
  const aiViolations = securityGovernance.getAIViolations();
  if (aiViolations.length > 0) {
    console.log(`⚠️  Found ${aiViolations.length} AI trust boundary violations`);
  }

  console.log('\n✅ Automated security workflow completed successfully');
}

// Run all examples
export async function runAllExamples() {
  console.log('Security Governance & Enforcement Layer - Example Usage\n');
  console.log('====================================================\n');

  try {
    await basicSecurityGovernanceInitialization();
    await securityControlManagement();
    await securityGatesExecution();
    await riskAcceptanceManagement();
    await aiTrustBoundaryEnforcement();
    await runtimeSecurityEnforcement();
    await securityAuditMonitoring();
    await complianceReporting();
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

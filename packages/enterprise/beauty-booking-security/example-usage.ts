/**
 * Example usage of the Beauty Booking Security Pack
 * 
 * This example demonstrates how to use the comprehensive security kit
 * for beauty booking platforms with domain separation and compliance.
 */

import { 
  BeautyBookingSecurity, 
  beautyBookingSecurity
} from './index.js';

// Example 1: Basic security system initialization
export async function basicSecurityInitialization() {
  console.log('=== Basic Beauty Booking Security Initialization ===\n');

  await beautyBookingSecurity.initialize();
  console.log('✅ Beauty Booking Security system initialized successfully');

  const healthStatus = await beautyBookingSecurity.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Security score: ${healthStatus.securityScore}/100`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Domain separation and context
export async function domainSeparationAndContext() {
  console.log('\n=== Domain Separation and Context ===\n');

  const domains = ['app.beautybooking.com', 'studio.beautybooking.com', 'ops.beautybooking.com'];
  
  for (const hostname of domains) {
    const context = await beautyBookingSecurity.getDomainContext(hostname);
    console.log(`✅ Domain Context - ${hostname}:`);
    console.log(`  - Domain: ${context.domain}`);
    console.log(`  - Isolation Level: ${context.context.isolationLevel}`);
    console.log(`  - Security Headers: ${Object.keys(context.securityHeaders).length} configured`);
    console.log(`  - CSP Policy: ${context.securityHeaders['Content-Security-Policy']?.substring(0, 50)}...`);
  }
}

// Example 3: RBAC/ABAC permission checking
export async function rbacAbacPermissionChecking() {
  console.log('\n=== RBAC/ABAC Permission Checking ===\n');

  // Test different user permissions
  const testCases = [
    {
      userId: 'customer_1',
      resource: 'bookings',
      action: 'read',
      context: { location: 'salon', time: '10:00' }
    },
    {
      userId: 'stylist_1',
      resource: 'schedule',
      action: 'write',
      context: { location: 'salon', time: '14:00' }
    },
    {
      userId: 'manager_1',
      resource: 'reports',
      action: 'read',
      context: { location: 'office', time: '09:00' }
    },
    {
      userId: 'customer_1',
      resource: 'admin_panel',
      action: 'access',
      context: { location: 'salon', time: '10:00' }
    }
  ];

  for (const testCase of testCases) {
    const result = await beautyBookingSecurity.checkPermissions(
      testCase.userId,
      testCase.resource,
      testCase.action,
      testCase.context
    );
    console.log(`✅ Permission Check - ${testCase.userId} on ${testCase.resource}.${testCase.action}:`);
    console.log(`  - Allowed: ${result.allowed}`);
    console.log(`  - Reason: ${result.reason || 'No restrictions'}`);
    console.log(`  - Permissions: ${result.permissions.join(', ')}`);
  }
}

// Example 4: Rate limiting enforcement
export async function rateLimitingEnforcement() {
  console.log('\n=== Rate Limiting Enforcement ===\n');

  const testCases = [
    { identifier: '192.168.1.100', domain: 'public' as const },
    { identifier: '192.168.1.101', domain: 'studio' as const },
    { identifier: '192.168.1.102', domain: 'ops' as const }
  ];

  for (const testCase of testCases) {
    // Make multiple requests to test rate limiting
    for (let i = 0; i < 3; i++) {
      const result = await beautyBookingSecurity.enforceRateLimit(testCase.identifier, testCase.domain);
      console.log(`✅ Rate Limit Test ${i + 1} - ${testCase.domain} domain (${testCase.identifier}):`);
      console.log(`  - Allowed: ${result.allowed}`);
      console.log(`  - Remaining: ${result.remaining}`);
      console.log(`  - Limit: ${result.limit}`);
      console.log(`  - Reset Time: ${result.resetTime.toISOString()}`);
    }
  }
}

// Example 5: Security headers and CSP
export async function securityHeadersAndCSP() {
  console.log('\n=== Security Headers and CSP ===\n');

  const domains = ['public', 'studio', 'ops'] as const;
  
  for (const domain of domains) {
    const headers = beautyBookingSecurity.getSecurityHeaders(domain);
    console.log(`✅ Security Headers - ${domain} domain:`);
    console.log(`  - Total Headers: ${Object.keys(headers).length}`);
    console.log(`  - X-Frame-Options: ${headers['X-Frame-Options']}`);
    console.log(`  - X-Content-Type-Options: ${headers['X-Content-Type-Options']}`);
    console.log(`  - CSP: ${headers['Content-Security-Policy']?.substring(0, 80)}...`);
  }
}

// Example 6: Security event logging
export async function securityEventLogging() {
  console.log('\n=== Security Event Logging ===\n');

  // Log various security events
  await beautyBookingSecurity.logEvent({
    type: 'authentication',
    severity: 'medium',
    userId: 'customer_1',
    domain: 'public',
    action: 'user.login.success',
    resource: 'authentication',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Web Browser)',
    details: { method: 'password', mfa: false }
  });

  await beautyBookingSecurity.logEvent({
    type: 'data_access',
    severity: 'low',
    userId: 'stylist_1',
    domain: 'studio',
    action: 'data.select',
    resource: 'bookings',
    piiData: true,
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Web Browser)',
    details: { rows: 25, duration: 150 }
  });

  await beautyBookingSecurity.logEvent({
    type: 'security_violation',
    severity: 'high',
    userId: 'unknown',
    domain: 'public',
    action: 'access.denied',
    resource: 'admin_panel',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Web Browser)',
    details: { attempted_action: 'admin_access', blocked: true }
  });

  console.log('✅ Logged 3 security events');
}

// Example 7: Security incident management
export async function securityIncidentManagement() {
  console.log('\n=== Security Incident Management ===\n');

  // Create security incident
  const incident = await beautyBookingSecurity.createIncident({
    type: 'security_incident',
    severity: 'high',
    title: 'Unauthorized Access Attempt',
    description: 'Multiple unauthorized access attempts detected from external IP',
    affectedDomains: ['public'],
    affectedUsers: 0
  });
  console.log('✅ Created security incident:');
  console.log(`  - ID: ${incident.id}`);
  console.log(`  - Type: ${incident.type}`);
  console.log(`  - Severity: ${incident.severity}`);
  console.log(`  - Status: ${incident.status}`);

  // Get active incidents
  const activeIncidents = await beautyBookingSecurity.getActiveIncidents();
  console.log(`\n✅ Active incidents: ${activeIncidents.length}`);
  activeIncidents.forEach(inc => {
    console.log(`  - ${inc.type}: ${inc.title}`);
  });
}

// Example 8: Compliance reporting
export async function complianceReporting() {
  console.log('\n=== Compliance Reporting ===\n');

  // Generate SOC2 compliance report
  const soc2Report = await beautyBookingSecurity.generateComplianceReport('SOC2', {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  });
  console.log('✅ SOC2 Compliance Report:');
  console.log(`  - Report ID: ${soc2Report.id}`);
  console.log(`  - Period: ${soc2Report.period.start.toISOString()} to ${soc2Report.period.end.toISOString()}`);
  console.log(`  - Status: ${soc2Report.status}`);
  console.log(`  - Overall Score: ${soc2Report.overallScore}%`);
  console.log(`  - Controls: ${soc2Report.controls.length}`);
  console.log(`  - Recommendations: ${soc2Report.recommendations.length}`);

  // Generate GDPR compliance report
  const gdprReport = await beautyBookingSecurity.generateComplianceReport('GDPR', {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  console.log('\n✅ GDPR Compliance Report:');
  console.log(`  - Status: ${gdprReport.status}`);
  console.log(`  - Overall Score: ${gdprReport.overallScore}%`);
}

// Example 9: Security assessment
export async function securityAssessment() {
  console.log('\n=== Security Assessment ===\n');

  const assessmentTypes = ['vulnerability', 'penetration', 'compliance', 'risk'] as const;
  
  for (const type of assessmentTypes) {
    const assessment = await beautyBookingSecurity.runSecurityAssessment(type);
    console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Assessment:`);
    console.log(`  - Assessment ID: ${assessment.id}`);
    console.log(`  - Findings: ${assessment.findings.length}`);
    console.log(`  - Overall Risk: ${assessment.overallRisk}`);
    
    assessment.findings.forEach((finding, index) => {
      console.log(`    ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.description}`);
    });
  }
}

// Example 10: Threat modeling
export async function threatModeling() {
  console.log('\n=== Threat Modeling ===\n');

  const threatModel = await beautyBookingSecurity.getThreatModel();
  console.log('✅ Threat Model Summary:');
  console.log(`  - Assets: ${threatModel.assets.length}`);
  console.log(`  - Threats: ${threatModel.threats.length}`);
  console.log(`  - Data Flows: ${threatModel.dataFlows.length}`);

  console.log('\n✅ Critical Assets:');
  threatModel.assets
    .filter(asset => asset.sensitivity === 'critical')
    .forEach(asset => {
      console.log(`  - ${asset.name} (${asset.type})`);
    });

  console.log('\n✅ High-Impact Threats:');
  threatModel.threats
    .filter(threat => threat.impact === 'high' || threat.impact === 'critical')
    .forEach(threat => {
      console.log(`  - ${threat.type}: ${threat.description}`);
    });
}

// Example 11: Security metrics and monitoring
export async function securityMetricsAndMonitoring() {
  console.log('\n=== Security Metrics and Monitoring ===\n');

  // Get comprehensive security metrics
  const metrics = await beautyBookingSecurity.getSecurityMetrics();
  console.log('✅ Security Metrics:');
  
  console.log('\n  Authentication:');
  console.log(`    - Total Logins: ${metrics.authentication.totalLogins}`);
  console.log(`    - Successful: ${metrics.authentication.successfulLogins}`);
  console.log(`    - Failed: ${metrics.authentication.failedLogins}`);
  console.log(`    - MFA Usage: ${metrics.authentication.mfaUsage}`);

  console.log('\n  Authorization:');
  console.log(`    - Total Checks: ${metrics.authorization.totalChecks}`);
  console.log(`    - Allowed: ${metrics.authorization.allowedAccess}`);
  console.log(`    - Denied: ${metrics.authorization.deniedAccess}`);

  console.log('\n  Data Access:');
  console.log(`    - Total Queries: ${metrics.dataAccess.totalQueries}`);
  console.log(`    - PII Access: ${metrics.dataAccess.piiAccess}`);
  console.log(`    - Cross-Domain: ${metrics.dataAccess.crossDomainAccess}`);

  console.log('\n  Incidents:');
  console.log(`    - Total: ${metrics.incidents.totalIncidents}`);
  console.log(`    - Open: ${metrics.incidents.openIncidents}`);
  console.log(`    - Resolved: ${metrics.incidents.resolvedIncidents}`);
  console.log(`    - Mean Time to Resolve: ${metrics.incidents.meanTimeToResolve.toFixed(2)} hours`);
}

// Example 12: Domain separation validation
export async function domainSeparationValidation() {
  console.log('\n=== Domain Separation Validation ===\n');

  const validation = await beautyBookingSecurity.validateDomainSeparation();
  console.log('✅ Domain Separation Validation:');
  console.log(`  - Valid: ${validation.valid}`);
  console.log(`  - Violations: ${validation.violations.length}`);

  if (validation.violations.length > 0) {
    console.log('\n  Violations:');
    validation.violations.forEach((violation, index) => {
      console.log(`    ${index + 1}. [${violation.severity.toUpperCase()}] ${violation.domain}: ${violation.issue}`);
    });
  }
}

// Example 13: Complete security workflow
export async function completeSecurityWorkflow() {
  console.log('\n=== Complete Security Workflow ===\n');

  console.log('✅ Starting complete security workflow...');

  // Step 1: Initialize security system
  await beautyBookingSecurity.initialize();
  console.log('✅ Security system initialized');

  // Step 2: Validate domain separation
  const domainValidation = await beautyBookingSecurity.validateDomainSeparation();
  console.log(`✅ Domain separation validated: ${domainValidation.valid}`);

  // Step 3: Test RBAC permissions
  const rbacTest = await beautyBookingSecurity.checkPermissions('stylist_1', 'bookings', 'write', { location: 'salon' });
  console.log(`✅ RBAC test: ${rbacTest.allowed ? 'Allowed' : 'Denied'}`);

  // Step 4: Test rate limiting
  const rateLimitTest = await beautyBookingSecurity.enforceRateLimit('192.168.1.100', 'public');
  console.log(`✅ Rate limiting test: ${rateLimitTest.allowed ? 'Allowed' : 'Rate Limited'}`);

  // Step 5: Log security events
  await beautyBookingSecurity.logEvent({
    type: 'authentication',
    severity: 'low',
    userId: 'customer_1',
    domain: 'public',
    action: 'workflow.test.completed',
    ipAddress: '192.168.1.100',
    userAgent: 'Security Test Suite'
  });
  console.log('✅ Security events logged');

  // Step 6: Generate compliance report
  const complianceReport = await beautyBookingSecurity.generateComplianceReport('SOC2', {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  console.log(`✅ Compliance report generated: ${complianceReport.status}`);

  // Step 7: Get final metrics
  const finalMetrics = await beautyBookingSecurity.getSecurityMetrics();
  console.log('\n✅ Final Security Metrics Summary:');
  console.log(`  - Authentication Success Rate: ${((finalMetrics.authentication.successfulLogins / finalMetrics.authentication.totalLogins) * 100).toFixed(1)}%`);
  console.log(`  - Authorization Success Rate: ${((finalMetrics.authorization.allowedAccess / finalMetrics.authorization.totalChecks) * 100).toFixed(1)}%`);
  console.log(`  - PII Access Rate: ${((finalMetrics.dataAccess.piiAccess / finalMetrics.dataAccess.totalQueries) * 100).toFixed(1)}%`);
  console.log(`  - Incident Resolution Rate: ${((finalMetrics.incidents.resolvedIncidents / finalMetrics.incidents.totalIncidents) * 100).toFixed(1)}%`);

  console.log('\n✅ Complete security workflow completed successfully');
}

// Example 14: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const currentConfig = beautyBookingSecurity.getConfig();
  console.log('✅ Current Configuration Summary:');
  console.log(`  - Domain Separation: ${currentConfig.separation.enableDomainSeparation ? 'Enabled' : 'Disabled'}`);
  console.log(`  - RBAC: ${currentConfig.rbac.enableRBAC ? 'Enabled' : 'Disabled'}`);
  console.log(`  - ABAC: ${currentConfig.rbac.enableABAC ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Rate Limiting: ${currentConfig.rateLimiting.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Audit Logging: ${currentConfig.audit.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Incident Response: ${currentConfig.incident.enableIncidentResponse ? 'Enabled' : 'Disabled'}`);
  console.log(`  - SOC2 Compliance: ${currentConfig.compliance.enableSOC2 ? 'Enabled' : 'Disabled'}`);
  console.log(`  - GDPR Compliance: ${currentConfig.compliance.enableGDPR ? 'Enabled' : 'Disabled'}`);

  // Update configuration
  beautyBookingSecurity.updateConfig({
    audit: {
      ...currentConfig.audit,
      logLevel: 'debug'
    },
    rateLimiting: {
      ...currentConfig.rateLimiting,
      rules: {
        ...currentConfig.rateLimiting.rules,
        customer: { requests: 150, window: 60000 }
      }
    }
  });
  console.log('\n✅ Configuration updated');

  const updatedConfig = beautyBookingSecurity.getConfig();
  console.log(`✅ New audit log level: ${updatedConfig.audit.logLevel}`);
  console.log(`✅ New customer rate limit: ${updatedConfig.rateLimiting.rules.customer.requests} requests/minute`);
}

// Run all examples
export async function runAllExamples() {
  console.log('Beauty Booking Security Pack - Example Usage\n');
  console.log('===============================================\n');

  try {
    await basicSecurityInitialization();
    await domainSeparationAndContext();
    await rbacAbacPermissionChecking();
    await rateLimitingEnforcement();
    await securityHeadersAndCSP();
    await securityEventLogging();
    await securityIncidentManagement();
    await complianceReporting();
    await securityAssessment();
    await threatModeling();
    await securityMetricsAndMonitoring();
    await domainSeparationValidation();
    await completeSecurityWorkflow();
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

/**
 * Example usage of the Supabase Security & Architecture Pack
 * 
 * This example demonstrates how to use the hardened Supabase security setup
 * for luxury booking platforms with comprehensive security controls.
 */

import { 
  SupabaseSecurity, 
  supabaseSecurity
} from './index.js';

// Example 1: Basic Supabase security initialization
export async function basicSupabaseSecurityInitialization() {
  console.log('=== Basic Supabase Security Initialization ===\n');

  await supabaseSecurity.initialize();
  console.log('✅ Supabase Security system initialized successfully');

  const healthStatus = await supabaseSecurity.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Security score: ${healthStatus.securityScore}/100`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Authentication with MFA
export async function authenticationWithMFA() {
  console.log('\n=== Authentication with MFA ===\n');

  // Authenticate without MFA (should require MFA)
  const authResult1 = await supabaseSecurity.authenticate({
    email: 'admin@luxurybooking.com',
    password: 'SecurePassword123!',
    tenantId: 'tenant_1'
  });
  console.log('✅ Authentication without MFA:');
  console.log(`  - Success: ${authResult1.success}`);
  console.log(`  - Requires MFA: ${authResult1.requiresMFA}`);
  console.log(`  - Error: ${authResult1.error}`);

  // Authenticate with MFA
  const authResult2 = await supabaseSecurity.authenticate({
    email: 'admin@luxurybooking.com',
    password: 'SecurePassword123!',
    mfaCode: '123456',
    tenantId: 'tenant_1'
  });
  console.log('\n✅ Authentication with MFA:');
  console.log(`  - Success: ${authResult2.success}`);
  console.log(`  - User: ${authResult2.user?.email}`);
  console.log(`  - Role: ${authResult2.user?.role}`);
  console.log(`  - Session ID: ${authResult2.session?.id?.substring(0, 20)}...`);
}

// Example 3: Session validation and permissions
export async function sessionValidationAndPermissions() {
  console.log('\n=== Session Validation and Permissions ===\n');

  // Get session from previous authentication
  const authResult = await supabaseSecurity.authenticate({
    email: 'admin@luxurybooking.com',
    password: 'SecurePassword123!',
    mfaCode: '123456',
    tenantId: 'tenant_1'
  });

  if (authResult.session) {
    // Validate session without required permissions
    const validation1 = await supabaseSecurity.validateSession(authResult.session.id);
    console.log('✅ Session validation (no permissions):');
    console.log(`  - Valid: ${validation1.valid}`);
    console.log(`  - User: ${validation1.user?.email}`);
    console.log(`  - Permissions: ${validation1.permissions.join(', ')}`);

    // Validate session with required permissions
    const validation2 = await supabaseSecurity.validateSession(authResult.session.id, ['users:read', 'bookings:write']);
    console.log('\n✅ Session validation (with permissions):');
    console.log(`  - Valid: ${validation2.valid}`);
    console.log(`  - Has required permissions: ${validation2.valid}`);

    // Validate session with insufficient permissions
    const validation3 = await supabaseSecurity.validateSession(authResult.session.id, ['system:admin']);
    console.log('\n✅ Session validation (insufficient permissions):');
    console.log(`  - Valid: ${validation3.valid}`);
    console.log(`  - Error: ${validation3.error}`);
  }
}

// Example 4: Row Level Security enforcement
export async function rowLevelSecurityEnforcement() {
  console.log('\n=== Row Level Security Enforcement ===\n');

  // Test RLS for different user roles
  const testCases = [
    {
      userId: 'user_1', // admin
      table: 'users',
      operation: 'SELECT' as const,
      tenantId: 'tenant_1'
    },
    {
      userId: 'user_2', // operator
      table: 'users',
      operation: 'SELECT' as const,
      tenantId: 'tenant_1'
    },
    {
      userId: 'user_3', // regular user
      table: 'users',
      operation: 'SELECT' as const,
      tenantId: 'tenant_1'
    },
    {
      userId: 'user_3', // regular user
      table: 'users',
      operation: 'DELETE' as const,
      tenantId: 'tenant_1'
    }
  ];

  for (const testCase of testCases) {
    const result = await supabaseSecurity.enforceRLS(testCase);
    console.log(`✅ RLS Test - ${testCase.userId} on ${testCase.table}.${testCase.operation}:`);
    console.log(`  - Allowed: ${result.allowed}`);
    console.log(`  - Reason: ${result.reason || 'No restrictions'}`);
  }
}

// Example 5: Secure file upload and storage
export async function secureFileUploadAndStorage() {
  console.log('\n=== Secure File Upload and Storage ===\n');

  // Test file upload scenarios
  const testFiles = [
    {
      name: 'profile.jpg',
      type: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      content: Buffer.from('fake-image-data'),
      userId: 'user_1',
      tenantId: 'tenant_1'
    },
    {
      name: 'malware.exe',
      type: 'application/x-executable',
      size: 1024,
      content: Buffer.from('EICAR-STANDARD-ANTIVIRUS-TEST-FILE'),
      userId: 'user_1',
      tenantId: 'tenant_1'
    },
    {
      name: 'large-file.zip',
      type: 'application/zip',
      size: 200 * 1024 * 1024, // 200MB (exceeds limit)
      content: Buffer.from('fake-large-file-data'),
      userId: 'user_1',
      tenantId: 'tenant_1'
    }
  ];

  for (const file of testFiles) {
    const result = await supabaseSecurity.secureUpload(file);
    console.log(`✅ Upload Test - ${file.name}:`);
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Error: ${result.error}`);
    console.log(`  - Virus Detected: ${result.virusDetected}`);
    if (result.url) {
      console.log(`  - URL: ${result.url.substring(0, 50)}...`);
    }
  }

  // Generate secure download URL
  const downloadResult = await supabaseSecurity.generateSecureURL('tenant_1/uploads/profile.jpg', {
    userId: 'user_1',
    tenantId: 'tenant_1',
    expiresIn: 3600
  });
  console.log('\n✅ Secure Download URL:');
  console.log(`  - URL: ${downloadResult.url.substring(0, 50)}...`);
  console.log(`  - Expires: ${downloadResult.expiresAt.toISOString()}`);
}

// Example 6: Security event logging and monitoring
export async function securityEventLoggingAndMonitoring() {
  console.log('\n=== Security Event Logging and Monitoring ===\n');

  // Log various security events
  await supabaseSecurity.logSecurityEvent({
    type: 'auth',
    severity: 'medium',
    userId: 'user_1',
    tenantId: 'tenant_1',
    action: 'user.login.success',
    resource: 'authentication',
    details: { method: 'password', mfa: true },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Web Browser)'
  });

  await supabaseSecurity.logSecurityEvent({
    type: 'data_access',
    severity: 'low',
    userId: 'user_2',
    tenantId: 'tenant_1',
    action: 'data.select',
    resource: 'bookings',
    details: { rows: 50, duration: 120 },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Web Browser)'
  });

  await supabaseSecurity.logSecurityEvent({
    type: 'security_violation',
    severity: 'high',
    userId: 'user_3',
    tenantId: 'tenant_2',
    action: 'access.denied',
    resource: 'admin_panel',
    details: { attempted_action: 'delete_users' },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Web Browser)'
  });

  console.log('✅ Logged 3 security events');

  // Query security events
  const events = await supabaseSecurity.queryEvents({
    severity: 'high',
    limit: 10
  });
  console.log(`\n✅ Retrieved ${events.length} high-severity events`);
  events.forEach(event => {
    console.log(`  - ${event.action}: ${event.timestamp.toISOString()}`);
  });
}

// Example 7: Security incident management
export async function securityIncidentManagement() {
  console.log('\n=== Security Incident Management ===\n');

  // Create security incident
  const incident = await supabaseSecurity.createSecurityIncident({
    type: 'unauthorized_access',
    severity: 'high',
    description: 'Multiple failed login attempts detected from suspicious IP',
    affectedUsers: 3,
    affectedData: ['user_credentials', 'authentication_logs']
  });
  console.log('✅ Created security incident:');
  console.log(`  - ID: ${incident.id}`);
  console.log(`  - Type: ${incident.type}`);
  console.log(`  - Severity: ${incident.severity}`);
  console.log(`  - Status: ${incident.status}`);

  // Get active incidents
  const activeIncidents = await supabaseSecurity.getActiveIncidents();
  console.log(`\n✅ Active incidents: ${activeIncidents.length}`);
  activeIncidents.forEach(inc => {
    console.log(`  - ${inc.type}: ${inc.description}`);
  });

  // Update incident status
  const updatedIncident = await supabaseSecurity.updateIncident(incident.id, {
    status: 'investigating',
    actions: [{
      action: 'blocked_suspicious_ip',
      performedBy: 'security_team',
      performedAt: new Date(),
      description: 'Blocked IP address 192.168.1.102'
    }]
  });
  console.log(`\n✅ Updated incident status: ${updatedIncident.status}`);
}

// Example 8: User security profiles
export async function userSecurityProfiles() {
  console.log('\n=== User Security Profiles ===\n');

  // Get security profiles for different users
  const userIds = ['user_1', 'user_2', 'user_3'];

  for (const userId of userIds) {
    try {
      const profile = await supabaseSecurity.getUserSecurityProfile(userId);
      console.log(`✅ Security Profile - ${profile.email}:`);
      console.log(`  - Role: ${profile.role}`);
      console.log(`  - MFA Enabled: ${profile.mfaEnabled}`);
      console.log(`  - Last Login: ${profile.lastLogin.toISOString()}`);
      console.log(`  - Failed Attempts: ${profile.failedAttempts}`);
      console.log(`  - Active Sessions: ${profile.activeSessions}`);
      console.log(`  - Security Flags: ${profile.securityFlags.join(', ')}`);
    } catch (error) {
      console.log(`❌ Error getting profile for ${userId}: ${error}`);
    }
  }
}

// Example 9: Security metrics and reporting
export async function securityMetricsAndReporting() {
  console.log('\n=== Security Metrics and Reporting ===\n');

  // Get comprehensive security metrics
  const metrics = await supabaseSecurity.getSecurityMetrics();
  console.log('✅ Security Metrics:');
  
  console.log('\n  Authentication:');
  console.log(`    - Total Logins: ${metrics.authentication.totalLogins}`);
  console.log(`    - Successful: ${metrics.authentication.successfulLogins}`);
  console.log(`    - Failed: ${metrics.authentication.failedLogins}`);
  console.log(`    - MFA Usage: ${metrics.authentication.mfaUsage}`);

  console.log('\n  Data Access:');
  console.log(`    - Total Queries: ${metrics.dataAccess.totalQueries}`);
  console.log(`    - Blocked: ${metrics.dataAccess.blockedQueries}`);
  console.log(`    - Sensitive Data Access: ${metrics.dataAccess.sensitiveDataAccess}`);

  console.log('\n  Storage:');
  console.log(`    - Total Files: ${metrics.storage.totalFiles}`);
  console.log(`    - Total Size: ${(metrics.storage.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`    - Blocked Uploads: ${metrics.storage.blockedUploads}`);
  console.log(`    - Virus Detections: ${metrics.storage.virusDetections}`);

  console.log('\n  Audit:');
  console.log(`    - Total Events: ${metrics.audit.totalEvents}`);
  console.log(`    - Security Events: ${metrics.audit.securityEvents}`);
  console.log(`    - Resolved Events: ${metrics.audit.resolvedEvents}`);

  // Generate security report
  const report = await supabaseSecurity.generateSecurityReport('security', {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date()
  });
  console.log(`\n✅ Security Report Generated:`);
  console.log(`  - Report ID: ${report.id}`);
  console.log(`  - Period: ${report.period.start.toISOString()} to ${report.period.end.toISOString()}`);
  console.log(`  - Findings: ${report.findings.length}`);
  report.findings.forEach((finding, index) => {
    console.log(`    ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.description}`);
  });
}

// Example 10: Production configuration
export async function productionConfiguration() {
  console.log('\n=== Production Configuration ===\n');

  const config = supabaseSecurity.getConfig();
  console.log('✅ Production Configuration:');
  
  console.log('\n  Authentication:');
  console.log(`    - MFA Enabled: ${config.authentication.enableMFA}`);
  console.log(`    - SSO Enabled: ${config.authentication.enableSSO}`);
  console.log(`    - Password Policy: Min ${config.authentication.passwordPolicy.minLength} chars`);
  console.log(`    - Session Timeout: ${config.authentication.sessionTimeout}s`);

  console.log('\n  Row Level Security:');
  console.log(`    - Enabled: ${config.rowLevelSecurity.enabled}`);
  console.log(`    - Tenant Isolation: ${config.rowLevelSecurity.enableTenantIsolation}`);
  console.log(`    - Role-based Access: ${config.rowLevelSecurity.enableRoleBasedAccess}`);

  console.log('\n  Storage Security:');
  console.log(`    - Virus Scanning: ${config.storage.enableVirusScanning}`);
  console.log(`    - Content Validation: ${config.storage.enableContentValidation}`);
  console.log(`    - Max File Size: ${(config.storage.maxFileSize / 1024 / 1024).toFixed(2)} MB`);

  console.log('\n  Production:');
  console.log(`    - SSL Enabled: ${config.production.enableSSL}`);
  console.log(`    - Backup Enabled: ${config.production.enableBackup}`);
  console.log(`    - Monitoring Enabled: ${config.production.enableMonitoring}`);
  console.log(`    - Rate Limiting: ${config.production.enableRateLimiting}`);
  console.log(`    - CORS Enabled: ${config.production.enableCORS}`);
}

// Example 11: Complete security workflow
export async function completeSecurityWorkflow() {
  console.log('\n=== Complete Security Workflow ===\n');

  console.log('✅ Starting complete security workflow...');

  // Step 1: Initialize security system
  await supabaseSecurity.initialize();
  console.log('✅ Security system initialized');

  // Step 2: Authenticate admin user
  const authResult = await supabaseSecurity.authenticate({
    email: 'admin@luxurybooking.com',
    password: 'SecurePassword123!',
    mfaCode: '123456',
    tenantId: 'tenant_1'
  });
  console.log(`✅ Admin authenticated: ${authResult.user?.email}`);

  // Step 3: Validate session and permissions
  const sessionValidation = await supabaseSecurity.validateSession(authResult.session!.id, ['*']);
  console.log(`✅ Session validated with admin privileges`);

  // Step 4: Test RLS enforcement
  const rlsTest = await supabaseSecurity.enforceRLS({
    table: 'users',
    operation: 'SELECT',
    userId: 'user_1',
    tenantId: 'tenant_1'
  });
  console.log(`✅ RLS enforcement: ${rlsTest.allowed ? 'Allowed' : 'Blocked'}`);

  // Step 5: Test secure file upload
  const uploadResult = await supabaseSecurity.secureUpload({
    name: 'property-image.jpg',
    type: 'image/jpeg',
    size: 1024 * 1024,
    content: Buffer.from('property-image-data'),
    userId: 'user_1',
    tenantId: 'tenant_1'
  });
  console.log(`✅ File upload: ${uploadResult.success ? 'Success' : 'Failed'}`);

  // Step 6: Log security events
  await supabaseSecurity.logSecurityEvent({
    type: 'auth',
    severity: 'low',
    userId: 'user_1',
    tenantId: 'tenant_1',
    action: 'workflow.completed',
    details: { workflow: 'complete_security_test' },
    ipAddress: '192.168.1.100',
    userAgent: 'Security Test Suite'
  });
  console.log('✅ Security events logged');

  // Step 7: Generate final metrics
  const finalMetrics = await supabaseSecurity.getSecurityMetrics();
  console.log('\n✅ Final Security Metrics Summary:');
  console.log(`  - Authentication Success Rate: ${((finalMetrics.authentication.successfulLogins / finalMetrics.authentication.totalLogins) * 100).toFixed(1)}%`);
  console.log(`  - Data Access Block Rate: ${((finalMetrics.dataAccess.blockedQueries / finalMetrics.dataAccess.totalQueries) * 100).toFixed(1)}%`);
  console.log(`  - Storage Security: ${finalMetrics.storage.virusDetections} threats blocked`);
  console.log(`  - Audit Coverage: ${finalMetrics.audit.totalEvents} events logged`);

  console.log('\n✅ Complete security workflow completed successfully');
}

// Example 12: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const currentConfig = supabaseSecurity.getConfig();
  console.log('✅ Current Configuration Summary:');
  console.log(`  - Authentication: ${currentConfig.authentication.enableMFA ? 'MFA Enabled' : 'MFA Disabled'}`);
  console.log(`  - RLS: ${currentConfig.rowLevelSecurity.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Storage Security: ${currentConfig.storage.enableVirusScanning ? 'Hardened' : 'Basic'}`);
  console.log(`  - Audit Logging: ${currentConfig.audit.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Ops Separation: ${currentConfig.ops.enableOpsSeparation ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Production Features: ${currentConfig.production.enableSSL ? 'Hardened' : 'Basic'}`);

  // Update configuration
  supabaseSecurity.updateConfig({
    authentication: {
      ...currentConfig.authentication,
      sessionTimeout: 7200, // 2 hours
      maxLoginAttempts: 3
    },
    storage: {
      ...currentConfig.storage,
      maxFileSize: 50 * 1024 * 1024 // 50MB
    },
    audit: {
      ...currentConfig.audit,
      logLevel: 'debug'
    }
  });
  console.log('\n✅ Configuration updated');

  const updatedConfig = supabaseSecurity.getConfig();
  console.log(`✅ New session timeout: ${updatedConfig.authentication.sessionTimeout}s`);
  console.log(`✅ New max file size: ${(updatedConfig.storage.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✅ New audit log level: ${updatedConfig.audit.logLevel}`);
}

// Run all examples
export async function runAllExamples() {
  console.log('Supabase Security & Architecture Pack - Example Usage\n');
  console.log('==================================================\n');

  try {
    await basicSupabaseSecurityInitialization();
    await authenticationWithMFA();
    await sessionValidationAndPermissions();
    await rowLevelSecurityEnforcement();
    await secureFileUploadAndStorage();
    await securityEventLoggingAndMonitoring();
    await securityIncidentManagement();
    await userSecurityProfiles();
    await securityMetricsAndReporting();
    await productionConfiguration();
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

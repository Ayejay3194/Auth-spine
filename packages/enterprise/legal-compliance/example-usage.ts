/**
 * Example usage of the Legal & Compliance Disaster Kit
 * 
 * This example demonstrates how to use the kit to:
 * - Initialize the compliance system
 * - Create and manage compliance checklists
 * - Handle policy management
 * - Manage incidents and responses
 * - Track product requirements
 * - Maintain compliance registries
 */

import { 
  LegalCompliance, 
  legalCompliance,
  ComplianceFramework,
  ComplianceStatus
} from './index.js';

// Example 1: Basic compliance system initialization
export async function basicComplianceInitialization() {
  console.log('=== Basic Compliance System Initialization ===\n');

  await legalCompliance.initialize();
  console.log('✅ Legal Compliance system initialized successfully');

  const healthStatus = await legalCompliance.getHealthStatus();
  console.log(`✅ System health: ${healthStatus.overall ? 'Healthy' : 'Unhealthy'}`);
  console.log(`✅ Components initialized: ${Object.values(healthStatus.components).filter(Boolean).length}/${Object.keys(healthStatus.components).length}`);
}

// Example 2: Creating and managing compliance checklists
export async function complianceChecklistManagement() {
  console.log('\n=== Compliance Checklist Management ===\n');

  // Create GDPR compliance checklist
  const gdprChecklist = await legalCompliance.createChecklist(
    'gdpr-compliance',
    'GDPR Compliance 2024',
    'compliance@company.com'
  );
  console.log('✅ Created GDPR compliance checklist');
  console.log(`  - Items: ${gdprChecklist.progress.total}`);
  console.log(`  - Progress: ${gdprChecklist.progress.completed}/${gdprChecklist.progress.total} completed`);

  // Update checklist item status
  legalCompliance.updateChecklistItem(gdprChecklist.id, gdprChecklist.items[0].id, {
    status: 'compliant',
    reviewedBy: 'john.doe@company.com',
    notes: 'Privacy policy has been updated and published'
  });

  // Get updated progress
  const progress = legalCompliance.getChecklist(gdprChecklist.id)?.progress;
  console.log(`✅ Updated progress: ${progress?.completed}/${progress?.total} completed`);

  // Check for overdue items
  const overdueItems = legalCompliance.getOverdueItems();
  console.log(`✅ Overdue items: ${overdueItems.length}`);

  // Get upcoming deadlines
  const upcomingDeadlines = legalCompliance.getUpcomingDeadlines(30);
  console.log(`✅ Upcoming deadlines (30 days): ${upcomingDeadlines.length}`);
}

// Example 3: Policy management
export async function policyManagement() {
  console.log('\n=== Policy Management ===\n');

  // Create privacy policy from template
  const privacyPolicy = legalCompliance.createPolicy('privacy-policy', 'Company Privacy Policy', {
    date: new Date().toISOString().split('T')[0],
    companyName: 'Acme Corp',
    contactEmail: 'privacy@acme.com'
  });
  console.log('✅ Created privacy policy from template');
  console.log(`  - Type: ${privacyPolicy.type}`);
  console.log(`  - Status: ${privacyPolicy.status}`);

  // Update policy status
  legalCompliance.updatePolicyStatus(privacyPolicy.id, 'review', 'legal@company.com');
  console.log('✅ Updated policy status to "review"');

  // Get all policies
  const allPolicies = legalCompliance.getAllPolicies();
  console.log(`✅ Total policies: ${allPolicies.length}`);
}

// Example 4: Incident management
export async function incidentManagement() {
  console.log('\n=== Incident Management ===\n');

  // Report a data breach incident
  const incident = legalCompliance.reportIncident({
    type: 'data-breach',
    severity: 'high',
    title: 'Customer Data Exposure',
    description: 'Potential exposure of customer personal data due to misconfigured S3 bucket',
    impact: {
      affectedUsers: 1500,
      dataTypes: ['name', 'email', 'phone'],
      systems: ['AWS S3', 'Customer Database'],
      regions: ['us-east-1', 'eu-west-1']
    },
    reportedBy: 'security@company.com',
    notificationsSent: false,
    regulatoryReportingRequired: true
  });
  console.log('✅ Reported data breach incident');
  console.log(`  - Incident ID: ${incident.id}`);
  console.log(`  - Severity: ${incident.severity}`);
  console.log(`  - Affected users: ${incident.impact.affectedUsers}`);

  // Update incident status
  legalCompliance.updateIncidentStatus(incident.id, 'investigating', 'security@company.com');
  console.log('✅ Updated incident status to "investigating"');

  // Get all active incidents
  const allIncidents = legalCompliance.getAllIncidents();
  const activeIncidents = allIncidents.filter(inc => ['open', 'investigating', 'contained'].includes(inc.status));
  console.log(`✅ Active incidents: ${activeIncidents.length}`);
}

// Example 5: Product requirements tracking
export async function productRequirementsTracking() {
  console.log('\n=== Product Requirements Tracking ===\n');

  // Add GDPR data export requirement
  const exportRequirement = {
    id: 'req-export-001',
    category: 'data-export' as const,
    title: 'GDPR Data Export Functionality',
    description: 'Implement user data export functionality compliant with GDPR Article 20',
    acceptanceCriteria: [
      'Users can request data export via user interface',
      'Export format is machine-readable (JSON/CSV)',
      'Export includes all personal data processed',
      'Export is delivered within 30 days of request',
      'Export is authenticated and authorized'
    ],
    status: 'pending' as const,
    priority: 'high' as const,
    assignedTo: 'engineering@company.com',
    estimatedHours: 40,
    dependencies: ['user-auth-system', 'data-inventory'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  legalCompliance.addRequirement(exportRequirement);
  console.log('✅ Added data export requirement');
  console.log(`  - Priority: ${exportRequirement.priority}`);
  console.log(`  - Estimated hours: ${exportRequirement.estimatedHours}`);

  // Update requirement status
  legalCompliance.updateRequirementStatus(exportRequirement.id, 'in-progress', 8);
  console.log('✅ Updated requirement status to "in-progress"');

  // Get all requirements
  const allRequirements = legalCompliance.getAllRequirements();
  const pendingRequirements = allRequirements.filter(req => req.status === 'pending');
  console.log(`✅ Pending requirements: ${pendingRequirements.length}`);
}

// Example 6: Compliance registries
export async function complianceRegistries() {
  console.log('\n=== Compliance Registries ===\n');

  // Add vendor registry entry
  const vendorRegistry = {
    id: 'vendor-001',
    type: 'vendor' as const,
    name: 'Cloudflare',
    description: 'CDN and DDoS protection services',
    framework: ['GDPR', 'SOC2'] as ComplianceFramework[],
    status: 'active' as const,
    data: {
      category: 'Infrastructure',
      riskLevel: 'medium' as const,
      dataProcessed: ['IP addresses', 'request logs'],
      location: 'US',
      contractStart: new Date('2024-01-01'),
      contractEnd: new Date('2025-01-01'),
      slaRequirements: ['99.9% uptime', '24/7 support'],
      complianceCertifications: ['SOC2 Type II', 'ISO27001']
    },
    reviewDate: new Date('2024-06-01'),
    nextReviewDate: new Date('2024-12-01'),
    owner: 'infrastructure@company.com',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  legalCompliance.addRegistry(vendorRegistry);
  console.log('✅ Added vendor registry entry for Cloudflare');

  // Add subprocessor registry entry
  const subprocessorRegistry = {
    id: 'subprocessor-001',
    type: 'subprocessor' as const,
    name: 'AWS',
    description: 'Cloud infrastructure provider',
    framework: ['GDPR', 'SOC2', 'ISO27001'] as ComplianceFramework[],
    status: 'active' as const,
    data: {
      category: 'Cloud Infrastructure',
      services: ['EC2', 'S3', 'RDS', 'CloudWatch'],
      dataProcessed: ['Customer data', 'Application logs', 'Database records'],
      location: 'Multiple regions',
      dataProcessingAgreement: true,
      complianceCertifications: ['SOC2', 'ISO27001', 'PCI-DSS']
    },
    reviewDate: new Date('2024-01-01'),
    nextReviewDate: new Date('2024-07-01'),
    owner: 'infrastructure@company.com',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  legalCompliance.addRegistry(subprocessorRegistry);
  console.log('✅ Added subprocessor registry entry for AWS');

  // Get registries by type
  const vendors = legalCompliance.getRegistriesByType('vendor');
  const subprocessors = legalCompliance.getRegistriesByType('subprocessor');
  console.log(`✅ Vendor registries: ${vendors.length}`);
  console.log(`✅ Subprocessor registries: ${subprocessors.length}`);
}

// Example 7: Compliance assessment and reporting
export async function complianceAssessment() {
  console.log('\n=== Compliance Assessment and Reporting ===\n');

  // Get overall compliance assessment
  const assessment = await legalCompliance.getAssessment();
  console.log('✅ Compliance Assessment Results:');
  console.log(`  - Overall Score: ${assessment.overallScore}%`);
  console.log(`  - Critical Items: ${assessment.criticalItems.length}`);
  console.log(`  - High Risk Items: ${assessment.highRiskItems.length}`);
  console.log(`  - Upcoming Deadlines: ${assessment.upcomingDeadlines.length}`);

  console.log('\n✅ Framework Scores:');
  Object.entries(assessment.frameworkScores).forEach(([framework, score]) => {
    console.log(`  - ${framework}: ${score}%`);
  });

  console.log('\n✅ Recommendations:');
  assessment.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });

  // Generate comprehensive compliance report
  const report = await legalCompliance.generateComplianceReport('GDPR');
  console.log('\n✅ Generated Compliance Report:');
  console.log(`  - Checklists: ${report.checklists.length}`);
  console.log(`  - Policies: ${report.policies.length}`);
  console.log(`  - Incidents: ${report.incidents.length}`);
  console.log(`  - Requirements: ${report.requirements.length}`);
  console.log(`  - Registries: ${report.registries.length}`);
}

// Example 8: Dashboard data and monitoring
export async function dashboardMonitoring() {
  console.log('\n=== Dashboard Data and Monitoring ===\n');

  // Get dashboard data
  const dashboardData = await legalCompliance.getDashboardData();
  console.log('✅ Dashboard Data Summary:');
  console.log(`  - Overall Score: ${dashboardData.assessment.overallScore}%`);
  console.log(`  - Active Incidents: ${dashboardData.activeIncidents}`);
  console.log(`  - Pending Policies: ${dashboardData.pendingPolicies}`);
  console.log(`  - Overdue Items: ${dashboardData.overdueItems}`);
  console.log(`  - Upcoming Deadlines: ${dashboardData.upcomingDeadlines.length}`);

  // Get enabled frameworks
  const enabledFrameworks = legalCompliance.getEnabledFrameworks();
  console.log(`✅ Enabled Frameworks: ${enabledFrameworks.join(', ')}`);

  // Search compliance items
  const searchResults = legalCompliance.searchComplianceItems('privacy', {
    framework: 'GDPR',
    status: 'pending'
  });
  console.log(`✅ Search results for "privacy" in GDPR: ${searchResults.length} items`);
}

// Example 9: Configuration management
export async function configurationManagement() {
  console.log('\n=== Configuration Management ===\n');

  // Get current configuration
  const config = legalCompliance.getConfig();
  console.log('✅ Current Configuration:');
  console.log(`  - Enabled Frameworks: ${config.enabledFrameworks.length}`);
  console.log(`  - Auto Track Changes: ${config.autoTrackChanges}`);
  console.log(`  - Require Approval: ${config.requireApproval}`);
  console.log(`  - Enable Notifications: ${config.enableNotifications}`);

  // Update configuration
  legalCompliance.updateConfig({
    enableNotifications: true,
    enableAutomatedChecks: true,
    approvalWorkflow: {
      ...config.approvalWorkflow,
      approvers: ['legal@company.com', 'compliance@company.com']
    }
  });
  console.log('✅ Updated configuration with notification and approval settings');

  // Enable additional framework
  legalCompliance.enableFramework('HIPAA');
  const updatedFrameworks = legalCompliance.getEnabledFrameworks();
  console.log(`✅ Enabled frameworks after update: ${updatedFrameworks.join(', ')}`);
}

// Example 10: Automated compliance checks
export async function automatedComplianceChecks() {
  console.log('\n=== Automated Compliance Checks ===\n');

  // Simulate automated compliance checks
  const checkResults = {
    dataEncryption: {
      status: 'pass',
      details: 'All data at rest and in transit is encrypted'
    },
    accessControls: {
      status: 'fail',
      details: 'Some users have excessive permissions'
    },
    auditLogging: {
      status: 'pass',
      details: 'Comprehensive audit logging is enabled'
    },
    dataRetention: {
      status: 'warning',
      details: 'Some data exceeds retention policy'
    }
  };

  console.log('✅ Automated Compliance Check Results:');
  Object.entries(checkResults).forEach(([check, result]) => {
    const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`  ${status} ${check}: ${result.details}`);
  });

  // Create compliance alerts for failed checks
  const failedChecks = Object.entries(checkResults).filter(([_, result]) => result.status === 'fail');
  if (failedChecks.length > 0) {
    console.log(`\n✅ Created ${failedChecks.length} compliance alerts for failed checks`);
  }
}

// Run all examples
export async function runAllExamples() {
  console.log('Legal & Compliance Disaster Kit - Example Usage\n');
  console.log('==============================================\n');

  try {
    await basicComplianceInitialization();
    await complianceChecklistManagement();
    await policyManagement();
    await incidentManagement();
    await productRequirementsTracking();
    await complianceRegistries();
    await complianceAssessment();
    await dashboardMonitoring();
    await configurationManagement();
    await automatedComplianceChecks();

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

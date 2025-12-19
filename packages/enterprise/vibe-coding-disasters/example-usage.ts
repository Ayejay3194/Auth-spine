/**
 * Example usage of the Vibe Coding Disasters Kit
 * 
 * This example demonstrates how to use the kit to:
 * - Assess risks for a project
 * - Generate checklists for PRs and releases
 * - Validate deployment readiness
 * - Create custom risk assessments
 */

import { 
  VibeCodingDisasters, 
  vibeCodingDisasters,
  RiskItem,
  RiskContext 
} from './index.js';

// Example 1: Basic risk assessment
export function basicRiskAssessment() {
  console.log('=== Basic Risk Assessment ===\n');

  const assessment = vibeCodingDisasters.assessRisks({
    isProduction: false,
    hasPII: true,
    handlesMoney: false,
    isCustomerFacing: true,
    teamSize: 10,
    userCount: 1000
  });

  console.log(`Total risks: ${assessment.totalRisks}`);
  console.log(`Critical risks: ${assessment.criticalRisks}`);
  console.log(`High risks: ${assessment.highRisks}`);
  console.log(`Risk score: ${assessment.riskScore}`);
  console.log(`Blocked: ${assessment.blocked}`);
  console.log('\nRecommendations:');
  assessment.recommendations.forEach(rec => console.log(`- ${rec}`));
}

// Example 2: Generate PR checklist
export function generatePRChecklist() {
  console.log('\n=== PR Checklist ===\n');

  const checklist = vibeCodingDisasters.generatePRChecklist({
    blockOnCritical: true,
    blockOnHigh: false,
    customChecks: [
      'Performance tests pass',
      'Accessibility audit completed',
      'Documentation updated'
    ]
  });

  console.log(checklist);
}

// Example 3: Security gate validation
export function securityGateValidation() {
  console.log('\n=== Security Gate Validation ===\n');

  const securityChecklist = vibeCodingDisasters.generateSecurityGateChecklist();
  console.log(securityChecklist);

  // Check specific security risks
  const securityRisks = vibeCodingDisasters.getRisksForArea('SECURITY_VULNERABILITIES');
  const criticalSecurity = securityRisks.filter(r => r.severity === 'CRITICAL');
  
  console.log(`\nFound ${criticalSecurity.length} critical security issues:`);
  criticalSecurity.forEach(risk => {
    console.log(`- ${risk.text}`);
  });
}

// Example 4: Deployment validation
export function validateDeployment() {
  console.log('\n=== Deployment Validation ===\n');

  const validation = vibeCodingDisasters.validateState({
    environment: 'production',
    features: ['user-auth', 'payment-processing', 'data-analytics'],
    hasPII: true,
    handlesMoney: true,
    lastSecurityReview: new Date('2024-01-15')
  });

  console.log(`Valid for deployment: ${validation.valid}`);
  console.log(`Blocked: ${validation.blocked}`);
  console.log(`Issues found: ${validation.issues.length}`);
  
  if (validation.issues.length > 0) {
    console.log('\nTop issues:');
    validation.issues.slice(0, 5).forEach(issue => {
      console.log(`- [${issue.severity}] ${issue.text}`);
    });
  }

  console.log('\nRecommendations:');
  validation.recommendations.forEach(rec => console.log(`- ${rec}`));
}

// Example 5: Custom risk assessment for a new feature
export function assessNewFeature() {
  console.log('\n=== New Feature Risk Assessment ===\n');

  const preflightChecklist = vibeCodingDisasters.generatePreflightChecklist({
    features: ['real-time-chat', 'file-uploads', 'user-profiles'],
    areas: ['SECURITY_VULNERABILITIES', 'DATABASE_DISASTERS', 'OPERATIONAL_DISASTERS'],
    customRules: [
      'Chat messages are encrypted',
      'File uploads are scanned for malware',
      'Profile changes are audited'
    ]
  });

  console.log(preflightChecklist);
}

// Example 6: Risk search and analysis
export function riskSearchAndAnalysis() {
  console.log('\n=== Risk Search and Analysis ===\n');

  // Search for authentication-related risks
  const authRisks = vibeCodingDisasters.searchRisks('authentication');
  console.log(`Found ${authRisks.length} authentication-related risks:`);
  
  authRisks.forEach(risk => {
    console.log(`- [${risk.severity}] ${risk.text} (${risk.category})`);
  });

  // Get risk summary
  const summary = vibeCodingDisasters.getRiskSummary();
  console.log(`\nRisk Summary:`);
  console.log(`Total risks in database: ${summary.total}`);
  
  console.log('\nTop 5 highest priority risks:');
  summary.topRisks.slice(0, 5).forEach((risk, index) => {
    console.log(`${index + 1}. [${risk.severity}] ${risk.text}`);
  });
}

// Example 7: Comprehensive risk report
export function generateComprehensiveReport() {
  console.log('\n=== Comprehensive Risk Report ===\n');

  const report = vibeCodingDisasters.generateRiskReport({
    isProduction: true,
    hasPII: true,
    handlesMoney: true,
    isCustomerFacing: true,
    teamSize: 25,
    userCount: 50000
  });

  console.log('Risk Assessment:');
  console.log(`- Total risks: ${report.assessment.totalRisks}`);
  console.log(`- Critical: ${report.assessment.criticalRisks}`);
  console.log(`- High: ${report.assessment.highRisks}`);
  console.log(`- Risk score: ${report.assessment.riskScore}`);
  console.log(`- Blocked: ${report.assessment.blocked}`);

  console.log('\nTop Recommendations:');
  report.recommendations.slice(0, 3).forEach(rec => {
    console.log(`- ${rec}`);
  });

  console.log('\nNext Steps:');
  report.nextSteps.slice(0, 3).forEach(step => {
    console.log(`- ${step}`);
  });
}

// Example 8: Custom configuration
export function customConfigurationExample() {
  console.log('\n=== Custom Configuration Example ===\n');

  // Create a custom instance with different settings
  const customVibe = new VibeCodingDisasters({
    enableBlocking: true,
    blockOnCritical: true,
    blockOnHigh: true, // More strict - block on high too
    requireSignoff: true,
    autoGeneratePR: false,
    categories: [
      'SECURITY_VULNERABILITIES',
      'FINANCIAL_BUSINESS_DISASTERS',
      'LEGAL_COMPLIANCE_DISASTERS'
    ]
  });

  const assessment = customVibe.assessRisks({
    isProduction: true,
    hasPII: true,
    handlesMoney: true
  });

  console.log('Custom configuration assessment:');
  console.log(`- Risk score: ${assessment.riskScore}`);
  console.log(`- Blocked: ${assessment.blocked}`);
  console.log(`- Custom categories only: ${assessment.totalRisks} risks evaluated`);
}

// Example 9: Template usage
export function templateUsageExample() {
  console.log('\n=== Template Usage Example ===\n');

  const templates = vibeCodingDisasters.getTemplates();
  
  templates.forEach(template => {
    console.log(`\n${template.name}:`);
    console.log(`Description: ${template.description}`);
    console.log(`Content length: ${template.content.length} characters`);
  });
}

// Example 10: Integration with CI/CD
export function cicdIntegrationExample() {
  console.log('\n=== CI/CD Integration Example ===\n');

  // Simulate CI/CD pipeline check
  const pipelineCheck = () => {
    const risks = vibeCodingDisasters.getRisksForArea('SECURITY_VULNERABILITIES');
    const blockResult = vibeCodingDisasters.shouldBlockDeployment(risks);

    if (blockResult.blocked) {
      console.log('❌ CI/CD Pipeline BLOCKED');
      console.log(`Reason: ${blockResult.reason}`);
      console.log('\nCritical issues to fix:');
      blockResult.criticalIssues.forEach(issue => {
        console.log(`- ${issue.text}`);
      });
      return false;
    } else {
      console.log('✅ CI/CD Pipeline PASSED');
      console.log('No blocking issues detected');
      return true;
    }
  };

  const canDeploy = pipelineCheck();
  console.log(`\nCan deploy: ${canDeploy}`);
}

// Run all examples
export function runAllExamples() {
  console.log('Vibe Coding Disasters Kit - Example Usage\n');
  console.log('=====================================\n');

  try {
    basicRiskAssessment();
    generatePRChecklist();
    securityGateValidation();
    validateDeployment();
    assessNewFeature();
    riskSearchAndAnalysis();
    generateComprehensiveReport();
    customConfigurationExample();
    templateUsageExample();
    cicdIntegrationExample();

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

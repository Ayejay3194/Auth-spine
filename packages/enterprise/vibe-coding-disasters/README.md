# Vibe Coding Disasters Kit

A comprehensive risk register and guardrail system for preventing common development disasters. Use this as preflight checks, PR review rubric, security gates, and "don't embarrass yourself in prod" enforcement.

## Features

- **184 Risk Items**: Comprehensive coverage of common development disasters across 18 categories
- **Automated Checklists**: Generate PR, release, and security gate checklists automatically
- **Risk Assessment**: Score and prioritize risks based on context and business impact
- **CI/CD Integration**: Built-in support for blocking deployments based on risk levels
- **Customizable Configuration**: Adapt the system to your specific needs and risk tolerance
- **Template System**: Ready-to-use templates for common scenarios

## Installation

```bash
npm install @auth-spine/vibe-coding-disasters
```

## Quick Start

```typescript
import { vibeCodingDisasters } from '@auth-spine/vibe-coding-disasters';

// Assess risks for your project
const assessment = vibeCodingDisasters.assessRisks({
  isProduction: false,
  hasPII: true,
  handlesMoney: false,
  isCustomerFacing: true
});

console.log(`Risk score: ${assessment.riskScore}`);
console.log(`Blocked: ${assessment.blocked}`);

// Generate PR checklist
const checklist = vibeCodingDisasters.generatePRChecklist({
  blockOnCritical: true,
  customChecks: ['Performance tests pass']
});

console.log(checklist);
```

## Categories

The kit covers 18 major categories of development disasters:

1. **SECURITY VULNERABILITIES** - Authentication, authorization, injection attacks
2. **DATABASE DISASTERS** - Data loss, corruption, performance issues
3. **FINANCIAL_BUSINESS_DISASTERS** - Money-related errors, business logic flaws
4. **LEGAL_COMPLIANCE_DISASTERS** - Regulatory issues, privacy violations
5. **OPERATIONAL_DISASTERS** - Downtime, monitoring, reliability issues
6. **ANALYTICS_TRACKING_DISASTERS** - Bad data, tracking failures
7. **CONFIGURATION_SETTINGS_DISASTERS** - Misconfigurations, security holes
8. **CRON_SCHEDULED_TASKS_DISASTERS** - Missed jobs, duplicate work
9. **EDGE_CASES_RARE_FAILURES** - Unexpected behavior scenarios
10. **EMAIL_NOTIFICATIONS_DISASTERS** - Communication failures
11. **IMPORT_EXPORT_DISASTERS** - Data loss, security problems
12. **LOCALIZATION_I18N_DISASTERS** - Internationalization issues
13. **MIGRATION_DISASTERS** - Data migration failures
14. **MOBILE_DISASTERS** - Mobile-specific problems
15. **MULTI_TENANCY_DISASTERS** - Data leaks, isolation issues
16. **QUEUE_BACKGROUND_JOBS_DISASTERS** - Lost work, system problems
17. **SEARCH_FILTERING_DISASTERS** - Performance, UX issues
18. **WEBSOCKET_REALTIME_DISASTERS** - Connection, security problems

## API Reference

### Main Class: VibeCodingDisasters

#### Risk Assessment

```typescript
// Assess risks with context
const assessment = vibeCodingDisasters.assessRisks({
  isProduction: boolean,
  hasPII: boolean,
  handlesMoney: boolean,
  isCustomerFacing: boolean,
  teamSize?: number,
  userCount?: number
});

// Returns: RiskAssessment
interface RiskAssessment {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScore: number;
  recommendations: string[];
  blocked: boolean;
}
```

#### Checklist Generation

```typescript
// PR Checklist
const prChecklist = vibeCodingDisasters.generatePRChecklist({
  blockOnCritical?: boolean,
  blockOnHigh?: boolean,
  requireSignoff?: boolean,
  customChecks?: string[],
  excludeChecks?: string[]
});

// Release Checklist
const releaseChecklist = vibeCodingDisasters.generateReleaseChecklist({
  includeCategories?: string[],
  excludeCategories?: string[],
  minSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  includeMitigations?: boolean,
  includeExamples?: boolean
});

// Security Gate Checklist
const securityChecklist = vibeCodingDisasters.generateSecurityGateChecklist();

// Preflight Checklist
const preflightChecklist = vibeCodingDisasters.generatePreflightChecklist({
  features: string[],
  areas: string[],
  customRules?: string[]
});
```

#### Risk Management

```typescript
// Get risk summary
const summary = vibeCodingDisasters.getRiskSummary();

// Search risks
const authRisks = vibeCodingDisasters.searchRisks('authentication');

// Get risks for specific area
const dbRisks = vibeCodingDisasters.getRisksForArea('DATABASE_DISASTERS');

// Validate deployment
const validation = vibeCodingDisasters.validateState({
  environment: 'development' | 'staging' | 'production',
  features: string[],
  hasPII: boolean,
  handlesMoney: boolean
});
```

### Configuration

```typescript
import { VibeCodingDisasters } from '@auth-spine/vibe-coding-disasters';

const customVibe = new VibeCodingDisasters({
  enableBlocking: true,
  blockOnCritical: true,
  blockOnHigh: false,
  requireSignoff: true,
  autoGeneratePR: true,
  categories: ['SECURITY_VULNERABILITIES', 'DATABASE_DISASTERS']
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Risk Assessment
on: [pull_request]

jobs:
  risk-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install @auth-spine/vibe-coding-disasters
      
      - name: Run risk assessment
        run: |
          node -e "
          const { vibeCodingDisasters } = require('@auth-spine/vibe-coding-disasters');
          const assessment = vibeCodingDisasters.assessRisks({isProduction: true});
          if (assessment.blocked) {
            console.error('❌ Deployment blocked: ' + assessment.criticalRisks + ' critical issues');
            process.exit(1);
          }
          console.log('✅ Risk assessment passed');
          "
```

### Jenkins Pipeline Example

```groovy
pipeline {
  agent any
  
  stages {
    stage('Risk Assessment') {
      steps {
        sh 'npm install @auth-spine/vibe-coding-disasters'
        script {
          def result = sh(
            script: '''
              node -e "
              const { vibeCodingDisasters } = require('@auth-spine/vibe-coding-disasters');
              const assessment = vibeCodingDisasters.assessRisks({isProduction: true});
              console.log(JSON.stringify(assessment));
              "
            ''',
            returnStdout: true
          ).trim()
          
          def assessment = readJSON text: result
          if (assessment.blocked) {
            error "Deployment blocked: ${assessment.criticalRisks} critical issues"
          }
        }
      }
    }
  }
}
```

## Examples

### Basic Risk Assessment

```typescript
import { vibeCodingDisasters } from '@auth-spine/vibe-coding-disasters';

// Assess current project risks
const assessment = vibeCodingDisasters.assessRisks({
  isProduction: false,
  hasPII: true,
  handlesMoney: false,
  isCustomerFacing: true,
  teamSize: 10,
  userCount: 1000
});

if (assessment.blocked) {
  console.error('🚫 Cannot proceed - critical issues found');
  assessment.recommendations.forEach(rec => console.log(`- ${rec}`));
} else {
  console.log('✅ Ready to proceed');
}
```

### Generate PR Checklist

```typescript
const checklist = vibeCodingDisasters.generatePRChecklist({
  blockOnCritical: true,
  customChecks: [
    'Performance tests pass',
    'Accessibility audit completed',
    'Documentation updated'
  ]
});

console.log(checklist);
```

### Security Gate Validation

```typescript
const securityRisks = vibeCodingDisasters.getRisksForArea('SECURITY_VULNERABILITIES');
const criticalSecurity = securityRisks.filter(r => r.severity === 'CRITICAL');

if (criticalSecurity.length > 0) {
  console.log('🚨 Critical security issues found:');
  criticalSecurity.forEach(risk => {
    console.log(`- ${risk.text}`);
  });
}
```

## Templates

The kit includes ready-to-use templates:

- **PR_CHECKLIST.md** - Pull request checklist template
- **RELEASE_CHECKLIST.md** - Release checklist template  
- **CI_GUARDRAILS.md** - CI/CD pipeline guardrails template

```typescript
import { templateManager } from '@auth-spine/vibe-coding-disasters';

const prTemplate = templateManager.getPRChecklistTemplate();
console.log(prTemplate.content);
```

## Risk Scoring

The system uses weighted risk scoring:

- **Critical**: 10 points
- **High**: 5 points
- **Medium**: 2 points
- **Low**: 1 point

Context multipliers adjust the score based on:
- Production environment (+2x)
- PII handling (+1.5x)
- Financial transactions (+1.8x)
- Customer-facing (+1.3x)
- Large teams (+1.2x)
- High user count (+1.4x)

## Contributing

To add new risk items:

1. Update `data/risk-register.json`
2. Add appropriate categories and severity levels
3. Include descriptions and mitigations where helpful
4. Update tests and documentation

## License

MIT License - see LICENSE file for details.

---

**Remember**: "Move fast and break things" is cute until you're the one doing incident response. Use this kit to prevent disasters before they happen.

/**
 * Compliance Framework for SaaS/PaaS Security Suite
 * 
 * Provides comprehensive compliance management for SOC2, ISO27001,
 * GDPR, HIPAA, PCI, and custom compliance frameworks.
 */

import { ComplianceConfig, ComplianceReport, SecurityControl, TestResult } from './types.js';

export class ComplianceFrameworkManager {
  private config: ComplianceConfig;
  private frameworks: Map<string, any> = new Map();
  private controls: Map<string, SecurityControl> = new Map();
  private assessments: Map<string, any> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();
  private initialized = false;

  /**
   * Initialize compliance framework
   */
  async initialize(config: ComplianceConfig): Promise<void> {
    this.config = config;
    this.loadFrameworks();
    this.loadControls();
    this.loadAssessments();
    this.initialized = true;
  }

  /**
   * Generate compliance report
   */
  async generateReport(framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom', period: {
    start: Date;
    end: Date;
  }): Promise<ComplianceReport> {
    const frameworkControls = await this.getFrameworkControls(framework);
    
    const reportControls = frameworkControls.map(control => {
      const controlTests = this.getControlTests(control.id);
      const hasValidEvidence = controlTests.some(test => test.status === 'passed');
      const hasFailedTests = controlTests.some(test => test.status === 'failed');
      
      return {
        controlId: control.id,
        controlName: control.name,
        status: hasValidEvidence && !hasFailedTests ? 'compliant' : 
                hasFailedTests ? 'non_compliant' : 'not_applicable',
        evidence: control.implementation.evidence,
        findings: hasFailedTests ? 
          controlTests.filter(t => t.status === 'failed').map(t => t.details.issues.map(i => i.description)).flat() :
          [],
        riskLevel: control.risk.level,
        testResults: controlTests
      };
    });

    const overallStatus = this.calculateOverallStatus(reportControls);
    const overallScore = this.calculateOverallScore(reportControls);
    const recommendations = this.generateRecommendations(reportControls, framework);

    const report: ComplianceReport = {
      id: this.generateReportId(),
      framework,
      period,
      status: overallStatus,
      overallScore,
      controls: reportControls,
      recommendations,
      nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      generatedAt: new Date(),
      approvedBy: 'compliance_team'
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Add security control
   */
  async addControl(control: {
    name: string;
    description: string;
    category: 'access' | 'data' | 'network' | 'application' | 'infrastructure' | 'compliance';
    type: 'preventive' | 'detective' | 'corrective' | 'compensating';
    framework: Array<'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom'>;
    risk: {
      level: 'low' | 'medium' | 'high' | 'critical';
      likelihood: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high' | 'critical';
      mitigation: string[];
    };
  }): Promise<SecurityControl> {
    const controlId = this.generateControlId();
    
    const securityControl: SecurityControl = {
      id: controlId,
      name: control.name,
      description: control.description,
      category: control.category,
      type: control.type,
      framework: control.framework,
      implementation: {
        status: 'not_implemented',
        owner: 'unassigned',
        evidence: [],
        testResults: []
      },
      risk: control.risk,
      automation: {
        automated: false,
        dependencies: []
      }
    };

    this.controls.set(controlId, securityControl);
    return securityControl;
  }

  /**
   * Update control implementation
   */
  async updateControlImplementation(controlId: string, updates: {
    status?: 'not_implemented' | 'planned' | 'in_progress' | 'implemented' | 'tested' | 'validated';
    owner?: string;
    dueDate?: Date;
    evidence?: string[];
  }): Promise<SecurityControl> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`Control not found: ${controlId}`);
    }

    const updatedControl = {
      ...control,
      implementation: {
        ...control.implementation,
        ...updates
      }
    };

    this.controls.set(controlId, updatedControl);
    return updatedControl;
  }

  /**
   * Add test result
   */
  async addTestResult(controlId: string, testResult: {
    testType: 'unit' | 'integration' | 'security' | 'compliance' | 'performance';
    status: 'passed' | 'failed' | 'skipped' | 'error';
    executedBy: string;
    duration: number;
    details: {
      description: string;
      results: any;
      artifacts: string[];
      issues: Array<{
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        recommendation: string;
      }>;
    };
  }): Promise<TestResult> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`Control not found: ${controlId}`);
    }

    const testResultData: TestResult = {
      id: this.generateTestId(),
      controlId,
      testType: testResult.testType,
      status: testResult.status,
      executedAt: new Date(),
      executedBy: testResult.executedBy,
      duration: testResult.duration,
      details: testResult.details
    };

    control.implementation.testResults.push(testResultData);
    this.controls.set(controlId, control);

    return testResultData;
  }

  /**
   * Get compliance metrics
   */
  async getMetrics(): Promise<{
    totalControls: number;
    implementedControls: number;
    validatedControls: number;
    complianceScore: number;
    frameworkBreakdown: Record<string, number>;
    riskBreakdown: Record<string, number>;
  }> {
    const controls = Array.from(this.controls.values());
    
    const totalControls = controls.length;
    const implementedControls = controls.filter(c => 
      c.implementation.status === 'implemented' || c.implementation.status === 'tested' || c.implementation.status === 'validated'
    ).length;
    const validatedControls = controls.filter(c => c.implementation.status === 'validated').length;
    
    const complianceScore = totalControls > 0 ? Math.round((validatedControls / totalControls) * 100) : 0;
    
    const frameworkBreakdown = controls.reduce((acc, control) => {
      control.framework.forEach(fw => {
        acc[fw] = (acc[fw] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const riskBreakdown = controls.reduce((acc, control) => {
      acc[control.risk.level] = (acc[control.risk.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalControls,
      implementedControls,
      validatedControls,
      complianceScore,
      frameworkBreakdown,
      riskBreakdown
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate compliance configuration
   */
  generateConfig(): {
    frameworks: string;
    controls: string;
    assessments: string;
    reporting: string;
  } {
    const frameworksConfig = this.generateFrameworksConfig();
    const controlsConfig = this.generateControlsConfig();
    const assessmentsConfig = this.generateAssessmentsConfig();
    const reportingConfig = this.generateReportingConfig();

    return {
      frameworks: frameworksConfig,
      controls: controlsConfig,
      assessments: assessmentsConfig,
      reporting: reportingConfig
    };
  }

  private async getFrameworkControls(framework: string): Promise<SecurityControl[]> {
    return Array.from(this.controls.values())
      .filter(control => control.framework.includes(framework as any));
  }

  private getControlTests(controlId: string): TestResult[] {
    const control = this.controls.get(controlId);
    return control?.implementation.testResults || [];
  }

  private calculateOverallStatus(controls: Array<{
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>): 'compliant' | 'non_compliant' | 'partial_compliant' {
    const compliantCount = controls.filter(c => c.status === 'compliant').length;
    const totalCount = controls.length;
    const hasCriticalNonCompliant = controls.some(c => 
      c.status === 'non_compliant' && c.riskLevel === 'critical'
    );

    if (hasCriticalNonCompliant) {
      return 'non_compliant';
    }

    const complianceRatio = compliantCount / totalCount;
    if (complianceRatio >= 0.95) {
      return 'compliant';
    } else if (complianceRatio >= 0.80) {
      return 'partial_compliant';
    } else {
      return 'non_compliant';
    }
  }

  private calculateOverallScore(controls: Array<{
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>): number {
    let totalScore = 0;
    let maxScore = 0;

    controls.forEach(control => {
      const weight = this.getRiskWeight(control.riskLevel);
      maxScore += weight;
      
      if (control.status === 'compliant') {
        totalScore += weight;
      } else if (control.status === 'partial_compliant') {
        totalScore += weight * 0.5;
      }
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  private getRiskWeight(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
    return {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }[riskLevel] || 1;
  }

  private generateRecommendations(controls: Array<{
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>, framework: string): string[] {
    const recommendations = [];
    const nonCompliantControls = controls.filter(c => c.status === 'non_compliant');

    if (nonCompliantControls.length > 0) {
      recommendations.push(`Address ${nonCompliantControls.length} non-compliant controls for ${framework}`);
    }

    const criticalNonCompliant = nonCompliantControls.filter(c => c.riskLevel === 'critical');
    if (criticalNonCompliant.length > 0) {
      recommendations.push('Priority: Address critical compliance gaps immediately');
    }

    const highNonCompliant = nonCompliantControls.filter(c => c.riskLevel === 'high');
    if (highNonCompliant.length > 0) {
      recommendations.push('High Priority: Implement controls for high-risk areas');
    }

    recommendations.push('Schedule regular compliance assessments');
    recommendations.push('Maintain up-to-date evidence collection');
    recommendations.push('Conduct staff training on compliance requirements');

    return recommendations;
  }

  private loadFrameworks(): void {
    // Load default compliance frameworks
    const defaultFrameworks = [
      {
        id: 'SOC2',
        name: 'SOC 2 Type II',
        description: 'Service Organization Control 2 Type II',
        categories: ['Security', 'Availability', 'Processing', 'Confidentiality', 'Privacy'],
        requirements: [
          'Control Environment',
          'Communication and Responsibility',
          'Risk Assessment',
          'Monitoring Activities',
          'Control Activities',
          'Logical and Physical Access',
          'System Operations',
          'Change Management'
        ],
        assessmentFrequency: 12, // months
        evidenceRetention: 2555 // days
      },
      {
        id: 'ISO27001',
        name: 'ISO 27001:2013',
        description: 'Information Security Management System',
        categories: ['Information Security Policies', 'Organization', 'People', 'Physical', 'Technology'],
        requirements: [
          'Information Security Policies',
          'Organization of Information Security',
          'Human Resource Security',
          'Asset Management',
          'Access Control',
          'Cryptography',
          'Physical and Environmental Security',
          'Operations Security',
          'Communications Security',
          'System Acquisition, Development and Maintenance',
          'Supplier Relationships',
          'Incident Management',
          'Business Continuity',
          'Compliance'
        ],
        assessmentFrequency: 12,
        evidenceRetention: 2555
      },
      {
        id: 'GDPR',
        name: 'General Data Protection Regulation',
        description: 'EU General Data Protection Regulation',
        categories: ['Lawfulness', 'Rights', 'Security', 'Accountability'],
        requirements: [
          'Lawfulness, fairness and transparency',
          'Purpose limitation',
          'Data minimisation',
          'Accuracy',
          'Storage limitation',
          'Integrity and confidentiality',
          'Accountability'
        ],
        assessmentFrequency: 6,
        evidenceRetention: 2555
      }
    ];

    defaultFrameworks.forEach(framework => {
      this.frameworks.set(framework.id, framework);
    });
  }

  private loadControls(): void {
    // Load default security controls
    const defaultControls = [
      {
        id: 'CC1.1',
        name: 'Control Environment',
        description: 'Demonstrates commitment to integrity and ethical values',
        category: 'compliance' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001'] as const,
        risk: {
          level: 'high' as const,
          likelihood: 'medium' as const,
          impact: 'high' as const,
          mitigation: ['Establish tone at the top', 'Code of conduct', 'Ethics training']
        }
      },
      {
        id: 'CC6.1',
        name: 'Logical and Physical Access',
        description: 'Restricts logical and physical access',
        category: 'access' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001'] as const,
        risk: {
          level: 'critical' as const,
          likelihood: 'medium' as const,
          impact: 'critical' as const,
          mitigation: ['Access controls', 'Authentication', 'Authorization', 'Monitoring']
        }
      },
      {
        id: 'CC7.1',
        name: 'System Operations',
        description: 'Addresses achieving system objectives',
        category: 'infrastructure' as const,
        type: 'detective' as const,
        framework: ['SOC2'] as const,
        risk: {
          level: 'medium' as const,
          likelihood: 'medium' as const,
          impact: 'medium' as const,
          mitigation: ['Monitoring', 'Logging', 'Alerting', 'Incident response']
        }
      }
    ];

    defaultControls.forEach(control => {
      this.controls.set(control.id, {
        ...control,
        implementation: {
          status: 'not_implemented',
          owner: 'unassigned',
          evidence: [],
          testResults: []
        },
        automation: {
          automated: false,
          dependencies: []
        }
      });
    });
  }

  private loadAssessments(): void {
    // Load default assessments
    const defaultAssessments = [
      {
        id: 'soc2_type2',
        name: 'SOC 2 Type II Assessment',
        framework: 'SOC2',
        type: 'external',
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 90, // days
        scope: 'All systems and processes',
        status: 'scheduled',
        assessor: 'External CPA Firm'
      },
      {
        id: 'iso27001_audit',
        name: 'ISO 27001 Surveillance Audit',
        framework: 'ISO27001',
        type: 'external',
        scheduledDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        duration: 30,
        scope: 'ISMS scope',
        status: 'scheduled',
        assessor: 'Certified Body'
      }
    ];

    defaultAssessments.forEach(assessment => {
      this.assessments.set(assessment.id, assessment);
    });
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateControlId(): string {
    return `control_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateFrameworksConfig(): string {
    return `
# Compliance Frameworks Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  categories text[],
  requirements text[],
  assessment_frequency integer, -- months
  evidence_retention integer, -- days
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE framework_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid REFERENCES compliance_frameworks(id),
  external_standard text,
  mapping_details jsonb,
  last_updated timestamptz DEFAULT now()
);

# Framework management service
class ComplianceFrameworkService {
  constructor() {
    this.frameworks = new Map();
    this.loadFrameworks();
  }
  
  async getFramework(frameworkId) {
    return this.frameworks.get(frameworkId);
  }
  
  async getRequirements(frameworkId) {
    const framework = await this.getFramework(frameworkId);
    return framework?.requirements || [];
  }
  
  async validateCompliance(frameworkId, evidence) {
    const requirements = await this.getRequirements(frameworkId);
    const results = [];
    
    for (const requirement of requirements) {
      const result = await this.validateRequirement(requirement, evidence);
      results.push(result);
    }
    
    return {
      frameworkId,
      overallCompliance: this.calculateOverallCompliance(results),
      requirementResults: results,
      recommendations: this.generateRecommendations(results)
    };
  }
}
`;
  }

  private generateControlsConfig(): string {
    return `
# Security Controls Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE security_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  type text NOT NULL,
  framework text[],
  risk_level text NOT NULL,
  implementation_status text DEFAULT 'not_implemented',
  owner text,
  due_date timestamptz,
  evidence text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE control_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid REFERENCES security_controls(id),
  test_type text NOT NULL,
  status text NOT NULL,
  executed_by text NOT NULL,
  executed_at timestamptz DEFAULT now(),
  duration integer,
  details jsonb,
  artifacts text[]
);

# Controls management service
class SecurityControlsService {
  constructor() {
    this.controls = new Map();
    this.loadControls();
  }
  
  async addControl(controlData) {
    const control = {
      id: this.generateId(),
      ...controlData,
      implementation: {
        status: 'not_implemented',
        owner: 'unassigned',
        evidence: [],
        testResults: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.controls.set(control.id, control);
    return control;
  }
  
  async updateControlStatus(controlId, status, owner, evidence) {
    const control = this.controls.get(controlId);
    if (!control) throw new Error('Control not found');
    
    control.implementation.status = status;
    control.implementation.owner = owner;
    control.implementation.evidence = evidence;
    control.updatedAt = new Date();
    
    this.controls.set(controlId, control);
    return control;
  }
  
  async getControlsByFramework(framework) {
    return Array.from(this.controls.values())
      .filter(control => control.framework.includes(framework));
  }
  
  async getComplianceMetrics() {
    const controls = Array.from(this.controls.values());
    
    return {
      total: controls.length,
      implemented: controls.filter(c => 
        ['implemented', 'tested', 'validated'].includes(c.implementation.status)
      ).length,
      validated: controls.filter(c => c.implementation.status === 'validated').length,
      byFramework: this.groupByFramework(controls),
      byRisk: this.groupByRisk(controls)
    };
  }
}
`;
  }

  private generateAssessmentsConfig(): string {
    return `
# Compliance Assessments Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE compliance_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  framework text NOT NULL,
  type text NOT NULL, -- 'internal', 'external', 'self_assessment'
  scope text,
  scheduled_date timestamptz NOT NULL,
  duration integer, -- days
  status text DEFAULT 'scheduled',
  assessor text,
  findings jsonb,
  recommendations text[],
  report_path text,
  approved_at timestamptz,
  approved_by text
);

CREATE TABLE assessment_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES compliance_assessments(id),
  task_name text NOT NULL,
  description text,
  assigned_to text,
  due_date timestamptz,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  evidence text[],
  notes text
);

# Assessment management service
class ComplianceAssessmentService {
  constructor() {
    this.assessments = new Map();
    this.loadAssessments();
  }
  
  async scheduleAssessment(assessmentData) {
    const assessment = {
      id: this.generateId(),
      ...assessmentData,
      status: 'scheduled',
      createdAt: new Date(),
      tasks: []
    };
    
    this.assessments.set(assessment.id, assessment);
    await this.createAssessmentTasks(assessment);
    
    return assessment;
  }
  
  async updateAssessmentStatus(assessmentId, status, findings, recommendations) {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    
    assessment.status = status;
    assessment.findings = findings;
    assessment.recommendations = recommendations;
    assessment.updatedAt = new Date();
    
    this.assessments.set(assessmentId, assessment);
    return assessment;
  }
  
  async getUpcomingAssessments(days = 30) {
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.assessments.values())
      .filter(assessment => 
        assessment.scheduledDate <= cutoff && 
        ['scheduled', 'in_progress'].includes(assessment.status)
      );
  }
  
  async createAssessmentTasks(assessment) {
    const framework = this.getFrameworkRequirements(assessment.framework);
    
    for (const requirement of framework) {
      const task = {
        id: this.generateId(),
        assessmentId: assessment.id,
        taskName: requirement,
        description: \`Validate \${requirement}\`,
        status: 'pending',
        createdAt: new Date()
      };
      
      assessment.tasks.push(task);
    }
  }
}
`;
  }

  private generateReportingConfig(): string {
    return `
# Compliance Reporting Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  status text NOT NULL,
  overall_score integer,
  controls jsonb,
  recommendations text[],
  generated_at timestamptz DEFAULT now(),
  approved_by text,
  approved_at timestamptz
);

CREATE TABLE report_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES compliance_reports(id),
  control_id text,
  evidence_type text,
  evidence_path text,
  description text,
  uploaded_at timestamptz DEFAULT now()
);

# Reporting service
class ComplianceReportingService {
  constructor(controlService, assessmentService) {
    this.controlService = controlService;
    this.assessmentService = assessmentService;
  }
  
  async generateReport(framework, period) {
    const controls = await this.controlService.getControlsByFramework(framework);
    const assessments = await this.assessmentService.getAssessmentsForPeriod(framework, period);
    
    const reportControls = controls.map(control => ({
      controlId: control.id,
      controlName: control.name,
      status: this.evaluateControlStatus(control),
      evidence: control.implementation.evidence,
      findings: this.getControlFindings(control, assessments),
      riskLevel: control.risk.level,
      testResults: control.implementation.testResults
    }));
    
    const report = {
      id: this.generateId(),
      framework,
      period,
      status: this.calculateOverallStatus(reportControls),
      overallScore: this.calculateOverallScore(reportControls),
      controls: reportControls,
      recommendations: this.generateRecommendations(reportControls, framework),
      generatedAt: new Date()
    };
    
    return report;
  }
  
  async exportReport(reportId, format) {
    const report = await this.getReport(reportId);
    
    switch (format) {
      case 'pdf':
        return this.generatePDFReport(report);
      case 'excel':
        return this.generateExcelReport(report);
      case 'json':
        return JSON.stringify(report, null, 2);
      default:
        throw new Error('Unsupported format');
    }
  }
  
  async scheduleReports(framework, frequency) {
    const schedule = {
      framework,
      frequency,
      nextRun: this.calculateNextRun(frequency),
      recipients: await this.getReportRecipients(framework),
      template: framework
    };
    
    await this.createScheduledReport(schedule);
    return schedule;
  }
}
`;
  }
}

// Export singleton instance
export const complianceFramework = new ComplianceFrameworkManager();

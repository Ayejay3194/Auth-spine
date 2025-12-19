/**
 * Controls Catalog for SaaS/PaaS Security Suite
 * 
 * Provides comprehensive security controls catalog with implementation
 * guidance, testing procedures, and evidence collection for compliance.
 */

import { SecurityControl, TestResult } from './types.js';

export class ControlsCatalogManager {
  private controls: Map<string, SecurityControl> = new Map();
  private controlFamilies: Map<string, any> = new Map();
  private implementationGuides: Map<string, any> = new Map();
  private testProcedures: Map<string, any> = new Map();
  private evidenceTemplates: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize controls catalog
   */
  async initialize(): Promise<void> {
    this.loadControlFamilies();
    this.loadSecurityControls();
    this.loadImplementationGuides();
    this.loadTestProcedures();
    this.loadEvidenceTemplates();
    this.initialized = true;
  }

  /**
   * Get all controls
   */
  async getAllControls(): Promise<SecurityControl[]> {
    return Array.from(this.controls.values());
  }

  /**
   * Get controls by framework
   */
  async getControlsByFramework(framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom'): Promise<SecurityControl[]> {
    return Array.from(this.controls.values())
      .filter(control => control.framework.includes(framework));
  }

  /**
   * Get controls by category
   */
  async getControlsByCategory(category: 'access' | 'data' | 'network' | 'application' | 'infrastructure' | 'compliance'): Promise<SecurityControl[]> {
    return Array.from(this.controls.values())
      .filter(control => control.category === category);
  }

  /**
   * Get control by ID
   */
  async getControl(controlId: string): Promise<SecurityControl | null> {
    return this.controls.get(controlId) || null;
  }

  /**
   * Get control family
   */
  async getControlFamily(familyId: string): Promise<any> {
    return this.controlFamilies.get(familyId);
  }

  /**
   * Get implementation guide
   */
  async getImplementationGuide(controlId: string): Promise<any> {
    return this.implementationGuides.get(controlId);
  }

  /**
   * Get test procedures
   */
  async getTestProcedures(controlId: string): Promise<any> {
    return this.testProcedures.get(controlId);
  }

  /**
   * Get evidence template
   */
  async getEvidenceTemplate(controlId: string): Promise<any> {
    return this.evidenceTemplates.get(controlId);
  }

  /**
   * Add custom control
   */
  async addCustomControl(control: {
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
    familyId: string;
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
    
    // Create implementation guide
    await this.createImplementationGuide(controlId, control);
    
    // Create test procedures
    await this.createTestProcedures(controlId, control);
    
    // Create evidence template
    await this.createEvidenceTemplate(controlId, control);

    return securityControl;
  }

  /**
   * Get controls catalog metrics
   */
  async getMetrics(): Promise<{
    totalControls: number;
    controlsByFramework: Record<string, number>;
    controlsByCategory: Record<string, number>;
    controlsByRisk: Record<string, number>;
    implementationStatus: Record<string, number>;
  }> {
    const controls = Array.from(this.controls.values());
    
    const controlsByFramework = controls.reduce((acc, control) => {
      control.framework.forEach(fw => {
        acc[fw] = (acc[fw] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const controlsByCategory = controls.reduce((acc, control) => {
      acc[control.category] = (acc[control.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const controlsByRisk = controls.reduce((acc, control) => {
      acc[control.risk.level] = (acc[control.risk.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const implementationStatus = controls.reduce((acc, control) => {
      acc[control.implementation.status] = (acc[control.implementation.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalControls: controls.length,
      controlsByFramework,
      controlsByCategory,
      controlsByRisk,
      implementationStatus
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate controls catalog configuration
   */
  generateConfig(): {
    catalog: string;
    families: string;
    guides: string;
    testing: string;
  } {
    const catalogConfig = this.generateCatalogConfig();
    const familiesConfig = this.generateFamiliesConfig();
    const guidesConfig = this.generateGuidesConfig();
    const testingConfig = this.generateTestingConfig();

    return {
      catalog: catalogConfig,
      families: familiesConfig,
      guides: guidesConfig,
      testing: testingConfig
    };
  }

  private async createImplementationGuide(controlId: string, control: any): Promise<void> {
    const guide = {
      controlId,
      overview: `Implementation guide for ${control.name}`,
      objectives: [
        'Establish control objectives',
        'Define implementation approach',
        'Assign responsibilities',
        'Set success criteria'
      ],
      steps: [
        {
          step: 1,
          title: 'Planning and Preparation',
          description: 'Plan the control implementation',
          tasks: [
            'Define control requirements',
            'Identify stakeholders',
            'Create implementation timeline',
            'Allocate resources'
          ],
          deliverables: ['Implementation plan', 'Resource allocation', 'Timeline'],
          estimatedTime: '1-2 weeks'
        },
        {
          step: 2,
          title: 'Design and Development',
          description: 'Design and develop the control',
          tasks: [
            'Create control design',
            'Develop procedures',
            'Configure systems',
            'Create documentation'
          ],
          deliverables: ['Control design', 'Procedures', 'Configuration'],
          estimatedTime: '2-4 weeks'
        },
        {
          step: 3,
          title: 'Implementation and Deployment',
          description: 'Implement and deploy the control',
          tasks: [
            'Deploy control measures',
            'Configure monitoring',
            'Train staff',
            'Test implementation'
          ],
          deliverables: ['Deployed control', 'Monitoring setup', 'Training materials'],
          estimatedTime: '1-3 weeks'
        },
        {
          step: 4,
          title: 'Testing and Validation',
          description: 'Test and validate the control',
          tasks: [
            'Execute test procedures',
            'Validate effectiveness',
            'Document results',
            'Address issues'
          ],
          deliverables: ['Test results', 'Validation report', 'Issue log'],
          estimatedTime: '1-2 weeks'
        }
      ],
      considerations: [
        'Integration with existing controls',
        'Impact on operations',
        'Resource requirements',
        'Training needs',
        'Maintenance requirements'
      ],
      bestPractices: [
        'Follow industry standards',
        'Document all changes',
        'Regular testing and review',
        'Continuous improvement',
        'Staff training and awareness'
      ],
      commonPitfalls: [
        'Insufficient planning',
        'Inadequate resources',
        'Poor documentation',
        'Lack of testing',
        'Insufficient training'
      ]
    };

    this.implementationGuides.set(controlId, guide);
  }

  private async createTestProcedures(controlId: string, control: any): Promise<void> {
    const procedures = {
      controlId,
      testPlan: `Test plan for ${control.name}`,
      testTypes: [
        {
          type: 'unit',
          description: 'Unit testing of control components',
          frequency: 'Monthly',
          automated: true
        },
        {
          type: 'integration',
          description: 'Integration testing with related controls',
          frequency: 'Quarterly',
          automated: false
        },
        {
          type: 'security',
          description: 'Security effectiveness testing',
          frequency: 'Semi-annually',
          automated: false
        },
        {
          type: 'compliance',
          description: 'Compliance validation testing',
          frequency: 'Annually',
          automated: false
        }
      ],
      testCases: [
        {
          id: 'TC001',
          title: 'Control Functionality Test',
          description: 'Verify control functions as designed',
          preconditions: ['Control implemented', 'Test environment ready'],
          steps: [
            'Execute control function',
            'Verify expected output',
            'Check error handling',
            'Validate performance'
          ],
          expectedResults: [
            'Control executes successfully',
            'Output meets requirements',
            'Errors handled properly',
            'Performance within limits'
          ],
          testType: 'unit',
          automated: true
        },
        {
          id: 'TC002',
          title: 'Control Effectiveness Test',
          description: 'Verify control effectiveness against threats',
          preconditions: ['Control operational', 'Test scenarios defined'],
          steps: [
            'Simulate threat scenario',
            'Execute control response',
            'Measure effectiveness',
            'Document results'
          ],
          expectedResults: [
            'Threat detected/blocked',
            'Response appropriate',
            'Effectiveness meets criteria',
            'Results documented'
          ],
          testType: 'security',
          automated: false
        }
      ],
      successCriteria: [
        'All test cases pass',
        'Control meets requirements',
        'Effectiveness validated',
        'Documentation complete'
      ],
      reporting: {
        format: 'Standard test report template',
        distribution: ['Control owner', 'Security team', 'Compliance team'],
        retention: '3 years',
        escalation: 'Failures reported within 24 hours'
      }
    };

    this.testProcedures.set(controlId, procedures);
  }

  private async createEvidenceTemplate(controlId: string, control: any): Promise<void> {
    const template = {
      controlId,
      templateName: `Evidence Collection Template - ${control.name}`,
      description: 'Template for collecting and documenting control evidence',
      evidenceTypes: [
        {
          type: 'policies',
          description: 'Policy documents and procedures',
          required: true,
          format: 'PDF',
          retention: '3 years'
        },
        {
          type: 'configurations',
          description: 'System configurations and settings',
          required: true,
          format: 'JSON/YAML',
          retention: '1 year'
        },
        {
          type: 'logs',
          description: 'Operational and audit logs',
          required: true,
          format: 'CSV/JSON',
          retention: '2555 days'
        },
        {
          type: 'screenshots',
          description: 'System screenshots and demonstrations',
          required: false,
          format: 'PNG',
          retention: '1 year'
        },
        {
          type: 'test_results',
          description: 'Test execution results and reports',
          required: true,
          format: 'PDF',
          retention: '3 years'
        }
      ],
      collectionProcedures: [
        {
          evidenceType: 'policies',
          procedure: 'Collect current policy documents with version numbers',
          frequency: 'Quarterly',
          responsible: 'Policy owner'
        },
        {
          evidenceType: 'configurations',
          procedure: 'Export system configurations and validate',
          frequency: 'Monthly',
          responsible: 'System administrator'
        },
        {
          evidenceType: 'logs',
          procedure: 'Collect audit logs for the review period',
          frequency: 'Continuous',
          responsible: 'Security team'
        }
      ],
      validationChecklist: [
        'Evidence is complete and accurate',
        'Evidence meets requirements',
        'Evidence is properly formatted',
        'Evidence is timestamped',
        'Evidence is stored securely'
      ],
      metadata: {
        controlId,
        controlName: control.name,
        framework: control.framework,
        category: control.category,
        collector: 'To be filled',
        collectionDate: 'To be filled',
        reviewDate: 'To be filled',
        approvalStatus: 'Pending'
      }
    };

    this.evidenceTemplates.set(controlId, template);
  }

  private loadControlFamilies(): void {
    // Load default control families
    const defaultFamilies = [
      {
        id: 'access_management',
        name: 'Access Management',
        description: 'Controls for managing user access and permissions',
        objectives: [
          'Ensure proper access controls',
          'Manage user identities',
          'Control privileged access',
          'Monitor access activities'
        ]
      },
      {
        id: 'data_protection',
        name: 'Data Protection',
        description: 'Controls for protecting sensitive data',
        objectives: [
          'Protect data at rest',
          'Protect data in transit',
          'Classify sensitive data',
          'Manage data lifecycle'
        ]
      },
      {
        id: 'network_security',
        name: 'Network Security',
        description: 'Controls for securing network infrastructure',
        objectives: [
          'Secure network perimeter',
          'Monitor network traffic',
          'Control network access',
          'Protect against network attacks'
        ]
      },
      {
        id: 'application_security',
        name: 'Application Security',
        description: 'Controls for securing applications and software',
        objectives: [
          'Secure development practices',
          'Application testing',
          'Vulnerability management',
          'Runtime protection'
        ]
      },
      {
        id: 'infrastructure_security',
        name: 'Infrastructure Security',
        description: 'Controls for securing IT infrastructure',
        objectives: [
          'Secure systems and servers',
          'Manage configurations',
          'Monitor infrastructure',
          'Backup and recovery'
        ]
      },
      {
        id: 'compliance_management',
        name: 'Compliance Management',
        description: 'Controls for managing regulatory compliance',
        objectives: [
          'Maintain compliance',
          'Manage audits',
          'Document controls',
          'Report on compliance'
        ]
      }
    ];

    defaultFamilies.forEach(family => {
      this.controlFamilies.set(family.id, family);
    });
  }

  private loadSecurityControls(): void {
    // Load default security controls
    const defaultControls = [
      {
        id: 'AC-001',
        name: 'Access Control Policy',
        description: 'Formal access control policy established and communicated',
        category: 'access' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001'] as const,
        risk: {
          level: 'high' as const,
          likelihood: 'medium' as const,
          impact: 'high' as const,
          mitigation: ['Policy development', 'Communication', 'Training']
        }
      },
      {
        id: 'AC-002',
        name: 'User Access Management',
        description: 'Formal user access management process implemented',
        category: 'access' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001', 'GDPR'] as const,
        risk: {
          level: 'critical' as const,
          likelihood: 'medium' as const,
          impact: 'critical' as const,
          mitigation: ['Access reviews', 'Least privilege', 'Automated provisioning']
        }
      },
      {
        id: 'DP-001',
        name: 'Data Encryption',
        description: 'Sensitive data encrypted at rest and in transit',
        category: 'data' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001', 'GDPR', 'PCI'] as const,
        risk: {
          level: 'critical' as const,
          likelihood: 'medium' as const,
          impact: 'critical' as const,
          mitigation: ['Encryption standards', 'Key management', 'Certificate management']
        }
      },
      {
        id: 'NS-001',
        name: 'Network Security Monitoring',
        description: 'Network security monitoring and intrusion detection',
        category: 'network' as const,
        type: 'detective' as const,
        framework: ['SOC2', 'ISO27001'] as const,
        risk: {
          level: 'high' as const,
          likelihood: 'high' as const,
          impact: 'medium' as const,
          mitigation: ['IDS/IPS', 'SIEM', 'Network monitoring']
        }
      },
      {
        id: 'AS-001',
        name: 'Secure Development',
        description: 'Secure software development lifecycle implemented',
        category: 'application' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001'] as const,
        risk: {
          level: 'medium' as const,
          likelihood: 'medium' as const,
          impact: 'high' as const,
          mitigation: ['Secure coding', 'Code review', 'Security testing']
        }
      },
      {
        id: 'IS-001',
        name: 'System Hardening',
        description: 'Systems hardened according to security standards',
        category: 'infrastructure' as const,
        type: 'preventive' as const,
        framework: ['SOC2', 'ISO27001'] as const,
        risk: {
          level: 'medium' as const,
          likelihood: 'medium' as const,
          impact: 'medium' as const,
          mitigation: ['Baseline configurations', 'Patch management', 'Security baselines']
        }
      },
      {
        id: 'CM-001',
        name: 'Compliance Monitoring',
        description: 'Regular compliance monitoring and reporting',
        category: 'compliance' as const,
        type: 'detective' as const,
        framework: ['SOC2', 'ISO27001', 'GDPR'] as const,
        risk: {
          level: 'medium' as const,
          likelihood: 'low' as const,
          impact: 'high' as const,
          mitigation: ['Compliance checks', 'Reporting', 'Audits']
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

  private loadImplementationGuides(): void {
    // Implementation guides are created dynamically for each control
  }

  private loadTestProcedures(): void {
    // Test procedures are created dynamically for each control
  }

  private loadEvidenceTemplates(): void {
    // Evidence templates are created dynamically for each control
  }

  private generateControlId(): string {
    return `CTRL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateCatalogConfig(): string {
    return `
# Security Controls Catalog Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE security_controls_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  type text NOT NULL,
  framework text[],
  risk_level text NOT NULL,
  family_id text REFERENCES control_families(id),
  implementation_status text DEFAULT 'not_implemented',
  owner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE control_implementation_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text REFERENCES security_controls_catalog(control_id),
  guide_content jsonb NOT NULL,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE control_test_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text REFERENCES security_controls_catalog(control_id),
  procedure_content jsonb NOT NULL,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

# Controls catalog service
class ControlsCatalogService {
  constructor() {
    this.controls = new Map();
    this.families = new Map();
    this.guides = new Map();
    this.procedures = new Map();
    this.loadControls();
  }
  
  async getControls(filters = {}) {
    let controls = Array.from(this.controls.values());
    
    if (filters.framework) {
      controls = controls.filter(c => c.framework.includes(filters.framework));
    }
    
    if (filters.category) {
      controls = controls.filter(c => c.category === filters.category);
    }
    
    if (filters.riskLevel) {
      controls = controls.filter(c => c.risk.level === filters.riskLevel);
    }
    
    return controls;
  }
  
  async getControlImplementationPlan(controlId) {
    const control = this.controls.get(controlId);
    const guide = this.guides.get(controlId);
    
    return {
      control,
      implementationGuide: guide,
      estimatedDuration: this.calculateImplementationDuration(control),
      requiredResources: this.getRequiredResources(control),
      dependencies: this.getDependencies(control),
      risks: this.getImplementationRisks(control)
    };
  }
  
  async generateComplianceMatrix(framework) {
    const controls = await this.getControls({ framework });
    
    return controls.map(control => ({
      controlId: control.id,
      controlName: control.name,
      category: control.category,
      riskLevel: control.risk.level,
      implementationStatus: control.implementation.status,
      lastTested: control.implementation.lastTested,
      nextReview: control.implementation.nextReview
    }));
  }
}
`;
  }

  private generateFamiliesConfig(): string {
    return `
# Control Families Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE control_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  objectives text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE family_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id text REFERENCES control_families(family_id),
  framework text NOT NULL,
  external_reference text,
  mapping_details jsonb,
  created_at timestamptz DEFAULT now()
);

# Control families service
class ControlFamiliesService {
  constructor() {
    this.families = new Map();
    this.loadFamilies();
  }
  
  async getFamily(familyId) {
    return this.families.get(familyId);
  }
  
  async getControlsByFamily(familyId) {
    const family = await this.getFamily(familyId);
    if (!family) return [];
    
    return Array.from(this.controls.values())
      .filter(control => control.familyId === familyId);
  }
  
  async getFamilyComplianceStatus(familyId) {
    const controls = await this.getControlsByFamily(familyId);
    
    const total = controls.length;
    const implemented = controls.filter(c => 
      ['implemented', 'tested', 'validated'].includes(c.implementation.status)
    ).length;
    
    return {
      familyId,
      totalControls: total,
      implementedControls: implemented,
      compliancePercentage: total > 0 ? Math.round((implemented / total) * 100) : 0,
      controls: controls.map(c => ({
        id: c.id,
        name: c.name,
        status: c.implementation.status
      }))
    };
  }
}
`;
  }

  private generateGuidesConfig(): string {
    return `
# Implementation Guides Configuration
# Generated on ${new Date().toISOString()}

# Implementation guides service
class ImplementationGuidesService {
  constructor() {
    this.guides = new Map();
    this.templates = new Map();
    this.loadGuides();
  }
  
  async getGuide(controlId) {
    return this.guides.get(controlId);
  }
  
  async generateImplementationPlan(controlId, options = {}) {
    const guide = await this.getGuide(controlId);
    const control = await this.getControl(controlId);
    
    return {
      controlId,
      controlName: control.name,
      overview: guide.overview,
      phases: guide.steps.map(step => ({
        ...step,
        estimatedCost: this.calculatePhaseCost(step),
        requiredResources: this.getPhaseResources(step),
        deliverables: step.deliverables
      })),
      totalEstimatedCost: this.calculateTotalCost(guide),
      totalEstimatedDuration: this.calculateTotalDuration(guide),
      risks: this.identifyRisks(control, guide),
      mitigationStrategies: this.getMitchStrategies(control, guide)
    };
  }
  
  async customizeGuide(controlId, customizations) {
    const guide = await this.getGuide(controlId);
    
    return {
      ...guide,
      ...customizations,
      customizedAt: new Date(),
      customizedBy: customizations.customizedBy
    };
  }
}
`;
  }

  private generateTestingConfig(): string {
    return `
# Test Procedures Configuration
# Generated on ${new Date().toISOString()}

# Test procedures service
class TestProceduresService {
  constructor() {
    this.procedures = new Map();
    this.testResults = new Map();
    this.loadProcedures();
  }
  
  async getProcedures(controlId) {
    return this.procedures.get(controlId);
  }
  
  async executeTest(controlId, testType, parameters = {}) {
    const procedures = await this.getProcedures(controlId);
    const testProcedure = procedures.testCases.find(tc => tc.testType === testType);
    
    if (!testProcedure) {
      throw new Error('Test procedure not found');
    }
    
    const result = await this.runTest(testProcedure, parameters);
    
    // Store test result
    const testResult = {
      id: this.generateTestId(),
      controlId,
      testType,
      status: result.success ? 'passed' : 'failed',
      executedAt: new Date(),
      duration: result.duration,
      details: result.details
    };
    
    this.testResults.set(testResult.id, testResult);
    
    return testResult;
  }
  
  async generateTestSchedule(controlId, frequency) {
    const procedures = await this.getProcedures(controlId);
    
    return {
      controlId,
      schedule: procedures.testTypes.map(testType => ({
        testType: testType.type,
        frequency: frequency[testType.type] || testType.frequency,
        nextRun: this.calculateNextRun(testType.frequency),
        automated: testType.automated
      }))
    };
  }
  
  async generateTestReport(controlId, startDate, endDate) {
    const results = Array.from(this.testResults.values())
      .filter(r => r.controlId === controlId && 
                   r.executedAt >= startDate && 
                   r.executedAt <= endDate);
    
    return {
      controlId,
      period: { startDate, endDate },
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length
      },
      results: results.map(r => ({
        testId: r.id,
        testType: r.testType,
        status: r.status,
        executedAt: r.executedAt,
        duration: r.duration
      })),
      recommendations: this.generateTestRecommendations(results)
    };
  }
}
`;
  }
}

// Export singleton instance
export const controlsCatalog = new ControlsCatalogManager();

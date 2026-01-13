/**
 * Main Compliance and Governance Layer Class
 * 
 * Comprehensive compliance and governance framework for enterprise operations
 * including regulatory compliance, policy management, audit trails, and governance controls.
 */

import { ComplianceGovernanceConfig, ComplianceGovernanceMetrics, RegulatoryCompliance, PolicyManagement, AuditTrail, GovernanceControls } from './types.js';
import { regulatoryCompliance } from './regulatory-compliance.js';
import { policyManagement } from './policy-management.js';
import { auditTrail } from './audit-trail.js';
import { governanceControls } from './governance-controls.js';

export class ComplianceGovernanceLayer {
  private config: ComplianceGovernanceConfig;
  private initialized = false;

  constructor(config: Partial<ComplianceGovernanceConfig> = {}) {
    this.config = {
      compliance: {
        enabled: true,
        frameworks: true,
        assessments: true,
        reporting: true,
        monitoring: true,
        ...config.compliance
      },
      policy: {
        enabled: true,
        management: true,
        enforcement: true,
        reviews: true,
        documentation: true,
        ...config.policy
      },
      audit: {
        enabled: true,
        logging: true,
        trails: true,
        reporting: true,
        archiving: true,
        ...config.audit
      },
      governance: {
        enabled: true,
        controls: true,
        risk: true,
        oversight: true,
        compliance: true,
        ...config.governance
      }
    };
  }

  /**
   * Initialize the compliance and governance layer
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all compliance and governance components
      await regulatoryCompliance.initialize(this.config.compliance);
      await policyManagement.initialize(this.config.policy);
      await auditTrail.initialize(this.config.audit);
      await governanceControls.initialize(this.config.governance);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize compliance and governance layer:', error);
      throw error;
    }
  }

  /**
   * Setup regulatory compliance
   */
  async setupRegulatoryCompliance(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Regulatory compliance not enabled');
    }

    try {
      await regulatoryCompliance.setupFrameworks();
      await regulatoryCompliance.setupAssessments();
      await regulatoryCompliance.setupReporting();
      await regulatoryCompliance.setupMonitoring();
    } catch (error) {
      console.error('Failed to setup regulatory compliance:', error);
      throw error;
    }
  }

  /**
   * Setup policy management
   */
  async setupPolicyManagement(): Promise<void> {
    if (!this.config.policy.enabled) {
      throw new Error('Policy management not enabled');
    }

    try {
      await policyManagement.setupManagement();
      await policyManagement.setupEnforcement();
      await policyManagement.setupReviews();
      await policyManagement.setupDocumentation();
    } catch (error) {
      console.error('Failed to setup policy management:', error);
      throw error;
    }
  }

  /**
   * Setup audit trails
   */
  async setupAuditTrails(): Promise<void> {
    if (!this.config.audit.enabled) {
      throw new Error('Audit trails not enabled');
    }

    try {
      await auditTrail.setupLogging();
      await auditTrail.setupTrails();
      await auditTrail.setupReporting();
      await auditTrail.setupArchiving();
    } catch (error) {
      console.error('Failed to setup audit trails:', error);
      throw error;
    }
  }

  /**
   * Setup governance controls
   */
  async setupGovernanceControls(): Promise<void> {
    if (!this.config.governance.enabled) {
      throw new Error('Governance controls not enabled');
    }

    try {
      await governanceControls.setupControls();
      await governanceControls.setupRisk();
      await governanceControls.setupOversight();
      await governanceControls.setupCompliance();
    } catch (error) {
      console.error('Failed to setup governance controls:', error);
      throw error;
    }
  }

  /**
   * Get regulatory compliance data
   */
  async getRegulatoryCompliance(): Promise<RegulatoryCompliance> {
    try {
      return await regulatoryCompliance.getRegulatoryCompliance();
    } catch (error) {
      console.error('Failed to get regulatory compliance:', error);
      throw error;
    }
  }

  /**
   * Get policy management data
   */
  async getPolicyManagement(): Promise<PolicyManagement> {
    try {
      return await policyManagement.getPolicyManagement();
    } catch (error) {
      console.error('Failed to get policy management:', error);
      throw error;
    }
  }

  /**
   * Get audit trail data
   */
  async getAuditTrail(): Promise<AuditTrail> {
    try {
      return await auditTrail.getAuditTrail();
    } catch (error) {
      console.error('Failed to get audit trail:', error);
      throw error;
    }
  }

  /**
   * Get governance controls data
   */
  async getGovernanceControls(): Promise<GovernanceControls> {
    try {
      return await governanceControls.getGovernanceControls();
    } catch (error) {
      console.error('Failed to get governance controls:', error);
      throw error;
    }
  }

  /**
   * Create compliance assessment
   */
  async createComplianceAssessment(assessment: any): Promise<any> {
    try {
      return await regulatoryCompliance.createAssessment(assessment);
    } catch (error) {
      console.error('Failed to create compliance assessment:', error);
      throw error;
    }
  }

  /**
   * Create policy
   */
  async createPolicy(policy: any): Promise<any> {
    try {
      return await policyManagement.createPolicy(policy);
    } catch (error) {
      console.error('Failed to create policy:', error);
      throw error;
    }
  }

  /**
   * Create audit log
   */
  async createAuditLog(log: any): Promise<any> {
    try {
      return await auditTrail.createAuditLog(log);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  /**
   * Create governance control
   */
  async createGovernanceControl(control: any): Promise<any> {
    try {
      return await governanceControls.createControl(control);
    } catch (error) {
      console.error('Failed to create governance control:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive compliance and governance report
   */
  async generateComplianceGovernanceReport(period: string): Promise<{
    summary: any;
    compliance: any;
    policy: any;
    audit: any;
    governance: any;
    insights: any[];
  }> {
    try {
      const metrics = await this.getMetrics();
      const regulatoryCompliance = await this.getRegulatoryCompliance();
      const policyManagement = await this.getPolicyManagement();
      const auditTrail = await this.getAuditTrail();
      const governanceControls = await this.getGovernanceControls();

      return {
        summary: {
          overallComplianceScore: metrics.overall.complianceScore,
          riskLevel: metrics.overall.riskLevel,
          governanceMaturity: metrics.overall.governanceMaturity,
          auditCoverage: metrics.overall.auditCoverage,
          period
        },
        compliance: {
          frameworksImplemented: metrics.compliance.frameworksImplemented,
          assessmentsCompleted: metrics.compliance.assessmentsCompleted,
          complianceScore: metrics.compliance.complianceScore,
          violationsDetected: metrics.compliance.violationsDetected,
          remediationRate: metrics.compliance.remediationRate,
          frameworks: regulatoryCompliance.frameworks.length,
          activeAssessments: regulatoryCompliance.assessments.filter(a => a.status === 'in_progress').length
        },
        policy: {
          policiesActive: metrics.policy.policiesActive,
          enforcementRate: metrics.policy.enforcementRate,
          reviewCompliance: metrics.policy.reviewCompliance,
          documentationCoverage: metrics.policy.documentationCoverage,
          policyViolations: metrics.policy.policyViolations,
          totalPolicies: policyManagement.policies.length,
          activeEnforcements: policyManagement.enforcement[0].mechanisms.length
        },
        audit: {
          auditEvents: metrics.audit.auditEvents,
          trailsMaintained: metrics.audit.trailsMaintained,
          reportsGenerated: metrics.audit.reportsGenerated,
          archiveRetention: metrics.audit.archiveRetention,
          auditCoverage: metrics.audit.auditCoverage,
          totalLogs: auditTrail.logs.length,
          activeAlerts: auditTrail.monitoring[0].alerts.filter(a => !a.acknowledged).length
        },
        governance: {
          controlsImplemented: metrics.governance.controlsImplemented,
          riskAssessments: metrics.governance.riskAssessments,
          oversightActivities: metrics.governance.oversightActivities,
          governanceScore: metrics.governance.governanceScore,
          complianceAdherence: metrics.governance.complianceAdherence,
          totalControls: governanceControls.framework[0].structure[0].committees.length,
          activeOversight: governanceControls.oversight[0].structures[0].committees.length
        },
        insights: [
          {
            type: 'compliance',
            title: 'Compliance Performance',
            description: `Regulatory compliance showing ${metrics.compliance.complianceScore}% compliance score with ${metrics.compliance.violationsDetected} violations detected`,
            impact: 'positive',
            recommendation: 'Continue current compliance practices and focus on high-risk areas'
          },
          {
            type: 'policy',
            title: 'Policy Management Effectiveness',
            description: `Policy management achieving ${metrics.policy.enforcementRate}% enforcement rate with ${metrics.policy.policiesActive} active policies`,
            impact: 'positive',
            recommendation: 'Enhance policy automation and monitoring capabilities'
          },
          {
            type: 'governance',
            title: 'Governance Maturity',
            description: `Governance framework showing ${metrics.governance.governanceScore}% maturity score with ${metrics.governance.controlsImplemented} controls implemented`,
            impact: 'positive',
            recommendation: 'Focus on continuous improvement and risk management enhancement'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate compliance and governance report:', error);
      throw error;
    }
  }

  /**
   * Get compliance and governance metrics
   */
  async getMetrics(): Promise<ComplianceGovernanceMetrics> {
    try {
      const complianceMetrics = await regulatoryCompliance.getMetrics();
      const policyMetrics = await policyManagement.getMetrics();
      const auditMetrics = await auditTrail.getMetrics();
      const governanceMetrics = await governanceControls.getMetrics();

      return {
        compliance: complianceMetrics,
        policy: policyMetrics,
        audit: auditMetrics,
        governance: governanceMetrics,
        overall: {
          complianceScore: Math.floor((complianceMetrics.complianceScore + policyMetrics.enforcementRate + governanceMetrics.complianceAdherence) / 3),
          riskLevel: Math.floor((complianceMetrics.violationsDetected + policyMetrics.policyViolations) / 2),
          governanceMaturity: Math.floor((governanceMetrics.governanceScore + policyMetrics.reviewCompliance) / 2),
          auditCoverage: Math.floor((auditMetrics.auditCoverage + complianceMetrics.remediationRate) / 2)
        }
      };
    } catch (error) {
      console.error('Failed to get compliance and governance metrics:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): ComplianceGovernanceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ComplianceGovernanceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    compliance: boolean;
    policy: boolean;
    audit: boolean;
    governance: boolean;
  }> {
    try {
      const compliance = this.config.compliance.enabled ? await regulatoryCompliance.getHealthStatus() : true;
      const policy = this.config.policy.enabled ? await policyManagement.getHealthStatus() : true;
      const audit = this.config.audit.enabled ? await auditTrail.getHealthStatus() : true;
      const governance = this.config.governance.enabled ? await governanceControls.getHealthStatus() : true;

      return {
        overall: this.initialized && compliance && policy && audit && governance,
        compliance,
        policy,
        audit,
        governance
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        compliance: false,
        policy: false,
        audit: false,
        governance: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await regulatoryCompliance.cleanup();
    await policyManagement.cleanup();
    await auditTrail.cleanup();
    await governanceControls.cleanup();
  }
}

// Export default instance
export const complianceGovernanceLayer = new ComplianceGovernanceLayer();

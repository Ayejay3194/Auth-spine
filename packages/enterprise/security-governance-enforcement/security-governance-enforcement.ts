/**
 * Main Security Governance Enforcement Class
 * 
 * Comprehensive security governance framework with automated enforcement,
 * AI-powered monitoring, risk management, and compliance controls.
 */

import { GovernanceEnforcementConfig, GovernanceMetrics, GovernancePolicy, RiskAssessment } from './types.js';
import { governanceControls } from './governance-controls.js';
import { automatedEnforcement } from './automated-enforcement.js';
import { riskManagement } from './risk-management.js';
import { aiMonitoring } from './ai-monitoring.js';

export class SecurityGovernanceEnforcement {
  private config: GovernanceEnforcementConfig;
  private initialized = false;

  constructor(config: Partial<GovernanceEnforcementConfig> = {}) {
    this.config = {
      governance: {
        enabled: true,
        policyEnforcement: true,
        complianceControls: true,
        auditAutomation: true,
        reporting: true,
        ...config.governance
      },
      enforcement: {
        enabled: true,
        automatedControls: true,
        realTimeMonitoring: true,
        violationDetection: true,
        remediationAutomation: true,
        ...config.enforcement
      },
      risk: {
        enabled: true,
        riskAssessment: true,
        threatModeling: true,
        vulnerabilityManagement: true,
        riskMitigation: true,
        ...config.risk
      },
      ai: {
        enabled: true,
        anomalyDetection: true,
        predictiveAnalysis: true,
        threatIntelligence: true,
        automatedResponse: true,
        ...config.ai
      }
    };
  }

  /**
   * Initialize the security governance enforcement framework
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all governance components
      await governanceControls.initialize(this.config.governance);
      await automatedEnforcement.initialize(this.config.enforcement);
      await riskManagement.initialize(this.config.risk);
      await aiMonitoring.initialize(this.config.ai);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize security governance enforcement:', error);
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
      await governanceControls.setupPolicyEnforcement();
      await governanceControls.setupComplianceControls();
      await governanceControls.setupAuditAutomation();
      await governanceControls.setupReporting();
    } catch (error) {
      console.error('Failed to setup governance controls:', error);
      throw error;
    }
  }

  /**
   * Setup automated enforcement
   */
  async setupAutomatedEnforcement(): Promise<void> {
    if (!this.config.enforcement.enabled) {
      throw new Error('Automated enforcement not enabled');
    }

    try {
      await automatedEnforcement.setupAutomatedControls();
      await automatedEnforcement.setupRealTimeMonitoring();
      await automatedEnforcement.setupViolationDetection();
      await automatedEnforcement.setupRemediationAutomation();
    } catch (error) {
      console.error('Failed to setup automated enforcement:', error);
      throw error;
    }
  }

  /**
   * Setup risk management
   */
  async setupRiskManagement(): Promise<void> {
    if (!this.config.risk.enabled) {
      throw new Error('Risk management not enabled');
    }

    try {
      await riskManagement.setupRiskAssessment();
      await riskManagement.setupThreatModeling();
      await riskManagement.setupVulnerabilityManagement();
      await riskManagement.setupRiskMitigation();
    } catch (error) {
      console.error('Failed to setup risk management:', error);
      throw error;
    }
  }

  /**
   * Setup AI monitoring
   */
  async setupAIMonitoring(): Promise<void> {
    if (!this.config.ai.enabled) {
      throw new Error('AI monitoring not enabled');
    }

    try {
      await aiMonitoring.setupAnomalyDetection();
      await aiMonitoring.setupPredictiveAnalysis();
      await aiMonitoring.setupThreatIntelligence();
      await aiMonitoring.setupAutomatedResponse();
    } catch (error) {
      console.error('Failed to setup AI monitoring:', error);
      throw error;
    }
  }

  /**
   * Create governance policy
   */
  async createPolicy(policy: Omit<GovernancePolicy, 'id' | 'lastUpdated'>): Promise<GovernancePolicy> {
    try {
      return await governanceControls.createPolicy(policy);
    } catch (error) {
      console.error('Failed to create governance policy:', error);
      throw error;
    }
  }

  /**
   * Run risk assessment
   */
  async runRiskAssessment(type: 'strategic' | 'operational' | 'tactical'): Promise<RiskAssessment> {
    try {
      return await riskManagement.runAssessment(type);
    } catch (error) {
      console.error('Failed to run risk assessment:', error);
      throw error;
    }
  }

  /**
   * Get governance metrics
   */
  async getMetrics(): Promise<GovernanceMetrics> {
    try {
      const governanceMetrics = await governanceControls.getMetrics();
      const enforcementMetrics = await automatedEnforcement.getMetrics();
      const riskMetrics = await riskManagement.getMetrics();
      const aiMetrics = await aiMonitoring.getMetrics();

      return {
        governance: governanceMetrics,
        enforcement: enforcementMetrics,
        risk: riskMetrics,
        ai: aiMetrics,
        overall: {
          complianceScore: Math.floor((governanceMetrics.complianceControls + enforcementMetrics.violationsDetected) / 2),
          riskScore: riskMetrics.riskScore,
          enforcementRate: Math.floor((enforcementMetrics.automatedControls + enforcementMetrics.remediationsAutomated) / 2),
          governanceMaturity: Math.floor((governanceMetrics.policiesEnforced + governanceMetrics.auditAutomations) / 2)
        }
      };
    } catch (error) {
      console.error('Failed to get governance metrics:', error);
      throw error;
    }
  }

  /**
   * Generate governance report
   */
  async generateReport(type: 'compliance' | 'risk' | 'enforcement' | 'comprehensive'): Promise<{
    summary: any;
    governance: any;
    enforcement: any;
    risk: any;
    ai: any;
    recommendations: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          overallCompliance: metrics.overall.complianceScore,
          riskLevel: metrics.overall.riskScore,
          enforcementRate: metrics.overall.enforcementRate,
          governanceMaturity: metrics.overall.governanceMaturity
        },
        governance: {
          policiesEnforced: metrics.governance.policiesEnforced,
          complianceControls: metrics.governance.complianceControls,
          auditAutomations: metrics.governance.auditAutomations,
          reportsGenerated: metrics.governance.reportsGenerated
        },
        enforcement: {
          automatedControls: metrics.enforcement.automatedControls,
          violationsDetected: metrics.enforcement.violationsDetected,
          remediationsAutomated: metrics.enforcement.remediationsAutomated,
          enforcementActions: metrics.enforcement.enforcementActions
        },
        risk: {
          riskAssessments: metrics.risk.riskAssessments,
          threatsIdentified: metrics.risk.threatsIdentified,
          vulnerabilitiesManaged: metrics.risk.vulnerabilitiesManaged,
          riskScore: metrics.risk.riskScore
        },
        ai: {
          anomaliesDetected: metrics.ai.anomaliesDetected,
          predictionsMade: metrics.ai.predictionsMade,
          threatsIntelligent: metrics.ai.threatsIntelligent,
          accuracy: metrics.ai.accuracy
        },
        recommendations: [
          {
            priority: 'high',
            description: 'Enhance automated policy enforcement'
          },
          {
            priority: 'medium',
            description: 'Improve AI threat detection accuracy'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate governance report:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): GovernanceEnforcementConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<GovernanceEnforcementConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    governance: boolean;
    enforcement: boolean;
    risk: boolean;
    ai: boolean;
  }> {
    try {
      const governance = this.config.governance.enabled ? await governanceControls.getHealthStatus() : true;
      const enforcement = this.config.enforcement.enabled ? await automatedEnforcement.getHealthStatus() : true;
      const risk = this.config.risk.enabled ? await riskManagement.getHealthStatus() : true;
      const ai = this.config.ai.enabled ? await aiMonitoring.getHealthStatus() : true;

      return {
        overall: this.initialized && governance && enforcement && risk && ai,
        governance,
        enforcement,
        risk,
        ai
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        governance: false,
        enforcement: false,
        risk: false,
        ai: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await governanceControls.cleanup();
    await automatedEnforcement.cleanup();
    await riskManagement.cleanup();
    await aiMonitoring.cleanup();
  }
}

// Export default instance
export const securityGovernanceEnforcement = new SecurityGovernanceEnforcement();

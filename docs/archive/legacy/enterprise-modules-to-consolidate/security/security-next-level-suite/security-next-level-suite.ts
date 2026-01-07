/**
 * Main Security Next Level Suite Class
 * 
 * Advanced security framework with next-generation compliance,
 * automated enforcement, and comprehensive dashboard capabilities.
 */

import { SecurityNextLevelConfig, SecurityNextLevelMetrics, AdvancedComplianceFramework, SecurityDashboard } from './types.js';
import { nextLevelCompliance } from './next-level-compliance.js';
import { automatedEnforcement } from './automated-enforcement.js';
import { securityDashboard } from './security-dashboard.js';

export class SecurityNextLevelSuite {
  private config: SecurityNextLevelConfig;
  private initialized = false;

  constructor(config: Partial<SecurityNextLevelConfig> = {}) {
    this.config = {
      compliance: {
        enabled: true,
        advancedFrameworks: true,
        continuousMonitoring: true,
        predictiveCompliance: true,
        automatedAuditing: true,
        ...config.compliance
      },
      enforcement: {
        enabled: true,
        intelligentControls: true,
        adaptivePolicies: true,
        realTimeResponse: true,
        automatedRemediation: true,
        ...config.enforcement
      },
      dashboard: {
        enabled: true,
        realTimeMetrics: true,
        threatVisualization: true,
        complianceReporting: true,
        executiveInsights: true,
        ...config.dashboard
      }
    };
  }

  /**
   * Initialize the security next level suite
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all next level components
      await nextLevelCompliance.initialize(this.config.compliance);
      await automatedEnforcement.initialize(this.config.enforcement);
      await securityDashboard.initialize(this.config.dashboard);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize security next level suite:', error);
      throw error;
    }
  }

  /**
   * Setup next level compliance
   */
  async setupNextLevelCompliance(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Next level compliance not enabled');
    }

    try {
      await nextLevelCompliance.setupAdvancedFrameworks();
      await nextLevelCompliance.setupContinuousMonitoring();
      await nextLevelCompliance.setupPredictiveCompliance();
      await nextLevelCompliance.setupAutomatedAuditing();
    } catch (error) {
      console.error('Failed to setup next level compliance:', error);
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
      await automatedEnforcement.setupIntelligentControls();
      await automatedEnforcement.setupAdaptivePolicies();
      await automatedEnforcement.setupRealTimeResponse();
      await automatedEnforcement.setupAutomatedRemediation();
    } catch (error) {
      console.error('Failed to setup automated enforcement:', error);
      throw error;
    }
  }

  /**
   * Setup security dashboard
   */
  async setupSecurityDashboard(): Promise<void> {
    if (!this.config.dashboard.enabled) {
      throw new Error('Security dashboard not enabled');
    }

    try {
      await securityDashboard.setupRealTimeMetrics();
      await securityDashboard.setupThreatVisualization();
      await securityDashboard.setupComplianceReporting();
      await securityDashboard.setupExecutiveInsights();
    } catch (error) {
      console.error('Failed to setup security dashboard:', error);
      throw error;
    }
  }

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(): Promise<AdvancedComplianceFramework[]> {
    try {
      return await nextLevelCompliance.getFrameworks();
    } catch (error) {
      console.error('Failed to get compliance frameworks:', error);
      throw error;
    }
  }

  /**
   * Get security dashboards
   */
  async getSecurityDashboards(): Promise<SecurityDashboard[]> {
    try {
      return await securityDashboard.getDashboards();
    } catch (error) {
      console.error('Failed to get security dashboards:', error);
      throw error;
    }
  }

  /**
   * Get next level metrics
   */
  async getMetrics(): Promise<SecurityNextLevelMetrics> {
    try {
      const complianceMetrics = await nextLevelCompliance.getMetrics();
      const enforcementMetrics = await automatedEnforcement.getMetrics();
      const dashboardMetrics = await securityDashboard.getMetrics();

      return {
        compliance: complianceMetrics,
        enforcement: enforcementMetrics,
        dashboard: dashboardMetrics,
        overall: {
          securityScore: Math.floor((complianceMetrics.complianceScore + enforcementMetrics.enforcementRate + dashboardMetrics.dashboardUsage) / 3),
          complianceRate: complianceMetrics.complianceScore,
          threatPrevention: enforcementMetrics.enforcementRate,
          operationalEfficiency: dashboardMetrics.dashboardUsage
        }
      };
    } catch (error) {
      console.error('Failed to get next level metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(): Promise<{
    summary: any;
    compliance: any;
    enforcement: any;
    dashboard: any;
    insights: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          overallSecurity: metrics.overall.securityScore,
          complianceRate: metrics.overall.complianceRate,
          threatPrevention: metrics.overall.threatPrevention,
          operationalEfficiency: metrics.overall.operationalEfficiency
        },
        compliance: {
          frameworksActive: metrics.compliance.frameworksActive,
          continuousChecks: metrics.compliance.continuousChecks,
          predictionsAccurate: metrics.compliance.predictionsAccurate,
          auditsAutomated: metrics.compliance.auditsAutomated
        },
        enforcement: {
          intelligentControls: metrics.enforcement.intelligentControls,
          adaptivePolicies: metrics.enforcement.adaptivePolicies,
          realTimeResponses: metrics.enforcement.realTimeResponses,
          automatedRemediations: metrics.enforcement.automatedRemediations
        },
        dashboard: {
          realTimeMetrics: metrics.dashboard.realTimeMetrics,
          threatsVisualized: metrics.dashboard.threatsVisualized,
          reportsGenerated: metrics.dashboard.reportsGenerated,
          insightsProvided: metrics.dashboard.insightsProvided
        },
        insights: [
          {
            category: 'Security',
            title: 'Enhanced Threat Detection',
            description: 'AI-powered threat detection showing improved accuracy',
            impact: 'High',
            effort: 'Medium',
            timeline: '30 days',
            owner: 'Security Team'
          },
          {
            category: 'Compliance',
            title: 'Automated Compliance Monitoring',
            description: 'Continuous compliance monitoring reducing manual effort',
            impact: 'Medium',
            effort: 'Low',
            timeline: '15 days',
            owner: 'Compliance Team'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Run advanced assessment
   */
  async runAdvancedAssessment(): Promise<{
    overallScore: number;
    complianceMaturity: number;
    enforcementCapability: number;
    dashboardEffectiveness: number;
    recommendations: any[];
  }> {
    try {
      const complianceScore = await nextLevelCompliance.assess();
      const enforcementScore = await automatedEnforcement.assess();
      const dashboardScore = await securityDashboard.assess();

      const overallScore = Math.floor((complianceScore + enforcementScore + dashboardScore) / 3);

      return {
        overallScore,
        complianceMaturity: complianceScore,
        enforcementCapability: enforcementScore,
        dashboardEffectiveness: dashboardScore,
        recommendations: [
          {
            priority: 'high',
            description: 'Enhance AI-powered threat detection capabilities'
          },
          {
            priority: 'medium',
            description: 'Improve dashboard real-time data integration'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to run advanced assessment:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SecurityNextLevelConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityNextLevelConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    compliance: boolean;
    enforcement: boolean;
    dashboard: boolean;
  }> {
    try {
      const compliance = this.config.compliance.enabled ? await nextLevelCompliance.getHealthStatus() : true;
      const enforcement = this.config.enforcement.enabled ? await automatedEnforcement.getHealthStatus() : true;
      const dashboard = this.config.dashboard.enabled ? await securityDashboard.getHealthStatus() : true;

      return {
        overall: this.initialized && compliance && enforcement && dashboard,
        compliance,
        enforcement,
        dashboard
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        compliance: false,
        enforcement: false,
        dashboard: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await nextLevelCompliance.cleanup();
    await automatedEnforcement.cleanup();
    await securityDashboard.cleanup();
  }
}

// Export default instance
export const securityNextLevelSuite = new SecurityNextLevelSuite();

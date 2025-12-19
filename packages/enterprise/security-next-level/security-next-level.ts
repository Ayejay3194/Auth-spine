/**
 * Main Security Next-Level Suite Class
 * 
 * Turns security from a checklist into an operating system with
 * compliance crosswalks, automated enforcement, and executive dashboards.
 */

import { 
  SecurityOperatingSystem,
  ComplianceFramework,
  EnforcementMode,
  SecurityAlert
} from './types.js';
import { complianceCrosswalks } from './compliance-crosswalks.js';
import { automatedEnforcement } from './automated-enforcement.js';
import { executiveDashboard } from './executive-dashboard.js';

export class SecurityNextLevel {
  private config: any;
  private initialized = false;
  private operatingSystem: SecurityOperatingSystem;

  constructor(config: any = {}) {
    this.config = {
      enableComplianceCrosswalks: true,
      enableAutomatedEnforcement: true,
      enableExecutiveDashboard: true,
      frameworks: ['SOC2', 'ISO27001', 'NIST-CSF', 'PCI-DSS'],
      enforcementMode: 'monitor',
      dashboardRefreshInterval: 300000,
      alertThresholds: {
        critical: 90,
        high: 75,
        medium: 50,
        low: 25
      },
      ...config
    };

    this.operatingSystem = {
      id: 'security-os-v1',
      name: 'Security Operating System',
      version: '1.0.0',
      status: 'active',
      components: {
        complianceCrosswalks: false,
        automatedEnforcement: false,
        executiveDashboard: false
      },
      metrics: {
        overallScore: 0,
        complianceRate: 0,
        riskLevel: 'low',
        incidentCount: 0,
        controlCoverage: 0
      },
      alerts: [],
      lastHealthCheck: new Date()
    };
  }

  /**
   * Initialize the security next-level suite
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.config.enableComplianceCrosswalks) {
        await complianceCrosswalks.initialize();
        this.operatingSystem.components.complianceCrosswalks = true;
      }

      if (this.config.enableAutomatedEnforcement) {
        await automatedEnforcement.initialize();
        this.operatingSystem.components.automatedEnforcement = true;
      }

      if (this.config.enableExecutiveDashboard) {
        await executiveDashboard.initialize();
        this.operatingSystem.components.executiveDashboard = true;
      }

      this.initialized = true;
      this.updateOperatingSystemMetrics();
    } catch (error) {
      console.error('Failed to initialize Security Next-Level Suite:', error);
      throw error;
    }
  }

  /**
   * Get security operating system status
   */
  getOperatingSystemStatus(): SecurityOperatingSystem {
    return { ...this.operatingSystem };
  }

  /**
   * Get compliance crosswalks
   */
  getComplianceCrosswalks(framework?: ComplianceFramework): any {
    return complianceCrosswalks.getCrosswalks(framework);
  }

  /**
   * Get enforcement guardrails
   */
  getEnforcementGuardrails(category?: string): any[] {
    return automatedEnforcement.getGuardrails(category);
  }

  /**
   * Get executive dashboard
   */
  getExecutiveDashboard(): any {
    return executiveDashboard.getDashboard();
  }

  /**
   * Run comprehensive security assessment
   */
  async runComprehensiveAssessment(): Promise<{
    overallScore: number;
    complianceResults: any;
    enforcementResults: any;
    dashboardMetrics: any;
    recommendations: string[];
    alerts: SecurityAlert[];
  }> {
    const complianceResults = await this.assessCompliance();
    const enforcementResults = await this.assessEnforcement();
    const dashboardMetrics = this.getDashboardMetrics();
    const alerts = this.getActiveAlerts();

    const overallScore = this.calculateOverallScore(complianceResults, enforcementResults, dashboardMetrics);
    const recommendations = this.generateRecommendations(complianceResults, enforcementResults, dashboardMetrics);

    return {
      overallScore,
      complianceResults,
      enforcementResults,
      dashboardMetrics,
      recommendations,
      alerts
    };
  }

  /**
   * Get security metrics for executive dashboard
   */
  getSecurityMetrics(): any {
    return {
      compliance: this.getComplianceMetrics(),
      enforcement: this.getEnforcementMetrics(),
      risk: this.getRiskMetrics(),
      incidents: this.getIncidentMetrics(),
      performance: this.getPerformanceMetrics()
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return this.operatingSystem.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.operatingSystem.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.operatingSystem.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: any): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get configuration
   */
  getConfig(): any {
    return { ...this.config };
  }

  /**
   * Health check
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      complianceCrosswalks: boolean;
      automatedEnforcement: boolean;
      executiveDashboard: boolean;
    };
    overall: boolean;
    metrics: any;
  }> {
    const components = {
      complianceCrosswalks: this.operatingSystem.components.complianceCrosswalks,
      automatedEnforcement: this.operatingSystem.components.automatedEnforcement,
      executiveDashboard: this.operatingSystem.components.executiveDashboard
    };

    const overall = this.initialized && Object.values(components).every(status => status);

    return {
      initialized: this.initialized,
      components,
      overall,
      metrics: this.operatingSystem.metrics
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    this.operatingSystem.status = 'maintenance';
  }

  private async assessCompliance(): Promise<any> {
    const frameworks = this.config.frameworks as ComplianceFramework[];
    const results = {};

    for (const framework of frameworks) {
      const crosswalk = complianceCrosswalks.getCrosswalks(framework);
      const controls = crosswalk.controls;
      const compliantControls = controls.filter(c => c.status === 'implemented').length;
      const complianceRate = (compliantControls / controls.length) * 100;

      results[framework] = {
        framework,
        totalControls: controls.length,
        compliantControls,
        complianceRate,
        status: complianceRate >= 90 ? 'compliant' : complianceRate >= 75 ? 'partial' : 'non-compliant'
      };
    }

    return results;
  }

  private async assessEnforcement(): Promise<any> {
    const guardrails = automatedEnforcement.getGuardrails();
    const activeGuardrails = guardrails.filter(g => g.enabled);
    const totalExecutions = activeGuardrails.reduce((sum, g) => sum + g.metrics.executions, 0);
    const totalViolations = activeGuardrails.reduce((sum, g) => sum + g.metrics.violations, 0);
    const totalBlocked = activeGuardrails.reduce((sum, g) => sum + g.metrics.blocked, 0);

    const effectiveness = totalExecutions > 0 ? ((totalExecutions - totalViolations) / totalExecutions) * 100 : 100;

    return {
      totalGuardrails: guardrails.length,
      activeGuardrails: activeGuardrails.length,
      totalExecutions,
      totalViolations,
      totalBlocked,
      effectiveness,
      violationRate: totalExecutions > 0 ? (totalViolations / totalExecutions) * 100 : 0
    };
  }

  private getDashboardMetrics(): any {
    return executiveDashboard.getMetrics();
  }

  private calculateOverallScore(compliance: any, enforcement: any, dashboard: any): number {
    const complianceScore = Object.values(compliance).reduce((sum: number, result: any) => sum + result.complianceRate, 0) / Object.keys(compliance).length;
    const enforcementScore = enforcement.effectiveness;
    const dashboardScore = dashboard.overallScore || 85;

    return (complianceScore + enforcementScore + dashboardScore) / 3;
  }

  private generateRecommendations(compliance: any, enforcement: any, dashboard: any): string[] {
    const recommendations: string[] = [];

    // Compliance recommendations
    Object.values(compliance).forEach((result: any) => {
      if (result.complianceRate < 90) {
        recommendations.push(`Improve ${result.framework} compliance from ${result.complianceRate.toFixed(1)}% to 90%`);
      }
    });

    // Enforcement recommendations
    if (enforcement.effectiveness < 95) {
      recommendations.push(`Improve enforcement effectiveness from ${enforcement.effectiveness.toFixed(1)}% to 95%`);
    }

    if (enforcement.violationRate > 5) {
      recommendations.push(`Reduce enforcement violation rate from ${enforcement.violationRate.toFixed(1)}% to below 5%`);
    }

    // Dashboard recommendations
    if (dashboard.overallScore < 85) {
      recommendations.push(`Improve overall security metrics from ${dashboard.overallScore.toFixed(1)}% to 85%`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Security operating system is performing optimally - maintain current controls');
    }

    return recommendations;
  }

  private updateOperatingSystemMetrics(): void {
    const compliance = this.getComplianceMetrics();
    const enforcement = this.getEnforcementMetrics();
    
    this.operatingSystem.metrics = {
      overallScore: (compliance.overall + enforcement.effectiveness) / 2,
      complianceRate: compliance.overall,
      riskLevel: compliance.overall >= 90 ? 'low' : compliance.overall >= 75 ? 'medium' : 'high',
      incidentCount: this.getIncidentCount(),
      controlCoverage: enforcement.coverage
    };

    this.operatingSystem.lastHealthCheck = new Date();
  }

  private getComplianceMetrics(): any {
    const frameworks = this.config.frameworks as ComplianceFramework[];
    const scores = frameworks.map(framework => {
      const crosswalk = complianceCrosswalks.getCrosswalks(framework);
      const controls = crosswalk.controls;
      const compliantControls = controls.filter(c => c.status === 'implemented').length;
      return (compliantControls / controls.length) * 100;
    });

    const overall = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return { overall, frameworks: scores };
  }

  private getEnforcementMetrics(): any {
    const guardrails = automatedEnforcement.getGuardrails();
    const activeGuardrails = guardrails.filter(g => g.enabled);
    const totalExecutions = activeGuardrails.reduce((sum, g) => sum + g.metrics.executions, 0);
    const totalViolations = activeGuardrails.reduce((sum, g) => sum + g.metrics.violations, 0);
    const effectiveness = totalExecutions > 0 ? ((totalExecutions - totalViolations) / totalExecutions) * 100 : 100;
    const coverage = guardrails.length > 0 ? (activeGuardrails.length / guardrails.length) * 100 : 0;

    return { effectiveness, coverage, violationRate: totalExecutions > 0 ? (totalViolations / totalExecutions) * 100 : 0 };
  }

  private getRiskMetrics(): any {
    return {
      overallRisk: 'medium',
      riskFactors: ['compliance-gaps', 'enforcement-violations', 'emerging-threats'],
      riskScore: 65
    };
  }

  private getIncidentMetrics(): any {
    return {
      totalIncidents: 3,
      openIncidents: 1,
      criticalIncidents: 0,
      averageResolutionTime: 24
    };
  }

  private getPerformanceMetrics(): any {
    return {
      systemUptime: 99.9,
      responseTime: 150,
      throughput: 1000,
      errorRate: 0.1
    };
  }

  private getIncidentCount(): number {
    return this.getIncidentMetrics().totalIncidents;
  }
}

// Export default instance
export const securityNextLevel = new SecurityNextLevel();

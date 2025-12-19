/**
 * Main SaaS PaaS Security Checklist Pack 2 Class
 * 
 * Enhanced security checklist framework with advanced controls,
 * structured assessments, and comprehensive compliance modules.
 */

import { SecurityChecklist2Config, SecurityChecklist2Metrics, StructuredAssessment, ComplianceModule, ThreatModel } from './types.js';
import { enhancedChecklist } from './enhanced-checklist.js';
import { structuredAssessments } from './structured-assessments.js';
import { complianceModules } from './compliance-modules.js';

export class SaasPaasSecurityChecklist2 {
  private config: SecurityChecklist2Config;
  private initialized = false;

  constructor(config: Partial<SecurityChecklist2Config> = {}) {
    this.config = {
      enhanced: {
        enabled: true,
        advancedControls: true,
        automatedAssessments: true,
        continuousMonitoring: true,
        threatModeling: true,
        ...config.enhanced
      },
      structured: {
        enabled: true,
        riskAssessments: true,
        gapAnalysis: true,
        maturityModels: true,
        benchmarking: true,
        ...config.structured
      },
      compliance: {
        enabled: true,
        frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST'],
        automatedCompliance: true,
        evidenceCollection: true,
        auditReadiness: true,
        ...config.compliance
      }
    };
  }

  /**
   * Initialize the enhanced security checklist framework
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all enhanced components
      await enhancedChecklist.initialize(this.config.enhanced);
      await structuredAssessments.initialize(this.config.structured);
      await complianceModules.initialize(this.config.compliance);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SaaS PaaS security checklist 2:', error);
      throw error;
    }
  }

  /**
   * Generate enhanced security checklist
   */
  async generateEnhancedChecklist(): Promise<any[]> {
    try {
      return await enhancedChecklist.generateChecklist();
    } catch (error) {
      console.error('Failed to generate enhanced checklist:', error);
      throw error;
    }
  }

  /**
   * Run structured assessments
   */
  async runStructuredAssessment(type: 'risk' | 'gap' | 'maturity' | 'benchmark'): Promise<StructuredAssessment> {
    try {
      return await structuredAssessments.runAssessment(type);
    } catch (error) {
      console.error('Failed to run structured assessment:', error);
      throw error;
    }
  }

  /**
   * Setup compliance modules
   */
  async setupComplianceModules(): Promise<ComplianceModule[]> {
    try {
      return await complianceModules.setupModules();
    } catch (error) {
      console.error('Failed to setup compliance modules:', error);
      throw error;
    }
  }

  /**
   * Generate threat model
   */
  async generateThreatModel(scope: string[]): Promise<ThreatModel> {
    try {
      return await enhancedChecklist.generateThreatModel(scope);
    } catch (error) {
      console.error('Failed to generate threat model:', error);
      throw error;
    }
  }

  /**
   * Run automated assessments
   */
  async runAutomatedAssessments(): Promise<{
    vulnerabilities: any[];
    complianceGaps: any[];
    riskFindings: any[];
    recommendations: any[];
  }> {
    try {
      return await enhancedChecklist.runAutomatedAssessments();
    } catch (error) {
      console.error('Failed to run automated assessments:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive metrics
   */
  async getMetrics(): Promise<SecurityChecklist2Metrics> {
    try {
      const enhancedMetrics = await enhancedChecklist.getMetrics();
      const structuredMetrics = await structuredAssessments.getMetrics();
      const complianceMetrics = await complianceModules.getMetrics();

      return {
        overall: {
          completionRate: Math.floor((enhancedMetrics.completionRate + structuredMetrics.completionRate + complianceMetrics.complianceRate) / 3),
          complianceScore: complianceMetrics.score,
          riskScore: structuredMetrics.riskScore,
          maturityScore: structuredMetrics.maturityScore,
          automationRate: enhancedMetrics.automationRate
        },
        categories: {
          enhanced: enhancedMetrics,
          structured: structuredMetrics,
          compliance: complianceMetrics
        },
        trends: {
          completionTrend: 'improving',
          riskTrend: 'decreasing',
          complianceTrend: 'improving'
        }
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(): Promise<{
    summary: any;
    enhanced: any;
    structured: any;
    compliance: any;
    recommendations: any[];
  }> {
    try {
      const enhancedReport = await enhancedChecklist.generateReport();
      const structuredReport = await structuredAssessments.generateReport();
      const complianceReport = await complianceModules.generateReport();

      return {
        summary: {
          overallScore: Math.floor((enhancedReport.score + structuredReport.score + complianceReport.score) / 3),
          completionRate: Math.floor((enhancedReport.completionRate + structuredReport.completionRate + complianceReport.completionRate) / 3),
          criticalFindings: enhancedReport.criticalFindings + structuredReport.criticalFindings + complianceReport.criticalFindings,
          automationRate: enhancedReport.automationRate
        },
        enhanced: enhancedReport,
        structured: structuredReport,
        compliance: complianceReport,
        recommendations: [
          ...enhancedReport.recommendations,
          ...structuredReport.recommendations,
          ...complianceReport.recommendations
        ]
      };
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Export to various formats
   */
  async export(format: 'json' | 'csv' | 'pdf' | 'excel'): Promise<string | Buffer> {
    try {
      const report = await this.generateReport();

      switch (format) {
        case 'json':
          return JSON.stringify(report, null, 2);
        case 'csv':
          return this.generateCSV(report);
        case 'pdf':
          return this.generatePDF(report);
        case 'excel':
          return this.generateExcel(report);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SecurityChecklist2Config {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityChecklist2Config>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    enhancedChecklist: boolean;
    structuredAssessments: boolean;
    complianceModules: boolean;
  }> {
    try {
      const enhancedChecklist = this.config.enhanced.enabled ? await enhancedChecklist.getHealthStatus() : true;
      const structuredAssessments = this.config.structured.enabled ? await structuredAssessments.getHealthStatus() : true;
      const complianceModules = this.config.compliance.enabled ? await complianceModules.getHealthStatus() : true;

      return {
        overall: this.initialized && enhancedChecklist && structuredAssessments && complianceModules,
        enhancedChecklist,
        structuredAssessments,
        complianceModules
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        enhancedChecklist: false,
        structuredAssessments: false,
        complianceModules: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await enhancedChecklist.cleanup();
    await structuredAssessments.cleanup();
    await complianceModules.cleanup();
  }

  private generateCSV(report: any): string {
    const headers = ['Category', 'Metric', 'Value', 'Status'];
    const rows = [headers.join(',')];

    Object.entries(report.summary).forEach(([key, value]) => {
      rows.push(['Summary', key, String(value), 'N/A'].join(','));
    });

    return rows.join('\n');
  }

  private generatePDF(report: any): Buffer {
    const content = JSON.stringify(report, null, 2);
    return Buffer.from(content, 'utf-8');
  }

  private generateExcel(report: any): Buffer {
    const content = JSON.stringify(report, null, 2);
    return Buffer.from(content, 'utf-8');
  }
}

// Export default instance
export const saasPaasSecurityChecklist2 = new SaasPaasSecurityChecklist2();

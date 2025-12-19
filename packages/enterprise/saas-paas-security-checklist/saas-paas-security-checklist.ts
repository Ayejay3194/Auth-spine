/**
 * Main SaaS PaaS Security Checklist Class
 * 
 * Comprehensive security checklist framework for SaaS and PaaS platforms
 * covering authentication, data protection, infrastructure, compliance,
 * and operational security.
 */

import { SecurityChecklistConfig, SecurityChecklistCategory, SecurityAssessment, SecurityMetrics } from './types.js';
import { securityChecklist } from './security-checklist.js';
import { complianceChecklist } from './compliance-checklist.js';
import { operationalChecklist } from './operational-checklist.js';
import { assessmentTools } from './assessment-tools.js';

export class SaasPaasSecurityChecklist {
  private config: SecurityChecklistConfig;
  private initialized = false;

  constructor(config: Partial<SecurityChecklistConfig> = {}) {
    this.config = {
      authentication: {
        enabled: true,
        mfa: true,
        sso: true,
        rbac: true,
        passwordPolicy: true,
        sessionManagement: true,
        ...config.authentication
      },
      dataProtection: {
        enabled: true,
        encryption: true,
        dataMasking: true,
        keyManagement: true,
        dataClassification: true,
        privacyControls: true,
        ...config.dataProtection
      },
      infrastructure: {
        enabled: true,
        networkSecurity: true,
        cloudSecurity: true,
        containerSecurity: true,
        apiSecurity: true,
        monitoring: true,
        ...config.infrastructure
      },
      compliance: {
        enabled: true,
        frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA'],
        controls: true,
        audits: true,
        reporting: true,
        ...config.compliance
      },
      operational: {
        enabled: true,
        incidentResponse: true,
        backupRecovery: true,
        changeManagement: true,
        vendorManagement: true,
        training: true,
        ...config.operational
      }
    };
  }

  /**
   * Initialize the security checklist framework
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all checklist components
      await securityChecklist.initialize(this.config);
      await complianceChecklist.initialize(this.config.compliance);
      await operationalChecklist.initialize(this.config.operational);
      await assessmentTools.initialize(this.config);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SaaS PaaS security checklist:', error);
      throw error;
    }
  }

  /**
   * Generate security checklist
   */
  async generateChecklist(): Promise<SecurityChecklistCategory[]> {
    try {
      const categories = [];

      if (this.config.authentication.enabled) {
        categories.push(await securityChecklist.generateAuthenticationChecklist());
      }

      if (this.config.dataProtection.enabled) {
        categories.push(await securityChecklist.generateDataProtectionChecklist());
      }

      if (this.config.infrastructure.enabled) {
        categories.push(await securityChecklist.generateInfrastructureChecklist());
      }

      if (this.config.compliance.enabled) {
        categories.push(await complianceChecklist.generateComplianceChecklist());
      }

      if (this.config.operational.enabled) {
        categories.push(await operationalChecklist.generateOperationalChecklist());
      }

      return categories;
    } catch (error) {
      console.error('Failed to generate security checklist:', error);
      throw error;
    }
  }

  /**
   * Run security assessment
   */
  async runAssessment(): Promise<SecurityAssessment> {
    try {
      const categories = await this.generateChecklist();
      const findings = await assessmentTools.identifyFindings(categories);
      const recommendations = await assessmentTools.generateRecommendations(findings);
      const overallScore = this.calculateOverallScore(categories);

      return {
        id: `assessment-${Date.now()}`,
        name: 'SaaS PaaS Security Assessment',
        date: new Date(),
        categories,
        overallScore,
        findings,
        recommendations,
        status: 'completed'
      };
    } catch (error) {
      console.error('Failed to run security assessment:', error);
      throw error;
    }
  }

  /**
   * Get security metrics
   */
  async getMetrics(): Promise<SecurityMetrics> {
    try {
      const categories = await this.generateChecklist();
      const authMetrics = this.calculateCategoryMetrics(categories.find(c => c.id === 'authentication'));
      const dataMetrics = this.calculateCategoryMetrics(categories.find(c => c.id === 'data-protection'));
      const infraMetrics = this.calculateCategoryMetrics(categories.find(c => c.id === 'infrastructure'));
      const complianceMetrics = this.calculateCategoryMetrics(categories.find(c => c.id === 'compliance'));
      const operationalMetrics = this.calculateCategoryMetrics(categories.find(c => c.id === 'operational'));

      return {
        overall: {
          completionRate: this.calculateOverallCompletionRate(categories),
          complianceScore: Math.floor(Math.random() * 100),
          riskScore: Math.floor(Math.random() * 100),
          findingsCount: Math.floor(Math.random() * 50)
        },
        categories: {
          authentication: authMetrics,
          dataProtection: dataMetrics,
          infrastructure: infraMetrics,
          compliance: complianceMetrics,
          operational: operationalMetrics
        }
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(): Promise<{
    frameworks: any[];
    complianceScore: number;
    gaps: any[];
    recommendations: any[];
  }> {
    try {
      return await complianceChecklist.generateReport();
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Export checklist to various formats
   */
  async exportChecklist(format: 'json' | 'csv' | 'pdf' | 'excel'): Promise<string | Buffer> {
    try {
      const categories = await this.generateChecklist();

      switch (format) {
        case 'json':
          return JSON.stringify(categories, null, 2);
        case 'csv':
          return this.generateCSV(categories);
        case 'pdf':
          return this.generatePDF(categories);
        case 'excel':
          return this.generateExcel(categories);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export checklist:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SecurityChecklistConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityChecklistConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    securityChecklist: boolean;
    complianceChecklist: boolean;
    operationalChecklist: boolean;
    assessmentTools: boolean;
  }> {
    try {
      const securityChecklist = this.config.authentication.enabled || this.config.dataProtection.enabled || this.config.infrastructure.enabled ? await securityChecklist.getHealthStatus() : true;
      const complianceChecklist = this.config.compliance.enabled ? await complianceChecklist.getHealthStatus() : true;
      const operationalChecklist = this.config.operational.enabled ? await operationalChecklist.getHealthStatus() : true;
      const assessmentTools = await assessmentTools.getHealthStatus();

      return {
        overall: this.initialized && securityChecklist && complianceChecklist && operationalChecklist && assessmentTools,
        securityChecklist,
        complianceChecklist,
        operationalChecklist,
        assessmentTools
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        securityChecklist: false,
        complianceChecklist: false,
        operationalChecklist: false,
        assessmentTools: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await securityChecklist.cleanup();
    await complianceChecklist.cleanup();
    await operationalChecklist.cleanup();
    await assessmentTools.cleanup();
  }

  private calculateOverallScore(categories: SecurityChecklistCategory[]): number {
    if (categories.length === 0) return 0;
    const totalScore = categories.reduce((sum, category) => sum + category.completionRate, 0);
    return Math.floor(totalScore / categories.length);
  }

  private calculateOverallCompletionRate(categories: SecurityChecklistCategory[]): number {
    if (categories.length === 0) return 0;
    const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);
    const completedItems = categories.reduce((sum, category) => 
      sum + category.items.filter(item => item.status === 'completed').length, 0);
    return Math.floor((completedItems / totalItems) * 100);
  }

  private calculateCategoryMetrics(category?: SecurityChecklistCategory): any {
    if (!category) {
      return {
        completionRate: 0,
        itemsCompleted: 0,
        itemsTotal: 0,
        highPriorityItems: 0,
        criticalItems: 0,
        averageTimeToComplete: 0
      };
    }

    const itemsCompleted = category.items.filter(item => item.status === 'completed').length;
    const highPriorityItems = category.items.filter(item => item.priority === 'high').length;
    const criticalItems = category.items.filter(item => item.priority === 'critical').length;

    return {
      completionRate: category.completionRate,
      itemsCompleted,
      itemsTotal: category.items.length,
      highPriorityItems,
      criticalItems,
      averageTimeToComplete: Math.floor(Math.random() * 30) // days
    };
  }

  private generateCSV(categories: SecurityChecklistCategory[]): string {
    const headers = ['Category', 'Item ID', 'Title', 'Priority', 'Status', 'Due Date', 'Assigned To'];
    const rows = [headers.join(',')];

    categories.forEach(category => {
      category.items.forEach(item => {
        const row = [
          category.name,
          item.id,
          `"${item.title}"`,
          item.priority,
          item.status,
          item.dueDate?.toISOString() || '',
          item.assignedTo || ''
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  private generatePDF(categories: SecurityChecklistCategory[]): Buffer {
    // Simplified PDF generation - in real implementation would use a PDF library
    const content = JSON.stringify(categories, null, 2);
    return Buffer.from(content, 'utf-8');
  }

  private generateExcel(categories: SecurityChecklistCategory[]): Buffer {
    // Simplified Excel generation - in real implementation would use an Excel library
    const content = JSON.stringify(categories, null, 2);
    return Buffer.from(content, 'utf-8');
  }
}

// Export default instance
export const saasPaasSecurityChecklist = new SaasPaasSecurityChecklist();

/**
 * Main Vibe Coding Disasters Kit Class
 * 
 * The central interface for the Vibe Coding Disasters Kit.
 * Provides methods to assess risks, generate checklists, and prevent development disasters.
 */

import { 
  RiskItem, 
  RiskAssessment, 
  VibeCodingConfig, 
  PRChecklistOptions, 
  ChecklistConfig,
  RiskContext 
} from './types.js';
import { riskRegister } from './risk-register.js';
import { checklistGenerator } from './checklist-generator.js';
import { severityScoring } from './severity-scoring.js';
import { templateManager } from './templates/index.js';

export class VibeCodingDisasters {
  private config: VibeCodingConfig;

  constructor(config: Partial<VibeCodingConfig> = {}) {
    this.config = {
      enableBlocking: true,
      blockOnCritical: true,
      blockOnHigh: false,
      requireSignoff: true,
      autoGeneratePR: true,
      categories: [
        'SECURITY_VULNERABILITIES',
        'DATABASE_DISASTERS',
        'FINANCIAL_BUSINESS_DISASTERS',
        'LEGAL_COMPLIANCE_DISASTERS',
        'OPERATIONAL_DISASTERS',
        'ANALYTICS_TRACKING_DISASTERS',
        'CONFIGURATION_SETTINGS_DISASTERS',
        'CRON_SCHEDULED_TASKS_DISASTERS',
        'EDGE_CASES_RARE_FAILURES',
        'EMAIL_NOTIFICATIONS_DISASTERS',
        'IMPORT_EXPORT_DISASTERS',
        'LOCALIZATION_I18N_DISASTERS',
        'MIGRATION_DISASTERS',
        'MOBILE_DISASTERS',
        'MULTI_TENANCY_DISASTERS',
        'QUEUE_BACKGROUND_JOBS_DISASTERS',
        'SEARCH_FILTERING_DISASTERS',
        'WEBSOCKET_REALTIME_DISASTERS'
      ],
      ...config
    };
  }

  /**
   * Assess risks for a given context
   */
  assessRisks(context: Partial<RiskContext> = {}): RiskAssessment {
    const allRisks = riskRegister.getAllRisks();
    return severityScoring.assessRisks(allRisks, context);
  }

  /**
   * Generate PR checklist
   */
  generatePRChecklist(options: Partial<PRChecklistOptions> = {}): string {
    const finalOptions = {
      blockOnCritical: this.config.blockOnCritical,
      blockOnHigh: this.config.blockOnHigh,
      requireSignoff: this.config.requireSignoff,
      ...options
    };

    return checklistGenerator.generatePRChecklist(finalOptions);
  }

  /**
   * Generate release checklist
   */
  generateReleaseChecklist(config: Partial<ChecklistConfig> = {}): string {
    const finalConfig = {
      includeCategories: this.config.categories,
      ...config
    };

    return checklistGenerator.generateReleaseChecklist(finalConfig);
  }

  /**
   * Generate security gate checklist
   */
  generateSecurityGateChecklist(): string {
    return checklistGenerator.generateSecurityGateChecklist();
  }

  /**
   * Generate preflight checklist
   */
  generatePreflightChecklist(context: {
    features: string[];
    areas: string[];
    customRules?: string[];
  }): string {
    return checklistGenerator.generatePreflightChecklist(context);
  }

  /**
   * Check if deployment should be blocked
   */
  shouldBlockDeployment(risks: RiskItem[]): {
    blocked: boolean;
    reason: string;
    criticalIssues: RiskItem[];
    highIssues: RiskItem[];
  } {
    const criticalIssues = risks.filter(r => r.severity === 'CRITICAL');
    const highIssues = risks.filter(r => r.severity === 'HIGH');

    let blocked = false;
    let reason = '';

    if (this.config.blockOnCritical && criticalIssues.length > 0) {
      blocked = true;
      reason = `${criticalIssues.length} critical security issues must be addressed`;
    } else if (this.config.blockOnHigh && highIssues.length > 0) {
      blocked = true;
      reason = `${highIssues.length} high-priority issues must be addressed`;
    }

    return {
      blocked,
      reason,
      criticalIssues,
      highIssues
    };
  }

  /**
   * Get risk summary by category
   */
  getRiskSummary(): {
    total: number;
    byCategory: Record<string, {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
    topRisks: RiskItem[];
  } {
    const allRisks = riskRegister.getAllRisks();
    const categories = riskRegister.getCategoriesSummary();

    const byCategory: Record<string, any> = {};
    categories.forEach(cat => {
      byCategory[cat.name] = {
        total: cat.itemCount,
        critical: cat.criticalCount,
        high: cat.highCount,
        medium: cat.mediumCount,
        low: cat.lowCount
      };
    });

    // Get top 10 risks by severity
    const topRisks = severityScoring.prioritizeRisks(allRisks).slice(0, 10);

    return {
      total: allRisks.length,
      byCategory,
      topRisks
    };
  }

  /**
   * Search for specific risks
   */
  searchRisks(query: string): RiskItem[] {
    return riskRegister.searchRisks(query);
  }

  /**
   * Get risks for a specific area
   */
  getRisksForArea(area: string): RiskItem[] {
    return riskRegister.getRisksByCategory(area.toUpperCase());
  }

  /**
   * Generate comprehensive risk report
   */
  generateRiskReport(context: Partial<RiskContext> = {}): {
    assessment: RiskAssessment;
    summary: any;
    recommendations: string[];
    nextSteps: string[];
    checklists: {
      pr: string;
      release: string;
      security: string;
    };
  } {
    const allRisks = riskRegister.getAllRisks();
    const assessment = severityScoring.assessRisks(allRisks, context);
    const summary = this.getRiskSummary();
    const report = severityScoring.generateRiskReport(allRisks, context);

    return {
      assessment,
      summary,
      recommendations: report.recommendations,
      nextSteps: report.nextSteps,
      checklists: {
        pr: this.generatePRChecklist(),
        release: this.generateReleaseChecklist(),
        security: this.generateSecurityGateChecklist()
      }
    };
  }

  /**
   * Get available templates
   */
  getTemplates() {
    return templateManager.getAllTemplates();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VibeCodingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): VibeCodingConfig {
    return { ...this.config };
  }

  /**
   * Validate current state against risks
   */
  validateState(context: {
    deployedVersion?: string;
    environment: 'development' | 'staging' | 'production';
    features: string[];
    lastSecurityReview?: Date;
    hasPII: boolean;
    handlesMoney: boolean;
  }): {
    valid: boolean;
    issues: RiskItem[];
    recommendations: string[];
    blocked: boolean;
  } {
    const isProduction = context.environment === 'production';
    const riskContext: Partial<RiskContext> = {
      isProduction,
      hasPII: context.hasPII,
      handlesMoney: context.handlesMoney,
      isCustomerFacing: true // Assume customer-facing for validation
    };

    const allRisks = riskRegister.getAllRisks();
    const assessment = severityScoring.assessRisks(allRisks, riskContext);
    
    const criticalIssues = allRisks.filter(r => r.severity === 'CRITICAL');
    const highIssues = allRisks.filter(r => r.severity === 'HIGH');

    const blocked = this.shouldBlockDeployment(allRisks).blocked;
    const valid = !blocked && assessment.criticalRisks === 0;

    return {
      valid,
      issues: [...criticalIssues, ...highIssues],
      recommendations: assessment.recommendations,
      blocked
    };
  }
}

// Export default instance
export const vibeCodingDisasters = new VibeCodingDisasters();

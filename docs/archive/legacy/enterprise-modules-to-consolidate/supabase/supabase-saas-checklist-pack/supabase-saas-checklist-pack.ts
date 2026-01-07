/**
 * Main Supabase SaaS Checklist Pack Class
 * 
 * Comprehensive checklist framework for Supabase SaaS implementations
 * covering architecture, security, compliance, and best practices.
 */

import { SaasChecklistConfig, SaasChecklistMetrics, ChecklistCategory, ImplementationPhase, SecurityControl, ComplianceFramework, ChecklistReport } from './types.js';
import { checklistManager } from './checklist-manager.js';
import { implementationChecklist } from './implementation-checklist.js';
import { securityChecklist } from './security-checklist.js';
import { complianceChecklist } from './compliance-checklist.js';

export class SupabaseSaasChecklistPack {
  private config: SaasChecklistConfig;
  private initialized = false;

  constructor(config: Partial<SaasChecklistConfig> = {}) {
    this.config = {
      checklist: {
        enabled: true,
        categories: true,
        validation: true,
        tracking: true,
        reporting: true,
        ...config.checklist
      },
      implementation: {
        enabled: true,
        phases: true,
        tasks: true,
        dependencies: true,
        milestones: true,
        ...config.implementation
      },
      security: {
        enabled: true,
        controls: true,
        assessments: true,
        monitoring: true,
        ...config.security
      },
      compliance: {
        enabled: true,
        frameworks: true,
        controls: true,
        evidence: true,
        audits: true,
        ...config.compliance
      }
    };
  }

  /**
   * Initialize the Supabase SaaS checklist pack
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all checklist components
      await checklistManager.initialize(this.config.checklist);
      await implementationChecklist.initialize(this.config.implementation);
      await securityChecklist.initialize(this.config.security);
      await complianceChecklist.initialize(this.config.compliance);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase SaaS checklist pack:', error);
      throw error;
    }
  }

  /**
   * Setup checklist management
   */
  async setupChecklistManager(): Promise<void> {
    if (!this.config.checklist.enabled) {
      throw new Error('Checklist management not enabled');
    }

    try {
      await checklistManager.setupCategories();
      await checklistManager.setupValidation();
      await checklistManager.setupTracking();
      await checklistManager.setupReporting();
    } catch (error) {
      console.error('Failed to setup checklist management:', error);
      throw error;
    }
  }

  /**
   * Setup implementation checklist
   */
  async setupImplementationChecklist(): Promise<void> {
    if (!this.config.implementation.enabled) {
      throw new Error('Implementation checklist not enabled');
    }

    try {
      await implementationChecklist.setupPhases();
      await implementationChecklist.setupTasks();
      await implementationChecklist.setupDependencies();
      await implementationChecklist.setupMilestones();
    } catch (error) {
      console.error('Failed to setup implementation checklist:', error);
      throw error;
    }
  }

  /**
   * Setup security checklist
   */
  async setupSecurityChecklist(): Promise<void> {
    if (!this.config.security.enabled) {
      throw new Error('Security checklist not enabled');
    }

    try {
      await securityChecklist.setupControls();
      await securityChecklist.setupAssessments();
      await securityChecklist.setupMonitoring();
    } catch (error) {
      console.error('Failed to setup security checklist:', error);
      throw error;
    }
  }

  /**
   * Setup compliance checklist
   */
  async setupComplianceChecklist(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Compliance checklist not enabled');
    }

    try {
      await complianceChecklist.setupFrameworks();
      await complianceChecklist.setupControls();
      await complianceChecklist.setupEvidence();
      await complianceChecklist.setupAudits();
    } catch (error) {
      console.error('Failed to setup compliance checklist:', error);
      throw error;
    }
  }

  /**
   * Get checklist categories
   */
  async getChecklistCategories(): Promise<ChecklistCategory[]> {
    try {
      return await checklistManager.getCategories();
    } catch (error) {
      console.error('Failed to get checklist categories:', error);
      throw error;
    }
  }

  /**
   * Get implementation phases
   */
  async getImplementationPhases(): Promise<ImplementationPhase[]> {
    try {
      return await implementationChecklist.getPhases();
    } catch (error) {
      console.error('Failed to get implementation phases:', error);
      throw error;
    }
  }

  /**
   * Get security controls
   */
  async getSecurityControls(): Promise<SecurityControl[]> {
    try {
      return await securityChecklist.getControls();
    } catch (error) {
      console.error('Failed to get security controls:', error);
      throw error;
    }
  }

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    try {
      return await complianceChecklist.getFrameworks();
    } catch (error) {
      console.error('Failed to get compliance frameworks:', error);
      throw error;
    }
  }

  /**
   * Create checklist category
   */
  async createChecklistCategory(category: Omit<ChecklistCategory, 'id' | 'progress'>): Promise<ChecklistCategory> {
    try {
      return await checklistManager.createCategory({
        ...category,
        progress: {
          totalItems: category.items.length,
          completedItems: 0,
          inProgressItems: 0,
          blockedItems: 0,
          completionRate: 0,
          lastUpdated: new Date(),
          estimatedCompletion: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to create checklist category:', error);
      throw error;
    }
  }

  /**
   * Generate checklist report
   */
  async generateReport(type: 'progress' | 'compliance' | 'security' | 'implementation'): Promise<ChecklistReport> {
    try {
      const metrics = await this.getMetrics();
      
      return {
        id: `report-${Date.now()}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        type,
        date: new Date(),
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          type: 'monthly'
        },
        summary: {
          overallScore: metrics.overall.completionRate,
          completionRate: metrics.overall.completionRate,
          complianceRate: metrics.overall.complianceScore,
          securityScore: metrics.overall.securityPosture,
          keyMetrics: {
            categoriesCompleted: metrics.checklist.categoriesCompleted,
            phasesCompleted: metrics.implementation.phasesCompleted,
            controlsImplemented: metrics.security.controlsImplemented,
            frameworksActive: metrics.compliance.frameworksActive
          },
          status: metrics.overall.completionRate > 80 ? 'on-track' : metrics.overall.completionRate > 50 ? 'at-risk' : 'off-track'
        },
        details: {
          categories: [],
          phases: [],
          controls: [],
          findings: []
        },
        recommendations: [
          {
            id: 'rec-001',
            priority: 'high',
            title: 'Complete pending checklist items',
            description: 'Focus on completing high-priority checklist items',
            category: 'implementation',
            effort: 'medium',
            impact: 'high',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        ],
        generatedBy: 'system'
      };
    } catch (error) {
      console.error('Failed to generate checklist report:', error);
      throw error;
    }
  }

  /**
   * Get SaaS checklist metrics
   */
  async getMetrics(): Promise<SaasChecklistMetrics> {
    try {
      const checklistMetrics = await checklistManager.getMetrics();
      const implementationMetrics = await implementationChecklist.getMetrics();
      const securityMetrics = await securityChecklist.getMetrics();
      const complianceMetrics = await complianceChecklist.getMetrics();

      return {
        checklist: checklistMetrics,
        implementation: implementationMetrics,
        security: securityMetrics,
        compliance: complianceMetrics,
        overall: {
          completionRate: Math.floor((checklistMetrics.categoriesCompleted + implementationMetrics.phasesCompleted) / 2),
          complianceScore: complianceMetrics.complianceRate,
          securityPosture: securityMetrics.securityScore,
          implementationProgress: implementationMetrics.implementationSpeed
        }
      };
    } catch (error) {
      console.error('Failed to get SaaS checklist metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(): Promise<{
    summary: any;
    checklist: any;
    implementation: any;
    security: any;
    compliance: any;
    recommendations: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          completionRate: metrics.overall.completionRate,
          complianceScore: metrics.overall.complianceScore,
          securityPosture: metrics.overall.securityPosture,
          implementationProgress: metrics.overall.implementationProgress
        },
        checklist: {
          categoriesCompleted: metrics.checklist.categoriesCompleted,
          itemsValidated: metrics.checklist.itemsValidated,
          trackingProgress: metrics.checklist.trackingProgress,
          reportsGenerated: metrics.checklist.reportsGenerated
        },
        implementation: {
          phasesCompleted: metrics.implementation.phasesCompleted,
          tasksFinished: metrics.implementation.tasksFinished,
          dependenciesResolved: metrics.implementation.dependenciesResolved,
          milestonesAchieved: metrics.implementation.milestonesAchieved
        },
        security: {
          controlsImplemented: metrics.security.controlsImplemented,
          assessmentsPassed: metrics.security.assessmentsPassed,
          monitoringActive: metrics.security.monitoringActive,
          threatsMitigated: metrics.security.threatsMitigated
        },
        compliance: {
          frameworksActive: metrics.compliance.frameworksActive,
          controlsImplemented: metrics.compliance.controlsImplemented,
          evidenceCollected: metrics.compliance.evidenceCollected,
          auditsPassed: metrics.compliance.auditsPassed
        },
        recommendations: [
          {
            priority: 'high',
            description: 'Complete remaining checklist categories'
          },
          {
            priority: 'medium',
            description: 'Enhance security control implementation'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SaasChecklistConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SaasChecklistConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    checklist: boolean;
    implementation: boolean;
    security: boolean;
    compliance: boolean;
  }> {
    try {
      const checklist = this.config.checklist.enabled ? await checklistManager.getHealthStatus() : true;
      const implementation = this.config.implementation.enabled ? await implementationChecklist.getHealthStatus() : true;
      const security = this.config.security.enabled ? await securityChecklist.getHealthStatus() : true;
      const compliance = this.config.compliance.enabled ? await complianceChecklist.getHealthStatus() : true;

      return {
        overall: this.initialized && checklist && implementation && security && compliance,
        checklist,
        implementation,
        security,
        compliance
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        checklist: false,
        implementation: false,
        security: false,
        compliance: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await checklistManager.cleanup();
    await implementationChecklist.cleanup();
    await securityChecklist.cleanup();
    await complianceChecklist.cleanup();
  }
}

// Export default instance
export const supabaseSaasChecklistPack = new SupabaseSaasChecklistPack();

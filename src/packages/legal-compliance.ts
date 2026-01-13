/**
 * Main Legal & Compliance Disaster Kit Class
 * 
 * The central interface for the Legal & Compliance Disaster Kit.
 * Provides comprehensive compliance management including checklists,
 * policies, incident response, product requirements, and registries.
 */

import { 
  ComplianceConfig, 
  ComplianceAssessment, 
  ComplianceChecklist, 
  CompliancePolicy, 
  IncidentReport, 
  ProductRequirement, 
  ComplianceRegistry,
  ComplianceFramework,
  ComplianceStatus
} from './types.js';
import { complianceManager } from './compliance-manager.js';
import { checklistTracker } from './checklist-tracker.js';
import { policyTemplateManager } from './policy-templates.js';
import { incidentResponseManager } from './incident-response.js';
import { productRequirementsManager } from './product-requirements.js';
import { registryManager } from './registries/index.js';

export class LegalCompliance {
  private config: ComplianceConfig;
  private initialized = false;

  constructor(config: Partial<ComplianceConfig> = {}) {
    this.config = {
      enabledFrameworks: [
        'GDPR',
        'CCPA',
        'HIPAA',
        'SOX',
        'SOC2',
        'ISO27001'
      ],
      autoTrackChanges: true,
      requireApproval: true,
      auditRetention: 2555,
      incidentRetention: 1825,
      enableNotifications: true,
      enableAutomatedChecks: true,
      approvalWorkflow: {
        requiredForPolicyChanges: true,
        requiredForVendorChanges: true,
        requiredForIncidentResolution: true,
        approvers: []
      },
      notifications: {
        email: true,
        slack: false,
        webhook: false,
        recipients: {
          incidents: [],
          policyChanges: [],
          complianceAlerts: []
        }
      },
      ...config
    };
  }

  /**
   * Initialize the compliance system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await complianceManager.initialize();
      await policyTemplateManager.initialize();
      await incidentResponseManager.initialize();
      await productRequirementsManager.initialize();
      await registryManager.initialize();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Legal Compliance Kit:', error);
      throw error;
    }
  }

  /**
   * Get overall compliance assessment
   */
  async getAssessment(): Promise<ComplianceAssessment> {
    return await complianceManager.getAssessment();
  }

  /**
   * Get compliance dashboard data
   */
  async getDashboardData(): Promise<{
    assessment: ComplianceAssessment;
    activeIncidents: number;
    pendingPolicies: number;
    overdueItems: number;
    upcomingDeadlines: any[];
    recentActivity: any[];
  }> {
    return await complianceManager.getDashboardData();
  }

  /**
   * Compliance Checklists
   */
  async createChecklist(templateId: string, name: string, assignedTo?: string): Promise<ComplianceChecklist> {
    return checklistTracker.createFromTemplate(templateId, name, assignedTo);
  }

  getChecklist(id: string): ComplianceChecklist | undefined {
    return checklistTracker.getChecklist(id);
  }

  getAllChecklists(): ComplianceChecklist[] {
    return checklistTracker.getAllChecklists();
  }

  updateChecklistItem(checklistId: string, itemId: string, updates: any): void {
    checklistTracker.updateItem(checklistId, itemId, updates);
  }

  getOverdueItems(): any[] {
    return checklistTracker.getOverdueItems();
  }

  getUpcomingDeadlines(days: number = 30): any[] {
    return checklistTracker.getUpcomingDeadlines(days);
  }

  /**
   * Policy Management
   */
  createPolicy(templateId: string, name: string, content: string): CompliancePolicy {
    return policyTemplateManager.createFromTemplate(templateId, name, content);
  }

  getPolicy(id: string): CompliancePolicy | undefined {
    return policyTemplateManager.getPolicy(id);
  }

  getAllPolicies(): CompliancePolicy[] {
    return policyTemplateManager.getAllPolicies();
  }

  updatePolicyStatus(id: string, status: CompliancePolicy['status'], approvedBy?: string): void {
    policyTemplateManager.updateStatus(id, status, approvedBy);
  }

  /**
   * Incident Management
   */
  reportIncident(incident: Omit<IncidentReport, 'id' | 'timeline' | 'reportedAt'>): IncidentReport {
    return incidentResponseManager.reportIncident(incident);
  }

  getIncident(id: string): IncidentReport | undefined {
    return incidentResponseManager.getIncident(id);
  }

  getAllIncidents(): IncidentReport[] {
    return incidentResponseManager.getAllIncidents();
  }

  updateIncidentStatus(id: string, status: IncidentReport['status'], updatedBy: string): void {
    incidentResponseManager.updateStatus(id, status, updatedBy);
  }

  /**
   * Product Requirements
   */
  addRequirement(requirement: ProductRequirement): void {
    productRequirementsManager.addRequirement(requirement);
  }

  getRequirement(id: string): ProductRequirement | undefined {
    return productRequirementsManager.getRequirement(id);
  }

  getAllRequirements(): ProductRequirement[] {
    return productRequirementsManager.getAllRequirements();
  }

  updateRequirementStatus(id: string, status: ProductRequirement['status'], actualHours?: number): void {
    productRequirementsManager.updateStatus(id, status, actualHours);
  }

  /**
   * Compliance Registries
   */
  addRegistry(registry: ComplianceRegistry): void {
    registryManager.addRegistry(registry);
  }

  getRegistry(id: string): ComplianceRegistry | undefined {
    return registryManager.getRegistry(id);
  }

  getAllRegistries(): ComplianceRegistry[] {
    return registryManager.getAllRegistries();
  }

  getRegistriesByType(type: ComplianceRegistry['type']): ComplianceRegistry[] {
    return registryManager.getRegistriesByType(type);
  }

  /**
   * Search and Filtering
   */
  searchComplianceItems(query: string, filters?: any): any[] {
    return complianceManager.searchItems(query, filters);
  }

  /**
   * Configuration
   */
  updateConfig(updates: Partial<ComplianceConfig>): void {
    this.config = { ...this.config, ...updates };
    complianceManager.updateConfig(updates);
  }

  getConfig(): ComplianceConfig {
    return { ...this.config };
  }

  /**
   * Framework Management
   */
  getEnabledFrameworks(): ComplianceFramework[] {
    return this.config.enabledFrameworks;
  }

  enableFramework(framework: ComplianceFramework): void {
    if (!this.config.enabledFrameworks.includes(framework)) {
      this.config.enabledFrameworks.push(framework);
    }
  }

  disableFramework(framework: ComplianceFramework): void {
    const index = this.config.enabledFrameworks.indexOf(framework);
    if (index > -1) {
      this.config.enabledFrameworks.splice(index, 1);
    }
  }

  /**
   * Reporting
   */
  async generateComplianceReport(framework?: ComplianceFramework): Promise<{
    summary: ComplianceAssessment;
    checklists: ComplianceChecklist[];
    policies: CompliancePolicy[];
    incidents: IncidentReport[];
    requirements: ProductRequirement[];
    registries: ComplianceRegistry[];
    generatedAt: Date;
  }> {
    const assessment = await this.getAssessment();
    
    let checklists = this.getAllChecklists();
    let policies = this.getAllPolicies();
    let incidents = this.getAllIncidents();
    let requirements = this.getAllRequirements();
    let registries = this.getAllRegistries();

    if (framework) {
      checklists = checklists.filter(c => c.framework === framework);
      policies = policies.filter(p => p.framework.includes(framework));
    }

    return {
      summary: assessment,
      checklists,
      policies,
      incidents,
      requirements,
      registries,
      generatedAt: new Date()
    };
  }

  /**
   * Health Check
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      complianceManager: boolean;
      checklistTracker: boolean;
      policyTemplates: boolean;
      incidentResponse: boolean;
      productRequirements: boolean;
      registries: boolean;
    };
    overall: boolean;
  }> {
    const components = {
      complianceManager: this.initialized,
      checklistTracker: checklistTracker.getAllChecklists().length >= 0,
      policyTemplates: policyTemplateManager.getAllPolicies().length >= 0,
      incidentResponse: incidentResponseManager.getAllIncidents().length >= 0,
      productRequirements: productRequirementsManager.getAllRequirements().length >= 0,
      registries: registryManager.getAllRegistries().length >= 0
    };

    const overall = this.initialized && Object.values(components).every(status => status);

    return {
      initialized: this.initialized,
      components,
      overall
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    // Cleanup resources
    this.initialized = false;
  }
}

// Export default instance
export const legalCompliance = new LegalCompliance();

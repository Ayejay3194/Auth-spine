/**
 * Compliance Manager for Legal & Compliance Disaster Kit
 * 
 * Central management system for all compliance activities including
 * checklists, policies, incidents, requirements, and registries.
 */

import { 
  ComplianceItem, 
  ComplianceChecklist, 
  CompliancePolicy, 
  IncidentReport, 
  ProductRequirement, 
  ComplianceRegistry, 
  ComplianceConfig,
  ComplianceFramework,
  ComplianceStatus,
  RiskLevel
} from './types.js';

export interface ComplianceAssessment {
  overallScore: number;
  frameworkScores: Record<ComplianceFramework, number>;
  criticalItems: ComplianceItem[];
  highRiskItems: ComplianceItem[];
  upcomingDeadlines: ComplianceItem[];
  recommendations: string[];
}

export class ComplianceManager {
  private config: ComplianceConfig;
  private checklists: Map<string, ComplianceChecklist> = new Map();
  private policies: Map<string, CompliancePolicy> = new Map();
  private incidents: Map<string, IncidentReport> = new Map();
  private requirements: Map<string, ProductRequirement> = new Map();
  private registries: Map<string, ComplianceRegistry> = new Map();

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
   * Initialize compliance manager with default data
   */
  async initialize(): Promise<void> {
    await this.loadDefaultChecklists();
    await this.loadDefaultPolicies();
    await this.loadDefaultRegistries();
  }

  /**
   * Get overall compliance assessment
   */
  async getAssessment(): Promise<ComplianceAssessment> {
    const allItems = this.getAllComplianceItems();
    const criticalItems = allItems.filter(item => item.riskLevel === 'critical' && item.status !== 'compliant');
    const highRiskItems = allItems.filter(item => item.riskLevel === 'high' && item.status !== 'compliant');
    
    const upcomingDeadlines = allItems.filter(item => {
      if (!item.dueDate) return false;
      const daysUntilDue = Math.ceil((item.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 30 && daysUntilDue > 0;
    });

    const frameworkScores = this.calculateFrameworkScores(allItems);
    const overallScore = Object.values(frameworkScores).reduce((sum, score) => sum + score, 0) / Object.keys(frameworkScores).length;

    const recommendations = this.generateRecommendations(criticalItems, highRiskItems, upcomingDeadlines);

    return {
      overallScore,
      frameworkScores,
      criticalItems,
      highRiskItems,
      upcomingDeadlines,
      recommendations
    };
  }

  /**
   * Add compliance checklist
   */
  addChecklist(checklist: ComplianceChecklist): void {
    checklist.progress = this.calculateProgress(checklist.items);
    this.checklists.set(checklist.id, checklist);
    
    if (this.config.enableNotifications) {
      this.notifyChecklistUpdate(checklist);
    }
  }

  /**
   * Get checklist by ID
   */
  getChecklist(id: string): ComplianceChecklist | undefined {
    return this.checklists.get(id);
  }

  /**
   * Get all checklists
   */
  getAllChecklists(): ComplianceChecklist[] {
    return Array.from(this.checklists.values());
  }

  /**
   * Update checklist item status
   */
  updateChecklistItem(checklistId: string, itemId: string, updates: Partial<ComplianceItem>): void {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) return;

    const itemIndex = checklist.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    checklist.items[itemIndex] = {
      ...checklist.items[itemIndex],
      ...updates,
      updatedAt: new Date()
    };

    checklist.progress = this.calculateProgress(checklist.items);
    checklist.updatedAt = new Date();
    
    if (this.config.enableNotifications) {
      this.notifyItemUpdate(checklist.items[itemIndex]);
    }
  }

  /**
   * Add compliance policy
   */
  addPolicy(policy: CompliancePolicy): void {
    this.policies.set(policy.id, policy);
    
    if (this.config.enableNotifications) {
      this.notifyPolicyUpdate(policy);
    }
  }

  /**
   * Get policy by ID
   */
  getPolicy(id: string): CompliancePolicy | undefined {
    return this.policies.get(id);
  }

  /**
   * Get all policies
   */
  getAllPolicies(): CompliancePolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Update policy status
   */
  updatePolicyStatus(id: string, status: CompliancePolicy['status'], approvedBy?: string): void {
    const policy = this.policies.get(id);
    if (!policy) return;

    policy.status = status;
    policy.updatedAt = new Date();
    
    if (status === 'approved' && approvedBy) {
      policy.approvedBy = approvedBy;
      policy.approvedAt = new Date();
    }
  }

  /**
   * Add incident report
   */
  addIncident(incident: IncidentReport): void {
    this.incidents.set(incident.id, incident);
    
    if (this.config.enableNotifications) {
      this.notifyIncident(incident);
    }
  }

  /**
   * Get incident by ID
   */
  getIncident(id: string): IncidentReport | undefined {
    return this.incidents.get(id);
  }

  /**
   * Get all incidents
   */
  getAllIncidents(): IncidentReport[] {
    return Array.from(this.incidents.values());
  }

  /**
   * Update incident status
   */
  updateIncidentStatus(id: string, status: IncidentReport['status'], updatedBy: string): void {
    const incident = this.incidents.get(id);
    if (!incident) return;

    incident.status = status;
    incident.timeline.push({
      timestamp: new Date(),
      type: 'resolution',
      description: `Status updated to ${status}`,
      performedBy: updatedBy
    });

    if (status === 'resolved' || status === 'closed') {
      incident.resolvedAt = new Date();
    }
  }

  /**
   * Add product requirement
   */
  addRequirement(requirement: ProductRequirement): void {
    this.requirements.set(requirement.id, requirement);
  }

  /**
   * Get requirement by ID
   */
  getRequirement(id: string): ProductRequirement | undefined {
    return this.requirements.get(id);
  }

  /**
   * Get all requirements
   */
  getAllRequirements(): ProductRequirement[] {
    return Array.from(this.requirements.values());
  }

  /**
   * Update requirement status
   */
  updateRequirementStatus(id: string, status: ProductRequirement['status'], actualHours?: number): void {
    const requirement = this.requirements.get(id);
    if (!requirement) return;

    requirement.status = status;
    requirement.updatedAt = new Date();
    
    if (actualHours !== undefined) {
      requirement.actualHours = actualHours;
    }
  }

  /**
   * Add compliance registry
   */
  addRegistry(registry: ComplianceRegistry): void {
    this.registries.set(registry.id, registry);
  }

  /**
   * Get registry by ID
   */
  getRegistry(id: string): ComplianceRegistry | undefined {
    return this.registries.get(id);
  }

  /**
   * Get all registries
   */
  getAllRegistries(): ComplianceRegistry[] {
    return Array.from(this.registries.values());
  }

  /**
   * Get registries by type
   */
  getRegistriesByType(type: ComplianceRegistry['type']): ComplianceRegistry[] {
    return Array.from(this.registries.values()).filter(registry => registry.type === type);
  }

  /**
   * Search compliance items
   */
  searchItems(query: string, filters?: {
    framework?: ComplianceFramework;
    status?: ComplianceStatus;
    riskLevel?: RiskLevel;
    category?: string;
  }): ComplianceItem[] {
    const allItems = this.getAllComplianceItems();
    const lowerQuery = query.toLowerCase();

    return allItems.filter(item => {
      // Text search
      const matchesQuery = 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery);

      // Apply filters
      if (filters?.framework && item.framework !== filters.framework) return false;
      if (filters?.status && item.status !== filters.status) return false;
      if (filters?.riskLevel && item.riskLevel !== filters.riskLevel) return false;
      if (filters?.category && item.category !== filters.category) return false;

      return matchesQuery;
    });
  }

  /**
   * Get compliance dashboard data
   */
  async getDashboardData(): Promise<{
    assessment: ComplianceAssessment;
    activeIncidents: number;
    pendingPolicies: number;
    overdueItems: number;
    upcomingDeadlines: ComplianceItem[];
    recentActivity: Array<{
      type: 'checklist' | 'policy' | 'incident' | 'requirement';
      action: string;
      timestamp: Date;
    }>;
  }> {
    const assessment = await this.getAssessment();
    const activeIncidents = this.getAllIncidents().filter(incident => 
      ['open', 'investigating', 'contained'].includes(incident.status)
    ).length;
    
    const pendingPolicies = this.getAllPolicies().filter(policy => 
      ['draft', 'review'].includes(policy.status)
    ).length;

    const allItems = this.getAllComplianceItems();
    const overdueItems = allItems.filter(item => {
      if (!item.dueDate) return false;
      return item.dueDate < new Date() && item.status !== 'compliant';
    }).length;

    const upcomingDeadlines = allItems.filter(item => {
      if (!item.dueDate) return false;
      const daysUntilDue = Math.ceil((item.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 30 && daysUntilDue > 0;
    });

    return {
      assessment,
      activeIncidents,
      pendingPolicies,
      overdueItems,
      upcomingDeadlines,
      recentActivity: this.getRecentActivity()
    };
  }

  private getAllComplianceItems(): ComplianceItem[] {
    const items: ComplianceItem[] = [];
    
    this.checklists.forEach(checklist => {
      items.push(...checklist.items);
    });

    return items;
  }

  private calculateProgress(items: ComplianceItem[]): {
    total: number;
    completed: number;
    pending: number;
    blocked: number;
  } {
    const total = items.length;
    const completed = items.filter(item => item.status === 'compliant').length;
    const pending = items.filter(item => item.status === 'pending').length;
    const blocked = items.filter(item => item.status === 'non-compliant').length;

    return { total, completed, pending, blocked };
  }

  private calculateFrameworkScores(items: ComplianceItem[]): Record<ComplianceFramework, number> {
    const scores: Record<ComplianceFramework, number> = {} as Record<ComplianceFramework, number>;
    
    this.config.enabledFrameworks.forEach(framework => {
      const frameworkItems = items.filter(item => item.framework === framework);
      if (frameworkItems.length === 0) {
        scores[framework] = 0;
        return;
      }

      const compliantItems = frameworkItems.filter(item => item.status === 'compliant').length;
      scores[framework] = Math.round((compliantItems / frameworkItems.length) * 100);
    });

    return scores;
  }

  private generateRecommendations(
    criticalItems: ComplianceItem[], 
    highRiskItems: ComplianceItem[], 
    upcomingDeadlines: ComplianceItem[]
  ): string[] {
    const recommendations: string[] = [];

    if (criticalItems.length > 0) {
      recommendations.push(`Address ${criticalItems.length} critical compliance items immediately`);
    }

    if (highRiskItems.length > 0) {
      recommendations.push(`Review and resolve ${highRiskItems.length} high-risk items`);
    }

    if (upcomingDeadlines.length > 0) {
      recommendations.push(`${upcomingDeadlines.length} items have deadlines within 30 days`);
    }

    const openIncidents = this.getAllIncidents().filter(incident => 
      ['open', 'investigating'].includes(incident.status)
    ).length;

    if (openIncidents > 0) {
      recommendations.push(`Resolve ${openIncidents} open incidents`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All compliance items are in good standing');
    }

    return recommendations;
  }

  private async loadDefaultChecklists(): Promise<void> {
    // Load default compliance checklists
    // This would typically load from templates or database
  }

  private async loadDefaultPolicies(): Promise<void> {
    // Load default policy templates
    // This would typically load from templates or database
  }

  private async loadDefaultRegistries(): Promise<void> {
    // Load default registry templates
    // This would typically load from templates or database
  }

  private getRecentActivity(): Array<{
    type: 'checklist' | 'policy' | 'incident' | 'requirement';
    action: string;
    timestamp: Date;
  }> {
    // Return recent compliance activity
    return [];
  }

  private notifyChecklistUpdate(checklist: ComplianceChecklist): void {
    // Send notifications for checklist updates
    console.log(`Checklist updated: ${checklist.name}`);
  }

  private notifyItemUpdate(item: ComplianceItem): void {
    // Send notifications for item updates
    console.log(`Compliance item updated: ${item.title}`);
  }

  private notifyPolicyUpdate(policy: CompliancePolicy): void {
    // Send notifications for policy updates
    console.log(`Policy updated: ${policy.name}`);
  }

  private notifyIncident(incident: IncidentReport): void {
    // Send notifications for new incidents
    console.log(`New incident reported: ${incident.title}`);
  }
}

// Export singleton instance
export const complianceManager = new ComplianceManager();

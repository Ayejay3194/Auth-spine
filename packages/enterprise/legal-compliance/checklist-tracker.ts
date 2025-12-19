/**
 * Checklist Tracker for Legal & Compliance Disaster Kit
 * 
 * Manages compliance checklists with progress tracking,
 * automated scoring, and deadline management.
 */

import { ComplianceItem, ComplianceChecklist, ComplianceFramework, ComplianceStatus, RiskLevel } from './types.js';

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  framework: ComplianceFramework;
  category: string;
  items: Omit<ComplianceItem, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  pending: number;
  blocked: number;
  percentage: number;
  estimatedCompletion?: Date;
}

export class ChecklistTracker {
  private templates: Map<string, ChecklistTemplate> = new Map();
  private checklists: Map<string, ComplianceChecklist> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Create checklist from template
   */
  createFromTemplate(templateId: string, name: string, assignedTo?: string): ComplianceChecklist {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const items: ComplianceItem[] = template.items.map((item, index) => ({
      ...item,
      id: `${templateId}_${index}_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const checklist: ComplianceChecklist = {
      id: `checklist_${Date.now()}`,
      name,
      description: template.description,
      framework: template.framework,
      items,
      progress: this.calculateProgress(items),
      assignedTo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.checklists.set(checklist.id, checklist);
    return checklist;
  }

  /**
   * Add custom checklist
   */
  addChecklist(checklist: ComplianceChecklist): void {
    checklist.progress = this.calculateProgress(checklist.items);
    this.checklists.set(checklist.id, checklist);
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
   * Get checklists by framework
   */
  getChecklistsByFramework(framework: ComplianceFramework): ComplianceChecklist[] {
    return Array.from(this.checklists.values()).filter(checklist => 
      checklist.framework === framework
    );
  }

  /**
   * Get checklists by assignee
   */
  getChecklistsByAssignee(assignee: string): ComplianceChecklist[] {
    return Array.from(this.checklists.values()).filter(checklist => 
      checklist.assignedTo === assignee
    );
  }

  /**
   * Update checklist item
   */
  updateItem(checklistId: string, itemId: string, updates: Partial<ComplianceItem>): void {
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
  }

  /**
   * Update checklist item status
   */
  updateItemStatus(checklistId: string, itemId: string, status: ComplianceStatus, reviewedBy?: string): void {
    this.updateItem(checklistId, itemId, { 
      status, 
      reviewedBy, 
      reviewedAt: reviewedBy ? new Date() : undefined 
    });
  }

  /**
   * Get checklist progress
   */
  getProgress(checklistId: string): ChecklistProgress | null {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) return null;

    const progress = this.calculateProgress(checklist.items);
    const estimatedCompletion = this.estimateCompletion(checklist);

    return {
      ...progress,
      percentage: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0,
      estimatedCompletion
    };
  }

  /**
   * Get overdue items
   */
  getOverdueItems(): Array<{
    checklistId: string;
    checklistName: string;
    item: ComplianceItem;
    daysOverdue: number;
  }> {
    const overdue: Array<{
      checklistId: string;
      checklistName: string;
      item: ComplianceItem;
      daysOverdue: number;
    }> = [];

    const now = new Date();

    this.checklists.forEach((checklist, checklistId) => {
      checklist.items.forEach(item => {
        if (item.dueDate && item.dueDate < now && item.status !== 'compliant') {
          const daysOverdue = Math.ceil((now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          overdue.push({
            checklistId,
            checklistName: checklist.name,
            item,
            daysOverdue
          });
        }
      });
    });

    return overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(days: number = 30): Array<{
    checklistId: string;
    checklistName: string;
    item: ComplianceItem;
    daysUntilDue: number;
  }> {
    const upcoming: Array<{
      checklistId: string;
      checklistName: string;
      item: ComplianceItem;
      daysUntilDue: number;
    }> = [];

    const now = new Date();
    const cutoffDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    this.checklists.forEach((checklist, checklistId) => {
      checklist.items.forEach(item => {
        if (item.dueDate && item.dueDate <= cutoffDate && item.dueDate > now && item.status !== 'compliant') {
          const daysUntilDue = Math.ceil((item.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          upcoming.push({
            checklistId,
            checklistName: checklist.name,
            item,
            daysUntilDue
          });
        }
      });
    });

    return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Get risk summary
   */
  getRiskSummary(): {
    critical: number;
    high: number;
    medium: number;
    low: number;
    byFramework: Record<ComplianceFramework, {
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
  } {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byFramework: {} as Record<ComplianceFramework, {
        critical: number;
        high: number;
        medium: number;
        low: number;
      }>
    };

    this.checklists.forEach(checklist => {
      const framework = checklist.framework;
      
      if (!summary.byFramework[framework]) {
        summary.byFramework[framework] = { critical: 0, high: 0, medium: 0, low: 0 };
      }

      checklist.items.forEach(item => {
        summary[item.riskLevel]++;
        summary.byFramework[framework][item.riskLevel]++;
      });
    });

    return summary;
  }

  /**
   * Bulk update items
   */
  bulkUpdate(checklistId: string, updates: Array<{
    itemId: string;
    updates: Partial<ComplianceItem>;
  }>): void {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) return;

    updates.forEach(({ itemId, updates }) => {
      const itemIndex = checklist.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        checklist.items[itemIndex] = {
          ...checklist.items[itemIndex],
          ...updates,
          updatedAt: new Date()
        };
      }
    });

    checklist.progress = this.calculateProgress(checklist.items);
    checklist.updatedAt = new Date();
  }

  /**
   * Clone checklist
   */
  cloneChecklist(checklistId: string, newName: string): ComplianceChecklist {
    const original = this.checklists.get(checklistId);
    if (!original) {
      throw new Error(`Checklist not found: ${checklistId}`);
    }

    const cloned: ComplianceChecklist = {
      ...original,
      id: `checklist_${Date.now()}`,
      name: newName,
      items: original.items.map(item => ({
        ...item,
        id: `${item.id}_clone_${Date.now()}`,
        status: 'pending' as ComplianceStatus,
        reviewedBy: undefined,
        reviewedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      progress: { total: original.items.length, completed: 0, pending: original.items.length, blocked: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.checklists.set(cloned.id, cloned);
    return cloned;
  }

  /**
   * Delete checklist
   */
  deleteChecklist(checklistId: string): boolean {
    return this.checklists.delete(checklistId);
  }

  /**
   * Get available templates
   */
  getTemplates(): ChecklistTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add template
   */
  addTemplate(template: ChecklistTemplate): void {
    this.templates.set(template.id, template);
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

  private estimateCompletion(checklist: ComplianceChecklist): Date | undefined {
    const pendingItems = checklist.items.filter(item => item.status === 'pending' && item.dueDate);
    if (pendingItems.length === 0) return undefined;

    const latestDueDate = new Date(Math.max(...pendingItems.map(item => item.dueDate!.getTime())));
    return latestDueDate;
  }

  private loadDefaultTemplates(): void {
    // GDPR Compliance Template
    this.addTemplate({
      id: 'gdpr-compliance',
      name: 'GDPR Compliance Checklist',
      description: 'Comprehensive GDPR compliance requirements',
      framework: 'GDPR',
      category: 'Privacy',
      items: [
        {
          title: 'Data Processing Inventory',
          description: 'Maintain a comprehensive inventory of all data processing activities',
          category: 'Data Governance',
          framework: 'GDPR',
          status: 'pending',
          riskLevel: 'high',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Privacy Policy',
          description: 'Publish and maintain a comprehensive privacy policy',
          category: 'Documentation',
          framework: 'GDPR',
          status: 'pending',
          riskLevel: 'critical',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Data Subject Rights',
          description: 'Implement processes for data subject access, rectification, and erasure requests',
          category: 'User Rights',
          framework: 'GDPR',
          status: 'pending',
          riskLevel: 'high',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    // Security Compliance Template
    this.addTemplate({
      id: 'security-compliance',
      name: 'Security Compliance Checklist',
      description: 'Security controls and compliance requirements',
      framework: 'ISO27001',
      category: 'Security',
      items: [
        {
          title: 'Access Control',
          description: 'Implement proper access controls and authentication mechanisms',
          category: 'Access Management',
          framework: 'ISO27001',
          status: 'pending',
          riskLevel: 'critical',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Encryption',
          description: 'Encrypt data at rest and in transit',
          category: 'Data Protection',
          framework: 'ISO27001',
          status: 'pending',
          riskLevel: 'high',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      ]
    });
  }
}

// Export singleton instance
export const checklistTracker = new ChecklistTracker();

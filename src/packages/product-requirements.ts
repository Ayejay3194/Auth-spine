/**
 * Product Requirements for Legal & Compliance Disaster Kit
 * 
 * Manages compliance-related product requirements including
 * data export, deletion, consent management, log redaction, and access control.
 */

import { ProductRequirement } from './types.js';

export class ProductRequirementsManager {
  private requirements: Map<string, ProductRequirement> = new Map();

  /**
   * Initialize product requirements manager
   */
  async initialize(): Promise<void> {
    // Load default compliance requirements
  }

  /**
   * Add requirement
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
  updateStatus(id: string, status: ProductRequirement['status'], actualHours?: number): void {
    const requirement = this.requirements.get(id);
    if (!requirement) return;

    requirement.status = status;
    requirement.updatedAt = new Date();
    
    if (actualHours !== undefined) {
      requirement.actualHours = actualHours;
    }
  }
}

// Export singleton instance
export const productRequirementsManager = new ProductRequirementsManager();

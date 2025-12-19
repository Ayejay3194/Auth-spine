/**
 * Risk Acceptance for Security Governance & Enforcement Layer
 * 
 * Manages risk acceptance records for security controls that cannot
 * be immediately implemented or fixed.
 */

import { RiskAcceptance } from './types.js';

export class RiskAcceptanceManager {
  private acceptances: Map<string, RiskAcceptance> = new Map();

  /**
   * Initialize risk acceptance manager
   */
  async initialize(): Promise<void> {
    this.cleanupExpiredAcceptances();
  }

  /**
   * Request risk acceptance
   */
  request(request: Omit<RiskAcceptance, 'id' | 'createdAt' | 'status'>): RiskAcceptance {
    const riskAcceptance: RiskAcceptance = {
      ...request,
      id: `risk_${request.controlId}_${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date()
    };

    this.acceptances.set(riskAcceptance.id, riskAcceptance);
    return riskAcceptance;
  }

  /**
   * Approve risk acceptance
   */
  approve(id: string, approver: string): void {
    const acceptance = this.acceptances.get(id);
    if (acceptance) {
      acceptance.status = 'ACTIVE';
      acceptance.approver = approver;
      acceptance.reviewedAt = new Date();
    }
  }

  /**
   * Revoke risk acceptance
   */
  revoke(id: string): void {
    const acceptance = this.acceptances.get(id);
    if (acceptance) {
      acceptance.status = 'REVOKED';
    }
  }

  /**
   * Get risk acceptance by ID
   */
  get(id: string): RiskAcceptance | undefined {
    return this.acceptances.get(id);
  }

  /**
   * Get all risk acceptances
   */
  getAll(): RiskAcceptance[] {
    return Array.from(this.acceptances.values());
  }

  /**
   * Get active risk acceptances
   */
  getActive(): RiskAcceptance[] {
    return Array.from(this.acceptances.values()).filter(acceptance => 
      acceptance.status === 'ACTIVE' && acceptance.expirationDate > new Date()
    );
  }

  /**
   * Get active exemption for a control
   */
  getActiveExemption(controlId: string): RiskAcceptance | undefined {
    return this.getActive().find(acceptance => 
      acceptance.controlId === controlId
    );
  }

  /**
   * Get expiring acceptances
   */
  getExpiring(days: number = 7): RiskAcceptance[] {
    const cutoff = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
    return this.getActive().filter(acceptance => 
      acceptance.expirationDate <= cutoff
    );
  }

  /**
   * Search risk acceptances
   */
  search(query: string, filters?: {
    controlId?: string;
    owner?: string;
    approver?: string;
    status?: RiskAcceptance['status'];
  }): RiskAcceptance[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.acceptances.values()).filter(acceptance => {
      // Text search
      const matchesQuery = 
        acceptance.id.toLowerCase().includes(lowerQuery) ||
        acceptance.reason.toLowerCase().includes(lowerQuery) ||
        acceptance.mitigationPlan.toLowerCase().includes(lowerQuery);

      // Apply filters
      if (filters?.controlId && acceptance.controlId !== filters.controlId) return false;
      if (filters?.owner && acceptance.owner !== filters.owner) return false;
      if (filters?.approver && acceptance.approver !== filters.approver) return false;
      if (filters?.status && acceptance.status !== filters.status) return false;

      return matchesQuery;
    });
  }

  /**
   * Update risk acceptance
   */
  update(id: string, updates: Partial<RiskAcceptance>): void {
    const acceptance = this.acceptances.get(id);
    if (acceptance) {
      Object.assign(acceptance, updates);
    }
  }

  /**
   * Delete risk acceptance
   */
  delete(id: string): boolean {
    return this.acceptances.delete(id);
  }

  private cleanupExpiredAcceptances(): void {
    const now = new Date();
    const expired: string[] = [];

    this.acceptances.forEach((acceptance, id) => {
      if (acceptance.expirationDate < now && acceptance.status === 'ACTIVE') {
        acceptance.status = 'EXPIRED';
        expired.push(id);
      }
    });

    // Schedule cleanup to run periodically
    setInterval(() => {
      this.cleanupExpiredAcceptances();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }
}

// Export singleton instance
export const riskAcceptanceManager = new RiskAcceptanceManager();

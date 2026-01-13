/**
 * Billing Controls for Legal & Compliance Disaster Kit
 * 
 * Manages usage limits, spend alerts, approval requirements,
 * and auto-scaling controls for compliance billing.
 */

import { BillingControl } from './types.js';

export class BillingControlsManager {
  private controls: Map<string, BillingControl> = new Map();

  /**
   * Add billing control
   */
  addControl(control: BillingControl): void {
    this.controls.set(control.id, control);
  }

  /**
   * Get control by ID
   */
  getControl(id: string): BillingControl | undefined {
    return this.controls.get(id);
  }

  /**
   * Get all controls
   */
  getAllControls(): BillingControl[] {
    return Array.from(this.controls.values());
  }

  /**
   * Update control threshold
   */
  updateThreshold(id: string, threshold: number): void {
    const control = this.controls.get(id);
    if (control) {
      control.threshold = threshold;
      control.updatedAt = new Date();
    }
  }

  /**
   * Check if control is triggered
   */
  checkTrigger(id: string): boolean {
    const control = this.controls.get(id);
    if (!control) return false;

    const triggered = control.current >= control.threshold;
    if (triggered && control.status !== 'triggered') {
      control.status = 'triggered';
      control.lastTriggered = new Date();
      control.updatedAt = new Date();
    }

    return triggered;
  }
}

// Export singleton instance
export const billingControlsManager = new BillingControlsManager();

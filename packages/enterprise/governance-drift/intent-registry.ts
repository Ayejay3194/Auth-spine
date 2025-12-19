/**
 * Intent Registry for Governance & Drift Control Layer
 * 
 * Manages product intents to ensure every feature/change references
 * a clear intent and preserves original purpose at scale.
 */

import { ProductIntent, IntentValidation } from './types.js';

export class IntentRegistry {
  private intents: Map<string, ProductIntent> = new Map();
  private validations: Map<string, IntentValidation> = new Map();

  /**
   * Initialize intent registry
   */
  async initialize(): Promise<void> {
    // Load default intents and validation rules
  }

  /**
   * Register new product intent
   */
  register(intent: Omit<ProductIntent, 'intentId' | 'createdAt' | 'status'>): ProductIntent {
    const productIntent: ProductIntent = {
      ...intent,
      intentId: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'draft'
    };

    this.intents.set(productIntent.intentId, productIntent);
    return productIntent;
  }

  /**
   * Get intent by ID
   */
  get(intentId: string): ProductIntent | undefined {
    return this.intents.get(intentId);
  }

  /**
   * Get all intents
   */
  getAll(): ProductIntent[] {
    return Array.from(this.intents.values());
  }

  /**
   * Update intent status
   */
  updateStatus(intentId: string, status: ProductIntent['status'], approvedBy?: string): void {
    const intent = this.intents.get(intentId);
    if (!intent) return;

    intent.status = status;
    if (status === 'approved' && approvedBy) {
      intent.approvedBy = approvedBy;
      intent.reviewedAt = new Date();
    }
  }

  /**
   * Validate intent
   */
  async validate(intentId: string): Promise<IntentValidation> {
    const intent = this.intents.get(intentId);
    if (!intent) {
      throw new Error(`Intent not found: ${intentId}`);
    }

    const issues: IntentValidation['issues'] = [];

    // Validate required fields
    if (!intent.solves || intent.solves.trim().length === 0) {
      issues.push({
        type: 'missing',
        description: 'Problem statement is missing or empty',
        severity: 'high'
      });
    }

    if (!intent.success || intent.success.trim().length === 0) {
      issues.push({
        type: 'missing',
        description: 'Success definition is missing or empty',
        severity: 'high'
      });
    }

    if (!intent.failure || intent.failure.trim().length === 0) {
      issues.push({
        type: 'missing',
        description: 'Failure definition is missing or empty',
        severity: 'medium'
      });
    }

    // Validate clarity
    if (intent.solves.length < 10) {
      issues.push({
        type: 'unclear',
        description: 'Problem statement is too brief to be meaningful',
        severity: 'medium'
      });
    }

    // Validate measurability
    if (!this.isMeasurable(intent.success)) {
      issues.push({
        type: 'unmeasurable',
        description: 'Success definition is not measurable',
        severity: 'medium'
      });
    }

    const validation: IntentValidation = {
      intentId,
      featureName: intent.feature,
      validationStatus: issues.length === 0 ? 'valid' : issues.some(i => i.severity === 'high') ? 'invalid' : 'partial',
      issues,
      approved: issues.length === 0,
      reviewedBy: 'system',
      reviewedAt: new Date()
    };

    this.validations.set(intentId, validation);
    return validation;
  }

  /**
   * Get validation by intent ID
   */
  getValidation(intentId: string): IntentValidation | undefined {
    return this.validations.get(intentId);
  }

  /**
   * Search intents
   */
  search(query: string, filters?: {
    owner?: string;
    status?: ProductIntent['status'];
    feature?: string;
  }): ProductIntent[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.intents.values()).filter(intent => {
      // Text search
      const matchesQuery = 
        intent.feature.toLowerCase().includes(lowerQuery) ||
        intent.solves.toLowerCase().includes(lowerQuery) ||
        intent.for.toLowerCase().includes(lowerQuery);

      // Apply filters
      if (filters?.owner && intent.owner !== filters.owner) return false;
      if (filters?.status && intent.status !== filters.status) return false;
      if (filters?.feature && !intent.feature.toLowerCase().includes(filters.feature.toLowerCase())) return false;

      return matchesQuery;
    });
  }

  private isMeasurable(success: string): boolean {
    const measurableKeywords = [
      'increase', 'decrease', 'reduce', 'improve', 'achieve',
      '%', 'percent', 'number', 'count', 'time', 'rate',
      'within', 'less than', 'more than', 'days', 'hours'
    ];

    return measurableKeywords.some(keyword => 
      success.toLowerCase().includes(keyword)
    );
  }
}

// Export singleton instance
export const intentRegistry = new IntentRegistry();

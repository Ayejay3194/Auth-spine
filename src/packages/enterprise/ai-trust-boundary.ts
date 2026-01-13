/**
 * AI Trust Boundary for Security Governance & Enforcement Layer
 * 
 * Enforces security boundaries for AI operations to prevent
 * unauthorized data access and model execution.
 */

import { AITrustBoundary, AIViolation } from './types.js';

export class AITrustBoundaryManager {
  private boundaries: Map<string, AITrustBoundary> = new Map();
  private violations: Map<string, AIViolation> = new Map();

  /**
   * Initialize AI trust boundary
   */
  async initialize(): Promise<void> {
    this.loadDefaultBoundaries();
  }

  /**
   * Add AI trust boundary
   */
  addBoundary(boundary: Omit<AITrustBoundary, 'id' | 'violations'>): AITrustBoundary {
    const aiBoundary: AITrustBoundary = {
      ...boundary,
      id: `boundary_${boundary.type}_${Date.now()}`,
      violations: []
    };

    this.boundaries.set(aiBoundary.id, aiBoundary);
    return aiBoundary;
  }

  /**
   * Check AI operation against trust boundaries
   */
  check(operation: {
    type: string;
    model?: string;
    dataType?: string;
    operation?: string;
    endpoint?: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): {
    allowed: boolean;
    violation?: AIViolation;
    sanitized?: any;
  } {
    const relevantBoundaries = Array.from(this.boundaries.values()).filter(boundary => 
      boundary.type === operation.type
    );

    for (const boundary of relevantBoundaries) {
      const result = this.validateOperation(boundary, operation);
      if (!result.allowed) {
        this.recordViolation(boundary, operation, result.reason!);
        return {
          allowed: false,
          violation: result.violation
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get all trust boundaries
   */
  getBoundaries(): AITrustBoundary[] {
    return Array.from(this.boundaries.values());
  }

  /**
   * Get violations
   */
  getViolations(): AIViolation[] {
    return Array.from(this.violations.values());
  }

  /**
   * Get violations by boundary
   */
  getViolationsByBoundary(boundaryId: string): AIViolation[] {
    const boundary = this.boundaries.get(boundaryId);
    return boundary ? boundary.violations : [];
  }

  /**
   * Clear violations
   */
  clearViolations(boundaryId?: string): void {
    if (boundaryId) {
      const boundary = this.boundaries.get(boundaryId);
      if (boundary) {
        boundary.violations = [];
      }
    } else {
      this.violations.clear();
      this.boundaries.forEach(boundary => {
        boundary.violations = [];
      });
    }
  }

  private loadDefaultBoundaries(): void {
    // Data Access Boundary
    this.addBoundary({
      name: 'Database Access Control',
      description: 'Prevents direct database access by AI assistants',
      type: 'data-access',
      restrictions: {
        allowedModels: ['gpt-4', 'claude-3'],
        allowedDataTypes: ['public', 'analytics'],
        blockedOperations: ['SELECT *', 'DELETE', 'UPDATE', 'INSERT'],
        maxTokens: 4000
      },
      enforcement: 'STRICT',
      monitoring: {
        logLevel: 'WARN',
        auditLog: true,
        realTimeAlerts: true
      }
    });

    // Model Execution Boundary
    this.addBoundary({
      name: 'Model Execution Limits',
      description: 'Controls which models can be executed and with what parameters',
      type: 'model-execution',
      restrictions: {
        allowedModels: ['gpt-4', 'claude-3', 'llama-2'],
        allowedDataTypes: ['text', 'json'],
        blockedOperations: ['system-prompt', 'model-fine-tuning'],
        maxTokens: 8000
      },
      enforcement: 'PERMISSIVE',
      monitoring: {
        logLevel: 'INFO',
        auditLog: true,
        realTimeAlerts: false
      }
    });

    // API Call Boundary
    this.addBoundary({
      name: 'External API Restrictions',
      description: 'Restricts external API calls made by AI',
      type: 'api-call',
      restrictions: {
        allowedModels: ['gpt-4'],
        allowedDataTypes: ['json'],
        blockedOperations: ['DELETE', 'PUT', 'PATCH'],
        allowedEndpoints: ['api.internal.com', 'analytics.service.com']
      },
      enforcement: 'MONITOR',
      monitoring: {
        logLevel: 'ERROR',
        auditLog: true,
        realTimeAlerts: true
      }
    });
  }

  private validateOperation(boundary: AITrustBoundary, operation: any): {
    allowed: boolean;
    reason?: string;
    violation?: AIViolation;
  } {
    const { restrictions } = boundary;

    // Check model restrictions
    if (operation.model && !restrictions.allowedModels.includes(operation.model)) {
      return {
        allowed: false,
        reason: `Model ${operation.model} not in allowed list`
      };
    }

    // Check data type restrictions
    if (operation.dataType && !restrictions.allowedDataTypes.includes(operation.dataType)) {
      return {
        allowed: false,
        reason: `Data type ${operation.dataType} not allowed`
      };
    }

    // Check blocked operations
    if (operation.operation && restrictions.blockedOperations.includes(operation.operation)) {
      return {
        allowed: false,
        reason: `Operation ${operation.operation} is blocked`
      };
    }

    // Check endpoint restrictions
    if (operation.endpoint && restrictions.allowedEndpoints && 
        !restrictions.allowedEndpoints.some(endpoint => operation.endpoint.includes(endpoint))) {
      return {
        allowed: false,
        reason: `Endpoint ${operation.endpoint} not allowed`
      };
    }

    // Check token limits
    if (operation.metadata?.tokenCount && restrictions.maxTokens && 
        operation.metadata.tokenCount > restrictions.maxTokens) {
      return {
        allowed: false,
        reason: `Token count exceeds limit of ${restrictions.maxTokens}`
      };
    }

    return { allowed: true };
  }

  private recordViolation(boundary: AITrustBoundary, operation: any, reason: string): void {
    const violation: AIViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      boundaryId: boundary.id,
      timestamp: new Date(),
      type: boundary.type.toUpperCase() as AIViolation['type'],
      severity: 'HIGH',
      description: reason,
      userId: operation.userId,
      sessionId: operation.sessionId,
      metadata: operation.metadata || {},
      resolved: false
    };

    this.violations.set(violation.id, violation);
    boundary.violations.push(violation);

    // Log the violation
    console.log(`AI Trust Boundary Violation: ${reason}`, {
      boundaryId: boundary.id,
      userId: operation.userId,
      timestamp: violation.timestamp
    });
  }
}

// Export singleton instance
export const aiTrustBoundary = new AITrustBoundaryManager();

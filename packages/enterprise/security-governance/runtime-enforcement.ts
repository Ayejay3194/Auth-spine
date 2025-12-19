/**
 * Runtime Enforcement for Security Governance & Enforcement Layer
 * 
 * Enforces security controls at runtime including data sanitization,
 * access control, encryption, and audit logging.
 */

import { RuntimeEnforcement, EnforcementResult, SecurityAudit } from './types.js';

export class RuntimeEnforcementManager {
  private enforcements: Map<string, RuntimeEnforcement> = new Map();

  /**
   * Initialize runtime enforcement
   */
  async initialize(): Promise<void> {
    this.loadDefaultEnforcements();
  }

  /**
   * Add runtime enforcement
   */
  addEnforcement(enforcement: Omit<RuntimeEnforcement, 'id' | 'metrics'>): RuntimeEnforcement {
    const runtimeEnforcement: RuntimeEnforcement = {
      ...enforcement,
      id: `runtime_${enforcement.type}_${Date.now()}`,
      metrics: {
        executions: 0,
        violations: 0,
        blocked: 0,
        lastExecution: new Date()
      }
    };

    this.enforcements.set(runtimeEnforcement.id, runtimeEnforcement);
    return runtimeEnforcement;
  }

  /**
   * Enforce security at runtime
   */
  enforce(context: {
    operation: string;
    data?: any;
    user?: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  }): EnforcementResult {
    const violations: SecurityAudit[] = [];
    const warnings: SecurityAudit[] = [];
    const exemptions: any[] = [];
    let blocked = false;

    const relevantEnforcements = Array.from(this.enforcements.values()).filter(enforcement => 
      enforcement.enabled
    );

    for (const enforcement of relevantEnforcements) {
      const result = this.executeEnforcement(enforcement, context);
      
      violations.push(...result.violations);
      warnings.push(...result.warnings);
      
      if (result.blocked) {
        blocked = true;
        enforcement.metrics.blocked++;
      }
      
      enforcement.metrics.executions++;
      enforcement.metrics.lastExecution = new Date();
    }

    const summary = this.generateRuntimeSummary(violations, warnings, blocked);

    return {
      success: !blocked,
      blocked,
      violations,
      warnings,
      exemptions,
      summary
    };
  }

  /**
   * Get all enforcements
   */
  getEnforcements(): RuntimeEnforcement[] {
    return Array.from(this.enforcements.values());
  }

  /**
   * Get enforcement metrics
   */
  getMetrics(): Record<string, RuntimeEnforcement['metrics']> {
    const metrics: Record<string, RuntimeEnforcement['metrics']> = {};
    
    this.enforcements.forEach((enforcement, id) => {
      metrics[id] = { ...enforcement.metrics };
    });

    return metrics;
  }

  private loadDefaultEnforcements(): void {
    // Data Sanitization Enforcement
    this.addEnforcement({
      name: 'Data Sanitization',
      type: 'data-sanitization',
      config: {
        sanitizePII: true,
        sanitizeCredentials: true,
        allowedFields: ['id', 'name', 'email'],
        blockedFields: ['password', 'ssn', 'credit_card']
      },
      enabled: true,
      enforcement: 'SANITIZE'
    });

    // Access Control Enforcement
    this.addEnforcement({
      name: 'Access Control',
      type: 'access-control',
      config: {
        requireAuthentication: true,
        requireAuthorization: true,
        sessionTimeout: 3600
      },
      enabled: true,
      enforcement: 'BLOCK'
    });

    // Encryption Enforcement
    this.addEnforcement({
      name: 'Data Encryption',
      type: 'encryption',
      config: {
        encryptAtRest: true,
        encryptInTransit: true,
        algorithm: 'AES-256'
      },
      enabled: true,
      enforcement: 'BLOCK'
    });

    // Audit Enforcement
    this.addEnforcement({
      name: 'Security Audit',
      type: 'audit',
      config: {
        logAllAccess: true,
        logDataChanges: true,
        logFailures: true
      },
      enabled: true,
      enforcement: 'LOG'
    });

    // Rate Limiting Enforcement
    this.addEnforcement({
      name: 'Rate Limiting',
      type: 'rate-limit',
      config: {
        requestsPerMinute: 100,
        burstLimit: 200,
        blockDuration: 300
      },
      enabled: true,
      enforcement: 'BLOCK'
    });
  }

  private executeEnforcement(enforcement: RuntimeEnforcement, context: any): {
    violations: SecurityAudit[];
    warnings: SecurityAudit[];
    blocked: boolean;
  } {
    const violations: SecurityAudit[] = [];
    const warnings: SecurityAudit[] = [];
    let blocked = false;

    switch (enforcement.type) {
      case 'data-sanitization':
        const sanitizationResult = this.enforceDataSanitization(enforcement, context);
        if (sanitizationResult.violation) {
          violations.push(sanitizationResult.violation);
        }
        if (sanitizationResult.warning) {
          warnings.push(sanitizationResult.warning);
        }
        break;

      case 'access-control':
        const accessResult = this.enforceAccessControl(enforcement, context);
        if (accessResult.violation) {
          violations.push(accessResult.violation);
          blocked = enforcement.enforcement === 'BLOCK';
        }
        break;

      case 'encryption':
        const encryptionResult = this.enforceEncryption(enforcement, context);
        if (encryptionResult.violation) {
          violations.push(encryptionResult.violation);
          blocked = enforcement.enforcement === 'BLOCK';
        }
        break;

      case 'audit':
        this.enforceAudit(enforcement, context);
        break;

      case 'rate-limit':
        const rateLimitResult = this.enforceRateLimit(enforcement, context);
        if (rateLimitResult.violation) {
          violations.push(rateLimitResult.violation);
          blocked = enforcement.enforcement === 'BLOCK';
        }
        break;
    }

    return { violations, warnings, blocked };
  }

  private enforceDataSanitization(enforcement: RuntimeEnforcement, context: any): {
    violation?: SecurityAudit;
    warning?: SecurityAudit;
  } {
    const config = enforcement.config;
    
    if (!context.data) return {};

    // Check for blocked fields
    const blockedFields = config.blockedFields || [];
    const foundBlockedFields = blockedFields.filter(field => 
      context.data.hasOwnProperty(field)
    );

    if (foundBlockedFields.length > 0) {
      return {
        violation: {
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          type: 'VIOLATION',
          severity: 'ERROR',
          message: `Blocked fields found in data: ${foundBlockedFields.join(', ')}`,
          details: { blockedFields: foundBlockedFields, dataKeys: Object.keys(context.data) }
        }
      };
    }

    return {};
  }

  private enforceAccessControl(enforcement: RuntimeEnforcement, context: any): {
    violation?: SecurityAudit;
  } {
    const config = enforcement.config;
    
    if (config.requireAuthentication && !context.user) {
      return {
        violation: {
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          type: 'VIOLATION',
          severity: 'ERROR',
          message: 'Authentication required but not provided',
          details: { operation: context.operation }
        }
      };
    }

    if (config.requireAuthorization && context.permissions && context.permissions.length === 0) {
      return {
        violation: {
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          type: 'VIOLATION',
          severity: 'ERROR',
          message: 'Authorization required but no permissions found',
          details: { operation: context.operation, user: context.user }
        }
      };
    }

    return {};
  }

  private enforceEncryption(enforcement: RuntimeEnforcement, context: any): {
    violation?: SecurityAudit;
  } {
    // Simulate encryption enforcement
    // In a real implementation, this would check if data is properly encrypted
    return {};
  }

  private enforceAudit(enforcement: RuntimeEnforcement, context: any): void {
    const config = enforcement.config;
    
    if (config.logAllAccess || config.logDataChanges) {
      console.log(`Security Audit: ${context.operation}`, {
        user: context.user,
        timestamp: new Date(),
        metadata: context.metadata
      });
    }
  }

  private enforceRateLimit(enforcement: RuntimeEnforcement, context: any): {
    violation?: SecurityAudit;
  } {
    // Simulate rate limiting
    // In a real implementation, this would check actual rate limits
    const isOverLimit = Math.random() > 0.95; // 5% chance of being over limit
    
    if (isOverLimit) {
      return {
        violation: {
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          type: 'VIOLATION',
          severity: 'WARN',
          message: 'Rate limit exceeded',
          details: { operation: context.operation, user: context.user }
        }
      };
    }

    return {};
  }

  private generateRuntimeSummary(
    violations: SecurityAudit[], 
    warnings: SecurityAudit[], 
    blocked: boolean
  ): string {
    const parts: string[] = [];

    if (blocked) {
      parts.push('OPERATION BLOCKED');
    }

    if (violations.length > 0) {
      parts.push(`${violations.length} violations`);
    }

    if (warnings.length > 0) {
      parts.push(`${warnings.length} warnings`);
    }

    if (parts.length === 0) {
      return 'Runtime security checks passed';
    }

    return `Runtime enforcement: ${parts.join(', ')}`;
  }
}

// Export singleton instance
export const runtimeEnforcement = new RuntimeEnforcementManager();

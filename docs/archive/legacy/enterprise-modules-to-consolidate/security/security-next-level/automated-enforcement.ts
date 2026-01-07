/**
 * Automated Enforcement for Security Next-Level Suite
 * 
 * Provides automated enforcement and guardrails that turn security
 * policies into actionable, automated controls.
 */

import { EnforcementGuardrail, EnforcementMode } from './types.js';

export class AutomatedEnforcementManager {
  private guardrails: Map<string, EnforcementGuardrail> = new Map();
  private initialized = false;

  /**
   * Initialize automated enforcement
   */
  async initialize(): Promise<void> {
    this.loadDefaultGuardrails();
    this.initialized = true;
  }

  /**
   * Get all guardrails or filter by category
   */
  getGuardrails(category?: string): EnforcementGuardrail[] {
    const allGuardrails = Array.from(this.guardrails.values());
    
    if (category) {
      return allGuardrails.filter(guardrail => guardrail.category === category);
    }
    
    return allGuardrails;
  }

  /**
   * Execute guardrail
   */
  async executeGuardrail(guardrailId: string, context: any): Promise<{
    success: boolean;
    blocked: boolean;
    violations: string[];
    actions: string[];
  }> {
    const guardrail = this.guardrails.get(guardrailId);
    if (!guardrail || !guardrail.enabled) {
      return {
        success: true,
        blocked: false,
        violations: [],
        actions: []
      };
    }

    // Update metrics
    guardrail.metrics.executions++;
    guardrail.metrics.lastExecution = new Date();

    // Check if conditions are met
    const shouldTrigger = this.evaluateConditions(guardrail, context);
    
    if (!shouldTrigger) {
      return {
        success: true,
        blocked: false,
        violations: [],
        actions: []
      };
    }

    // Execute actions
    const results = await this.executeActions(guardrail, context);
    
    if (results.violations.length > 0) {
      guardrail.metrics.violations += results.violations.length;
    }
    
    if (results.blocked) {
      guardrail.metrics.blocked++;
    }

    return results;
  }

  /**
   * Add new guardrail
   */
  addGuardrail(guardrail: Omit<EnforcementGuardrail, 'id' | 'metrics'>): EnforcementGuardrail {
    const enforcementGuardrail: EnforcementGuardrail = {
      ...guardrail,
      id: `guardrail_${guardrail.category}_${Date.now()}`,
      metrics: {
        executions: 0,
        violations: 0,
        blocked: 0,
        lastExecution: new Date()
      }
    };

    this.guardrails.set(enforcementGuardrail.id, enforcementGuardrail);
    return enforcementGuardrail;
  }

  /**
   * Enable/disable guardrail
   */
  toggleGuardrail(guardrailId: string, enabled: boolean): void {
    const guardrail = this.guardrails.get(guardrailId);
    if (guardrail) {
      guardrail.enabled = enabled;
    }
  }

  /**
   * Get enforcement metrics
   */
  getEnforcementMetrics(): any {
    const guardrails = Array.from(this.guardrails.values());
    const activeGuardrails = guardrails.filter(g => g.enabled);
    
    const totalExecutions = guardrails.reduce((sum, g) => sum + g.metrics.executions, 0);
    const totalViolations = guardrails.reduce((sum, g) => sum + g.metrics.violations, 0);
    const totalBlocked = guardrails.reduce((sum, g) => sum + g.metrics.blocked, 0);
    
    const effectiveness = totalExecutions > 0 ? ((totalExecutions - totalViolations) / totalExecutions) * 100 : 100;
    const coverage = guardrails.length > 0 ? (activeGuardrails.length / guardrails.length) * 100 : 0;
    const violationRate = totalExecutions > 0 ? (totalViolations / totalExecutions) * 100 : 0;

    return {
      totalGuardrails: guardrails.length,
      activeGuardrails: activeGuardrails.length,
      totalExecutions,
      totalViolations,
      totalBlocked,
      effectiveness,
      coverage,
      violationRate,
      byCategory: this.getMetricsByCategory(guardrails)
    };
  }

  /**
   * Generate enforcement report
   */
  generateEnforcementReport(): any {
    const guardrails = Array.from(this.guardrails.values());
    const metrics = this.getEnforcementMetrics();

    return {
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      guardrailResults: guardrails.map(guardrail => ({
        guardrailId: guardrail.id,
        name: guardrail.name,
        executions: guardrail.metrics.executions,
        violations: guardrail.metrics.violations,
        blocked: guardrail.metrics.blocked,
        effectiveness: guardrail.metrics.executions > 0 ? 
          ((guardrail.metrics.executions - guardrail.metrics.violations) / guardrail.metrics.executions) * 100 : 100,
        enabled: guardrail.enabled,
        severity: guardrail.severity
      })),
      trends: {
        violations: this.generateViolationTrends(),
        blocked: this.generateBlockedTrends()
      },
      recommendations: this.generateEnforcementRecommendations(metrics),
      generatedAt: new Date()
    };
  }

  private loadDefaultGuardrails(): void {
    // Code Security Guardrails
    this.addGuardrail({
      name: 'Secret Detection in Code',
      description: 'Detect and block commits containing secrets',
      type: 'preventive',
      category: 'code',
      enforcement: 'block',
      conditions: {
        trigger: 'git_commit',
        criteria: {
          hasSecrets: true
        },
        exceptions: ['test_files', 'documentation']
      },
      actions: [
        {
          type: 'block',
          parameters: { message: 'Secrets detected in commit' }
        },
        {
          type: 'escalate',
          parameters: { channel: 'security', severity: 'high' }
        }
      ],
      enabled: true,
      severity: 'critical'
    });

    this.addGuardrail({
      name: 'Vulnerable Dependencies',
      description: 'Block builds with vulnerable dependencies',
      type: 'preventive',
      category: 'code',
      enforcement: 'enforce',
      conditions: {
        trigger: 'build',
        criteria: {
          hasVulnerabilities: true,
          severity: ['critical', 'high']
        },
        exceptions: []
      },
      actions: [
        {
          type: 'block',
          parameters: { message: 'Critical vulnerabilities found in dependencies' }
        },
        {
          type: 'remediate',
          parameters: { autoUpdate: false, createTicket: true }
        }
      ],
      enabled: true,
      severity: 'high'
    });

    // Configuration Security Guardrails
    this.addGuardrail({
      name: 'Insecure Configuration',
      description: 'Detect and block insecure configurations',
      type: 'preventive',
      category: 'config',
      enforcement: 'enforce',
      conditions: {
        trigger: 'deployment',
        criteria: {
          hasInsecureConfig: true
        },
        exceptions: ['development', 'testing']
      },
      actions: [
        {
          type: 'block',
          parameters: { message: 'Insecure configuration detected' }
        },
        {
          type: 'warn',
          parameters: { message: 'Review configuration settings' }
        }
      ],
      enabled: true,
      severity: 'high'
    });

    // Access Security Guardrails
    this.addGuardrail({
      name: 'Privileged Access',
      description: 'Monitor and control privileged access attempts',
      type: 'detective',
      category: 'access',
      enforcement: 'monitor',
      conditions: {
        trigger: 'access_request',
        criteria: {
          isPrivileged: true,
          requiresApproval: true
        },
        exceptions: ['emergency_access']
      },
      actions: [
        {
          type: 'log',
          parameters: { level: 'warn', message: 'Privileged access attempt' }
        },
        {
          type: 'escalate',
          parameters: { channel: 'security', requireApproval: true }
        }
      ],
      enabled: true,
      severity: 'medium'
    });

    // Data Security Guardrails
    this.addGuardrail({
      name: 'PII Data Access',
      description: 'Control access to personally identifiable information',
      type: 'preventive',
      category: 'data',
      enforcement: 'enforce',
      conditions: {
        trigger: 'data_access',
        criteria: {
          containsPII: true,
          hasAuthorization: false
        },
        exceptions: ['data_processing', 'analytics']
      },
      actions: [
        {
          type: 'block',
          parameters: { message: 'Unauthorized PII access attempt' }
        },
        {
          type: 'log',
          parameters: { level: 'error', message: 'PII access violation' }
        }
      ],
      enabled: true,
      severity: 'critical'
    });

    // Network Security Guardrails
    this.addGuardrail({
      name: 'Suspicious Network Activity',
      description: 'Detect and block suspicious network patterns',
      type: 'detective',
      category: 'network',
      enforcement: 'monitor',
      conditions: {
        trigger: 'network_request',
        criteria: {
          isSuspicious: true,
          threatScore: 80
        },
        exceptions: ['known_sources']
      },
      actions: [
        {
          type: 'block',
          parameters: { message: 'Suspicious network activity detected' }
        },
        {
          type: 'escalate',
          parameters: { channel: 'security', severity: 'high' }
        }
      ],
      enabled: true,
      severity: 'high'
    });
  }

  private evaluateConditions(guardrail: EnforcementGuardrail, context: any): boolean {
    const { criteria } = guardrail.conditions;
    
    // Simple condition evaluation - in real implementation, this would be more sophisticated
    for (const [key, value] of Object.entries(criteria)) {
      if (context[key] !== value) {
        // For array values, check if context value is included
        if (Array.isArray(value) && !value.includes(context[key])) {
          return false;
        } else if (!Array.isArray(value)) {
          return false;
        }
      }
    }
    
    return true;
  }

  private async executeActions(guardrail: EnforcementGuardrail, context: any): Promise<{
    success: boolean;
    blocked: boolean;
    violations: string[];
    actions: string[];
  }> {
    const results = {
      success: true,
      blocked: false,
      violations: [] as string[],
      actions: [] as string[]
    };

    for (const action of guardrail.actions) {
      switch (action.type) {
        case 'block':
          results.blocked = true;
          results.success = false;
          results.actions.push(`Blocked: ${action.parameters.message}`);
          results.violations.push(guardrail.description);
          break;
          
        case 'warn':
          results.actions.push(`Warning: ${action.parameters.message}`);
          break;
          
        case 'log':
          results.actions.push(`Logged: ${action.parameters.message}`);
          break;
          
        case 'escalate':
          results.actions.push(`Escalated to ${action.parameters.channel}`);
          break;
          
        case 'remediate':
          results.actions.push(`Remediation triggered`);
          break;
      }
    }

    return results;
  }

  private getMetricsByCategory(guardrails: EnforcementGuardrail[]): Record<string, any> {
    const categories = ['code', 'config', 'access', 'data', 'network'];
    const metrics: Record<string, any> = {};

    categories.forEach(category => {
      const categoryGuardrails = guardrails.filter(g => g.category === category);
      const active = categoryGuardrails.filter(g => g.enabled);
      
      metrics[category] = {
        total: categoryGuardrails.length,
        active: active.length,
        executions: active.reduce((sum, g) => sum + g.metrics.executions, 0),
        violations: active.reduce((sum, g) => sum + g.metrics.violations, 0),
        blocked: active.reduce((sum, g) => sum + g.metrics.blocked, 0)
      };
    });

    return metrics;
  }

  private generateViolationTrends(): Array<{ date: Date; count: number }> {
    const trends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      trends.push({
        date,
        count: Math.floor(Math.random() * 20) + 5 // Simulated data
      });
    }
    
    return trends;
  }

  private generateBlockedTrends(): Array<{ date: Date; count: number }> {
    const trends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      trends.push({
        date,
        count: Math.floor(Math.random() * 10) + 2 // Simulated data
      });
    }
    
    return trends;
  }

  private generateEnforcementRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.effectiveness < 95) {
      recommendations.push('Improve guardrail effectiveness to reduce violations');
    }
    
    if (metrics.violationRate > 5) {
      recommendations.push('Address high violation rate through better preventive controls');
    }
    
    if (metrics.coverage < 90) {
      recommendations.push('Enable more guardrails to improve security coverage');
    }
    
    const criticalViolations = metrics.byCategory.code?.violations || 0;
    if (criticalViolations > 10) {
      recommendations.push('Focus on code security guardrails to reduce critical violations');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Enforcement system is performing optimally');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const automatedEnforcement = new AutomatedEnforcementManager();

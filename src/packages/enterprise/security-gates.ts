/**
 * Security Gates for Security Governance & Enforcement Layer
 * 
 * CI/CD security gates that enforce controls at different stages
 * of the development lifecycle.
 */

import { SecurityGate, EnforcementResult, SecurityAudit } from './types.js';
import { controlRegistry } from './control-registry.js';
import { riskAcceptanceManager } from './risk-acceptance.js';

export class SecurityGates {
  private gates: Map<string, SecurityGate> = new Map();

  /**
   * Initialize security gates
   */
  async initialize(): Promise<void> {
    this.loadDefaultGates();
  }

  /**
   * Add security gate
   */
  add(gate: Omit<SecurityGate, 'id'>): SecurityGate {
    const securityGate: SecurityGate = {
      ...gate,
      id: `gate_${gate.stage}_${Date.now()}`
    };

    this.gates.set(securityGate.id, securityGate);
    return securityGate;
  }

  /**
   * Get gate by ID
   */
  get(id: string): SecurityGate | undefined {
    return this.gates.get(id);
  }

  /**
   * Get all gates
   */
  getAll(): SecurityGate[] {
    return Array.from(this.gates.values());
  }

  /**
   * Get gates by stage
   */
  getByStage(stage: SecurityGate['stage']): SecurityGate[] {
    return Array.from(this.gates.values()).filter(gate => 
      gate.stage === stage
    );
  }

  /**
   * Execute security gates for a stage
   */
  async execute(stage: string, context: any = {}): Promise<EnforcementResult> {
    const stageGates = this.getByStage(stage as SecurityGate['stage']);
    const violations: SecurityAudit[] = [];
    const warnings: SecurityAudit[] = [];
    const exemptions: any[] = [];
    let blocked = false;

    for (const gate of stageGates) {
      if (!gate.enabled) continue;

      // Check conditions
      if (!this.shouldExecuteGate(gate, context)) continue;

      const result = await this.executeGate(gate, context);
      
      violations.push(...result.violations);
      warnings.push(...result.warnings);
      exemptions.push(...result.exemptions);

      if (gate.enforcement === 'BLOCK' && result.violations.length > 0) {
        blocked = true;
      }
    }

    const summary = this.generateSummary(violations, warnings, exemptions, blocked);

    return {
      success: !blocked,
      blocked,
      violations,
      warnings,
      exemptions,
      summary
    };
  }

  private loadDefaultGates(): void {
    const defaultGates: Omit<SecurityGate, 'id'>[] = [
      {
        name: 'Pre-commit Security Scan',
        description: 'Scan for secrets and vulnerabilities before commit',
        stage: 'pre-commit',
        controls: ['SEC-DATA-004'],
        enforcement: 'BLOCK',
        conditions: {
          files: ['**/*.{js,ts,py,java,go}']
        },
        config: {
          scanSecrets: true,
          scanVulnerabilities: true
        },
        enabled: true
      },
      {
        name: 'Build Security Validation',
        description: 'Validate security controls during build',
        stage: 'build',
        controls: ['SEC-AUTH-001', 'SEC-DATA-001', 'SEC-INFRA-001'],
        enforcement: 'BLOCK',
        config: {
          runUnitTests: true,
          runSecurityTests: true
        },
        enabled: true
      },
      {
        name: 'Deploy Security Gate',
        description: 'Final security validation before deployment',
        stage: 'deploy',
        controls: ['SEC-AUTH-001', 'SEC-AI-007', 'SEC-DATA-004', 'SEC-AUTH-002'],
        enforcement: 'BLOCK',
        conditions: {
          environment: ['production', 'staging']
        },
        config: {
          runPenetrationTests: false,
          validateCertificates: true
        },
        enabled: true
      },
      {
        name: 'AI Security Validation',
        description: 'Validate AI security controls',
        stage: 'build',
        controls: ['SEC-AI-007'],
        enforcement: 'BLOCK',
        config: {
          validateDataAccess: true,
          validateModelExecution: true
        },
        enabled: true
      }
    ];

    defaultGates.forEach(gate => {
      this.add(gate);
    });
  }

  private shouldExecuteGate(gate: SecurityGate, context: any): boolean {
    if (!gate.conditions) return true;

    // Check branch conditions
    if (gate.conditions.branch && context.branch) {
      if (!gate.conditions.branch.includes(context.branch)) {
        return false;
      }
    }

    // Check environment conditions
    if (gate.conditions.environment && context.environment) {
      if (!gate.conditions.environment.includes(context.environment)) {
        return false;
      }
    }

    // Check file conditions
    if (gate.conditions.files && context.changedFiles) {
      const hasMatchingFiles = context.changedFiles.some((file: string) => 
        gate.conditions!.files!.some(pattern => this.matchPattern(pattern, file))
      );
      if (!hasMatchingFiles) {
        return false;
      }
    }

    return true;
  }

  private async executeGate(gate: SecurityGate, context: any): Promise<{
    violations: SecurityAudit[];
    warnings: SecurityAudit[];
    exemptions: any[];
  }> {
    const violations: SecurityAudit[] = [];
    const warnings: SecurityAudit[] = [];
    const exemptions: any[] = [];

    for (const controlId of gate.controls) {
      const control = controlRegistry.get(controlId);
      if (!control) {
        warnings.push({
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          type: 'CONTROL_VALIDATION',
          severity: 'WARN',
          message: `Security control ${controlId} not found`,
          details: { controlId, gateId: gate.id },
          controlId
        });
        continue;
      }

      // Check for active exemptions
      const exemption = riskAcceptanceManager.getActiveExemption(controlId);
      if (exemption) {
        exemptions.push(exemption);
        continue;
      }

      // Validate control
      const isValid = await this.validateControl(control, context);
      if (!isValid) {
        const audit: SecurityAudit = {
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          type: 'VIOLATION',
          severity: control.severity === 'CRITICAL' ? 'CRITICAL' : 'ERROR',
          message: `Security control ${controlId} validation failed`,
          details: { 
            controlId, 
            controlDescription: control.description,
            gateId: gate.id,
            stage: gate.stage
          },
          controlId,
          gateId: gate.id
        };

        if (control.severity === 'CRITICAL' || control.severity === 'HIGH') {
          violations.push(audit);
        } else {
          warnings.push(audit);
        }
      }
    }

    return { violations, warnings, exemptions };
  }

  private async validateControl(control: any, context: any): Promise<boolean> {
    // Simulate control validation
    // In a real implementation, this would run actual validation tests
    switch (control.id) {
      case 'SEC-AUTH-001':
        return this.validateTLS(control, context);
      case 'SEC-AI-007':
        return this.validateAIDBAccess(control, context);
      case 'SEC-DATA-004':
        return this.validateDataSanitization(control, context);
      case 'SEC-AUTH-002':
        return this.validateMFA(control, context);
      case 'SEC-DATA-001':
        return this.validateEncryption(control, context);
      case 'SEC-INFRA-001':
        return this.validateSecurityHeaders(control, context);
      default:
        return true; // Default to passing for unknown controls
    }
  }

  private validateTLS(control: any, context: any): boolean {
    // Simulate TLS validation
    return Math.random() > 0.1; // 90% pass rate
  }

  private validateAIDBAccess(control: any, context: any): boolean {
    // Simulate AI DB access validation
    return Math.random() > 0.05; // 95% pass rate
  }

  private validateDataSanitization(control: any, context: any): boolean {
    // Simulate data sanitization validation
    return Math.random() > 0.1; // 90% pass rate
  }

  private validateMFA(control: any, context: any): boolean {
    // Simulate MFA validation
    return Math.random() > 0.15; // 85% pass rate
  }

  private validateEncryption(control: any, context: any): boolean {
    // Simulate encryption validation
    return Math.random() > 0.05; // 95% pass rate
  }

  private validateSecurityHeaders(control: any, context: any): boolean {
    // Simulate security headers validation
    return Math.random() > 0.1; // 90% pass rate
  }

  private matchPattern(pattern: string, file: string): boolean {
    // Simple glob pattern matching
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
    );
    return regex.test(file);
  }

  private generateSummary(
    violations: SecurityAudit[], 
    warnings: SecurityAudit[], 
    exemptions: any[], 
    blocked: boolean
  ): string {
    const parts: string[] = [];

    if (blocked) {
      parts.push('DEPLOYMENT BLOCKED');
    }

    if (violations.length > 0) {
      parts.push(`${violations.length} violations`);
    }

    if (warnings.length > 0) {
      parts.push(`${warnings.length} warnings`);
    }

    if (exemptions.length > 0) {
      parts.push(`${exemptions.length} exemptions`);
    }

    if (parts.length === 0) {
      return 'All security checks passed';
    }

    return `Security gate results: ${parts.join(', ')}`;
  }
}

// Export singleton instance
export const securityGates = new SecurityGates();

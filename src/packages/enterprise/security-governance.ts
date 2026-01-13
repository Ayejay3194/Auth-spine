/**
 * Main Security Governance & Enforcement Layer Class
 * 
 * The central interface for enforcing security controls, managing risk acceptance,
 * and ensuring compliance across the entire development lifecycle.
 */

import { 
  SecurityConfig, 
  SecurityControl, 
  SecurityGate, 
  RiskAcceptance, 
  EnforcementResult,
  SecurityAudit
} from './types.js';
import { controlRegistry } from './control-registry.js';
import { securityGates } from './security-gates.js';
import { riskAcceptanceManager } from './risk-acceptance.js';
import { aiTrustBoundary } from './ai-trust-boundary.js';
import { runtimeEnforcement } from './runtime-enforcement.js';
import { loggingMonitoring } from './logging-monitoring.js';

export class SecurityGovernance {
  private config: SecurityConfig;
  private initialized = false;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enforceControls: true,
      blockOnFailure: true,
      requireRiskAcceptance: true,
      enableRuntimeEnforcement: true,
      enableCIGates: true,
      enableAITrustBoundary: true,
      logLevel: 'info',
      auditRetention: 2555,
      riskAcceptanceExpiration: 90,
      controlCategories: [
        'authentication',
        'authorization',
        'data-protection',
        'ai-security',
        'infrastructure',
        'logging',
        'monitoring'
      ],
      ...config
    };
  }

  /**
   * Initialize the security governance system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await controlRegistry.initialize();
      await securityGates.initialize();
      await riskAcceptanceManager.initialize();
      await aiTrustBoundary.initialize();
      await runtimeEnforcement.initialize();
      await loggingMonitoring.initialize();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Security Governance:', error);
      throw error;
    }
  }

  /**
   * Run security gates for CI/CD
   */
  async runSecurityGates(stage: string, context: any = {}): Promise<EnforcementResult> {
    if (!this.config.enableCIGates) {
      return {
        success: true,
        blocked: false,
        violations: [],
        warnings: [],
        exemptions: [],
        summary: 'Security gates disabled'
      };
    }

    return await securityGates.execute(stage, context);
  }

  /**
   * Validate security controls
   */
  async validateControls(controlIds?: string[]): Promise<{
    compliant: SecurityControl[];
    nonCompliant: SecurityControl[];
    exempted: Array<{ control: SecurityControl; exemption: RiskAcceptance }>;
  }> {
    const controls = controlIds 
      ? controlIds.map(id => controlRegistry.get(id)).filter(Boolean) as SecurityControl[]
      : controlRegistry.getAll();

    const compliant: SecurityControl[] = [];
    const nonCompliant: SecurityControl[] = [];
    const exempted: Array<{ control: SecurityControl; exemption: RiskAcceptance }> = [];

    for (const control of controls) {
      const exemption = riskAcceptanceManager.getActiveExemption(control.id);
      
      if (exemption) {
        exempted.push({ control, exemption });
      } else {
        const isValid = await this.validateControl(control);
        if (isValid) {
          compliant.push(control);
        } else {
          nonCompliant.push(control);
        }
      }
    }

    return { compliant, nonCompliant, exempted };
  }

  /**
   * Add security control
   */
  addControl(control: Omit<SecurityControl, 'id' | 'createdAt' | 'updatedAt'>): SecurityControl {
    return controlRegistry.add(control);
  }

  /**
   * Get security control
   */
  getControl(id: string): SecurityControl | undefined {
    return controlRegistry.get(id);
  }

  /**
   * Get all security controls
   */
  getAllControls(): SecurityControl[] {
    return controlRegistry.getAll();
  }

  /**
   * Add security gate
   */
  addGate(gate: Omit<SecurityGate, 'id'>): SecurityGate {
    return securityGates.add(gate);
  }

  /**
   * Get security gate
   */
  getGate(id: string): SecurityGate | undefined {
    return securityGates.get(id);
  }

  /**
   * Get all security gates
   */
  getAllGates(): SecurityGate[] {
    return securityGates.getAll();
  }

  /**
   * Request risk acceptance
   */
  requestRiskAcceptance(request: Omit<RiskAcceptance, 'id' | 'createdAt' | 'status'>): RiskAcceptance {
    return riskAcceptanceManager.request(request);
  }

  /**
   * Approve risk acceptance
   */
  approveRiskAcceptance(id: string, approver: string): void {
    riskAcceptanceManager.approve(id, approver);
  }

  /**
   * Get active risk acceptances
   */
  getActiveRiskAcceptances(): RiskAcceptance[] {
    return riskAcceptanceManager.getActive();
  }

  /**
   * Check AI trust boundary
   */
  checkAITrustBoundary(operation: any): {
    allowed: boolean;
    violation?: any;
    sanitized?: any;
  } {
    return aiTrustBoundary.check(operation);
  }

  /**
   * Get AI violations
   */
  getAIViolations(): any[] {
    return aiTrustBoundary.getViolations();
  }

  /**
   * Enforce runtime security
   */
  enforceRuntime(context: any): EnforcementResult {
    return runtimeEnforcement.enforce(context);
  }

  /**
   * Get security audits
   */
  getAudits(filter?: {
    type?: string;
    severity?: string;
    controlId?: string;
    startDate?: Date;
    endDate?: Date;
  }): SecurityAudit[] {
    return loggingMonitoring.getAudits(filter);
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(framework?: string): Promise<any> {
    const validation = await this.validateControls();
    const audits = this.getAudits({ type: 'COMPLIANCE_CHECK' });
    
    const totalControls = validation.compliant.length + validation.nonCompliant.length + validation.exempted.length;
    const compliantCount = validation.compliant.length;
    const nonCompliantCount = validation.nonCompliant.length;
    const exemptedCount = validation.exempted.length;
    
    const overallScore = totalControls > 0 ? (compliantCount / totalControls) * 100 : 0;

    return {
      id: `report_${Date.now()}`,
      timestamp: new Date(),
      framework: framework || 'ALL',
      overallScore,
      controls: {
        total: totalControls,
        compliant: compliantCount,
        nonCompliant: nonCompliantCount,
        exempted: exemptedCount
      },
      violations: audits.filter(a => a.severity === 'ERROR' || a.severity === 'CRITICAL'),
      recommendations: this.generateRecommendations(validation),
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Health check
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      controlRegistry: boolean;
      securityGates: boolean;
      riskAcceptance: boolean;
      aiTrustBoundary: boolean;
      runtimeEnforcement: boolean;
      loggingMonitoring: boolean;
    };
    overall: boolean;
  }> {
    const components = {
      controlRegistry: this.initialized,
      securityGates: this.initialized,
      riskAcceptance: this.initialized,
      aiTrustBoundary: this.initialized,
      runtimeEnforcement: this.initialized,
      loggingMonitoring: this.initialized
    };

    const overall = this.initialized && Object.values(components).every(status => status);

    return {
      initialized: this.initialized,
      components,
      overall
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }

  private async validateControl(control: SecurityControl): Promise<boolean> {
    // Implement control validation logic
    // This would run the control's validation tests
    return true; // Placeholder
  }

  private generateRecommendations(validation: {
    compliant: SecurityControl[];
    nonCompliant: SecurityControl[];
    exempted: Array<{ control: SecurityControl; exemption: RiskAcceptance }>;
  }): string[] {
    const recommendations: string[] = [];

    if (validation.nonCompliant.length > 0) {
      recommendations.push(`Address ${validation.nonCompliant.length} non-compliant controls`);
      
      const criticalControls = validation.nonCompliant.filter(c => c.severity === 'CRITICAL');
      if (criticalControls.length > 0) {
        recommendations.push(`Urgent: ${criticalControls.length} critical controls require immediate attention`);
      }
    }

    if (validation.exempted.length > 0) {
      const expiringSoon = validation.exempted.filter(e => 
        e.exemption.expirationDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 // 7 days
      );
      
      if (expiringSoon.length > 0) {
        recommendations.push(`${expiringSoon.length} risk acceptances expiring soon`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All controls are compliant - maintain current security posture');
    }

    return recommendations;
  }
}

// Export default instance
export const securityGovernance = new SecurityGovernance();

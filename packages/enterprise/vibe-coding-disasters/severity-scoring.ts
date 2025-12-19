/**
 * Severity Scoring System for Vibe Coding Disasters
 * 
 * Provides risk assessment and scoring based on severity levels,
 * business impact, and likelihood.
 */

import { RiskItem, RiskAssessment, SeverityLevel } from './types.js';

export interface ScoringWeights {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskContext {
  isProduction: boolean;
  hasPII: boolean;
  handlesMoney: boolean;
  isCustomerFacing: boolean;
  isInternalTool: boolean;
  teamSize: number;
  userCount: number;
}

export class SeverityScoring {
  private static readonly DEFAULT_WEIGHTS: ScoringWeights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1
  };

  /**
   * Calculate risk score for a set of risks
   */
  calculateRiskScore(risks: RiskItem[], weights: Partial<ScoringWeights> = {}): number {
    const finalWeights = { ...SeverityScoring.DEFAULT_WEIGHTS, ...weights };
    
    return risks.reduce((score, risk) => {
      return score + finalWeights[risk.severity.toLowerCase() as keyof ScoringWeights];
    }, 0);
  }

  /**
   * Assess overall risk level
   */
  assessRisks(risks: RiskItem[], context: Partial<RiskContext> = {}): RiskAssessment {
    const finalContext: RiskContext = {
      isProduction: false,
      hasPII: false,
      handlesMoney: false,
      isCustomerFacing: false,
      isInternalTool: false,
      teamSize: 5,
      userCount: 100,
      ...context
    };

    const totalRisks = risks.length;
    const criticalRisks = risks.filter(r => r.severity === 'CRITICAL').length;
    const highRisks = risks.filter(r => r.severity === 'HIGH').length;
    const mediumRisks = risks.filter(r => r.severity === 'MEDIUM').length;
    const lowRisks = risks.filter(r => r.severity === 'LOW').length;

    // Calculate weighted risk score
    const baseScore = this.calculateRiskScore(risks);
    const contextMultiplier = this.getContextMultiplier(finalContext);
    const riskScore = Math.round(baseScore * contextMultiplier);

    // Generate recommendations
    const recommendations = this.generateRecommendations(risks, finalContext);

    // Determine if blocked
    const blocked = criticalRisks > 0 || (highRisks > 0 && finalContext.isProduction);

    return {
      totalRisks,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      riskScore,
      recommendations,
      blocked
    };
  }

  /**
   * Get risk level description
   */
  getRiskLevel(score: number): {
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    color: string;
    description: string;
  } {
    if (score >= 50) {
      return {
        level: 'CRITICAL',
        color: '#dc2626',
        description: 'Critical risk - immediate action required'
      };
    } else if (score >= 25) {
      return {
        level: 'HIGH',
        color: '#ea580c',
        description: 'High risk - urgent attention needed'
      };
    } else if (score >= 10) {
      return {
        level: 'MEDIUM',
        color: '#d97706',
        description: 'Medium risk - should be addressed soon'
      };
    } else {
      return {
        level: 'LOW',
        color: '#65a30d',
        description: 'Low risk - monitor and address as needed'
      };
    }
  }

  /**
   * Prioritize risks by business impact
   */
  prioritizeRisks(risks: RiskItem[], context: Partial<RiskContext> = {}): RiskItem[] {
    const finalContext = {
      isProduction: false,
      hasPII: false,
      handlesMoney: false,
      isCustomerFacing: false,
      isInternalTool: false,
      ...context
    };

    return risks.sort((a, b) => {
      // Base priority by severity
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      const aSeverityOrder = severityOrder[a.severity];
      const bSeverityOrder = severityOrder[b.severity];

      if (aSeverityOrder !== bSeverityOrder) {
        return aSeverityOrder - bSeverityOrder;
      }

      // Context-based priority adjustments
      const aMultiplier = this.getRiskMultiplier(a, finalContext);
      const bMultiplier = this.getRiskMultiplier(b, finalContext);

      return bMultiplier - aMultiplier;
    });
  }

  /**
   * Generate risk report
   */
  generateRiskReport(risks: RiskItem[], context: Partial<RiskContext> = {}): {
    summary: RiskAssessment;
    breakdown: Record<string, RiskItem[]>;
    recommendations: string[];
    nextSteps: string[];
  } {
    const assessment = this.assessRisks(risks, context);
    
    // Group risks by category
    const breakdown: Record<string, RiskItem[]> = {};
    risks.forEach(risk => {
      if (!breakdown[risk.category]) {
        breakdown[risk.category] = [];
      }
      breakdown[risk.category].push(risk);
    });

    // Generate specific recommendations
    const recommendations = this.generateSpecificRecommendations(risks, context);

    // Generate next steps
    const nextSteps = this.generateNextSteps(assessment);

    return {
      summary: assessment,
      breakdown,
      recommendations,
      nextSteps
    };
  }

  private getContextMultiplier(context: RiskContext): number {
    let multiplier = 1.0;

    // Production environments have higher stakes
    if (context.isProduction) multiplier *= 2.0;
    
    // PII handling increases risk
    if (context.hasPII) multiplier *= 1.5;
    
    // Financial transactions increase risk
    if (context.handlesMoney) multiplier *= 1.8;
    
    // Customer-facing increases impact
    if (context.isCustomerFacing) multiplier *= 1.3;
    
    // Internal tools reduce risk slightly
    if (context.isInternalTool) multiplier *= 0.8;
    
    // Team size affects complexity
    if (context.teamSize > 20) multiplier *= 1.2;
    
    // User count affects impact
    if (context.userCount > 10000) multiplier *= 1.4;

    return multiplier;
  }

  private getRiskMultiplier(risk: RiskItem, context: RiskContext): number {
    let multiplier = 1.0;

    // Context-specific risk adjustments
    if (risk.category.includes('SECURITY') && context.hasPII) multiplier *= 1.5;
    if (risk.category.includes('FINANCIAL') && context.handlesMoney) multiplier *= 1.8;
    if (risk.category.includes('LEGAL') && context.isCustomerFacing) multiplier *= 1.3;
    
    return multiplier;
  }

  private generateRecommendations(risks: RiskItem[], context: RiskContext): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = risks.filter(r => r.severity === 'CRITICAL').length;
    const highCount = risks.filter(r => r.severity === 'HIGH').length;

    if (criticalCount > 0) {
      recommendations.push(`Address ${criticalCount} critical security issues immediately before deployment`);
    }

    if (highCount > 0) {
      recommendations.push(`Plan to resolve ${highCount} high-priority issues in the next sprint`);
    }

    if (context.isProduction && risks.length > 10) {
      recommendations.push('Consider reducing scope to manage risk in production');
    }

    if (context.hasPII) {
      recommendations.push('Implement additional privacy controls and audit logging');
    }

    if (context.handlesMoney) {
      recommendations.push('Add financial transaction monitoring and reconciliation');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue following security best practices and regular reviews');
    }

    return recommendations;
  }

  private generateSpecificRecommendations(risks: RiskItem[], context: any): string[] {
    const recommendations: string[] = [];
    
    // Security recommendations
    const securityRisks = risks.filter(r => r.category.includes('SECURITY'));
    if (securityRisks.length > 0) {
      recommendations.push('Conduct security review and penetration testing');
    }

    // Database recommendations
    const dbRisks = risks.filter(r => r.category.includes('DATABASE'));
    if (dbRisks.length > 0) {
      recommendations.push('Review database design and implement proper indexing');
    }

    // Operational recommendations
    const opsRisks = risks.filter(r => r.category.includes('OPERATIONAL'));
    if (opsRisks.length > 0) {
      recommendations.push('Implement monitoring and alerting for operational issues');
    }

    return recommendations;
  }

  private generateNextSteps(assessment: RiskAssessment): string[] {
    const steps: string[] = [];
    
    if (assessment.blocked) {
      steps.push('🚫 STOP - Do not deploy until critical issues are resolved');
    }

    if (assessment.criticalRisks > 0) {
      steps.push(`🔴 Address ${assessment.criticalRisks} critical issues immediately`);
    }

    if (assessment.highRisks > 0) {
      steps.push(`🟠 Schedule fixes for ${assessment.highRisks} high-priority issues`);
    }

    if (assessment.riskScore > 25) {
      steps.push('📋 Create risk mitigation plan');
    }

    steps.push('✅ Schedule follow-up review');
    steps.push('📊 Update risk register with mitigations');

    return steps;
  }
}

// Export singleton instance
export const severityScoring = new SeverityScoring();

/**
 * Checklist Generator for Vibe Coding Disasters
 * 
 * Generates customizable checklists for different use cases:
 * - PR reviews
 * - Release checklists
 * - Security gates
 * - Preflight checks
 */

import { RiskItem, ChecklistConfig, PRChecklistOptions } from './types.js';
import { riskRegister } from './risk-register.js';

export class ChecklistGenerator {
  /**
   * Generate a PR checklist
   */
  generatePRChecklist(options: Partial<PRChecklistOptions> = {}): string {
    const defaults: PRChecklistOptions = {
      blockOnCritical: true,
      blockOnHigh: false,
      requireSignoff: true,
      customChecks: [],
      excludeChecks: []
    };

    const config = { ...defaults, ...options };
    
    let checklist = `# PR Checklist (Anti-Vibe-Coding)\n\n`;

    // Add security section
    const securityRisks = riskRegister.getRisksByCategory('SECURITY VULNERABILITIES');
    const criticalSecurity = securityRisks.filter(r => r.severity === 'CRITICAL');
    const highSecurity = securityRisks.filter(r => r.severity === 'HIGH');

    if (criticalSecurity.length > 0 || highSecurity.length > 0) {
      checklist += `## Security (block merge if any are "no")\n`;
      
      // Add critical security checks
      criticalSecurity.forEach(risk => {
        if (!config.excludeChecks.includes(risk.id)) {
          checklist += `- [ ] ${risk.text}\n`;
        }
      });

      // Add high security checks if blocking is enabled
      if (config.blockOnHigh) {
        highSecurity.forEach(risk => {
          if (!config.excludeChecks.includes(risk.id)) {
            checklist += `- [ ] ${risk.text}\n`;
          }
        });
      }

      checklist += `\n`;
    }

    // Add data integrity section
    const dbRisks = riskRegister.getRisksByCategory('DATABASE_DISASTERS');
    if (dbRisks.length > 0) {
      checklist += `## Data integrity\n`;
      checklist += `- [ ] Transactions for multi-step writes\n`;
      checklist += `- [ ] Pagination on lists\n`;
      checklist += `- [ ] No N+1 queries on hot paths\n\n`;
    }

    // Add reliability section
    const operationalRisks = riskRegister.getRisksByCategory('OPERATIONAL_DISASTERS');
    if (operationalRisks.length > 0) {
      checklist += `## Reliability\n`;
      checklist += `- [ ] Errors handled (no silent catches)\n`;
      checklist += `- [ ] Idempotency for retries/webhooks\n\n`;
    }

    // Add UX section
    checklist += `## UX\n`;
    checklist += `- [ ] Loading + error states exist\n`;
    checklist += `- [ ] Destructive actions confirm\n\n`;

    // Add custom checks
    if (config.customChecks.length > 0) {
      checklist += `## Custom Checks\n`;
      config.customChecks.forEach(check => {
        checklist += `- [ ] ${check}\n`;
      });
      checklist += `\n`;
    }

    // Add blocking notice
    if (config.blockOnCritical || config.blockOnHigh) {
      checklist += `---\n`;
      checklist += `**This PR will be blocked if:**\n`;
      if (config.blockOnCritical) {
        checklist += `- Any CRITICAL security issues are not addressed\n`;
      }
      if (config.blockOnHigh) {
        checklist += `- Any HIGH security issues are not addressed\n`;
      }
    }

    return checklist;
  }

  /**
   * Generate a release checklist
   */
  generateReleaseChecklist(config: Partial<ChecklistConfig> = {}): string {
    const defaults: ChecklistConfig = {
      includeCategories: [],
      excludeCategories: [],
      minSeverity: 'HIGH',
      includeMitigations: true,
      includeExamples: false,
      format: 'markdown'
    };

    const finalConfig = { ...defaults, ...config };
    
    let checklist = `# Release Checklist\n\n`;
    checklist += `Generated on: ${new Date().toISOString()}\n\n`;

    const allRisks = riskRegister.getAllRisks();
    const filteredRisks = this.filterRisks(allRisks, finalConfig);

    // Group by category
    const categories = new Map<string, RiskItem[]>();
    filteredRisks.forEach(risk => {
      if (!categories.has(risk.category)) {
        categories.set(risk.category, []);
      }
      categories.get(risk.category)!.push(risk);
    });

    // Generate checklist by category
    categories.forEach((risks, category) => {
      checklist += `## ${category}\n\n`;
      
      risks.forEach(risk => {
        checklist += `- [ ] **${risk.severity}**: ${risk.text}\n`;
        
        if (finalConfig.includeMitigations && risk.mitigation) {
          checklist += `  - *Mitigation*: ${risk.mitigation}\n`;
        }
        
        if (finalConfig.includeExamples && risk.examples) {
          checklist += `  - *Examples*: ${risk.examples.join(', ')}\n`;
        }
        
        checklist += `\n`;
      });
    });

    // Add summary
    const criticalCount = filteredRisks.filter(r => r.severity === 'CRITICAL').length;
    const highCount = filteredRisks.filter(r => r.severity === 'HIGH').length;
    
    checklist += `---\n`;
    checklist += `## Summary\n`;
    checklist += `- Critical items: ${criticalCount}\n`;
    checklist += `- High items: ${highCount}\n`;
    checklist += `- Total items: ${filteredRisks.length}\n\n`;

    if (criticalCount > 0) {
      checklist += `⚠️ **WARNING**: ${criticalCount} critical items must be addressed before release.\n`;
    }

    return checklist;
  }

  /**
   * Generate security gate checklist
   */
  generateSecurityGateChecklist(): string {
    const securityRisks = riskRegister.getRisksByCategory('SECURITY VULNERABILITIES');
    const criticalAndHigh = securityRisks.filter(r => 
      r.severity === 'CRITICAL' || r.severity === 'HIGH'
    );

    let checklist = `# Security Gate Checklist\n\n`;
    checklist += `This checklist must be completed before deploying to production.\n\n`;
    checklist += `**Status**: ❌ INCOMPLETE\n\n`;

    // Group by subcategory
    const subcategories = new Map<string, RiskItem[]>();
    criticalAndHigh.forEach(risk => {
      if (!subcategories.has(risk.subcategory)) {
        subcategories.set(risk.subcategory, []);
      }
      subcategories.get(risk.subcategory)!.push(risk);
    });

    subcategories.forEach((risks, subcategory) => {
      checklist += `## ${subcategory}\n\n`;
      
      risks.forEach(risk => {
        const emoji = risk.severity === 'CRITICAL' ? '🚨' : '⚠️';
        checklist += `- [ ] ${emoji} **${risk.severity}**: ${risk.text}\n`;
      });
      
      checklist += `\n`;
    });

    checklist += `---\n`;
    checklist += `## Gate Status\n`;
    checklist += `- [ ] All critical items addressed\n`;
    checklist += `- [ ] All high items addressed or accepted\n`;
    checklist += `- [ ] Security review completed\n`;
    checklist += `- [ ] Penetration testing passed\n`;
    checklist += `- [ ] Code review completed\n\n`;

    checklist += `**Deployment blocked until all requirements are met.**\n`;

    return checklist;
  }

  /**
   * Generate preflight checklist for a specific context
   */
  generatePreflightChecklist(context: {
    features: string[];
    areas: string[];
    customRules?: string[];
  }): string {
    let checklist = `# Preflight Checklist\n\n`;
    checklist += `Context: ${context.features.join(', ')}\n`;
    checklist += `Areas: ${context.areas.join(', ')}\n\n`;

    // Get relevant risks based on areas
    let relevantRisks: RiskItem[] = [];
    
    context.areas.forEach(area => {
      const areaRisks = riskRegister.getRisksByCategory(area.toUpperCase());
      relevantRisks.push(...areaRisks);
    });

    // Remove duplicates
    relevantRisks = Array.from(new Set(relevantRisks));

    // Sort by severity
    relevantRisks.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Generate checklist
    checklist += `## Risk Assessment\n\n`;
    
    const critical = relevantRisks.filter(r => r.severity === 'CRITICAL');
    const high = relevantRisks.filter(r => r.severity === 'HIGH');

    if (critical.length > 0) {
      checklist += `### 🚨 Critical Issues (${critical.length})\n\n`;
      critical.forEach(risk => {
        checklist += `- [ ] ${risk.text}\n`;
      });
      checklist += `\n`;
    }

    if (high.length > 0) {
      checklist += `### ⚠️ High Priority Issues (${high.length})\n\n`;
      high.forEach(risk => {
        checklist += `- [ ] ${risk.text}\n`;
      });
      checklist += `\n`;
    }

    // Add custom rules
    if (context.customRules && context.customRules.length > 0) {
      checklist += `## Custom Requirements\n\n`;
      context.customRules.forEach(rule => {
        checklist += `- [ ] ${rule}\n`;
      });
      checklist += `\n`;
    }

    // Add approval section
    checklist += `## Approvals\n\n`;
    checklist += `- [ ] Technical review completed\n`;
    checklist += `- [ ] Security review completed\n`;
    checklist += `- [ ] Business review completed\n`;
    checklist += `- [ ] Performance testing completed\n\n`;

    checklist += `---\n`;
    checklist += `**Ready to proceed**: ❌ NO (complete all required items)\n`;

    return checklist;
  }

  private filterRisks(risks: RiskItem[], config: ChecklistConfig): RiskItem[] {
    let filtered = risks;

    // Filter by categories
    if (config.includeCategories.length > 0) {
      filtered = filtered.filter(risk => 
        config.includeCategories.includes(risk.category)
      );
    }

    if (config.excludeCategories.length > 0) {
      filtered = filtered.filter(risk => 
        !config.excludeCategories.includes(risk.category)
      );
    }

    // Filter by severity
    const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    const minOrder = severityOrder[config.minSeverity];
    
    filtered = filtered.filter(risk => 
      severityOrder[risk.severity] <= minOrder
    );

    return filtered;
  }
}

// Export singleton instance
export const checklistGenerator = new ChecklistGenerator();

/**
 * Compliance Crosswalks for Security Next-Level Suite
 * 
 * Provides comprehensive crosswalks between SOC2, ISO27001, NIST-CSF, and PCI-DSS
 * frameworks with automated mapping and gap analysis.
 */

import { ComplianceCrosswalk, ComplianceFramework } from './types.js';

export class ComplianceCrosswalksManager {
  private crosswalks: Map<ComplianceFramework, ComplianceCrosswalk> = new Map();
  private initialized = false;

  /**
   * Initialize compliance crosswalks
   */
  async initialize(): Promise<void> {
    this.loadCrosswalks();
    this.initialized = true;
  }

  /**
   * Get crosswalks for all frameworks or specific framework
   */
  getCrosswalks(framework?: ComplianceFramework): ComplianceCrosswalk | ComplianceCrosswalk[] {
    if (framework) {
      return this.crosswalks.get(framework)!;
    }
    return Array.from(this.crosswalks.values());
  }

  /**
   * Get control mappings between frameworks
   */
  getControlMappings(fromFramework: ComplianceFramework, toFramework: ComplianceFramework): Record<string, string[]> {
    const fromCrosswalk = this.crosswalks.get(fromFramework);
    if (!fromCrosswalk) return {};

    const mappings: Record<string, string[]> = {};
    
    fromCrosswalk.controls.forEach(control => {
      mappings[control.controlId] = control.mappings[toFramework] || [];
    });

    return mappings;
  }

  /**
   * Get compliance gaps
   */
  getComplianceGaps(framework: ComplianceFramework): Array<{
    controlId: string;
    title: string;
    gap: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation: string;
  }> {
    const crosswalk = this.crosswalks.get(framework);
    if (!crosswalk) return [];

    const gaps = [];
    
    crosswalk.controls.forEach(control => {
      if (control.status !== 'implemented') {
        gaps.push({
          controlId: control.controlId,
          title: control.title,
          gap: `Control not implemented: ${control.description}`,
          severity: this.calculateGapSeverity(control),
          remediation: `Implement ${control.title} with evidence: ${control.evidence.join(', ')}`
        });
      }
    });

    return gaps;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(framework: ComplianceFramework): any {
    const crosswalk = this.crosswalks.get(framework);
    if (!crosswalk) return null;

    const controls = crosswalk.controls;
    const implementedControls = controls.filter(c => c.status === 'implemented');
    const partialControls = controls.filter(c => c.status === 'partial');
    const nonCompliantControls = controls.filter(c => c.status === 'planned' || c.status === 'not-applicable');

    const overallScore = (implementedControls.length / controls.length) * 100;
    const gaps = this.getComplianceGaps(framework);

    return {
      framework,
      period: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      overallScore,
      controlResults: controls.map(control => ({
        controlId: control.controlId,
        status: control.status === 'implemented' ? 'compliant' : 
                control.status === 'partial' ? 'partial' : 'non-compliant',
        score: control.status === 'implemented' ? 100 : 
               control.status === 'partial' ? 50 : 0,
        findings: control.status !== 'implemented' ? [`${control.title} not fully implemented`] : [],
        evidence: control.evidence
      })),
      gaps: gaps.map(gap => ({
        controlId: gap.controlId,
        description: gap.gap,
        severity: gap.severity,
        remediation: gap.remediation,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })),
      recommendations: this.generateRecommendations(gaps),
      generatedAt: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
  }

  private loadCrosswalks(): void {
    // SOC2 Crosswalk
    this.crosswalks.set('SOC2', {
      framework: 'SOC2',
      controls: [
        {
          controlId: 'SOC2-C1',
          title: 'Security Controls',
          description: 'Implementation of security controls to protect systems',
          category: 'Security',
          mappings: {
            'ISO27001': ['A.9.1.2', 'A.9.2.1'],
            'NIST-CSF': ['PR.AC', 'PR.DS'],
            'PCI-DSS': ['Req. 1', 'Req. 2']
          },
          requirements: ['Common Criteria 1.0'],
          evidence: ['Security policies', 'Access controls', 'Encryption documentation'],
          testing: ['Penetration testing', 'Vulnerability scanning'],
          frequency: 'quarterly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'SOC2-C2',
          title: 'Availability Controls',
          description: 'Controls to ensure system availability',
          category: 'Availability',
          mappings: {
            'ISO27001': ['A.17.1.1', 'A.17.2.1'],
            'NIST-CSF': ['DE.CM', 'DE.DP'],
            'PCI-DSS': ['Req. 12.9']
          },
          requirements: ['Common Criteria 2.0'],
          evidence: ['Disaster recovery plan', 'Backup procedures', 'Uptime monitoring'],
          testing: ['DR testing', 'Backup verification'],
          frequency: 'semi-annually',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'SOC2-C3',
          title: 'Processing Integrity',
          description: 'Controls to ensure data processing integrity',
          category: 'Processing Integrity',
          mappings: {
            'ISO27001': ['A.12.2.1', 'A.14.2.5'],
            'NIST-CSF': ['PR.AI', 'PR.DS'],
            'PCI-DSS': ['Req. 4', 'Req. 9']
          },
          requirements: ['Common Criteria 3.0'],
          evidence: ['Data validation procedures', 'Processing logs', 'Error handling'],
          testing: ['Data integrity testing', 'Processing validation'],
          frequency: 'monthly',
          automated: true,
          status: 'partial',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'SOC2-C4',
          title: 'Confidentiality Controls',
          description: 'Controls to protect confidential information',
          category: 'Confidentiality',
          mappings: {
            'ISO27001': ['A.8.2.1', 'A.13.1.1'],
            'NIST-CSF': ['PR.AC', 'PR.DS'],
            'PCI-DSS': ['Req. 3', 'Req. 4']
          },
          requirements: ['Common Criteria 4.0'],
          evidence: ['Encryption controls', 'Access restrictions', 'Data classification'],
          testing: ['Encryption verification', 'Access testing'],
          frequency: 'quarterly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'SOC2-C5',
          title: 'Privacy Controls',
          description: 'Controls to protect personal information',
          category: 'Privacy',
          mappings: {
            'ISO27001': ['A.18.1.1', 'A.18.1.2'],
            'NIST-CSF': ['PR.IP', 'PR.PS'],
            'PCI-DSS': ['Req. 3', 'Req. 9']
          },
          requirements: ['Common Criteria 5.0'],
          evidence: ['Privacy policy', 'Consent management', 'Data minimization'],
          testing: ['Privacy impact assessment', 'Consent verification'],
          frequency: 'annually',
          automated: false,
          status: 'planned',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ],
      maturity: 'managed',
      lastUpdated: new Date()
    });

    // ISO27001 Crosswalk
    this.crosswalks.set('ISO27001', {
      framework: 'ISO27001',
      controls: [
        {
          controlId: 'ISO-A.9.1.2',
          title: 'Information Security Policy',
          description: 'Information security policy defined and approved',
          category: 'Policy',
          mappings: {
            'SOC2': ['SOC2-C1'],
            'NIST-CSF': ['ID.GV'],
            'PCI-DSS': ['Req. 12.1']
          },
          requirements: ['Annex A.9.1'],
          evidence: ['Security policy document', 'Management approval', 'Policy distribution'],
          testing: ['Policy review', 'Staff awareness'],
          frequency: 'annually',
          automated: false,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'ISO-A.9.2.1',
          title: 'Access Control Policy',
          description: 'Formal documented access control policy',
          category: 'Access Control',
          mappings: {
            'SOC2': ['SOC2-C1'],
            'NIST-CSF': ['PR.AC'],
            'PCI-DSS': ['Req. 7']
          },
          requirements: ['Annex A.9.2'],
          evidence: ['Access control policy', 'Role definitions', 'Access review procedures'],
          testing: ['Access review testing', 'Policy compliance'],
          frequency: 'quarterly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      ],
      maturity: 'managed',
      lastUpdated: new Date()
    });

    // NIST-CSF Crosswalk
    this.crosswalks.set('NIST-CSF', {
      framework: 'NIST-CSF',
      controls: [
        {
          controlId: 'NIST-ID.AM',
          title: 'Asset Management',
          description: 'Physical devices and systems are inventoried',
          category: 'Identify',
          mappings: {
            'SOC2': ['SOC2-C1'],
            'ISO27001': ['A.8.1.1'],
            'PCI-DSS': ['Req. 1', 'Req. 2']
          },
          requirements: ['ID.AM'],
          evidence: ['Asset inventory', 'Hardware documentation', 'System diagrams'],
          testing: ['Inventory verification', 'Asset tracking'],
          frequency: 'quarterly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'NIST-PR.AC',
          title: 'Identity Management and Access Control',
          description: 'Access to physical and logical assets is limited',
          category: 'Protect',
          mappings: {
            'SOC2': ['SOC2-C1', 'SOC2-C4'],
            'ISO27001': ['A.9.2.1'],
            'PCI-DSS': ['Req. 7']
          },
          requirements: ['PR.AC'],
          evidence: ['Access controls', 'Identity management', 'Authentication systems'],
          testing: ['Access testing', 'Authentication verification'],
          frequency: 'monthly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ],
      maturity: 'managed',
      lastUpdated: new Date()
    });

    // PCI-DSS Crosswalk
    this.crosswalks.set('PCI-DSS', {
      framework: 'PCI-DSS',
      controls: [
        {
          controlId: 'PCI-1.1',
          title: 'Firewall Configuration',
          description: 'Firewall and router configuration standards',
          category: 'Network Security',
          mappings: {
            'SOC2': ['SOC2-C1'],
            'ISO27001': ['A.13.1.1'],
            'NIST-CSF': ['PR.AC']
          },
          requirements: ['Requirement 1'],
          evidence: ['Firewall rules', 'Network diagrams', 'Configuration standards'],
          testing: ['Firewall testing', 'Network scanning'],
          frequency: 'quarterly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        {
          controlId: 'PCI-3.1',
          title: 'Keep Cardholder Data Secure',
          description: 'Protect stored cardholder data',
          category: 'Data Protection',
          mappings: {
            'SOC2': ['SOC2-C4'],
            'ISO27001': ['A.8.2.1'],
            'NIST-CSF': ['PR.DS']
          },
          requirements: ['Requirement 3'],
          evidence: ['Encryption documentation', 'Data storage policies', 'Key management'],
          testing: ['Encryption verification', 'Data protection testing'],
          frequency: 'monthly',
          automated: true,
          status: 'implemented',
          lastAssessed: new Date(),
          nextAssessed: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ],
      maturity: 'managed',
      lastUpdated: new Date()
    });
  }

  private calculateGapSeverity(control: any): 'low' | 'medium' | 'high' | 'critical' {
    if (control.category === 'Security' || control.category === 'Access Control') {
      return 'critical';
    } else if (control.category === 'Data Protection' || control.category === 'Network Security') {
      return 'high';
    } else if (control.category === 'Availability' || control.category === 'Processing Integrity') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateRecommendations(gaps: any[]): string[] {
    const recommendations: string[] = [];
    
    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    const highGaps = gaps.filter(g => g.severity === 'high');
    
    if (criticalGaps.length > 0) {
      recommendations.push(`Address ${criticalGaps.length} critical security gaps immediately`);
    }
    
    if (highGaps.length > 0) {
      recommendations.push(`Prioritize ${highGaps.length} high-priority gaps this quarter`);
    }
    
    if (gaps.length > 0) {
      recommendations.push(`Develop implementation plan for ${gaps.length} total compliance gaps`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All controls implemented - maintain compliance posture');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const complianceCrosswalks = new ComplianceCrosswalksManager();

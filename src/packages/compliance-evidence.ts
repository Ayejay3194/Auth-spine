/**
 * Compliance Evidence for Beauty Booking Security Pack
 * 
 * Provides comprehensive compliance evidence collection and reporting
 * for SOC2, GDPR, CCPA, and other regulatory frameworks.
 */

import { ComplianceConfig, ComplianceEvidence, ComplianceReport } from './types.js';

export class ComplianceEvidenceManager {
  private config: ComplianceConfig;
  private evidence: Map<string, ComplianceEvidence> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();
  private initialized = false;

  /**
   * Initialize compliance evidence
   */
  async initialize(config: ComplianceConfig): Promise<void> {
    this.config = config;
    this.loadDefaultEvidence();
    this.initialized = true;
  }

  /**
   * Add compliance evidence
   */
  async addEvidence(evidence: {
    framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA';
    control: string;
    evidenceType: 'policy' | 'procedure' | 'audit_log' | 'screenshot' | 'report';
    description: string;
    filePath?: string;
    approvedBy: string;
  }): Promise<ComplianceEvidence> {
    const complianceEvidence: ComplianceEvidence = {
      id: this.generateEvidenceId(),
      framework: evidence.framework,
      control: evidence.control,
      evidenceType: evidence.evidenceType,
      description: evidence.description,
      filePath: evidence.filePath,
      collectedAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      approvedBy: evidence.approvedBy,
      status: 'pending'
    };

    this.evidence.set(complianceEvidence.id, complianceEvidence);
    return complianceEvidence;
  }

  /**
   * Get evidence by framework
   */
  async getEvidenceByFramework(framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA'): Promise<ComplianceEvidence[]> {
    return Array.from(this.evidence.values())
      .filter(evidence => evidence.framework === framework);
  }

  /**
   * Get evidence by control
   */
  async getEvidenceByControl(framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA', control: string): Promise<ComplianceEvidence[]> {
    return Array.from(this.evidence.values())
      .filter(evidence => evidence.framework === framework && evidence.control === control);
  }

  /**
   * Approve evidence
   */
  async approveEvidence(evidenceId: string, approvedBy: string): Promise<ComplianceEvidence> {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    evidence.status = 'approved';
    evidence.approvedBy = approvedBy;
    this.evidence.set(evidenceId, evidence);

    return evidence;
  }

  /**
   * Generate compliance report
   */
  async generateReport(framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA', period: {
    start: Date;
    end: Date;
  }): Promise<ComplianceReport> {
    const frameworkEvidence = await this.getEvidenceByFramework(framework);
    const controls = await this.getFrameworkControls(framework);
    
    const reportControls = controls.map(control => {
      const controlEvidence = frameworkEvidence.filter(e => e.control === control.id);
      const hasValidEvidence = controlEvidence.some(e => e.status === 'approved' && e.validUntil > new Date());
      
      return {
        control: control.id,
        status: hasValidEvidence ? 'compliant' : 'non_compliant',
        evidence: controlEvidence.map(e => e.id),
        findings: hasValidEvidence ? [] : ['Missing or expired evidence'],
        riskLevel: control.riskLevel
      };
    });

    const overallStatus = this.calculateOverallStatus(reportControls);
    const overallScore = this.calculateOverallScore(reportControls);
    const recommendations = this.generateRecommendations(reportControls, framework);

    const report: ComplianceReport = {
      id: this.generateReportId(),
      framework,
      period,
      status: overallStatus,
      overallScore,
      controls: reportControls,
      recommendations,
      generatedAt: new Date(),
      approvedBy: 'compliance_team'
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Get compliance metrics
   */
  async getMetrics(): Promise<{
    totalEvidence: number;
    approvedEvidence: number;
    pendingEvidence: number;
    expiredEvidence: number;
    frameworkBreakdown: Record<string, number>;
  }> {
    const evidence = Array.from(this.evidence.values());
    const now = new Date();

    const metrics = {
      totalEvidence: evidence.length,
      approvedEvidence: evidence.filter(e => e.status === 'approved').length,
      pendingEvidence: evidence.filter(e => e.status === 'pending').length,
      expiredEvidence: evidence.filter(e => e.validUntil < now).length,
      frameworkBreakdown: {
        SOC2: evidence.filter(e => e.framework === 'SOC2').length,
        GDPR: evidence.filter(e => e.framework === 'GDPR').length,
        CCPA: evidence.filter(e => e.framework === 'CCPA').length,
        HIPAA: evidence.filter(e => e.framework === 'HIPAA').length
      }
    };

    return metrics;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Cleanup expired evidence
   */
  async cleanup(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, evidence] of this.evidence.entries()) {
      if (evidence.validUntil < now) {
        this.evidence.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Generate compliance configuration
   */
  generateConfig(): {
    policies: string;
    procedures: string;
    evidenceCollection: string;
  } {
    const policies = this.generatePolicies();
    const procedures = this.generateProcedures();
    const evidenceCollection = this.generateEvidenceCollection();

    return {
      policies,
      procedures,
      evidenceCollection
    };
  }

  private async getFrameworkControls(framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA'): Promise<Array<{
    id: string;
    name: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    const controls = {
      SOC2: [
        { id: 'CC1.1', name: 'Control Environment', riskLevel: 'high' as const },
        { id: 'CC2.1', name: 'Communication and Responsibility', riskLevel: 'medium' as const },
        { id: 'CC3.1', name: 'Risk Assessment', riskLevel: 'high' as const },
        { id: 'CC4.1', name: 'Monitoring Activities', riskLevel: 'medium' as const },
        { id: 'CC5.1', name: 'Control Activities', riskLevel: 'high' as const },
        { id: 'CC6.1', name: 'Logical and Physical Access', riskLevel: 'critical' as const },
        { id: 'CC7.1', name: 'System Operations', riskLevel: 'high' as const },
        { id: 'CC8.1', name: 'Change Management', riskLevel: 'medium' as const }
      ],
      GDPR: [
        { id: 'Art.5', name: 'Principles of Processing', riskLevel: 'critical' as const },
        { id: 'Art.6', name: 'Lawfulness of Processing', riskLevel: 'high' as const },
        { id: 'Art.7', name: 'Conditions for Consent', riskLevel: 'high' as const },
        { id: 'Art.15', name: 'Rights of the Data Subject', riskLevel: 'high' as const },
        { id: 'Art.17', name: 'Right to Erasure', riskLevel: 'medium' as const },
        { id: 'Art.25', name: 'Data Protection by Design', riskLevel: 'high' as const },
        { id: 'Art.32', name: 'Security of Processing', riskLevel: 'critical' as const }
      ],
      CCPA: [
        { id: '1798.100', name: 'Right to Know', riskLevel: 'high' as const },
        { id: '1798.105', name: 'Right to Delete', riskLevel: 'high' as const },
        { id: '1798.110', name: 'Right to Opt-Out', riskLevel: 'medium' as const },
        { id: '1798.115', name: 'Non-Discrimination', riskLevel: 'medium' as const }
      ],
      HIPAA: [
        { id: '164.308', name: 'Security Management Process', riskLevel: 'critical' as const },
        { id: '164.312', name: 'Technical Safeguards', riskLevel: 'critical' as const },
        { id: '164.316', name: 'Administrative Safeguards', riskLevel: 'high' as const }
      ]
    };

    return controls[framework] || [];
  }

  private calculateOverallStatus(controls: Array<{
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>): 'compliant' | 'non_compliant' | 'partial_compliant' {
    const compliantCount = controls.filter(c => c.status === 'compliant').length;
    const totalCount = controls.length;
    const hasCriticalNonCompliant = controls.some(c => 
      c.status === 'non_compliant' && c.riskLevel === 'critical'
    );

    if (hasCriticalNonCompliant) {
      return 'non_compliant';
    }

    const complianceRatio = compliantCount / totalCount;
    if (complianceRatio >= 0.95) {
      return 'compliant';
    } else if (complianceRatio >= 0.80) {
      return 'partial_compliant';
    } else {
      return 'non_compliant';
    }
  }

  private calculateOverallScore(controls: Array<{
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>): number {
    let totalScore = 0;
    let maxScore = 0;

    controls.forEach(control => {
      const weight = this.getRiskWeight(control.riskLevel);
      maxScore += weight;
      
      if (control.status === 'compliant') {
        totalScore += weight;
      } else if (control.status === 'partial_compliant') {
        totalScore += weight * 0.5;
      }
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  private getRiskWeight(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
    return {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }[riskLevel] || 1;
  }

  private generateRecommendations(controls: Array<{
    control: string;
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    findings: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>, framework: string): string[] {
    const recommendations = [];
    const nonCompliantControls = controls.filter(c => c.status === 'non_compliant');

    if (nonCompliantControls.length > 0) {
      recommendations.push(`Address ${nonCompliantControls.length} non-compliant controls for ${framework}`);
    }

    const criticalNonCompliant = nonCompliantControls.filter(c => c.riskLevel === 'critical');
    if (criticalNonCompliant.length > 0) {
      recommendations.push('Priority: Address critical compliance gaps immediately');
    }

    const highNonCompliant = nonCompliantControls.filter(c => c.riskLevel === 'high');
    if (highNonCompliant.length > 0) {
      recommendations.push('High Priority: Implement controls for high-risk areas');
    }

    recommendations.push('Schedule regular compliance assessments');
    recommendations.push('Maintain up-to-date evidence collection');
    recommendations.push('Conduct staff training on compliance requirements');

    return recommendations;
  }

  private loadDefaultEvidence(): void {
    // Load default compliance evidence
    const defaultEvidence = [
      {
        id: 'ev_1',
        framework: 'SOC2' as const,
        control: 'CC6.1',
        evidenceType: 'policy' as const,
        description: 'Access Control Policy',
        filePath: '/policies/access-control.pdf',
        collectedAt: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approvedBy: 'security_manager',
        status: 'approved' as const
      },
      {
        id: 'ev_2',
        framework: 'GDPR' as const,
        control: 'Art.32',
        evidenceType: 'procedure' as const,
        description: 'Data Protection Procedures',
        filePath: '/procedures/data-protection.pdf',
        collectedAt: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approvedBy: 'dpo',
        status: 'approved' as const
      },
      {
        id: 'ev_3',
        framework: 'CCPA' as const,
        control: '1798.100',
        evidenceType: 'audit_log' as const,
        description: 'Data Access Audit Logs',
        filePath: '/logs/data-access.log',
        collectedAt: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        approvedBy: 'compliance_team',
        status: 'pending' as const
      }
    ];

    defaultEvidence.forEach(evidence => {
      this.evidence.set(evidence.id, evidence);
    });
  }

  private generatePolicies(): string {
    return `
# Compliance Policies
# Generated on ${new Date().toISOString()}

## Information Security Policy
- Purpose: Establish information security management framework
- Scope: All systems, data, and personnel
- Owner: CISO
- Review: Annually
- Approval: Board of Directors

## Data Protection Policy (GDPR)
- Purpose: Ensure compliance with GDPR requirements
- Scope: Personal data processing activities
- Owner: Data Protection Officer
- Review: Quarterly
- Approval: Executive Team

## Privacy Policy (CCPA)
- Purpose: Ensure compliance with CCPA requirements
- Scope: Consumer data handling
- Owner: Privacy Officer
- Review: Semi-annually
- Approval: Legal Department

## Access Control Policy
- Purpose: Define access control requirements
- Scope: All systems and applications
- Owner: Security Manager
- Review: Quarterly
- Approval: CISO

## Incident Response Policy
- Purpose: Define incident response procedures
- Scope: Security incidents and breaches
- Owner: Incident Response Team
- Review: Semi-annually
- Approval: CISO

## Change Management Policy
- Purpose: Control changes to systems and data
- Scope: All IT infrastructure and applications
- Owner: Change Manager
- Review: Quarterly
- Approval: CTO
`;
  }

  private generateProcedures(): string {
    return `
# Compliance Procedures
# Generated on ${new Date().toISOString()}

## Data Subject Request Procedure (GDPR/CCPA)
1. Receive request via designated channels
2. Verify identity of data subject
3. Validate request scope and legitimacy
4. Retrieve requested information/data
5. Prepare response within statutory timeframe
6. Obtain legal/compliance review
7. Deliver response to data subject
8. Log request and outcome
9. Update procedures based on feedback

## Access Request Procedure
1. Receive access request from employee/contractor
2. Verify employment/contract status
3. Determine required access level
4. Obtain manager approval
5. Provision access according to principle of least privilege
6. Document access granted
7. Schedule access review
8. Monitor access usage

## Incident Response Procedure
1. Detection and identification
2. Initial assessment and classification
3. Containment and mitigation
4. Investigation and analysis
5. Notification and reporting
6. Recovery and restoration
7. Post-incident review
8. Documentation and lessons learned

## Data Retention Procedure
1. Identify data classification
2. Determine retention requirements
3. Schedule data deletion
4. Verify deletion completion
5. Document retention actions
6. Handle legal holds
7. Audit retention compliance
8. Update retention schedules

## Vendor Management Procedure
1. Vendor identification and selection
2. Security assessment and due diligence
3. Contract negotiation and review
4. Ongoing monitoring and assessment
5. Issue identification and remediation
6. Contract renewal or termination
7. Documentation and reporting
8. Relationship management
`;
  }

  private generateEvidenceCollection(): string {
    return `
# Evidence Collection Procedures
# Generated on ${new Date().toISOString()}

## Evidence Types and Collection Methods

### Policies and Procedures
- Collection: Document repository access
- Frequency: As updated
- Approval: Policy owner
- Retention: 3 years after replacement

### Audit Logs
- Collection: Automated log aggregation
- Frequency: Continuous
- Approval: Security team
- Retention: 2555 days (7 years)

### Screenshots and Evidence
- Collection: Manual capture during assessments
- Frequency: During assessments
- Approval: Assessor
- Retention: 3 years

### Reports and Assessments
- Collection: Report generation systems
- Frequency: Per assessment schedule
- Approval: Assessment lead
- Retention: 3 years

### Training Records
- Collection: Learning Management System
- Frequency: After training completion
- Approval: Training manager
- Retention: 3 years

## Evidence Management

### Storage Requirements
- Encrypted storage
- Access controls based on sensitivity
- Version control for documents
- Backup and disaster recovery

### Integrity Controls
- Digital signatures where required
- Hash verification for files
- Change logging for all evidence
- Regular integrity checks

### Access Controls
- Role-based access to evidence
- Audit trail for all access
- Multi-factor authentication
- Regular access reviews

### Retention and Disposal
- Automated retention scheduling
- Secure disposal procedures
- Legal hold management
- Documentation of disposal

## Evidence Collection Schedule

### Monthly
- Access review logs
- System configuration backups
- Security monitoring reports

### Quarterly
- Vulnerability scan reports
- Penetration test results
- Compliance assessment reports

### Annually
- Risk assessment reports
- Third-party audit results
- Training completion records

### On-Demand
- Incident response documentation
- Data subject request logs
- Regulatory inquiry responses
`;
  }

  private generateEvidenceId(): string {
    return `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const complianceEvidence = new ComplianceEvidenceManager();

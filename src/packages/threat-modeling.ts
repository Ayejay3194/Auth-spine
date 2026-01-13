/**
 * Threat Modeling for Beauty Booking Security Pack
 * 
 * Provides comprehensive threat modeling with asset identification,
 * threat analysis, and data flow mapping for beauty booking platforms.
 */

import { ThreatModel } from './types.js';

export class ThreatModelingManager {
  private threatModel: ThreatModel;
  private initialized = false;

  /**
   * Initialize threat modeling
   */
  async initialize(): Promise<void> {
    this.threatModel = this.loadDefaultThreatModel();
    this.initialized = true;
  }

  /**
   * Get threat model
   */
  async getThreatModel(): Promise<{
    assets: Array<{
      name: string;
      type: string;
      sensitivity: string;
    }>;
    threats: Array<{
      type: string;
      description: string;
      likelihood: string;
      impact: string;
      mitigations: string[];
    }>;
    dataFlows: Array<{
      from: string;
      to: string;
      data: string;
      protections: string[];
    }>;
  }> {
    return {
      assets: this.threatModel.assets,
      threats: this.threatModel.threats,
      dataFlows: this.threatModel.dataFlows
    };
  }

  /**
   * Analyze threats for component
   */
  async analyzeThreats(component: string): Promise<{
    threats: Array<{
      type: string;
      description: string;
      likelihood: string;
      impact: string;
      risk: 'low' | 'medium' | 'high' | 'critical';
      mitigations: string[];
    }>;
    recommendations: string[];
  }> {
    const componentThreats = this.threatModel.threats.filter(threat => 
      threat.description.toLowerCase().includes(component.toLowerCase())
    );

    const threatsWithRisk = componentThreats.map(threat => ({
      ...threat,
      risk: this.calculateRisk(threat.likelihood, threat.impact)
    }));

    const recommendations = this.generateRecommendations(threatsWithRisk);

    return {
      threats: threatsWithRisk,
      recommendations
    };
  }

  /**
   * Get security controls
   */
  async getSecurityControls(): Promise<{
    preventive: string[];
    detective: string[];
    corrective: string[];
    compensating: string[];
  }> {
    return {
      preventive: [
        'Multi-factor authentication for all user accounts',
        'Role-based access control with least privilege',
        'Input validation and sanitization',
        'Secure coding practices and code reviews',
        'Regular security training for developers',
        'Network segmentation between domains',
        'Encryption for data at rest and in transit',
        'Regular vulnerability scanning and patching'
      ],
      detective: [
        'Comprehensive audit logging and monitoring',
        'Intrusion detection and prevention systems',
        'Security information and event management (SIEM)',
        'Regular penetration testing',
        'Behavioral analytics for anomaly detection',
        'Real-time security alerts and notifications',
        'File integrity monitoring',
        'Database activity monitoring'
      ],
      corrective: [
        'Incident response procedures and playbooks',
        'Backup and disaster recovery plans',
        'System hardening and secure configurations',
        'Security patches and updates',
        'Containment and eradication procedures',
        'Forensic investigation capabilities',
        'System restoration procedures',
        'Post-incident reviews and improvements'
      ],
      compensating: [
        'Insurance coverage for security incidents',
        'Third-party security assessments',
        'Bug bounty programs',
        'Security awareness training',
        'Contractual security requirements',
        'Regulatory compliance frameworks',
        'Security certifications and attestations',
        'Vendor risk management programs'
      ]
    };
  }

  /**
   * Generate threat model report
   */
  async generateThreatModelReport(): Promise<{
    summary: {
      totalAssets: number;
      totalThreats: number;
      highRiskThreats: number;
      criticalAssets: number;
    };
    riskAssessment: Array<{
      asset: string;
      threats: string[];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      mitigations: string[];
    }>;
    recommendations: string[];
    nextReview: Date;
  }> {
    const summary = {
      totalAssets: this.threatModel.assets.length,
      totalThreats: this.threatModel.threats.length,
      highRiskThreats: this.threatModel.threats.filter(t => 
        this.calculateRisk(t.likelihood, t.impact) === 'high' ||
        this.calculateRisk(t.likelihood, t.impact) === 'critical'
      ).length,
      criticalAssets: this.threatModel.assets.filter(a => a.sensitivity === 'critical').length
    };

    const riskAssessment = this.generateRiskAssessment();
    const recommendations = this.generateStrategicRecommendations();

    return {
      summary,
      riskAssessment,
      recommendations,
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate threat model configuration
   */
  generateConfig(): {
    stride: string;
    dataFlow: string;
    attackTree: string;
  } {
    const stride = this.generateSTRIDEModel();
    const dataFlow = this.generateDataFlowDiagram();
    const attackTree = this.generateAttackTree();

    return {
      stride,
      dataFlow,
      attackTree
    };
  }

  private calculateRisk(likelihood: string, impact: string): 'low' | 'medium' | 'high' | 'critical' {
    const likelihoodScore = { low: 1, medium: 2, high: 3 }[likelihood] || 1;
    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[impact] || 1;
    
    const riskScore = likelihoodScore * impactScore;
    
    if (riskScore >= 9) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private generateRecommendations(threats: Array<{
    type: string;
    description: string;
    likelihood: string;
    impact: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    mitigations: string[];
  }>): string[] {
    const recommendations = new Set<string>();
    
    threats.forEach(threat => {
      if (threat.risk === 'critical' || threat.risk === 'high') {
        threat.mitigations.forEach(mitigation => {
          recommendations.add(mitigation);
        });
      }
    });

    return Array.from(recommendations);
  }

  private generateRiskAssessment(): Array<{
    asset: string;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigations: string[];
  }> {
    const assessment = [];
    
    this.threatModel.assets.forEach(asset => {
      const assetThreats = this.threatModel.threats.filter(threat => 
        threat.description.toLowerCase().includes(asset.name.toLowerCase())
      );
      
      const maxRisk = Math.max(...assetThreats.map(t => 
        this.getRiskScore(this.calculateRisk(t.likelihood, t.impact))
      ));
      
      const riskLevel = this.getRiskLevelFromScore(maxRisk);
      const allMitigations = [...new Set(assetThreats.flatMap(t => t.mitigations))];
      
      assessment.push({
        asset: asset.name,
        threats: assetThreats.map(t => t.description),
        riskLevel,
        mitigations: allMitigations
      });
    });
    
    return assessment;
  }

  private getRiskScore(risk: string): number {
    return { low: 1, medium: 2, high: 3, critical: 4 }[risk] || 1;
  }

  private getRiskLevelFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 4) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private generateStrategicRecommendations(): string[] {
    return [
      'Implement zero-trust architecture across all domains',
      'Enhance monitoring and logging capabilities',
      'Regular security assessments and penetration testing',
      'Develop comprehensive incident response capabilities',
      'Implement continuous security monitoring',
      'Enhance employee security awareness training',
      'Establish security governance framework',
      'Regular threat intelligence updates and analysis'
    ];
  }

  private loadDefaultThreatModel(): ThreatModel {
    return {
      id: 'beauty-booking-threat-model',
      name: 'Beauty Booking Platform Threat Model',
      description: 'Comprehensive threat model for beauty booking platform',
      assets: [
        {
          name: 'Customer Data',
          type: 'data',
          sensitivity: 'high'
        },
        {
          name: 'Payment Information',
          type: 'data',
          sensitivity: 'critical'
        },
        {
          name: 'Booking System',
          type: 'system',
          sensitivity: 'high'
        },
        {
          name: 'Stylist Profiles',
          type: 'data',
          sensitivity: 'medium'
        },
        {
          name: 'Authentication Service',
          type: 'system',
          sensitivity: 'critical'
        },
        {
          name: 'Appointment Scheduling',
          type: 'process',
          sensitivity: 'medium'
        },
        {
          name: 'Payment Processing',
          type: 'process',
          sensitivity: 'critical'
        },
        {
          name: 'Customer Reviews',
          type: 'data',
          sensitivity: 'low'
        }
      ],
      threats: [
        {
          id: 'threat_1',
          type: 'spoofing',
          description: 'Attacker spoofs stylist identity to access customer data',
          likelihood: 'medium',
          impact: 'high',
          mitigations: [
            'Multi-factor authentication for stylists',
            'Identity verification processes',
            'Regular credential rotation',
            'Session management controls'
          ]
        },
        {
          id: 'threat_2',
          type: 'tampering',
          description: 'Unauthorized modification of booking appointments',
          likelihood: 'medium',
          impact: 'medium',
          mitigations: [
            'Data integrity checks',
            'Audit logging for all modifications',
            'Digital signatures for critical data',
            'Change management procedures'
          ]
        },
        {
          id: 'threat_3',
          type: 'repudiation',
          description: 'User denies making booking or payment',
          likelihood: 'low',
          impact: 'medium',
          mitigations: [
            'Comprehensive audit trails',
            'Digital receipts and confirmations',
            'Non-repudiation controls',
            'Legal terms and conditions'
          ]
        },
        {
          id: 'threat_4',
          type: 'information_disclosure',
          description: 'Unauthorized access to customer PII and payment data',
          likelihood: 'high',
          impact: 'critical',
          mitigations: [
            'Encryption at rest and in transit',
            'Access controls and authorization',
            'Data masking for sensitive fields',
            'Regular security assessments'
          ]
        },
        {
          id: 'threat_5',
          type: 'denial_of_service',
          description: 'Attack on booking system availability',
          likelihood: 'medium',
          impact: 'high',
          mitigations: [
            'DDoS protection services',
            'Rate limiting and throttling',
            'Load balancing and redundancy',
            'Incident response procedures'
          ]
        },
        {
          id: 'threat_6',
          type: 'elevation_of_privilege',
          description: 'Customer gains admin access to system',
          likelihood: 'low',
          impact: 'critical',
          mitigations: [
            'Principle of least privilege',
            'Regular access reviews',
            'Privileged access management',
            'Separation of duties'
          ]
        }
      ],
      dataFlows: [
        {
          from: 'Customer Browser',
          to: 'Public API',
          data: 'Booking requests, personal information',
          protocol: 'HTTPS',
          protections: ['TLS encryption', 'API authentication', 'Input validation']
        },
        {
          from: 'Public API',
          to: 'Booking Database',
          data: 'Appointment data, customer information',
          protocol: 'Internal TLS',
          protections: ['Database encryption', 'Access controls', 'Audit logging']
        },
        {
          from: 'Stylist Portal',
          to: 'Studio API',
          data: 'Schedule updates, customer access',
          protocol: 'HTTPS',
          protections: ['MFA', 'Role-based access', 'Session management']
        },
        {
          from: 'Payment Gateway',
          to: 'Payment Processor',
          data: 'Payment card information',
          protocol: 'HTTPS',
          protections: ['PCI DSS compliance', 'Tokenization', 'Encryption']
        },
        {
          from: 'Admin Console',
          to: 'Operations API',
          data: 'System configuration, user management',
          protocol: 'HTTPS',
          protections: ['IP restrictions', 'MFA', 'Privileged access management']
        }
      ],
      lastUpdated: new Date()
    };
  }

  private generateSTRIDEModel(): string {
    return `
# STRIDE Threat Model for Beauty Booking Platform
# Generated on ${new Date().toISOString()}

## Spoofing
- **Threat**: Identity spoofing of customers, stylists, or administrators
- **Impact**: Unauthorized access to accounts and data
- **Mitigations**:
  - Multi-factor authentication
  - Identity verification
  - Certificate-based authentication
  - Anti-bot measures

## Tampering
- **Threat**: Unauthorized modification of bookings, payments, or profiles
- **Impact**: Data integrity issues, financial loss
- **Mitigations**:
  - Digital signatures
  - Audit trails
  - Data integrity checks
  - Change management

## Repudiation
- **Threat**: Users denying actions (bookings, payments, reviews)
- **Impact**: Disputes, legal issues
- **Mitigations**:
  - Comprehensive logging
  - Digital receipts
  - Non-repudiation controls
  - Legal agreements

## Information Disclosure
- **Threat**: Unauthorized access to PII, payment data, business information
- **Impact**: Privacy violations, regulatory fines, reputational damage
- **Mitigations**:
  - Encryption (at rest and in transit)
  - Access controls
  - Data masking
  - Security monitoring

## Denial of Service
- **Threat**: Attacks on system availability
- **Impact**: Business disruption, revenue loss
- **Mitigations**:
  - DDoS protection
  - Rate limiting
  - Redundancy
  - Load balancing

## Elevation of Privilege
- **Threat**: Users gaining higher privileges
- **Impact**: System compromise, data breach
- **Mitigations**:
  - Least privilege principle
  - Access reviews
  - Privileged access management
  - Separation of duties
`;
  }

  private generateDataFlowDiagram(): string {
    return `
# Data Flow Diagram - Beauty Booking Platform
# Generated on ${new Date().toISOString()}

## External Entities
- Customer (Web/Mobile)
- Stylist (Web/Mobile)
- Administrator (Web)
- Payment Processor
- Email/SMS Service

## Processes
- Authentication Service
- Booking Service
- Payment Service
- Notification Service
- Admin Service
- Analytics Service

## Data Stores
- Customer Database
- Booking Database
- Payment Database
- Audit Logs
- Analytics Data

## Data Flows

### Customer Booking Flow
1. Customer → Authentication Service (Credentials)
2. Authentication Service → Customer Database (Validation)
3. Customer → Booking Service (Booking Request)
4. Booking Service → Booking Database (Store Booking)
5. Booking Service → Payment Service (Payment Request)
6. Payment Service → Payment Processor (Payment Data)
7. Payment Processor → Payment Service (Confirmation)
8. Payment Service → Booking Database (Update Status)
9. Booking Service → Notification Service (Confirmation)
10. Notification Service → Customer (Email/SMS)

### Stylist Management Flow
1. Stylist → Authentication Service (Credentials)
2. Authentication Service → Stylist Database (Validation)
3. Stylist → Booking Service (Schedule Update)
4. Booking Service → Booking Database (Update Schedule)
5. Booking Service → Customer Database (Access Customer Data)

### Administrative Flow
1. Administrator → Authentication Service (Credentials)
2. Authentication Service → Admin Database (Validation)
3. Administrator → Admin Service (Management Actions)
4. Admin Service → All Databases (Read/Write Access)
5. Admin Service → Audit Logs (Record Actions)

## Trust Boundaries
- Internet ↔ Web Application Firewall
- Public Domain ↔ Studio Domain
- Studio Domain ↔ Operations Domain
- Application ↔ Database
- Internal ↔ External Services
`;
  }

  private generateAttackTree(): string {
    return `
# Attack Tree - Beauty Booking Platform
# Generated on ${new Date().toISOString()}

## Goal: Compromise Customer Data

### 1. Direct Attack (Web Application)
#### 1.1 Authentication Bypass
- 1.1.1 SQL Injection in login form
- 1.1.2 Weak password policies
- 1.1.3 Lack of account lockout
- 1.1.4 Session hijacking

#### 1.2 Authorization Bypass
- 1.2.1 Broken access control
- 1.2.2 Privilege escalation
- 1.2.3 IDOR (Insecure Direct Object References)
- 1.2.4 CORS misconfiguration

#### 1.3 Data Extraction
- 1.3.1 Direct database access
- 1.3.2 API endpoint exploitation
- 1.3.3 Log file analysis
- 1.3.4 Memory scraping

### 2. Insider Attack
#### 2.1 Privileged User Abuse
- 2.1.1 Stylist accessing customer data
- 2.1.2 Administrator data exfiltration
- 2.1.3 Shared account abuse
- 2.1.4 After-hours access

#### 2.2 Social Engineering
- 2.2.1 Phishing attacks on staff
- 2.2.2 Credential sharing
- 2.2.3 Help desk deception
- 2.2.4 Physical access attempts

### 3. Supply Chain Attack
#### 3.1 Third-Party Compromise
- 3.1.1 Payment processor breach
- 3.1.2 Email service compromise
- 3.1.3 Cloud provider breach
- 3.1.4 API provider breach

#### 3.2 Software Supply Chain
- 3.2.1 Malicious dependency
- 3.2.2 Compromised container image
- 3.2.3 Development environment breach
- 3.2.4 Update mechanism compromise

### 4. Infrastructure Attack
#### 4.1 Network Attacks
- 4.1.1 Man-in-the-middle attacks
- 4.1.2 DNS spoofing
- 4.1.3 Network segmentation bypass
- 4.1.4 VPN compromise

#### 4.2 Infrastructure Compromise
- 4.2.1 Server compromise
- 4.2.2 Database breach
- 4.2.3 Cloud account takeover
- 4.2.4 Container escape

## Countermeasures by Attack Path

### Direct Attack Countermeasures
- Web Application Firewall
- Input validation and sanitization
- Strong authentication (MFA)
- Regular security testing
- Secure coding practices

### Insider Attack Countermeasures
- Background checks
- Least privilege access
- Activity monitoring
- Separation of duties
- Regular access reviews

### Supply Chain Countermeasures
- Vendor security assessments
- SBOM management
- Code signing
- Dependency scanning
- Contractual security requirements

### Infrastructure Countermeasures
- Network segmentation
- Encryption everywhere
- Infrastructure monitoring
- Regular patching
- Hardened configurations
`;
  }
}

// Export singleton instance
export const threatModeling = new ThreatModelingManager();

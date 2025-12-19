/**
 * Type definitions for Comprehensive Platform Security Package
 */

export type SecurityDomain = 
  | 'authentication'
  | 'authorization'
  | 'application-security'
  | 'data-protection'
  | 'encryption'
  | 'network-security'
  | 'infrastructure-security'
  | 'secrets-management'
  | 'ci-cd-security'
  | 'monitoring'
  | 'incident-response'
  | 'compliance'
  | 'governance'
  | 'physical-security'
  | 'supply-chain'
  | 'client-security'
  | 'testing'
  | 'backup-recovery'
  | 'emerging-threats';

export type ControlCategory = 'preventive' | 'detective' | 'corrective' | 'directive';
export type ControlSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ControlStatus = 'implemented' | 'partial' | 'planned' | 'not-applicable' | 'exempted';

export interface SecurityControl {
  id: string;
  domain: SecurityDomain;
  category: ControlCategory;
  title: string;
  description: string;
  severity: ControlSeverity;
  status: ControlStatus;
  implementation: {
    automated: boolean;
    tools: string[];
    procedures: string[];
    evidence: string[];
  };
  validation: {
    frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    method: 'automated' | 'manual' | 'hybrid';
    tests: string[];
    metrics: string[];
  };
  compliance: {
    frameworks: string[];
    requirements: string[];
    evidence: string[];
  };
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string[];
  };
  lastAssessed: Date;
  nextAssessment: Date;
  owner: string;
  notes?: string;
}

export interface SecurityPolicy {
  id: string;
  domain: SecurityDomain;
  title: string;
  description: string;
  purpose: string;
  scope: string[];
  responsibilities: Array<{
    role: string;
    responsibilities: string[];
  }>;
  procedures: Array<{
    name: string;
    steps: string[];
    frequency: string;
  }>;
  compliance: {
    frameworks: string[];
    requirements: string[];
  };
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  approvedBy: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
}

export interface SecurityAssessment {
  id: string;
  timestamp: Date;
  type: 'domain-assessment' | 'control-validation' | 'compliance-audit' | 'risk-assessment';
  scope: {
    domains: SecurityDomain[];
    controls: string[];
    frameworks: string[];
  };
  results: {
    overallScore: number;
    domainScores: Record<SecurityDomain, number>;
    controlResults: Array<{
      controlId: string;
      status: 'pass' | 'fail' | 'warning' | 'exempted';
      score: number;
      findings: string[];
      recommendations: string[];
    }>;
    complianceResults: Array<{
      framework: string;
      score: number;
      gaps: string[];
      recommendations: string[];
    }>;
  };
  risks: Array<{
    id: string;
    domain: SecurityDomain;
    title: string;
    description: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    likelihood: string;
    mitigation: string[];
    owner: string;
    dueDate: Date;
  }>;
  recommendations: string[];
  nextAssessment: Date;
}

export interface SecurityBlueprint {
  id: string;
  name: string;
  description: string;
  version: string;
  domains: SecurityDomain[];
  controls: SecurityControl[];
  policies: SecurityPolicy[];
  frameworks: string[];
  maturity: 'initial' | 'developing' | 'defined' | 'managed' | 'optimized';
  lastUpdated: Date;
  nextReview: Date;
}

export interface SecurityIncident {
  id: string;
  timestamp: Date;
  type: 'security-breach' | 'data-leak' | 'system-compromise' | 'policy-violation' | 'threat-detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  domain: SecurityDomain;
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  impact: {
    affected: string[];
    data: string[];
    systems: string[];
    users: number;
    financial: number;
  };
  timeline: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
  }>;
  rootCause: string;
  lessons: string[];
  preventive: string[];
  owner: string;
  resolvedAt?: Date;
}

export interface SecurityMetrics {
  domain: SecurityDomain;
  metrics: Array<{
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
    lastUpdated: Date;
  }>;
  kpis: Array<{
    name: string;
    value: number;
    target: number;
    status: 'on-track' | 'at-risk' | 'critical';
  }>;
  health: 'healthy' | 'warning' | 'critical';
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    mandatory: boolean;
    controls: string[];
  }>;
  mappings: Record<string, string[]>; // Control ID to requirement IDs
}

export interface SecurityConfig {
  enableAllDomains: boolean;
  enforceControls: boolean;
  auditMode: boolean;
  complianceFrameworks: string[];
  securityDomains: SecurityDomain[];
  assessmentFrequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  reportFormat: 'summary' | 'detailed' | 'executive';
  autoRemediation: boolean;
  alertThreshold: 'low' | 'medium' | 'high' | 'critical';
}

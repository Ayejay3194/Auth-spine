// Legal Domain Suite Index
// Exports all legal-related functionality

// Compliance Suite
export * from './compliance';

// Governance Suite
export * from './governance';

// Documentation Suite
export * from './documentation';

// Legal Types
export interface LegalCompliance {
  id: string;
  standard: string;
  requirement: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'exempt';
  lastAssessed: Date;
  nextAssessment: Date;
  evidence: ComplianceEvidence[];
  owner: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'test_result' | 'certificate';
  name: string;
  url?: string;
  description: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface LegalGovernance {
  id: string;
  policy: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  category: 'privacy' | 'security' | 'operational' | 'financial' | 'hr';
  description: string;
  requirements: string[];
  owner: string;
  approvers: string[];
  effectiveDate: Date;
  reviewDate: Date;
}

export interface LegalDocument {
  id: string;
  title: string;
  type: 'policy' | 'procedure' | 'guideline' | 'contract' | 'agreement';
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  content: string;
  attachments: DocumentAttachment[];
  owner: string;
  reviewers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface LegalAudit {
  id: string;
  type: 'internal' | 'external' | 'regulatory';
  scope: string;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  scheduledDate: Date;
  completedDate?: Date;
  auditors: string[];
  findings: AuditFinding[];
  recommendations: string[];
}

export interface AuditFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

// Legal Constants
export const COMPLIANCE_STANDARDS = {
  GDPR: 'GDPR',
  CCPA: 'CCPA',
  HIPAA: 'HIPAA',
  SOX: 'SOX',
  PCI_DSS: 'PCI_DSS',
  ISO_27001: 'ISO_27001',
  SOC_2: 'SOC_2',
  NIST: 'NIST'
} as const;

export const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  NON_COMPLIANT: 'non-compliant',
  PENDING: 'pending',
  EXEMPT: 'exempt'
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const POLICY_STATUS = {
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  DEPRECATED: 'deprecated'
} as const;

export const DOCUMENT_TYPES = {
  POLICY: 'policy',
  PROCEDURE: 'procedure',
  GUIDELINE: 'guideline',
  CONTRACT: 'contract',
  AGREEMENT: 'agreement'
} as const;

export const AUDIT_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  REGULATORY: 'regulatory'
} as const;

export const AUDIT_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

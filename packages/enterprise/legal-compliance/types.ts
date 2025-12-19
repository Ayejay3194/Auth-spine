/**
 * Type definitions for Legal & Compliance Disaster Kit
 */

export type ComplianceFramework = 
  | 'GDPR'
  | 'CCPA'
  | 'HIPAA'
  | 'SOX'
  | 'SOC2'
  | 'ISO27001'
  | 'PCI-DSS'
  | 'NIST'
  | 'CIS';

export type ComplianceStatus = 
  | 'compliant'
  | 'non-compliant'
  | 'pending'
  | 'exempt'
  | 'not-applicable';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  framework: ComplianceFramework;
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  dueDate?: Date;
  assignedTo?: string;
  evidence?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface ComplianceChecklist {
  id: string;
  name: string;
  description: string;
  framework: ComplianceFramework;
  items: ComplianceItem[];
  progress: {
    total: number;
    completed: number;
    pending: number;
    blocked: number;
  };
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  type: 'privacy' | 'terms' | 'dpa' | 'cookie' | 'retention' | 'aup' | 'accessibility' | 'security';
  framework: ComplianceFramework[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  content: string;
  version: string;
  effectiveDate?: Date;
  reviewDate?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentReport {
  id: string;
  type: 'data-breach' | 'security-incident' | 'compliance-violation' | 'privacy-complaint';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    affectedUsers: number;
    dataTypes: string[];
    systems: string[];
    regions: string[];
  };
  timeline: IncidentEvent[];
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  assignedTo?: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedAt?: Date;
  rootCause?: string;
  remediation?: string;
  notificationsSent: boolean;
  regulatoryReportingRequired: boolean;
  regulatoryReportedAt?: Date;
}

export interface IncidentEvent {
  timestamp: Date;
  type: 'detection' | 'assessment' | 'containment' | 'notification' | 'resolution';
  description: string;
  performedBy?: string;
}

export interface ProductRequirement {
  id: string;
  category: 'data-export' | 'data-deletion' | 'consent-management' | 'log-redaction' | 'access-control';
  title: string;
  description: string;
  acceptanceCriteria: string[];
  status: 'pending' | 'in-progress' | 'testing' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRegistry {
  id: string;
  type: 'vendor' | 'subprocessor' | 'oss-license' | 'ropa' | 'dpia';
  name: string;
  description: string;
  framework: ComplianceFramework[];
  status: 'active' | 'inactive' | 'under-review' | 'deprecated';
  data: Record<string, any>;
  reviewDate?: Date;
  nextReviewDate?: Date;
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorRegistry extends ComplianceRegistry {
  type: 'vendor';
  data: {
    category: string;
    riskLevel: RiskLevel;
    dataProcessed: string[];
    location: string;
    contractStart: Date;
    contractEnd?: Date;
    slaRequirements: string[];
    complianceCertifications: string[];
  };
}

export interface SubprocessorRegistry extends ComplianceRegistry {
  type: 'subprocessor';
  data: {
    category: string;
    services: string[];
    dataProcessed: string[];
    location: string;
    dataProcessingAgreement: boolean;
    complianceCertifications: string[];
  };
}

export interface OSSLicenseRegistry extends ComplianceRegistry {
  type: 'oss-license';
  data: {
    licenseType: string;
    licenseUrl: string;
    projects: string[];
    restrictions: string[];
    approvalStatus: 'approved' | 'pending' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
  };
}

export interface ROPARegistry extends ComplianceRegistry {
  type: 'ropa';
  data: {
    dataController: string;
    dataProcessor: string;
    dataCategories: string[];
    dataSubjects: string[];
    processingPurpose: string;
    legalBasis: string;
    dataRetention: string;
    securityMeasures: string[];
    internationalTransfer: boolean;
    transferMechanism?: string;
  };
}

export interface DPIARegistry extends ComplianceRegistry {
  type: 'dpia';
  data: {
    processingActivities: string[];
    riskLevel: RiskLevel;
    riskMitigation: string[];
    consultationRequired: boolean;
    consultationCompleted: boolean;
    dpoApproval: boolean;
    dpoApprovedAt?: Date;
    reviewBoardApproval: boolean;
    reviewBoardApprovedAt?: Date;
  };
}

export interface BillingControl {
  id: string;
  type: 'usage-limit' | 'spend-alert' | 'approval-required' | 'auto-scaling';
  name: string;
  description: string;
  threshold: number;
  current: number;
  unit: string;
  status: 'active' | 'inactive' | 'triggered';
  alertRecipients: string[];
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceConfig {
  enabledFrameworks: ComplianceFramework[];
  autoTrackChanges: boolean;
  requireApproval: boolean;
  auditRetention: number;
  incidentRetention: number;
  enableNotifications: boolean;
  enableAutomatedChecks: boolean;
  approvalWorkflow: {
    requiredForPolicyChanges: boolean;
    requiredForVendorChanges: boolean;
    requiredForIncidentResolution: boolean;
    approvers: string[];
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    recipients: {
      incidents: string[];
      policyChanges: string[];
      complianceAlerts: string[];
    };
  };
}

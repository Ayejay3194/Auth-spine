/**
 * Type definitions for SaaS PaaS Security Checklist Package
 */

export interface SecurityChecklistConfig {
  authentication: AuthenticationChecklistConfig;
  dataProtection: DataProtectionChecklistConfig;
  infrastructure: InfrastructureChecklistConfig;
  compliance: ComplianceChecklistConfig;
  operational: OperationalChecklistConfig;
}

export interface AuthenticationChecklistConfig {
  enabled: boolean;
  mfa: boolean;
  sso: boolean;
  rbac: boolean;
  passwordPolicy: boolean;
  sessionManagement: boolean;
}

export interface DataProtectionChecklistConfig {
  enabled: boolean;
  encryption: boolean;
  dataMasking: boolean;
  keyManagement: boolean;
  dataClassification: boolean;
  privacyControls: boolean;
}

export interface InfrastructureChecklistConfig {
  enabled: boolean;
  networkSecurity: boolean;
  cloudSecurity: boolean;
  containerSecurity: boolean;
  apiSecurity: boolean;
  monitoring: boolean;
}

export interface ComplianceChecklistConfig {
  enabled: boolean;
  frameworks: string[];
  controls: boolean;
  audits: boolean;
  reporting: boolean;
}

export interface OperationalChecklistConfig {
  enabled: boolean;
  incidentResponse: boolean;
  backupRecovery: boolean;
  changeManagement: boolean;
  vendorManagement: boolean;
  training: boolean;
}

export interface SecurityChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requirement: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
  evidence: string[];
  notes: string;
  dueDate?: Date;
  assignedTo?: string;
}

export interface SecurityChecklistCategory {
  id: string;
  name: string;
  description: string;
  items: SecurityChecklistItem[];
  completionRate: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAssessment {
  id: string;
  name: string;
  date: Date;
  categories: SecurityChecklistCategory[];
  overallScore: number;
  findings: SecurityFinding[];
  recommendations: SecurityRecommendation[];
  status: 'draft' | 'in-progress' | 'completed' | 'reviewed';
}

export interface SecurityFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  impact: string;
  remediation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  discovered: Date;
  resolved?: Date;
}

export interface SecurityRecommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  impact: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  category: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  mappings: ComplianceMapping[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  evidence: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  implemented: boolean;
  tested: boolean;
  evidence: string[];
  effectiveness: 'low' | 'medium' | 'high';
}

export interface ComplianceMapping {
  requirementId: string;
  controlId: string;
  frameworkId: string;
  mappingType: 'direct' | 'partial' | 'indirect';
  notes: string;
}

export interface SecurityMetrics {
  overall: {
    completionRate: number;
    complianceScore: number;
    riskScore: number;
    findingsCount: number;
  };
  categories: {
    authentication: CategoryMetrics;
    dataProtection: CategoryMetrics;
    infrastructure: CategoryMetrics;
    compliance: CategoryMetrics;
    operational: CategoryMetrics;
  };
}

export interface CategoryMetrics {
  completionRate: number;
  itemsCompleted: number;
  itemsTotal: number;
  highPriorityItems: number;
  criticalItems: number;
  averageTimeToComplete: number;
}

export interface SecurityChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  items: SecurityChecklistItem[];
  version: string;
  lastUpdated: Date;
}

export interface SecurityChecklistReport {
  id: string;
  name: string;
  date: Date;
  assessment: SecurityAssessment;
  summary: {
    overallScore: number;
    completionRate: number;
    criticalFindings: number;
    highFindings: number;
    recommendationsCount: number;
  };
  trends: {
    previousScore?: number;
    scoreChange: number;
    completionTrend: 'improving' | 'stable' | 'declining';
  };
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'findings' | 'recommendations' | 'compliance' | 'metrics';
  content: string;
  charts: ChartData[];
}

export interface ChartData {
  type: 'bar' | 'pie' | 'line' | 'radar';
  title: string;
  data: any[];
  options?: any;
}

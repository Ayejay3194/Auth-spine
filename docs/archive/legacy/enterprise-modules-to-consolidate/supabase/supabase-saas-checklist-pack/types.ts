/**
 * Type definitions for Supabase SaaS Checklist Pack
 */

export interface SaasChecklistConfig {
  checklist: ChecklistConfig;
  implementation: ImplementationConfig;
  security: SecurityConfig;
  compliance: ComplianceConfig;
}

export interface ChecklistConfig {
  enabled: boolean;
  categories: boolean;
  validation: boolean;
  tracking: boolean;
  reporting: boolean;
}

export interface ImplementationConfig {
  enabled: boolean;
  phases: boolean;
  tasks: boolean;
  dependencies: boolean;
  milestones: boolean;
}

export interface SecurityConfig {
  enabled: boolean;
  controls: boolean;
  assessments: boolean;
  monitoring: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  frameworks: boolean;
  controls: boolean;
  evidence: boolean;
  audits: boolean;
}

export interface SaasChecklistMetrics {
  checklist: ChecklistMetrics;
  implementation: ImplementationMetrics;
  security: SecurityMetrics;
  compliance: ComplianceMetrics;
  overall: {
    completionRate: number;
    complianceScore: number;
    securityPosture: number;
    implementationProgress: number;
  };
}

export interface ChecklistMetrics {
  categoriesCompleted: number;
  itemsValidated: number;
  trackingProgress: number;
  reportsGenerated: number;
  checklistCoverage: number;
}

export interface ImplementationMetrics {
  phasesCompleted: number;
  tasksFinished: number;
  dependenciesResolved: number;
  milestonesAchieved: number;
  implementationSpeed: number;
}

export interface SecurityMetrics {
  controlsImplemented: number;
  assessmentsPassed: number;
  monitoringActive: number;
  securityScore: number;
  threatsMitigated: number;
}

export interface ComplianceMetrics {
  frameworksActive: number;
  controlsImplemented: number;
  evidenceCollected: number;
  auditsPassed: number;
  complianceRate: number;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: CategoryProgress;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  type: 'requirement' | 'recommendation' | 'optional';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable' | 'blocked';
  dependencies: string[];
  validation: ItemValidation;
  evidence: EvidenceItem[];
  assignee?: string;
  dueDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  notes: string;
}

export interface ItemValidation {
  automated: boolean;
  rules: ValidationRule[];
  tests: ValidationTest[];
  criteria: ValidationCriteria;
}

export interface ValidationRule {
  id: string;
  name: string;
  condition: string;
  expected: any;
  actual?: any;
  passed: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationTest {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'security';
  script: string;
  result: TestResult;
}

export interface TestResult {
  passed: boolean;
  duration: number;
  message: string;
  output: string;
  coverage?: number;
}

export interface ValidationCriteria {
  functional: string[];
  performance: PerformanceCriteria;
  security: SecurityCriteria;
  compliance: ComplianceCriteria;
}

export interface PerformanceCriteria {
  responseTime: number;
  throughput: number;
  resourceUsage: number;
  availability: number;
}

export interface SecurityCriteria {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  audit: boolean;
}

export interface ComplianceCriteria {
  frameworks: string[];
  controls: string[];
  evidence: string[];
  audit: boolean;
}

export interface EvidenceItem {
  id: string;
  type: 'screenshot' | 'log' | 'document' | 'test' | 'configuration' | 'code';
  title: string;
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  collected: Date;
  verified: boolean;
  verifiedBy?: string;
}

export interface CategoryProgress {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  blockedItems: number;
  completionRate: number;
  lastUpdated: Date;
  estimatedCompletion: Date;
}

export interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  tasks: ImplementationTask[];
  dependencies: string[];
  milestones: PhaseMilestone[];
  startDate?: Date;
  endDate?: Date;
  estimatedDuration: number;
  actualDuration?: number;
}

export interface ImplementationTask {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
  checklistItems: string[];
  deliverables: TaskDeliverable[];
  risks: TaskRisk[];
}

export interface TaskDeliverable {
  id: string;
  name: string;
  type: 'document' | 'code' | 'configuration' | 'test' | 'deployment';
  description: string;
  required: boolean;
  status: 'pending' | 'in-progress' | 'completed';
  artifact?: string;
}

export interface TaskRisk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface PhaseMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
  dependencies: string[];
  criteria: string[];
}

export interface SecurityControl {
  id: string;
  name: string;
  category: 'technical' | 'administrative' | 'physical';
  description: string;
  implementation: ControlImplementation;
  assessment: ControlAssessment;
  status: 'planned' | 'implementing' | 'implemented' | 'tested' | 'verified';
  effectiveness: 'low' | 'medium' | 'high';
  maturity: number;
}

export interface ControlImplementation {
  approach: string;
  tools: string[];
  procedures: string[];
  responsibilities: ControlResponsibility[];
  timeline: ImplementationTimeline;
}

export interface ControlResponsibility {
  role: string;
  responsibilities: string[];
  accountable: boolean;
}

export interface ImplementationTimeline {
  startDate: Date;
  endDate: Date;
  phases: TimelinePhase[];
  dependencies: string[];
}

export interface TimelinePhase {
  name: string;
  startDate: Date;
  endDate: Date;
  deliverables: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ControlAssessment {
  method: 'automated' | 'manual' | 'hybrid';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  criteria: AssessmentCriteria[];
  lastAssessment: Date;
  nextAssessment: Date;
  results: AssessmentResult[];
}

export interface AssessmentCriteria {
  name: string;
  description: string;
  threshold: number;
  weight: number;
}

export interface AssessmentResult {
  date: Date;
  score: number;
  passed: boolean;
  findings: AssessmentFinding[];
  recommendations: string[];
  assessor: string;
}

export interface AssessmentFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface ComplianceFramework {
  id: string;
  name: string;
  type: 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'pci_dss' | 'custom';
  version: string;
  scope: ComplianceScope;
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  evidence: ComplianceEvidence[];
  status: 'active' | 'inactive' | 'archived';
}

export interface ComplianceScope {
  systems: string[];
  processes: string[];
  dataTypes: string[];
  locations: string[];
  exclusions: string[];
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  name: string;
  description: string;
  category: string;
  family: string;
  implementation: ComplianceImplementation;
  testing: ComplianceTesting;
  evidence: string[];
  status: 'planned' | 'implementing' | 'implemented' | 'testing' | 'validated';
  effectiveness: 'ineffective' | 'partially_effective' | 'effective';
  lastReviewed: Date;
  nextReview: Date;
}

export interface ComplianceImplementation {
  approach: string;
  procedures: string[];
  tools: string[];
  documentation: string[];
  training: string[];
  responsible: string[];
}

export interface ComplianceTesting {
  method: 'test' | 'interview' | 'observation' | 'document_review';
  frequency: string;
  procedures: string[];
  samples: ComplianceSample[];
  results: ComplianceTestResult[];
}

export interface ComplianceSample {
  id: string;
  description: string;
  size: number;
  method: string;
  selection: string[];
}

export interface ComplianceTestResult {
  date: Date;
  tester: string;
  findings: ComplianceTestFinding[];
  conclusion: 'pass' | 'fail' | 'pass_with_exceptions';
  recommendations: string[];
}

export interface ComplianceTestFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  type: 'internal' | 'external' | 'self';
  period: AssessmentPeriod;
  scope: string[];
  methodology: string;
  assessors: Assessor[];
  findings: ComplianceAssessmentFinding[];
  report: AssessmentReport;
  status: 'planned' | 'in-progress' | 'completed' | 'reviewed';
}

export interface AssessmentPeriod {
  startDate: Date;
  endDate: Date;
  type: 'annual' | 'quarterly' | 'ad-hoc';
}

export interface Assessor {
  id: string;
  name: string;
  role: string;
  qualifications: string[];
  certified: boolean;
}

export interface ComplianceAssessmentFinding {
  id: string;
  controlId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  rootCause: string;
  impact: string;
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface AssessmentReport {
  id: string;
  title: string;
  date: Date;
  summary: string;
  score: number;
  conclusions: string[];
  recommendations: string[];
  attachments: string[];
}

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  type: 'policy' | 'procedure' | 'record' | 'test' | 'configuration' | 'screenshot';
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  collected: Date;
  collectedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  retention: Date;
}

export interface ChecklistReport {
  id: string;
  name: string;
  type: 'progress' | 'compliance' | 'security' | 'implementation';
  date: Date;
  period: ReportPeriod;
  summary: ReportSummary;
  details: ReportDetails;
  recommendations: ReportRecommendation[];
  generatedBy: string;
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
}

export interface ReportSummary {
  overallScore: number;
  completionRate: number;
  complianceRate: number;
  securityScore: number;
  keyMetrics: Record<string, number>;
  status: 'on-track' | 'at-risk' | 'off-track';
}

export interface ReportDetails {
  categories: CategoryReport[];
  phases: PhaseReport[];
  controls: ControlReport[];
  findings: FindingReport[];
}

export interface CategoryReport {
  categoryId: string;
  name: string;
  completionRate: number;
  itemsCompleted: number;
  itemsTotal: number;
  blockedItems: number;
  overdueItems: number;
}

export interface PhaseReport {
  phaseId: string;
  name: string;
  status: string;
  completionRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  milestonesAchieved: number;
  milestonesTotal: number;
}

export interface ControlReport {
  controlId: string;
  name: string;
  status: string;
  effectiveness: string;
  lastAssessment: Date;
  score: number;
  findings: number;
}

export interface FindingReport {
  id: string;
  type: string;
  severity: string;
  status: string;
  age: number;
  overdue: boolean;
}

export interface ReportRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  category: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  dueDate: Date;
  assignee?: string;
}

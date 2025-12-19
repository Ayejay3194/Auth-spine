/**
 * Type definitions for Supabase Features Checklist Suite
 */

export interface FeaturesChecklistConfig {
  checklist: ChecklistConfig;
  implementation: ImplementationConfig;
  validation: ValidationConfig;
  bestPractices: BestPracticesConfig;
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
  guidance: boolean;
  templates: boolean;
  examples: boolean;
  documentation: boolean;
}

export interface ValidationConfig {
  enabled: boolean;
  automated: boolean;
  manual: boolean;
  testing: boolean;
  compliance: boolean;
}

export interface BestPracticesConfig {
  enabled: boolean;
  patterns: boolean;
  guidelines: boolean;
  recommendations: boolean;
  optimization: boolean;
}

export interface FeaturesChecklistMetrics {
  checklist: ChecklistMetrics;
  implementation: ImplementationMetrics;
  validation: ValidationMetrics;
  bestPractices: BestPracticesMetrics;
  overall: {
    completionRate: number;
    complianceScore: number;
    implementationQuality: number;
    bestPracticeAdoption: number;
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
  guidanceProvided: number;
  templatesUsed: number;
  examplesImplemented: number;
  documentationCreated: number;
  implementationSpeed: number;
}

export interface ValidationMetrics {
  automatedChecks: number;
  manualReviews: number;
  testsPassed: number;
  complianceMet: number;
  validationAccuracy: number;
}

export interface BestPracticesMetrics {
  patternsApplied: number;
  guidelinesFollowed: number;
  recommendationsImplemented: number;
  optimizationsApplied: number;
  practiceMaturity: number;
}

export interface FeatureChecklist {
  id: string;
  name: string;
  category: string;
  description: string;
  items: ChecklistItem[];
  validation: ValidationRule[];
  implementation: ImplementationGuide;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress: ChecklistProgress;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  type: 'requirement' | 'recommendation' | 'optional';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
  dependencies: string[];
  validation: ItemValidation;
  implementation: ItemImplementation;
  evidence: EvidenceItem[];
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
}

export interface ValidationTest {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  script: string;
  result: TestResult;
}

export interface TestResult {
  passed: boolean;
  duration: number;
  message: string;
  output: string;
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

export interface ItemImplementation {
  template: string;
  examples: ImplementationExample[];
  steps: ImplementationStep[];
  resources: ImplementationResource[];
  timeline: ImplementationTimeline;
}

export interface ImplementationExample {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  category: string;
}

export interface ImplementationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'setup' | 'configuration' | 'development' | 'testing' | 'deployment';
  estimatedTime: number;
  dependencies: string[];
  completed: boolean;
}

export interface ImplementationResource {
  id: string;
  type: 'documentation' | 'tool' | 'library' | 'service';
  name: string;
  url: string;
  description: string;
  required: boolean;
}

export interface ImplementationTimeline {
  startDate: Date;
  endDate: Date;
  milestones: TimelineMilestone[];
  dependencies: string[];
}

export interface TimelineMilestone {
  id: string;
  name: string;
  date: Date;
  description: string;
  completed: boolean;
}

export interface EvidenceItem {
  id: string;
  type: 'screenshot' | 'log' | 'document' | 'test' | 'configuration';
  title: string;
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  collected: Date;
  verified: boolean;
}

export interface ChecklistProgress {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  pendingItems: number;
  completionRate: number;
  lastUpdated: Date;
  estimatedCompletion: Date;
}

export interface BestPractice {
  id: string;
  name: string;
  category: string;
  description: string;
  pattern: string;
  guidelines: PracticeGuideline[];
  examples: PracticeExample[];
  benefits: string[];
  implementation: PracticeImplementation;
}

export interface PracticeGuideline {
  id: string;
  title: string;
  description: string;
  category: 'design' | 'development' | 'deployment' | 'maintenance';
  priority: 'low' | 'medium' | 'high';
  applicable: boolean;
}

export interface PracticeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  context: string;
  outcome: string;
}

export interface PracticeImplementation {
  steps: string[];
  prerequisites: string[];
  tools: string[];
  timeEstimate: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface ValidationReport {
  id: string;
  checklistId: string;
  date: Date;
  summary: ValidationSummary;
  details: ValidationDetail[];
  recommendations: ValidationRecommendation[];
  overallScore: number;
  status: 'passed' | 'failed' | 'partial';
}

export interface ValidationSummary {
  totalItems: number;
  passedItems: number;
  failedItems: number;
  skippedItems: number;
  passRate: number;
  criticalFailures: number;
}

export interface ValidationDetail {
  itemId: string;
  itemName: string;
  status: 'passed' | 'failed' | 'skipped';
  score: number;
  issues: ValidationIssue[];
  evidence: string[];
}

export interface ValidationIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  category: string;
}

export interface ValidationRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

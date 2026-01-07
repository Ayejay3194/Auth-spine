/**
 * Type definitions for SaaS PaaS Security Checklist Pack 2
 */

export interface SecurityChecklist2Config {
  enhanced: EnhancedConfig;
  structured: StructuredConfig;
  compliance: Compliance2Config;
}

export interface EnhancedConfig {
  enabled: boolean;
  advancedControls: boolean;
  automatedAssessments: boolean;
  continuousMonitoring: boolean;
  threatModeling: boolean;
}

export interface StructuredConfig {
  enabled: boolean;
  riskAssessments: boolean;
  gapAnalysis: boolean;
  maturityModels: boolean;
  benchmarking: boolean;
}

export interface Compliance2Config {
  enabled: boolean;
  frameworks: string[];
  automatedCompliance: boolean;
  evidenceCollection: boolean;
  auditReadiness: boolean;
}

export interface EnhancedChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requirement: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
  evidence: string[];
  notes: string;
  automation: boolean;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  owner: string;
  metrics: ChecklistMetrics;
}

export interface ChecklistMetrics {
  completionTime: number;
  lastUpdated: Date;
  riskScore: number;
  complexity: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}

export interface StructuredAssessment {
  id: string;
  name: string;
  type: 'risk' | 'gap' | 'maturity' | 'benchmark';
  date: Date;
  scope: string[];
  methodology: string;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  score: number;
  status: 'draft' | 'in-progress' | 'completed' | 'reviewed';
}

export interface AssessmentFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  likelihood: 'low' | 'medium' | 'high';
  riskScore: number;
  evidence: string[];
  remediation: string;
  owner: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

export interface AssessmentRecommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  dependencies: string[];
  owner: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ComplianceModule {
  id: string;
  name: string;
  framework: string;
  version: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  mappings: ComplianceMapping[];
  evidence: ComplianceEvidence[];
  status: 'active' | 'inactive' | 'archived';
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  evidence: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
  lastReviewed: Date;
  nextReview: Date;
  owner: string;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  implemented: boolean;
  tested: boolean;
  effective: boolean;
  evidence: string[];
  lastTested: Date;
  nextTest: Date;
  owner: string;
  maturity: 'initial' | 'repeatable' | 'defined' | 'managed' | 'optimized';
}

export interface ComplianceMapping {
  requirementId: string;
  controlId: string;
  frameworkId: string;
  mappingType: 'direct' | 'partial' | 'indirect';
  confidence: number;
  notes: string;
  lastUpdated: Date;
}

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  type: 'document' | 'screenshot' | 'log' | 'test' | 'interview' | 'observation';
  title: string;
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  collected: Date;
  expires?: Date;
  collector: string;
  verified: boolean;
  verifier?: string;
}

export interface SecurityChecklist2Metrics {
  overall: {
    completionRate: number;
    complianceScore: number;
    riskScore: number;
    maturityScore: number;
    automationRate: number;
  };
  categories: {
    enhanced: Category2Metrics;
    structured: Category2Metrics;
    compliance: Category2Metrics;
  };
  trends: {
    completionTrend: 'improving' | 'stable' | 'declining';
    riskTrend: 'decreasing' | 'stable' | 'increasing';
    complianceTrend: 'improving' | 'stable' | 'declining';
  };
}

export interface Category2Metrics {
  completionRate: number;
  itemsCompleted: number;
  itemsTotal: number;
  automatedItems: number;
  highPriorityItems: number;
  criticalItems: number;
  averageCompletionTime: number;
  riskScore: number;
}

export interface ThreatModel {
  id: string;
  name: string;
  description: string;
  scope: string[];
  assets: ThreatAsset[];
  threats: Threat[];
  vulnerabilities: Vulnerability[];
  controls: ThreatControl[];
  riskScore: number;
  lastUpdated: Date;
  nextReview: Date;
}

export interface ThreatAsset {
  id: string;
  name: string;
  type: 'data' | 'system' | 'process' | 'network' | 'physical';
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  value: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  location: string;
}

export interface Threat {
  id: string;
  name: string;
  type: 'malicious' | 'accidental' | 'environmental';
  source: string;
  motivation: string;
  capability: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface Vulnerability {
  id: string;
  name: string;
  type: 'technical' | 'process' | 'people';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedAssets: string[];
  exploitability: 'low' | 'medium' | 'high';
  detection: 'easy' | 'moderate' | 'difficult';
}

export interface ThreatControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  effectiveness: 'low' | 'medium' | 'high';
  implementation: 'planned' | 'in-progress' | 'implemented' | 'verified';
  cost: 'low' | 'medium' | 'high';
  description: string;
}

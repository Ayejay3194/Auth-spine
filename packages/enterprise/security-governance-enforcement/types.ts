/**
 * Type definitions for Security Governance Enforcement
 */

export interface GovernanceEnforcementConfig {
  governance: GovernanceConfig;
  enforcement: EnforcementConfig;
  risk: RiskConfig;
  ai: AIConfig;
}

export interface GovernanceConfig {
  enabled: boolean;
  policyEnforcement: boolean;
  complianceControls: boolean;
  auditAutomation: boolean;
  reporting: boolean;
}

export interface EnforcementConfig {
  enabled: boolean;
  automatedControls: boolean;
  realTimeMonitoring: boolean;
  violationDetection: boolean;
  remediationAutomation: boolean;
}

export interface RiskConfig {
  enabled: boolean;
  riskAssessment: boolean;
  threatModeling: boolean;
  vulnerabilityManagement: boolean;
  riskMitigation: boolean;
}

export interface AIConfig {
  enabled: boolean;
  anomalyDetection: boolean;
  predictiveAnalysis: boolean;
  threatIntelligence: boolean;
  automatedResponse: boolean;
}

export interface GovernanceMetrics {
  governance: GovernanceMetricsData;
  enforcement: EnforcementMetricsData;
  risk: RiskMetricsData;
  ai: AIMetricsData;
  overall: {
    complianceScore: number;
    riskScore: number;
    enforcementRate: number;
    governanceMaturity: number;
  };
}

export interface GovernanceMetricsData {
  policiesEnforced: number;
  complianceControls: number;
  auditAutomations: number;
  reportsGenerated: number;
  policyViolations: number;
}

export interface EnforcementMetricsData {
  automatedControls: number;
  realTimeAlerts: number;
  violationsDetected: number;
  remediationsAutomated: number;
  enforcementActions: number;
}

export interface RiskMetricsData {
  riskAssessments: number;
  threatsIdentified: number;
  vulnerabilitiesManaged: number;
  mitigationsImplemented: number;
  riskScore: number;
}

export interface AIMetricsData {
  anomaliesDetected: number;
  predictionsMade: number;
  threatsIntelligent: number;
  responsesAutomated: number;
  accuracy: number;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: PolicyRule[];
  enforcement: 'manual' | 'automated' | 'hybrid';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  lastUpdated: Date;
  owner: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'alert' | 'remediate';
  automated: boolean;
  priority: number;
  description: string;
}

export interface EnforcementAction {
  id: string;
  policyId: string;
  ruleId: string;
  type: 'prevent' | 'detect' | 'correct';
  action: string;
  automated: boolean;
  executed: boolean;
  timestamp: Date;
  result: 'success' | 'failure' | 'partial';
  details: string;
}

export interface RiskAssessment {
  id: string;
  name: string;
  type: 'strategic' | 'operational' | 'tactical';
  date: Date;
  scope: string[];
  risks: Risk[];
  overallScore: number;
  recommendations: RiskRecommendation[];
  status: 'draft' | 'in-progress' | 'completed' | 'reviewed';
}

export interface Risk {
  id: string;
  category: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigating' | 'mitigated' | 'accepted';
}

export interface RiskRecommendation {
  id: string;
  riskId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  impact: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ComplianceControl {
  id: string;
  name: string;
  framework: string;
  category: string;
  description: string;
  implemented: boolean;
  tested: boolean;
  effective: boolean;
  automated: boolean;
  lastAssessed: Date;
  nextAssessment: Date;
  owner: string;
  evidence: string[];
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected: Date;
  resolved?: Date;
  affected: string[];
  response: IncidentResponse[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface IncidentResponse {
  id: string;
  action: string;
  automated: boolean;
  timestamp: Date;
  performedBy: string;
  result: 'success' | 'failure' | 'partial';
}

export interface ThreatIntelligence {
  id: string;
  source: string;
  type: 'indicator' | 'campaign' | 'actor' | 'vulnerability';
  data: any;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  received: Date;
  processed: boolean;
  indicators: ThreatIndicator[];
}

export interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  context: string[];
}

export interface AIAnalysis {
  id: string;
  type: 'anomaly' | 'prediction' | 'threat' | 'behavior';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  data: any;
  timestamp: Date;
  recommendations: string[];
  falsePositive: boolean;
}

export interface GovernanceReport {
  id: string;
  name: string;
  type: 'compliance' | 'risk' | 'enforcement' | 'comprehensive';
  date: Date;
  period: string;
  metrics: GovernanceMetrics;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  status: 'draft' | 'final' | 'distributed';
}

export interface ReportFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  impact: string;
}

export interface ReportRecommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  timeline: string;
  owner: string;
}

/**
 * Type definitions for Security Next-Level Suite
 */

export type ComplianceFramework = 'SOC2' | 'ISO27001' | 'NIST-CSF' | 'PCI-DSS';
export type EnforcementMode = 'monitor' | 'enforce' | 'block';
export type MetricCategory = 'compliance' | 'risk' | 'incidents' | 'controls' | 'performance';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceCrosswalk {
  framework: ComplianceFramework;
  controls: Array<{
    controlId: string;
    title: string;
    description: string;
    category: string;
    mappings: Record<string, string[]>; // Maps to other frameworks
    requirements: string[];
    evidence: string[];
    testing: string[];
    frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    automated: boolean;
    status: 'implemented' | 'partial' | 'planned' | 'not-applicable';
    lastAssessed: Date;
    nextAssessment: Date;
  }>;
  maturity: 'initial' | 'developing' | 'defined' | 'managed' | 'optimized';
  lastUpdated: Date;
}

export interface EnforcementGuardrail {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  category: 'code' | 'config' | 'access' | 'data' | 'network';
  enforcement: EnforcementMode;
  conditions: {
    trigger: string;
    criteria: Record<string, any>;
    exceptions: string[];
  };
  actions: Array<{
    type: 'block' | 'warn' | 'log' | 'remediate' | 'escalate';
    parameters: Record<string, any>;
  }>;
  metrics: {
    executions: number;
    violations: number;
    blocked: number;
    lastExecution: Date;
  };
  enabled: boolean;
  severity: AlertSeverity;
}

export interface ExecutiveMetric {
  id: string;
  name: string;
  description: string;
  category: MetricCategory;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  status: 'on-track' | 'at-risk' | 'critical';
  lastUpdated: Date;
  historical: Array<{
    date: Date;
    value: number;
  }>;
  kpi: boolean;
  owner: string;
  drillDown: {
    type: 'control' | 'domain' | 'incident' | 'compliance';
    id: string;
    details: Record<string, any>;
  };
}

export interface SecurityOperatingSystem {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'maintenance' | 'degraded';
  components: {
    complianceCrosswalks: boolean;
    automatedEnforcement: boolean;
    executiveDashboard: boolean;
  };
  metrics: {
    overallScore: number;
    complianceRate: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    incidentCount: number;
    controlCoverage: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: AlertSeverity;
    message: string;
    timestamp: Date;
    acknowledged: boolean;
    assignedTo?: string;
  }>;
  lastHealthCheck: Date;
}

export interface SecurityDashboard {
  id: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    type: 'metrics' | 'charts' | 'alerts' | 'reports';
    widgets: Array<{
      id: string;
      type: 'metric' | 'chart' | 'table' | 'alert';
      title: string;
      data: any;
      config: Record<string, any>;
    }>;
  }>;
  refreshInterval: number;
  lastRefreshed: Date;
  filters: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  framework: ComplianceFramework;
  period: {
    start: Date;
    end: Date;
  };
  overallScore: number;
  controlResults: Array<{
    controlId: string;
    status: 'compliant' | 'non-compliant' | 'partial' | 'exempted';
    score: number;
    findings: string[];
    evidence: string[];
  }>;
  gaps: Array<{
    controlId: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation: string;
    dueDate: Date;
  }>;
  recommendations: string[];
  generatedAt: Date;
  nextReview: Date;
}

export interface EnforcementReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  guardrailResults: Array<{
    guardrailId: string;
    executions: number;
    violations: number;
    blocked: number;
    effectiveness: number;
  }>;
  trends: {
    violations: Array<{
      date: Date;
      count: number;
    }>;
    blocked: Array<{
      date: Date;
      count: number;
    }>;
  };
  recommendations: string[];
  generatedAt: Date;
}

export interface SecurityAlert {
  id: string;
  type: 'compliance' | 'enforcement' | 'metric' | 'incident';
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  details: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  assignedTo?: string;
  escalationLevel: number;
  actions: Array<{
    type: string;
    description: string;
    performedBy: string;
    timestamp: Date;
  }>;
}

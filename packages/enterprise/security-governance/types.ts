/**
 * Type definitions for Security Governance & Enforcement Layer
 */

export type ControlSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EnforcementType = 'CI' | 'RUNTIME' | 'MANUAL' | 'AUTOMATED';
export type ControlStatus = 'REQUIRED' | 'RECOMMENDED' | 'DEPRECATED' | 'OPTIONAL';

export interface SecurityControl {
  id: string;
  description: string;
  severity: ControlSeverity;
  enforcement: EnforcementType;
  evidence: string;
  status: ControlStatus;
  category: string;
  framework?: string[];
  implementation?: {
    type: 'code' | 'config' | 'process' | 'tool';
    location: string;
    automated: boolean;
  };
  validation?: {
    type: 'test' | 'scan' | 'manual' | 'automated';
    command?: string;
    script?: string;
    frequency: 'commit' | 'build' | 'deploy' | 'scheduled';
  };
  exemptions?: RiskAcceptance[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityGate {
  id: string;
  name: string;
  description: string;
  stage: 'pre-commit' | 'commit' | 'build' | 'test' | 'deploy' | 'runtime';
  controls: string[]; // Control IDs
  enforcement: 'BLOCK' | 'WARN' | 'LOG';
  conditions?: {
    branch?: string[];
    environment?: string[];
    files?: string[];
  };
  config: Record<string, any>;
  enabled: boolean;
}

export interface RiskAcceptance {
  id: string;
  controlId: string;
  reason: string;
  owner: string;
  approver: string;
  expirationDate: Date;
  mitigationPlan: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  createdAt: Date;
  reviewedAt?: Date;
  evidence?: string[];
}

export interface AITrustBoundary {
  id: string;
  name: string;
  description: string;
  type: 'data-access' | 'model-execution' | 'api-call' | 'file-operation';
  restrictions: {
    allowedModels: string[];
    allowedDataTypes: string[];
    blockedOperations: string[];
    maxTokens?: number;
    allowedEndpoints?: string[];
  };
  enforcement: 'STRICT' | 'PERMISSIVE' | 'MONITOR';
  monitoring: {
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    auditLog: boolean;
    realTimeAlerts: boolean;
  };
  violations: AIViolation[];
}

export interface AIViolation {
  id: string;
  boundaryId: string;
  timestamp: Date;
  type: 'DATA_ACCESS' | 'MODEL_EXECUTION' | 'API_CALL' | 'OPERATION_BLOCKED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, any>;
  resolved: boolean;
}

export interface RuntimeEnforcement {
  id: string;
  name: string;
  type: 'data-sanitization' | 'access-control' | 'encryption' | 'audit' | 'rate-limit';
  config: Record<string, any>;
  enabled: boolean;
  enforcement: 'BLOCK' | 'SANITIZE' | 'LOG' | 'ALERT';
  metrics: {
    executions: number;
    violations: number;
    blocked: number;
    lastExecution: Date;
  };
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  type: 'CONTROL_VALIDATION' | 'VIOLATION' | 'RISK_ACCEPTANCE' | 'COMPLIANCE_CHECK';
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  details: Record<string, any>;
  userId?: string;
  sessionId?: string;
  controlId?: string;
  gateId?: string;
}

export interface ComplianceReport {
  id: string;
  timestamp: Date;
  framework: string;
  overallScore: number;
  controls: {
    total: number;
    compliant: number;
    nonCompliant: number;
    exempted: number;
  };
  violations: SecurityAudit[];
  recommendations: string[];
  nextReview: Date;
}

export interface SecurityConfig {
  enforceControls: boolean;
  blockOnFailure: boolean;
  requireRiskAcceptance: boolean;
  enableRuntimeEnforcement: boolean;
  enableCIGates: boolean;
  enableAITrustBoundary: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  auditRetention: number;
  riskAcceptanceExpiration: number;
  controlCategories: string[];
}

export interface EnforcementResult {
  success: boolean;
  blocked: boolean;
  violations: SecurityAudit[];
  warnings: SecurityAudit[];
  exemptions: RiskAcceptance[];
  summary: string;
}

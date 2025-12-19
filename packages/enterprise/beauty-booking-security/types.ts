/**
 * Type definitions for Beauty Booking Security Pack
 */

export type DomainType = 'public' | 'studio' | 'ops';
export type UserRole = 'customer' | 'stylist' | 'manager' | 'admin';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceFramework = 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved';

export interface SecurityConfig {
  separation: SeparationConfig;
  rbac: RBACConfig;
  security: SecurityHeadersConfig;
  rateLimiting: RateLimitingConfig;
  audit: AuditConfig;
  incident: IncidentConfig;
  compliance: ComplianceConfig;
}

export interface SeparationConfig {
  enableDomainSeparation: boolean;
  domains: {
    public: string;
    studio: string;
    ops: string;
  };
  enableCrossDomainIsolation: boolean;
  enableNetworkSegmentation: boolean;
}

export interface RBACConfig {
  enableRBAC: boolean;
  enableABAC: boolean;
  roles: Record<UserRole, string[]>;
  attributes: string[];
  enableDynamicPermissions: boolean;
}

export interface SecurityHeadersConfig {
  enableCSRFProtection: boolean;
  enableSecurityHeaders: boolean;
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
}

export interface RateLimitingConfig {
  enabled: boolean;
  rules: Record<UserRole, { requests: number; window: number }>;
  enableBruteForceProtection: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number;
}

export interface AuditConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logPIIAccess: boolean;
  logDataChanges: boolean;
  logAuthentication: boolean;
  retentionDays: number;
  enableRealTimeAlerts: boolean;
}

export interface IncidentConfig {
  enableIncidentResponse: boolean;
  severityLevels: SeverityLevel[];
  autoEscalation: boolean;
  notificationChannels: string[];
  responsePlaybooks: boolean;
}

export interface ComplianceConfig {
  enableSOC2: boolean;
  enableGDPR: boolean;
  enableCCPA: boolean;
  enableHIPAA: boolean;
  evidenceCollection: boolean;
  auditTrail: boolean;
  dataRetention: boolean;
}

export interface DomainContext {
  domain: DomainType;
  hostname: string;
  isolationLevel: 'strict' | 'moderate' | 'permissive';
  allowedOrigins: string[];
  securityHeaders: Record<string, string>;
  cspPolicy: string;
}

export interface UserPermission {
  userId: string;
  role: UserRole;
  permissions: string[];
  attributes: Record<string, any>;
  domain: DomainType;
  restrictions: {
    locations?: string[];
    timeRanges?: Array<{ start: string; end: string }>;
    ipWhitelist?: string[];
  };
}

export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'pii_access' | 'security_violation';
  severity: SeverityLevel;
  userId?: string;
  domain: DomainType;
  action: string;
  resource?: string;
  piiData?: boolean;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
  retryAfter?: number;
}

export interface Incident {
  id: string;
  type: 'data_breach' | 'security_incident' | 'service_outage' | 'compliance_violation';
  severity: SeverityLevel;
  status: IncidentStatus;
  title: string;
  description: string;
  affectedDomains: DomainType[];
  affectedUsers: number;
  detectedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  actions: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    description: string;
  }>;
  evidence: string[];
  lessons: string[];
}

export interface ComplianceEvidence {
  id: string;
  framework: ComplianceFramework;
  control: string;
  evidenceType: 'policy' | 'procedure' | 'audit_log' | 'screenshot' | 'report';
  description: string;
  filePath?: string;
  collectedAt: Date;
  validUntil: Date;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SecurityMetrics {
  authentication: {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    bruteForceAttempts: number;
  };
  authorization: {
    totalChecks: number;
    allowedAccess: number;
    deniedAccess: number;
    privilegeEscalation: number;
  };
  dataAccess: {
    totalQueries: number;
    piiAccess: number;
    crossDomainAccess: number;
    blockedQueries: number;
  };
  incidents: {
    totalIncidents: number;
    openIncidents: number;
    resolvedIncidents: number;
    meanTimeToResolve: number;
  };
}

export interface ThreatModel {
  id: string;
  name: string;
  description: string;
  assets: Array<{
    name: string;
    type: 'data' | 'system' | 'process';
    sensitivity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  threats: Array<{
    id: string;
    type: 'spoofing' | 'tampering' | 'repudiation' | 'information_disclosure' | 'denial_of_service' | 'elevation_of_privilege';
    description: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high' | 'critical';
    mitigations: string[];
  }>;
  dataFlows: Array<{
    from: string;
    to: string;
    data: string;
    protocol: string;
    protections: string[];
  }>;
  lastUpdated: Date;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  category: 'access_control' | 'data_protection' | 'incident_response' | 'compliance' | 'operational';
  description: string;
  requirements: string[];
  procedures: string[];
  responsibilities: Array<{
    role: string;
    responsibilities: string[];
  }>;
  reviewFrequency: 'monthly' | 'quarterly' | 'annually';
  lastReviewed: Date;
  nextReview: Date;
  approvedBy: string;
  version: string;
}

export interface Runbook {
  id: string;
  name: string;
  category: 'incident_response' | 'disaster_recovery' | 'security_operations' | 'compliance';
  severity: SeverityLevel;
  description: string;
  prerequisites: string[];
  steps: Array<{
    step: number;
    action: string;
    expected: string;
    duration?: number;
    owner?: string;
  }>;
  rollback: Array<{
    step: number;
    action: string;
    expected: string;
  }>;
  contacts: Array<{
    role: string;
    name: string;
    contact: string;
  }>;
  lastUpdated: Date;
  version: string;
}

export interface ComplianceReport {
  id: string;
  framework: ComplianceFramework;
  period: {
    start: Date;
    end: Date;
  };
  status: 'compliant' | 'non_compliant' | 'partial_compliant';
  overallScore: number;
  controls: Array<{
    control: string;
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    evidence: string[];
    findings: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: string[];
  generatedAt: Date;
  approvedBy: string;
}

export interface SecurityAssessment {
  id: string;
  type: 'vulnerability' | 'penetration' | 'compliance' | 'risk';
  scope: string;
  performedBy: string;
  performedAt: Date;
  findings: Array<{
    severity: SeverityLevel;
    category: string;
    description: string;
    recommendation: string;
    cve?: string;
    cvssScore?: number;
  }>;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  remediationPlan: Array<{
    action: string;
    priority: number;
    owner: string;
    dueDate: Date;
  }>;
  nextAssessment: Date;
}

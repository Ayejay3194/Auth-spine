/**
 * Type definitions for SaaS/PaaS Security Suite
 */

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired';
export type SubscriptionTier = 'basic' | 'professional' | 'enterprise' | 'custom';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type ComplianceFramework = 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom';
export type SecurityLevel = 'standard' | 'enhanced' | 'maximum';

export interface SecurityConfig {
  multiTenant: TenantConfig;
  subscription: SubscriptionConfig;
  accessControls: AccessControlConfig;
  dataProtection: DataProtectionConfig;
  compliance: ComplianceConfig;
  monitoring: MonitoringConfig;
}

export interface TenantConfig {
  enableTenantIsolation: boolean;
  enableTenantSpecificSSL: boolean;
  enableTenantSpecificDomains: boolean;
  enableTenantSpecificStorage: boolean;
  enableTenantSpecificDatabases: boolean;
  enableTenantLevelMonitoring: boolean;
  enableTenantLevelCompliance: boolean;
}

export interface SubscriptionConfig {
  enableSubscriptionBasedAccess: boolean;
  enableFeatureLevelControls: boolean;
  enableUsageBasedLimiting: boolean;
  enableSubscriptionSecurity: boolean;
  enableBillingSecurity: boolean;
  enableLicenseManagement: boolean;
}

export interface AccessControlConfig {
  enableRBAC: boolean;
  enableABAC: boolean;
  enableTenantLevelRoles: boolean;
  enableCrossTenantAccessControl: boolean;
  enablePrivilegedAccessManagement: boolean;
  enableJustInTimeAccess: boolean;
}

export interface DataProtectionConfig {
  enableEncryptionAtRest: boolean;
  enableEncryptionInTransit: boolean;
  enableTenantSpecificEncryption: boolean;
  enableDataClassification: boolean;
  enableDataLossPrevention: boolean;
  enableDataRetentionPolicies: boolean;
}

export interface ComplianceConfig {
  enableSOC2: boolean;
  enableISO27001: boolean;
  enableGDPR: boolean;
  enableHIPAA: boolean;
  enablePCI: boolean;
  enableCustomFrameworks: boolean;
}

export interface MonitoringConfig {
  enableRealTimeMonitoring: boolean;
  enableTenantLevelMetrics: boolean;
  enableSecurityEventCorrelation: boolean;
  enableAutomatedThreatDetection: boolean;
  enableComplianceMonitoring: boolean;
  enablePerformanceMonitoring: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status: TenantStatus;
  subscriptionTier: SubscriptionTier;
  securityLevel: SecurityLevel;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  settings: {
    enableMFA: boolean;
    enableSSO: boolean;
    enableCustomBranding: boolean;
    enableAPIAccess: boolean;
    dataResidency: string;
    complianceRequirements: ComplianceFramework[];
  };
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
    bandwidth: number;
    features: string[];
  };
  usage: {
    users: number;
    storage: number;
    apiCalls: number;
    bandwidth: number;
    lastUpdated: Date;
  };
  isolation: {
    databaseSchema: string;
    storageBucket: string;
    encryptionKey: string;
    networkSegment: string;
  };
}

export interface Subscription {
  id: string;
  tenantId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'suspended' | 'expired';
  billingCycle: 'monthly' | 'annual';
  price: number;
  currency: string;
  features: string[];
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
    bandwidth: number;
    customDomains: number;
    ssoUsers: number;
  };
  usage: {
    currentUsers: number;
    currentStorage: number;
    currentApiCalls: number;
    currentBandwidth: number;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
  };
  security: {
    enableMFA: boolean;
    enableSSO: boolean;
    enableAuditLogs: boolean;
    enableEncryption: boolean;
    enableBackup: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  renewsAt: Date;
  cancelledAt?: Date;
}

export interface SecurityControl {
  id: string;
  name: string;
  description: string;
  category: 'access' | 'data' | 'network' | 'application' | 'infrastructure' | 'compliance';
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  framework: ComplianceFramework[];
  implementation: {
    status: 'not_implemented' | 'planned' | 'in_progress' | 'implemented' | 'tested' | 'validated';
    owner: string;
    dueDate?: Date;
    completedAt?: Date;
    evidence: string[];
    testResults?: TestResult[];
  };
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string[];
  };
  automation: {
    automated: boolean;
    script?: string;
    schedule?: string;
    dependencies: string[];
  };
}

export interface TestResult {
  id: string;
  controlId: string;
  testType: 'unit' | 'integration' | 'security' | 'compliance' | 'performance';
  status: 'passed' | 'failed' | 'skipped' | 'error';
  executedAt: Date;
  executedBy: string;
  duration: number;
  details: {
    description: string;
    results: any;
    artifacts: string[];
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
  };
}

export interface SecurityMetrics {
  tenants: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
    expired: number;
  };
  subscriptions: {
    total: number;
    byTier: Record<SubscriptionTier, number>;
    revenue: number;
    churnRate: number;
  };
  access: {
    totalUsers: number;
    activeUsers: number;
    mfaEnabled: number;
    ssoEnabled: number;
    failedLogins: number;
    privilegedAccess: number;
  };
  data: {
    totalStorage: number;
    encryptedData: number;
    classifiedData: Record<DataClassification, number>;
    dataBreachIncidents: number;
    dlpViolations: number;
  };
  compliance: {
    controlsImplemented: number;
    controlsValidated: number;
    complianceScore: number;
    auditFindings: number;
    remediationTasks: number;
  };
  monitoring: {
    securityEvents: number;
    threatsDetected: number;
    incidentsResolved: number;
    meanTimeToDetect: number;
    meanTimeToRespond: number;
  };
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
    controlId: string;
    controlName: string;
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    evidence: string[];
    findings: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    testResults: TestResult[];
  }>;
  recommendations: string[];
  nextAssessment: Date;
  generatedAt: Date;
  approvedBy: string;
}

export interface SecurityIncident {
  id: string;
  tenantId?: string;
  type: 'data_breach' | 'security_violation' | 'service_outage' | 'compliance_breach' | 'threat_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  title: string;
  description: string;
  affectedAssets: string[];
  affectedUsers: number;
  detectedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  actions: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    description: string;
    artifacts: string[];
  }>;
  impact: {
    financial: number;
    operational: string;
    reputational: string;
    compliance: string[];
  };
  rootCause?: string;
  lessons: string[];
  prevention: string[];
}

export interface SecurityPolicy {
  id: string;
  name: string;
  category: 'access' | 'data' | 'network' | 'application' | 'incident' | 'compliance';
  description: string;
  scope: 'global' | 'tenant' | 'user' | 'system';
  rules: Array<{
    name: string;
    description: string;
    conditions: Record<string, any>;
    actions: string[];
    exceptions: string[];
  }>;
  enforcement: {
    automated: boolean;
    manual: boolean;
    monitoring: boolean;
    reporting: boolean;
  };
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  owner: string;
  approvers: string[];
}

export interface ThreatIntelligence {
  id: string;
  source: string;
  type: 'malware' | 'phishing' | 'vulnerability' | 'apt' | 'insider' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
  description: string;
  indicators: Array<{
    type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'other';
    value: string;
    description: string;
  }>;
  affectedSystems: string[];
  mitigation: string[];
  references: string[];
  publishedAt: Date;
  updatedAt: Date;
}

export interface SecurityAudit {
  id: string;
  type: 'internal' | 'external' | 'compliance' | 'vulnerability' | 'penetration';
  scope: string;
  framework?: ComplianceFramework;
  scheduledDate: Date;
  performedDate: Date;
  performedBy: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
    cve?: string;
    cvssScore?: number;
    riskScore: number;
  }>;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  remediationPlan: Array<{
    action: string;
    priority: number;
    owner: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  report: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  tenantId: string;
  resource: string;
  accessType: 'read' | 'write' | 'admin' | 'owner';
  reason: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  expiresAt?: Date;
  grantedAt?: Date;
  revokedAt?: Date;
  conditions: string[];
  approvals: Array<{
    approverId: string;
    approvedAt: Date;
    comments?: string;
  }>;
  audit: {
    created: Date;
    updated: Date;
    accessed: Date[];
  };
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataType: string;
  classification: DataClassification;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  autoDelete: boolean;
  legalHold: boolean;
  archival: boolean;
  exceptions: string[];
  owner: string;
  approvedBy: string;
  approvedAt: Date;
  reviewFrequency: number;
  reviewUnit: 'months' | 'years';
  lastReviewed: Date;
  nextReview: Date;
}

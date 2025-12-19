/**
 * Type definitions for Supabase Security Pack
 */

export interface SupabaseSecurityConfig {
  auth: AuthSecurityConfig;
  dataProtection: DataProtectionConfig;
  accessControl: AccessControlConfig;
  monitoring: SecurityMonitoringConfig;
  compliance: ComplianceConfig;
}

export interface AuthSecurityConfig {
  enabled: boolean;
  mfa: boolean;
  sso: boolean;
  sessionManagement: boolean;
  passwordPolicies: boolean;
}

export interface DataProtectionConfig {
  enabled: boolean;
  encryption: boolean;
  masking: boolean;
  backup: boolean;
  retention: boolean;
}

export interface AccessControlConfig {
  enabled: boolean;
  rls: boolean;
  rbac: boolean;
  apiKeys: boolean;
  permissions: boolean;
}

export interface SecurityMonitoringConfig {
  enabled: boolean;
  audit: boolean;
  alerts: boolean;
  logging: boolean;
  analytics: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  frameworks: boolean;
  reporting: boolean;
  evidence: boolean;
  assessments: boolean;
}

export interface SupabaseSecurityMetrics {
  auth: AuthSecurityMetrics;
  dataProtection: DataProtectionMetrics;
  accessControl: AccessControlMetrics;
  monitoring: SecurityMonitoringMetrics;
  compliance: ComplianceMetrics;
  overall: {
    securityScore: number;
    complianceRate: number;
    threatPrevention: number;
    incidentResponse: number;
  };
}

export interface AuthSecurityMetrics {
  activeUsers: number;
  mfaUsage: number;
  ssoLogins: number;
  sessionDuration: number;
  failedAttempts: number;
  passwordStrength: number;
}

export interface DataProtectionMetrics {
  encryptedRecords: number;
  maskedFields: number;
  backupFrequency: number;
  retentionCompliance: number;
  dataLossPrevented: number;
}

export interface AccessControlMetrics {
  rlsPolicies: number;
  rbacRoles: number;
  apiKeysActive: number;
  permissionChecks: number;
  unauthorizedAttempts: number;
}

export interface SecurityMonitoringMetrics {
  auditEvents: number;
  alertsTriggered: number;
  logEntries: number;
  anomaliesDetected: number;
  responseTime: number;
}

export interface ComplianceMetrics {
  frameworksActive: number;
  reportsGenerated: number;
  evidenceCollected: number;
  assessmentsCompleted: number;
  complianceScore: number;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  category: 'auth' | 'data' | 'access' | 'monitoring' | 'compliance';
  description: string;
  rules: SecurityRule[];
  enforcement: 'manual' | 'automated' | 'hybrid';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'deprecated';
  lastUpdated: Date;
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'alert' | 'log';
  priority: number;
  description: string;
  automated: boolean;
}

export interface SecurityIncident {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'malware' | 'phishing' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected: Date;
  resolved?: Date;
  affected: string[];
  response: IncidentResponse[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  impact: IncidentImpact;
}

export interface IncidentResponse {
  id: string;
  action: string;
  automated: boolean;
  timestamp: Date;
  performedBy: string;
  result: 'success' | 'failure' | 'partial';
}

export interface IncidentImpact {
  dataExposed: boolean;
  usersAffected: number;
  systemsAffected: string[];
  financialImpact: number;
  reputationImpact: 'low' | 'medium' | 'high';
}

export interface AuthSecurity {
  mfa: {
    enabled: boolean;
    methods: ('totp' | 'sms' | 'email' | 'push')[];
    enforcement: 'optional' | 'required' | 'conditional';
    backupCodes: boolean;
  };
  sso: {
    enabled: boolean;
    providers: SSOProvider[];
    mapping: AttributeMapping;
    provisioning: boolean;
  };
  sessions: {
    timeout: number;
    refreshEnabled: boolean;
    concurrentLimit: number;
    deviceTracking: boolean;
  };
  passwords: {
    minLength: number;
    complexity: PasswordComplexity;
    expiration: number;
    history: number;
    lockout: LockoutPolicy;
  };
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'ldap' | 'oauth2';
  config: SSOConfig;
  enabled: boolean;
}

export interface SSOConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  privateKey?: string;
  attributeMapping: AttributeMapping;
}

export interface AttributeMapping {
  email: string;
  name: string;
  groups: string;
  roles: string;
  custom: Record<string, string>;
}

export interface PasswordComplexity {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  minLength: number;
}

export interface LockoutPolicy {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number;
  resetAfter: number;
}

export interface DataProtection {
  encryption: {
    atRest: EncryptionConfig;
    inTransit: EncryptionConfig;
    fieldLevel: FieldEncryption[];
  };
  masking: {
    enabled: boolean;
    fields: MaskedField[];
    algorithms: MaskingAlgorithm[];
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention: number;
    encryption: boolean;
    locations: BackupLocation[];
  };
  retention: {
    enabled: boolean;
    policies: RetentionPolicy[];
    automated: boolean;
  };
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyRotation: number;
  keyManagement: 'kms' | 'managed' | 'custom';
}

export interface FieldEncryption {
  table: string;
  column: string;
  algorithm: string;
  keyId: string;
  enabled: boolean;
}

export interface MaskedField {
  table: string;
  column: string;
  algorithm: string;
  pattern: string;
  enabled: boolean;
}

export interface MaskingAlgorithm {
  name: string;
  type: 'hash' | 'token' | 'mask' | 'redact';
  reversible: boolean;
  description: string;
}

export interface BackupLocation {
  type: 's3' | 'gcs' | 'azure' | 'local';
  config: Record<string, any>;
  encrypted: boolean;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  table: string;
  conditions: RetentionCondition[];
  action: 'delete' | 'archive' | 'anonymize';
  retentionPeriod: number;
  enabled: boolean;
}

export interface RetentionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  value: any;
}

export interface AccessControl {
  rls: {
    enabled: boolean;
    policies: RLSPolicy[];
  };
  rbac: {
    enabled: boolean;
    roles: Role[];
    permissions: Permission[];
  };
  apiKeys: {
    enabled: boolean;
    keys: APIKey[];
    policies: APIKeyPolicy[];
  };
  permissions: {
    enabled: boolean;
    matrix: PermissionMatrix[];
    checks: PermissionCheck[];
  };
}

export interface RLSPolicy {
  id: string;
  table: string;
  name: string;
  definition: string;
  roles: string[];
  enabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inherits: string[];
  system: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: string;
  value: any;
}

export interface APIKey {
  id: string;
  name: string;
  keyHash: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsed?: Date;
  created: Date;
  active: boolean;
}

export interface APIKeyPolicy {
  id: string;
  name: string;
  rules: APIKeyRule[];
  enforcement: boolean;
}

export interface APIKeyRule {
  condition: string;
  action: 'allow' | 'deny' | 'rate_limit';
  parameters: Record<string, any>;
}

export interface PermissionMatrix {
  role: string;
  resource: string;
  permissions: string[];
  conditions: PermissionCondition[];
}

export interface PermissionCheck {
  id: string;
  user: string;
  resource: string;
  action: string;
  result: 'allow' | 'deny';
  timestamp: Date;
  reason: string;
}

export interface SecurityMonitoring {
  audit: {
    enabled: boolean;
    events: AuditEvent[];
    retention: number;
    export: boolean;
  };
  alerts: {
    enabled: boolean;
    rules: AlertRule[];
    channels: AlertChannel[];
    escalation: EscalationPolicy[];
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    retention: number;
    aggregation: LogAggregation[];
  };
  analytics: {
    enabled: boolean;
    dashboards: SecurityDashboard[];
    reports: SecurityReport[];
    insights: SecurityInsight[];
  };
}

export interface AuditEvent {
  id: string;
  type: string;
  user: string;
  resource: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  window: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
  enabled: boolean;
}

export interface EscalationRule {
  condition: string;
  action: string;
  delay: number;
  recipients: string[];
}

export interface LogAggregation {
  id: string;
  name: string;
  source: string;
  filters: LogFilter[];
  aggregation: string;
  enabled: boolean;
}

export interface LogFilter {
  field: string;
  operator: string;
  value: any;
}

export interface SecurityDashboard {
  id: string;
  name: string;
  type: 'overview' | 'threats' | 'compliance' | 'incidents';
  widgets: DashboardWidget[];
  refreshRate: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'alert';
  title: string;
  query: string;
  configuration: Record<string, any>;
}

export interface SecurityReport {
  id: string;
  name: string;
  type: 'compliance' | 'incident' | 'trend' | 'summary';
  schedule: string;
  recipients: string[];
  template: string;
}

export interface SecurityInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  generated: Date;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  type: 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'pci_dss';
  version: string;
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  evidence: ComplianceEvidence[];
  status: 'active' | 'inactive' | 'deprecated';
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  family: string;
  implemented: boolean;
  tested: boolean;
  effective: boolean;
  lastAssessed: Date;
  nextAssessment: Date;
  evidence: string[];
}

export interface ComplianceAssessment {
  id: string;
  controlId: string;
  type: 'self' | 'external' | 'automated';
  date: Date;
  result: 'pass' | 'fail' | 'partial';
  score: number;
  findings: ComplianceFinding[];
  assessor: string;
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration';
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  collected: Date;
  verified: boolean;
}

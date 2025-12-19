/**
 * Type definitions for Comprehensive Platform Security Package
 */

export interface ComprehensiveSecurityConfig {
  authentication: AuthenticationConfig;
  application: ApplicationSecurityConfig;
  dataProtection: DataProtectionConfig;
  network: NetworkSecurityConfig;
  infrastructure: InfrastructureSecurityConfig;
  secrets: SecretsManagementConfig;
  cicd: CICDSecurityConfig;
  monitoring: MonitoringConfig;
  compliance: ComplianceConfig;
}

export interface AuthenticationConfig {
  enabled: boolean;
  mfa: boolean;
  sso: boolean;
  rbac: boolean;
  passwordPolicy: boolean;
  sessionManagement: boolean;
}

export interface ApplicationSecurityConfig {
  enabled: boolean;
  inputValidation: boolean;
  outputEncoding: boolean;
  csrfProtection: boolean;
  rateLimiting: boolean;
  securityHeaders: boolean;
}

export interface DataProtectionConfig {
  enabled: boolean;
  encryption: boolean;
  dataMasking: boolean;
  keyManagement: boolean;
  dataClassification: boolean;
  privacyControls: boolean;
}

export interface NetworkSecurityConfig {
  enabled: boolean;
  firewall: boolean;
  ddosProtection: boolean;
  loadBalancing: boolean;
  networkSegmentation: boolean;
  vpnAccess: boolean;
}

export interface InfrastructureSecurityConfig {
  enabled: boolean;
  hardening: boolean;
  patchManagement: boolean;
  monitoring: boolean;
  logging: boolean;
  backup: boolean;
}

export interface SecretsManagementConfig {
  enabled: boolean;
  vault: boolean;
  rotation: boolean;
  audit: boolean;
  accessControl: boolean;
  encryption: boolean;
}

export interface CICDSecurityConfig {
  enabled: boolean;
  codeScanning: boolean;
  dependencyScanning: boolean;
  pipelineSecurity: boolean;
  artifactSigning: boolean;
  environmentProtection: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  securityMonitoring: boolean;
  threatDetection: boolean;
  incidentResponse: boolean;
  forensics: boolean;
  reporting: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  frameworks: string[];
  controls: boolean;
  audits: boolean;
  reporting: boolean;
  documentation: boolean;
}

export interface SecurityMetrics {
  authentication: AuthMetrics;
  application: AppSecurityMetrics;
  data: DataSecurityMetrics;
  network: NetworkSecurityMetrics;
  infrastructure: InfraSecurityMetrics;
  overall: {
    securityScore: number;
    threatsBlocked: number;
    vulnerabilities: number;
    complianceScore: number;
  };
}

export interface AuthMetrics {
  loginAttempts: number;
  failedLogins: number;
  mfaUsage: number;
  ssoUsage: number;
  activeSessions: number;
}

export interface AppSecurityMetrics {
  requestsBlocked: number;
  vulnerabilitiesFound: number;
  securityIncidents: number;
  codeScansCompleted: number;
}

export interface DataSecurityMetrics {
  dataEncrypted: number;
  dataMasked: number;
  keyRotations: number;
  dataBreaches: number;
}

export interface NetworkSecurityMetrics {
  attacksBlocked: number;
  ddosAttempts: number;
  firewallRules: number;
  networkSegments: number;
}

export interface InfraSecurityMetrics {
  patchesApplied: number;
  securityUpdates: number;
  backupSuccess: number;
  systemHardening: number;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  rules: SecurityRule[];
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert';
  parameters: Record<string, any>;
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  timestamp: Date;
  affected: string[];
  actions: IncidentAction[];
}

export interface IncidentAction {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  performedBy: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  implemented: boolean;
  evidence: string[];
}

export interface SecurityAssessment {
  id: string;
  type: string;
  date: Date;
  score: number;
  findings: SecurityFinding[];
  recommendations: SecurityRecommendation[];
}

export interface SecurityFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  evidence: string;
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: string;
  timeline: string;
}

export interface ThreatIntelligence {
  threats: Threat[];
  indicators: Indicator[];
  actors: ThreatActor[];
}

export interface Threat {
  id: string;
  name: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigations: string[];
}

export interface Indicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url';
  value: string;
  confidence: number;
  source: string;
}

export interface ThreatActor {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  motivations: string[];
  targets: string[];
}

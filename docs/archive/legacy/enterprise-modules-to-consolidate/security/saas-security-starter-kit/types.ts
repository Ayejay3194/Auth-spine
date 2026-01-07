/**
 * Type definitions for SaaS Security Starter Kit
 */

export interface SaasSecurityConfig {
  authentication: AuthenticationConfig;
  dataProtection: DataProtectionConfig;
  security: SecurityConfig;
  compliance: ComplianceConfig;
}

export interface AuthenticationConfig {
  enabled: boolean;
  basicAuth: boolean;
  sessionManagement: boolean;
  passwordPolicy: boolean;
  basicRBAC: boolean;
}

export interface DataProtectionConfig {
  enabled: boolean;
  encryption: boolean;
  accessControl: boolean;
  auditLogging: boolean;
  dataRetention: boolean;
}

export interface SecurityConfig {
  enabled: boolean;
  inputValidation: boolean;
  outputEncoding: boolean;
  csrfProtection: boolean;
  rateLimiting: boolean;
  securityHeaders: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  basicControls: boolean;
  auditReadiness: boolean;
  documentation: boolean;
  reporting: boolean;
}

export interface SecurityMetrics {
  authentication: AuthMetrics;
  dataProtection: DataMetrics;
  security: SecurityControlMetrics;
  compliance: ComplianceMetrics;
  overall: {
    securityScore: number;
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    controlsImplemented: number;
  };
}

export interface AuthMetrics {
  loginAttempts: number;
  failedLogins: number;
  activeSessions: number;
  passwordChanges: number;
  accountLockouts: number;
}

export interface DataMetrics {
  dataEncrypted: number;
  accessRequests: number;
  auditLogs: number;
  dataRetentionDays: number;
  accessDenied: number;
}

export interface SecurityControlMetrics {
  requestsValidated: number;
  csrfAttempts: number;
  rateLimitHits: number;
  securityHeadersSet: number;
  vulnerabilitiesFound: number;
}

export interface ComplianceMetrics {
  controlsImplemented: number;
  auditFindings: number;
  documentationComplete: number;
  reportsGenerated: number;
  complianceScore: number;
}

export interface SecurityControl {
  id: string;
  name: string;
  category: 'authentication' | 'data' | 'security' | 'compliance';
  description: string;
  implemented: boolean;
  tested: boolean;
  effective: boolean;
  lastUpdated: Date;
  nextReview: Date;
  owner: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  approved: boolean;
  approvedBy: string;
  approvedDate: Date;
  nextReview: Date;
  status: 'draft' | 'approved' | 'deprecated';
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected: Date;
  resolved?: Date;
  affected: string[];
  actions: IncidentAction[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface IncidentAction {
  id: string;
  type: string;
  description: string;
  performedBy: string;
  timestamp: Date;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  implemented: boolean;
  evidence: string[];
  lastReviewed: Date;
  owner: string;
}

export interface SecurityAssessment {
  id: string;
  name: string;
  date: Date;
  type: 'basic' | 'comprehensive';
  score: number;
  findings: SecurityFinding[];
  recommendations: SecurityRecommendation[];
  status: 'draft' | 'completed' | 'reviewed';
}

export interface SecurityFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  risk: string;
  remediation: string;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface SecurityRecommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  timeline: string;
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

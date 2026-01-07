/**
 * Type definitions for Security Defense Layer
 */

export interface SecurityDefenseConfig {
  authentication: AuthenticationDefenseConfig;
  network: NetworkDefenseConfig;
  compliance: ComplianceDefenseConfig;
  incident: IncidentDefenseConfig;
  operations: OperationsDefenseConfig;
}

export interface AuthenticationDefenseConfig {
  enabled: boolean;
  multiFactor: boolean;
  biometric: boolean;
  adaptiveAuth: boolean;
  zeroTrust: boolean;
}

export interface NetworkDefenseConfig {
  enabled: boolean;
  firewall: boolean;
  ddosProtection: boolean;
  intrusionDetection: boolean;
  networkSegmentation: boolean;
  vpnAccess: boolean;
}

export interface ComplianceDefenseConfig {
  enabled: boolean;
  automatedCompliance: boolean;
  continuousMonitoring: boolean;
  auditReadiness: boolean;
  evidenceManagement: boolean;
}

export interface IncidentDefenseConfig {
  enabled: boolean;
  automatedDetection: boolean;
  responseAutomation: boolean;
  forensics: boolean;
  threatIntelligence: boolean;
}

export interface OperationsDefenseConfig {
  enabled: boolean;
  securityMonitoring: boolean;
  vulnerabilityManagement: boolean;
  patchManagement: boolean;
  securityAnalytics: boolean;
}

export interface SecurityDefenseMetrics {
  authentication: AuthDefenseMetrics;
  network: NetworkDefenseMetrics;
  compliance: ComplianceDefenseMetrics;
  incident: IncidentDefenseMetrics;
  operations: OperationsDefenseMetrics;
  overall: {
    defenseScore: number;
    threatBlocks: number;
    incidentsResolved: number;
    complianceRate: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface AuthDefenseMetrics {
  authenticationAttempts: number;
  mfaUsage: number;
  biometricUsage: number;
  adaptiveAuthTriggers: number;
  zeroTrustVerifications: number;
  blockedAttempts: number;
}

export interface NetworkDefenseMetrics {
  firewallRules: number;
  ddosAttacksBlocked: number;
  intrusionsDetected: number;
  networkSegments: number;
  vpnConnections: number;
  trafficFiltered: number;
}

export interface ComplianceDefenseMetrics {
  automatedChecks: number;
  complianceScore: number;
  evidenceCollected: number;
  auditFindings: number;
  continuousMonitoringEvents: number;
  controlsImplemented: number;
}

export interface IncidentDefenseMetrics {
  incidentsDetected: number;
  automatedResponses: number;
  forensicsCompleted: number;
  threatIntelligenceFeeds: number;
  responseTime: number;
  incidentsResolved: number;
}

export interface OperationsDefenseMetrics {
  securityEvents: number;
  vulnerabilitiesManaged: number;
  patchesApplied: number;
  securityAlerts: number;
  analyticsReports: number;
  falsePositives: number;
}

export interface DefenseLayer {
  id: string;
  name: string;
  type: 'authentication' | 'network' | 'compliance' | 'incident' | 'operations';
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  effectiveness: number;
  lastUpdated: Date;
  configuration: any;
}

export interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  detected: Date;
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
  affectedLayers: string[];
  mitigationActions: string[];
  impact: string;
}

export interface DefenseAction {
  id: string;
  type: 'prevent' | 'detect' | 'respond' | 'recover';
  layer: string;
  action: string;
  description: string;
  automated: boolean;
  effectiveness: number;
  lastExecuted: Date;
  executionCount: number;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: SecurityRule[];
  enforcement: 'manual' | 'automated' | 'hybrid';
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  lastUpdated: Date;
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert' | 'block';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}

export interface IncidentResponse {
  id: string;
  incidentId: string;
  phase: 'detection' | 'analysis' | 'containment' | 'eradication' | 'recovery' | 'lessons';
  actions: ResponseAction[];
  timeline: ResponseTimeline[];
  status: 'active' | 'completed' | 'escalated';
  duration: number;
}

export interface ResponseAction {
  id: string;
  type: string;
  description: string;
  automated: boolean;
  executedBy: string;
  timestamp: Date;
  result: 'success' | 'failure' | 'partial';
}

export interface ResponseTimeline {
  phase: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  actions: string[];
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

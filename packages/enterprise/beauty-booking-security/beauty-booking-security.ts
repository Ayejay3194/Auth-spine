/**
 * Main Beauty Booking Security Class
 * 
 * A comprehensive security kit for beauty booking platforms with
 * domain separation, RBAC/ABAC, and compliance features.
 */

import { 
  SecurityConfig,
  SecurityMetrics,
  SecurityEvent,
  Incident,
  ComplianceReport
} from './types.js';
import { separationControls } from './separation-controls.js';
import { rbacAbac } from './rbac-abac.js';
import { securityHeaders } from './security-headers.js';
import { rateLimiting } from './rate-limiting.js';
import { auditLogging } from './audit-logging.js';
import { incidentResponse } from './incident-response.js';
import { ciSecurityGates } from './ci-security-gates.js';
import { threatModeling } from './threat-modeling.js';
import { complianceEvidence } from './compliance-evidence.js';

export class BeautyBookingSecurity {
  private config: SecurityConfig;
  private initialized = false;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      separation: {
        enableDomainSeparation: true,
        domains: {
          public: 'app.beautybooking.com',
          studio: 'studio.beautybooking.com',
          ops: 'ops.beautybooking.com'
        },
        enableCrossDomainIsolation: true,
        enableNetworkSegmentation: true
      },
      rbac: {
        enableRBAC: true,
        enableABAC: true,
        roles: {
          customer: ['bookings:read', 'bookings:write', 'profile:read', 'profile:write'],
          stylist: ['bookings:read', 'bookings:write', 'schedule:read', 'schedule:write', 'customers:read'],
          manager: ['bookings:*', 'schedule:*', 'customers:*', 'staff:*', 'reports:read'],
          admin: ['*']
        },
        attributes: ['location', 'department', 'seniority', 'certification'],
        enableDynamicPermissions: true
      },
      security: {
        enableCSRFProtection: true,
        enableSecurityHeaders: true,
        enableCSP: true,
        enableHSTS: true,
        enableXFrameOptions: true,
        enableXContentTypeOptions: true
      },
      rateLimiting: {
        enabled: true,
        rules: {
          customer: { requests: 100, window: 60000 },
          stylist: { requests: 500, window: 60000 },
          manager: { requests: 1000, window: 60000 },
          admin: { requests: 2000, window: 60000 }
        },
        enableBruteForceProtection: true,
        maxFailedAttempts: 5,
        lockoutDuration: 900000
      },
      audit: {
        enabled: true,
        logLevel: 'info',
        logPIIAccess: true,
        logDataChanges: true,
        logAuthentication: true,
        retentionDays: 2555,
        enableRealTimeAlerts: true
      },
      incident: {
        enableIncidentResponse: true,
        severityLevels: ['low', 'medium', 'high', 'critical'],
        autoEscalation: true,
        notificationChannels: ['email', 'slack', 'sms'],
        responsePlaybooks: true
      },
      compliance: {
        enableSOC2: true,
        enableGDPR: true,
        enableCCPA: true,
        enableHIPAA: false,
        evidenceCollection: true,
        auditTrail: true,
        dataRetention: true
      },
      ...config
    };
  }

  /**
   * Initialize the beauty booking security system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await separationControls.initialize(this.config.separation);
      await rbacAbac.initialize(this.config.rbac);
      await securityHeaders.initialize(this.config.security);
      await rateLimiting.initialize(this.config.rateLimiting);
      await auditLogging.initialize(this.config.audit);
      await incidentResponse.initialize(this.config.incident);
      await ciSecurityGates.initialize();
      await threatModeling.initialize();
      await complianceEvidence.initialize(this.config.compliance);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Beauty Booking Security:', error);
      throw error;
    }
  }

  /**
   * Get domain context for hostname
   */
  async getDomainContext(hostname: string): Promise<{
    domain: 'public' | 'studio' | 'ops';
    context: any;
    securityHeaders: Record<string, string>;
  }> {
    return await separationControls.getDomainContext(hostname);
  }

  /**
   * Check user permissions with RBAC/ABAC
   */
  async checkPermissions(userId: string, resource: string, action: string, context?: any): Promise<{
    allowed: boolean;
    reason?: string;
    permissions: string[];
  }> {
    return await rbacAbac.checkPermissions(userId, resource, action, context);
  }

  /**
   * Enforce rate limiting
   */
  async enforceRateLimit(identifier: string, domain: 'public' | 'studio' | 'ops'): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    return await rateLimiting.checkLimit(identifier, domain);
  }

  /**
   * Get security headers for domain
   */
  getSecurityHeaders(domain: 'public' | 'studio' | 'ops'): Record<string, string> {
    return securityHeaders.getHeaders(domain);
  }

  /**
   * Log security event
   */
  async logEvent(event: {
    type: 'authentication' | 'authorization' | 'data_access' | 'pii_access' | 'security_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    domain: 'public' | 'studio' | 'ops';
    action: string;
    resource?: string;
    piiData?: boolean;
    ipAddress: string;
    userAgent: string;
    details?: Record<string, any>;
  }): Promise<void> {
    return await auditLogging.logEvent(event);
  }

  /**
   * Create security incident
   */
  async createIncident(incident: {
    type: 'data_breach' | 'security_incident' | 'service_outage' | 'compliance_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    affectedDomains: ('public' | 'studio' | 'ops')[];
    affectedUsers?: number;
  }): Promise<Incident> {
    return await incidentResponse.createIncident(incident);
  }

  /**
   * Get active incidents
   */
  async getActiveIncidents(): Promise<Incident[]> {
    return await incidentResponse.getActiveIncidents();
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(framework: 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA', period: {
    start: Date;
    end: Date;
  }): Promise<ComplianceReport> {
    return await complianceEvidence.generateReport(framework, period);
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const authMetrics = await auditLogging.getAuthenticationMetrics();
    const rbacMetrics = await rbacAbac.getMetrics();
    const auditMetrics = await auditLogging.getDataAccessMetrics();
    const incidentMetrics = await incidentResponse.getMetrics();

    return {
      authentication: authMetrics,
      authorization: rbacMetrics,
      dataAccess: auditMetrics,
      incidents: incidentMetrics
    };
  }

  /**
   * Run security assessment
   */
  async runSecurityAssessment(type: 'vulnerability' | 'penetration' | 'compliance' | 'risk'): Promise<{
    id: string;
    type: string;
    findings: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      description: string;
      recommendation: string;
    }>;
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
  }> {
    return await ciSecurityGates.runAssessment(type);
  }

  /**
   * Get threat model
   */
  async getThreatModel(): Promise<{
    assets: Array<{
      name: string;
      type: string;
      sensitivity: string;
    }>;
    threats: Array<{
      type: string;
      description: string;
      likelihood: string;
      impact: string;
      mitigations: string[];
    }>;
    dataFlows: Array<{
      from: string;
      to: string;
      data: string;
      protections: string[];
    }>;
  }> {
    return await threatModeling.getThreatModel();
  }

  /**
   * Validate domain separation
   */
  async validateDomainSeparation(): Promise<{
    valid: boolean;
    violations: Array<{
      domain: string;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  }> {
    return await separationControls.validateSeparation();
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Health check
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      separationControls: boolean;
      rbacAbac: boolean;
      securityHeaders: boolean;
      rateLimiting: boolean;
      auditLogging: boolean;
      incidentResponse: boolean;
      ciSecurityGates: boolean;
      threatModeling: boolean;
      complianceEvidence: boolean;
    };
    overall: boolean;
    securityScore: number;
  }> {
    const components = {
      separationControls: await separationControls.getHealthStatus(),
      rbacAbac: await rbacAbac.getHealthStatus(),
      securityHeaders: await securityHeaders.getHealthStatus(),
      rateLimiting: await rateLimiting.getHealthStatus(),
      auditLogging: await auditLogging.getHealthStatus(),
      incidentResponse: await incidentResponse.getHealthStatus(),
      ciSecurityGates: await ciSecurityGates.getHealthStatus(),
      threatModeling: await threatModeling.getHealthStatus(),
      complianceEvidence: await complianceEvidence.getHealthStatus()
    };

    const overall = this.initialized && Object.values(components).every(status => status);
    const securityScore = this.calculateSecurityScore();

    return {
      initialized: this.initialized,
      components,
      overall,
      securityScore
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }

  private calculateSecurityScore(): number {
    let score = 100;

    // Deduct points for missing security features
    if (!this.config.separation.enableDomainSeparation) score -= 15;
    if (!this.config.rbac.enableRBAC) score -= 20;
    if (!this.config.security.enableCSRFProtection) score -= 10;
    if (!this.config.rateLimiting.enabled) score -= 15;
    if (!this.config.audit.enabled) score -= 15;
    if (!this.config.incident.enableIncidentResponse) score -= 10;
    if (!this.config.compliance.enableSOC2) score -= 10;

    return Math.max(0, score);
  }
}

// Export default instance
export const beautyBookingSecurity = new BeautyBookingSecurity();

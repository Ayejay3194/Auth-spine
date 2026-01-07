/**
 * Main Supabase Security Pack Class
 * 
 * Comprehensive security framework for Supabase including authentication,
 * authorization, data protection, monitoring, and compliance.
 */

import { SupabaseSecurityConfig, SupabaseSecurityMetrics, SecurityPolicy, SecurityIncident, ComplianceFramework } from './types.js';
import { authSecurity } from './auth-security.js';
import { dataProtection } from './data-protection.js';
import { accessControl } from './access-control.js';
import { securityMonitoring } from './security-monitoring.js';
import { complianceFramework } from './compliance-framework.js';

export class SupabaseSecurityPack {
  private config: SupabaseSecurityConfig;
  private initialized = false;

  constructor(config: Partial<SupabaseSecurityConfig> = {}) {
    this.config = {
      auth: {
        enabled: true,
        mfa: true,
        sso: true,
        sessionManagement: true,
        passwordPolicies: true,
        ...config.auth
      },
      dataProtection: {
        enabled: true,
        encryption: true,
        masking: true,
        backup: true,
        retention: true,
        ...config.dataProtection
      },
      accessControl: {
        enabled: true,
        rls: true,
        rbac: true,
        apiKeys: true,
        permissions: true,
        ...config.accessControl
      },
      monitoring: {
        enabled: true,
        audit: true,
        alerts: true,
        logging: true,
        analytics: true,
        ...config.monitoring
      },
      compliance: {
        enabled: true,
        frameworks: true,
        reporting: true,
        evidence: true,
        assessments: true,
        ...config.compliance
      }
    };
  }

  /**
   * Initialize the Supabase security pack
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all security components
      await authSecurity.initialize(this.config.auth);
      await dataProtection.initialize(this.config.dataProtection);
      await accessControl.initialize(this.config.accessControl);
      await securityMonitoring.initialize(this.config.monitoring);
      await complianceFramework.initialize(this.config.compliance);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase security pack:', error);
      throw error;
    }
  }

  /**
   * Setup authentication security
   */
  async setupAuthSecurity(): Promise<void> {
    if (!this.config.auth.enabled) {
      throw new Error('Authentication security not enabled');
    }

    try {
      await authSecurity.setupMFA();
      await authSecurity.setupSSO();
      await authSecurity.setupSessionManagement();
      await authSecurity.setupPasswordPolicies();
    } catch (error) {
      console.error('Failed to setup authentication security:', error);
      throw error;
    }
  }

  /**
   * Setup data protection
   */
  async setupDataProtection(): Promise<void> {
    if (!this.config.dataProtection.enabled) {
      throw new Error('Data protection not enabled');
    }

    try {
      await dataProtection.setupEncryption();
      await dataProtection.setupMasking();
      await dataProtection.setupBackup();
      await dataProtection.setupRetention();
    } catch (error) {
      console.error('Failed to setup data protection:', error);
      throw error;
    }
  }

  /**
   * Setup access control
   */
  async setupAccessControl(): Promise<void> {
    if (!this.config.accessControl.enabled) {
      throw new Error('Access control not enabled');
    }

    try {
      await accessControl.setupRLS();
      await accessControl.setupRBAC();
      await accessControl.setupAPIKeys();
      await accessControl.setupPermissions();
    } catch (error) {
      console.error('Failed to setup access control:', error);
      throw error;
    }
  }

  /**
   * Setup security monitoring
   */
  async setupSecurityMonitoring(): Promise<void> {
    if (!this.config.monitoring.enabled) {
      throw new Error('Security monitoring not enabled');
    }

    try {
      await securityMonitoring.setupAudit();
      await securityMonitoring.setupAlerts();
      await securityMonitoring.setupLogging();
      await securityMonitoring.setupAnalytics();
    } catch (error) {
      console.error('Failed to setup security monitoring:', error);
      throw error;
    }
  }

  /**
   * Setup compliance framework
   */
  async setupComplianceFramework(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Compliance framework not enabled');
    }

    try {
      await complianceFramework.setupFrameworks();
      await complianceFramework.setupReporting();
      await complianceFramework.setupEvidence();
      await complianceFramework.setupAssessments();
    } catch (error) {
      console.error('Failed to setup compliance framework:', error);
      throw error;
    }
  }

  /**
   * Get security policies
   */
  async getSecurityPolicies(): Promise<SecurityPolicy[]> {
    try {
      const authPolicies = await authSecurity.getPolicies();
      const dataPolicies = await dataProtection.getPolicies();
      const accessPolicies = await accessControl.getPolicies();
      const monitoringPolicies = await securityMonitoring.getPolicies();
      const compliancePolicies = await complianceFramework.getPolicies();

      return [
        ...authPolicies,
        ...dataPolicies,
        ...accessPolicies,
        ...monitoringPolicies,
        ...compliancePolicies
      ];
    } catch (error) {
      console.error('Failed to get security policies:', error);
      throw error;
    }
  }

  /**
   * Get security incidents
   */
  async getSecurityIncidents(): Promise<SecurityIncident[]> {
    try {
      return await securityMonitoring.getIncidents();
    } catch (error) {
      console.error('Failed to get security incidents:', error);
      throw error;
    }
  }

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    try {
      return await complianceFramework.getFrameworks();
    } catch (error) {
      console.error('Failed to get compliance frameworks:', error);
      throw error;
    }
  }

  /**
   * Create security incident
   */
  async createSecurityIncident(incident: Omit<SecurityIncident, 'id' | 'detected'>): Promise<SecurityIncident> {
    try {
      return await securityMonitoring.createIncident({
        ...incident,
        detected: new Date()
      });
    } catch (error) {
      console.error('Failed to create security incident:', error);
      throw error;
    }
  }

  /**
   * Get security metrics
   */
  async getMetrics(): Promise<SupabaseSecurityMetrics> {
    try {
      const authMetrics = await authSecurity.getMetrics();
      const dataProtectionMetrics = await dataProtection.getMetrics();
      const accessControlMetrics = await accessControl.getMetrics();
      const monitoringMetrics = await securityMonitoring.getMetrics();
      const complianceMetrics = await complianceFramework.getMetrics();

      return {
        auth: authMetrics,
        dataProtection: dataProtectionMetrics,
        accessControl: accessControlMetrics,
        monitoring: monitoringMetrics,
        compliance: complianceMetrics,
        overall: {
          securityScore: Math.floor((authMetrics.passwordStrength + dataProtectionMetrics.encryptedRecords + accessControlMetrics.rlsPolicies) / 3),
          complianceRate: complianceMetrics.complianceScore,
          threatPrevention: Math.floor((accessControlMetrics.unauthorizedAttempts + monitoringMetrics.anomaliesDetected) / 2),
          incidentResponse: Math.floor((monitoringMetrics.responseTime + monitoringMetrics.alertsTriggered) / 2)
        }
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive security report
   */
  async generateReport(): Promise<{
    summary: any;
    auth: any;
    dataProtection: any;
    accessControl: any;
    monitoring: any;
    compliance: any;
    recommendations: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          securityScore: metrics.overall.securityScore,
          complianceRate: metrics.overall.complianceRate,
          threatPrevention: metrics.overall.threatPrevention,
          incidentResponse: metrics.overall.incidentResponse
        },
        auth: {
          activeUsers: metrics.auth.activeUsers,
          mfaUsage: metrics.auth.mfaUsage,
          ssoLogins: metrics.auth.ssoLogins,
          sessionDuration: metrics.auth.sessionDuration,
          failedAttempts: metrics.auth.failedAttempts
        },
        dataProtection: {
          encryptedRecords: metrics.dataProtection.encryptedRecords,
          maskedFields: metrics.dataProtection.maskedFields,
          backupFrequency: metrics.dataProtection.backupFrequency,
          retentionCompliance: metrics.dataProtection.retentionCompliance
        },
        accessControl: {
          rlsPolicies: metrics.accessControl.rlsPolicies,
          rbacRoles: metrics.accessControl.rbacRoles,
          apiKeysActive: metrics.accessControl.apiKeysActive,
          permissionChecks: metrics.accessControl.permissionChecks
        },
        monitoring: {
          auditEvents: metrics.monitoring.auditEvents,
          alertsTriggered: metrics.monitoring.alertsTriggered,
          logEntries: metrics.monitoring.logEntries,
          anomaliesDetected: metrics.monitoring.anomaliesDetected
        },
        compliance: {
          frameworksActive: metrics.compliance.frameworksActive,
          reportsGenerated: metrics.compliance.reportsGenerated,
          evidenceCollected: metrics.compliance.evidenceCollected,
          assessmentsCompleted: metrics.compliance.assessmentsCompleted
        },
        recommendations: [
          {
            priority: 'high',
            description: 'Enable MFA for all user accounts'
          },
          {
            priority: 'medium',
            description: 'Review and update RLS policies'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate comprehensive security report:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SupabaseSecurityConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SupabaseSecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    auth: boolean;
    dataProtection: boolean;
    accessControl: boolean;
    monitoring: boolean;
    compliance: boolean;
  }> {
    try {
      const auth = this.config.auth.enabled ? await authSecurity.getHealthStatus() : true;
      const dataProtection = this.config.dataProtection.enabled ? await dataProtection.getHealthStatus() : true;
      const accessControl = this.config.accessControl.enabled ? await accessControl.getHealthStatus() : true;
      const monitoring = this.config.monitoring.enabled ? await securityMonitoring.getHealthStatus() : true;
      const compliance = this.config.compliance.enabled ? await complianceFramework.getHealthStatus() : true;

      return {
        overall: this.initialized && auth && dataProtection && accessControl && monitoring && compliance,
        auth,
        dataProtection,
        accessControl,
        monitoring,
        compliance
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        auth: false,
        dataProtection: false,
        accessControl: false,
        monitoring: false,
        compliance: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await authSecurity.cleanup();
    await dataProtection.cleanup();
    await accessControl.cleanup();
    await securityMonitoring.cleanup();
    await complianceFramework.cleanup();
  }
}

// Export default instance
export const supabaseSecurityPack = new SupabaseSecurityPack();

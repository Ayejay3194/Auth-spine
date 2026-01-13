/**
 * Main Supabase Security & Architecture Class
 * 
 * Luxury Booking Platform – Hardened Setup with comprehensive
 * security controls for production Supabase deployments.
 */

import { 
  SecurityConfig,
  SecurityMetrics,
  SecurityReport,
  UserSecurityProfile,
  SecurityIncident
} from './types.js';
import { authentication } from './authentication.js';
import { rowLevelSecurity } from './row-level-security.js';
import { storageSecurity } from './storage-security.js';
import { auditLogging } from './audit-logging.js';
import { opsSeparation } from './ops-separation.js';
import { productionConfig } from './production-config.js';

export class SupabaseSecurity {
  private config: SecurityConfig;
  private initialized = false;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      authentication: {
        enableMFA: true,
        enableSSO: true,
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          preventReuse: 5
        },
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        lockoutDuration: 900,
        enablePasswordless: true
      },
      rowLevelSecurity: {
        enabled: true,
        enforceOnAllTables: true,
        bypassForServiceRole: true,
        enableTenantIsolation: true,
        enableRoleBasedAccess: true
      },
      storage: {
        enableVirusScanning: true,
        enableContentValidation: true,
        maxFileSize: 104857600,
        allowedTypes: ['image/*', 'application/pdf', 'text/*'],
        enableSignedURLs: true,
        urlExpiration: 3600,
        enableVersioning: true
      },
      audit: {
        enabled: true,
        logLevel: 'info',
        retentionDays: 2555,
        logFailedAuth: true,
        logDataAccess: true,
        logSchemaChanges: true,
        enableRealTime: true
      },
      ops: {
        enableOpsSeparation: true,
        opsDatabase: 'ops_db',
        publicDatabase: 'public_db',
        enableOpsAuth: true,
        opsRoles: ['ops_admin', 'ops_user'],
        enableOpsAudit: true
      },
      production: {
        enableSSL: true,
        enableBackup: true,
        backupRetention: 30,
        enableMonitoring: true,
        enableAlerts: true,
        enableRateLimiting: true,
        enableCORS: true,
        allowedOrigins: ['https://yourdomain.com']
      },
      ...config
    };
  }

  /**
   * Initialize the Supabase security system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await authentication.initialize(this.config.authentication);
      await rowLevelSecurity.initialize(this.config.rowLevelSecurity);
      await storageSecurity.initialize(this.config.storage);
      await auditLogging.initialize(this.config.audit);
      await opsSeparation.initialize(this.config.ops);
      await productionConfig.initialize(this.config.production);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase Security:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with security checks
   */
  async authenticate(credentials: {
    email: string;
    password: string;
    mfaCode?: string;
    tenantId?: string;
  }): Promise<{
    success: boolean;
    user?: any;
    session?: any;
    requiresMFA?: boolean;
    error?: string;
  }> {
    return await authentication.authenticate(credentials);
  }

  /**
   * Validate session and permissions
   */
  async validateSession(sessionToken: string, requiredPermissions?: string[]): Promise<{
    valid: boolean;
    user?: any;
    permissions: string[];
    error?: string;
  }> {
    return await authentication.validateSession(sessionToken, requiredPermissions);
  }

  /**
   * Enforce RLS on database operations
   */
  async enforceRLS(operation: {
    table: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    userId: string;
    tenantId?: string;
    data?: any;
  }): Promise<{
    allowed: boolean;
    reason?: string;
    modifiedQuery?: string;
  }> {
    return await rowLevelSecurity.enforce(operation);
  }

  /**
   * Secure file upload with validation
   */
  async secureUpload(file: {
    name: string;
    type: string;
    size: number;
    content: Buffer;
    userId: string;
    tenantId?: string;
  }): Promise<{
    success: boolean;
    url?: string;
    error?: string;
    virusDetected?: boolean;
  }> {
    return await storageSecurity.upload(file);
  }

  /**
   * Generate secure download URL
   */
  async generateSecureURL(path: string, options: {
    userId: string;
    tenantId?: string;
    expiresIn?: number;
  }): Promise<{
    url: string;
    expiresAt: Date;
  }> {
    return await storageSecurity.generateURL(path, options);
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: {
    type: 'auth' | 'data_access' | 'schema_change' | 'security_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    tenantId?: string;
    action: string;
    resource?: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    return await auditLogging.logEvent(event);
  }

  /**
   * Query security events
   */
  async queryEvents(query: {
    type?: string;
    severity?: string;
    userId?: string;
    tenantId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    return await auditLogging.queryEvents(query);
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const authMetrics = await authentication.getMetrics();
    const rlsMetrics = await rowLevelSecurity.getMetrics();
    const storageMetrics = await storageSecurity.getMetrics();
    const auditMetrics = await auditLogging.getMetrics();

    return {
      authentication: authMetrics,
      dataAccess: rlsMetrics,
      storage: storageMetrics,
      audit: auditMetrics
    };
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(type: 'security' | 'compliance' | 'audit' | 'performance', period: {
    start: Date;
    end: Date;
  }): Promise<SecurityReport> {
    const metrics = await this.getSecurityMetrics();
    const findings = await this.generateFindings(type, period);

    return {
      id: `report_${type}_${Date.now()}`,
      type,
      period,
      metrics,
      findings,
      generatedAt: new Date(),
      generatedBy: 'system'
    };
  }

  /**
   * Get user security profile
   */
  async getUserSecurityProfile(userId: string): Promise<UserSecurityProfile> {
    return await authentication.getUserProfile(userId);
  }

  /**
   * Create security incident
   */
  async createSecurityIncident(incident: {
    type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers?: number;
    affectedData?: string[];
  }): Promise<SecurityIncident> {
    return await auditLogging.createIncident(incident);
  }

  /**
   * Get active security incidents
   */
  async getActiveIncidents(): Promise<SecurityIncident[]> {
    return await auditLogging.getActiveIncidents();
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
      authentication: boolean;
      rowLevelSecurity: boolean;
      storageSecurity: boolean;
      auditLogging: boolean;
      opsSeparation: boolean;
      productionConfig: boolean;
    };
    overall: boolean;
    securityScore: number;
  }> {
    const components = {
      authentication: await authentication.getHealthStatus(),
      rowLevelSecurity: await rowLevelSecurity.getHealthStatus(),
      storageSecurity: await storageSecurity.getHealthStatus(),
      auditLogging: await auditLogging.getHealthStatus(),
      opsSeparation: await opsSeparation.getHealthStatus(),
      productionConfig: await productionConfig.getHealthStatus()
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

  private async generateFindings(type: string, period: { start: Date; end: Date }): Promise<Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }>> {
    const findings = [];
    const metrics = await this.getSecurityMetrics();

    // Authentication findings
    if (metrics.authentication.failedLogins > metrics.authentication.successfulLogins * 0.1) {
      findings.push({
        severity: 'high',
        category: 'Authentication',
        description: 'High rate of failed login attempts detected',
        recommendation: 'Implement additional rate limiting and monitoring'
      });
    }

    // Data access findings
    if (metrics.dataAccess.blockedQueries > metrics.dataAccess.totalQueries * 0.05) {
      findings.push({
        severity: 'medium',
        category: 'Data Access',
        description: 'Elevated rate of blocked database queries',
        recommendation: 'Review RLS policies and user permissions'
      });
    }

    // Storage findings
    if (metrics.storage.virusDetections > 0) {
      findings.push({
        severity: 'high',
        category: 'Storage',
        description: `${metrics.storage.virusDetections} virus detections in file uploads`,
        recommendation: 'Review file upload policies and enhance scanning'
      });
    }

    // Audit findings
    if (metrics.audit.securityEvents > 100) {
      findings.push({
        severity: 'medium',
        category: 'Audit',
        description: 'High number of security events detected',
        recommendation: 'Investigate security events and implement preventive measures'
      });
    }

    return findings;
  }

  private calculateSecurityScore(): number {
    let score = 100;

    // Deduct points for configuration issues
    if (!this.config.authentication.enableMFA) score -= 10;
    if (!this.config.rowLevelSecurity.enabled) score -= 20;
    if (!this.config.storage.enableVirusScanning) score -= 10;
    if (!this.config.audit.enabled) score -= 15;
    if (!this.config.ops.enableOpsSeparation) score -= 10;
    if (!this.config.production.enableSSL) score -= 15;

    return Math.max(0, score);
  }
}

// Export default instance
export const supabaseSecurity = new SupabaseSecurity();

/**
 * Main Security Defense Layer Class
 * 
 * Comprehensive security defense framework providing multi-layered
 * protection with authentication, network security, compliance,
 * incident response, and security operations.
 */

import { SecurityDefenseConfig, SecurityDefenseMetrics, DefenseLayer, SecurityThreat } from './types.js';
import { authenticationDefense } from './authentication-defense.js';
import { networkDefense } from './network-defense.js';
import { complianceDefense } from './compliance-defense.js';
import { incidentResponse } from './incident-response.js';
import { securityOperations } from './security-operations.js';

export class SecurityDefenseLayer {
  private config: SecurityDefenseConfig;
  private initialized = false;

  constructor(config: Partial<SecurityDefenseConfig> = {}) {
    this.config = {
      authentication: {
        enabled: true,
        multiFactor: true,
        biometric: true,
        adaptiveAuth: true,
        zeroTrust: true,
        ...config.authentication
      },
      network: {
        enabled: true,
        firewall: true,
        ddosProtection: true,
        intrusionDetection: true,
        networkSegmentation: true,
        vpnAccess: true,
        ...config.network
      },
      compliance: {
        enabled: true,
        automatedCompliance: true,
        continuousMonitoring: true,
        auditReadiness: true,
        evidenceManagement: true,
        ...config.compliance
      },
      incident: {
        enabled: true,
        automatedDetection: true,
        responseAutomation: true,
        forensics: true,
        threatIntelligence: true,
        ...config.incident
      },
      operations: {
        enabled: true,
        securityMonitoring: true,
        vulnerabilityManagement: true,
        patchManagement: true,
        securityAnalytics: true,
        ...config.operations
      }
    };
  }

  /**
   * Initialize the security defense layer
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all defense components
      await authenticationDefense.initialize(this.config.authentication);
      await networkDefense.initialize(this.config.network);
      await complianceDefense.initialize(this.config.compliance);
      await incidentResponse.initialize(this.config.incident);
      await securityOperations.initialize(this.config.operations);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize security defense layer:', error);
      throw error;
    }
  }

  /**
   * Setup authentication defense
   */
  async setupAuthenticationDefense(): Promise<void> {
    if (!this.config.authentication.enabled) {
      throw new Error('Authentication defense not enabled');
    }

    try {
      await authenticationDefense.setupMultiFactor();
      await authenticationDefense.setupBiometric();
      await authenticationDefense.setupAdaptiveAuth();
      await authenticationDefense.setupZeroTrust();
    } catch (error) {
      console.error('Failed to setup authentication defense:', error);
      throw error;
    }
  }

  /**
   * Setup network defense
   */
  async setupNetworkDefense(): Promise<void> {
    if (!this.config.network.enabled) {
      throw new Error('Network defense not enabled');
    }

    try {
      await networkDefense.setupFirewall();
      await networkDefense.setupDDoSProtection();
      await networkDefense.setupIntrusionDetection();
      await networkDefense.setupNetworkSegmentation();
      await networkDefense.setupVPNAccess();
    } catch (error) {
      console.error('Failed to setup network defense:', error);
      throw error;
    }
  }

  /**
   * Setup compliance defense
   */
  async setupComplianceDefense(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Compliance defense not enabled');
    }

    try {
      await complianceDefense.setupAutomatedCompliance();
      await complianceDefense.setupContinuousMonitoring();
      await complianceDefense.setupAuditReadiness();
      await complianceDefense.setupEvidenceManagement();
    } catch (error) {
      console.error('Failed to setup compliance defense:', error);
      throw error;
    }
  }

  /**
   * Setup incident response
   */
  async setupIncidentResponse(): Promise<void> {
    if (!this.config.incident.enabled) {
      throw new Error('Incident response not enabled');
    }

    try {
      await incidentResponse.setupAutomatedDetection();
      await incidentResponse.setupResponseAutomation();
      await incidentResponse.setupForensics();
      await incidentResponse.setupThreatIntelligence();
    } catch (error) {
      console.error('Failed to setup incident response:', error);
      throw error;
    }
  }

  /**
   * Setup security operations
   */
  async setupSecurityOperations(): Promise<void> {
    if (!this.config.operations.enabled) {
      throw new Error('Security operations not enabled');
    }

    try {
      await securityOperations.setupSecurityMonitoring();
      await securityOperations.setupVulnerabilityManagement();
      await securityOperations.setupPatchManagement();
      await securityOperations.setupSecurityAnalytics();
    } catch (error) {
      console.error('Failed to setup security operations:', error);
      throw error;
    }
  }

  /**
   * Get defense layers status
   */
  async getDefenseLayers(): Promise<DefenseLayer[]> {
    try {
      const layers = [];

      if (this.config.authentication.enabled) {
        layers.push(await authenticationDefense.getLayerStatus());
      }

      if (this.config.network.enabled) {
        layers.push(await networkDefense.getLayerStatus());
      }

      if (this.config.compliance.enabled) {
        layers.push(await complianceDefense.getLayerStatus());
      }

      if (this.config.incident.enabled) {
        layers.push(await incidentResponse.getLayerStatus());
      }

      if (this.config.operations.enabled) {
        layers.push(await securityOperations.getLayerStatus());
      }

      return layers;
    } catch (error) {
      console.error('Failed to get defense layers:', error);
      throw error;
    }
  }

  /**
   * Get active threats
   */
  async getActiveThreats(): Promise<SecurityThreat[]> {
    try {
      const threats = [];

      if (this.config.incident.enabled) {
        threats.push(...await incidentResponse.getActiveThreats());
      }

      if (this.config.network.enabled) {
        threats.push(...await networkDefense.getActiveThreats());
      }

      return threats;
    } catch (error) {
      console.error('Failed to get active threats:', error);
      throw error;
    }
  }

  /**
   * Get security metrics
   */
  async getMetrics(): Promise<SecurityDefenseMetrics> {
    try {
      const authMetrics = await authenticationDefense.getMetrics();
      const networkMetrics = await networkDefense.getMetrics();
      const complianceMetrics = await complianceDefense.getMetrics();
      const incidentMetrics = await incidentResponse.getMetrics();
      const operationsMetrics = await securityOperations.getMetrics();

      return {
        authentication: authMetrics,
        network: networkMetrics,
        compliance: complianceMetrics,
        incident: incidentMetrics,
        operations: operationsMetrics,
        overall: {
          defenseScore: Math.floor((authMetrics.blockedAttempts + networkMetrics.ddosAttacksBlocked + complianceMetrics.automatedChecks) / 3),
          threatBlocks: authMetrics.blockedAttempts + networkMetrics.ddosAttacksBlocked,
          incidentsResolved: incidentMetrics.incidentsResolved,
          complianceRate: complianceMetrics.complianceScore,
          riskLevel: 'low'
        }
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw error;
    }
  }

  /**
   * Run defense assessment
   */
  async runDefenseAssessment(): Promise<{
    overallScore: number;
    layerScores: Record<string, number>;
    vulnerabilities: any[];
    recommendations: any[];
  }> {
    try {
      const authScore = await authenticationDefense.assess();
      const networkScore = await networkDefense.assess();
      const complianceScore = await complianceDefense.assess();
      const incidentScore = await incidentResponse.assess();
      const operationsScore = await securityOperations.assess();

      const overallScore = Math.floor((authScore + networkScore + complianceScore + incidentScore + operationsScore) / 5);

      return {
        overallScore,
        layerScores: {
          authentication: authScore,
          network: networkScore,
          compliance: complianceScore,
          incident: incidentScore,
          operations: operationsScore
        },
        vulnerabilities: [
          {
            category: 'Authentication',
            severity: 'medium',
            description: 'Consider enhancing MFA coverage'
          }
        ],
        recommendations: [
          {
            priority: 'medium',
            description: 'Enhance automated threat detection'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to run defense assessment:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SecurityDefenseConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityDefenseConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    authentication: boolean;
    network: boolean;
    compliance: boolean;
    incident: boolean;
    operations: boolean;
  }> {
    try {
      const authentication = this.config.authentication.enabled ? await authenticationDefense.getHealthStatus() : true;
      const network = this.config.network.enabled ? await networkDefense.getHealthStatus() : true;
      const compliance = this.config.compliance.enabled ? await complianceDefense.getHealthStatus() : true;
      const incident = this.config.incident.enabled ? await incidentResponse.getHealthStatus() : true;
      const operations = this.config.operations.enabled ? await securityOperations.getHealthStatus() : true;

      return {
        overall: this.initialized && authentication && network && compliance && incident && operations,
        authentication,
        network,
        compliance,
        incident,
        operations
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        authentication: false,
        network: false,
        compliance: false,
        incident: false,
        operations: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await authenticationDefense.cleanup();
    await networkDefense.cleanup();
    await complianceDefense.cleanup();
    await incidentResponse.cleanup();
    await securityOperations.cleanup();
  }
}

// Export default instance
export const securityDefenseLayer = new SecurityDefenseLayer();

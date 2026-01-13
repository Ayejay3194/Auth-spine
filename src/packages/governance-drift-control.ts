/**
 * Main Governance & Drift Control Layer Class
 * 
 * The central interface for preventing system drift, preserving original intent,
 * and maintaining quality, culture, and trust at scale.
 */

import { 
  GovernanceConfig, 
  DriftAssessment, 
  ProductIntent, 
  DriftSignal,
  GovernanceAlert
} from './types.js';
import { driftController } from './drift-controller.js';
import { intentRegistry } from './intent-registry.js';
import { signalMonitor } from './signal-monitor.js';
import { continuityGuard } from './continuity-guard.js';
import { culturePreservation } from './culture-preservation.js';
import { powerBalancing } from './power-balancing.js';

export class GovernanceDriftControl {
  private config: GovernanceConfig;
  private initialized = false;

  constructor(config: Partial<GovernanceConfig> = {}) {
    this.config = {
      enableIntentValidation: true,
      enableDriftDetection: true,
      enableContinuityMonitoring: true,
      enableCulturePreservation: true,
      enablePowerBalancing: true,
      driftThreshold: 0.15,
      reviewInterval: 7 * 24 * 60 * 60 * 1000,
      alertThreshold: 0.1,
      autoCorrection: false,
      governanceLayers: [
        'intent',
        'implementation',
        'operations',
        'culture',
        'power'
      ],
      ...config
    };
  }

  /**
   * Initialize the governance drift control system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await intentRegistry.initialize();
      await driftController.initialize();
      await signalMonitor.initialize();
      await continuityGuard.initialize();
      await culturePreservation.initialize();
      await powerBalancing.initialize();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Governance Drift Control:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive drift assessment
   */
  async getDriftAssessment(): Promise<DriftAssessment> {
    return await driftController.assessDrift();
  }

  /**
   * Intent Management
   */
  registerIntent(intent: Omit<ProductIntent, 'intentId' | 'createdAt' | 'status'>): ProductIntent {
    return intentRegistry.register(intent);
  }

  getIntent(intentId: string): ProductIntent | undefined {
    return intentRegistry.get(intentId);
  }

  getAllIntents(): ProductIntent[] {
    return intentRegistry.getAll();
  }

  validateIntent(intentId: string): Promise<any> {
    return intentRegistry.validate(intentId);
  }

  /**
   * Drift Monitoring
   */
  getDriftSignals(): DriftSignal[] {
    return signalMonitor.getActiveSignals();
  }

  acknowledgeSignal(signalId: string, acknowledgedBy: string): void {
    signalMonitor.acknowledge(signalId, acknowledgedBy);
  }

  resolveSignal(signalId: string, resolvedBy: string): void {
    signalMonitor.resolve(signalId, resolvedBy);
  }

  /**
   * Continuity Monitoring
   */
  getContinuityMetrics(): any[] {
    return continuityGuard.getMetrics();
  }

  updateMetric(metricId: string, value: number): void {
    continuityGuard.updateMetric(metricId, value);
  }

  /**
   * Culture Preservation
   */
  getCultureIndicators(): any[] {
    return culturePreservation.getIndicators();
  }

  assessCultureHealth(): any {
    return culturePreservation.assessHealth();
  }

  /**
   * Power Balancing
   */
  getPowerBalances(): any[] {
    return powerBalancing.getBalances();
  }

  analyzePowerDistribution(): any {
    return powerBalancing.analyzeDistribution();
  }

  /**
   * Alerts and Notifications
   */
  getActiveAlerts(): GovernanceAlert[] {
    return driftController.getActiveAlerts();
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    driftController.acknowledgeAlert(alertId, acknowledgedBy);
  }

  /**
   * Configuration
   */
  updateConfig(updates: Partial<GovernanceConfig>): void {
    this.config = { ...this.config, ...updates };
    driftController.updateConfig(updates);
  }

  getConfig(): GovernanceConfig {
    return { ...this.config };
  }

  /**
   * Health Check
   */
  async getHealthStatus(): Promise<{
    initialized: boolean;
    components: {
      intentRegistry: boolean;
      driftController: boolean;
      signalMonitor: boolean;
      continuityGuard: boolean;
      culturePreservation: boolean;
      powerBalancing: boolean;
    };
    overall: boolean;
  }> {
    const components = {
      intentRegistry: this.initialized,
      driftController: this.initialized,
      signalMonitor: this.initialized,
      continuityGuard: this.initialized,
      culturePreservation: this.initialized,
      powerBalancing: this.initialized
    };

    const overall = this.initialized && Object.values(components).every(status => status);

    return {
      initialized: this.initialized,
      components,
      overall
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

// Export default instance
export const governanceDriftControl = new GovernanceDriftControl();

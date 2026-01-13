/**
 * Drift Controller for Governance & Drift Control Layer
 * 
 * Monitors and controls system drift to prevent degradation of quality,
 * culture, and trust while preserving original intent.
 */

import { DriftAssessment, DriftSignal, GovernanceAlert, GovernanceConfig } from './types.js';
import { signalMonitor } from './signal-monitor.js';
import { continuityGuard } from './continuity-guard.js';
import { culturePreservation } from './culture-preservation.js';
import { powerBalancing } from './power-balancing.js';

export class DriftController {
  private config: GovernanceConfig;
  private alerts: Map<string, GovernanceAlert> = new Map();

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
   * Initialize drift controller
   */
  async initialize(): Promise<void> {
    // Start monitoring drift signals
    this.startDriftMonitoring();
  }

  /**
   * Assess overall drift
   */
  async assessDrift(): Promise<DriftAssessment> {
    const signals = signalMonitor.getActiveSignals();
    const continuityMetrics = continuityGuard.getMetrics();
    const cultureIndicators = culturePreservation.getIndicators();
    const powerBalances = powerBalancing.getBalances();

    // Calculate overall drift score
    const driftScore = this.calculateDriftScore(signals, continuityMetrics, cultureIndicators, powerBalances);
    
    const driftLevel = this.getDriftLevel(driftScore);
    const recommendations = this.generateRecommendations(signals, continuityMetrics, cultureIndicators, powerBalances);

    const assessment: DriftAssessment = {
      overallScore: driftScore,
      driftLevel,
      signals,
      continuityMetrics,
      cultureIndicators,
      powerBalances,
      recommendations,
      nextReview: new Date(Date.now() + this.config.reviewInterval)
    };

    // Create alerts if needed
    if (driftScore > this.config.alertThreshold) {
      this.createAlert('drift', 'warning', 'Drift Threshold Exceeded', 
        `Overall drift score of ${(driftScore * 100).toFixed(1)}% exceeds threshold of ${(this.config.alertThreshold * 100).toFixed(1)}%`);
    }

    return assessment;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): GovernanceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<GovernanceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  private calculateDriftScore(
    signals: DriftSignal[], 
    continuityMetrics: any[], 
    cultureIndicators: any[], 
    powerBalances: any[]
  ): number {
    let totalScore = 0;
    let weightSum = 0;

    // Weight drift signals
    const signalWeight = 0.3;
    const signalScore = signals.reduce((sum, signal) => sum + Math.abs(signal.driftPercentage), 0) / Math.max(signals.length, 1);
    totalScore += signalScore * signalWeight;
    weightSum += signalWeight;

    // Weight continuity metrics
    const continuityWeight = 0.3;
    const continuityScore = continuityMetrics.reduce((sum, metric) => {
      const deviation = Math.abs(metric.currentValue - metric.targetValue) / metric.targetValue;
      return sum + deviation;
    }, 0) / Math.max(continuityMetrics.length, 1);
    totalScore += continuityScore * continuityWeight;
    weightSum += continuityWeight;

    // Weight culture indicators
    const cultureWeight = 0.2;
    const cultureScore = cultureIndicators.reduce((sum, indicator) => {
      const deviation = Math.abs(indicator.currentValue - indicator.targetValue) / indicator.targetValue;
      return sum + deviation;
    }, 0) / Math.max(cultureIndicators.length, 1);
    totalScore += cultureScore * cultureWeight;
    weightSum += cultureWeight;

    // Weight power balances
    const powerWeight = 0.2;
    const powerScore = powerBalances.reduce((sum, balance) => sum + Math.abs(balance.balance), 0) / Math.max(powerBalances.length, 1);
    totalScore += powerScore * powerWeight;
    weightSum += powerWeight;

    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  private getDriftLevel(score: number): DriftAssessment['driftLevel'] {
    if (score < 0.05) return 'none';
    if (score < 0.1) return 'low';
    if (score < 0.2) return 'medium';
    if (score < 0.3) return 'high';
    return 'critical';
  }

  private generateRecommendations(
    signals: DriftSignal[], 
    continuityMetrics: any[], 
    cultureIndicators: any[], 
    powerBalances: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze signals
    const criticalSignals = signals.filter(s => s.severity === 'critical');
    if (criticalSignals.length > 0) {
      recommendations.push(`Address ${criticalSignals.length} critical drift signals immediately`);
    }

    // Analyze continuity
    const degradedMetrics = continuityMetrics.filter(m => m.status === 'critical');
    if (degradedMetrics.length > 0) {
      recommendations.push(`Review ${degradedMetrics.length} degraded continuity metrics`);
    }

    // Analyze culture
    const negativeIndicators = cultureIndicators.filter(i => i.status === 'negative');
    if (negativeIndicators.length > 0) {
      recommendations.push(`Address ${negativeIndicators.length} negative culture indicators`);
    }

    // Analyze power balance
    const imbalancedPowers = powerBalances.filter(p => p.health === 'concentrated');
    if (imbalancedPowers.length > 0) {
      recommendations.push(`Rebalance ${imbalancedPowers.length} concentrated power structures`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All governance metrics are within acceptable ranges');
    }

    return recommendations;
  }

  private createAlert(type: GovernanceAlert['type'], severity: GovernanceAlert['severity'], title: string, message: string): void {
    const alert: GovernanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      source: 'drift-controller',
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.set(alert.id, alert);
  }

  private startDriftMonitoring(): void {
    // Start periodic drift assessment
    setInterval(async () => {
      if (this.config.enableDriftDetection) {
        await this.assessDrift();
      }
    }, this.config.reviewInterval);
  }
}

// Export singleton instance
export const driftController = new DriftController();

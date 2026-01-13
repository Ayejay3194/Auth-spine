/**
 * Signal Monitor for Governance & Drift Control Layer
 * 
 * Monitors degeneration signals that indicate drift in quality,
 * culture, trust, performance, and usage patterns.
 */

import { DriftSignal } from './types.js';

export class SignalMonitor {
  private signals: Map<string, DriftSignal> = new Map();
  private baselines: Map<string, number> = new Map();

  /**
   * Initialize signal monitor
   */
  async initialize(): Promise<void> {
    this.setupDefaultSignals();
    this.startMonitoring();
  }

  /**
   * Get active drift signals
   */
  getActiveSignals(): DriftSignal[] {
    return Array.from(this.signals.values()).filter(signal => !signal.resolved);
  }

  /**
   * Acknowledge signal
   */
  acknowledge(signalId: string, acknowledgedBy: string): void {
    const signal = this.signals.get(signalId);
    if (signal) {
      signal.acknowledged = true;
    }
  }

  /**
   * Resolve signal
   */
  resolve(signalId: string, resolvedBy: string): void {
    const signal = this.signals.get(signalId);
    if (signal) {
      signal.resolved = true;
    }
  }

  /**
   * Update metric value
   */
  updateMetric(metric: string, currentValue: number): void {
    const baseline = this.baselines.get(metric);
    if (baseline === undefined) {
      this.baselines.set(metric, currentValue);
      return;
    }

    const driftPercentage = Math.abs((currentValue - baseline) / baseline);
    const threshold = this.getThreshold(metric);

    if (driftPercentage > threshold) {
      this.createSignal(metric, currentValue, baseline, driftPercentage);
    }
  }

  private setupDefaultSignals(): void {
    // Setup default baselines for key metrics
    this.baselines.set('refund_rate', 0.02); // 2% refund rate
    this.baselines.set('admin_override_rate', 0.05); // 5% admin override rate
    this.baselines.set('support_resolution_time', 24); // 24 hours
    this.baselines.set('manual_intervention_rate', 0.1); // 10% manual intervention
    this.baselines.set('churn_rate', 0.05); // 5% monthly churn
  }

  private startMonitoring(): void {
    // Start periodic monitoring
    setInterval(() => {
      this.checkDegenerationSignals();
    }, 60 * 60 * 1000); // Check every hour
  }

  private checkDegenerationSignals(): void {
    // Simulate checking for degeneration signals
    // In a real implementation, this would query actual metrics
    
    // Example: Check refund rate
    const currentRefundRate = 0.035; // 3.5%
    this.updateMetric('refund_rate', currentRefundRate);

    // Example: Check admin override rate
    const currentAdminOverrideRate = 0.08; // 8%
    this.updateMetric('admin_override_rate', currentAdminOverrideRate);

    // Example: Check support resolution time
    const currentResolutionTime = 18; // 18 hours
    this.updateMetric('support_resolution_time', currentResolutionTime);
  }

  private createSignal(metric: string, currentValue: number, baselineValue: number, driftPercentage: number): void {
    const signalId = `signal_${metric}_${Date.now()}`;
    
    const signal: DriftSignal = {
      id: signalId,
      type: this.getSignalType(metric),
      severity: this.getSeverity(driftPercentage),
      title: this.getSignalTitle(metric),
      description: this.getSignalDescription(metric, currentValue, baselineValue),
      metric,
      currentValue,
      baselineValue,
      driftPercentage,
      threshold: this.getThreshold(metric),
      detectedAt: new Date(),
      acknowledged: false,
      resolved: false,
      actionRequired: driftPercentage > 0.2,
      recommendedActions: this.getRecommendedActions(metric)
    };

    this.signals.set(signalId, signal);
  }

  private getSignalType(metric: string): DriftSignal['type'] {
    const typeMap: Record<string, DriftSignal['type']> = {
      'refund_rate': 'quality',
      'admin_override_rate': 'culture',
      'support_resolution_time': 'performance',
      'manual_intervention_rate': 'usage',
      'churn_rate': 'trust'
    };

    return typeMap[metric] || 'quality';
  }

  private getSeverity(driftPercentage: number): DriftSignal['severity'] {
    if (driftPercentage > 0.5) return 'critical';
    if (driftPercentage > 0.3) return 'high';
    if (driftPercentage > 0.15) return 'medium';
    return 'low';
  }

  private getSignalTitle(metric: string): string {
    const titleMap: Record<string, string> = {
      'refund_rate': 'Rising Refund Rate',
      'admin_override_rate': 'Increased Admin Overrides',
      'support_resolution_time': 'Shortened Support Resolution Times',
      'manual_intervention_rate': 'Higher Manual Intervention Rate',
      'churn_rate': 'Silent Churn Detected'
    };

    return titleMap[metric] || `Drift in ${metric}`;
  }

  private getSignalDescription(metric: string, currentValue: number, baselineValue: number): string {
    const descriptions: Record<string, string> = {
      'refund_rate': `Refund rate increased from ${(baselineValue * 100).toFixed(1)}% to ${(currentValue * 100).toFixed(1)}% without corresponding complaints`,
      'admin_override_rate': `Admin override rate increased from ${(baselineValue * 100).toFixed(1)}% to ${(currentValue * 100).toFixed(1)}%`,
      'support_resolution_time': `Support resolution time changed from ${baselineValue} hours to ${currentValue} hours`,
      'manual_intervention_rate': `Manual intervention rate increased from ${(baselineValue * 100).toFixed(1)}% to ${(currentValue * 100).toFixed(1)}%`,
      'churn_rate': `Customer churn rate increased from ${(baselineValue * 100).toFixed(1)}% to ${(currentValue * 100).toFixed(1)}%`
    };

    return descriptions[metric] || `Metric ${metric} drifted from baseline ${baselineValue} to ${currentValue}`;
  }

  private getThreshold(metric: string): number {
    const thresholds: Record<string, number> = {
      'refund_rate': 0.5, // 50% increase
      'admin_override_rate': 0.3, // 30% increase
      'support_resolution_time': 0.25, // 25% change
      'manual_intervention_rate': 0.2, // 20% increase
      'churn_rate': 0.4 // 40% increase
    };

    return thresholds[metric] || 0.15;
  }

  private getRecommendedActions(metric: string): string[] {
    const actions: Record<string, string[]> = {
      'refund_rate': [
        'Analyze refund reasons and patterns',
        'Review product quality issues',
        'Check for fraudulent activity',
        'Survey customers for feedback'
      ],
      'admin_override_rate': [
        'Review override policies and procedures',
        'Train staff on proper escalation',
        'Analyze override patterns for root causes',
        'Consider process improvements'
      ],
      'support_resolution_time': [
        'Investigate rushed resolution quality',
        'Review support team performance metrics',
        'Check for proper documentation',
        'Assess customer satisfaction impact'
      ],
      'manual_intervention_rate': [
        'Identify automation opportunities',
        'Review manual process triggers',
        'Analyze intervention patterns',
        'Investigate system reliability issues'
      ],
      'churn_rate': [
        'Conduct exit interviews',
        'Analyze churn patterns and segments',
        'Review product-market fit',
        'Implement retention strategies'
      ]
    };

    return actions[metric] || ['Investigate the metric change', 'Review related processes', 'Assess impact on stakeholders'];
  }
}

// Export singleton instance
export const signalMonitor = new SignalMonitor();

/**
 * Continuity Guard for Governance & Drift Control Layer
 * 
 * Maintains continuity metrics to ensure consistent quality,
 * performance, reliability, security, and usability.
 */

import { ContinuityMetric } from './types.js';

export class ContinuityGuard {
  private metrics: Map<string, ContinuityMetric> = new Map();

  /**
   * Initialize continuity guard
   */
  async initialize(): Promise<void> {
    this.setupDefaultMetrics();
    this.startMonitoring();
  }

  /**
   * Get all metrics
   */
  getMetrics(): ContinuityMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Update metric value
   */
  updateMetric(metricId: string, value: number): void {
    const metric = this.metrics.get(metricId);
    if (!metric) return;

    // Add to history
    metric.history.push({
      timestamp: new Date(),
      value
    });

    // Keep only last 100 data points
    if (metric.history.length > 100) {
      metric.history = metric.history.slice(-100);
    }

    // Update current value
    metric.currentValue = value;
    metric.lastMeasured = new Date();

    // Calculate trend
    this.calculateTrend(metric);

    // Update status
    this.updateStatus(metric);
  }

  private setupDefaultMetrics(): void {
    const defaultMetrics: Omit<ContinuityMetric, 'id' | 'history' | 'lastMeasured'>[] = [
      {
        name: 'Code Quality Score',
        description: 'Overall code quality based on static analysis',
        category: 'quality',
        targetValue: 85,
        tolerance: 10,
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'Test Coverage',
        description: 'Percentage of code covered by tests',
        category: 'quality',
        targetValue: 80,
        tolerance: 5,
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'API Response Time',
        description: 'Average API response time in milliseconds',
        category: 'performance',
        targetValue: 200,
        tolerance: 50,
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'System Uptime',
        description: 'System uptime percentage',
        category: 'reliability',
        targetValue: 99.9,
        tolerance: 0.5,
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'Security Score',
        description: 'Security assessment score',
        category: 'security',
        targetValue: 90,
        tolerance: 10,
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'User Satisfaction',
        description: 'User satisfaction score',
        category: 'usability',
        targetValue: 4.0,
        tolerance: 0.5,
        status: 'healthy',
        trend: 'stable'
      }
    ];

    defaultMetrics.forEach((metric, index) => {
      const continuityMetric: ContinuityMetric = {
        ...metric,
        id: `metric_${index + 1}`,
        currentValue: metric.targetValue,
        history: [{
          timestamp: new Date(),
          value: metric.targetValue
        }],
        lastMeasured: new Date()
      };

      this.metrics.set(continuityMetric.id, continuityMetric);
    });
  }

  private startMonitoring(): void {
    // Start periodic monitoring
    setInterval(() => {
      this.collectMetrics();
    }, 5 * 60 * 1000); // Collect every 5 minutes
  }

  private collectMetrics(): void {
    // Simulate metric collection
    // In a real implementation, this would collect actual metrics
    
    this.updateMetric('metric_1', 87 + Math.random() * 6 - 3); // Code Quality
    this.updateMetric('metric_2', 82 + Math.random() * 4 - 2); // Test Coverage
    this.updateMetric('metric_3', 195 + Math.random() * 20 - 10); // API Response Time
    this.updateMetric('metric_4', 99.85 + Math.random() * 0.2 - 0.1); // System Uptime
    this.updateMetric('metric_5', 88 + Math.random() * 8 - 4); // Security Score
    this.updateMetric('metric_6', 4.1 + Math.random() * 0.4 - 0.2); // User Satisfaction
  }

  private calculateTrend(metric: ContinuityMetric): void {
    if (metric.history.length < 2) {
      metric.trend = 'stable';
      return;
    }

    const recent = metric.history.slice(-10);
    const older = metric.history.slice(-20, -10);

    if (recent.length === 0 || older.length === 0) {
      metric.trend = 'stable';
      return;
    }

    const recentAvg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, point) => sum + point.value, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.05) {
      metric.trend = 'improving';
    } else if (change < -0.05) {
      metric.trend = 'degrading';
    } else {
      metric.trend = 'stable';
    }
  }

  private updateStatus(metric: ContinuityMetric): void {
    const deviation = Math.abs(metric.currentValue - metric.targetValue) / metric.targetValue;

    if (deviation > metric.tolerance / metric.targetValue) {
      metric.status = 'critical';
    } else if (deviation > (metric.tolerance / 2) / metric.targetValue) {
      metric.status = 'warning';
    } else {
      metric.status = 'healthy';
    }
  }
}

// Export singleton instance
export const continuityGuard = new ContinuityGuard();

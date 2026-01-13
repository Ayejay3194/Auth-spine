/**
 * Metrics - Performance metrics collection
 */

export interface MetricData {
  timestamp: Date;
  value: number;
}

export class MetricsCollector {
  static async collectMetrics(): Promise<MetricData[]> {
    return [];
  }
}

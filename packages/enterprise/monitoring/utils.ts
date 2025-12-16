/**
 * Monitoring Utilities - Helper functions for monitoring
 */

export class MonitoringUtils {
  static formatDuration(ms: number): string {
    return `${ms}ms`;
  }

  static calculatePercentage(value: number, total: number): number {
    return (value / total) * 100;
  }
}

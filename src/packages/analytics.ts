import { AuditEvent, AuditMetrics, AuditFilter, AuditEventType, AuditCategory, AuditSeverity } from './types';
import { auditStorage } from './storage';

export class AuditAnalytics {
  private static instance: AuditAnalytics;

  private constructor() {}

  static getInstance(): AuditAnalytics {
    if (!AuditAnalytics.instance) {
      AuditAnalytics.instance = new AuditAnalytics();
    }
    return AuditAnalytics.instance;
  }

  async calculateMetrics(filter: AuditFilter): Promise<AuditMetrics> {
    const events = await auditStorage.query(filter);

    const totalEvents = events.length;
    const successCount = events.filter(e => e.success).length;
    const failureCount = totalEvents - successCount;

    const eventsByType: Record<AuditEventType, number> = {} as any;
    const eventsByCategory: Record<AuditCategory, number> = {} as any;
    const eventsBySeverity: Record<AuditSeverity, number> = {} as any;

    const userCounts = new Map<string, number>();
    const clientCounts = new Map<string, number>();

    let totalDuration = 0;
    let durationCount = 0;

    for (const event of events) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

      if (event.userId) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }

      if (event.clientId) {
        clientCounts.set(event.clientId, (clientCounts.get(event.clientId) || 0) + 1);
      }

      if (event.duration !== undefined) {
        totalDuration += event.duration;
        durationCount++;
      }
    }

    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topClients = Array.from(clientCounts.entries())
      .map(([clientId, count]) => ({ clientId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const timeSeriesData = this.generateTimeSeries(events, filter);

    return {
      totalEvents,
      successRate: totalEvents > 0 ? successCount / totalEvents : 0,
      failureRate: totalEvents > 0 ? failureCount / totalEvents : 0,
      averageDuration: durationCount > 0 ? totalDuration / durationCount : undefined,
      eventsByType,
      eventsByCategory,
      eventsBySeverity,
      topUsers,
      topClients,
      timeSeriesData,
    };
  }

  private generateTimeSeries(
    events: AuditEvent[],
    filter: AuditFilter
  ): Array<{ timestamp: number; count: number; successCount: number; failureCount: number }> {
    const buckets = new Map<number, { count: number; successCount: number; failureCount: number }>();

    const bucketSize = this.determineBucketSize(filter);

    for (const event of events) {
      const bucketKey = Math.floor(event.timestamp / bucketSize) * bucketSize;
      const bucket = buckets.get(bucketKey) || { count: 0, successCount: 0, failureCount: 0 };

      bucket.count++;
      if (event.success) {
        bucket.successCount++;
      } else {
        bucket.failureCount++;
      }

      buckets.set(bucketKey, bucket);
    }

    return Array.from(buckets.entries())
      .map(([timestamp, data]) => ({ timestamp, ...data }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private determineBucketSize(filter: AuditFilter): number {
    if (!filter.startDate || !filter.endDate) {
      return 60 * 60 * 1000;
    }

    const duration = filter.endDate.getTime() - filter.startDate.getTime();
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;

    if (duration > 30 * day) return day;
    if (duration > 7 * day) return 6 * hour;
    if (duration > day) return hour;
    if (duration > hour) return 5 * minute;
    return minute;
  }

  async detectAnomalies(filter: AuditFilter): Promise<Array<{
    type: string;
    severity: AuditSeverity;
    description: string;
    data: any;
  }>> {
    const events = await auditStorage.query(filter);
    const anomalies: Array<{ type: string; severity: AuditSeverity; description: string; data: any }> = [];

    const failureRate = events.filter(e => !e.success).length / events.length;
    if (failureRate > 0.3) {
      anomalies.push({
        type: 'high_failure_rate',
        severity: 'critical',
        description: `High failure rate detected: ${(failureRate * 100).toFixed(1)}%`,
        data: { failureRate, totalEvents: events.length },
      });
    }

    const recentEvents = events.slice(0, 100);
    const recentFailures = recentEvents.filter(e => !e.success).length;
    if (recentFailures > 50) {
      anomalies.push({
        type: 'spike_in_failures',
        severity: 'error',
        description: `Spike in failures: ${recentFailures} failures in last 100 events`,
        data: { recentFailures },
      });
    }

    const slowEvents = events.filter(e => e.duration && e.duration > 5000);
    if (slowEvents.length > events.length * 0.1) {
      anomalies.push({
        type: 'performance_degradation',
        severity: 'warning',
        description: `${slowEvents.length} slow requests detected (>5s)`,
        data: { slowEventCount: slowEvents.length },
      });
    }

    const userEventCounts = new Map<string, number>();
    for (const event of events) {
      if (event.userId) {
        userEventCounts.set(event.userId, (userEventCounts.get(event.userId) || 0) + 1);
      }
    }

    for (const [userId, count] of userEventCounts.entries()) {
      if (count > 1000) {
        anomalies.push({
          type: 'suspicious_activity',
          severity: 'warning',
          description: `User ${userId} has ${count} events in the period`,
          data: { userId, eventCount: count },
        });
      }
    }

    return anomalies;
  }

  async identifyTrends(filter: AuditFilter): Promise<Array<{
    type: string;
    description: string;
    data: any;
  }>> {
    const events = await auditStorage.query(filter);
    const trends: Array<{ type: string; description: string; data: any }> = [];

    const eventsByHour = new Map<number, number>();
    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      eventsByHour.set(hour, (eventsByHour.get(hour) || 0) + 1);
    }

    const peakHour = Array.from(eventsByHour.entries()).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      trends.push({
        type: 'peak_usage_hour',
        description: `Peak usage at ${peakHour[0]}:00 with ${peakHour[1]} events`,
        data: { hour: peakHour[0], count: peakHour[1] },
      });
    }

    const authEvents = events.filter(e => e.category === 'authentication');
    const authSuccessRate = authEvents.filter(e => e.success).length / authEvents.length;
    if (authSuccessRate < 0.9 && authEvents.length > 10) {
      trends.push({
        type: 'authentication_issues',
        description: `Authentication success rate is ${(authSuccessRate * 100).toFixed(1)}%`,
        data: { successRate: authSuccessRate, totalAuthEvents: authEvents.length },
      });
    }

    const avgDuration = events
      .filter(e => e.duration !== undefined)
      .reduce((sum, e) => sum + (e.duration || 0), 0) / events.filter(e => e.duration).length;

    if (avgDuration > 1000) {
      trends.push({
        type: 'slow_performance',
        description: `Average request duration is ${avgDuration.toFixed(0)}ms`,
        data: { averageDuration: avgDuration },
      });
    }

    return trends;
  }
}

export const auditAnalytics = AuditAnalytics.getInstance();

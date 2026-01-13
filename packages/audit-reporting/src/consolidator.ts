import { AuditFilter, ConsolidatedReport, GroupedAuditData } from './types';
import { reportGenerator } from './report-generator';
import { auditStorage } from './storage';

export interface ConsolidationConfig {
  name: string;
  description?: string;
  filters: AuditFilter[];
  groupBy?: GroupedAuditData['groupBy'];
  mergeStrategy?: 'union' | 'intersection';
}

export class AuditConsolidator {
  private static instance: AuditConsolidator;

  private constructor() {}

  static getInstance(): AuditConsolidator {
    if (!AuditConsolidator.instance) {
      AuditConsolidator.instance = new AuditConsolidator();
    }
    return AuditConsolidator.instance;
  }

  async consolidateReports(
    reports: ConsolidatedReport[]
  ): Promise<ConsolidatedReport> {
    if (reports.length === 0) {
      throw new Error('No reports to consolidate');
    }

    if (reports.length === 1) {
      return reports[0];
    }

    const allEvents = reports.flatMap(r => r.events);
    const uniqueEvents = Array.from(
      new Map(allEvents.map(e => [e.id, e])).values()
    );

    const earliestStart = new Date(
      Math.min(...reports.map(r => r.period.start.getTime()))
    );
    const latestEnd = new Date(
      Math.max(...reports.map(r => r.period.end.getTime()))
    );

    const totalEvents = uniqueEvents.length;
    const successCount = uniqueEvents.filter(e => e.success).length;

    const consolidatedMetrics = {
      totalEvents,
      successRate: totalEvents > 0 ? successCount / totalEvents : 0,
      failureRate: totalEvents > 0 ? (totalEvents - successCount) / totalEvents : 0,
      averageDuration: this.calculateAverageDuration(uniqueEvents),
      eventsByType: this.mergeEventCounts(reports.map(r => r.metrics.eventsByType)),
      eventsByCategory: this.mergeEventCounts(reports.map(r => r.metrics.eventsByCategory)),
      eventsBySeverity: this.mergeEventCounts(reports.map(r => r.metrics.eventsBySeverity)),
      topUsers: this.mergeTopItems(reports.map(r => r.metrics.topUsers)),
      topClients: this.mergeTopItems(reports.map(r => r.metrics.topClients)),
      timeSeriesData: this.mergeTimeSeries(reports.map(r => r.metrics.timeSeriesData)),
    };

    const allInsights = reports.flatMap(r => r.insights);
    const uniqueInsights = Array.from(
      new Map(allInsights.map(i => [i.title + i.description, i])).values()
    );

    const allRecommendations = reports.flatMap(r => r.recommendations);
    const uniqueRecommendations = Array.from(new Set(allRecommendations));

    return {
      id: `consolidated-${Date.now()}`,
      title: `Consolidated Report: ${reports.map(r => r.title).join(', ')}`,
      description: `Consolidated from ${reports.length} reports`,
      generatedAt: new Date(),
      period: {
        start: earliestStart,
        end: latestEnd,
      },
      filters: {},
      metrics: consolidatedMetrics,
      events: uniqueEvents.sort((a, b) => b.timestamp - a.timestamp),
      insights: uniqueInsights,
      recommendations: uniqueRecommendations,
    };
  }

  async consolidateByFilters(config: ConsolidationConfig): Promise<ConsolidatedReport> {
    const reports = await Promise.all(
      config.filters.map(filter =>
        reportGenerator.generateReport(
          config.name,
          filter,
          { includeInsights: true, includeRecommendations: true }
        )
      )
    );

    return this.consolidateReports(reports);
  }

  async groupAndConsolidate(
    filter: AuditFilter,
    groupBy: GroupedAuditData['groupBy']
  ): Promise<{
    grouped: GroupedAuditData;
    reports: ConsolidatedReport[];
  }> {
    const grouped = await reportGenerator.groupAuditData(filter, groupBy);

    const reports = await Promise.all(
      grouped.groups.slice(0, 10).map(async group => {
        const groupFilter: AuditFilter = {
          ...filter,
          limit: undefined,
        };

        switch (groupBy) {
          case 'eventType':
            groupFilter.eventTypes = [group.key as any];
            break;
          case 'category':
            groupFilter.categories = [group.key as any];
            break;
          case 'severity':
            groupFilter.severities = [group.key as any];
            break;
          case 'user':
            groupFilter.userId = group.key;
            break;
          case 'client':
            groupFilter.clientId = group.key;
            break;
        }

        return reportGenerator.generateReport(
          `${groupBy}: ${group.key}`,
          groupFilter,
          { includeInsights: false, includeRecommendations: false }
        );
      })
    );

    return { grouped, reports };
  }

  private calculateAverageDuration(events: any[]): number | undefined {
    const durations = events.filter(e => e.duration !== undefined).map(e => e.duration);
    if (durations.length === 0) return undefined;
    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  private mergeEventCounts(counts: Record<string, number>[]): Record<string, number> {
    const merged: Record<string, number> = {};
    for (const count of counts) {
      for (const [key, value] of Object.entries(count)) {
        merged[key] = (merged[key] || 0) + value;
      }
    }
    return merged;
  }

  private mergeTopItems(
    items: Array<Array<{ userId?: string; clientId?: string; count: number }>>
  ): Array<{ userId?: string; clientId?: string; count: number }> {
    const merged = new Map<string, number>();

    for (const itemList of items) {
      for (const item of itemList) {
        const key = (item.userId || item.clientId) as string;
        merged.set(key, (merged.get(key) || 0) + item.count);
      }
    }

    return Array.from(merged.entries())
      .map(([key, count]) => {
        if (items[0]?.[0]?.userId !== undefined) {
          return { userId: key, count };
        }
        return { clientId: key, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private mergeTimeSeries(
    series: Array<Array<{ timestamp: number; count: number; successCount: number; failureCount: number }>>
  ): Array<{ timestamp: number; count: number; successCount: number; failureCount: number }> {
    const merged = new Map<number, { count: number; successCount: number; failureCount: number }>();

    for (const seriesData of series) {
      for (const point of seriesData) {
        const existing = merged.get(point.timestamp) || { count: 0, successCount: 0, failureCount: 0 };
        merged.set(point.timestamp, {
          count: existing.count + point.count,
          successCount: existing.successCount + point.successCount,
          failureCount: existing.failureCount + point.failureCount,
        });
      }
    }

    return Array.from(merged.entries())
      .map(([timestamp, data]) => ({ timestamp, ...data }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async createComparisonReport(
    filter1: AuditFilter,
    filter2: AuditFilter,
    comparisonName: string
  ): Promise<{
    report1: ConsolidatedReport;
    report2: ConsolidatedReport;
    comparison: {
      eventCountChange: number;
      successRateChange: number;
      failureRateChange: number;
      durationChange?: number;
    };
  }> {
    const [report1, report2] = await Promise.all([
      reportGenerator.generateReport('Period 1', filter1, { includeInsights: true }),
      reportGenerator.generateReport('Period 2', filter2, { includeInsights: true }),
    ]);

    const comparison = {
      eventCountChange: report2.metrics.totalEvents - report1.metrics.totalEvents,
      successRateChange: report2.metrics.successRate - report1.metrics.successRate,
      failureRateChange: report2.metrics.failureRate - report1.metrics.failureRate,
      durationChange:
        report1.metrics.averageDuration && report2.metrics.averageDuration
          ? report2.metrics.averageDuration - report1.metrics.averageDuration
          : undefined,
    };

    return { report1, report2, comparison };
  }
}

export const auditConsolidator = AuditConsolidator.getInstance();

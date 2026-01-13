import { randomBytes } from 'crypto';
import {
  AuditFilter,
  ConsolidatedReport,
  ReportInsight,
  GroupedAuditData,
  AuditReportConfig,
  AuditMetrics,
} from './types';
import { auditStorage } from './storage';
import { auditAnalytics } from './analytics';

export class ReportGenerator {
  private static instance: ReportGenerator;

  private constructor() {}

  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  async generateReport(
    title: string,
    filter: AuditFilter,
    options?: {
      includeInsights?: boolean;
      includeRecommendations?: boolean;
      description?: string;
    }
  ): Promise<ConsolidatedReport> {
    const events = await auditStorage.query(filter);
    const metrics = await auditAnalytics.calculateMetrics(filter);

    const insights: ReportInsight[] = [];
    const recommendations: string[] = [];

    if (options?.includeInsights) {
      const anomalies = await auditAnalytics.detectAnomalies(filter);
      const trends = await auditAnalytics.identifyTrends(filter);

      for (const anomaly of anomalies) {
        insights.push({
          type: 'anomaly',
          severity: anomaly.severity,
          title: anomaly.type.replace(/_/g, ' ').toUpperCase(),
          description: anomaly.description,
          data: anomaly.data,
        });
      }

      for (const trend of trends) {
        insights.push({
          type: 'trend',
          severity: 'info',
          title: trend.type.replace(/_/g, ' ').toUpperCase(),
          description: trend.description,
          data: trend.data,
        });
      }
    }

    if (options?.includeRecommendations) {
      recommendations.push(...this.generateRecommendations(metrics, insights));
    }

    const period = {
      start: filter.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: filter.endDate || new Date(),
    };

    return {
      id: randomBytes(12).toString('hex'),
      title,
      description: options?.description,
      generatedAt: new Date(),
      period,
      filters: filter,
      metrics,
      events,
      insights,
      recommendations,
    };
  }

  async groupAuditData(
    filter: AuditFilter,
    groupBy: GroupedAuditData['groupBy']
  ): Promise<GroupedAuditData> {
    const events = await auditStorage.query(filter);
    const groupMap = new Map<string, typeof events>();

    for (const event of events) {
      let key: string;

      switch (groupBy) {
        case 'eventType':
          key = event.eventType;
          break;
        case 'category':
          key = event.category;
          break;
        case 'severity':
          key = event.severity;
          break;
        case 'user':
          key = event.userId || 'anonymous';
          break;
        case 'client':
          key = event.clientId || 'unknown';
          break;
        case 'hour':
          key = new Date(event.timestamp).toISOString().slice(0, 13);
          break;
        case 'day':
          key = new Date(event.timestamp).toISOString().slice(0, 10);
          break;
        default:
          key = 'unknown';
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(event);
    }

    const groups = Array.from(groupMap.entries()).map(([key, groupEvents]) => {
      const successCount = groupEvents.filter(e => e.success).length;
      const failureCount = groupEvents.length - successCount;

      const durations = groupEvents.filter(e => e.duration !== undefined).map(e => e.duration!);
      const avgDuration = durations.length > 0 
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
        : undefined;

      return {
        key,
        count: groupEvents.length,
        successCount,
        failureCount,
        events: groupEvents,
        metrics: {
          totalEvents: groupEvents.length,
          successRate: successCount / groupEvents.length,
          failureRate: failureCount / groupEvents.length,
          averageDuration: avgDuration,
        },
      };
    });

    groups.sort((a, b) => b.count - a.count);

    return {
      groupBy,
      groups,
    };
  }

  private generateRecommendations(metrics: AuditMetrics, insights: ReportInsight[]): string[] {
    const recommendations: string[] = [];

    if (metrics.failureRate > 0.2) {
      recommendations.push(
        'High failure rate detected. Review authentication configuration and error logs.'
      );
    }

    if (metrics.averageDuration && metrics.averageDuration > 2000) {
      recommendations.push(
        'Average request duration is high. Consider optimizing database queries and adding caching.'
      );
    }

    const criticalInsights = insights.filter(i => i.severity === 'critical');
    if (criticalInsights.length > 0) {
      recommendations.push(
        'Critical issues detected. Immediate investigation and remediation required.'
      );
    }

    const authFailures = metrics.eventsByType['AUTH_FAILED'] || 0;
    const authSuccess = metrics.eventsByType['AUTH_SUCCESS'] || 0;
    if (authFailures > authSuccess * 0.5) {
      recommendations.push(
        'High authentication failure rate. Consider implementing account lockout policies and monitoring for brute force attacks.'
      );
    }

    if (metrics.eventsBySeverity['error'] > metrics.totalEvents * 0.1) {
      recommendations.push(
        'High error rate detected. Review application logs and implement better error handling.'
      );
    }

    const mfaFailures = metrics.eventsByType['MFA_FAILED'] || 0;
    if (mfaFailures > 10) {
      recommendations.push(
        'Multiple MFA failures detected. Users may need assistance with MFA setup or recovery.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating within normal parameters. Continue monitoring.');
    }

    return recommendations;
  }

  async generateScheduledReport(config: AuditReportConfig): Promise<ConsolidatedReport> {
    return this.generateReport(config.name, config.filters, {
      includeInsights: config.includeInsights,
      includeRecommendations: config.includeRecommendations,
      description: config.description,
    });
  }

  exportToJSON(report: ConsolidatedReport): string {
    return JSON.stringify(report, null, 2);
  }

  exportToCSV(report: ConsolidatedReport): string {
    const headers = [
      'ID',
      'Event Type',
      'Category',
      'Severity',
      'User ID',
      'Client ID',
      'Session ID',
      'Timestamp',
      'Duration',
      'Success',
    ];

    const rows = report.events.map(event => [
      event.id,
      event.eventType,
      event.category,
      event.severity,
      event.userId || '',
      event.clientId || '',
      event.sessionId || '',
      new Date(event.timestamp).toISOString(),
      event.duration?.toString() || '',
      event.success.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  exportToHTML(report: ConsolidatedReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
    .insight { margin: 15px 0; padding: 15px; border-left: 4px solid #ffc107; background: #fff3cd; border-radius: 4px; }
    .insight.critical { border-color: #dc3545; background: #f8d7da; }
    .insight.error { border-color: #fd7e14; background: #ffe5d0; }
    .recommendation { margin: 10px 0; padding: 10px; background: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; }
    tr:hover { background: #f5f5f5; }
    .success { color: #28a745; }
    .failure { color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${report.title}</h1>
    <p><strong>Generated:</strong> ${report.generatedAt.toISOString()}</p>
    <p><strong>Period:</strong> ${report.period.start.toISOString()} to ${report.period.end.toISOString()}</p>
    ${report.description ? `<p>${report.description}</p>` : ''}

    <h2>Metrics Summary</h2>
    <div class="metric">
      <div class="metric-label">Total Events</div>
      <div class="metric-value">${report.metrics.totalEvents}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Success Rate</div>
      <div class="metric-value">${(report.metrics.successRate * 100).toFixed(1)}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Failure Rate</div>
      <div class="metric-value">${(report.metrics.failureRate * 100).toFixed(1)}%</div>
    </div>
    ${report.metrics.averageDuration ? `
    <div class="metric">
      <div class="metric-label">Avg Duration</div>
      <div class="metric-value">${report.metrics.averageDuration.toFixed(0)}ms</div>
    </div>
    ` : ''}

    ${report.insights.length > 0 ? `
    <h2>Insights</h2>
    ${report.insights.map(insight => `
      <div class="insight ${insight.severity}">
        <strong>${insight.title}</strong><br>
        ${insight.description}
      </div>
    `).join('')}
    ` : ''}

    ${report.recommendations.length > 0 ? `
    <h2>Recommendations</h2>
    ${report.recommendations.map(rec => `
      <div class="recommendation">${rec}</div>
    `).join('')}
    ` : ''}

    <h2>Recent Events (Top 50)</h2>
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Event Type</th>
          <th>Category</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${report.events.slice(0, 50).map(event => `
          <tr>
            <td>${new Date(event.timestamp).toLocaleString()}</td>
            <td>${event.eventType}</td>
            <td>${event.category}</td>
            <td>${event.severity}</td>
            <td class="${event.success ? 'success' : 'failure'}">${event.success ? '✓ Success' : '✗ Failed'}</td>
            <td>${event.duration ? event.duration + 'ms' : '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
    `.trim();
  }
}

export const reportGenerator = ReportGenerator.getInstance();

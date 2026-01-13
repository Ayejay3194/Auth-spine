'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs } from './ui/tabs';
import { Badge } from './ui/badge';

interface AuditMetrics {
  totalEvents: number;
  successRate: number;
  failureRate: number;
  averageDuration?: number;
  eventsByType: Record<string, number>;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topUsers: Array<{ userId: string; count: number }>;
  topClients: Array<{ clientId: string; count: number }>;
  timeSeriesData: Array<{
    timestamp: number;
    count: number;
    successCount: number;
    failureCount: number;
  }>;
}

interface AuditEvent {
  id: string;
  eventType: string;
  category: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  clientId?: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
  error?: { message: string; code?: string };
}

interface ConsolidatedReport {
  id: string;
  title: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  metrics: AuditMetrics;
  events: AuditEvent[];
  insights: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
  }>;
  recommendations: string[];
}

export function AuditDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'reports' | 'analytics'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [timeRange]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };

      const response = await fetch('/api/audit/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date(Date.now() - ranges[timeRange]).toISOString(),
          endDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to load report');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const exportReport = async (format: 'json' | 'csv' | 'html') => {
    try {
      const response = await fetch(`/api/audit/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report?.id }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${Date.now()}.${format}`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error Loading Report</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadReport}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={() => exportReport('json')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export JSON
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportReport('html')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Export HTML
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 uppercase font-semibold">Total Events</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{report.metrics.totalEvents.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 uppercase font-semibold">Success Rate</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {(report.metrics.successRate * 100).toFixed(1)}%
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 uppercase font-semibold">Failure Rate</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {(report.metrics.failureRate * 100).toFixed(1)}%
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 uppercase font-semibold">Avg Duration</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {report.metrics.averageDuration ? `${report.metrics.averageDuration.toFixed(0)}ms` : 'N/A'}
          </div>
        </Card>
      </div>

      {report.insights.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Insights & Alerts</h2>
          <div className="space-y-3">
            {report.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{insight.title}</h3>
                    <p className="text-sm mt-1">{insight.description}</p>
                  </div>
                  <Badge className={getSeverityColor(insight.severity)}>
                    {insight.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Events by Type</h2>
          <div className="space-y-2">
            {Object.entries(report.metrics.eventsByType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-700">{type}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Events by Category</h2>
          <div className="space-y-2">
            {Object.entries(report.metrics.eventsByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{category}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Users</h2>
          <div className="space-y-2">
            {report.metrics.topUsers.slice(0, 10).map((user, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-700 font-mono text-sm">{user.userId}</span>
                <span className="font-semibold text-gray-900">{user.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Clients</h2>
          <div className="space-y-2">
            {report.metrics.topClients.slice(0, 10).map((client, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-700 font-mono text-sm">{client.clientId}</span>
                <span className="font-semibold text-gray-900">{client.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Event Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Severity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              {report.events.slice(0, 50).map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">{event.eventType}</td>
                  <td className="py-3 px-4 text-sm capitalize">{event.category}</td>
                  <td className="py-3 px-4">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className={event.success ? 'text-green-600' : 'text-red-600'}>
                      {event.success ? '✓ Success' : '✗ Failed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {event.duration ? `${event.duration}ms` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/**
 * SLO Monitoring Dashboard
 * Real-time service level objectives and alerting interface
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Bell,
  BarChart3,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  metric: string;
  target: number;
  current: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
}

interface Alert {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  triggeredAt: string;
}

interface DashboardData {
  slos: SLO[];
  alerts: Alert[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

const statusColors = {
  healthy: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  critical: 'text-red-600 bg-red-50 border-red-200'
};

const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle
};

const trendIcons = {
  improving: TrendingUp,
  stable: Minus,
  degrading: TrendingDown
};

export default function MonitoringDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboard();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboard, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring/slo');
      if (!response.ok) throw new Error('Failed to fetch dashboard');

      const data = await response.json();
      setDashboard(data.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualCheck = async () => {
    try {
      const response = await fetch('/api/monitoring/slo', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to trigger check');
      
      await fetchDashboard(); // Refresh dashboard
    } catch (error) {
      console.error('Error triggering SLO check:', error);
    }
  };

  const getOverallHealthIcon = () => {
    switch (dashboard?.overallHealth) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Activity className="w-6 h-6 text-gray-400" />;
    }
  };

  const getOverallHealthColor = () => {
    switch (dashboard?.overallHealth) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                SLO Monitoring Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Service level objectives and system reliability monitoring
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  autoRefresh 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              <button
                onClick={triggerManualCheck}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Run Check
              </button>
            </div>
          </div>
        </div>

        {/* Overall Health Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getOverallHealthIcon()}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Overall System Health
                </h2>
                <p className="text-gray-600">
                  {dashboard?.overallHealth === 'healthy' && 'All systems operating normally'}
                  {dashboard?.overallHealth === 'degraded' && 'Some systems experiencing issues'}
                  {dashboard?.overallHealth === 'critical' && 'Critical issues detected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboard?.slos.filter(s => s.status === 'healthy').length}
                </div>
                <div className="text-sm text-gray-600">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboard?.slos.filter(s => s.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dashboard?.slos.filter(s => s.status === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboard?.alerts.length}
                </div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
            </div>
          </div>
          {lastRefresh && (
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Active Alerts */}
        {dashboard?.alerts && dashboard.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            </div>
            <div className="space-y-2">
              {dashboard.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <span className={`font-medium ${
                      alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      {alert.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(alert.triggeredAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLOs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboard?.slos.map((slo) => {
            const StatusIcon = statusIcons[slo.status];
            const TrendIcon = trendIcons[slo.trend];
            
            return (
              <div key={slo.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-900">{slo.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[slo.status]}`}>
                    {slo.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{slo.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {slo.current}{slo.metric.includes('rate') ? '%' : 'ms'}
                      </span>
                      <TrendIcon className={`w-4 h-4 ${
                        slo.trend === 'improving' ? 'text-green-600' :
                        slo.trend === 'degrading' ? 'text-red-600' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="font-medium text-gray-900">
                      {slo.target}{slo.metric.includes('rate') ? '%' : 'ms'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Service</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {slo.service}
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        slo.status === 'healthy' ? 'bg-green-600' :
                        slo.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{
                        width: `${Math.min((slo.current / slo.target) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && !dashboard && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading monitoring data...</span>
          </div>
        )}
      </div>
    </div>
  );
}

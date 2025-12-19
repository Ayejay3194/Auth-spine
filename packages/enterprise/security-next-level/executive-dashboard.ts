/**
 * Executive Dashboard for Security Next-Level Suite
 * 
 * Provides executive-level security metrics, charts, and insights
 * for security leadership and board reporting.
 */

import { ExecutiveMetric, SecurityDashboard, MetricCategory } from './types.js';

export class ExecutiveDashboardManager {
  private dashboard: SecurityDashboard;
  private metrics: Map<string, ExecutiveMetric> = new Map();
  private initialized = false;

  constructor() {
    this.initializeDashboard();
    this.loadDefaultMetrics();
  }

  /**
   * Initialize executive dashboard
   */
  async initialize(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Get dashboard configuration and data
   */
  getDashboard(): SecurityDashboard {
    return {
      ...this.dashboard,
      sections: this.dashboard.sections.map(section => ({
        ...section,
        widgets: section.widgets.map(widget => ({
          ...widget,
          data: this.getWidgetData(widget.type, widget.id)
        }))
      })),
      lastRefreshed: new Date()
    };
  }

  /**
   * Get security metrics
   */
  getMetrics(): any {
    const allMetrics = Array.from(this.metrics.values());
    
    return {
      overall: this.calculateOverallScore(allMetrics),
      byCategory: this.groupMetricsByCategory(allMetrics),
      kpis: allMetrics.filter(m => m.kpi),
      trends: this.generateTrends(allMetrics),
      alerts: this.generateMetricAlerts(allMetrics)
    };
  }

  /**
   * Get specific metric
   */
  getMetric(metricId: string): ExecutiveMetric | undefined {
    return this.metrics.get(metricId);
  }

  /**
   * Update metric value
   */
  updateMetric(metricId: string, value: number): void {
    const metric = this.metrics.get(metricId);
    if (metric) {
      metric.value = value;
      metric.lastUpdated = new Date();
      
      // Update historical data
      metric.historical.push({
        date: new Date(),
        value
      });
      
      // Keep only last 30 days of history
      if (metric.historical.length > 30) {
        metric.historical = metric.historical.slice(-30);
      }
      
      // Update trend and status
      this.updateMetricTrend(metric);
      this.updateMetricStatus(metric);
    }
  }

  /**
   * Add new metric
   */
  addMetric(metric: Omit<ExecutiveMetric, 'id' | 'historical' | 'lastUpdated'>): ExecutiveMetric {
    const executiveMetric: ExecutiveMetric = {
      ...metric,
      id: `metric_${metric.category}_${Date.now()}`,
      historical: [{
        date: new Date(),
        value: metric.value
      }],
      lastUpdated: new Date()
    };

    this.metrics.set(executiveMetric.id, executiveMetric);
    return executiveMetric;
  }

  private initializeDashboard(): void {
    this.dashboard = {
      id: 'executive-security-dashboard',
      title: 'Executive Security Dashboard',
      description: 'Real-time security metrics and insights for leadership',
      sections: [
        {
          id: 'overview',
          title: 'Security Overview',
          type: 'metrics',
          widgets: [
            {
              id: 'overall-score',
              type: 'metric',
              title: 'Overall Security Score',
              data: {},
              config: {
                format: 'percentage',
                threshold: { good: 90, warning: 75, critical: 50 }
              }
            },
            {
              id: 'compliance-rate',
              type: 'metric',
              title: 'Compliance Rate',
              data: {},
              config: {
                format: 'percentage',
                threshold: { good: 95, warning: 85, critical: 70 }
              }
            },
            {
              id: 'risk-level',
              type: 'metric',
              title: 'Risk Level',
              data: {},
              config: {
                format: 'text',
                threshold: { good: 'low', warning: 'medium', critical: 'high' }
              }
            }
          ]
        },
        {
          id: 'compliance',
          title: 'Compliance Metrics',
          type: 'charts',
          widgets: [
            {
              id: 'compliance-trend',
              type: 'chart',
              title: 'Compliance Trend',
              data: {},
              config: {
                chartType: 'line',
                timeRange: '30d'
              }
            },
            {
              id: 'framework-compliance',
              type: 'chart',
              title: 'Framework Compliance',
              data: {},
              config: {
                chartType: 'bar',
                frameworks: ['SOC2', 'ISO27001', 'NIST-CSF', 'PCI-DSS']
              }
            }
          ]
        },
        {
          id: 'risk',
          title: 'Risk Management',
          type: 'charts',
          widgets: [
            {
              id: 'risk-distribution',
              type: 'chart',
              title: 'Risk Distribution',
              data: {},
              config: {
                chartType: 'pie',
                categories: ['strategic', 'operational', 'compliance', 'technology']
              }
            },
            {
              id: 'risk-trend',
              type: 'chart',
              title: 'Risk Trend',
              data: {},
              config: {
                chartType: 'line',
                timeRange: '90d'
              }
            }
          ]
        },
        {
          id: 'incidents',
          title: 'Incident Management',
          type: 'charts',
          widgets: [
            {
              id: 'incident-trend',
              type: 'chart',
              title: 'Incident Trend',
              data: {},
              config: {
                chartType: 'line',
                timeRange: '90d'
              }
            },
            {
              id: 'incident-severity',
              type: 'chart',
              title: 'Incident Severity',
              data: {},
              config: {
                chartType: 'bar',
                severities: ['low', 'medium', 'high', 'critical']
              }
            }
          ]
        },
        {
          id: 'alerts',
          title: 'Security Alerts',
          type: 'alerts',
          widgets: [
            {
              id: 'active-alerts',
              type: 'alert',
              title: 'Active Alerts',
              data: {},
              config: {
                maxItems: 10,
                sortBy: 'severity'
              }
            }
          ]
        }
      ],
      refreshInterval: 300000, // 5 minutes
      lastRefreshed: new Date(),
      filters: {
        timeRange: '30d',
        frameworks: ['SOC2', 'ISO27001', 'NIST-CSF', 'PCI-DSS'],
        severity: ['high', 'critical']
      }
    };
  }

  private loadDefaultMetrics(): void {
    // Compliance Metrics
    this.addMetric({
      name: 'Overall Security Score',
      description: 'Aggregate security score across all domains',
      category: 'compliance',
      value: 87,
      target: 90,
      unit: '%',
      trend: 'stable',
      status: 'at-risk',
      kpi: true,
      owner: 'CISO',
      drillDown: {
        type: 'control',
        id: 'all-controls',
        details: { domain: 'all' }
      }
    });

    this.addMetric({
      name: 'SOC2 Compliance',
      description: 'SOC2 compliance percentage',
      category: 'compliance',
      value: 92,
      target: 95,
      unit: '%',
      trend: 'improving',
      status: 'on-track',
      kpi: true,
      owner: 'Compliance Manager',
      drillDown: {
        type: 'compliance',
        id: 'soc2',
        details: { framework: 'SOC2' }
      }
    });

    this.addMetric({
      name: 'ISO27001 Compliance',
      description: 'ISO27001 compliance percentage',
      category: 'compliance',
      value: 88,
      target: 90,
      unit: '%',
      trend: 'stable',
      status: 'at-risk',
      kpi: true,
      owner: 'Compliance Manager',
      drillDown: {
        type: 'compliance',
        id: 'iso27001',
        details: { framework: 'ISO27001' }
      }
    });

    // Risk Metrics
    this.addMetric({
      name: 'Risk Score',
      description: 'Overall security risk score',
      category: 'risk',
      value: 65,
      target: 50,
      unit: 'score',
      trend: 'declining',
      status: 'critical',
      kpi: true,
      owner: 'Risk Manager',
      drillDown: {
        type: 'domain',
        id: 'risk',
        details: { category: 'all' }
      }
    });

    this.addMetric({
      name: 'High-Risk Items',
      description: 'Number of high-risk security items',
      category: 'risk',
      value: 12,
      target: 5,
      unit: 'count',
      trend: 'stable',
      status: 'critical',
      kpi: true,
      owner: 'Risk Manager',
      drillDown: {
        type: 'incident',
        id: 'high-risk',
        details: { severity: 'high' }
      }
    });

    // Incident Metrics
    this.addMetric({
      name: 'Open Incidents',
      description: 'Number of open security incidents',
      category: 'incidents',
      value: 3,
      target: 2,
      unit: 'count',
      trend: 'improving',
      status: 'on-track',
      kpi: true,
      owner: 'Security Operations',
      drillDown: {
        type: 'incident',
        id: 'open',
        details: { status: 'open' }
      }
    });

    this.addMetric({
      name: 'Mean Time to Resolution',
      description: 'Average time to resolve security incidents',
      category: 'incidents',
      value: 24,
      target: 48,
      unit: 'hours',
      trend: 'improving',
      status: 'on-track',
      kpi: false,
      owner: 'Security Operations',
      drillDown: {
        type: 'incident',
        id: 'mttr',
        details: { metric: 'resolution_time' }
      }
    });

    // Control Metrics
    this.addMetric({
      name: 'Control Coverage',
      description: 'Percentage of security controls implemented',
      category: 'controls',
      value: 85,
      target: 90,
      unit: '%',
      trend: 'improving',
      status: 'at-risk',
      kpi: true,
      owner: 'Security Engineering',
      drillDown: {
        type: 'control',
        id: 'coverage',
        details: { status: 'implemented' }
      }
    });

    this.addMetric({
      name: 'Control Effectiveness',
      description: 'Effectiveness of implemented security controls',
      category: 'controls',
      value: 92,
      target: 95,
      unit: '%',
      trend: 'stable',
      status: 'on-track',
      kpi: true,
      owner: 'Security Engineering',
      drillDown: {
        type: 'control',
        id: 'effectiveness',
        details: { metric: 'effectiveness' }
      }
    });

    // Performance Metrics
    this.addMetric({
      name: 'System Uptime',
      description: 'Security system uptime percentage',
      category: 'performance',
      value: 99.9,
      target: 99.5,
      unit: '%',
      trend: 'stable',
      status: 'on-track',
      kpi: false,
      owner: 'Infrastructure',
      drillDown: {
        type: 'domain',
        id: 'infrastructure',
        details: { metric: 'uptime' }
      }
    });

    this.addMetric({
      name: 'Response Time',
      description: 'Average security system response time',
      category: 'performance',
      value: 150,
      target: 200,
      unit: 'ms',
      trend: 'improving',
      status: 'on-track',
      kpi: false,
      owner: 'Infrastructure',
      drillDown: {
        type: 'domain',
        id: 'performance',
        details: { metric: 'response_time' }
      }
    });
  }

  private getWidgetData(widgetType: string, widgetId: string): any {
    switch (widgetId) {
      case 'overall-score':
        return this.metrics.get('metric_compliance_' + this.findMetricIdByName('Overall Security Score'));
      
      case 'compliance-rate':
        return this.metrics.get('metric_compliance_' + this.findMetricIdByName('SOC2 Compliance'));
      
      case 'risk-level':
        return this.metrics.get('metric_risk_' + this.findMetricIdByName('Risk Score'));
      
      case 'compliance-trend':
        return this.generateComplianceTrendData();
      
      case 'framework-compliance':
        return this.generateFrameworkComplianceData();
      
      case 'risk-distribution':
        return this.generateRiskDistributionData();
      
      case 'risk-trend':
        return this.generateRiskTrendData();
      
      case 'incident-trend':
        return this.generateIncidentTrendData();
      
      case 'incident-severity':
        return this.generateIncidentSeverityData();
      
      case 'active-alerts':
        return this.generateActiveAlertsData();
      
      default:
        return {};
    }
  }

  private findMetricIdByName(name: string): string {
    for (const [id, metric] of this.metrics.entries()) {
      if (metric.name === name) {
        return id.split('_').pop() || '';
      }
    }
    return '';
  }

  private calculateOverallScore(metrics: ExecutiveMetric[]): number {
    const kpiMetrics = metrics.filter(m => m.kpi);
    if (kpiMetrics.length === 0) return 0;
    
    const totalScore = kpiMetrics.reduce((sum, metric) => {
      const score = (metric.value / metric.target) * 100;
      return sum + Math.min(score, 100);
    }, 0);
    
    return totalScore / kpiMetrics.length;
  }

  private groupMetricsByCategory(metrics: ExecutiveMetric[]): Record<MetricCategory, ExecutiveMetric[]> {
    const grouped: Record<string, ExecutiveMetric[]> = {};
    
    metrics.forEach(metric => {
      if (!grouped[metric.category]) {
        grouped[metric.category] = [];
      }
      grouped[metric.category].push(metric);
    });
    
    return grouped as Record<MetricCategory, ExecutiveMetric[]>;
  }

  private generateTrends(metrics: ExecutiveMetric[]): Record<string, 'improving' | 'stable' | 'declining'> {
    const trends: Record<string, any> = {};
    
    metrics.forEach(metric => {
      trends[metric.id] = metric.trend;
    });
    
    return trends;
  }

  private generateMetricAlerts(metrics: ExecutiveMetric[]): any[] {
    const alerts = [];
    
    metrics.forEach(metric => {
      if (metric.status === 'critical') {
        alerts.push({
          id: `alert_${metric.id}`,
          metric: metric.name,
          severity: 'critical',
          message: `${metric.name} is critical: ${metric.value}${metric.unit} (target: ${metric.target}${metric.unit})`,
          timestamp: metric.lastUpdated
        });
      } else if (metric.status === 'at-risk') {
        alerts.push({
          id: `alert_${metric.id}`,
          metric: metric.name,
          severity: 'warning',
          message: `${metric.name} is at risk: ${metric.value}${metric.unit} (target: ${metric.target}${metric.unit})`,
          timestamp: metric.lastUpdated
        });
      }
    });
    
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private updateMetricTrend(metric: ExecutiveMetric): void {
    if (metric.historical.length < 2) {
      metric.trend = 'stable';
      return;
    }
    
    const recent = metric.historical.slice(-7); // Last 7 data points
    const older = metric.historical.slice(-14, -7); // Previous 7 data points
    
    if (older.length === 0) {
      metric.trend = 'stable';
      return;
    }
    
    const recentAvg = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.value, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.05) {
      metric.trend = 'improving';
    } else if (change < -0.05) {
      metric.trend = 'declining';
    } else {
      metric.trend = 'stable';
    }
  }

  private updateMetricStatus(metric: ExecutiveMetric): void {
    const percentage = (metric.value / metric.target) * 100;
    
    if (percentage >= 100) {
      metric.status = 'on-track';
    } else if (percentage >= 85) {
      metric.status = 'at-risk';
    } else {
      metric.status = 'critical';
    }
  }

  private generateComplianceTrendData(): any {
    const days = 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      data.push({
        date: date.toISOString().split('T')[0],
        value: 85 + Math.random() * 10 // Simulated data
      });
    }
    
    return data;
  }

  private generateFrameworkComplianceData(): any {
    return [
      { framework: 'SOC2', value: 92 },
      { framework: 'ISO27001', value: 88 },
      { framework: 'NIST-CSF', value: 85 },
      { framework: 'PCI-DSS', value: 90 }
    ];
  }

  private generateRiskDistributionData(): any {
    return [
      { category: 'Strategic', value: 25 },
      { category: 'Operational', value: 35 },
      { category: 'Compliance', value: 20 },
      { category: 'Technology', value: 20 }
    ];
  }

  private generateRiskTrendData(): any {
    const days = 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      data.push({
        date: date.toISOString().split('T')[0],
        value: 60 + Math.random() * 15 // Simulated data
      });
    }
    
    return data;
  }

  private generateIncidentTrendData(): any {
    const days = 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 5) // Simulated data
      });
    }
    
    return data;
  }

  private generateIncidentSeverityData(): any {
    return [
      { severity: 'Critical', value: 0 },
      { severity: 'High', value: 1 },
      { severity: 'Medium', value: 2 },
      { severity: 'Low', value: 3 }
    ];
  }

  private generateActiveAlertsData(): any {
    return this.generateMetricAlerts(Array.from(this.metrics.values())).slice(0, 10);
  }
}

// Export singleton instance
export const executiveDashboard = new ExecutiveDashboardManager();

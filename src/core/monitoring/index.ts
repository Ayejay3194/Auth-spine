/**
 * Core Monitoring Module
 * Optimized, performance-focused monitoring system
 */

// Simple event emitter implementation
interface EventListener {
  (event: string, ...args: any[]): void;
}

class SimpleEventEmitter {
  private listeners = new Map<string, EventListener[]>();

  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event, ...args));
    }
  }

  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}

// Enhanced type definitions
export interface MonitoringConfig {
  enabled: boolean;
  debug?: boolean;
  flushInterval?: number;
  bufferSize?: number;
  retentionPeriod?: number;
  metricsPrefix?: string;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  unit?: string;
  type?: 'counter' | 'gauge' | 'histogram' | 'summary';
}

export interface AlertConfig {
  name: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  enabled: boolean;
  cooldown?: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message?: string;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network?: {
    latency?: number;
    throughput?: number;
    errorRate?: number;
  };
  custom?: Record<string, number>;
}

// Enhanced error types
export class MonitoringError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MonitoringError';
  }
}

export class MetricError extends MonitoringError {
  constructor(message: string, code: string = 'METRIC_ERROR') {
    super(message, code, 500);
  }
}

export class AlertError extends MonitoringError {
  constructor(message: string, code: string = 'ALERT_ERROR') {
    super(message, code, 500);
  }
}

// Performance-optimized metrics collector
export class MetricsCollector extends SimpleEventEmitter {
  private metrics = new Map<string, MetricData[]>();
  private alerts = new Map<string, AlertConfig>();
  private healthChecks = new Map<string, HealthCheck>();
  private config: MonitoringConfig;
  private buffer: MetricData[] = [];
  private flushTimer?: number;

  constructor(config: MonitoringConfig) {
    super();
    this.config = {
      enabled: true,
      flushInterval: 60000, // 1 minute
      bufferSize: 1000,
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      metricsPrefix: 'app',
      ...config
    };
    
    if (this.config.enabled) {
      this.startFlushTimer();
      this.startCleanup();
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setTimeout(() => {
      this.flush();
      this.startFlushTimer();
    }, this.config.flushInterval);
  }

  private startCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // 1 minute
  }

  private cleanup(): void {
    const now = new Date();
    const retentionMs = this.config.retentionPeriod;
    
    // Clean old metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(metric => 
        (now.getTime() - metric.timestamp.getTime()) < retentionMs
      );
      this.metrics.set(name, filtered);
    }

    // Clean old alerts
    for (const [name, alert] of this.alerts.entries()) {
      if (!alert.enabled) {
        this.alerts.delete(name);
      }
    }
  }

  record(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    if (!this.config.enabled) return;

    const metric: MetricData = {
      name: this.config.metricsPrefix ? `${this.config.metricsPrefix}.${name}` : name,
      value,
      timestamp: new Date(),
      tags,
      unit,
      type: 'counter'
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(metric);
    this.buffer.push(metric);

    // Check for alerts
    this.checkAlerts(name, value);

    // Emit event
    this.emit('metric', { name, value, tags, unit });

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  recordGauge(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    const gaugeMetric: MetricData = {
      name: this.config.metricsPrefix ? `${this.config.metricsPrefix}.${name}` : name,
      value,
      timestamp: new Date(),
      tags,
      unit,
      type: 'gauge'
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(gaugeMetric);
    this.buffer.push(gaugeMetric);

    // Check for alerts
    this.checkAlerts(name, value);

    // Emit event
    this.emit('gauge', { name, value, tags, unit });

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  recordHistogram(name: string, value: number, buckets?: number[]): void {
    const histogramMetric: MetricData = {
      name: this.config.metricsPrefix ? `${this.config.metricsPrefix}.${name}` : name,
      value,
      timestamp: new Date(),
      type: 'histogram'
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(histogramMetric);
    this.buffer.push(histogramMetric);

    // Emit event
    this.emit('histogram', { name, value });

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  increment(name: string, value: number = 1): void {
    const current = this.getCounter(name);
    this.record(name, current + value);
  }

  getCounter(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;
    
    const counterMetrics = metrics.filter(m => m.type === 'counter');
    return counterMetrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  getGauge(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;
    
    const gaugeMetrics = metrics.filter(m => m.type === 'gauge');
    return gaugeMetrics[gaugeMetrics.length - 1]?.value || 0;
  }

  getHistogram(name: string): { buckets: number[], count: number } {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return { buckets: [], count: 0 };
    
    const histogramMetrics = metrics.filter(m => m.type === 'histogram');
    return {
      buckets: histogramMetrics.map(m => m.value),
      count: histogramMetrics.length
    };
  }

  setAlert(name: string, config: AlertConfig): void {
    this.alerts.set(name, config);
    this.emit('alertConfigChanged', { name, config });
  }

  removeAlert(name: string): void {
    this.alerts.delete(name);
    this.emit('alertRemoved', { name });
  }

  checkAlerts(name: string, value: number): void {
    const alert = this.alerts.get(name);
    if (!alert || !alert.enabled) return;

    const triggered = this.evaluateAlertCondition(alert, value);
    if (triggered) {
      this.emit('alert', {
        name: alert.name,
        value,
        threshold: alert.threshold,
        operator: alert.operator,
        severity: alert.severity,
        message: alert.message || `Alert triggered for ${name}: ${value} ${alert.operator} ${alert.threshold}`
      });
    }
  }

  private evaluateAlertCondition(alert: AlertConfig, value: number): boolean {
    switch (alert.operator) {
      case 'gt': return value > alert.threshold;
      case 'lt': return value < alert.threshold;
      case 'eq': return value === alert.threshold;
      case 'ne': return value !== alert.threshold;
      default: return false;
    }
  }

  addHealthCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.healthChecks.set(name, {
      name,
      status: 'unknown',
      lastCheck: new Date(),
      responseTime: undefined,
      details: {}
    });

    // Perform health check
    check()
      .then(result => {
        this.healthChecks.set(name, {
          name,
          status: result.status || 'healthy',
          lastCheck: new Date(),
          responseTime: result.responseTime,
          details: result.details || {}
        });
        this.emit('healthCheck', { name, status: result.status || 'healthy' });
      })
      .catch(error => {
        this.healthChecks.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          details: { error: error.message }
        });
        this.emit('healthCheck', { name, status: 'unhealthy' });
      });
  }

  getHealthStatus(): Record<string, HealthCheck> {
    const status: Record<string, HealthCheck> = {};
    for (const [name, healthCheck] of this.healthChecks.entries()) {
      status[name] = healthCheck;
    }
    return status;
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    const metricsToFlush = [...this.buffer];
    this.buffer = [];

    // In production, this would send to a metrics backend
    if (this.config.debug) {
      console.log(`[MetricsCollector] Flushing ${metricsToFlush.length} metrics`);
    }

    // Clear flushed metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const remaining = metrics.filter(metric => 
        (new Date().getTime() - metric.timestamp.getTime()) < this.config.retentionPeriod
      );
      this.metrics.set(name, remaining);
    }

    this.emit('flush', { count: metricsToFlush.length });
  }

  getAllMetrics(): Record<string, MetricData[]> {
    const allMetrics: Record<string, MetricData[]> = {};
    for (const [name, metrics] of this.metrics.entries()) {
      allMetrics[name] = metrics;
    }
    return allMetrics;
  }

  getMetrics(name: string): MetricData[] {
    return this.metrics.get(name) || [];
  }

  clear(): void {
    this.metrics.clear();
    this.alerts.clear();
    this.healthChecks.clear();
    this.buffer = [];
    this.emit('cleared');
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return this.config.enabled;
  }
}

// Performance profiler
export class PerformanceProfiler extends SimpleEventEmitter {
  private metrics = new Map<string, number[]>();
  private startTime: number;
  private measurements: Array<{ name: string; duration: number; timestamp: number }> = [];

  constructor() {
    super();
    this.startTime = Date.now();
  }

  start(name: string): void {
    this.metrics.set(name, []);
    this.measurements.push({ name, duration: 0, timestamp: Date.now() });
  }

  end(name: string): void {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return;

    const lastMeasurement = measurements[measurements.length - 1];
    const duration = Date.now() - lastMeasurement.timestamp;
    lastMeasurement.duration = duration;
    
    this.emit('profile', { name, duration });
  }

  getMeasurements(name: string): number[] {
    return this.metrics.get(name) || [];
  }

  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const totalTime = measurements.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / measurements.length;
  }

  getAllMeasurements(): Array<{ name: string; duration: number; timestamp: number }> {
    return this.measurements;
  }

  clear(): void {
    this.metrics.clear();
    this.measurements = [];
    this.startTime = Date.now();
    this.emit('cleared');
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// Health checker
export class HealthChecker extends SimpleEventEmitter {
  private checks = new Map<string, () => Promise<HealthCheck>>();
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
  }

  addCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }

  removeCheck(name: string): void {
    this.checks.delete(name);
  }

  async runAllChecks(): Promise<Record<string, HealthCheck>> {
    const results: Record<string, HealthCheck> = {};
    
    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await check();
        results[name] = {
          name,
          status: result.status || 'healthy',
          lastCheck: new Date(),
          responseTime: result.responseTime,
          details: result.details || {}
        };
      } catch (error: any) {
        results[name] = {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          details: { error: error.message }
        };
      }
    }

    this.emit('healthCheckComplete', { results });
    return results;
  }

  getChecks(): string[] {
    return Array.from(this.checks.keys());
  }
}

// Factory functions
export function createMetricsCollector(config?: Partial<MonitoringConfig>): MetricsCollector {
  return new MetricsCollector({
    enabled: true,
    flushInterval: 60000, // 1 minute
    bufferSize: 1000,
    retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    metricsPrefix: 'app',
    ...config
  });
}

export function createPerformanceProfiler(): PerformanceProfiler {
  return new PerformanceProfiler();
}

export function createHealthChecker(config?: Partial<MonitoringConfig>): HealthChecker {
  return new HealthChecker(config || { enabled: true });
}

// Default configurations
export const defaultMonitoringConfig: MonitoringConfig = {
  enabled: true,
  flushInterval: 60000, // 1 minute
  bufferSize: 1000,
  retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
  metricsPrefix: 'app'
};

// Re-exports
export { MetricsCollector, PerformanceProfiler, HealthChecker };
export type { MonitoringConfig, MetricData, AlertConfig, HealthCheck, PerformanceMetrics };
export { createMetricsCollector, createPerformanceProfiler, createHealthChecker, defaultMonitoringConfig };

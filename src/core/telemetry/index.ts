/**
 * Core Telemetry Module
 * Optimized, performance-focused telemetry system
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
export interface TelemetryConfig {
  enabled: boolean;
  serviceName: string;
  serviceVersion: string;
  environment: string;
  sampling: number;
  exportInterval?: number;
  bufferSize?: number;
  exporters?: TelemetryExporter[];
}

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error';
  tags?: Record<string, string>;
  logs?: TelemetryLog[];
  events?: TelemetryEvent[];
}

export interface TelemetryLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  attributes?: Record<string, any>;
}

export interface TelemetryEvent {
  timestamp: number;
  name: string;
  attributes?: Record<string, any>;
}

export interface TelemetryMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram';
}

export interface TelemetryExporter {
  name: string;
  export(span: TelemetrySpan): Promise<void>;
  exportMetric(metric: TelemetryMetric): Promise<void>;
}

// Enhanced error types
export class TelemetryError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TelemetryError';
  }
}

export class SpanError extends TelemetryError {
  constructor(message: string, code: string = 'SPAN_ERROR') {
    super(message, code, 500);
  }
}

export class ExporterError extends TelemetryError {
  constructor(message: string, code: string = 'EXPORTER_ERROR') {
    super(message, code, 500);
  }
}

// Performance-optimized tracer
export class Tracer extends SimpleEventEmitter {
  private config: TelemetryConfig;
  private activeSpans = new Map<string, TelemetrySpan>();
  private finishedSpans: TelemetrySpan[] = [];
  private metrics: TelemetryMetric[] = [];
  private exportTimer?: number;

  constructor(serviceName: string, config: Partial<TelemetryConfig> = {}) {
    super();
    this.config = {
      enabled: true,
      serviceName,
      serviceVersion: '1.0.0',
      environment: 'development',
      sampling: 1.0,
      exportInterval: 30000, // 30 seconds
      bufferSize: 1000,
      exporters: [],
      ...config
    };
    
    if (this.config.enabled) {
      this.startExportTimer();
    }
  }

  private startExportTimer(): void {
    if (this.exportTimer) {
      clearInterval(this.exportTimer);
    }
    
    this.exportTimer = setTimeout(() => {
      this.export();
      this.startExportTimer();
    }, this.config.exportInterval);
  }

  private generateTraceId(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateSpanId(): string {
    return Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampling;
  }

  startSpan(operationName: string, parentSpanId?: string): TelemetrySpan {
    if (!this.config.enabled || !this.shouldSample()) {
      // Return a no-op span
      return this.createNoOpSpan(operationName);
    }

    const span: TelemetrySpan = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId,
      operationName,
      startTime: Date.now(),
      status: 'ok',
      tags: {
        'service.name': this.config.serviceName,
        'service.version': this.config.serviceVersion,
        'environment': this.config.environment
      },
      logs: [],
      events: []
    };

    this.activeSpans.set(span.spanId, span);
    this.emit('spanStarted', span);
    
    return span;
  }

  finishSpan(span: TelemetrySpan, status: 'ok' | 'error' = 'ok'): void {
    if (!this.config.enabled) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.activeSpans.delete(span.spanId);
    this.finishedSpans.push(span);

    // Auto-export if buffer is full
    if (this.finishedSpans.length >= (this.config.bufferSize || 1000)) {
      this.export();
    }

    this.emit('spanFinished', span);
  }

  setTag(span: TelemetrySpan, key: string, value: string): void {
    if (!span.tags) span.tags = {};
    span.tags[key] = value;
  }

  addLog(span: TelemetrySpan, level: 'debug' | 'info' | 'warn' | 'error', message: string, attributes?: Record<string, any>): void {
    if (!span.logs) span.logs = [];
    span.logs.push({
      timestamp: Date.now(),
      level,
      message,
      attributes
    });
  }

  addEvent(span: TelemetrySpan, name: string, attributes?: Record<string, any>): void {
    if (!span.events) span.events = [];
    span.events.push({
      timestamp: Date.now(),
      name,
      attributes
    });
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>, type: 'counter' | 'gauge' | 'histogram' = 'gauge'): void {
    if (!this.config.enabled) return;

    const metric: TelemetryMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags: {
        ...tags,
        'service.name': this.config.serviceName,
        'service.version': this.config.serviceVersion,
        'environment': this.config.environment
      },
      type
    };

    this.metrics.push(metric);

    // Auto-export if buffer is full
    if (this.metrics.length >= (this.config.bufferSize || 1000)) {
      this.export();
    }

    this.emit('metric', metric);
  }

  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.getCounter(name);
    this.recordMetric(name, current + value, tags, 'counter');
  }

  getCounter(name: string): number {
    const counterMetrics = this.metrics.filter(m => m.name === name && m.type === 'counter');
    return counterMetrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  getGauge(name: string): number {
    const gaugeMetrics = this.metrics.filter(m => m.name === name && m.type === 'gauge');
    return gaugeMetrics.length > 0 ? gaugeMetrics[gaugeMetrics.length - 1].value : 0;
  }

  getActiveSpan(): TelemetrySpan | null {
    const spans = Array.from(this.activeSpans.values());
    return spans.length > 0 ? spans[spans.length - 1] : null;
  }

  getActiveSpans(): TelemetrySpan[] {
    return Array.from(this.activeSpans.values());
  }

  getFinishedSpans(): TelemetrySpan[] {
    return this.finishedSpans;
  }

  getMetrics(): TelemetryMetric[] {
    return this.metrics;
  }

  private createNoOpSpan(operationName: string): TelemetrySpan {
    return {
      traceId: 'noop',
      spanId: 'noop',
      operationName,
      startTime: Date.now(),
      status: 'ok',
      logs: [],
      events: []
    };
  }

  private async export(): Promise<void> {
    if (!this.config.enabled) return;

    const spansToExport = [...this.finishedSpans];
    const metricsToExport = [...this.metrics];
    
    this.finishedSpans = [];
    this.metrics = [];

    // Export spans
    for (const span of spansToExport) {
      for (const exporter of this.config.exporters || []) {
        try {
          await exporter.export(span);
        } catch (error) {
          console.error(`[Tracer] Export error (${exporter.name}):`, error);
        }
      }
    }

    // Export metrics
    for (const metric of metricsToExport) {
      for (const exporter of this.config.exporters || []) {
        try {
          await exporter.exportMetric(metric);
        } catch (error) {
          console.error(`[Tracer] Metric export error (${exporter.name}):`, error);
        }
      }
    }

    this.emit('export', { spans: spansToExport.length, metrics: metricsToExport.length });
  }

  clear(): void {
    this.activeSpans.clear();
    this.finishedSpans = [];
    this.metrics = [];
    this.emit('cleared');
  }

  getConfig(): TelemetryConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return this.config.enabled;
  }

  async shutdown(): Promise<void> {
    console.log('[Tracer] Shutting down tracer...');
    
    if (this.exportTimer) {
      clearInterval(this.exportTimer);
    }
    
    await this.export();
    this.clear();
    this.config.enabled = false;
    
    console.log('[Tracer] Tracer shutdown complete');
  }
}

// Console exporter
export class ConsoleExporter implements TelemetryExporter {
  name = 'console';

  async export(span: TelemetrySpan): Promise<void> {
    console.log(`[TELEMETRY] Span: ${span.operationName}`, {
      traceId: span.traceId,
      spanId: span.spanId,
      duration: span.duration,
      status: span.status,
      tags: span.tags
    });
  }

  async exportMetric(metric: TelemetryMetric): Promise<void> {
    console.log(`[TELEMETRY] Metric: ${metric.name}`, {
      value: metric.value,
      type: metric.type,
      tags: metric.tags
    });
  }
}

// File exporter
export class FileExporter implements TelemetryExporter {
  name = 'file';
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async export(span: TelemetrySpan): Promise<void> {
    // In production, this would write to a file
    console.log(`[TELEMETRY:FILE:${this.filePath}] Span: ${span.operationName}`, span);
  }

  async exportMetric(metric: TelemetryMetric): Promise<void> {
    // In production, this would write to a file
    console.log(`[TELEMETRY:FILE:${this.filePath}] Metric: ${metric.name}`, metric);
  }
}

// Remote exporter
export class RemoteExporter implements TelemetryExporter {
  name = 'remote';
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async export(span: TelemetrySpan): Promise<void> {
    // In production, this would send to remote endpoint
    console.log(`[TELEMETRY:REMOTE:${this.endpoint}] Span: ${span.operationName}`, span);
  }

  async exportMetric(metric: TelemetryMetric): Promise<void> {
    // In production, this would send to remote endpoint
    console.log(`[TELEMETRY:REMOTE:${this.endpoint}] Metric: ${metric.name}`, metric);
  }
}

// Factory functions
export function createTracer(serviceName: string, config?: Partial<TelemetryConfig>): Tracer {
  return new Tracer(serviceName, config);
}

export function createConsoleTracer(serviceName: string): Tracer {
  const tracer = new Tracer(serviceName);
  tracer.addExporter(new ConsoleExporter());
  return tracer;
}

export function createFileTracer(serviceName: string, filePath: string): Tracer {
  const tracer = new Tracer(serviceName);
  tracer.addExporter(new FileExporter(filePath));
  return tracer;
}

export function createRemoteTracer(serviceName: string, endpoint: string): Tracer {
  const tracer = new Tracer(serviceName);
  tracer.addExporter(new RemoteExporter(endpoint));
  return tracer;
}

// Default configurations
export const defaultTelemetryConfig: TelemetryConfig = {
  enabled: true,
  serviceName: 'auth-spine',
  serviceVersion: '1.0.0',
  environment: 'development',
  sampling: 1.0,
  exportInterval: 30000,
  bufferSize: 1000
};

// Re-exports
export { Tracer, ConsoleExporter, FileExporter, RemoteExporter };
export type { TelemetryConfig, TelemetrySpan, TelemetryLog, TelemetryEvent, TelemetryMetric, TelemetryExporter };
export { createTracer, createConsoleTracer, createFileTracer, createRemoteTracer, defaultTelemetryConfig };

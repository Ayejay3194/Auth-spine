export namespace opentelemetry {
  export interface SpanOptions {
    name: string;
    kind?: SpanKind;
    parent?: Span | SpanContext;
    attributes?: Attributes;
    links?: Link[];
    startTime?: hrTime.HrTime;
    status?: SpanStatus;
  }

  export interface SpanContext {
    traceId: string;
    spanId: string;
    traceFlags: number;
    isRemote?: boolean;
  }

  export interface Span {
    spanContext(): SpanContext;
    setAttribute(key: string, value: AttributeValue): Span;
    setAttributes(attributes: Attributes): Span;
    addEvent(name: string, attributes?: Attributes, startTime?: hrTime.HrTime): Span;
    addLink(link: Link): Span;
    setStatus(status: SpanStatus): Span;
    updateName(name: string): Span;
    end(endTime?: hrTime.HrTime): void;
    isRecording(): boolean;
    recordException(exception: Exception, time?: hrTime.HrTime): void;
    spanName?: string;
  }

  export interface Link {
    context: SpanContext;
    attributes?: Attributes;
  }

  export interface SpanStatus {
    code: StatusCode;
    message?: string;
  }

  export interface Exception {
    error?: Error;
    message?: string;
    name?: string;
    stack?: string;
    type?: string;
    code?: number | string;
  }

  export type SpanKind = 'INTERNAL' | 'SERVER' | 'CLIENT' | 'PRODUCER' | 'CONSUMER';

  export type StatusCode = 'UNSET' | 'OK' | 'ERROR';

  export type AttributeValue = string | number | boolean | string[] | number[] | boolean[] | null;

  export interface Attributes {
    [key: string]: AttributeValue;
  }

  export interface TracerOptions {
    name?: string;
    version?: string;
    schemaUrl?: string;
  }

  export interface Tracer {
    startSpan(name: string, options?: SpanOptions, context?: Context): Span;
    startActiveSpan(name: string, options?: SpanOptions, context?: Context): Span;
    withActiveSpan<T>(span: Span, fn: (span: Span) => T): T;
  }

  export interface Context {
    getValue(key: symbol): any;
    setValue(key: symbol, value: any): Context;
    deleteValue(key: symbol): Context;
    with<T>(fn: (context: Context) => T): T;
  }

  export interface TraceState {
    set(key: string, value: string): TraceState;
    get(key: string): string | undefined;
    delete(key: string): TraceState;
    serialize(): string;
    parse(traceState: string): TraceState;
  }

  export interface Resource {
    attributes: Attributes;
    merge(other: Resource): Resource;
    getAttributes(): Attributes;
    getAttribute(key: string): AttributeValue | undefined;
  }

  export interface InstrumentationLibrary {
    name: string;
    version: string;
    schemaUrl?: string;
  }

  export interface LoggerOptions {
    name?: string;
    version?: string;
    schemaUrl?: string;
    includeTraceContext?: boolean;
    includeSeverity?: boolean;
    includeTimestamp?: boolean;
    severity?: SeverityNumber;
  }

  export interface Logger {
    emit(severity: SeverityNumber, message: string, attributes?: Attributes, context?: Context): void;
    trace(message: string, attributes?: Attributes, context?: Context): void;
    debug(message: string, attributes?: Attributes, context?: Context): void;
    info(message: string, attributes?: Attributes, context?: Context): void;
    warn(message: string, attributes?: Attributes, context?: Context): void;
    error(message: string, attributes?: Attributes, context?: Context): void;
    fatal(message: string, attributes?: Attributes, context?: Context): void;
  }

  export type SeverityNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

  export interface MetricOptions {
    name: string;
    description?: string;
    unit?: string;
    type?: MetricType;
    valueType?: ValueType;
  }

  export type MetricType = 'COUNTER' | 'GAUGE' | 'HISTOGRAM' | 'UPDOWN_COUNTER' | 'OBSERVABLE_COUNTER' | 'OBSERVABLE_GAUGE' | 'OBSERVABLE_UPDOWN_COUNTER';

  export type ValueType = 'DOUBLE' | 'INT' | 'LONG';

  export interface Metric {
    record(value: number, attributes?: Attributes, context?: Context): void;
  }

  export interface Histogram extends Metric {
    record(value: number, attributes?: Attributes, context?: Context): void;
  }

  export interface Counter extends Metric {
    add(value: number, attributes?: Attributes, context?: Context): void;
  }

  export interface UpDownCounter extends Metric {
    add(value: number, attributes?: Attributes, context?: Context): void;
  }

  export interface ObservableMetric {
    observe(callback: (result: ObservableResult) => void): void;
  }

  export interface ObservableResult {
    record(value: number, attributes?: Attributes): void;
  }

  export interface BatchSpanProcessorOptions {
    maxExportBatchSize?: number;
    maxTimeout?: number;
    exportTimeoutMillis?: number;
    scheduledDelayMillis?: number;
  }

  export interface SpanExporter {
    export(spans: Span[], resultCallback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
    forceFlush(): Promise<void>;
  }

  export interface ExportResult {
    code: ExportResultCode;
    error?: Error;
  }

  export type ExportResultCode = 'SUCCESS' | 'FAILED' | 'TIMEOUT';

  export namespace hrTime {
    export type HrTime = [number, number];

    export function now(): HrTime {
      return [Date.now() * 1000 + Math.floor(Math.random() * 1000), 0];
    }

    export function subtract(a: HrTime, b: HrTime): HrTime {
      const aMs = a[0] / 1000000 + a[1] / 1000000000000;
      const bMs = b[0] / 1000000 + b[1] / 1000000000000;
      const diffMs = aMs - bMs;
      const seconds = Math.floor(diffMs);
      const nanos = Math.floor((diffMs - seconds) * 1000000000);
      return [seconds, nanos];
    }

    export function toMilliseconds(hrTime: HrTime): number {
      return hrTime[0] / 1000000 + hrTime[1] / 1000000000000;
    }

    export function toHrTime(milliseconds: number): HrTime {
      const seconds = Math.floor(milliseconds / 1000);
      const nanos = Math.floor((milliseconds % 1000) * 1000000);
      return [seconds, nanos];
    }
  }

  export class SpanImpl implements Span {
    private name: string;
    private kind: SpanKind;
    private context: SpanContext;
    private attributes: Attributes = {};
    private events: Array<{ name: string; attributes?: Attributes; time: hrTime.HrTime }> = [];
    private links: Link[] = [];
    private startTime: hrTime.HrTime;
    private endTime?: hrTime.HrTime;
    private status: SpanStatus = { code: 'UNSET' };
    private ended = false;

    // Add name property for external access
    public spanName: string;

    constructor(name: string, kind: SpanKind = 'INTERNAL', parent?: Span | SpanContext) {
      this.name = name;
      this.spanName = name;
      this.kind = kind;
      this.startTime = hrTime.now();
      
      if (parent && 'spanContext' in parent) {
        this.context = parent.spanContext();
      } else if (parent) {
        this.context = parent as SpanContext;
      } else {
        this.context = {
          traceId: this.generateTraceId(),
          spanId: this.generateSpanId(),
          traceFlags: 0
        };
      }
    }

    spanContext(): SpanContext {
      return this.context;
    }

    setAttribute(key: string, value: AttributeValue): Span {
      this.attributes[key] = value;
      return this;
    }

    setAttributes(attributes: Attributes): Span {
      Object.assign(this.attributes, attributes);
      return this;
    }

    addEvent(name: string, attributes?: Attributes, startTime?: hrTime.HrTime): Span {
      this.events.push({
        name,
        attributes,
        time: startTime || hrTime.now()
      });
      return this;
    }

    addLink(link: Link): Span {
      this.links.push(link);
      return this;
    }

    setStatus(status: SpanStatus): Span {
      this.status = status;
      return this;
    }

    updateName(name: string): Span {
      this.name = name;
      return this;
    }

    end(endTime?: hrTime.HrTime): void {
      if (this.ended) return;
      
      this.endTime = endTime || hrTime.now();
      this.ended = true;
    }

    isRecording(): boolean {
      return !this.ended;
    }

    recordException(exception: Exception, time?: hrTime.HrTime): void {
      const error = exception.error || new Error(exception.message || 'Unknown error');
      
      this.addEvent('exception', {
        'exception.type': exception.type || error.constructor.name,
        'exception.message': exception.message || error.message,
        'exception.stacktrace': exception.stack || error.stack
      }, time);
    }

    private generateTraceId(): string {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    private generateSpanId(): string {
      return Math.random().toString(36).substring(2, 10);
    }
  }

  export class TracerImpl implements Tracer {
    private name: string;
    private version?: string;
    private schemaUrl?: string;

    constructor(options: TracerOptions = {}) {
      this.name = options.name || 'default';
      this.version = options.version;
      this.schemaUrl = options.schemaUrl;
    }

    startSpan(name: string, options?: SpanOptions, context?: Context): Span {
      const span = new SpanImpl(
        name,
        options?.kind || 'INTERNAL',
        options?.parent
      );

      if (options?.attributes) {
        span.setAttributes(options.attributes);
      }

      if (options?.links) {
        for (const link of options.links) {
          span.addLink(link);
        }
      }

      if (options?.status) {
        span.setStatus(options.status);
      }

      return span;
    }

    startActiveSpan(name: string, options?: SpanOptions, context?: Context): Span {
      return this.startSpan(name, options, context);
    }

    withActiveSpan<T>(span: Span, fn: (span: Span) => T): T {
      return fn(span);
    }
  }

  export class ContextImpl implements Context {
    private values: Map<symbol, any> = new Map();

    getValue(key: symbol): any {
      return this.values.get(key);
    }

    setValue(key: symbol, value: any): Context {
      const newContext = new ContextImpl();
      newContext.values = new Map(this.values);
      newContext.values.set(key, value);
      return newContext;
    }

    deleteValue(key: symbol): Context {
      const newContext = new ContextImpl();
      newContext.values = new Map(this.values);
      newContext.values.delete(key);
      return newContext;
    }

    with<T>(fn: (context: Context) => T): T {
      return fn(this);
    }
  }

  export class TraceStateImpl implements TraceState {
    private entries: Map<string, string> = new Map();

    set(key: string, value: string): TraceState {
      const newState = new TraceStateImpl();
      newState.entries = new Map(this.entries);
      newState.entries.set(key, value);
      return newState;
    }

    get(key: string): string | undefined {
      return this.entries.get(key);
    }

    delete(key: string): TraceState {
      const newState = new TraceStateImpl();
      newState.entries = new Map(this.entries);
      newState.entries.delete(key);
      return newState;
    }

    serialize(): string {
      const pairs: string[] = [];
      for (const [key, value] of this.entries) {
        pairs.push(`${key}=${value}`);
      }
      return pairs.join(',');
    }

    parse(traceState: string): TraceState {
      const newState = new TraceStateImpl();
      const pairs = traceState.split(',');
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          newState.entries.set(key, value);
        }
      }
      
      return newState;
    }
  }

  export class ResourceImpl implements Resource {
    constructor(public attributes: Attributes = {}) {}

    merge(other: Resource): Resource {
      return new ResourceImpl({
        ...this.attributes,
        ...other.attributes
      });
    }

    getAttributes(): Attributes {
      return { ...this.attributes };
    }

    getAttribute(key: string): AttributeValue | undefined {
      return this.attributes[key];
    }
  }

  export class LoggerImpl implements Logger {
    private name: string;
    private version?: string;
    private schemaUrl?: string;
    private options: LoggerOptions;

    constructor(options: LoggerOptions = {}) {
      this.name = options.name || 'default';
      this.version = options.version;
      this.schemaUrl = options.schemaUrl;
      this.options = options;
    }

    emit(severity: SeverityNumber, message: string, attributes?: Attributes, context?: Context): void {
      const logEntry = {
        timestamp: Date.now(),
        severity,
        message,
        attributes: {
          ...attributes,
          'logger.name': this.name,
          'logger.version': this.version,
          'logger.schema_url': this.schemaUrl
        }
      };

      console.log(`[LOG] ${severity}: ${message}`, logEntry);
    }

    trace(message: string, attributes?: Attributes, context?: Context): void {
      this.emit(5 as SeverityNumber, message, attributes, context);
    }

    debug(message: string, attributes?: Attributes, context?: Context): void {
      this.emit(9 as SeverityNumber, message, attributes, context);
    }

    info(message: string, attributes?: Attributes, context?: Context): void {
      this.emit(13 as SeverityNumber, message, attributes, context);
    }

    warn(message: string, attributes?: Attributes, context?: Context): void {
      this.emit(17 as SeverityNumber, message, attributes, context);
    }

    error(message: string, attributes?: Attributes, context?: Context): void {
      this.emit(21 as SeverityNumber, message, attributes, context);
    }

    fatal(message: string, attributes?: Attributes, context?: Context): void {
      this.emit(25 as SeverityNumber, message, attributes, context);
    }
  }

  export class MetricImpl implements Metric {
    private name: string;
    private description?: string;
    private unit?: string;

    constructor(options: MetricOptions) {
      this.name = options.name;
      this.description = options.description;
      this.unit = options.unit;
    }

    record(value: number, attributes?: Attributes, context?: Context): void {
      console.log(`[METRIC] ${this.name}: ${value}`, { attributes, unit: this.unit });
    }
  }

  export class HistogramImpl extends MetricImpl implements Histogram {
    record(value: number, attributes?: Attributes, context?: Context): void {
      super.record(value, attributes, context);
    }
  }

  export class CounterImpl extends MetricImpl implements Counter {
    private value = 0;

    add(value: number, attributes?: Attributes, context?: Context): void {
      this.value += value;
      super.record(this.value, attributes, context);
    }
  }

  export class UpDownCounterImpl extends MetricImpl implements UpDownCounter {
    private value = 0;

    add(value: number, attributes?: Attributes, context?: Context): void {
      this.value += value;
      super.record(this.value, attributes, context);
    }
  }

  // Global API
  export class API {
    private tracer: Tracer;
    private context: Context;
    private resource: Resource;
    private logger: Logger;

    constructor() {
      this.tracer = new TracerImpl();
      this.context = new ContextImpl();
      this.resource = new ResourceImpl();
      this.logger = new LoggerImpl();
    }

    getTracer(name?: string, version?: string, schemaUrl?: string): Tracer {
      return new TracerImpl({ name, version, schemaUrl });
    }

    getLogger(name?: string, version?: string, schemaUrl?: string, options?: LoggerOptions): Logger {
      return new LoggerImpl({ name, version, schemaUrl, ...options });
    }

    getMeter(name?: string, version?: string, schemaUrl?: string): MeterImpl {
      return new MeterImpl(name, version, schemaUrl);
    }

    getContext(): Context {
      return this.context;
    }

    setContext(context: Context): void {
      this.context = context;
    }

    getResource(): Resource {
      return this.resource;
    }

    setResource(resource: Resource): void {
      this.resource = resource;
    }
  }

  export class MeterImpl {
    private name?: string;
    private version?: string;
    private schemaUrl?: string;

    constructor(name?: string, version?: string, schemaUrl?: string) {
      this.name = name;
      this.version = version;
      this.schemaUrl = schemaUrl;
    }

    createHistogram(name: string, options?: Omit<MetricOptions, 'name' | 'type'>): Histogram {
      return new HistogramImpl({ name, type: 'HISTOGRAM', ...options });
    }

    createCounter(name: string, options?: Omit<MetricOptions, 'name' | 'type'>): Counter {
      return new CounterImpl({ name, type: 'COUNTER', ...options });
    }

    createUpDownCounter(name: string, options?: Omit<MetricOptions, 'name' | 'type'>): UpDownCounter {
      return new UpDownCounterImpl({ name, type: 'UPDOWN_COUNTER', ...options });
    }
  }

  // Global instance
  export const api = new API();

  // Utility functions
  export function trace<T>(fn: () => T, name?: string): T {
    const tracer = api.getTracer();
    const span = tracer.startSpan(name || fn.name || 'operation');
    
    try {
      const result = fn();
      span.setStatus({ code: 'OK' });
      return result;
    } catch (error) {
      span.setStatus({ code: 'ERROR', message: (error as Error).message });
      span.recordException({ error: error as Error });
      throw error;
    } finally {
      span.end();
    }
  }

  export function traceAsync<T>(fn: () => Promise<T>, name?: string): Promise<T> {
    const tracer = api.getTracer();
    const span = tracer.startSpan(name || fn.name || 'async_operation');
    
    return fn()
      .then(result => {
        span.setStatus({ code: 'OK' });
        return result;
      })
      .catch(error => {
        span.setStatus({ code: 'ERROR', message: (error as Error).message });
        span.recordException({ error: error as Error });
        throw error;
      })
      .finally(() => {
        span.end();
      });
  }

  export function createContext(key: symbol, value: any): Context {
    return new ContextImpl().setValue(key, value);
  }

  export function createResource(attributes: Attributes): Resource {
    return new ResourceImpl(attributes);
  }

  export function createSpanExporter(): SpanExporter {
    return new ConsoleSpanExporter();
  }

  export class ConsoleSpanExporter implements SpanExporter {
    export(spans: Span[], resultCallback: (result: ExportResult) => void): void {
      for (const span of spans) {
        const context = span.spanContext();
        console.log(`[SPAN] ${context.traceId}:${context.spanId} - ${span.spanName || 'unknown'}`);
      }
      resultCallback({ code: 'SUCCESS' });
    }

    async shutdown(): Promise<void> {
      console.log('[SPAN EXPORTER] Shutdown');
    }

    async forceFlush(): Promise<void> {
      console.log('[SPAN EXPORTER] Force flush');
    }
  }

  // Constants
  export const SpanKind = {
    INTERNAL: 'INTERNAL' as const,
    SERVER: 'SERVER' as const,
    CLIENT: 'CLIENT' as const,
    PRODUCER: 'PRODUCER' as const,
    CONSUMER: 'CONSUMER' as const
  };

  export const StatusCode = {
    UNSET: 'UNSET' as const,
    OK: 'OK' as const,
    ERROR: 'ERROR' as const
  };

  export const SeverityNumber = {
    TRACE: 5,
    DEBUG: 9,
    INFO: 13,
    WARN: 17,
    ERROR: 21,
    FATAL: 25
  };
}

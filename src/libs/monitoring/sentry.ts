export namespace sentry {
  export interface SentryOptions {
    dsn: string;
    debug?: boolean;
    environment?: string;
    release?: string;
    dist?: string;
    maxValueLength?: number;
    normalizeDepth?: number;
    normalizeMaxBreadth?: number;
    enabled?: boolean;
    sampleRate?: number;
    tracesSampleRate?: number;
    beforeSend?: (event: Event) => Event | null;
    beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
    integrations?: Integration[];
    ignoreErrors?: (string | RegExp | ((error: Error) => boolean))[];
    denyUrls?: (string | RegExp)[];
    allowUrls?: (string | RegExp)[];
    autoSessionTracking?: boolean;
    initialScope?: Scope;
    defaultIntegrations?: boolean;
    stackParser?: (stack: string, skipFirst?: number) => StackFrame[];
    transport?: Transport;
    transportOptions?: Record<string, any>;
  }

  export interface Event {
    event_id?: string;
    timestamp?: number;
    platform?: string;
    logger?: string;
    server_name?: string;
    release?: string;
    dist?: string;
    environment?: string;
    message?: Message;
    exception?: Exception;
    level?: Severity;
    culprit?: string;
    transaction?: string;
    type?: string;
    fingerprint?: string[];
    breadcrumbs?: Breadcrumb[];
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    contexts?: Record<string, Context>;
    user?: User;
    request?: RequestContext;
    sdk?: SdkInfo;
    modules?: Record<string, string>;
    debug_meta?: DebugMeta;
    [key: string]: any;
  }

  export interface Message {
    formatted?: string;
    message?: string;
    params?: any[];
  }

  export interface Exception {
    values?: ExceptionValue[];
  }

  export interface ExceptionValue {
    type?: string;
    value?: string;
    mechanism?: Mechanism;
    module?: string;
    stacktrace?: Stacktrace;
  }

  export interface Mechanism {
    type?: string;
    handled?: boolean;
    data?: Record<string, any>;
    meta?: Record<string, any>;
    description?: string;
    help_link?: string;
  }

  export interface Stacktrace {
    frames?: StackFrame[];
  }

  export interface StackFrame {
    filename?: string;
    function?: string;
    module?: string;
    lineno?: number;
    colno?: number;
    abs_path?: string;
    pre_context?: string[];
    post_context?: string[];
    in_app?: boolean;
    vars?: Record<string, any>;
    platform?: string;
    context_line?: string;
    image_addr?: string;
    instruction_addr?: string;
    symbol_addr?: string;
    package?: string;
    lang?: string;
  }

  export interface Breadcrumb {
    timestamp?: number;
    type?: string;
    category?: string;
    level?: Severity;
    message?: string;
    data?: Record<string, any>;
  }

  export interface User {
    id?: string | number;
    username?: string;
    email?: string;
    ip_address?: string;
    segment?: string;
    [key: string]: any;
  }

  export interface Context {
    [key: string]: any;
  }

  export interface RequestContext {
    url?: string;
    method?: string;
    data?: any;
    query_string?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    env?: Record<string, string>;
  }

  export interface SdkInfo {
    name?: string;
    version?: string;
    integrations?: string[];
    packages?: Array<{
      name: string;
      version: string;
    }>;
  }

  export interface DebugMeta {
    images?: DebugImage[];
  }

  export interface DebugImage {
    type?: string;
    debug_id?: string;
    code_file?: string;
    debug_file?: string;
    image_addr?: string;
    image_size?: number;
    image_vmaddr?: string;
    arch?: string;
    uuid?: string;
  }

  export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

  export interface Scope {
    user?: User;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    contexts?: Record<string, Context>;
    level?: Severity;
    fingerprint?: string[];
    breadcrumbs?: Breadcrumb[];
    transactionName?: string;
    span?: Span;
  }

  export interface Span {
    spanId: string;
    traceId: string;
    parentSpanId?: string;
    op?: string;
    description?: string;
    status?: string;
    tags?: Record<string, string>;
    data?: Record<string, any>;
    timestamp?: number;
    startTimestamp?: number;
    endTimestamp?: number;
  }

  export interface Integration {
    name: string;
    setupOnce?: (addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub) => void;
    processEvent?: (event: Event, hint?: EventHint) => Event | null;
  }

  export interface Transport {
    sendEvent?(event: Event): void;
    sendSession?(session: Session): void;
    close?(timeout?: number): Promise<boolean>;
    flush?(timeout?: number): Promise<boolean>;
  }

  export interface EventHint {
    originalException?: any;
    syntheticException?: Error;
    event?: Event;
    captureContext?: ScopeContext;
  }

  export interface ScopeContext {
    user?: User;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    contexts?: Record<string, Context>;
    level?: Severity;
    fingerprint?: string[];
    breadcrumbs?: Breadcrumb[];
    transactionName?: string;
  }

  export interface Session {
    sid?: string;
    init?: boolean;
    duration?: number;
    errors?: number;
    status?: 'ok' | 'crashed' | 'abnormal' | 'exited';
    started?: string;
    timestamp?: string;
    release?: string;
    environment?: string;
    user?: User;
    ip_address?: string;
    user_agent?: string;
  }

  export type EventProcessor = (event: Event, hint?: EventHint) => Event | null;

  export interface Hub {
    captureException(exception: any, hint?: EventHint): void;
    captureMessage(message: string, level?: Severity, hint?: EventHint): void;
    captureEvent(event: Event, hint?: EventHint): void;
    addBreadcrumb(breadcrumb: Breadcrumb, hint?: EventHint): void;
    setUser(user: User | null): void;
    setTag(key: string, value: string): void;
    setExtra(key: string, value: any): void;
    setContext(key: string, context: Context): void;
    configureScope(callback: (scope: Scope) => void): void;
    withScope(callback: (scope: Scope) => void): void;
    getScope(): Scope;
    getClient(): Client | undefined;
    getIntegration<T extends Integration>(integration: IntegrationConstructor<T>): T | undefined;
    startTransaction(context: TransactionContext): Transaction;
    startSpan(context: SpanContext): Span | undefined;
    captureSession(session?: Session): void;
    endSession(session?: Session): void;
  }

  export interface Client {
    captureException(exception: any, hint?: EventHint): void;
    captureMessage(message: string, level?: Severity, hint?: EventHint): void;
    captureEvent(event: Event, hint?: EventHint): void;
    addBreadcrumb(breadcrumb: Breadcrumb): void;
    setUser(user: User | null): void;
    setTag(key: string, value: string): void;
    setExtra(key: string, value: any): void;
    setContext(key: string, context: Context): void;
    configureScope(callback: (scope: Scope) => void): void;
    getOptions(): SentryOptions;
    close(timeout?: number): Promise<boolean>;
    flush(timeout?: number): Promise<boolean>;
    getIntegration<T extends Integration>(integration: IntegrationConstructor<T>): T | undefined;
  }

  export interface Transaction {
    setName(name: string): void;
    setData(key: string, value: any): void;
    setTag(key: string, value: string): void;
    setStatus(status: string): void;
    finish(): void;
    toTraceparent(): string;
    getSpan(): Span;
    getTraceContext(): TraceContext;
  }

  export interface TransactionContext {
    name?: string;
    op?: string;
    parentSpanId?: string;
    sampled?: boolean;
  }

  export interface SpanContext {
    op?: string;
    description?: string;
    parentSpanId?: string;
  }

  export interface TraceContext {
    trace_id: string;
    span_id: string;
    parent_span_id?: string;
    sampled?: 'true' | 'false';
  }

  export type IntegrationConstructor<T extends Integration> = new (...args: any[]) => T;

  export class SentryClient implements Client {
    private options: SentryOptions;
    private transport: Transport;
    private integrations: Integration[] = [];

    constructor(options: SentryOptions) {
      this.options = options;
      this.transport = options.transport || new DefaultTransport(options);
      this.setupIntegrations();
    }

    captureException(exception: any, hint?: EventHint): void {
      const event = this.createEventFromException(exception, hint);
      this.sendEvent(event);
    }

    captureMessage(message: string, level: Severity = 'info', hint?: EventHint): void {
      const event: Event = {
        message: { message },
        level,
        timestamp: Date.now(),
        platform: 'node'
      };
      this.sendEvent(event);
    }

    captureEvent(event: Event, hint?: EventHint): void {
      this.sendEvent(event);
    }

    addBreadcrumb(breadcrumb: Breadcrumb): void {
      // Breadcrumb handling would be implemented here
    }

    setUser(user: User | null): void {
      // User context handling
    }

    setTag(key: string, value: string): void {
      // Tag handling
    }

    setExtra(key: string, value: any): void {
      // Extra data handling
    }

    setContext(key: string, context: Context): void {
      // Context handling
    }

    configureScope(callback: (scope: Scope) => void): void {
      // Scope configuration
    }

    getOptions(): SentryOptions {
      return this.options;
    }

    async close(timeout?: number): Promise<boolean> {
      return this.transport.close?.(timeout) || true;
    }

    async flush(timeout?: number): Promise<boolean> {
      return this.transport.flush?.(timeout) || true;
    }

    getIntegration<T extends Integration>(integration: IntegrationConstructor<T>): T | undefined {
      return this.integrations.find(i => i instanceof integration) as T;
    }

    private createEventFromException(exception: any, hint?: EventHint): Event {
      const event: Event = {
        timestamp: Date.now(),
        platform: 'node',
        exception: {
          values: [{
            type: exception.constructor?.name || 'Error',
            value: exception.message || String(exception),
            stacktrace: this.createStacktrace(exception)
          }]
        },
        level: 'error'
      };

      if (hint?.syntheticException) {
        event.exception!.values![0].stacktrace = this.createStacktrace(hint.syntheticException);
      }

      return event;
    }

    private createStacktrace(error: Error): Stacktrace {
      const stack = error.stack || '';
      const frames = this.parseStack(stack);
      return { frames };
    }

    private parseStack(stack: string): StackFrame[] {
      const lines = stack.split('\n');
      const frames: StackFrame[] = [];

      for (const line of lines) {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          const [, func, filename, lineno, colno] = match;
          frames.push({
            function: func,
            filename,
            lineno: parseInt(lineno),
            colno: parseInt(colno),
            in_app: !filename.includes('node_modules')
          });
        }
      }

      return frames.reverse();
    }

    private setupIntegrations(): void {
      if (this.options.integrations) {
        this.integrations = this.options.integrations;
      }
    }

    private sendEvent(event: Event): void {
      if (this.options.beforeSend) {
        const processed = this.options.beforeSend(event);
        if (!processed) return;
        event = processed;
      }

      this.transport.sendEvent?.(event);
    }
  }

  export class DefaultTransport implements Transport {
    private dsn: string;
    private options: SentryOptions;

    constructor(options: SentryOptions) {
      this.options = options;
      this.dsn = options.dsn;
    }

    sendEvent(event: Event): void {
      // Simplified transport - in production would send to Sentry API
      console.log(`[SENTRY] Event sent to ${this.dsn}:`, event.level, event.message?.message);
    }

    async close(timeout?: number): Promise<boolean> {
      return true;
    }

    async flush(timeout?: number): Promise<boolean> {
      return true;
    }
  }

  export class Hub implements Hub {
    private client?: Client;
    private scope: Scope = {};

    constructor(client?: Client) {
      this.client = client;
    }

    captureException(exception: any, hint?: EventHint): void {
      this.client?.captureException(exception, hint);
    }

    captureMessage(message: string, level?: Severity, hint?: EventHint): void {
      this.client?.captureMessage(message, level, hint);
    }

    captureEvent(event: Event, hint?: EventHint): void {
      this.client?.captureEvent(event, hint);
    }

    addBreadcrumb(breadcrumb: Breadcrumb, hint?: EventHint): void {
      this.client?.addBreadcrumb(breadcrumb);
    }

    setUser(user: User | null): void {
      this.client?.setUser(user);
    }

    setTag(key: string, value: string): void {
      this.client?.setTag(key, value);
    }

    setExtra(key: string, value: any): void {
      this.client?.setExtra(key, value);
    }

    setContext(key: string, context: Context): void {
      this.client?.setContext(key, context);
    }

    configureScope(callback: (scope: Scope) => void): void {
      callback(this.scope);
    }

    withScope(callback: (scope: Scope) => void): void {
      const clonedScope = { ...this.scope };
      callback(clonedScope);
    }

    getScope(): Scope {
      return this.scope;
    }

    getClient(): Client | undefined {
      return this.client;
    }

    getIntegration<T extends Integration>(integration: IntegrationConstructor<T>): T | undefined {
      return this.client?.getIntegration(integration);
    }

    startTransaction(context: TransactionContext): Transaction {
      return new TransactionImpl(context);
    }

    startSpan(context: SpanContext): Span | undefined {
      // Simplified span creation
      return undefined;
    }

    captureSession(session?: Session): void {
      // Session handling
    }

    endSession(session?: Session): void {
      // Session ending
    }
  }

  export class TransactionImpl implements Transaction {
    private context: TransactionContext;
    private spans: Span[] = [];

    constructor(context: TransactionContext) {
      this.context = context;
    }

    setName(name: string): void {
      this.context.name = name;
    }

    setData(key: string, value: any): void {
      // Data handling
    }

    setTag(key: string, value: string): void {
      // Tag handling
    }

    setStatus(status: string): void {
      // Status handling
    }

    finish(): void {
      // Transaction finishing
    }

    toTraceparent(): string {
      return '00-trace-id-span-id-01';
    }

    getSpan(): Span {
      return this.spans[this.spans.length - 1];
    }

    getTraceContext(): TraceContext {
      return {
        trace_id: 'trace-id',
        span_id: 'span-id',
        sampled: 'true'
      };
    }
  }

  // Global hub management
  let currentHub: Hub = new Hub();

  export function init(options: SentryOptions): Hub {
    const client = new SentryClient(options);
    currentHub = new Hub(client);
    return currentHub;
  }

  export function getCurrentHub(): Hub {
    return currentHub;
  }

  export function captureException(exception: any, hint?: EventHint): void {
    currentHub.captureException(exception, hint);
  }

  export function captureMessage(message: string, level?: Severity, hint?: EventHint): void {
    currentHub.captureMessage(message, level, hint);
  }

  export function addBreadcrumb(breadcrumb: Breadcrumb, hint?: EventHint): void {
    currentHub.addBreadcrumb(breadcrumb, hint);
  }

  export function setUser(user: User | null): void {
    currentHub.setUser(user);
  }

  export function setTag(key: string, value: string): void {
    currentHub.setTag(key, value);
  }

  export function setExtra(key: string, value: any): void {
    currentHub.setExtra(key, value);
  }

  export function setContext(key: string, context: Context): void {
    currentHub.setContext(key, context);
  }

  export function configureScope(callback: (scope: Scope) => void): void {
    currentHub.configureScope(callback);
  }

  export function withScope(callback: (scope: Scope) => void): void {
    currentHub.withScope(callback);
  }

  export function startTransaction(context: TransactionContext): Transaction {
    return currentHub.startTransaction(context);
  }

  // Integrations
  export class Integrations {
    static Http(): Integration {
      return {
        name: 'Http',
        setupOnce: () => {
          // HTTP integration setup
        }
      };
    }

    static OnUncaughtException(): Integration {
      return {
        name: 'OnUncaughtException',
        setupOnce: () => {
          // Uncaught exception handling
        }
      };
    }

    static OnUnhandledRejection(): Integration {
      return {
        name: 'OnUnhandledRejection',
        setupOnce: () => {
          // Unhandled rejection handling
        }
      };
    }

    static Console(): Integration {
      return {
        name: 'Console',
        setupOnce: () => {
          // Console integration
        }
      };
    }
  }

  // Utility functions
  export function extractExceptionKeys(error: Error): string[] {
    return Object.getOwnPropertyNames(error);
  }

  export function parseStack(stack: string): StackFrame[] {
    const lines = stack.split('\n');
    const frames: StackFrame[] = [];

    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        const [, func, filename, lineno, colno] = match;
        frames.push({
          function: func,
          filename,
          lineno: parseInt(lineno),
          colno: parseInt(colno),
          in_app: !filename.includes('node_modules')
        });
      }
    }

    return frames.reverse();
  }

  export function createStackParser(stackParser: (stack: string, skipFirst?: number) => StackFrame[]): (stack: string, skipFirst?: number) => StackFrame[] {
    return stackParser;
  }

  export function makeMain(hub: Hub): void {
    currentHub = hub;
  }
}

/**
 * Core Logging Module
 * Optimized, performance-focused logging system
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
export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  structured: boolean;
  timestamp: boolean;
  colorize: boolean;
  output: 'console' | 'file' | 'both';
  bufferSize?: number;
  flushInterval?: number;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  meta?: Record<string, any>;
  error?: Error;
  context?: string;
}

export interface LogTransport {
  name: string;
  level: string;
  write(entry: LogEntry): Promise<void>;
}

// Enhanced error types
export class LoggingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'LoggingError';
  }
}

export class TransportError extends LoggingError {
  constructor(message: string, code: string = 'TRANSPORT_ERROR') {
    super(message, code, 500);
  }
}

// Performance-optimized logger
export class Logger extends SimpleEventEmitter {
  private config: LoggingConfig;
  private transports: LogTransport[] = [];
  private buffer: LogEntry[] = [];
  private flushTimer?: number;

  constructor(config: Partial<LoggingConfig> = {}) {
    super();
    this.config = {
      enabled: true,
      level: 'info',
      format: 'json',
      structured: true,
      timestamp: true,
      colorize: false,
      output: 'console',
      bufferSize: 1000,
      flushInterval: 5000, // 5 seconds
      ...config
    };
    
    if (this.config.enabled) {
      this.startFlushTimer();
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

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify({
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp.toISOString(),
        meta: entry.meta,
        context: entry.context,
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack
        } : undefined
      });
    } else {
      const timestamp = this.config.timestamp ? `[${entry.timestamp.toISOString()}] ` : '';
      const context = entry.context ? `[${entry.context}] ` : '';
      const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
      const error = entry.error ? ` ${entry.error.stack || entry.error.message}` : '';
      return `${timestamp}${context}${entry.level.toUpperCase()}: ${entry.message}${meta}${error}`;
    }
  }

  private writeEntry(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);

    // Console output
    if (this.config.output === 'console' || this.config.output === 'both') {
      if (this.config.colorize) {
        this.writeToConsole(entry.level, formatted);
      } else {
        console.log(formatted);
      }
    }

    // Buffer for file output
    if (this.config.output === 'file' || this.config.output === 'both') {
      this.buffer.push(entry);
      if (this.buffer.length >= (this.config.bufferSize || 1000)) {
        this.flush();
      }
    }

    // Transports
    for (const transport of this.transports) {
      if (this.shouldLog(transport.level)) {
        transport.write(entry).catch(error => {
          console.error(`[Logger] Transport error (${transport.name}):`, error);
        });
      }
    }

    // Emit event
    this.emit('log', entry);
  }

  private writeToConsole(level: string, message: string): void {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m' // red
    };
    
    const reset = '\x1b[0m';
    const color = colors[level as keyof typeof colors] || '';
    
    switch (level) {
      case 'error':
        console.error(`${color}${message}${reset}`);
        break;
      case 'warn':
        console.warn(`${color}${message}${reset}`);
        break;
      case 'info':
        console.info(`${color}${message}${reset}`);
        break;
      case 'debug':
        console.debug(`${color}${message}${reset}`);
        break;
      default:
        console.log(message);
    }
  }

  debug(message: string, meta?: Record<string, any>, context?: string): void {
    if (!this.config.enabled || !this.shouldLog('debug')) return;
    
    this.writeEntry({
      level: 'debug',
      message,
      timestamp: new Date(),
      meta,
      context
    });
  }

  info(message: string, meta?: Record<string, any>, context?: string): void {
    if (!this.config.enabled || !this.shouldLog('info')) return;
    
    this.writeEntry({
      level: 'info',
      message,
      timestamp: new Date(),
      meta,
      context
    });
  }

  warn(message: string, meta?: Record<string, any>, context?: string): void {
    if (!this.config.enabled || !this.shouldLog('warn')) return;
    
    this.writeEntry({
      level: 'warn',
      message,
      timestamp: new Date(),
      meta,
      context
    });
  }

  error(message: string, error?: Error, meta?: Record<string, any>, context?: string): void {
    if (!this.config.enabled || !this.shouldLog('error')) return;
    
    this.writeEntry({
      level: 'error',
      message,
      timestamp: new Date(),
      meta,
      error,
      context
    });
  }

  log(level: string, message: string, meta?: Record<string, any>, error?: Error, context?: string): void {
    if (!this.config.enabled || !this.shouldLog(level)) return;
    
    this.writeEntry({
      level,
      message,
      timestamp: new Date(),
      meta,
      error,
      context
    });
  }

  child(context: string): Logger {
    const child = new Logger(this.config);
    child.transports = [...this.transports];
    return child;
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    const entriesToFlush = [...this.buffer];
    this.buffer = [];

    // In production, this would write to file
    if (this.config.output === 'file' || this.config.output === 'both') {
      for (const entry of entriesToFlush) {
        console.log(`[FILE] ${this.formatEntry(entry)}`);
      }
    }

    this.emit('flush', { count: entriesToFlush.length });
  }

  clear(): void {
    this.buffer = [];
    this.emit('cleared');
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return this.config.enabled;
  }

  async shutdown(): Promise<void> {
    console.log('[Logger] Shutting down logger...');
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flush();
    this.transports = [];
    this.buffer = [];
    this.config.enabled = false;
    
    console.log('[Logger] Logger shutdown complete');
  }
}

// File transport
export class FileTransport implements LogTransport {
  name = 'file';
  level: string;
  private filePath: string;

  constructor(level: string, filePath: string) {
    this.level = level;
    this.filePath = filePath;
  }

  async write(entry: LogEntry): Promise<void> {
    // In production, this would write to a file
    // For now, we'll just log to console with file prefix
    console.log(`[FILE:${this.filePath}] ${JSON.stringify(entry)}`);
  }
}

// Remote transport
export class RemoteTransport implements LogTransport {
  name = 'remote';
  level: string;
  private endpoint: string;

  constructor(level: string, endpoint: string) {
    this.level = level;
    this.endpoint = endpoint;
  }

  async write(entry: LogEntry): Promise<void> {
    // In production, this would send to remote endpoint
    console.log(`[REMOTE:${this.endpoint}] ${JSON.stringify(entry)}`);
  }
}

// Factory functions
export function createLogger(config?: Partial<LoggingConfig>): Logger {
  return new Logger(config);
}

export function createFileLogger(level: string, filePath: string): Logger {
  const logger = new Logger({ level, output: 'file' });
  logger.addTransport(new FileTransport(level, filePath));
  return logger;
}

export function createRemoteLogger(level: string, endpoint: string): Logger {
  const logger = new Logger({ level });
  logger.addTransport(new RemoteTransport(level, endpoint));
  return logger;
}

// Default configurations
export const defaultLoggingConfig: LoggingConfig = {
  enabled: true,
  level: 'info',
  format: 'json',
  structured: true,
  timestamp: true,
  colorize: false,
  output: 'console',
  bufferSize: 1000,
  flushInterval: 5000
};

// Re-exports
export { Logger, FileTransport, RemoteTransport };
export type { LoggingConfig, LogEntry, LogTransport };
export { createLogger, createFileLogger, createRemoteLogger, defaultLoggingConfig };

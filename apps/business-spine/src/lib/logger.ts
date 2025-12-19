import { config } from './config';
import type { AuthSpineError } from './errors';

// Log levels in order of severity
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
  requestId?: string;
  userId?: string;
  timestamp?: string;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  service: string;
  version?: string;
}

// Logger implementation
class Logger {
  private service: string;
  private version: string;

  constructor(service: string = 'auth-spine', version: string = '1.0.0') {
    this.service = service;
    this.version = version;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(config.LOG_LEVEL);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      service: this.service,
      version: this.version,
    };
  }

  private log(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    if (config.LOG_FORMAT === 'json') {
      console.log(JSON.stringify(entry));
    } else {
      // Pretty format for development
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      const prefix = `[${timestamp}] ${entry.level.toUpperCase()} ${entry.service}`;
      
      switch (entry.level) {
        case 'error':
          console.error(`❌ ${prefix}: ${entry.message}`, entry.context || '');
          break;
        case 'warn':
          console.warn(`⚠️  ${prefix}: ${entry.message}`, entry.context || '');
          break;
        case 'info':
          console.info(`ℹ️  ${prefix}: ${entry.message}`, entry.context || '');
          break;
        case 'debug':
          console.debug(`🐛 ${prefix}: ${entry.message}`, entry.context || '');
          break;
      }
    }

    // Send to external services in production
    if (config.NODE_ENV === 'production' && config.SENTRY_DSN) {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Integration with external logging services
    // This could be Sentry, LogRocket, DataDog, etc.
    try {
      if (entry.level === 'error' && config.SENTRY_DSN) {
        // Send to Sentry
        // Note: This would require @sentry/node package
        // Sentry.captureException(new Error(entry.message), { extra: entry.context });
      }
    } catch (error) {
      // Don't let logging errors crash the app
      console.error('Failed to send log to external service:', error);
    }
  }

  error(message: string, context?: LogContext) {
    this.log(this.formatMessage('error', message, context));
  }

  warn(message: string, context?: LogContext) {
    this.log(this.formatMessage('warn', message, context));
  }

  info(message: string, context?: LogContext) {
    this.log(this.formatMessage('info', message, context));
  }

  debug(message: string, context?: LogContext) {
    this.log(this.formatMessage('debug', message, context));
  }

  // Specialized logging methods
  auth(action: string, userId?: string, context?: LogContext) {
    this.info(`Auth: ${action}`, {
      ...context,
      category: 'auth',
      userId,
    });
  }

  api(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.log(this.formatMessage(level, `${method} ${path} - ${statusCode} (${duration}ms)`, {
      ...context,
      category: 'api',
      method,
      path,
      statusCode,
      duration,
    }));
  }

  database(query: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'debug';
    this.log(this.formatMessage(level, `DB Query: ${query} (${duration}ms)`, {
      ...context,
      category: 'database',
      query,
      duration,
    }));
  }

  security(event: string, severity: 'low' | 'medium' | 'high', context?: LogContext) {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    this.log(this.formatMessage(level, `Security: ${event}`, {
      ...context,
      category: 'security',
      severity,
    }));
  }

  performance(metric: string, value: number, unit: string = 'ms', context?: LogContext) {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      ...context,
      category: 'performance',
      metric,
      value,
      unit,
    });
  }

  // Error-specific logging
  errorCapture(error: Error | AuthSpineError, context?: LogContext) {
    const errorContext = {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      ...(error instanceof Error && { stack: error.stack }),
    };

    if ('code' in error && 'statusCode' in error) {
      // AuthSpineError
      this.error(error.message, {
        ...errorContext,
        code: (error as AuthSpineError).code,
        statusCode: (error as AuthSpineError).statusCode,
        meta: (error as AuthSpineError).meta,
      });
    } else {
      // Generic Error
      this.error(error.message, errorContext);
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Create a request-scoped logger
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return {
    ...logger,
    error: (message: string, context?: LogContext) => logger.error(message, { ...context, requestId, userId }),
    warn: (message: string, context?: LogContext) => logger.warn(message, { ...context, requestId, userId }),
    info: (message: string, context?: LogContext) => logger.info(message, { ...context, requestId, userId }),
    debug: (message: string, context?: LogContext) => logger.debug(message, { ...context, requestId, userId }),
    auth: (action: string, userId?: string, context?: LogContext) => logger.auth(action, userId || userId, { ...context, requestId }),
    api: (method: string, path: string, statusCode: number, duration: number, context?: LogContext) => 
      logger.api(method, path, statusCode, duration, { ...context, requestId }),
    database: (query: string, duration: number, context?: LogContext) => 
      logger.database(query, duration, { ...context, requestId }),
    security: (event: string, severity: 'low' | 'medium' | 'high', context?: LogContext) => 
      logger.security(event, severity, { ...context, requestId }),
    performance: (metric: string, value: number, unit?: string, context?: LogContext) => 
      logger.performance(metric, value, unit, { ...context, requestId }),
    errorCapture: (error: Error | AuthSpineError, context?: LogContext) => 
      logger.errorCapture(error, { ...context, requestId }),
  } as Logger;
}

// Export types
export type { LogContext, LogEntry };

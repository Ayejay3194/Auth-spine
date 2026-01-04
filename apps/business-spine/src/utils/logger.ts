/**
 * Business Spine Logger
 * 
 * Provides structured logging for the business spine system.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
};

export class Logger {
  constructor(
    private namespace: string = "spine",
    private minLevel: LogLevel = "info"
  ) {}

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const parts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      `[${this.namespace}]`,
      message,
    ];

    if (context) {
      parts.push(JSON.stringify(context));
    }

    if (error) {
      parts.push(`\n${error.stack || error.message}`);
    }

    return parts.join(" ");
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "debug":
      case "info":
        console.log(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log("error", message, context, error);
  }

  child(namespace: string): Logger {
    return new Logger(`${this.namespace}:${namespace}`, this.minLevel);
  }
}

// Default logger instance
let defaultLogger: Logger | null = null;

export function getLogger(namespace?: string, minLevel?: LogLevel): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger(
      "spine",
      (process.env.LOG_LEVEL as LogLevel) || "info"
    );
  }

  if (namespace) {
    return defaultLogger.child(namespace);
  }

  return defaultLogger;
}

export function setLogLevel(level: LogLevel): void {
  if (defaultLogger) {
    defaultLogger = new Logger("spine", level);
  }
}

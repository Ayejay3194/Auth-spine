/**
 * Logger utility for Auth-spine Analytics Package
 * Shared logging functionality across all analytics components
 */

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
  service: string;
}

export class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      service: this.config.service,
      message,
      ...(data && { data })
    };

    if (this.config.format === 'json') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.config.service}] ${message}`, data || '');
    }
  }
}

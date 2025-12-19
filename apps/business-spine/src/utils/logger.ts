import winston from 'winston';
import * as winstonFormat from 'winston/lib/winston/config/index.js';

export type LoggerConfig = {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
};

export class Logger {
  private logger: winston.Logger;

  constructor(config: LoggerConfig) {
    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      config.format === 'json' ? winston.format.json() : winston.format.simple()
    ];

    this.logger = winston.createLogger({
      level: config.level,
      format: winston.format.combine(...formats),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });
  }

  error(message: string, error?: any): void {
    this.logger.error(message, error);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

import { auditLogger } from './logger';
import { AuditEventType } from './types';

export function createAuditHook<T extends (...args: any[]) => any>(
  functionName: string,
  eventType: AuditEventType,
  fn: T,
  options?: {
    extractUserId?: (...args: Parameters<T>) => string | undefined;
    extractClientId?: (...args: Parameters<T>) => string | undefined;
    extractMetadata?: (...args: Parameters<T>) => Record<string, any> | undefined;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    let success = true;
    let error: any = undefined;

    try {
      const result = await fn(...args);
      return result;
    } catch (err: any) {
      success = false;
      error = {
        message: err.message || 'Unknown error',
        code: err.code,
        stack: err.stack,
      };
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      await auditLogger.log({
        eventType,
        userId: options?.extractUserId?.(...args),
        clientId: options?.extractClientId?.(...args),
        success,
        duration,
        metadata: {
          functionName,
          ...options?.extractMetadata?.(...args),
        },
        error,
      });
    }
  }) as T;
}

export function auditDecorator(
  eventType: AuditEventType,
  options?: {
    extractUserId?: (target: any, ...args: any[]) => string | undefined;
    extractClientId?: (target: any, ...args: any[]) => string | undefined;
    extractMetadata?: (target: any, ...args: any[]) => Record<string, any> | undefined;
  }
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let error: any = undefined;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (err: any) {
        success = false;
        error = {
          message: err.message || 'Unknown error',
          code: err.code,
          stack: err.stack,
        };
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        await auditLogger.log({
          eventType,
          userId: options?.extractUserId?.(this, ...args),
          clientId: options?.extractClientId?.(this, ...args),
          success,
          duration,
          metadata: {
            className: target.constructor.name,
            methodName: propertyKey,
            ...options?.extractMetadata?.(this, ...args),
          },
          error,
        });
      }
    };

    return descriptor;
  };
}

export class AuditMiddleware {
  static express() {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now();

      const originalSend = res.send;
      res.send = function (data: any) {
        const duration = Date.now() - startTime;
        const success = res.statusCode < 400;

        auditLogger.log({
          eventType: 'API_CALL',
          userId: req.user?.id || req.userId,
          clientId: req.client?.id || req.clientId,
          success,
          duration,
          metadata: {
            path: req.path,
            method: req.method,
            statusCode: res.statusCode,
            query: req.query,
          },
          context: {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            path: req.path,
            method: req.method,
          },
          error: !success
            ? {
                message: `HTTP ${res.statusCode}`,
                code: res.statusCode.toString(),
              }
            : undefined,
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }

  static nextjs() {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const success = res.statusCode < 400;

        auditLogger.log({
          eventType: 'API_CALL',
          userId: req.user?.id,
          clientId: req.client?.id,
          success,
          duration,
          metadata: {
            path: req.url,
            method: req.method,
            statusCode: res.statusCode,
          },
          context: {
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            path: req.url,
            method: req.method,
          },
          error: !success
            ? {
                message: `HTTP ${res.statusCode}`,
                code: res.statusCode.toString(),
              }
            : undefined,
        });
      });

      next?.();
    };
  }
}

export function withAudit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  eventType: AuditEventType,
  options?: {
    userId?: string;
    clientId?: string;
    metadata?: Record<string, any>;
  }
): T {
  return (async (...args: any[]) => {
    return auditLogger.logFunctionCall(
      fn.name || 'anonymous',
      () => fn(...args),
      {
        userId: options?.userId,
        clientId: options?.clientId,
        metadata: options?.metadata,
      }
    );
  }) as T;
}

import { randomBytes } from 'crypto';
import { AuditEvent, AuditEventType, AuditCategory, AuditSeverity } from './types';

export class AuditLogger {
  private static instance: AuditLogger;
  private persistenceEnabled: boolean = true;
  private inMemoryBuffer: AuditEvent[] = [];
  private maxBufferSize: number = 1000;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private categorizeEvent(eventType: AuditEventType): AuditCategory {
    const categoryMap: Record<string, AuditCategory> = {
      AUTH_SUCCESS: 'authentication',
      AUTH_FAILED: 'authentication',
      MFA_REQUIRED: 'authentication',
      MFA_FAILED: 'authentication',
      REFRESH_SUCCESS: 'session',
      REFRESH_FAILED: 'session',
      SESSION_REVOKED: 'session',
      PERMISSIONS_UPDATED: 'authorization',
      OAUTH_PASSWORD_SUCCESS: 'authentication',
      OAUTH_REFRESH_SUCCESS: 'session',
      API_CALL: 'api',
      ERROR: 'api',
      PERFORMANCE_WARNING: 'performance',
      SECURITY_ALERT: 'security',
      DATA_ACCESS: 'data',
      CONFIGURATION_CHANGE: 'configuration',
      USER_ACTION: 'user',
    };
    return categoryMap[eventType] || 'api';
  }

  private determineSeverity(eventType: AuditEventType, success: boolean): AuditSeverity {
    if (!success) {
      if (eventType.includes('FAILED') || eventType === 'ERROR') {
        return 'error';
      }
      return 'warning';
    }

    if (eventType === 'SECURITY_ALERT') return 'critical';
    if (eventType === 'PERFORMANCE_WARNING') return 'warning';
    if (eventType === 'PERMISSIONS_UPDATED' || eventType === 'CONFIGURATION_CHANGE') {
      return 'warning';
    }

    return 'info';
  }

  async log(params: {
    eventType: AuditEventType;
    userId?: string;
    clientId?: string;
    sessionId?: string;
    success?: boolean;
    duration?: number;
    metadata?: Record<string, any>;
    error?: { message: string; code?: string; stack?: string };
    context?: {
      ip?: string;
      userAgent?: string;
      path?: string;
      method?: string;
    };
  }): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: randomBytes(12).toString('hex'),
      eventType: params.eventType,
      category: this.categorizeEvent(params.eventType),
      severity: this.determineSeverity(params.eventType, params.success ?? true),
      userId: params.userId,
      clientId: params.clientId,
      sessionId: params.sessionId,
      timestamp: Date.now(),
      duration: params.duration,
      success: params.success ?? true,
      metadata: params.metadata,
      error: params.error,
      context: params.context,
    };

    this.addToBuffer(event);

    if (this.persistenceEnabled) {
      await this.persistEvent(event);
    }

    return event;
  }

  private addToBuffer(event: AuditEvent): void {
    this.inMemoryBuffer.push(event);
    if (this.inMemoryBuffer.length > this.maxBufferSize) {
      this.inMemoryBuffer.shift();
    }
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    try {
      const { prisma } = await import('@spine/shared-db/prisma');
      await prisma.auditLog.create({
        data: {
          id: event.id,
          eventType: event.eventType,
          category: event.category,
          severity: event.severity,
          userId: event.userId,
          clientId: event.clientId,
          sessionId: event.sessionId,
          duration: event.duration,
          success: event.success,
          metadata: event.metadata || {},
          error: event.error,
          context: event.context,
          createdAt: new Date(event.timestamp),
        },
      });
    } catch (error) {
      console.error('[AuditLogger] Failed to persist event:', error);
      console.log('[AuditLogger] Event:', JSON.stringify(event));
    }
  }

  getBuffer(): AuditEvent[] {
    return [...this.inMemoryBuffer];
  }

  clearBuffer(): void {
    this.inMemoryBuffer = [];
  }

  setPersistence(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }

  async logFunctionCall<T>(
    functionName: string,
    fn: () => Promise<T>,
    context?: {
      userId?: string;
      clientId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let error: any = undefined;

    try {
      const result = await fn();
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
      await this.log({
        eventType: 'API_CALL',
        userId: context?.userId,
        clientId: context?.clientId,
        success,
        duration,
        metadata: {
          ...context?.metadata,
          functionName,
        },
        error,
      });
    }
  }
}

export const auditLogger = AuditLogger.getInstance();

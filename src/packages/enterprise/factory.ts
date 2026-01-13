/**
 * Audit Factory - Factory functions for creating audit logs
 */

import { AuditLog } from './types';

export function createAuditLog(data: {
  eventType: string;
  userId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}): AuditLog {
  return {
    id: generateId(),
    eventType: data.eventType,
    userId: data.userId,
    metadata: data.metadata,
    createdAt: new Date(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  };
}

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Audit Configuration - Default configurations for audit logging
 */

export const DEFAULT_AUDIT_CONFIG = {
  retentionPeriod: 90, // days
  batchSize: 1000,
  enableCompression: true,
  enableEncryption: true,
  logLevel: 'info',
  exportFormats: ['csv', 'json', 'excel'],
  maxQueryResults: 10000,
  indexFields: ['eventType', 'userId', 'createdAt']
};

export const auditEventTypes = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  KILL_SWITCH_ACTIVATED: 'KILL_SWITCH_ACTIVATED',
  KILL_SWITCH_DEACTIVATED: 'KILL_SWITCH_DEACTIVATED',
  LAUNCH_GATE_UPDATED: 'LAUNCH_GATE_UPDATED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS'
};

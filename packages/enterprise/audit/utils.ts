/**
 * Audit Utils - Utility functions for audit logging
 */

export class AuditUtils {
  static formatTimestamp(date: Date): string {
    return date.toISOString();
  }

  static sanitizeMetadata(metadata: any): any {
    // Remove sensitive information from metadata
    const sanitized = { ...metadata };
    delete sanitized.password;
    delete sanitized.token;
    return sanitized;
  }

  static validateEventType(eventType: string): boolean {
    const validTypes = [
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'KILL_SWITCH_ACTIVATED',
      'KILL_SWITCH_DEACTIVATED',
      'LAUNCH_GATE_UPDATED',
      'UNAUTHORIZED_ACCESS'
    ];
    return validTypes.includes(eventType);
  }
}

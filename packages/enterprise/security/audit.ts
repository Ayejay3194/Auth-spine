/**
 * Simple audit logging utilities.
 * - In production, write to secure log storage (e.g., CloudWatch, Splunk, etc.)
 */
export interface AuditEvent {
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
}

export function logAuditEvent(event: AuditEvent): void {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  // In development, just log to console
  if (process.env.NODE_ENV !== "production") {
    console.log("[AUDIT]", JSON.stringify(logEntry));
    return;
  }
  
  // In production, this should write to your audit log system
  // Examples: CloudWatch Logs, Splunk, ELK stack, etc.
  // For now, we'll keep it simple
  console.log("[AUDIT]", JSON.stringify(logEntry));
}

// Helper to log PII access
export function logPIIAccess(userId: string, resource: string, ip?: string): void {
  logAuditEvent({
    userId,
    action: "PII_ACCESS",
    resource,
    ip,
    success: true,
    details: { piiAccess: true }
  });
}

// Helper to log authentication events
export function logAuthEvent(userId: string, action: "LOGIN" | "LOGOUT" | "FAILED_LOGIN", success: boolean, ip?: string): void {
  logAuditEvent({
    userId,
    action,
    resource: "auth",
    ip,
    success,
    details: { authEvent: true }
  });
}

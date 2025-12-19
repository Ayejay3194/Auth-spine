/**
 * Beauty Booking Security Pack
 * 
 * A drop-in security kit for beauty booking platforms with:
 * - Separation controls (public vs studio vs ops)
 * - RBAC/ABAC patterns
 * - Headers/CSP templates
 * - Rate limiting + brute force protection
 * - Audit logging + PII access logging
 * - Incident response playbooks
 * - CI security gates
 * - Threat model + data flow templates
 * - Compliance evidence structure
 */

export * from './separation-controls.js';
export * from './rbac-abac.js';
export * from './security-headers.js';
export * from './rate-limiting.js';
export * from './audit-logging.js';
export * from './incident-response.js';
export * from './ci-security-gates.js';
export * from './threat-modeling.js';
export * from './compliance-evidence.js';

// Main exports
export { BeautyBookingSecurity } from './beauty-booking-security.js';
export { 
  SecurityConfig,
  SeparationConfig,
  RBACConfig,
  AuditConfig,
  IncidentConfig,
  ComplianceConfig
} from './types.js';

// Default configuration
export const DEFAULT_BEAUTY_BOOKING_SECURITY_CONFIG = {
  separation: {
    enableDomainSeparation: true,
    domains: {
      public: 'app.beautybooking.com',
      studio: 'studio.beautybooking.com',
      ops: 'ops.beautybooking.com'
    },
    enableCrossDomainIsolation: true,
    enableNetworkSegmentation: true
  },
  rbac: {
    enableRBAC: true,
    enableABAC: true,
    roles: {
      customer: ['bookings:read', 'bookings:write', 'profile:read', 'profile:write'],
      stylist: ['bookings:read', 'bookings:write', 'schedule:read', 'schedule:write', 'customers:read'],
      manager: ['bookings:*', 'schedule:*', 'customers:*', 'staff:*', 'reports:read'],
      admin: ['*']
    },
    attributes: ['location', 'department', 'seniority', 'certification'],
    enableDynamicPermissions: true
  },
  security: {
    enableCSRFProtection: true,
    enableSecurityHeaders: true,
    enableCSP: true,
    enableHSTS: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true
  },
  rateLimiting: {
    enabled: true,
    rules: {
      customer: { requests: 100, window: 60000 },
      stylist: { requests: 500, window: 60000 },
      manager: { requests: 1000, window: 60000 },
      admin: { requests: 2000, window: 60000 }
    },
    enableBruteForceProtection: true,
    maxFailedAttempts: 5,
    lockoutDuration: 900000 // 15 minutes
  },
  audit: {
    enabled: true,
    logLevel: 'info',
    logPIIAccess: true,
    logDataChanges: true,
    logAuthentication: true,
    retentionDays: 2555,
    enableRealTimeAlerts: true
  },
  incident: {
    enableIncidentResponse: true,
    severityLevels: ['low', 'medium', 'high', 'critical'],
    autoEscalation: true,
    notificationChannels: ['email', 'slack', 'sms'],
    responsePlaybooks: true
  },
  compliance: {
    enableSOC2: true,
    enableGDPR: true,
    enableCCPA: true,
    enableHIPAA: false,
    evidenceCollection: true,
    auditTrail: true,
    dataRetention: true
  }
};

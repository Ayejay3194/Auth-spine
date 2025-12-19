/**
 * Enterprise Security Package
 * Beauty Booking Security Implementation
 */

export { securityHeaders } from './security-headers';
export { hasPerm, type Role, type Perm, ROLE_PERMS } from './rbac';
export { middleware, config } from './middleware';
export { rateLimit, getClientIP } from './rate-limit';
export { generateCSRFToken, validateCSRFToken, cleanupCSRFTokens } from './csrf';
export { logAuditEvent, logPIIAccess, logAuthEvent, type AuditEvent } from './audit';

/**
 * Security utilities for Auth-spine platform
 * Provides comprehensive security features including:
 * - Security headers configuration
 * - Role-based access control (RBAC)
 * - Host-based separation middleware
 * - Rate limiting functionality
 * - CSRF protection
 * - Audit logging capabilities
 */

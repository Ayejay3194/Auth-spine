/**
 * SaaS PaaS Security Package
 * Comprehensive multi-tenant security controls for Auth-spine platform
 */

export { TenantValidator, type TenantContext, type TenantValidationResult } from './controls/tenant-validation';
export { ObjectAuthorization, type ResourceAccess, type AuthorizationResult } from './controls/authorization';
export { WebhookSecurity, webhookConfigs, createWebhookMiddleware, type WebhookVerificationResult, type WebhookConfig } from './controls/webhook-security';
export { SecurityAuditLogger, type SecurityAuditEvent, type AuditLogResult } from './controls/audit-logging';
export { SecretsManager, type SecretMetadata, type SecretValue, type SecretRotationPolicy } from './controls/secrets-management';

/**
 * SaaS PaaS security controls for Auth-spine platform
 * Provides comprehensive multi-tenant security including:
 * 
 * Critical Security Controls:
 * - SaaS-TEN-001: Tenant context validation on every request
 * - SaaS-TEN-002: Object-level authorization and data isolation
 * - SaaS-BILL-001: Webhook signature verification
 * - SaaS-OBS-001: Security event logging and monitoring
 * 
 * Security Features:
 * - Multi-tenant isolation and validation
 * - Object-level authorization with RBAC
 * - Webhook signature verification for billing integration
 * - Comprehensive audit logging for security events
 * - Secrets management with rotation policies
 * - Rate limiting per tenant/user
 * - Boundary violation detection
 * - Admin action auditing
 */

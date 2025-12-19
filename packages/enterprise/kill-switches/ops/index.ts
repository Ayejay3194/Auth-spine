/**
 * Universal Operations Spine - Consolidated Module
 * 
 * Provides comprehensive operational capabilities:
 * - Health monitoring and metrics
 * - Incident management and escalation
 * - Admin notifications
 * - Audit logging
 * - Feature flags
 * - RBAC and policy enforcement
 * - Alert rules and responses
 */

// Core operational types
export * from './types';

// Health and monitoring
export * from './health';

// Incident management
export * from './escalation';
export * from './notifier';

// Actions and policies
export * from './actions/runner';
export * from './actions/policy';
export * from './actions/auditLog';
export * from './actions/flagStore';

// Alert management
export * from './alerts/authAlertRules';
export * from './alerts/notifyAdmin';

// Notification providers
export * from './providers/notify';
export * from './providers/slackWebhook';

// Auth operations
export * from './spine/authOpsSpine';

// Audit and compliance
export * from '../audit/audit';
export * from '../audit/audit_store';

// Feature flags and RBAC
export * from '../flags/flag_controller';
export * from '../flags/flag_store';
export * from '../flags/in_memory_flag_store';

// Tenant scoping
export * from '../tenancy/tenant_scope';

// Ops runtime actions
export * from './actions/runner';
export { computeAuthMetrics, type AuthMetricSnapshot, type AuthLogEvent } from './metrics/authMetrics';

// Ops spine alerts
export * from './spine/authOpsSpine';
export * from './alerts/authAlertRules';
export * from './alerts/notifyAdmin';

// Connectors
export * from './metrics/authLogAdapter';
export * from './providers/slackWebhook';
export * from './providers/notify';

// Middleware
export * from './middleware/requestId';

// Utilities
export { stableId } from '../utils/stable_id';

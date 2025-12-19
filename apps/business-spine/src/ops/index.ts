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
export * from './types.js';

// Health and monitoring
export * from './health.js';

// Incident management
export * from './escalation.js';
export * from './notifier.js';

// Audit and compliance
export * from '../audit/audit.js';
export * from '../audit/audit_store.js';

// Feature flags and RBAC
export * from '../flags/flag_controller.js';
export * from '../flags/flag_store.js';
export * from '../flags/in_memory_flag_store.js';

// Tenant scoping
export * from '../tenancy/tenant_scope.js';

// Ops runtime actions
export * from './actions/runner.js';
export { computeAuthMetrics, type AuthMetricSnapshot, type AuthLogEvent } from './metrics/authMetrics.js';

// Ops spine alerts
export * from './spine/authOpsSpine.js';
export * from './alerts/authAlertRules.js';
export * from './alerts/notifyAdmin.js';

// Connectors
export * from './metrics/authLogAdapter.js';
export * from './providers/slackWebhook.js';
export * from './providers/notify.js';

// Middleware
export * from './middleware/requestId.js';

// Utilities
export { stableId } from '../utils/stable_id.js';

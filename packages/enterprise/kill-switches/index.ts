/**
 * Enterprise Kill Switches Package
 * 
 * Emergency system controls with:
 * - 8 critical system pause mechanisms
 * - Auto-disable functionality
 * - Critical alerting and notifications
 * - Audit logging for all actions
 * - System status monitoring
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { KillSwitchManager, KillSwitchService } from './manager';
export { EmergencyController } from './emergency-controller';
export { SystemStatusMonitor } from './status-monitor';

// Re-export types and utilities
export * from './types';
export * from './config';
export * from './utils';

// Default exports for easy usage
export { DEFAULT_KILL_SWITCHES } from './config';
export { checkSystemStatus } from './monitor';

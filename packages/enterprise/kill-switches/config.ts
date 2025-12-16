/**
 * Kill Switches Configuration - Default configurations for kill switches
 */

import { KillSwitch } from './types';

export const DEFAULT_KILL_SWITCHES: KillSwitch[] = [
  {
    id: 'pause-payments',
    name: 'Pause Payment Processing',
    description: 'Stop all payment processing operations',
    category: 'critical',
    enabled: false,
    impact: 'All payment operations will be halted'
  },
  {
    id: 'disable-user-logins',
    name: 'Disable User Logins',
    description: 'Prevent all user authentication',
    category: 'critical',
    enabled: false,
    impact: 'Users will not be able to log in'
  }
];

export const defaultKillSwitchConfig = {
  autoDisableDuration: 60, // minutes
  alertCooldown: 5, // minutes
  requireReason: true
};

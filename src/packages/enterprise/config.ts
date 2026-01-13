/**
 * Launch Gate Configuration - Default configurations for launch gate
 */

import { ChecklistItem } from './types';

export const DEFAULT_LAUNCH_GATE_CHECKLIST: ChecklistItem[] = [
  {
    id: 'auth-mfa',
    title: 'Multi-Factor Authentication Enabled',
    description: 'Ensure MFA is enabled for all admin users',
    status: 'pending',
    category: 'Security'
  },
  {
    id: 'backup-verified',
    title: 'Database Backups Verified',
    description: 'Verify recent database backups are working',
    status: 'pending',
    category: 'Data'
  }
];

export const defaultLaunchGateConfig = {
  requiredApprovals: 2,
  validationTimeout: 30,
  autoRefreshInterval: 5
};

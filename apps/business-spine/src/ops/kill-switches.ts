/**
 * Kill Switch System
 * Emergency controls to pause critical system functions
 */

import { prisma } from '@/lib/prisma';

export interface KillSwitch {
  id: string;
  name: string;
  description: string;
  category: 'bookings' | 'payments' | 'payroll' | 'admin' | 'api';
  enabled: boolean;
  activatedAt?: Date;
  activatedBy?: string;
  reason?: string;
  autoDisableAt?: Date;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface KillSwitchAction {
  switchId: string;
  action: 'enable' | 'disable';
  reason: string;
  userId: string;
  requireApproval: boolean;
}

export const KILL_SWITCHES: KillSwitch[] = [
  {
    id: 'pause-bookings',
    name: 'Pause All Bookings',
    description: 'Stop new booking creation and modifications',
    category: 'bookings',
    enabled: false,
    impact: 'medium'
  },
  {
    id: 'pause-payments',
    name: 'Pause Payment Processing',
    description: 'Stop all payment charges and refunds',
    category: 'payments',
    enabled: false,
    impact: 'critical'
  },
  {
    id: 'pause-payroll',
    name: 'Pause Payroll Processing',
    description: 'Stop payroll runs and direct deposits',
    category: 'payroll',
    enabled: false,
    impact: 'high'
  },
  {
    id: 'lock-admin-writes',
    name: 'Lock Admin Write Access',
    description: 'Prevent admin users from making write operations',
    category: 'admin',
    enabled: false,
    impact: 'high'
  },
  {
    id: 'api-read-only',
    name: 'API Read-Only Mode',
    description: 'Disable all write operations via API',
    category: 'api',
    enabled: false,
    impact: 'critical'
  },
  {
    id: 'disable-user-registrations',
    name: 'Disable User Registrations',
    description: 'Stop new user account creation',
    category: 'admin',
    enabled: false,
    impact: 'low'
  },
  {
    id: 'pause-notifications',
    name: 'Pause All Notifications',
    description: 'Stop email and SMS notifications',
    category: 'admin',
    enabled: false,
    impact: 'low'
  },
  {
    id: 'maintenance-mode',
    name: 'Maintenance Mode',
    description: 'Enable full maintenance mode for the application',
    category: 'api',
    enabled: false,
    impact: 'critical'
  }
];

export class KillSwitchManager {
  static async getAllSwitches(): Promise<KillSwitch[]> {
    // For now, return default switches since database models don't exist
    // In production, this would query the database
    return KILL_SWITCHES;
  }

  static async getSwitchStatus(switchId: string): Promise<boolean> {
    // For now, return false since database models don't exist
    // In production, this would query the database
    return false;
  }

  static async activateSwitch(
    switchId: string, 
    userId: string, 
    reason: string,
    autoDisableHours?: number
  ): Promise<void> {
    const killSwitch = KILL_SWITCHES.find(sw => sw.id === switchId);
    if (!killSwitch) {
      throw new Error('Kill switch not found');
    }

    // Check if already enabled
    const current = await this.getSwitchStatus(switchId);
    if (current) {
      throw new Error('Kill switch is already active');
    }

    // Log the activation using console.log since database models don't exist
    console.log('KILL SWITCH ACTIVATED:', {
      switchId,
      switchName: killSwitch.name,
      userId,
      reason,
      impact: killSwitch.impact,
      activatedAt: new Date(),
      autoDisableAt: autoDisableHours ? 
        new Date(Date.now() + autoDisableHours * 60 * 60 * 1000) : 
        undefined
    });

    // Send critical alert
    await this.sendCriticalAlert(killSwitch, userId, reason);
  }

  static async deactivateSwitch(switchId: string, userId: string, reason: string): Promise<void> {
    const killSwitch = KILL_SWITCHES.find(sw => sw.id === switchId);
    if (!killSwitch) {
      throw new Error('Kill switch not found');
    }

    // Check if already disabled
    const current = await this.getSwitchStatus(switchId);
    if (!current) {
      throw new Error('Kill switch is not active');
    }

    // Log the deactivation using console.log since database models don't exist
    console.log('KILL SWITCH DEACTIVATED:', {
      switchId,
      switchName: killSwitch.name,
      userId,
      reason,
      deactivatedAt: new Date()
    });
  }

  static async checkActiveSwitches(): Promise<KillSwitch[]> {
    // For now, return empty array since database models don't exist
    // In production, this would query active switches from database
    return [];
  }

  static async autoDisableExpiredSwitches(): Promise<void> {
    // For now, log the check since database models don't exist
    console.log('AUTO-DISABLE CHECK: Checking for expired kill switches');
  }

  static async isSystemFeatureEnabled(feature: string): Promise<boolean> {
    switch (feature) {
      case 'bookings':
        return !(await this.getSwitchStatus('pause-bookings'));
      case 'payments':
        return !(await this.getSwitchStatus('pause-payments'));
      case 'payroll':
        return !(await this.getSwitchStatus('pause-payroll'));
      case 'user-registrations':
        return !(await this.getSwitchStatus('disable-user-registrations'));
      case 'notifications':
        return !(await this.getSwitchStatus('pause-notifications'));
      default:
        return true;
    }
  }

  static async getSystemStatus(): Promise<{
    overall: 'operational' | 'degraded' | 'critical';
    activeSwitches: KillSwitch[];
    impactedFeatures: string[];
  }> {
    const activeSwitches = await this.checkActiveSwitches();
    
    const criticalSwitches = activeSwitches.filter(sw => sw.impact === 'critical');
    const highSwitches = activeSwitches.filter(sw => sw.impact === 'high');

    let overall: 'operational' | 'degraded' | 'critical';
    if (criticalSwitches.length > 0) {
      overall = 'critical';
    } else if (highSwitches.length > 0 || activeSwitches.length > 0) {
      overall = 'degraded';
    } else {
      overall = 'operational';
    }

    const impactedFeatures = activeSwitches.map(sw => sw.category);

    return {
      overall,
      activeSwitches,
      impactedFeatures
    };
  }

  private static async sendCriticalAlert(
    killSwitch: KillSwitch, 
    userId: string, 
    reason: string
  ): Promise<void> {
    // Send critical alert to administrators
    console.log(`CRITICAL: Kill switch "${killSwitch.name}" activated by ${userId}`);
    console.log(`Reason: ${reason}`);
    console.log(`Impact: ${killSwitch.impact}`);

    // Would integrate with:
    // - PagerDuty
    // - Slack critical channel
    // - SMS alerts
    // - Email notifications
  }
}

// Middleware to check kill switches before processing
export function withKillSwitchCheck(feature: string) {
  return async (req: Request, res: Response) => {
    const isEnabled = await KillSwitchManager.isSystemFeatureEnabled(feature);
    
    if (!isEnabled) {
      return Response.json(
        { error: 'Feature temporarily disabled' },
        { status: 503 }
      );
    }
    
    return null; // Continue processing
  };
}

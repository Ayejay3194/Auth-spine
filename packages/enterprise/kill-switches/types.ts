/**
 * Kill Switches Types - Type definitions for kill switches system
 */

export interface KillSwitch {
  id: string;
  name: string;
  description: string;
  category: 'critical' | 'warning' | 'info';
  enabled: boolean;
  activatedAt?: Date;
  activatedBy?: string;
  reason?: string;
  autoDisableAt?: Date;
  impact: string;
}

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'critical';
  services: ServiceStatus[];
  activeSwitches: KillSwitch[];
  lastChecked: Date;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: Date;
}

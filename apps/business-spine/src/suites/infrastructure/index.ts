// Infrastructure Domain Suite Index
// Exports all infrastructure-related functionality

// Monitoring Suite
export * from "@core/monitoring";

// Deployment Suite
export * from './deployment';

// Kill Switches Suite
export * from './kill-switches';

// Operations Dashboard Suite
export * from './ops-dashboard';

// Infrastructure Types
export interface InfrastructureMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  timestamp: Date;
}

export interface DeploymentStatus {
  id: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  startedAt: Date;
  completedAt?: Date;
  deployedBy: string;
  changes: string[];
}

export interface KillSwitch {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggeredBy?: string;
  triggeredAt?: Date;
  reason?: string;
  scope: 'global' | 'service' | 'feature' | 'user';
  services: string[];
}

export interface OperationsAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'critical';
  service: string;
  message: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    responseTime: number;
    errorRate: number;
  }>;
  uptime: number;
  lastIncident?: Date;
}

// Infrastructure Constants
export const INFRASTRUCTURE_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
} as const;

export const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  DEPLOYING: 'deploying',
  SUCCESS: 'success',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back'
} as const;

export const KILL_SWITCH_SCOPES = {
  GLOBAL: 'global',
  SERVICE: 'service',
  FEATURE: 'feature',
  USER: 'user'
} as const;

export const ALERT_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  CRITICAL: 'critical'
} as const;

export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy'
} as const;

export const MONITORING_THRESHOLDS = {
  CPU_WARNING: 70,
  CPU_CRITICAL: 90,
  MEMORY_WARNING: 80,
  MEMORY_CRITICAL: 95,
  DISK_WARNING: 85,
  DISK_CRITICAL: 95,
  RESPONSE_TIME_WARNING: 1000,
  RESPONSE_TIME_CRITICAL: 5000,
  ERROR_RATE_WARNING: 5,
  ERROR_RATE_CRITICAL: 10
} as const;

// Enterprise Security Suite - Enterprise Security
// Exports enterprise security-related functionality

// Enterprise Security Components
export { default as EnterpriseSecurityManager } from './components/EnterpriseSecurityManager';
export { default as ThreatDetection } from './components/ThreatDetection';
export { default as SecurityCompliance } from './components/SecurityCompliance';

// Enterprise Security Hooks
export { default as useEnterpriseSecurity } from './hooks/useEnterpriseSecurity';
export { default as useThreatDetection } from './hooks/useThreatDetection';

// Enterprise Security Services
export { default as enterpriseSecurityService } from './services/enterpriseSecurityService';

// Enterprise Security Types
export interface EnterpriseSecurity {
  id: string;
  tenantId: string;
  type: 'data_loss_prevention' | 'intrusion_detection' | 'access_control' | 'encryption';
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  alerts: SecurityAlert[];
  incidents: SecurityIncident[];
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'access_control' | 'data_protection' | 'network_security';
  rules: SecurityRule[];
  isActive: boolean;
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Enterprise Security Constants
export const SECURITY_TYPES = {
  DATA_LOSS_PREVENTION: 'data_loss_prevention',
  INTRUSION_DETECTION: 'intrusion_detection',
  ACCESS_CONTROL: 'access_control',
  ENCRYPTION: 'encryption'
} as const;

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

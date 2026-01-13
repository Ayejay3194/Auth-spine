/**
 * Module contracts and interfaces
 */

export interface ModuleRequest {
  moduleId: string;
  userId: string;
  tenantId?: string;
  action: string;
  data?: any;
}

export interface ModuleResponse {
  success: boolean;
  data?: any;
  error?: string;
  moduleId: string;
}

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
}

export interface ModuleHealth {
  moduleId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  metrics: Record<string, number>;
  errors: string[];
}

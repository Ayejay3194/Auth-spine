/**
 * Adapter contracts and interfaces
 */

export interface AdapterRequest {
  adapterId: string;
  action: string;
  data?: any;
  timeout?: number;
}

export interface AdapterResponse {
  success: boolean;
  data?: any;
  error?: string;
  adapterId: string;
  processingTime: number;
}

export interface AdapterConfig {
  id: string;
  type: string;
  enabled: boolean;
  settings: Record<string, any>;
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
}

export interface AdapterHealth {
  adapterId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  lastError?: string;
}

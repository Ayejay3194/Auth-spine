// PaaS Suite - Platform as a Service
// Exports PaaS-related functionality

// PaaS Components
// export { default as ServiceManager } from './components/ServiceManager';
// export { default as ResourceManager } from './components/ResourceManager';
// export { default as DeploymentManager } from './components/DeploymentManager';

// PaaS Hooks
// export { default as useServices } from './hooks/useServices';
// export { default as useResources } from './hooks/useResources';
// export { default as useDeployments } from './hooks/useDeployments';

// PaaS Services
// export { default as paasService } from './services/paasService';

// PaaS Types
export interface PaaSService {
  id: string;
  name: string;
  type: 'database' | 'storage' | 'compute' | 'network' | 'security';
  status: 'running' | 'stopped' | 'error';
  tenantId: string;
  configuration: Record<string, any>;
  metrics: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
  createdAt: Date;
}

export interface PaaSResource {
  id: string;
  type: 'cpu' | 'memory' | 'storage' | 'bandwidth';
  allocated: number;
  used: number;
  available: number;
  unit: string;
  cost: number;
}

export interface PaaSDeployment {
  id: string;
  serviceId: string;
  version: string;
  status: 'pending' | 'deploying' | 'success' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  deployedBy: string;
  changes: string[];
}

// PaaS Constants
export const PAAS_SERVICE_TYPES = {
  DATABASE: 'database',
  STORAGE: 'storage',
  COMPUTE: 'compute',
  NETWORK: 'network',
  SECURITY: 'security'
} as const;

export const PAAS_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error'
} as const;

export const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  DEPLOYING: 'deploying',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const;

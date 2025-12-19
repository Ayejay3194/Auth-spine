// APIs Suite - External APIs
// Exports API-related functionality

// API Components
// export { default as APIClient } from './components/APIClient';
// export { default as APIExplorer } from './components/APIExplorer';
// export { default as APIDocumentation } from './components/APIDocumentation';

// API Hooks
// export { default as useAPI } from './hooks/useAPI';
// export { default as useAPIData } from './hooks/useAPIData';

// API Services
// export { default as apiService } from './services/apiService';

// API Types
export interface ExternalAPI {
  id: string;
  name: string;
  baseUrl: string;
  version: string;
  authentication: {
    type: 'bearer' | 'basic' | 'api_key' | 'oauth2';
    credentials: Record<string, string>;
  };
  endpoints: APIEndpoint[];
  rateLimit?: {
    requests: number;
    window: number;
  };
}

export interface APIEndpoint {
  id: string;
  apiId: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: APIParameter[];
  responseSchema?: Record<string, any>;
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
}

// API Constants
export const API_AUTH_TYPES = {
  BEARER: 'bearer',
  BASIC: 'basic',
  API_KEY: 'api_key',
  OAUTH2: 'oauth2'
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

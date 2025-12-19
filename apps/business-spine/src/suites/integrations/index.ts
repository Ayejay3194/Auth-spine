// Integrations Domain Suite Index
// Exports all integration-related functionality

// Payments Suite
export * from './payments';

// Notifications Suite
export * from './notifications';

// Storage Suite
export * from './storage';

// APIs Suite
export * from './apis';

// Integration Types
export interface PaymentProvider {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'square' | 'adyen' | 'custom';
  isActive: boolean;
  configuration: Record<string, any>;
  supportedCurrencies: string[];
  features: string[];
}

export interface PaymentTransaction {
  id: string;
  providerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  customerId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
}

export interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack';
  name: string;
  configuration: Record<string, any>;
  isActive: boolean;
  templates: NotificationTemplate[];
}

export interface NotificationTemplate {
  id: string;
  channelId: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
}

export interface StorageProvider {
  id: string;
  name: string;
  type: 's3' | 'azure' | 'gcs' | 'local' | 'custom';
  configuration: Record<string, any>;
  buckets: StorageBucket[];
}

export interface StorageBucket {
  id: string;
  providerId: string;
  name: string;
  region: string;
  isPublic: boolean;
  size: number;
  objectCount: number;
  createdAt: Date;
}

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

// Integration Constants
export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  SQUARE: 'square',
  ADYEN: 'adyen',
  CUSTOM: 'custom'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WEBHOOK: 'webhook',
  SLACK: 'slack'
} as const;

export const STORAGE_PROVIDERS = {
  S3: 's3',
  AZURE: 'azure',
  GCS: 'gcs',
  LOCAL: 'local',
  CUSTOM: 'custom'
} as const;

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

export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'
] as const;

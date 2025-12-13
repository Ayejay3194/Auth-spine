import axios, { AxiosInstance } from 'axios';

export interface BusinessSpineConfig {
  url: string;
  apiKey: string;
  tenantId: string;
  timeout: number;
}

export interface InitializationResponse {
  success: boolean;
  tenantId: string;
  modules: string[];
  timestamp: string;
}

export class BusinessSpineClient {
  private client: AxiosInstance;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: BusinessSpineConfig) {
    this.client = axios.create({
      baseURL: config.url,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Tenant-ID': config.tenantId,
        'Content-Type': 'application/json'
      }
    });
  }

  async initialize(): Promise<InitializationResponse> {
    if (this.initialized) {
      return { success: true, tenantId: '', modules: [], timestamp: new Date().toISOString() };
    }

    if (this.initPromise) {
      await this.initPromise;
      return { success: true, tenantId: '', modules: [], timestamp: new Date().toISOString() };
    }

    this.initPromise = this._performInitialization();
    await this.initPromise;

    return { success: true, tenantId: '', modules: [], timestamp: new Date().toISOString() };
  }

  private async _performInitialization(): Promise<void> {
    try {
      const response = await this.client.post('/api/business/init', {});
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Business Spine:', error);
      throw new Error('Business Spine initialization failed');
    }
  }

  async chat(message: string, context: any) {
    return this.client.post('/assistant/chat', { message, context });
  }

  async detectIntents(message: string, context: any) {
    return this.client.post('/assistant/intent', { message, context });
  }

  async getSuggestions(context: any) {
    return this.client.post('/assistant/suggestions', { context });
  }

  async getSystemInfo() {
    return this.client.get('/system/info');
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

let businessSpineInstance: BusinessSpineClient | null = null;

export function getBusinessSpineClient(): BusinessSpineClient {
  if (!businessSpineInstance) {
    const config: BusinessSpineConfig = {
      url: process.env.NEXT_PUBLIC_BUSINESS_SPINE_URL || 'http://localhost:3001',
      apiKey: process.env.BUSINESS_SPINE_API_KEY || '',
      tenantId: process.env.BUSINESS_SPINE_TENANT_ID || 'default-tenant',
      timeout: parseInt(process.env.BUSINESS_SPINE_INIT_TIMEOUT || '30000')
    };

    businessSpineInstance = new BusinessSpineClient(config);
  }

  return businessSpineInstance;
}

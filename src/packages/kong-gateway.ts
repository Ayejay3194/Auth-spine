/**
 * Kong Gateway for Supabase At Home Pack
 * 
 * Provides Kong API gateway configuration, plugin management,
 * and routing for local development.
 */

import { KongEnvironment, KongRoute, KongPlugin, KongService } from './types.js';

export class KongGatewayManager {
  private config: any;
  private environment: KongEnvironment;
  private initialized = false;

  /**
   * Initialize Kong gateway
   */
  async initialize(config: any): Promise<void> {
    this.config = config;
    this.environment = {
      admin: {
        url: `http://localhost:${config.adminPort}`,
        port: config.adminPort,
        version: '3.0',
        status: 'stopped'
      },
      proxy: {
        url: `http://localhost:${config.proxyPort}`,
        port: config.proxyPort,
        status: 'stopped',
        upstreams: new Map()
      },
      plugins: new Map(),
      routes: new Map(),
      services: new Map(),
      consumers: new Map()
    };
    
    await this.loadDefaultPlugins();
    this.initialized = true;
  }

  /**
   * Start Kong gateway
   */
  async start(): Promise<void> {
    try {
      // Wait for Kong to be ready
      await this.waitForKong();
      
      // Enable plugins
      await this.enablePlugins();
      
      // Setup default routes
      await this.setupDefaultRoutes();
      
      this.environment.admin.status = 'running';
      this.environment.proxy.status = 'running';
    } catch (error) {
      console.error('Failed to start Kong gateway:', error);
      throw error;
    }
  }

  /**
   * Stop Kong gateway
   */
  async stop(): Promise<void> {
    try {
      this.environment.admin.status = 'stopped';
      this.environment.proxy.status = 'stopped';
    } catch (error) {
      console.error('Failed to stop Kong gateway:', error);
      throw error;
    }
  }

  /**
   * Add service
   */
  async addService(service: {
    name: string;
    url: string;
    protocol?: string;
    host?: string;
    port?: number;
    path?: string;
  }): Promise<void> {
    try {
      const serviceData: KongService = {
        id: this.generateId(),
        name: service.name,
        url: service.url,
        protocol: service.protocol || 'http',
        host: service.host || 'localhost',
        port: service.port || 80,
        path: service.path || '/',
        retries: 3,
        connect_timeout: 60000,
        write_timeout: 60000,
        read_timeout: 60000
      };

      await this.createService(serviceData);
      this.environment.services.set(service.name, serviceData);
    } catch (error) {
      console.error('Failed to add service:', error);
      throw error;
    }
  }

  /**
   * Add route
   */
  async addRoute(route: {
    name: string;
    paths: string[];
    methods: string[];
    hosts?: string[];
    protocols?: string[];
    service: string;
    stripPath?: boolean;
    preserveHost?: boolean;
  }): Promise<void> {
    try {
      const service = this.environment.services.get(route.service);
      if (!service) {
        throw new Error(`Service not found: ${route.service}`);
      }

      const routeData: KongRoute = {
        id: this.generateId(),
        name: route.name,
        paths: route.paths,
        methods: route.methods,
        hosts: route.hosts || [],
        protocols: route.protocols || ['http'],
        strip_path: route.stripPath ?? true,
        preserve_host: route.preserveHost ?? false,
        service: service.id
      };

      await this.createRoute(routeData);
      this.environment.routes.set(route.name, routeData);
    } catch (error) {
      console.error('Failed to add route:', error);
      throw error;
    }
  }

  /**
   * Add plugin
   */
  async addPlugin(plugin: {
    name: string;
    config: Record<string, any>;
    service?: string;
    route?: string;
    consumer?: string;
  }): Promise<void> {
    try {
      const pluginData: KongPlugin = {
        name: plugin.name,
        enabled: true,
        config: plugin.config,
        service: plugin.service,
        route: plugin.route,
        consumer: plugin.consumer
      };

      await this.enablePlugin(pluginData);
      this.environment.plugins.set(plugin.name, pluginData);
    } catch (error) {
      console.error('Failed to add plugin:', error);
      throw error;
    }
  }

  /**
   * Add consumer
   */
  async addConsumer(consumer: {
    username: string;
    customId?: string;
  }): Promise<void> {
    try {
      const consumerData = {
        id: this.generateId(),
        username: consumer.username,
        custom_id: consumer.customId || '',
        plugins: [],
        jwt_secrets: [],
        keyauth_credentials: []
      };

      await this.createConsumer(consumerData);
      this.environment.consumers.set(consumer.username, consumerData);
    } catch (error) {
      console.error('Failed to add consumer:', error);
      throw error;
    }
  }

  /**
   * Get status
   */
  async getStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.environment.admin.url}/`, {
        method: 'GET'
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<{
    requests: number;
    connections: number;
    plugins: number;
    services: number;
    routes: number;
  }> {
    try {
      // Mock metrics - in real implementation would query Kong Admin API
      return {
        requests: Math.floor(Math.random() * 1000),
        connections: Math.floor(Math.random() * 100),
        plugins: this.environment.plugins.size,
        services: this.environment.services.size,
        routes: this.environment.routes.size
      };
    } catch (error) {
      return {
        requests: 0,
        connections: 0,
        plugins: 0,
        services: 0,
        routes: 0
      };
    }
  }

  /**
   * Generate Kong configuration
   */
  generateConfig(config: any): {
    kong: string;
    declarative: string;
  } {
    const kongConfig = this.generateKongConfig(config);
    const declarativeConfig = this.generateDeclarativeConfig(config);

    return {
      kong: kongConfig,
      declarative: declarativeConfig
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    this.environment.plugins.clear();
    this.environment.routes.clear();
    this.environment.services.clear();
    this.environment.consumers.clear();
  }

  private async loadDefaultPlugins(): Promise<void> {
    const defaultPlugins = [
      { name: 'cors', config: { origins: ['*'], methods: ['GET', 'POST', 'PUT', 'DELETE'], headers: ['Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Auth-Token'] } },
      { name: 'rate-limiting', config: { minute: 1000, hour: 10000 } },
      { name: 'key-auth', config: {} },
      { name: 'jwt', config: {} },
      { name: 'request-transformer', config: {} }
    ];

    for (const plugin of defaultPlugins) {
      this.environment.plugins.set(plugin.name, {
        name: plugin.name,
        enabled: true,
        config: plugin.config
      });
    }
  }

  private async waitForKong(): Promise<void> {
    const maxAttempts = 30;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${this.environment.admin.url}/`, {
          method: 'GET'
        });
        
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Kong not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Kong failed to start within 60 seconds');
  }

  private async enablePlugins(): Promise<void> {
    for (const [name, plugin] of this.environment.plugins.entries()) {
      try {
        await this.enablePlugin(plugin);
      } catch (error) {
        console.error(`Failed to enable plugin ${name}:`, error);
      }
    }
  }

  private async setupDefaultRoutes(): Promise<void> {
    // Setup Supabase routes
    await this.addService({
      name: 'supabase-postgrest',
      url: 'http://supabase:3000',
      host: 'supabase',
      port: 3000
    });

    await this.addRoute({
      name: 'supabase-rest',
      paths: ['/rest/v1'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      service: 'supabase-postgrest'
    });

    await this.addService({
      name: 'supabase-auth',
      url: 'http://auth:9999',
      host: 'auth',
      port: 9999
    });

    await this.addRoute({
      name: 'supabase-auth',
      paths: ['/auth/v1'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      service: 'supabase-auth'
    });

    await this.addService({
      name: 'supabase-storage',
      url: 'http://storage:5000',
      host: 'storage',
      port: 5000
    });

    await this.addRoute({
      name: 'supabase-storage',
      paths: ['/storage/v1'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      service: 'supabase-storage'
    });

    await this.addService({
      name: 'supabase-functions',
      url: 'http://functions:9000',
      host: 'functions',
      port: 9000
    });

    await this.addRoute({
      name: 'supabase-functions',
      paths: ['/functions/v1'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      service: 'supabase-functions'
    });
  }

  private async createService(service: KongService): Promise<void> {
    try {
      const response = await fetch(`${this.environment.admin.url}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: service.name,
          url: service.url,
          protocol: service.protocol,
          host: service.host,
          port: service.port,
          path: service.path,
          retries: service.retries,
          connect_timeout: service.connect_timeout,
          write_timeout: service.write_timeout,
          read_timeout: service.read_timeout
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create service: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  }

  private async createRoute(route: KongRoute): Promise<void> {
    try {
      const response = await fetch(`${this.environment.admin.url}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: route.name,
          paths: route.paths,
          methods: route.methods,
          hosts: route.hosts,
          protocols: route.protocols,
          strip_path: route.strip_path,
          preserve_host: route.preserve_host,
          service: { id: route.service }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create route: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to create route:', error);
      throw error;
    }
  }

  private async enablePlugin(plugin: KongPlugin): Promise<void> {
    try {
      const pluginData: any = {
        name: plugin.name,
        enabled: plugin.enabled,
        config: plugin.config
      };

      if (plugin.service) {
        pluginData.service = { id: plugin.service };
      }

      if (plugin.route) {
        pluginData.route = { id: plugin.route };
      }

      if (plugin.consumer) {
        pluginData.consumer = { id: plugin.consumer };
      }

      const response = await fetch(`${this.environment.admin.url}/plugins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pluginData)
      });

      if (!response.ok) {
        throw new Error(`Failed to enable plugin: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to enable plugin:', error);
      throw error;
    }
  }

  private async createConsumer(consumer: any): Promise<void> {
    try {
      const response = await fetch(`${this.environment.admin.url}/consumers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: consumer.username,
          custom_id: consumer.custom_id
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create consumer: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to create consumer:', error);
      throw error;
    }
  }

  private generateKongConfig(config: any): string {
    return `# Kong Configuration
# Generated on ${new Date().toISOString()}

# Database
database: off

# Declarative Configuration
declarative_config: /kong/declarative/kong.yml

# Logging
proxy_access_log: /dev/stdout
admin_access_log: /dev/stdout
proxy_error_log: /dev/stderr
admin_error_log: /dev/stderr

# Admin API
admin_listen: 0.0.0.0:${config.adminPort}
admin_gui_url: http://localhost:8002

# Plugins
plugins: bundled,cors,rate-limiting,key-auth,jwt,request-transformer

# Performance
nginx_worker_processes: auto
nginx_daemon: off
nginx_http_include: /kong/nginx.conf

# Security
anonymous_reports: off
`;
  }

  private generateDeclarativeConfig(config: any): string {
    return `_format_version: "3.0"

services:
- name: supabase-postgrest
  url: http://supabase:3000
  plugins:
  - name: cors
    config:
      origins: ["*"]
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
      headers: ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "Authorization", "X-Auth-Token"]
      credentials: true
  - name: rate-limiting
    config:
      minute: 1000
      hour: 10000

- name: supabase-auth
  url: http://auth:9999
  plugins:
  - name: cors
    config:
      origins: ["*"]
      methods: ["GET", "POST", "PUT", "DELETE"]
      headers: ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "Authorization"]
      credentials: true

- name: supabase-storage
  url: http://storage:5000
  plugins:
  - name: cors
    config:
      origins: ["*"]
      methods: ["GET", "POST", "PUT", "DELETE"]
      headers: ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "Authorization"]
      credentials: true

- name: supabase-functions
  url: http://functions:9000
  plugins:
  - name: cors
    config:
      origins: ["*"]
      methods: ["GET", "POST", "PUT", "DELETE"]
      headers: ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "Authorization"]
      credentials: true

routes:
- name: supabase-rest
  service: supabase-postgrest
  paths: ["/rest/v1"]
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  strip_path: false

- name: supabase-auth
  service: supabase-auth
  paths: ["/auth/v1"]
  methods: ["GET", "POST", "PUT", "DELETE"]
  strip_path: false

- name: supabase-storage
  service: supabase-storage
  paths: ["/storage/v1"]
  methods: ["GET", "POST", "PUT", "DELETE"]
  strip_path: false

- name: supabase-functions
  service: supabase-functions
  paths: ["/functions/v1"]
  methods: ["GET", "POST", "PUT", "DELETE"]
  strip_path: false

consumers:
- username: anonymous
  plugins:
  - name: key-auth
    config: {}
  - name: jwt
    config: {}
`;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const kongGateway = new KongGatewayManager();

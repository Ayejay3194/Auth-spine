/**
 * Main Supabase At Home Class
 * 
 * Local development environment with Docker, Kong gateway,
 * and development tools for Supabase applications.
 */

import { SupabaseAtHomeConfig, LocalDevelopmentEnvironment } from './types.js';
import { localDevelopment } from './local-development.js';
import { dockerSetup } from './docker-setup.js';
import { kongGateway } from './kong-gateway.js';
import { developmentScripts } from './development-scripts.js';

export class SupabaseAtHome {
  private config: SupabaseAtHomeConfig;
  private environment: LocalDevelopmentEnvironment;
  private initialized = false;

  constructor(config: Partial<SupabaseAtHomeConfig> = {}) {
    this.config = {
      docker: {
        enabled: true,
        compose: 'docker-compose.yml',
        services: ['postgres', 'kong', 'supabase', 'studio'],
        ports: {
          postgres: 5432,
          kong: 8000,
          supabase: 8000,
          studio: 3000
        }
      },
      kong: {
        enabled: true,
        adminPort: 8001,
        proxyPort: 8000,
        plugins: ['cors', 'rate-limiting', 'key-auth', 'jwt'],
        routes: []
      },
      development: {
        hotReload: true,
        watchFiles: ['**/*.ts', '**/*.js', '**/*.sql'],
        autoMigrate: true,
        seedData: true
      },
      monitoring: {
        enabled: true,
        metrics: true,
        logs: true,
        healthChecks: true
      },
      ...config
    };

    this.environment = {
      docker: {
        running: false,
        containers: new Map(),
        networks: new Map(),
        volumes: new Map(),
        compose: {
          file: this.config.docker.compose,
          version: '3.8',
          services: new Map(),
          networks: new Map(),
          volumes: new Map()
        }
      },
      kong: {
        admin: {
          url: `http://localhost:${this.config.kong.adminPort}`,
          port: this.config.kong.adminPort,
          version: '3.0',
          status: 'stopped'
        },
        proxy: {
          url: `http://localhost:${this.config.kong.proxyPort}`,
          port: this.config.kong.proxyPort,
          status: 'stopped',
          upstreams: new Map()
        },
        plugins: new Map(),
        routes: new Map(),
        services: new Map(),
        consumers: new Map()
      },
      supabase: {
        url: 'http://localhost:8000',
        anonKey: '',
        serviceKey: '',
        db: {
          host: 'localhost',
          port: 5432,
          name: 'postgres',
          user: 'postgres',
          password: 'postgres',
          ssl: false,
          poolSize: 10,
          migrations: []
        },
        auth: {
          url: 'http://localhost:8000/auth/v1',
          jwtSecret: '',
          refreshTokenExpiry: 604800,
          accessTokenExpiry: 3600,
          enabledProviders: ['email'],
          externalProviders: []
        },
        storage: {
          url: 'http://localhost:8000/storage/v1',
          buckets: [],
          policies: [],
          fileSizeLimit: 52428800
        },
        functions: {
          url: 'http://localhost:8000/functions/v1',
          functions: [],
          secrets: {}
        },
        realtime: {
          url: 'ws://localhost:8000/realtime/v1',
          channels: [],
          maxConnections: 100,
          heartbeatInterval: 30000
        }
      },
      development: {
        hotReload: this.config.development.hotReload,
        watchFiles: this.config.development.watchFiles,
        watchers: [],
        scripts: [],
        autoMigrate: this.config.development.autoMigrate,
        seedData: this.config.development.seedData
      },
      monitoring: {
        metrics: {
          enabled: this.config.monitoring.metrics,
          port: 9090,
          path: '/metrics',
          collectors: ['docker', 'kong', 'supabase'],
          retention: 86400
        },
        logs: {
          enabled: this.config.monitoring.logs,
          level: 'info',
          format: 'json',
          outputs: [{ type: 'console', config: {} }],
          retention: 604800
        },
        healthChecks: {
          enabled: this.config.monitoring.healthChecks,
          endpoints: [],
          interval: 30000,
          timeout: 5000
        },
        alerts: {
          enabled: false,
          channels: [],
          rules: []
        }
      }
    };
  }

  /**
   * Initialize the Supabase At Home environment
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Docker environment
      if (this.config.docker.enabled) {
        await dockerSetup.initialize(this.config.docker);
      }

      // Initialize Kong gateway
      if (this.config.kong.enabled) {
        await kongGateway.initialize(this.config.kong);
      }

      // Initialize development environment
      await localDevelopment.initialize(this.config.development);

      // Initialize development scripts
      await developmentScripts.initialize(this.config.development);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase At Home:', error);
      throw error;
    }
  }

  /**
   * Start the development environment
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Start Docker containers
      if (this.config.docker.enabled) {
        await dockerSetup.start();
        this.environment.docker.running = true;
      }

      // Start Kong gateway
      if (this.config.kong.enabled) {
        await kongGateway.start();
        this.environment.kong.admin.status = 'running';
        this.environment.kong.proxy.status = 'running';
      }

      // Start development services
      await localDevelopment.start();

      // Start file watchers
      if (this.config.development.hotReload) {
        await localDevelopment.startWatchers();
      }

      console.log('Supabase At Home environment started successfully');
    } catch (error) {
      console.error('Failed to start Supabase At Home:', error);
      throw error;
    }
  }

  /**
   * Stop the development environment
   */
  async stop(): Promise<void> {
    try {
      // Stop file watchers
      if (this.config.development.hotReload) {
        await localDevelopment.stopWatchers();
      }

      // Stop development services
      await localDevelopment.stop();

      // Stop Kong gateway
      if (this.config.kong.enabled) {
        await kongGateway.stop();
        this.environment.kong.admin.status = 'stopped';
        this.environment.kong.proxy.status = 'stopped';
      }

      // Stop Docker containers
      if (this.config.docker.enabled) {
        await dockerSetup.stop();
        this.environment.docker.running = false;
      }

      console.log('Supabase At Home environment stopped successfully');
    } catch (error) {
      console.error('Failed to stop Supabase At Home:', error);
      throw error;
    }
  }

  /**
   * Restart the development environment
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * Get environment status
   */
  async getStatus(): Promise<{
    docker: boolean;
    kong: boolean;
    supabase: boolean;
    development: boolean;
    overall: boolean;
  }> {
    const dockerStatus = this.config.docker.enabled ? await dockerSetup.getStatus() : true;
    const kongStatus = this.config.kong.enabled ? await kongGateway.getStatus() : true;
    const supabaseStatus = await this.getSupabaseStatus();
    const devStatus = await localDevelopment.getStatus();

    return {
      docker: dockerStatus,
      kong: kongStatus,
      supabase: supabaseStatus,
      development: devStatus,
      overall: dockerStatus && kongStatus && supabaseStatus && devStatus
    };
  }

  /**
   * Get service URLs
   */
  getURLs(): {
    supabase: string;
    studio: string;
    kongAdmin: string;
    kongProxy: string;
    functions: string;
    storage: string;
    realtime: string;
  } {
    return {
      supabase: this.environment.supabase.url,
      studio: `http://localhost:${this.config.docker.ports.studio}`,
      kongAdmin: this.environment.kong.admin.url,
      kongProxy: this.environment.kong.proxy.url,
      functions: this.environment.supabase.functions.url,
      storage: this.environment.supabase.storage.url,
      realtime: this.environment.supabase.realtime.url
    };
  }

  /**
   * Get environment variables
   */
  getEnvironmentVariables(): Record<string, string> {
    return {
      SUPABASE_URL: this.environment.supabase.url,
      SUPABASE_ANON_KEY: this.environment.supabase.anonKey,
      SUPABASE_SERVICE_KEY: this.environment.supabase.serviceKey,
      SUPABASE_DB_URL: `postgresql://${this.environment.supabase.db.user}:${this.environment.supabase.db.password}@${this.environment.supabase.db.host}:${this.environment.supabase.db.port}/${this.environment.supabase.db.name}`,
      KONG_ADMIN_URL: this.environment.kong.admin.url,
      KONG_PROXY_URL: this.environment.kong.proxy.url
    };
  }

  /**
   * Run database migration
   */
  async runMigration(): Promise<void> {
    if (!this.environment.docker.running) {
      throw new Error('Docker environment not running');
    }

    await localDevelopment.runMigration();
  }

  /**
   * Seed database with test data
   */
  async seedDatabase(): Promise<void> {
    if (!this.environment.docker.running) {
      throw new Error('Docker environment not running');
    }

    await localDevelopment.seedDatabase();
  }

  /**
   * Add Kong route
   */
  async addKongRoute(route: {
    name: string;
    paths: string[];
    methods: string[];
    service: string;
  }): Promise<void> {
    if (!this.config.kong.enabled) {
      throw new Error('Kong not enabled');
    }

    await kongGateway.addRoute(route);
  }

  /**
   * Add Kong plugin
   */
  async addKongPlugin(plugin: {
    name: string;
    config: Record<string, any>;
    service?: string;
    route?: string;
  }): Promise<void> {
    if (!this.config.kong.enabled) {
      throw new Error('Kong not enabled');
    }

    await kongGateway.addPlugin(plugin);
  }

  /**
   * Get logs
   */
  async getLogs(service?: string, options: {
    follow?: boolean;
    tail?: number;
    since?: string;
  } = {}): Promise<string> {
    if (!this.environment.docker.running) {
      throw new Error('Docker environment not running');
    }

    return await dockerSetup.getLogs(service, options);
  }

  /**
   * Execute command in container
   */
  async execCommand(container: string, command: string[]): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    if (!this.environment.docker.running) {
      throw new Error('Docker environment not running');
    }

    return await dockerSetup.execCommand(container, command);
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SupabaseAtHomeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): SupabaseAtHomeConfig {
    return { ...this.config };
  }

  /**
   * Generate Docker Compose file
   */
  generateDockerCompose(): string {
    return dockerSetup.generateComposeFile(this.config);
  }

  /**
   * Generate Kong configuration
   */
  generateKongConfig(): {
    kong: string;
    declarative: string;
  } {
    return kongGateway.generateConfig(this.config.kong);
  }

  /**
   * Generate development scripts
   */
  generateDevScripts(): {
    start: string;
    stop: string;
    restart: string;
    logs: string;
    migrate: string;
    seed: string;
  } {
    return developmentScripts.generateScripts();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    
    await this.stop();
    await dockerSetup.cleanup();
    await kongGateway.cleanup();
    await localDevelopment.cleanup();
  }

  private async getSupabaseStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.environment.supabase.url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': this.environment.supabase.anonKey,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export default instance
export const supabaseAtHome = new SupabaseAtHome();

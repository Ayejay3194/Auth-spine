/**
 * Main Supabase At Home Pack Class
 * 
 * Complete Supabase development environment setup with Docker,
 * local development tools, and home deployment capabilities.
 */

import { SupabaseAtHomeConfig, SupabaseAtHomeMetrics, LocalEnvironment } from './types.js';
import { localDevelopment } from './local-development.js';
import { dockerSetup } from './docker-setup.js';
import { databaseMigrations } from './database-migrations.js';
import { apiGateway } from './api-gateway.js';
import { developmentTools } from './development-tools.js';

export class SupabaseAtHomePack {
  private config: SupabaseAtHomeConfig;
  private initialized = false;

  constructor(config: Partial<SupabaseAtHomeConfig> = {}) {
    this.config = {
      local: {
        enabled: true,
        docker: true,
        hotReload: true,
        debugging: true,
        testing: true,
        ...config.local
      },
      database: {
        enabled: true,
        migrations: true,
        seeds: true,
        backups: true,
        monitoring: true,
        ...config.database
      },
      api: {
        enabled: true,
        gateway: true,
        routing: true,
        middleware: true,
        documentation: true,
        ...config.api
      },
      tools: {
        enabled: true,
        cli: true,
        dashboard: true,
        logs: true,
        metrics: true,
        ...config.tools
      }
    };
  }

  /**
   * Initialize the Supabase at home pack
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all at home components
      await localDevelopment.initialize(this.config.local);
      await dockerSetup.initialize(this.config.local);
      await databaseMigrations.initialize(this.config.database);
      await apiGateway.initialize(this.config.api);
      await developmentTools.initialize(this.config.tools);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase at home pack:', error);
      throw error;
    }
  }

  /**
   * Setup local development environment
   */
  async setupLocalDevelopment(): Promise<void> {
    if (!this.config.local.enabled) {
      throw new Error('Local development not enabled');
    }

    try {
      await localDevelopment.setupHotReload();
      await localDevelopment.setupDebugging();
      await localDevelopment.setupTesting();
    } catch (error) {
      console.error('Failed to setup local development:', error);
      throw error;
    }
  }

  /**
   * Setup Docker environment
   */
  async setupDocker(): Promise<void> {
    if (!this.config.local.docker) {
      throw new Error('Docker not enabled');
    }

    try {
      await dockerSetup.setupContainers();
      await dockerSetup.setupVolumes();
      await dockerSetup.setupNetworking();
    } catch (error) {
      console.error('Failed to setup Docker:', error);
      throw error;
    }
  }

  /**
   * Setup database migrations
   */
  async setupDatabaseMigrations(): Promise<void> {
    if (!this.config.database.enabled) {
      throw new Error('Database not enabled');
    }

    try {
      await databaseMigrations.setupMigrations();
      await databaseMigrations.setupSeeds();
      await databaseMigrations.setupBackups();
    } catch (error) {
      console.error('Failed to setup database migrations:', error);
      throw error;
    }
  }

  /**
   * Setup API gateway
   */
  async setupAPIGateway(): Promise<void> {
    if (!this.config.api.enabled) {
      throw new Error('API gateway not enabled');
    }

    try {
      await apiGateway.setupGateway();
      await apiGateway.setupRouting();
      await apiGateway.setupMiddleware();
      await apiGateway.setupDocumentation();
    } catch (error) {
      console.error('Failed to setup API gateway:', error);
      throw error;
    }
  }

  /**
   * Setup development tools
   */
  async setupDevelopmentTools(): Promise<void> {
    if (!this.config.tools.enabled) {
      throw new Error('Development tools not enabled');
    }

    try {
      await developmentTools.setupCLI();
      await developmentTools.setupDashboard();
      await developmentTools.setupLogs();
      await developmentTools.setupMetrics();
    } catch (error) {
      console.error('Failed to setup development tools:', error);
      throw error;
    }
  }

  /**
   * Get local environments
   */
  async getLocalEnvironments(): Promise<LocalEnvironment[]> {
    try {
      const containers = await dockerSetup.getContainers();
      const services = await apiGateway.getServices();
      
      return [
        {
          id: 'local-dev',
          name: 'Local Development',
          type: 'development',
          status: 'active',
          containers,
          services,
          configuration: {
            database: {
              host: 'localhost',
              port: 5432,
              database: 'supabase_db',
              username: 'postgres',
              password: 'postgres',
              ssl: false,
              poolSize: 10
            },
            auth: {
              siteUrl: 'http://localhost:3000',
              jwtSecret: 'your-jwt-secret',
              refreshTokenRotation: true,
              signUpDisabled: false,
              externalProviders: []
            },
            storage: {
              fileSizeLimit: 52428800,
              allowedMimeTypes: ['image/*', 'application/pdf'],
              buckets: [],
              cdn: {
                enabled: false,
                domain: '',
                cacheTTL: 3600
              }
            },
            functions: {
              runtime: 'deno',
              memory: 128,
              timeout: 30000,
              environment: {},
              secrets: []
            },
            networking: {
              ports: [
                { name: 'postgres', container: 5432, host: 5432, protocol: 'tcp' },
                { name: 'api', container: 3000, host: 3000, protocol: 'tcp' }
              ],
              proxy: {
                enabled: true,
                rules: []
              },
              ssl: {
                enabled: false,
                certificate: '',
                privateKey: ''
              }
            }
          }
        }
      ];
    } catch (error) {
      console.error('Failed to get local environments:', error);
      throw error;
    }
  }

  /**
   * Get at home metrics
   */
  async getMetrics(): Promise<SupabaseAtHomeMetrics> {
    try {
      const localMetrics = await localDevelopment.getMetrics();
      const databaseMetrics = await databaseMigrations.getMetrics();
      const apiMetrics = await apiGateway.getMetrics();
      const toolsMetrics = await developmentTools.getMetrics();

      return {
        local: localMetrics,
        database: databaseMetrics,
        api: apiMetrics,
        tools: toolsMetrics,
        overall: {
          developmentSpeed: Math.floor((localMetrics.hotReloadEvents + toolsMetrics.cliCommands) / 2),
          reliability: Math.floor((100 - localMetrics.debuggingSessions * 0.1) * 0.9),
          resourceUsage: Math.floor((localMetrics.dockerContainers + databaseMetrics.connectionCount) / 2),
          productivity: Math.floor((localMetrics.testRuns + toolsMetrics.dashboardSessions) / 2)
        }
      };
    } catch (error) {
      console.error('Failed to get at home metrics:', error);
      throw error;
    }
  }

  /**
   * Generate development report
   */
  async generateReport(): Promise<{
    summary: any;
    local: any;
    database: any;
    api: any;
    tools: any;
    recommendations: any[];
  }> {
    try {
      const metrics = await this.getMetrics();

      return {
        summary: {
          developmentSpeed: metrics.overall.developmentSpeed,
          reliability: metrics.overall.reliability,
          resourceUsage: metrics.overall.resourceUsage,
          productivity: metrics.overall.productivity
        },
        local: {
          dockerContainers: metrics.local.dockerContainers,
          hotReloadEvents: metrics.local.hotReloadEvents,
          debuggingSessions: metrics.local.debuggingSessions,
          testRuns: metrics.local.testRuns
        },
        database: {
          migrationsApplied: metrics.database.migrationsApplied,
          seedDataLoaded: metrics.database.seedDataLoaded,
          backupsCreated: metrics.database.backupsCreated,
          queryPerformance: metrics.database.queryPerformance
        },
        api: {
          gatewayRequests: metrics.api.gatewayRequests,
          routesConfigured: metrics.api.routesConfigured,
          middlewareExecuted: metrics.api.middlewareExecuted,
          documentationViews: metrics.api.documentationViews
        },
        tools: {
          cliCommands: metrics.tools.cliCommands,
          dashboardSessions: metrics.tools.dashboardSessions,
          logEntries: metrics.tools.logEntries,
          metricsCollected: metrics.tools.metricsCollected
        },
        recommendations: [
          {
            priority: 'medium',
            description: 'Optimize Docker container resource usage'
          },
          {
            priority: 'low',
            description: 'Enhance hot reload performance'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate development report:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): SupabaseAtHomeConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SupabaseAtHomeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    local: boolean;
    docker: boolean;
    database: boolean;
    api: boolean;
    tools: boolean;
  }> {
    try {
      const local = this.config.local.enabled ? await localDevelopment.getHealthStatus() : true;
      const docker = this.config.local.docker ? await dockerSetup.getHealthStatus() : true;
      const database = this.config.database.enabled ? await databaseMigrations.getHealthStatus() : true;
      const api = this.config.api.enabled ? await apiGateway.getHealthStatus() : true;
      const tools = this.config.tools.enabled ? await developmentTools.getHealthStatus() : true;

      return {
        overall: this.initialized && local && docker && database && api && tools,
        local,
        docker,
        database,
        api,
        tools
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        local: false,
        docker: false,
        database: false,
        api: false,
        tools: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await localDevelopment.cleanup();
    await dockerSetup.cleanup();
    await databaseMigrations.cleanup();
    await apiGateway.cleanup();
    await developmentTools.cleanup();
  }
}

// Export default instance
export const supabaseAtHomePack = new SupabaseAtHomePack();

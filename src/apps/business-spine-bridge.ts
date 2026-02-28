/**
 * Business Spine Bridge
 *
 * Connects temp-spine with business-spine and enterprise_finish.
 * Provides adapters for integrating with existing business-spine infrastructure.
 */

import { AssistantContext, ToolResult } from '../core/types.js';
import { zipModuleConnector } from './zip-module-connector.js';

/**
 * Business Spine Configuration
 */
export type BusinessSpineConfig = {
  // Database
  databaseUrl?: string;
  prismaClient?: unknown;

  // Redis
  redisUrl?: string;
  redisClient?: unknown;

  // Queue
  queueUrl?: string;
  queueClient?: unknown;

  // Multi-tenancy
  tenantId?: string;

  // Feature flags
  features?: {
    diagnostics?: boolean;
    analytics?: boolean;
    automation?: boolean;
    smartEngines?: boolean;
  };
};

type ToolInput = Record<string, unknown> & {
  zipModuleId?: string;
  key?: string;
  id?: string;
  value?: unknown;
};

/**
 * Business Spine Bridge
 *
 * Bridges the temp-spine orchestrator with the business-spine infrastructure.
 */
export class BusinessSpineBridge {
  private readonly databaseStore = new Map<string, unknown>();
  private readonly cacheStore = new Map<string, unknown>();
  private readonly queueStore = new Map<string, Array<unknown>>();

  constructor(private config: BusinessSpineConfig = {}) {}

  /**
   * Initialize the bridge
   */
  async initialize(): Promise<void> {
    if (this.config.databaseUrl) {
      console.log(`✅ Database connection configured (${this.config.databaseUrl})`);
    }

    if (this.config.redisUrl) {
      console.log(`✅ Cache connection configured (${this.config.redisUrl})`);
    }

    if (this.config.queueUrl) {
      console.log(`✅ Queue connection configured (${this.config.queueUrl})`);
    }
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof BusinessSpineConfig['features']): boolean {
    return this.config.features?.[feature] ?? false;
  }

  /**
   * Get tenant ID
   */
  getTenantId(): string {
    return this.config.tenantId || 'default';
  }

  private async invokeZipModuleIfRequested(
    operation: string,
    ctx: AssistantContext,
    input: ToolInput,
    integration: 'database' | 'cache' | 'queue'
  ): Promise<ToolResult | null> {
    if (!input.zipModuleId) {
      return null;
    }

    if (!zipModuleConnector.hasModule(input.zipModuleId)) {
      return {
        ok: false,
        error: {
          code: 'ZIP_MODULE_NOT_FOUND',
          message: `Requested zip module '${input.zipModuleId}' was not found in the registry`,
          details: {
            integration,
            operation
          }
        }
      };
    }

    const moduleRecord = zipModuleConnector.getModule(input.zipModuleId);
    const moduleOutput = await zipModuleConnector.invoke(input.zipModuleId, {
      integration,
      operation,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      input
    });

    return {
      ok: true,
      data: {
        integration,
        operation,
        tenantId: ctx.tenantId,
        moduleId: input.zipModuleId,
        featureTags: moduleRecord?.featureTags ?? [],
        executable: Boolean(moduleRecord?.entryPoint),
        output: moduleOutput
      }
    };
  }

  /**
   * Create a database tool adapter
   */
  createDatabaseTool(operation: string): (args: { ctx: AssistantContext; input: ToolInput }) => Promise<ToolResult> {
    return async ({ ctx, input }) => {
      try {
        const moduleResult = await this.invokeZipModuleIfRequested(operation, ctx, input, 'database');
        if (moduleResult) {
          return moduleResult;
        }

        const recordId = String(input.id ?? input.key ?? `${ctx.tenantId}:${Date.now()}`);

        if (operation === 'create' || operation === 'update') {
          this.databaseStore.set(recordId, input.value ?? input);
          return {
            ok: true,
            data: {
              operation,
              tenantId: ctx.tenantId,
              id: recordId,
              value: this.databaseStore.get(recordId)
            }
          };
        }

        if (operation === 'get' || operation === 'read') {
          return {
            ok: true,
            data: {
              operation,
              tenantId: ctx.tenantId,
              id: recordId,
              value: this.databaseStore.get(recordId) ?? null
            }
          };
        }

        if (operation === 'delete') {
          const existed = this.databaseStore.delete(recordId);
          return {
            ok: true,
            data: {
              operation,
              tenantId: ctx.tenantId,
              id: recordId,
              deleted: existed
            }
          };
        }

        return {
          ok: true,
          data: {
            operation,
            tenantId: ctx.tenantId,
            records: this.databaseStore.size
          }
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error
          }
        };
      }
    };
  }

  /**
   * Create a cache tool adapter
   */
  createCacheTool(operation: string): (args: { ctx: AssistantContext; input: ToolInput }) => Promise<ToolResult> {
    return async ({ ctx, input }) => {
      try {
        const moduleResult = await this.invokeZipModuleIfRequested(operation, ctx, input, 'cache');
        if (moduleResult) {
          return moduleResult;
        }

        const key = String(input.key ?? input.id ?? 'default');

        if (operation === 'set') {
          this.cacheStore.set(key, input.value ?? null);
          return { ok: true, data: { operation, tenantId: ctx.tenantId, key, value: this.cacheStore.get(key) } };
        }

        if (operation === 'get') {
          return { ok: true, data: { operation, tenantId: ctx.tenantId, key, value: this.cacheStore.get(key) ?? null } };
        }

        if (operation === 'delete') {
          return { ok: true, data: { operation, tenantId: ctx.tenantId, key, deleted: this.cacheStore.delete(key) } };
        }

        return { ok: true, data: { operation, tenantId: ctx.tenantId, keys: this.cacheStore.size } };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: 'CACHE_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error
          }
        };
      }
    };
  }

  /**
   * Create a queue tool adapter
   */
  createQueueTool(operation: string): (args: { ctx: AssistantContext; input: ToolInput }) => Promise<ToolResult> {
    return async ({ ctx, input }) => {
      try {
        const moduleResult = await this.invokeZipModuleIfRequested(operation, ctx, input, 'queue');
        if (moduleResult) {
          return moduleResult;
        }

        const queueName = String(input.key ?? input.id ?? 'default');
        const jobs = this.queueStore.get(queueName) ?? [];

        if (operation === 'enqueue') {
          jobs.push(input.value ?? input);
          this.queueStore.set(queueName, jobs);
          return { ok: true, data: { operation, tenantId: ctx.tenantId, queue: queueName, depth: jobs.length } };
        }

        if (operation === 'dequeue') {
          const job = jobs.shift() ?? null;
          this.queueStore.set(queueName, jobs);
          return { ok: true, data: { operation, tenantId: ctx.tenantId, queue: queueName, job, depth: jobs.length } };
        }

        return { ok: true, data: { operation, tenantId: ctx.tenantId, queue: queueName, depth: jobs.length } };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: 'QUEUE_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error
          }
        };
      }
    };
  }

  /**
   * Shutdown the bridge
   */
  async shutdown(): Promise<void> {
    this.databaseStore.clear();
    this.cacheStore.clear();
    this.queueStore.clear();
  }
}

/**
 * Singleton instance
 */
let bridgeInstance: BusinessSpineBridge | null = null;

/**
 * Get or create the bridge instance
 */
export function getBusinessSpineBridge(config?: BusinessSpineConfig): BusinessSpineBridge {
  if (!bridgeInstance) {
    bridgeInstance = new BusinessSpineBridge(config);
  }
  return bridgeInstance;
}

/**
 * Reset the bridge instance (useful for testing)
 */
export function resetBusinessSpineBridge(): void {
  bridgeInstance = null;
}

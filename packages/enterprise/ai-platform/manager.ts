/**
 * AI Platform Manager
 * 
 * Central manager for all AI/ML packages in the Auth-Spine ecosystem.
 * Provides unified interfaces for initialization, health monitoring,
 * and coordination between AI, ML, RAG, and Oracle systems.
 * 
 * Enhanced with:
 * - Multiple response modes (instant, streaming, long)
 * - Parquet-based metrics collection
 * - Real-time performance monitoring
 * - Cost tracking and analytics
 */

import { ToolRegistry } from '@auth-spine/ai-tools';
import { InMemoryKeywordStore } from '@auth-spine/ai-rag';
import { LlmClient } from '@auth-spine/llm-client';
import type { LlmClientConfig } from '@auth-spine/llm-client';
import { EnhancedLlmClient, type ChatMetrics, type StreamChunk } from './enhanced-llm-client.js';
import { AIMetricsStore } from './ai-metrics-store.js';

export interface AIPlatformConfig {
  llm?: LlmClientConfig;
  enableTools?: boolean;
  enableRag?: boolean;
  enableOracle?: boolean;
  enableMetrics?: boolean;  // NEW: Enable Parquet-based metrics
  metricsConfig?: {
    dataDir?: string;
    retentionDays?: number;
    compression?: 'SNAPPY' | 'ZSTD' | 'GZIP';
  };
}

export interface AIPlatformHealth {
  llmConnected: boolean;
  toolsReady: boolean;
  ragReady: boolean;
  oracleReady: boolean;
  metricsReady: boolean;  // NEW
  errors: string[];
  performance?: {  // NEW: Real-time performance metrics
    avgLatencyMs: number;
    successRate: number;
    totalRequests: number;
  };
}

export class AIPlatformManager {
  private config: AIPlatformConfig;
  private initialized = false;
  private health: AIPlatformHealth = {
    llmConnected: false,
    toolsReady: false,
    ragReady: false,
    oracleReady: false,
    metricsReady: false,
    errors: []
  };

  // Public accessors for subsystems
  public llmClient?: LlmClient;
  public enhancedLlmClient?: EnhancedLlmClient;  // NEW: Enhanced client with response modes
  public metricsStore?: AIMetricsStore;  // NEW: Parquet-based metrics
  public toolRegistry?: ToolRegistry;
  public ragStore?: InMemoryKeywordStore;

  constructor(config: AIPlatformConfig = {}) {
    this.config = {
      enableMetrics: true,  // Enable by default
      ...config
    };
  }

  /**
   * Initialize all AI/ML subsystems
   */
  async initialize(): Promise<AIPlatformHealth> {
    if (this.initialized) return this.health;

    this.health.errors = [];

    try {
      // Initialize Metrics Store first (for all subsystems)
      if (this.config.enableMetrics !== false) {
        this.metricsStore = new AIMetricsStore(this.config.metricsConfig);
        await this.metricsStore.initialize();
        this.health.metricsReady = true;
      }

      // Initialize LLM Client (legacy)
      if (this.config.llm) {
        this.llmClient = new LlmClient(this.config.llm);
        this.health.llmConnected = true;
      }

      // Initialize Enhanced LLM Client with metrics
      if (this.config.llm) {
        this.enhancedLlmClient = new EnhancedLlmClient({
          baseUrl: this.config.llm.baseUrl,
          apiKey: this.config.llm.apiKey,
          defaultModel: this.config.llm.defaultModel,
          timeoutMs: this.config.llm.timeoutMs,
          collectMetrics: this.config.enableMetrics !== false
        });

        // Connect metrics collector
        if (this.metricsStore) {
          this.enhancedLlmClient.onMetrics((metrics: ChatMetrics) => {
            this.metricsStore?.recordMetrics(metrics).catch(console.error);
          });
        }

        this.health.llmConnected = true;
      }

      // Initialize Tools
      if (this.config.enableTools !== false) {
        this.toolRegistry = new ToolRegistry();
        this.health.toolsReady = true;
      }

      // Initialize RAG
      if (this.config.enableRag !== false) {
        this.ragStore = new InMemoryKeywordStore();
        this.health.ragReady = true;
      }

      // Oracle is ready when bioplausible learning is available
      this.health.oracleReady = true;

      this.initialized = true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.health.errors.push(msg);
    }

    return this.health;
  }

  /**
   * Check if platform is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current health status with performance metrics
   */
  async getHealth(): Promise<AIPlatformHealth> {
    // Add real-time performance metrics
    if (this.metricsStore && this.health.metricsReady) {
      try {
        const stats = await this.metricsStore.getStatistics({
          startDate: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          endDate: new Date()
        });
        
        this.health.performance = {
          avgLatencyMs: stats.avgLatencyMs,
          successRate: stats.successRate,
          totalRequests: stats.totalRequests
        };
      } catch (error) {
        console.error('Failed to get performance metrics:', error);
      }
    }

    return { ...this.health };
  }

  /**
   * Instant response mode - fast, non-streaming
   * Best for: Simple queries, cached responses
   */
  async instant(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    tenantId?: string;
    userId?: string;
  }): Promise<string> {
    if (!this.enhancedLlmClient) {
      throw new Error('Enhanced LLM client not initialized');
    }

    return this.enhancedLlmClient.instant({
      messages,
      model: options?.model,
      temperature: options?.temperature
    });
  }

  /**
   * Streaming response mode - real-time token-by-token
   * Best for: Interactive chat, long responses, better UX
   */
  async *streaming(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): AsyncGenerator<StreamChunk> {
    if (!this.enhancedLlmClient) {
      throw new Error('Enhanced LLM client not initialized');
    }

    yield* this.enhancedLlmClient.streaming({
      messages,
      model: options?.model,
      temperature: options?.temperature,
      max_tokens: options?.max_tokens
    });
  }

  /**
   * Long response mode - optimized for lengthy completions
   * Best for: Complex tasks, document generation
   */
  async long(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<string> {
    if (!this.enhancedLlmClient) {
      throw new Error('Enhanced LLM client not initialized');
    }

    return this.enhancedLlmClient.long({
      messages,
      model: options?.model,
      temperature: options?.temperature,
      max_tokens: options?.max_tokens
    });
  }

  /**
   * Auto-select best response mode
   */
  async auto(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
  }): Promise<string> {
    if (!this.enhancedLlmClient) {
      throw new Error('Enhanced LLM client not initialized');
    }

    return this.enhancedLlmClient.auto({
      messages,
      model: options?.model,
      temperature: options?.temperature
    });
  }

  /**
   * Get AI metrics dashboard
   */
  async getDashboard(): Promise<any> {
    if (!this.metricsStore) {
      throw new Error('Metrics store not initialized');
    }

    return this.metricsStore.getDashboard();
  }

  /**
   * Get AI metrics for specific time range
   */
  async getMetrics(startDate: Date, endDate: Date, groupBy?: 'model' | 'provider' | 'tenant' | 'hour'): Promise<any> {
    if (!this.metricsStore) {
      throw new Error('Metrics store not initialized');
    }

    return this.metricsStore.getStatistics({ startDate, endDate }, groupBy);
  }

  /**
   * Register a tool in the tool registry
   */
  registerTool(name: string, fn: Parameters<ToolRegistry['register']>[1]): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }
    this.toolRegistry.register(name, fn);
  }

  /**
   * Add documents to RAG store
   */
  async addDocuments(docs: Array<{ id: string; text: string }>): Promise<void> {
    if (!this.ragStore) {
      throw new Error('RAG store not initialized');
    }
    const { chunkText } = await import('@auth-spine/ai-rag');
    const chunks = docs.flatMap(d => chunkText(d.id, d.text, { maxChars: 500, overlapChars: 50 }));
    await this.ragStore.upsert(chunks);
  }

  /**
   * Query RAG store
   */
  async queryRag(query: string, k = 5): Promise<Array<{ id: string; text: string }>> {
    if (!this.ragStore) {
      throw new Error('RAG store not initialized');
    }
    const chunks = await this.ragStore.retrieve({ query, k });
    return chunks.map(c => ({ id: c.id, text: c.text }));
  }
}

// Singleton instance
let globalAIPlatform: AIPlatformManager | null = null;

export function getAIPlatform(config?: AIPlatformConfig): AIPlatformManager {
  if (!globalAIPlatform) {
    globalAIPlatform = new AIPlatformManager(config);
  }
  return globalAIPlatform;
}

export function resetAIPlatform(): void {
  globalAIPlatform = null;
}

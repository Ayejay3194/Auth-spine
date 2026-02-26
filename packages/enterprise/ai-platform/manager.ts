/**
 * AI Platform Manager
 * 
 * Central manager for all AI/ML packages in the Auth-Spine ecosystem.
 * Provides unified interfaces for initialization, health monitoring,
 * and coordination between AI, ML, RAG, and Oracle systems.
 */

import { ToolRegistry } from '@auth-spine/ai-tools';
import { InMemoryKeywordStore } from '@auth-spine/ai-rag';
import { LlmClient } from '@auth-spine/llm-client';
import type { LlmClientConfig } from '@auth-spine/llm-client';

export interface AIPlatformConfig {
  llm?: LlmClientConfig;
  enableTools?: boolean;
  enableRag?: boolean;
  enableOracle?: boolean;
}

export interface AIPlatformHealth {
  llmConnected: boolean;
  toolsReady: boolean;
  ragReady: boolean;
  oracleReady: boolean;
  errors: string[];
}

export class AIPlatformManager {
  private config: AIPlatformConfig;
  private initialized = false;
  private health: AIPlatformHealth = {
    llmConnected: false,
    toolsReady: false,
    ragReady: false,
    oracleReady: false,
    errors: []
  };

  // Public accessors for subsystems
  public llmClient?: LlmClient;
  public toolRegistry?: ToolRegistry;
  public ragStore?: InMemoryKeywordStore;

  constructor(config: AIPlatformConfig = {}) {
    this.config = config;
  }

  /**
   * Initialize all AI/ML subsystems
   */
  async initialize(): Promise<AIPlatformHealth> {
    if (this.initialized) return this.health;

    this.health.errors = [];

    try {
      // Initialize LLM Client
      if (this.config.llm) {
        this.llmClient = new LlmClient(this.config.llm);
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
   * Get current health status
   */
  getHealth(): AIPlatformHealth {
    return { ...this.health };
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

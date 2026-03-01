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
import { FeedbackCollector, type FeedbackEntry, type ThumbsFeedback } from './feedback-collector.js';
import { SupervisedLearner, type LearningMode, type LearningInsight, type ImprovementSuggestion } from './supervised-learner.js';
import { TrainingDataPipeline, type TrainingDataset } from './training-data-pipeline.js';
import { TrainingLoopOrchestrator, type TrainingJob, type RetrainingThresholds } from './training-loop-orchestrator.js';

export interface AIPlatformConfig {
  llm?: LlmClientConfig;
  enableTools?: boolean;
  enableRag?: boolean;
  enableOracle?: boolean;
  enableMetrics?: boolean;  // Enable Parquet-based metrics
  enableFeedback?: boolean;  // Enable feedback collection
  enableLearning?: boolean;  // Enable supervised learning
  enableTrainingLoop?: boolean;  // NEW: Enable automated training loops
  metricsConfig?: {
    dataDir?: string;
    retentionDays?: number;
    compression?: 'SNAPPY' | 'ZSTD' | 'GZIP';
  };
  feedbackConfig?: {
    dataDir?: string;
    promptAfterResponses?: number;
    proactivePrompts?: boolean;
  };
  learningConfig?: {
    mode?: LearningMode;
    minFeedbackForInsight?: number;
    requireApproval?: boolean;
  };
  trainingLoopConfig?: {  // NEW: Training loop configuration
    baseModel?: string;
    thresholds?: Partial<RetrainingThresholds>;
    schedule?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    requireApproval?: boolean;
    enableABTesting?: boolean;
  };
}

export interface AIPlatformHealth {
  llmConnected: boolean;
  toolsReady: boolean;
  ragReady: boolean;
  oracleReady: boolean;
  metricsReady: boolean;
  feedbackReady: boolean;
  learningReady: boolean;
  trainingLoopReady: boolean;  // NEW
  errors: string[];
  performance?: {
    avgLatencyMs: number;
    successRate: number;
    totalRequests: number;
  };
  feedback?: {
    totalFeedback: number;
    helpfulRate: number;
    avgRating: number;
  };
  learning?: {
    totalInsights: number;
    pendingSuggestions: number;
    approvedSuggestions: number;
  };
  trainingLoop?: {  // NEW: Training loop statistics
    activeJob: boolean;
    totalJobs: number;
    jobsAwaitingApproval: number;
    lastRetrainedAt?: Date;
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
    feedbackReady: false,
    learningReady: false,
    trainingLoopReady: false,
    errors: []
  };

  // Public accessors for subsystems
  public llmClient?: LlmClient;
  public enhancedLlmClient?: EnhancedLlmClient;
  public metricsStore?: AIMetricsStore;
  public feedbackCollector?: FeedbackCollector;
  public supervisedLearner?: SupervisedLearner;
  public trainingDataPipeline?: TrainingDataPipeline;  // NEW: Training data pipeline
  public trainingOrchestrator?: TrainingLoopOrchestrator;  // NEW: Training loop
  public toolRegistry?: ToolRegistry;
  public ragStore?: InMemoryKeywordStore;

  constructor(config: AIPlatformConfig = {}) {
    this.config = {
      enableMetrics: true,
      enableFeedback: true,
      enableLearning: true,
      enableTrainingLoop: true,  // NEW: Enable by default
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

      // Initialize Feedback Collector
      if (this.config.enableFeedback !== false) {
        this.feedbackCollector = new FeedbackCollector(this.config.feedbackConfig);
        this.health.feedbackReady = true;
      }

      // Initialize Supervised Learner
      if (this.config.enableLearning !== false) {
        this.supervisedLearner = new SupervisedLearner(this.config.learningConfig);
        this.health.learningReady = true;
      }

      // Initialize Training Data Pipeline
      if (this.config.enableTrainingLoop !== false) {
        this.trainingDataPipeline = new TrainingDataPipeline({
          minRating: 4,
          requireHelpful: true,
          deduplicate: true
        });
      }

      // Initialize Training Loop Orchestrator
      if (this.config.enableTrainingLoop !== false) {
        this.trainingOrchestrator = new TrainingLoopOrchestrator({
          thresholds: this.config.trainingLoopConfig?.thresholds,
          schedule: this.config.trainingLoopConfig?.schedule,
          baseModel: this.config.trainingLoopConfig?.baseModel || this.config.llm?.defaultModel || 'gpt-3.5-turbo',
          requireApproval: this.config.trainingLoopConfig?.requireApproval ?? true,
          abTest: {
            enabled: this.config.trainingLoopConfig?.enableABTesting ?? true,
            trafficSplit: 0.5,
            minSampleSize: 100,
            maxDuration: 7 * 24 * 60 * 60,
            significanceLevel: 0.05,
            minImprovement: 0.05
          }
        });
        this.health.trainingLoopReady = true;
      }

      // Initialize LLM Client (legacy)
      if (this.config.llm) {
        this.llmClient = new LlmClient(this.config.llm);
        this.health.llmConnected = true;
      }

      // Initialize Enhanced LLM Client with metrics and feedback
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

    // Add feedback statistics
    if (this.feedbackCollector && this.health.feedbackReady) {
      try {
        const stats = await this.feedbackCollector.getStats();
        this.health.feedback = {
          totalFeedback: stats.totalFeedback,
          helpfulRate: stats.helpfulRate,
          avgRating: stats.avgRating
        };
      } catch (error) {
        console.error('Failed to get feedback stats:', error);
      }
    }

    // Add learning statistics
    if (this.supervisedLearner && this.health.learningReady) {
      try {
        const summary = this.supervisedLearner.getInsightsSummary();
        const pending = this.supervisedLearner.getPendingSuggestions();
        const approved = this.supervisedLearner.getApprovedSuggestions();
        
        this.health.learning = {
          totalInsights: summary.totalInsights,
          pendingSuggestions: pending.length,
          approvedSuggestions: approved.length
        };
      } catch (error) {
        console.error('Failed to get learning stats:', error);
      }
    }

    // Add training loop statistics
    if (this.trainingOrchestrator && this.health.trainingLoopReady) {
      try {
        const activeJob = this.trainingOrchestrator.getActiveJob();
        const allJobs = this.trainingOrchestrator.getJobs();
        const awaitingApproval = this.trainingOrchestrator.getJobsAwaitingApproval();
        
        this.health.trainingLoop = {
          activeJob: activeJob !== null,
          totalJobs: allJobs.length,
          jobsAwaitingApproval: awaitingApproval.length,
          lastRetrainedAt: allJobs.filter(j => j.deployed).sort((a, b) => 
            (b.deployedAt?.getTime() || 0) - (a.deployedAt?.getTime() || 0)
          )[0]?.deployedAt
        };
      } catch (error) {
        console.error('Failed to get training loop stats:', error);
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

  // ========== FEEDBACK METHODS ==========

  /**
   * Record thumbs up/down feedback for a response
   */
  async giveFeedback(requestId: string, thumbs: ThumbsFeedback, context?: {
    userId?: string;
    tenantId?: string;
    sessionId?: string;
  }): Promise<void> {
    if (!this.feedbackCollector) {
      throw new Error('Feedback collector not initialized');
    }

    await this.feedbackCollector.recordThumbs(requestId, thumbs, context);
  }

  /**
   * Record detailed rating feedback
   */
  async rateResponse(requestId: string, rating: number, categories?: {
    accuracy?: number;
    helpfulness?: number;
    tone?: number;
    relevance?: number;
    completeness?: number;
  }, text?: string): Promise<void> {
    if (!this.feedbackCollector) {
      throw new Error('Feedback collector not initialized');
    }

    await this.feedbackCollector.recordRating(requestId, rating, categories, { text });
  }

  /**
   * Submit improvement suggestion
   */
  async suggestImprovement(requestId: string, suggestion: string, context?: {
    wasHelpful?: boolean;
    userId?: string;
    tenantId?: string;
  }): Promise<void> {
    if (!this.feedbackCollector) {
      throw new Error('Feedback collector not initialized');
    }

    await this.feedbackCollector.recordTextFeedback(requestId, suggestion, {
      improvementSuggestion: suggestion,
      wasHelpful: context?.wasHelpful,
      userId: context?.userId,
      tenantId: context?.tenantId
    });
  }

  /**
   * Check if should prompt user for feedback
   * Customer service feature - proactively asks for improvement suggestions
   */
  shouldAskForFeedback(): boolean {
    if (!this.feedbackCollector) return false;
    return this.feedbackCollector.shouldPromptForFeedback();
  }

  /**
   * Get a feedback prompt to show to user
   * Returns customer service style questions like:
   * - "How could I improve my response?"
   * - "What would make this more helpful?"
   * - "Do you have any suggestions?"
   */
  getFeedbackPrompt(type?: 'improvement' | 'clarification' | 'satisfaction' | 'suggestion'): {
    question: string;
    context?: string;
    followUp?: string;
  } | null {
    if (!this.feedbackCollector) return null;
    
    const prompt = this.feedbackCollector.getPrompt(type);
    return {
      question: prompt.question,
      context: prompt.context,
      followUp: prompt.followUp
    };
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    tenantId?: string;
  }): Promise<any> {
    if (!this.feedbackCollector) {
      throw new Error('Feedback collector not initialized');
    }

    return this.feedbackCollector.getStats(filters);
  }

  // ========== LEARNING METHODS ==========

  /**
   * Analyze recent feedback and generate learning insights
   * This is the supervised learning component
   */
  async analyzeAndLearn(feedback: FeedbackEntry[]): Promise<LearningInsight[]> {
    if (!this.supervisedLearner) {
      throw new Error('Supervised learner not initialized');
    }

    return this.supervisedLearner.analyzeFeedback(feedback);
  }

  /**
   * Generate improvement suggestions based on learned patterns
   * Requires human approval in supervised mode
   */
  async generateImprovementSuggestions(): Promise<ImprovementSuggestion[]> {
    if (!this.supervisedLearner) {
      throw new Error('Supervised learner not initialized');
    }

    return this.supervisedLearner.generateSuggestions();
  }

  /**
   * Get pending suggestions that need human approval
   */
  getPendingApprovals(): ImprovementSuggestion[] {
    if (!this.supervisedLearner) {
      return [];
    }

    return this.supervisedLearner.getPendingSuggestions();
  }

  /**
   * Approve a learning suggestion for deployment
   * Human-in-the-loop approval workflow
   */
  async approveSuggestion(suggestionId: string, approvedBy: string, skipTesting = false): Promise<void> {
    if (!this.supervisedLearner) {
      throw new Error('Supervised learner not initialized');
    }

    await this.supervisedLearner.approveSuggestion(suggestionId, approvedBy, skipTesting);
  }

  /**
   * Reject a learning suggestion
   */
  async rejectSuggestion(suggestionId: string, reason?: string): Promise<void> {
    if (!this.supervisedLearner) {
      throw new Error('Supervised learner not initialized');
    }

    await this.supervisedLearner.rejectSuggestion(suggestionId, reason);
  }

  /**
   * Get learning insights summary
   */
  getLearningInsights(days = 7): {
    totalInsights: number;
    byType: Record<string, number>;
    avgConfidence: number;
    topInsights: LearningInsight[];
  } {
    if (!this.supervisedLearner) {
      return {
        totalInsights: 0,
        byType: {},
        avgConfidence: 0,
        topInsights: []
      };
    }

    return this.supervisedLearner.getInsightsSummary(days);
  }

  // ========== TRAINING LOOP METHODS ==========

  /**
   * Start the automated training loop
   * Monitors feedback and triggers retraining when thresholds are met
   */
  async startTrainingLoop(): Promise<void> {
    if (!this.trainingOrchestrator) {
      throw new Error('Training loop orchestrator not initialized');
    }

    await this.trainingOrchestrator.start();
  }

  /**
   * Stop the automated training loop
   */
  async stopTrainingLoop(): Promise<void> {
    if (!this.trainingOrchestrator) {
      throw new Error('Training loop orchestrator not initialized');
    }

    await this.trainingOrchestrator.stop();
  }

  /**
   * Check if retraining should be triggered based on current metrics
   */
  shouldRetrain(metrics: {
    feedbackCount: number;
    successRate: number;
    avgRating: number;
    errorRate?: number;
  }): {
    shouldRetrain: boolean;
    reasons: string[];
  } {
    if (!this.trainingOrchestrator) {
      return { shouldRetrain: false, reasons: [] };
    }

    return this.trainingOrchestrator.shouldRetrain(metrics);
  }

  /**
   * Manually trigger a training job
   */
  async triggerTraining(
    feedback: FeedbackEntry[],
    options?: {
      baseModel?: string;
      skipABTest?: boolean;
      autoApprove?: boolean;
    }
  ): Promise<TrainingJob> {
    if (!this.trainingOrchestrator) {
      throw new Error('Training loop orchestrator not initialized');
    }

    return this.trainingOrchestrator.triggerTraining(feedback, 'manual', options);
  }

  /**
   * Get all training jobs
   */
  getTrainingJobs(): TrainingJob[] {
    if (!this.trainingOrchestrator) {
      return [];
    }

    return this.trainingOrchestrator.getJobs();
  }

  /**
   * Get currently active training job
   */
  getActiveTrainingJob(): TrainingJob | null {
    if (!this.trainingOrchestrator) {
      return null;
    }

    return this.trainingOrchestrator.getActiveJob();
  }

  /**
   * Get training jobs awaiting approval
   */
  getTrainingJobsAwaitingApproval(): TrainingJob[] {
    if (!this.trainingOrchestrator) {
      return [];
    }

    return this.trainingOrchestrator.getJobsAwaitingApproval();
  }

  /**
   * Approve and deploy a training job
   */
  async approveTrainingJob(jobId: string): Promise<void> {
    if (!this.trainingOrchestrator) {
      throw new Error('Training loop orchestrator not initialized');
    }

    await this.trainingOrchestrator.approveJob(jobId);
  }

  /**
   * Reject a training job
   */
  async rejectTrainingJob(jobId: string, reason: string): Promise<void> {
    if (!this.trainingOrchestrator) {
      throw new Error('Training loop orchestrator not initialized');
    }

    await this.trainingOrchestrator.rejectJob(jobId, reason);
  }

  /**
   * Convert feedback to training data
   * Useful for exporting training datasets
   */
  async feedbackToTrainingData(
    feedback: FeedbackEntry[],
    format: 'chat_completion' | 'rag_documents' | 'classification' = 'chat_completion'
  ): Promise<TrainingDataset> {
    if (!this.trainingDataPipeline) {
      throw new Error('Training data pipeline not initialized');
    }

    switch (format) {
      case 'chat_completion':
        return this.trainingDataPipeline.toChatCompletions(feedback);
      case 'rag_documents':
        return this.trainingDataPipeline.toRAGDocuments(feedback);
      case 'classification':
        return this.trainingDataPipeline.toClassificationExamples(feedback);
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  /**
   * Export training data to JSONL format
   */
  async exportTrainingData(dataset: TrainingDataset, format: 'jsonl' | 'json' = 'jsonl'): Promise<string> {
    if (!this.trainingDataPipeline) {
      throw new Error('Training data pipeline not initialized');
    }

    return format === 'jsonl'
      ? this.trainingDataPipeline.exportJSONL(dataset)
      : this.trainingDataPipeline.exportJSON(dataset);
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

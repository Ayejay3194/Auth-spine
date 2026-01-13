/**
 * NLU Integration Layer for Auth-spine Assistant System
 * Bridges the NLU engine with the existing SmartAssistant architecture
 * Provides intelligent routing with LLM fallback for edge cases
 */

import { SmartAssistant, SmartAssistantConfig } from '../../business-spine/src/smart/assistant.js';
import { NLUEngine, NLUConfig, NLUEngineResult } from './nlu-engine.js';
import { SmartEngine, SmartSuggestion, AssistantContext } from '../../business-spine/src/core/types.js';
import { Logger } from '../../business-spine/src/utils/logger.js';

export interface NLUIntegrationConfig {
  nlu: NLUConfig;
  assistant: SmartAssistantConfig;
  routing: {
    confidenceThreshold: number;
    enableLLMFallback: boolean;
    maxRetries: number;
    timeoutMs: number;
  };
  logging: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeMetrics: boolean;
  };
}

export interface NLURoutingResult {
  suggestions: SmartSuggestion[];
  intent: {
    name: string;
    confidence: number;
    entities: any[];
  };
  routing: {
    usedNLU: boolean;
    usedLLM: boolean;
    fallbackTriggered: boolean;
    processingTime: number;
  };
  metrics?: {
    nluProcessingTime: number;
    llmProcessingTime?: number;
    totalProcessingTime: number;
    confidenceScore: number;
  };
}

export class NLUIntegration {
  private nluEngine: NLUEngine;
  private smartAssistant: SmartAssistant;
  private logger: Logger;
  private config: NLUIntegrationConfig;
  private metrics: Map<string, number> = new Map();

  constructor(config: NLUIntegrationConfig) {
    this.config = config;
    this.logger = new Logger({ 
      level: config.logging.logLevel, 
      format: 'simple' 
    });
    
    this.nluEngine = new NLUEngine(config.nlu);
    this.smartAssistant = new SmartAssistant(config.assistant);
    
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.metrics.set('total_requests', 0);
    this.metrics.set('nlu_success', 0);
    this.metrics.set('llm_fallback', 0);
    this.metrics.set('routing_failures', 0);
    this.metrics.set('avg_processing_time', 0);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize NLU engine
      await this.nluEngine.initialize({});
      
      // Initialize smart assistant with NLU engine
      const engines = new Map<string, SmartEngine>();
      engines.set('nlu-engine', this.nluEngine);
      
      await this.smartAssistant.initialize(engines);
      
      this.logger.info('NLU Integration initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize NLU Integration', error);
      throw error;
    }
  }

  async processUserInput(
    userInput: string, 
    ctx: AssistantContext
  ): Promise<NLURoutingResult> {
    const startTime = Date.now();
    this.metrics.set('total_requests', (this.metrics.get('total_requests') || 0) + 1);

    try {
      // Create enhanced context with user input
      const enhancedCtx = {
        ...ctx,
        userInput
      };

      // First attempt: NLU-based routing
      const nluResult = await this.routeWithNLU(enhancedCtx);
      
      // Check if we need fallback
      if (this.shouldUseFallback(nluResult)) {
        const fallbackResult = await this.routeWithFallback(enhancedCtx, nluResult);
        this.updateMetrics(nluResult, fallbackResult, startTime);
        return fallbackResult;
      }

      this.updateMetrics(nluResult, null, startTime);
      return nluResult;

    } catch (error) {
      this.logger.error('NLU routing failed', error);
      this.metrics.set('routing_failures', (this.metrics.get('routing_failures') || 0) + 1);
      
      // Return error suggestion
      return this.createErrorResult(error, startTime);
    }
  }

  private async routeWithNLU(ctx: AssistantContext): Promise<NLURoutingResult> {
    const startTime = Date.now();
    
    try {
      // Get suggestions from NLU engine
      const suggestions = await this.nluEngine.run(ctx);
      const processingTime = Date.now() - startTime;

      // Extract intent information (this would be enhanced in real implementation)
      const intent = this.extractIntentFromContext(ctx);
      
      this.metrics.set('nlu_success', (this.metrics.get('nlu_success') || 0) + 1);

      return {
        suggestions,
        intent,
        routing: {
          usedNLU: true,
          usedLLM: false,
          fallbackTriggered: false,
          processingTime
        },
        metrics: {
          nluProcessingTime: processingTime,
          totalProcessingTime: processingTime,
          confidenceScore: intent.confidence
        }
      };

    } catch (error) {
      this.logger.error('NLU routing failed', error);
      throw error;
    }
  }

  private async routeWithFallback(
    ctx: AssistantContext, 
    originalResult: NLURoutingResult
  ): Promise<NLURoutingResult> {
    const startTime = Date.now();
    
    try {
      // Use LLM fallback for edge cases
      const llmSuggestions = await this.getLLMSuggestions(ctx);
      const processingTime = Date.now() - startTime;
      
      this.metrics.set('llm_fallback', (this.metrics.get('llm_fallback') || 0) + 1);

      return {
        suggestions: llmSuggestions,
        intent: originalResult.intent,
        routing: {
          usedNLU: true,
          usedLLM: true,
          fallbackTriggered: true,
          processingTime: originalResult.routing.processingTime + processingTime
        },
        metrics: {
          nluProcessingTime: originalResult.routing.processingTime,
          llmProcessingTime: processingTime,
          totalProcessingTime: originalResult.routing.processingTime + processingTime,
          confidenceScore: originalResult.intent.confidence
        }
      };

    } catch (error) {
      this.logger.error('LLM fallback failed', error);
      // Return original result even if it has low confidence
      return originalResult;
    }
  }

  private shouldUseFallback(result: NLURoutingResult): boolean {
    if (!this.config.routing.enableLLMFallback) {
      return false;
    }

    // Use fallback if confidence is below threshold
    if (result.intent.confidence < this.config.routing.confidenceThreshold) {
      return true;
    }

    // Use fallback if no suggestions were generated
    if (result.suggestions.length === 0) {
      return true;
    }

    // Use fallback if all suggestions are low severity (indicating uncertainty)
    const hasHighConfidenceSuggestions = result.suggestions.some(s => 
      s.severity !== 'info' || s.why.some(reason => reason.includes('confidence'))
    );

    return !hasHighConfidenceSuggestions;
  }

  private extractIntentFromContext(ctx: AssistantContext): { name: string; confidence: number; entities: any[] } {
    // In a real implementation, this would extract intent from NLU processing
    // For now, return a mock intent based on user input
    const userInput = (ctx as any).userInput || '';
    
    if (userInput.toLowerCase().includes('book')) {
      return {
        name: 'booking_create',
        confidence: 0.8,
        entities: []
      };
    }
    
    if (userInput.toLowerCase().includes('pay')) {
      return {
        name: 'payment_process',
        confidence: 0.7,
        entities: []
      };
    }
    
    return {
      name: 'unknown',
      confidence: 0.3,
      entities: []
    };
  }

  private async getLLMSuggestions(ctx: AssistantContext): Promise<SmartSuggestion[]> {
    // In a real implementation, this would call the configured LLM
    // For now, return generic suggestions
    
    return [{
      id: `llm-fallback-${Date.now()}`,
      engine: 'llm-fallback',
      title: 'Need Clarification',
      message: 'I\'m not sure what you\'d like to do. Could you please provide more details or choose from the options below?',
      severity: 'info',
      createdAt: new Date().toISOString(),
      why: ['LLM fallback triggered due to low confidence', 'Requesting clarification'],
      actions: [
        { label: 'Book Appointment', intent: 'booking_create_form' },
        { label: 'Make Payment', intent: 'payment_invoice' },
        { label: 'View Reports', intent: 'report_list' },
        { label: 'Contact Support', intent: 'support_contact' }
      ]
    }];
  }

  private createErrorResult(error: any, startTime: number): NLURoutingResult {
    return {
      suggestions: [{
        id: `error-${Date.now()}`,
        engine: 'error-handler',
        title: 'Processing Error',
        message: 'I encountered an error while processing your request. Please try again.',
        severity: 'critical',
        createdAt: new Date().toISOString(),
        why: ['System error occurred', 'Please try again'],
        actions: [{ label: 'Try Again', intent: 'retry' }]
      }],
      intent: {
        name: 'error',
        confidence: 0,
        entities: []
      },
      routing: {
        usedNLU: false,
        usedLLM: false,
        fallbackTriggered: false,
        processingTime: Date.now() - startTime
      }
    };
  }

  private updateMetrics(
    nluResult: NLURoutingResult, 
    fallbackResult: NLURoutingResult | null, 
    startTime: number
  ): void {
    const totalTime = Date.now() - startTime;
    const currentAvg = this.metrics.get('avg_processing_time') || 0;
    const totalRequests = this.metrics.get('total_requests') || 1;
    
    // Update average processing time
    this.metrics.set('avg_processing_time', (currentAvg * (totalRequests - 1) + totalTime) / totalRequests);

    if (this.config.logging.includeMetrics) {
      this.logger.info('NLU Routing metrics', {
        totalTime,
        usedNLU: nluResult.routing.usedNLU,
        usedLLM: fallbackResult?.routing.usedLLM || false,
        confidence: nluResult.intent.confidence
      });
    }
  }

  // Public API methods
  async addCustomIntent(name: string, description: string, examples: string[]): Promise<void> {
    this.nluEngine.addIntent(name, description, examples);
    this.logger.info(`Added custom intent: ${name}`);
  }

  async addCustomEntity(name: string, description: string, examples: string[]): Promise<void> {
    this.nluEngine.addEntity(name, description, examples);
    this.logger.info(`Added custom entity: ${name}`);
  }

  updateNLUConfig(config: Partial<NLUConfig>): void {
    this.nluEngine.updateConfig(config);
    this.logger.info('NLU configuration updated');
  }

  updateRoutingConfig(config: Partial<NLUIntegrationConfig['routing']>): void {
    this.config.routing = { ...this.config.routing, ...config };
    this.logger.info('Routing configuration updated');
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  getIntents(): Array<{ name: string; description: string; examples: string[] }> {
    return this.nluEngine.getIntents();
  }

  getEntities(): Array<{ name: string; description: string; examples: string[] }> {
    return this.nluEngine.getEntities();
  }

  async testNLU(text: string, ctx: AssistantContext): Promise<NLURoutingResult> {
    const testCtx = { ...ctx, userInput: text };
    return this.processUserInput(text, testCtx);
  }

  // Health check method
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    try {
      const metrics = this.getMetrics();
      const totalRequests = metrics.total_requests || 0;
      const errorRate = totalRequests > 0 ? (metrics.routing_failures || 0) / totalRequests : 0;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (errorRate > 0.5) {
        status = 'unhealthy';
      } else if (errorRate > 0.1) {
        status = 'degraded';
      }

      return {
        status,
        details: {
          metrics,
          nluEngineStatus: 'running',
          smartAssistantStatus: 'running',
          config: {
            confidenceThreshold: this.config.routing.confidenceThreshold,
            llmFallbackEnabled: this.config.routing.enableLLMFallback
          }
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message }
      };
    }
  }
}

/**
 * Enhanced SmartAssistant with NLU Integration
 * Extends the existing SmartAssistant with intelligent NLU-powered routing
 */

import { SmartAssistant, SmartAssistantConfig } from '../../business-spine/src/smart/assistant.js';
import { SmartEngine, SmartSuggestion, AssistantContext } from '../../business-spine/src/core/types.js';
import { NLUIntegration, NLUIntegrationConfig, defaultIntegrationConfig } from './nlu-integration.js';
import { Logger } from '../../business-spine/src/utils/logger.js';

export interface EnhancedAssistantConfig extends SmartAssistantConfig {
  nlu?: Partial<NLUIntegrationConfig>;
  features: {
    intelligentRouting: boolean;
    contextAwareness: boolean;
    learningMode: boolean;
    analyticsEnabled: boolean;
  };
}

export interface ConversationContext extends AssistantContext {
  conversationId?: string;
  previousIntents?: string[];
  userPreferences?: Record<string, any>;
  sessionData?: Record<string, any>;
}

export interface EnhancedSuggestion extends SmartSuggestion {
  nluData?: {
    intent: string;
    confidence: number;
    entities: any[];
    reasoning?: string;
  };
  context?: {
    conversationId?: string;
    sessionId?: string;
    previousActions?: string[];
  };
  learning?: {
    feedbackScore?: number;
    userAccepted?: boolean;
    improvementNotes?: string;
  };
}

export class EnhancedSmartAssistant extends SmartAssistant {
  private nluIntegration: NLUIntegration;
  private config: EnhancedAssistantConfig;
  private logger: Logger;
  private conversationHistory: Map<string, ConversationContext[]> = new Map();
  private learningData: Map<string, any[]> = new Map();

  constructor(config: EnhancedAssistantConfig) {
    super(config);
    this.config = config;
    this.logger = new Logger({ level: 'info', format: 'simple' });
    
    // Initialize NLU integration
    const nluConfig = {
      ...defaultIntegrationConfig,
      ...config.nlu,
      assistant: config
    };
    
    this.nluIntegration = new NLUIntegration(nluConfig);
  }

  async initialize(engineConfigs: Map<string, SmartEngine>): Promise<void> {
    // Initialize parent SmartAssistant
    await super.initialize(engineConfigs);
    
    // Initialize NLU integration
    await this.nluIntegration.initialize();
    
    this.logger.info('Enhanced SmartAssistant initialized with NLU capabilities');
  }

  async processMessage(
    message: string, 
    ctx: ConversationContext
  ): Promise<EnhancedSuggestion[]> {
    try {
      // Update conversation history
      this.updateConversationHistory(ctx, message);
      
      // Get context-aware suggestions
      const suggestions = await this.getContextAwareSuggestions(message, ctx);
      
      // Enhance suggestions with NLU data
      const enhancedSuggestions = await this.enhanceSuggestionsWithNLU(
        suggestions, 
        message, 
        ctx
      );
      
      // Apply learning if enabled
      if (this.config.features.learningMode) {
        this.applyLearning(enhancedSuggestions, ctx);
      }
      
      return enhancedSuggestions;

    } catch (error) {
      this.logger.error('Failed to process message', error);
      return this.createErrorSuggestions(error);
    }
  }

  private updateConversationHistory(ctx: ConversationContext, message: string): void {
    const conversationId = ctx.conversationId || 'default';
    const history = this.conversationHistory.get(conversationId) || [];
    
    history.push({
      ...ctx,
      userInput: message
    });
    
    // Keep only last 10 messages to prevent memory issues
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.conversationHistory.set(conversationId, history);
  }

  private async getContextAwareSuggestions(
    message: string, 
    ctx: ConversationContext
  ): Promise<SmartSuggestion[]> {
    // Get conversation context
    const conversationId = ctx.conversationId || 'default';
    const history = this.conversationHistory.get(conversationId) || [];
    
    // Create enhanced context with history
    const enhancedCtx: AssistantContext = {
      ...ctx,
      conversationHistory: history,
      previousIntents: history.map(h => (h as any).detectedIntent).filter(Boolean)
    };

    // Use NLU integration for intelligent routing
    if (this.config.features.intelligentRouting) {
      const nluResult = await this.nluIntegration.processUserInput(message, enhancedCtx);
      return nluResult.suggestions;
    }

    // Fallback to standard assistant
    return this.getSuggestions(enhancedCtx);
  }

  private async enhanceSuggestionsWithNLU(
    suggestions: SmartSuggestion[], 
    message: string, 
    ctx: ConversationContext
  ): Promise<EnhancedSuggestion[]> {
    if (!this.config.features.intelligentRouting) {
      return suggestions as EnhancedSuggestion[];
    }

    try {
      // Get NLU analysis
      const nluResult = await this.nluIntegration.processUserInput(message, ctx);
      
      // Enhance each suggestion with NLU data
      return suggestions.map(suggestion => ({
        ...suggestion,
        nluData: {
          intent: nluResult.intent.name,
          confidence: nluResult.intent.confidence,
          entities: nluResult.intent.entities,
          reasoning: nluResult.metrics?.confidenceScore ? 
            `Confidence: ${(nluResult.metrics.confidenceScore * 100).toFixed(0)}%` : 
            undefined
        },
        context: {
          conversationId: ctx.conversationId,
          sessionId: (ctx as any).sessionId,
          previousActions: ctx.previousIntents
        }
      }));

    } catch (error) {
      this.logger.error('Failed to enhance suggestions with NLU', error);
      return suggestions as EnhancedSuggestion[];
    }
  }

  private applyLearning(
    suggestions: EnhancedSuggestion[], 
    ctx: ConversationContext
  ): void {
    if (!this.config.features.learningMode) {
      return;
    }

    // Apply learning based on user preferences and history
    const conversationId = ctx.conversationId || 'default';
    const learningData = this.learningData.get(conversationId) || [];
    
    // Prioritize suggestions based on past user acceptance
    suggestions.sort((a, b) => {
      const aScore = this.calculateSuggestionScore(a, learningData);
      const bScore = this.calculateSuggestionScore(b, learningData);
      return bScore - aScore;
    });
  }

  private calculateSuggestionScore(
    suggestion: EnhancedSuggestion, 
    learningData: any[]
  ): number {
    let score = 0;
    
    // Base score from severity
    const severityScores = { critical: 3, warn: 2, info: 1 };
    score += severityScores[suggestion.severity] || 0;
    
    // Boost score based on NLU confidence
    if (suggestion.nluData?.confidence) {
      score += suggestion.nluData.confidence * 2;
    }
    
    // Apply learning from past interactions
    const pastInteractions = learningData.filter(
      data => data.intent === suggestion.nluData?.intent
    );
    
    if (pastInteractions.length > 0) {
      const avgFeedback = pastInteractions.reduce(
        (sum, data) => sum + (data.feedback || 0), 0
      ) / pastInteractions.length;
      
      score += avgFeedback;
    }
    
    return score;
  }

  private createErrorSuggestions(error: any): EnhancedSuggestion[] {
    return [{
      id: `error-${Date.now()}`,
      engine: 'enhanced-assistant',
      title: 'Processing Error',
      message: 'I encountered an error while processing your request. Please try again.',
      severity: 'critical',
      createdAt: new Date().toISOString(),
      why: ['System error occurred', 'Please try again'],
      actions: [{ label: 'Try Again', intent: 'retry' }]
    }];
  }

  // Learning and feedback methods
  async recordFeedback(
    suggestionId: string, 
    feedback: { accepted: boolean; score?: number; notes?: string }
  ): Promise<void> {
    if (!this.config.features.learningMode) {
      return;
    }

    const learningEntry = {
      suggestionId,
      timestamp: new Date().toISOString(),
      accepted: feedback.accepted,
      score: feedback.score || (feedback.accepted ? 1 : -1),
      notes: feedback.notes
    };

    // Store learning data (in real implementation, this would go to a database)
    const conversationId = 'learning'; // Global learning data
    const data = this.learningData.get(conversationId) || [];
    data.push(learningEntry);
    
    // Keep only last 1000 entries
    if (data.length > 1000) {
      data.splice(0, data.length - 1000);
    }
    
    this.learningData.set(conversationId, data);
    
    this.logger.info(`Recorded feedback for suggestion ${suggestionId}`, feedback);
  }

  // Analytics methods
  getAnalytics(): {
    totalConversations: number;
    averageProcessingTime: number;
    topIntents: Array<{ intent: string; count: number }>;
    nluAccuracy: number;
    learningEffectiveness: number;
  } {
    const totalConversations = this.conversationHistory.size;
    const nluMetrics = this.nluIntegration.getMetrics();
    
    // Calculate top intents (mock implementation)
    const topIntents = [
      { intent: 'booking_create', count: 45 },
      { intent: 'payment_process', count: 32 },
      { intent: 'inventory_check', count: 18 }
    ];
    
    // Calculate NLU accuracy (mock implementation)
    const nluAccuracy = 0.85;
    
    // Calculate learning effectiveness
    const learningData = this.learningData.get('learning') || [];
    const learningEffectiveness = learningData.length > 0 ? 
      learningData.reduce((sum, data) => sum + (data.score || 0), 0) / learningData.length : 0;

    return {
      totalConversations,
      averageProcessingTime: nluMetrics.avg_processing_time || 0,
      topIntents,
      nluAccuracy,
      learningEffectiveness
    };
  }

  // Conversation management
  getConversationHistory(conversationId: string): ConversationContext[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  clearConversationHistory(conversationId?: string): void {
    if (conversationId) {
      this.conversationHistory.delete(conversationId);
    } else {
      this.conversationHistory.clear();
    }
  }

  // Configuration management
  updateNLUConfig(config: Partial<NLUIntegrationConfig>): void {
    this.nluIntegration.updateNLUConfig(config.nlu || {});
    this.nluIntegration.updateRoutingConfig(config.routing || {});
  }

  enableFeature(feature: keyof EnhancedAssistantConfig['features']): void {
    this.config.features[feature] = true;
    this.logger.info(`Enabled feature: ${feature}`);
  }

  disableFeature(feature: keyof EnhancedAssistantConfig['features']): void {
    this.config.features[feature] = false;
    this.logger.info(`Disabled feature: ${feature}`);
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const nluHealth = await this.nluIntegration.healthCheck();
    const analytics = this.getAnalytics();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = nluHealth.status;
    
    // Consider learning effectiveness
    if (analytics.learningEffectiveness < 0.3 && this.config.features.learningMode) {
      status = status === 'healthy' ? 'degraded' : status;
    }
    
    return {
      status,
      details: {
        ...nluHealth.details,
        analytics,
        features: this.config.features,
        conversationCount: this.conversationHistory.size
      }
    };
  }
}

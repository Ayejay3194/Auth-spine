/**
 * AI Feedback Collection System
 * 
 * Comprehensive feedback collection for AI responses with multiple modes:
 * - Quick feedback (thumbs up/down)
 * - Detailed ratings (1-5 stars)
 * - Text feedback (improvement suggestions)
 * - Category-based feedback (accuracy, helpfulness, tone)
 * 
 * Integrates with Parquet metrics for analytics and learning.
 */

export type FeedbackType = 'thumbs' | 'rating' | 'text' | 'category' | 'suggestion';

export type ThumbsFeedback = 'up' | 'down';

export interface FeedbackEntry {
  id: string;
  timestamp: Date;
  
  // Context
  requestId: string;  // Links to AI request
  sessionId?: string;
  userId?: string;
  tenantId?: string;
  
  // Feedback content
  type: FeedbackType;
  
  // Quick feedback
  thumbs?: ThumbsFeedback;
  
  // Detailed ratings
  rating?: number;  // 1-5 stars
  
  // Category ratings
  categories?: {
    accuracy?: number;      // 1-5
    helpfulness?: number;   // 1-5
    tone?: number;         // 1-5
    relevance?: number;    // 1-5
    completeness?: number; // 1-5
  };
  
  // Text feedback
  text?: string;
  improvementSuggestion?: string;
  
  // Context
  wasHelpful: boolean;
  wouldRecommend?: boolean;
  
  // Metadata
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  
  // AI response context
  model?: string;
  responseMode?: string;
  latencyMs?: number;
}

export interface FeedbackPrompt {
  id: string;
  type: 'improvement' | 'clarification' | 'satisfaction' | 'suggestion';
  question: string;
  context?: string;
  followUp?: string;
}

interface FeedbackCollectorConfig {
  enabled: boolean;
  dataDir?: string;
  
  // Prompting configuration
  promptAfterResponses?: number;  // Ask for feedback every N responses
  proactivePrompts?: boolean;     // Ask improvement questions
  
  // Storage
  storeInParquet?: boolean;       // Store feedback in Parquet
  retentionDays?: number;
}

/**
 * Feedback Collector for AI Responses
 * Collects, stores, and analyzes user feedback
 */
export class FeedbackCollector {
  private config: FeedbackCollectorConfig;
  private buffer: FeedbackEntry[] = [];
  private responseCount = 0;
  private feedbackPrompts: FeedbackPrompt[] = [];

  constructor(config?: Partial<FeedbackCollectorConfig>) {
    this.config = {
      enabled: true,
      dataDir: './data/ai-feedback',
      promptAfterResponses: 5,      // Every 5 responses
      proactivePrompts: true,
      storeInParquet: true,
      retentionDays: 365,  // 1 year
      ...config
    };
    
    this.initializePrompts();
  }

  /**
   * Initialize feedback prompt templates
   */
  private initializePrompts(): void {
    this.feedbackPrompts = [
      {
        id: 'improve_1',
        type: 'improvement',
        question: 'How could I improve my response?',
        context: 'I want to provide the best possible assistance.',
        followUp: 'What specific aspect would you like me to enhance?'
      },
      {
        id: 'improve_2',
        type: 'improvement',
        question: 'What would make this response more helpful?',
        context: 'Your feedback helps me learn and improve.'
      },
      {
        id: 'clarify_1',
        type: 'clarification',
        question: 'Was anything unclear in my response?',
        followUp: 'What can I clarify for you?'
      },
      {
        id: 'satisfy_1',
        type: 'satisfaction',
        question: 'Did this response meet your expectations?',
        followUp: 'What would have made it better?'
      },
      {
        id: 'suggest_1',
        type: 'suggestion',
        question: 'Do you have any suggestions for how I could assist you better?',
        context: 'I continuously learn from user feedback to improve.'
      },
      {
        id: 'suggest_2',
        type: 'suggestion',
        question: 'What features or capabilities would be most valuable to you?',
        context: 'Help me understand what matters most to you.'
      }
    ];
  }

  /**
   * Record quick thumbs feedback
   */
  async recordThumbs(
    requestId: string,
    thumbs: ThumbsFeedback,
    context?: {
      userId?: string;
      tenantId?: string;
      sessionId?: string;
      model?: string;
      responseMode?: string;
    }
  ): Promise<void> {
    if (!this.config.enabled) return;

    const entry: FeedbackEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      requestId,
      type: 'thumbs',
      thumbs,
      wasHelpful: thumbs === 'up',
      sentiment: thumbs === 'up' ? 'positive' : 'negative',
      ...context
    };

    await this.storeFeedback(entry);
  }

  /**
   * Record detailed rating feedback
   */
  async recordRating(
    requestId: string,
    rating: number,
    categories?: {
      accuracy?: number;
      helpfulness?: number;
      tone?: number;
      relevance?: number;
      completeness?: number;
    },
    context?: {
      userId?: string;
      tenantId?: string;
      sessionId?: string;
      text?: string;
    }
  ): Promise<void> {
    if (!this.config.enabled) return;

    const entry: FeedbackEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      requestId,
      type: 'rating',
      rating,
      categories,
      wasHelpful: rating >= 3,
      sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
      text: context?.text,
      userId: context?.userId,
      tenantId: context?.tenantId,
      sessionId: context?.sessionId
    };

    await this.storeFeedback(entry);
  }

  /**
   * Record text feedback with improvement suggestions
   */
  async recordTextFeedback(
    requestId: string,
    text: string,
    options?: {
      improvementSuggestion?: string;
      wasHelpful?: boolean;
      userId?: string;
      tenantId?: string;
      sessionId?: string;
      tags?: string[];
    }
  ): Promise<void> {
    if (!this.config.enabled) return;

    const entry: FeedbackEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      requestId,
      type: 'text',
      text,
      improvementSuggestion: options?.improvementSuggestion,
      wasHelpful: options?.wasHelpful ?? true,
      userId: options?.userId,
      tenantId: options?.tenantId,
      sessionId: options?.sessionId,
      tags: options?.tags,
      // TODO: Use sentiment analysis on text
      sentiment: this.analyzeSentiment(text)
    };

    await this.storeFeedback(entry);
  }

  /**
   * Get a feedback prompt (customer service style)
   * Called after N responses to proactively ask for improvement
   */
  shouldPromptForFeedback(): boolean {
    if (!this.config.proactivePrompts) return false;
    
    this.responseCount++;
    
    if (this.config.promptAfterResponses && 
        this.responseCount % this.config.promptAfterResponses === 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Get a random feedback prompt
   */
  getPrompt(type?: FeedbackPrompt['type']): FeedbackPrompt {
    let prompts = this.feedbackPrompts;
    
    if (type) {
      prompts = prompts.filter(p => p.type === type);
    }
    
    const index = Math.floor(Math.random() * prompts.length);
    return prompts[index]!;
  }

  /**
   * Get contextual prompt based on previous feedback
   */
  getContextualPrompt(previousFeedback?: FeedbackEntry): FeedbackPrompt {
    // If previous feedback was negative, ask for improvement
    if (previousFeedback && !previousFeedback.wasHelpful) {
      return this.getPrompt('improvement');
    }
    
    // If positive, ask for suggestions
    if (previousFeedback && previousFeedback.wasHelpful) {
      return this.getPrompt('suggestion');
    }
    
    // Default to improvement
    return this.getPrompt('improvement');
  }

  /**
   * Store feedback entry
   */
  private async storeFeedback(entry: FeedbackEntry): Promise<void> {
    this.buffer.push(entry);

    // Flush if buffer is large
    if (this.buffer.length >= 50) {
      await this.flush();
    }
  }

  /**
   * Flush buffered feedback to storage
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    if (this.config.storeInParquet) {
      // TODO: Write to Parquet
      console.log(`Would write ${entries.length} feedback entries to Parquet`);
    }
  }

  /**
   * Get feedback statistics
   */
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    tenantId?: string;
    model?: string;
  }): Promise<{
    totalFeedback: number;
    helpfulRate: number;
    avgRating: number;
    thumbsUpRate: number;
    sentimentBreakdown: Record<string, number>;
    topImprovements: Array<{ suggestion: string; count: number }>;
    categoryRatings: {
      accuracy: number;
      helpfulness: number;
      tone: number;
      relevance: number;
      completeness: number;
    };
  }> {
    // TODO: Query from Parquet storage
    return {
      totalFeedback: 0,
      helpfulRate: 0,
      avgRating: 0,
      thumbsUpRate: 0,
      sentimentBreakdown: {},
      topImprovements: [],
      categoryRatings: {
        accuracy: 0,
        helpfulness: 0,
        tone: 0,
        relevance: 0,
        completeness: 0
      }
    };
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lower = text.toLowerCase();
    
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'perfect', 'amazing', 'love'];
    const negativeWords = ['bad', 'poor', 'terrible', 'useless', 'wrong', 'unhelpful', 'hate'];
    
    const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { FeedbackCollector };

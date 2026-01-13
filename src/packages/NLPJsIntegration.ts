import type { TransformerResult } from './TransformersIntegration.js';

export interface NLPJsConfig {
  enableIntentDetection: boolean;
  enableEntityExtraction: boolean;
  enableSentimentAnalysis: boolean;
  enableMultiLanguage: boolean;
  languages: string[];
  trainingData?: Record<string, string[]>;
}

export interface IntentResult {
  intent: string;
  score: number;
  entities: Record<string, any>;
  sentiment?: {
    score: number;
    comparative: number;
    vote: 'positive' | 'negative' | 'neutral';
  };
  language: string;
  processingTime: number;
  timestamp: Date;
}

export interface EntityExtractionResult {
  entities: Array<{
    text: string;
    type: string;
    start: number;
    end: number;
    score?: number;
  }>;
  processingTime: number;
  timestamp: Date;
}

export interface SentimentResult {
  score: number;
  comparative: number;
  vote: 'positive' | 'negative' | 'neutral';
  processingTime: number;
  timestamp: Date;
}

export class NLPJsIntegration {
  private config: NLPJsConfig;
  private nlpInstance: any = null;
  private initialized: boolean = false;
  private trainingData: Map<string, string[]> = new Map();
  private intentCache: Map<string, IntentResult> = new Map();
  private maxCacheSize: number = 1000;

  constructor(config?: Partial<NLPJsConfig>) {
    this.config = {
      enableIntentDetection: true,
      enableEntityExtraction: true,
      enableSentimentAnalysis: true,
      enableMultiLanguage: true,
      languages: ['en', 'es', 'fr', 'de'],
      trainingData: {},
      ...config
    };

    if (config?.trainingData) {
      Object.entries(config.trainingData).forEach(([intent, examples]) => {
        this.trainingData.set(intent, examples);
      });
    }
  }

  /**
   * Initialize NLP.js instance
   */
  async initialize(): Promise<void> {
    try {
      // Dynamic import to avoid issues in non-Node environments
      if (typeof window === 'undefined') {
        const { dockStart } = await import('../../external/nlp.js/packages/node-nlp/src/index.js').catch(() => ({
          dockStart: null
        }));

        if (dockStart) {
          const dock = await dockStart({ use: ['Basic'] });
          this.nlpInstance = dock.get('nlp');
          await this.setupIntents();
          this.initialized = true;
        }
      }
    } catch (error) {
      console.warn('NLP.js initialization failed, falling back to basic mode:', error);
      this.initialized = false;
    }
  }

  /**
   * Setup Auth-spine specific intents
   */
  private async setupIntents(): Promise<void> {
    if (!this.nlpInstance) return;

    // Default Auth-spine intents
    const defaultIntents = {
      'users.list': [
        'show me users',
        'list all users',
        'display users',
        'who are the users'
      ],
      'users.create': [
        'create a new user',
        'add a user',
        'register new user',
        'create user'
      ],
      'booking.create': [
        'create a new booking',
        'make a reservation',
        'book an appointment',
        'schedule a booking'
      ],
      'booking.list': [
        'show my bookings',
        'list bookings',
        'display reservations',
        'what are my bookings'
      ],
      'rbac.check': [
        'check permissions',
        'what can I access',
        'show my permissions',
        'list my access'
      ],
      'dashboard.view': [
        'show dashboard',
        'open dashboard',
        'display dashboard',
        'go to dashboard'
      ],
      'help.request': [
        'help me',
        'I need help',
        'can you help',
        'assist me'
      ],
      'logout': [
        'logout',
        'sign out',
        'exit',
        'goodbye'
      ]
    };

    // Add training data
    for (const [intent, examples] of Object.entries(defaultIntents)) {
      for (const example of examples) {
        this.nlpInstance.addDocument('en', example, intent);
      }
      this.nlpInstance.addAnswer('en', intent, `Processing ${intent} request`);
    }

    // Add custom training data if provided
    for (const [intent, examples] of this.trainingData.entries()) {
      for (const example of examples) {
        this.nlpInstance.addDocument('en', example, intent);
      }
    }

    // Train the model
    await this.nlpInstance.train();
  }

  /**
   * Process user input and detect intent
   */
  async processIntent(text: string, language: string = 'en'): Promise<IntentResult> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = `${language}:${text}`;
    if (this.intentCache.has(cacheKey)) {
      return this.intentCache.get(cacheKey)!;
    }

    try {
      if (!this.initialized || !this.nlpInstance) {
        await this.initialize();
      }

      const response = await this.nlpInstance.process(language, text);

      const result: IntentResult = {
        intent: response.intent || 'unknown',
        score: response.score || 0,
        entities: response.entities || {},
        sentiment: this.config.enableSentimentAnalysis ? {
          score: response.sentiment?.score || 0,
          comparative: response.sentiment?.comparative || 0,
          vote: response.sentiment?.vote || 'neutral'
        } : undefined,
        language,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

      // Cache result
      if (this.intentCache.size >= this.maxCacheSize) {
        const firstKey = this.intentCache.keys().next().value;
        this.intentCache.delete(firstKey);
      }
      this.intentCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Intent processing error:', error);
      return {
        intent: 'error',
        score: 0,
        entities: {},
        language,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Extract entities from text
   */
  async extractEntities(text: string, language: string = 'en'): Promise<EntityExtractionResult> {
    const startTime = Date.now();

    try {
      if (!this.initialized || !this.nlpInstance) {
        await this.initialize();
      }

      const response = await this.nlpInstance.process(language, text);
      const entities = response.entities || [];

      return {
        entities: entities.map((entity: any) => ({
          text: entity.text || entity.value,
          type: entity.type || entity.entity,
          start: entity.start || 0,
          end: entity.end || text.length,
          score: entity.score
        })),
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Entity extraction error:', error);
      return {
        entities: [],
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string, language: string = 'en'): Promise<SentimentResult> {
    const startTime = Date.now();

    try {
      if (!this.initialized || !this.nlpInstance) {
        await this.initialize();
      }

      const response = await this.nlpInstance.process(language, text);
      const sentiment = response.sentiment || { score: 0, comparative: 0, vote: 'neutral' };

      return {
        score: sentiment.score || 0,
        comparative: sentiment.comparative || 0,
        vote: sentiment.vote || 'neutral',
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        score: 0,
        comparative: 0,
        vote: 'neutral',
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Add custom intent to training data
   */
  addIntent(intent: string, examples: string[]): void {
    this.trainingData.set(intent, examples);
  }

  /**
   * Get all registered intents
   */
  getIntents(): string[] {
    return Array.from(this.trainingData.keys());
  }

  /**
   * Clear intent cache
   */
  clearCache(): void {
    this.intentCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.intentCache.size,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Check if NLP.js is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get configuration
   */
  getConfig(): NLPJsConfig {
    return { ...this.config };
  }

  /**
   * Convert NLP.js result to TransformerResult format for compatibility
   */
  async toTransformerResult(text: string, language: string = 'en'): Promise<TransformerResult> {
    const intentResult = await this.processIntent(text, language);

    return {
      task: 'nlp-js-intent-detection',
      model: 'nlp.js',
      result: {
        intent: intentResult.intent,
        score: intentResult.score,
        entities: intentResult.entities,
        sentiment: intentResult.sentiment
      },
      confidence: intentResult.score,
      processingTime: intentResult.processingTime,
      timestamp: intentResult.timestamp
    };
  }
}

export default NLPJsIntegration;

import { TransformersIntegration, type TransformerResult } from './TransformersIntegration.js';
import { NLPJsIntegration, type IntentResult, type EntityExtractionResult, type SentimentResult } from './NLPJsIntegration.js';

export interface EnhancedNLPConfig {
  enableTransformers: boolean;
  enableNLPJs: boolean;
  primaryEngine: 'transformers' | 'nlpjs' | 'hybrid';
  fallbackEngine: 'transformers' | 'nlpjs';
  cacheResults: boolean;
  maxCacheSize: number;
}

export interface UnifiedNLPResult {
  text: string;
  intent: string;
  intentScore: number;
  entities: Array<{
    text: string;
    type: string;
    score?: number;
  }>;
  sentiment: {
    score: number;
    vote: 'positive' | 'negative' | 'neutral';
  };
  engine: 'transformers' | 'nlpjs';
  processingTime: number;
  timestamp: Date;
}

export class EnhancedNLPSystem {
  private transformers: TransformersIntegration;
  private nlpjs: NLPJsIntegration;
  private config: EnhancedNLPConfig;
  private resultCache: Map<string, UnifiedNLPResult> = new Map();

  constructor(config?: Partial<EnhancedNLPConfig>) {
    this.config = {
      enableTransformers: true,
      enableNLPJs: true,
      primaryEngine: 'hybrid',
      fallbackEngine: 'transformers',
      cacheResults: true,
      maxCacheSize: 1000,
      ...config
    };

    this.transformers = new TransformersIntegration();
    this.nlpjs = new NLPJsIntegration({
      enableIntentDetection: true,
      enableEntityExtraction: true,
      enableSentimentAnalysis: true,
      enableMultiLanguage: true
    });
  }

  /**
   * Initialize the enhanced NLP system
   */
  async initialize(): Promise<void> {
    try {
      if (this.config.enableNLPJs) {
        await this.nlpjs.initialize();
      }
    } catch (error) {
      console.warn('NLP.js initialization failed, will use Transformers as fallback:', error);
    }
  }

  /**
   * Process text with unified NLP analysis
   */
  async processText(text: string, language: string = 'en'): Promise<UnifiedNLPResult> {
    const startTime = Date.now();
    const cacheKey = `${language}:${text}`;

    // Check cache
    if (this.config.cacheResults && this.resultCache.has(cacheKey)) {
      return this.resultCache.get(cacheKey)!;
    }

    let result: UnifiedNLPResult;

    try {
      if (this.config.primaryEngine === 'hybrid') {
        result = await this.processHybrid(text, language, startTime);
      } else if (this.config.primaryEngine === 'nlpjs') {
        result = await this.processWithNLPJs(text, language, startTime);
      } else {
        result = await this.processWithTransformers(text, language, startTime);
      }
    } catch (error) {
      console.error('Primary engine failed, attempting fallback:', error);
      result = await this.processFallback(text, language, startTime);
    }

    // Cache result
    if (this.config.cacheResults) {
      if (this.resultCache.size >= this.config.maxCacheSize) {
        const firstKey = this.resultCache.keys().next().value;
        this.resultCache.delete(firstKey);
      }
      this.resultCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Process with NLP.js engine
   */
  private async processWithNLPJs(text: string, language: string, startTime: number): Promise<UnifiedNLPResult> {
    const intentResult = await this.nlpjs.processIntent(text, language);
    const entityResult = await this.nlpjs.extractEntities(text, language);
    const sentimentResult = await this.nlpjs.analyzeSentiment(text, language);

    return {
      text,
      intent: intentResult.intent,
      intentScore: intentResult.score,
      entities: entityResult.entities.map(e => ({
        text: e.text,
        type: e.type,
        score: e.score
      })),
      sentiment: {
        score: sentimentResult.score,
        vote: sentimentResult.vote
      },
      engine: 'nlpjs',
      processingTime: Date.now() - startTime,
      timestamp: new Date()
    };
  }

  /**
   * Process with Transformers engine
   */
  private async processWithTransformers(text: string, language: string, startTime: number): Promise<UnifiedNLPResult> {
    const [sentimentResult, entityResult] = await Promise.all([
      this.transformers.analyzeSentiment(text),
      this.transformers.extractEntities(text)
    ]);

    // Detect intent using zero-shot classification
    const intentLabels = ['greeting', 'question', 'command', 'feedback', 'request'];
    const intentResult = await this.transformers.detectIntent(text, intentLabels);

    return {
      text,
      intent: intentResult.result.intent,
      intentScore: intentResult.confidence || 0,
      entities: (entityResult.result.entities || []).map((e: any) => ({
        text: e.text,
        type: e.type,
        score: e.score
      })),
      sentiment: {
        score: sentimentResult.result.score,
        vote: sentimentResult.result.label === 'POSITIVE' ? 'positive' : sentimentResult.result.label === 'NEGATIVE' ? 'negative' : 'neutral'
      },
      engine: 'transformers',
      processingTime: Date.now() - startTime,
      timestamp: new Date()
    };
  }

  /**
   * Process with hybrid approach (best of both)
   */
  private async processHybrid(text: string, language: string, startTime: number): Promise<UnifiedNLPResult> {
    try {
      // Try NLP.js first (faster, more accurate for intent)
      if (this.nlpjs.isInitialized()) {
        const nlpjsResult = await this.processWithNLPJs(text, language, startTime);
        
        // Enhance with Transformers sentiment if needed
        try {
          const sentimentResult = await this.transformers.analyzeSentiment(text);
          nlpjsResult.sentiment = {
            score: sentimentResult.result.score,
            vote: sentimentResult.result.label === 'POSITIVE' ? 'positive' : sentimentResult.result.label === 'NEGATIVE' ? 'negative' : 'neutral'
          };
        } catch (error) {
          console.warn('Transformers sentiment analysis failed, using NLP.js sentiment:', error);
        }

        return nlpjsResult;
      }
    } catch (error) {
      console.warn('NLP.js hybrid processing failed, falling back to Transformers:', error);
    }

    return this.processWithTransformers(text, language, startTime);
  }

  /**
   * Fallback processing
   */
  private async processFallback(text: string, language: string, startTime: number): Promise<UnifiedNLPResult> {
    try {
      return await this.processWithTransformers(text, language, startTime);
    } catch (error) {
      console.error('All NLP engines failed:', error);
      return {
        text,
        intent: 'unknown',
        intentScore: 0,
        entities: [],
        sentiment: {
          score: 0,
          vote: 'neutral'
        },
        engine: 'transformers',
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Add custom intent to NLP.js
   */
  addCustomIntent(intent: string, examples: string[]): void {
    this.nlpjs.addIntent(intent, examples);
  }

  /**
   * Get all registered intents
   */
  getIntents(): string[] {
    return this.nlpjs.getIntents();
  }

  /**
   * Clear result cache
   */
  clearCache(): void {
    this.resultCache.clear();
    this.nlpjs.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.resultCache.size,
      maxSize: this.config.maxCacheSize
    };
  }

  /**
   * Get system status
   */
  getStatus(): {
    transformersReady: boolean;
    nlpjsReady: boolean;
    primaryEngine: string;
    fallbackEngine: string;
  } {
    return {
      transformersReady: true,
      nlpjsReady: this.nlpjs.isInitialized(),
      primaryEngine: this.config.primaryEngine,
      fallbackEngine: this.config.fallbackEngine
    };
  }

  /**
   * Get configuration
   */
  getConfig(): EnhancedNLPConfig {
    return { ...this.config };
  }
}

export default EnhancedNLPSystem;

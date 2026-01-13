import { pipeline, env } from '@xenova/transformers';

export interface TransformerModel {
  task: 'text-classification' | 'token-classification' | 'question-answering' | 'summarization' | 'translation' | 'text-generation' | 'feature-extraction';
  model: string;
  description: string;
}

export interface TransformerResult {
  task: string;
  model: string;
  result: any;
  confidence?: number;
  processingTime: number;
  timestamp: Date;
}

export interface TransformerConfig {
  enableLocalModels: boolean;
  modelCacheDir: string;
  maxConcurrentPipelines: number;
  timeout: number;
  quantized: boolean;
}

export class TransformersIntegration {
  private pipelines: Map<string, any> = new Map();
  private config: TransformerConfig;
  private processingQueue: Array<{ id: string; task: () => Promise<any> }> = [];
  private activeProcessing: number = 0;

  private supportedModels: Map<string, TransformerModel> = new Map([
    ['sentiment-analysis', {
      task: 'text-classification',
      model: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
      description: 'Sentiment analysis for text classification'
    }],
    ['intent-detection', {
      task: 'text-classification',
      model: 'Xenova/intent-detection-multilingual',
      description: 'Intent detection for user queries'
    }],
    ['named-entity-recognition', {
      task: 'token-classification',
      model: 'Xenova/bert-base-multilingual-cased-ner-hrl',
      description: 'Named entity recognition for entity extraction'
    }],
    ['question-answering', {
      task: 'question-answering',
      model: 'Xenova/distilbert-base-cased-distilled-squad',
      description: 'Question answering from context'
    }],
    ['summarization', {
      task: 'summarization',
      model: 'Xenova/distilbart-cnn-6-6',
      description: 'Text summarization'
    }],
    ['text-generation', {
      task: 'text-generation',
      model: 'Xenova/gpt2',
      description: 'Text generation and completion'
    }],
    ['feature-extraction', {
      task: 'feature-extraction',
      model: 'Xenova/all-MiniLM-L6-v2',
      description: 'Semantic feature extraction for similarity'
    }],
    ['zero-shot-classification', {
      task: 'text-classification',
      model: 'Xenova/nli-deberta-v3-small',
      description: 'Zero-shot classification for flexible categorization'
    }]
  ]);

  constructor(config?: Partial<TransformerConfig>) {
    this.config = {
      enableLocalModels: true,
      modelCacheDir: './models',
      maxConcurrentPipelines: 3,
      timeout: 30000,
      quantized: true,
      ...config
    };

    // Configure Transformers.js environment
    if (typeof window === 'undefined') {
      env.allowLocalModels = this.config.enableLocalModels;
      env.allowRemoteModels = true;
      env.cacheDir = this.config.modelCacheDir;
    }
  }

  /**
   * Perform sentiment analysis on text
   */
  async analyzeSentiment(text: string): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const classifier = await this.getPipeline('sentiment-analysis');
      const result = await classifier(text);
      
      return {
        task: 'sentiment-analysis',
        model: 'distilbert-sst-2',
        result: result[0],
        confidence: result[0].score,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect user intent from query
   */
  async detectIntent(query: string, labels: string[] = ['greeting', 'question', 'command', 'feedback']): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const classifier = await this.getPipeline('zero-shot-classification');
      const result = await classifier(query, labels, { multi_label: false });
      
      return {
        task: 'intent-detection',
        model: 'zero-shot-classifier',
        result: {
          intent: result.labels[0],
          scores: result.scores,
          labels: result.labels
        },
        confidence: result.scores[0],
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Intent detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract named entities from text
   */
  async extractEntities(text: string): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const ner = await this.getPipeline('named-entity-recognition');
      const result = await ner(text);
      
      // Group entities by type
      const groupedEntities = result.reduce((acc: any, entity: any) => {
        if (!acc[entity.entity_group]) {
          acc[entity.entity_group] = [];
        }
        acc[entity.entity_group].push({
          text: entity.word,
          score: entity.score,
          start: entity.start,
          end: entity.end
        });
        return acc;
      }, {});
      
      return {
        task: 'named-entity-recognition',
        model: 'bert-multilingual-ner',
        result: groupedEntities,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Entity extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Answer questions based on context
   */
  async answerQuestion(question: string, context: string): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const qa = await this.getPipeline('question-answering');
      const result = await qa(question, context);
      
      return {
        task: 'question-answering',
        model: 'distilbert-squad',
        result: {
          answer: result.answer,
          score: result.score,
          start: result.start,
          end: result.end
        },
        confidence: result.score,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Question answering failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Summarize text
   */
  async summarizeText(text: string, maxLength: number = 150, minLength: number = 50): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const summarizer = await this.getPipeline('summarization');
      const result = await summarizer(text, { max_length: maxLength, min_length: minLength });
      
      return {
        task: 'summarization',
        model: 'distilbart-cnn',
        result: {
          summary: result[0].summary_text,
          originalLength: text.length,
          summaryLength: result[0].summary_text.length
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Summarization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate text completion
   */
  async generateText(prompt: string, maxLength: number = 100): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const generator = await this.getPipeline('text-generation');
      const result = await generator(prompt, { max_length: maxLength });
      
      return {
        task: 'text-generation',
        model: 'gpt2',
        result: {
          generated: result[0].generated_text,
          promptLength: prompt.length
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract semantic features for similarity comparison
   */
  async extractFeatures(text: string): Promise<TransformerResult> {
    const startTime = Date.now();
    try {
      const extractor = await this.getPipeline('feature-extraction');
      const result = await extractor(text, { pooling: 'mean', normalize: true });
      
      return {
        task: 'feature-extraction',
        model: 'all-MiniLM-L6-v2',
        result: {
          features: Array.from(result.data),
          dimensions: result.dims[1],
          textLength: text.length
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Feature extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate semantic similarity between two texts
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    try {
      const features1 = await this.extractFeatures(text1);
      const features2 = await this.extractFeatures(text2);
      
      const vec1 = (features1.result as any).features;
      const vec2 = (features2.result as any).features;
      
      // Cosine similarity
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
      }
      
      return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    } catch (error) {
      throw new Error(`Similarity calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a pipeline for a task
   */
  private async getPipeline(task: string): Promise<any> {
    if (this.pipelines.has(task)) {
      return this.pipelines.get(task);
    }

    // Wait for queue if at max concurrent
    while (this.activeProcessing >= this.config.maxConcurrentPipelines) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeProcessing++;

    try {
      const model = this.supportedModels.get(task);
      if (!model) {
        throw new Error(`Unsupported task: ${task}`);
      }

      const pipelineInstance = await pipeline(model.task as any, model.model);
      this.pipelines.set(task, pipelineInstance);
      
      return pipelineInstance;
    } finally {
      this.activeProcessing--;
    }
  }

  /**
   * Get list of supported models
   */
  getSupportedModels(): TransformerModel[] {
    return Array.from(this.supportedModels.values());
  }

  /**
   * Clear cached pipelines to free memory
   */
  clearCache(): void {
    this.pipelines.clear();
  }

  /**
   * Get current configuration
   */
  getConfig(): TransformerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TransformerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default TransformersIntegration;

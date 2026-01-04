import { EnhancedNLUService } from './EnhancedNLUService.js';
import type { NLUIntent, PromptContext } from '../core/types.js';

export interface SnipsIntent {
  name: string;
  probability: number;
}

export interface SnipsSlot {
  name: string;
  value: any;
  rawValue: string;
  range: {
    start: number;
    end: number;
  };
  entity: string;
}

export interface SnipsResult {
  input: string;
  intent: SnipsIntent | null;
  slots: SnipsSlot[];
}

export interface HybridNLUCConfig {
  enableSnips: boolean;
  enableEnhanced: boolean;
  fallbackStrategy: 'snips' | 'enhanced' | 'combined';
  confidenceThreshold: number;
  language: string;
}

export interface TrainingDataset {
  intents: {
    name: string;
    utterances: string[];
  }[];
  entities?: {
    name: string;
    data: {
      value: string;
      synonyms: string[];
    }[];
  }[];
}

export class HybridNLUService {
  private enhancedNLU: EnhancedNLUService;
  private snipsEngine: any = null;
  private config: HybridNLUCConfig;
  private isSnipsInitialized = false;

  constructor(config: Partial<HybridNLUCConfig> = {}) {
    this.config = {
      enableSnips: true,
      enableEnhanced: true,
      fallbackStrategy: 'combined',
      confidenceThreshold: 0.7,
      language: 'en',
      ...config
    };

    this.enhancedNLU = new EnhancedNLUService();
    this.initializeSnips();
  }

  private async initializeSnips(): Promise<void> {
    if (!this.config.enableSnips) return;

    try {
      // Initialize Snips NLU engine
      // Note: This is a TypeScript interface for the Python Snips NLU
      // In a real implementation, you would use a Python bridge or API
      console.log('Initializing Snips NLU engine...');
      
      // Mock initialization for now - in production this would connect to actual Snips
      this.snipsEngine = {
        parse: (text: string) => this.mockSnipsParse(text),
        fit: (dataset: TrainingDataset) => this.mockSnipsTrain(dataset),
        fit_json: (jsonDataset: string) => this.mockSnipsTrain(JSON.parse(jsonDataset))
      };
      
      this.isSnipsInitialized = true;
      console.log('Snips NLU engine initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Snips NLU:', error);
      this.config.enableSnips = false;
    }
  }

  private mockSnipsParse(text: string): SnipsResult {
    // Mock Snips parsing - in production this would call actual Snips NLU
    const lowercaseText = text.toLowerCase();
    
    // Basic intent detection
    let intent: SnipsIntent | null = null;
    const slots: SnipsSlot[] = [];

    if (lowercaseText.includes('book') || lowercaseText.includes('schedule') || lowercaseText.includes('appointment')) {
      intent = { name: 'booking.create', probability: 0.85 };
      
      // Extract service entities
      const services = ['haircut', 'massage', 'manicure', 'facial', 'consultation'];
      for (const service of services) {
        if (lowercaseText.includes(service)) {
          const index = lowercaseText.indexOf(service);
          slots.push({
            name: 'service',
            value: service,
            rawValue: text.substring(index, index + service.length),
            range: { start: index, end: index + service.length },
            entity: 'service'
          });
        }
      }
    } else if (lowercaseText.includes('price') || lowercaseText.includes('cost') || lowercaseText.includes('how much')) {
      intent = { name: 'pricing.information', probability: 0.9 };
    } else if (lowercaseText.includes('cancel') || lowercaseText.includes('reschedule')) {
      intent = { name: 'booking.cancel', probability: 0.8 };
    } else if (lowercaseText.includes('hello') || lowercaseText.includes('hi') || lowercaseText.includes('hey')) {
      intent = { name: 'greeting', probability: 0.95 };
    } else if (lowercaseText.includes('help') || lowercaseText.includes('assist')) {
      intent = { name: 'help', probability: 0.9 };
    }

    return {
      input: text,
      intent,
      slots
    };
  }

  private mockSnipsTrain(dataset: TrainingDataset): void {
    console.log('Mock training Snips with dataset:', dataset.intents.length, 'intents');
    // In production, this would actually train the Snips model
  }

  // Main parsing method that combines both NLU systems
  async parse(text: string, context?: PromptContext): NLUIntent {
    const results: {
      enhanced?: NLUIntent;
      snips?: SnipsResult;
    } = {};

    // Get results from both systems if enabled
    if (this.config.enableEnhanced) {
      try {
        results.enhanced = this.enhancedNLU.parse(text, context);
      } catch (error) {
        console.warn('Enhanced NLU failed:', error);
      }
    }

    if (this.config.enableSnips && this.isSnipsInitialized) {
      try {
        results.snips = this.snipsEngine.parse(text);
      } catch (error) {
        console.warn('Snips NLU failed:', error);
      }
    }

    // Combine results based on strategy
    return this.combineResults(results, text);
  }

  private combineResults(results: { enhanced?: NLUIntent; snips?: SnipsResult }, text: string): NLUIntent {
    if (!results.enhanced && !results.snips) {
      return {
        intent: 'unknown',
        confidence: 0.1,
        entities: []
      };
    }

    if (!results.enhanced) {
      return this.convertSnipsToNLUIntent(results.snips!);
    }

    if (!results.snips) {
      return results.enhanced;
    }

    // Both results available - combine based on strategy
    switch (this.config.fallbackStrategy) {
      case 'snips':
        return this.convertSnipsToNLUIntent(results.snips);
      
      case 'enhanced':
        return results.enhanced;
      
      case 'combined':
        return this.combineBothResults(results.enhanced, results.snips);
      
      default:
        return results.enhanced;
    }
  }

  private convertSnipsToNLUIntent(snipsResult: SnipsResult): NLUIntent {
    if (!snipsResult.intent) {
      return {
        intent: 'unknown',
        confidence: 0.1,
        entities: []
      };
    }

    const entities = snipsResult.slots.map(slot => ({
      type: slot.name,
      value: slot.value,
      start: slot.range.start,
      end: slot.range.end,
      confidence: 0.8
    }));

    return {
      intent: snipsResult.intent.name,
      confidence: snipsResult.intent.probability,
      entities
    };
  }

  private combineBothResults(enhanced: NLUIntent, snips: SnipsResult): NLUIntent {
    if (!snips.intent) {
      return enhanced;
    }

    // Use the result with higher confidence, but merge entities
    const snipsConfidence = snips.intent.probability;
    const enhancedConfidence = enhanced.confidence;

    let primaryIntent: NLUIntent;
    let secondaryEntities: any[] = [];

    if (snipsConfidence > enhancedConfidence) {
      primaryIntent = this.convertSnipsToNLUIntent(snips);
      secondaryEntities = enhanced.entities;
    } else {
      primaryIntent = enhanced;
      secondaryEntities = this.convertSnipsToNLUIntent(snips).entities;
    }

    // Merge unique entities
    const mergedEntities = [...primaryIntent.entities];
    for (const entity of secondaryEntities) {
      const exists = mergedEntities.find(e => 
        e.type === entity.type && 
        e.value === entity.value
      );
      if (!exists) {
        mergedEntities.push(entity);
      }
    }

    return {
      ...primaryIntent,
      entities: mergedEntities,
      confidence: Math.max(snipsConfidence, enhancedConfidence)
    };
  }

  // Training methods
  async train(dataset: TrainingDataset): Promise<void> {
    if (this.config.enableSnips && this.isSnipsInitialized) {
      try {
        await this.snipsEngine.fit(dataset);
        console.log('Snips NLU trained successfully');
      } catch (error) {
        console.warn('Failed to train Snips NLU:', error);
      }
    }

    if (this.config.enableEnhanced) {
      try {
        // Convert dataset to enhanced NLU format
        const enhancedData = this.convertToEnhancedFormat(dataset);
        await this.enhancedNLU.train(enhancedData);
        console.log('Enhanced NLU trained successfully');
      } catch (error) {
        console.warn('Failed to train Enhanced NLU:', error);
      }
    }
  }

  private convertToEnhancedFormat(dataset: TrainingDataset): any[] {
    const enhancedData: any[] = [];

    for (const intentData of dataset.intents) {
      for (const utterance of intentData.utterances) {
        enhancedData.push({
          text: utterance,
          intent: intentData.name,
          entities: [], // Would need entity extraction logic here
          sentiment: 'neutral'
        });
      }
    }

    return enhancedData;
  }

  // Generate response using the best available system
  generateResponse(intent: NLUIntent): string {
    if (this.config.enableEnhanced) {
      return this.enhancedNLU.generateResponse(intent);
    }

    // Fallback responses for Snips-only mode
    const responses: Record<string, string> = {
      'booking.create': "I can help you book an appointment. What service would you like and when are you available?",
      'pricing.information': "I'd be happy to help you with pricing information. Which service are you interested in?",
      'booking.cancel': "I can help you cancel or reschedule your appointment. What's your booking reference?",
      'greeting': "Hello! How can I assist you today?",
      'help': "I'm here to help! You can ask me about booking appointments, pricing, services, or general questions.",
      'unknown': "I'm not sure I understand. Could you please rephrase that or let me know how I can help?"
    };

    return responses[intent.intent] || responses['unknown'];
  }

  // Statistics and health
  getStats(): {
    enhanced: any;
    snips: { initialized: boolean; enabled: boolean };
    hybrid: { strategy: string; confidenceThreshold: number };
  } {
    return {
      enhanced: this.enhancedNLU.getStats(),
      snips: {
        initialized: this.isSnipsInitialized,
        enabled: this.config.enableSnips
      },
      hybrid: {
        strategy: this.config.fallbackStrategy,
        confidenceThreshold: this.config.confidenceThreshold
      }
    };
  }

  // Configuration methods
  updateConfig(newConfig: Partial<HybridNLUCConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): HybridNLUCConfig {
    return { ...this.config };
  }

  // Advanced features
  async getIntentConfidence(text: string): Promise<{
    intent: string;
    confidence: number;
    source: 'enhanced' | 'snips' | 'combined';
  }> {
    if (!this.config.enableSnips || !this.isSnipsInitialized) {
      const result = this.enhancedNLU.parse(text);
      return {
        intent: result.intent,
        confidence: result.confidence,
        source: 'enhanced'
      };
    }

    if (!this.config.enableEnhanced) {
      const snipsResult = this.snipsEngine.parse(text);
      return {
        intent: snipsResult.intent?.name || 'unknown',
        confidence: snipsResult.intent?.probability || 0.1,
        source: 'snips'
      };
    }

    // Combined mode
    const enhanced = this.enhancedNLU.parse(text);
    const snips = this.snipsEngine.parse(text);
    const combined = this.combineBothResults(enhanced, snips);

    return {
      intent: combined.intent,
      confidence: combined.confidence,
      source: 'combined'
    };
  }

  // Export/import capabilities
  exportTrainingData(): TrainingDataset {
    // Convert current training data to Snips format
    return {
      intents: [
        {
          name: 'booking.create',
          utterances: [
            "I want to book a haircut",
            "Schedule an appointment for tomorrow",
            "Can I get a massage this week?",
            "I need to make a reservation"
          ]
        },
        {
          name: 'pricing.information',
          utterances: [
            "How much does a haircut cost?",
            "What are your prices?",
            "Can you tell me about pricing?",
            "How much for a facial?"
          ]
        },
        {
          name: 'booking.cancel',
          utterances: [
            "I need to cancel my appointment",
            "Can I reschedule my booking?",
            "I want to cancel my reservation",
            "Need to change my appointment time"
          ]
        },
        {
          name: 'greeting',
          utterances: [
            "Hello",
            "Hi there",
            "Hey",
            "Good morning"
          ]
        },
        {
          name: 'help',
          utterances: [
            "I need help",
            "Can you assist me?",
            "Help me please",
            "What can you do?"
          ]
        }
      ]
    };
  }
}

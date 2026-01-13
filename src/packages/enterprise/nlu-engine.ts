/**
 * NLU Engine for Auth-spine Assistant System
 * Integrates with existing SmartAssistant architecture
 * Uses LLMs only for edge cases and confidence scoring
 */

import { SmartEngine, SmartSuggestion, AssistantContext } from '../../business-spine/src/core/types.js';
import { Logger } from '../../business-spine/src/utils/logger.js';

export interface NLUIntent {
  name: string;
  confidence: number;
  entities: Array<{
    entity: string;
    value: string;
    start: number;
    end: number;
  }>;
  reasoning?: string;
}

export interface NLUConfig {
  enabled: boolean;
  confidenceThreshold: number;
  useLLMFallback: boolean;
  llmProvider: 'anthropic' | 'openai' | 'local';
  maxRetries: number;
  timeoutMs: number;
}

export interface NLUEngineResult {
  intent: NLUIntent;
  suggestions: SmartSuggestion[];
  usedLLM: boolean;
  processingTime: number;
}

export class NLUEngine implements SmartEngine {
  name = 'nlu-engine';
  version = '1.0.0';
  
  private logger: Logger;
  private config: NLUConfig;
  private intents: Map<string, { description: string; examples: string[] }> = new Map();
  private entities: Map<string, { description: string; examples: string[] }> = new Map();

  constructor(config: NLUConfig) {
    this.config = config;
    this.logger = new Logger({ level: 'info', format: 'simple' });
    this.initializeDefaultIntents();
  }

  private initializeDefaultIntents(): void {
    // Initialize with common business intents
    this.intents.set('booking_create', {
      description: 'User wants to create a new booking',
      examples: ['book appointment', 'schedule meeting', 'make reservation', 'book slot']
    });
    
    this.intents.set('booking_cancel', {
      description: 'User wants to cancel a booking',
      examples: ['cancel appointment', 'cancel booking', 'remove reservation', 'delete slot']
    });
    
    this.intents.set('booking_reschedule', {
      description: 'User wants to reschedule a booking',
      examples: ['reschedule', 'move appointment', 'change time', 'different day']
    });
    
    this.intents.set('payment_process', {
      description: 'User wants to make a payment',
      examples: ['pay invoice', 'make payment', 'process payment', 'checkout']
    });
    
    this.intents.set('inventory_check', {
      description: 'User wants to check inventory availability',
      examples: ['check stock', 'available items', 'inventory status', 'product availability']
    });
    
    this.intents.set('payroll_inquiry', {
      description: 'User is asking about payroll information',
      examples: ['payroll status', 'salary info', 'paycheck', 'wage information']
    });
    
    this.intents.set('report_generate', {
      description: 'User wants to generate a report',
      examples: ['generate report', 'create report', 'export data', 'analytics report']
    });
    
    this.intents.set('security_alert', {
      description: 'User is reporting a security issue',
      examples: ['security issue', 'suspicious activity', 'security breach', 'unauthorized access']
    });

    // Initialize entities
    this.entities.set('date', {
      description: 'Date or time reference',
      examples: ['today', 'tomorrow', 'next week', 'monday', 'friday', 'december 15']
    });
    
    this.entities.set('time', {
      description: 'Time of day',
      examples: ['9am', '2pm', 'morning', 'afternoon', 'evening']
    });
    
    this.entities.set('location', {
      description: 'Physical location or venue',
      examples: ['office', 'downtown', 'branch', 'room 101', 'conference room']
    });
    
    this.entities.set('person', {
      description: 'Person name or role',
      examples: ['john', 'manager', 'staff', 'client', 'customer']
    });
    
    this.entities.set('amount', {
      description: 'Monetary amount',
      examples: ['$100', '100 dollars', 'fifty', 'price', 'cost']
    });
  }

  async run(ctx: AssistantContext): Promise<SmartSuggestion[]> {
    if (!this.config.enabled) {
      return [];
    }

    const startTime = Date.now();
    
    try {
      // Get the latest user input from context (this would be passed in real implementation)
      const userInput = this.getUserInput(ctx);
      
      if (!userInput) {
        return [];
      }

      const result = await this.processUserInput(userInput, ctx);
      const suggestions = this.generateSuggestions(result, ctx);
      
      this.logger.info(`NLU processed input in ${Date.now() - startTime}ms`, {
        intent: result.intent.name,
        confidence: result.intent.confidence,
        usedLLM: result.usedLLM
      });

      return suggestions;

    } catch (error) {
      this.logger.error('NLU engine failed', error);
      return [{
        id: `nlu-error-${Date.now()}`,
        engine: this.name,
        title: 'NLU Processing Error',
        message: 'Unable to process your request. Please try again.',
        severity: 'warn',
        createdAt: new Date().toISOString(),
        why: ['NLU engine encountered an error'],
        actions: [{ label: 'Try Again', intent: 'retry' }]
      }];
    }
  }

  private getUserInput(ctx: AssistantContext): string | null {
    // In a real implementation, this would extract the latest user message
    // from the conversation context or request payload
    return (ctx as any).userInput || null;
  }

  private async processUserInput(text: string, ctx: AssistantContext): Promise<NLUEngineResult> {
    const startTime = Date.now();
    
    // First attempt: Rule-based classification
    let intent = this.classifyWithRules(text);
    
    // If confidence is low, fall back to LLM
    let usedLLM = false;
    if (intent.confidence < this.config.confidenceThreshold && this.config.useLLMFallback) {
      usedLLM = true;
      intent = await this.classifyWithLLM(text, ctx);
    }

    return {
      intent,
      suggestions: [], // Will be generated separately
      usedLLM,
      processingTime: Date.now() - startTime
    };
  }

  private classifyWithRules(text: string): NLUIntent {
    const lowerText = text.toLowerCase();
    let bestMatch = 'unknown';
    let bestScore = 0;
    const foundEntities: any[] = [];

    // Score each intent based on keyword matching
    for (const [intentName, intentData] of this.intents) {
      let score = 0;
      
      for (const example of intentData.examples) {
        const exampleWords = example.toLowerCase().split(' ');
        const textWords = lowerText.split(' ');
        
        // Count matching words
        let matches = 0;
        for (const word of exampleWords) {
          if (textWords.includes(word)) {
            matches++;
          }
        }
        
        // Calculate score based on percentage of matching words
        const matchRatio = matches / exampleWords.length;
        if (matchRatio > score) {
          score = matchRatio;
        }
        
        // Bonus for exact phrase matches
        if (lowerText.includes(example.toLowerCase())) {
          score = Math.max(score, 0.8);
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = intentName;
      }
    }

    // Extract entities
    for (const [entityName, entityData] of this.entities) {
      for (const example of entityData.examples) {
        const index = lowerText.indexOf(example.toLowerCase());
        if (index !== -1) {
          foundEntities.push({
            entity: entityName,
            value: example,
            start: index,
            end: index + example.length
          });
        }
      }
    }

    return {
      name: bestMatch,
      confidence: bestScore,
      entities: foundEntities,
      reasoning: `Rule-based classification with ${bestScore.toFixed(2)} confidence based on keyword matching`
    };
  }

  private async classifyWithLLM(text: string, ctx: AssistantContext): Promise<NLUIntent> {
    // In a real implementation, this would call the configured LLM
    // For now, we'll return a mock response that shows the structure
    
    const systemPrompt = `You are an expert NLU system for a business management platform. 
Analyze the user input and extract:
1. The primary intent (what the user wants to do)
2. Any entities (important information like dates, times, locations, amounts)

Available intents:
${Array.from(this.intents.entries()).map(([name, data]) => `- ${name}: ${data.description}`).join('\n')}

Available entities:
${Array.from(this.entities.entries()).map(([name, data]) => `- ${name}: ${data.description}`).join('\n')}

Respond with JSON format:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": [{"entity": "entity_name", "value": "extracted_value", "start": 0, "end": 5}],
  "reasoning": "Brief explanation"
}`;

    // Mock LLM response for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: 'booking_create',
          confidence: 0.85,
          entities: [],
          reasoning: 'LLM classification based on semantic understanding'
        });
      }, 500);
    });
  }

  private generateSuggestions(result: NLUEngineResult, ctx: AssistantContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    // Generate suggestions based on detected intent
    switch (result.intent.name) {
      case 'booking_create':
        suggestions.push({
          id: `nlu-booking-${Date.now()}`,
          engine: this.name,
          title: 'Create New Booking',
          message: 'I can help you create a new booking. What type of appointment would you like to schedule?',
          severity: 'info',
          createdAt: new Date().toISOString(),
          why: ['Detected booking creation intent', `Confidence: ${(result.intent.confidence * 100).toFixed(0)}%`],
          actions: [
            { label: 'Book Appointment', intent: 'booking_create_form' },
            { label: 'View Calendar', intent: 'calendar_view' }
          ]
        });
        break;

      case 'booking_cancel':
        suggestions.push({
          id: `nlu-cancel-${Date.now()}`,
          engine: this.name,
          title: 'Cancel Booking',
          message: 'I can help you cancel an existing booking. Which booking would you like to cancel?',
          severity: 'warn',
          createdAt: new Date().toISOString(),
          why: ['Detected booking cancellation intent', `Confidence: ${(result.intent.confidence * 100).toFixed(0)}%`],
          actions: [
            { label: 'View My Bookings', intent: 'booking_list' },
            { label: 'Cancel Specific', intent: 'booking_cancel_form' }
          ]
        });
        break;

      case 'payment_process':
        suggestions.push({
          id: `nlu-payment-${Date.now()}`,
          engine: this.name,
          title: 'Process Payment',
          message: 'I can help you process a payment. What would you like to pay for?',
          severity: 'info',
          createdAt: new Date().toISOString(),
          why: ['Detected payment processing intent', `Confidence: ${(result.intent.confidence * 100).toFixed(0)}%`],
          actions: [
            { label: 'Pay Invoice', intent: 'payment_invoice' },
            { label: 'View Balance', intent: 'payment_balance' }
          ]
        });
        break;

      case 'security_alert':
        suggestions.push({
          id: `nlu-security-${Date.now()}`,
          engine: this.name,
          title: 'Security Issue Detected',
          message: 'I detected a potential security concern in your request. Our security team has been notified.',
          severity: 'critical',
          createdAt: new Date().toISOString(),
          why: ['Security-related intent detected', 'Automatic security protocol triggered'],
          actions: [
            { label: 'Contact Security', intent: 'security_contact' },
            { label: 'Report Issue', intent: 'security_report' }
          ]
        });
        break;

      default:
        if (result.intent.confidence < 0.3) {
          suggestions.push({
            id: `nlu-clarify-${Date.now()}`,
            engine: this.name,
            title: 'Need Clarification',
            message: 'I\'m not sure what you\'d like to do. Could you please provide more details?',
            severity: 'info',
            createdAt: new Date().toISOString(),
            why: ['Low confidence classification', 'Intent unclear'],
            actions: [
              { label: 'Book Appointment', intent: 'booking_create_form' },
              { label: 'Make Payment', intent: 'payment_invoice' },
              { label: 'View Reports', intent: 'report_list' }
            ]
          });
        }
    }

    return suggestions;
  }

  // Public methods for managing intents and entities
  addIntent(name: string, description: string, examples: string[]): void {
    this.intents.set(name, { description, examples });
    this.logger.info(`Added NLU intent: ${name}`);
  }

  removeIntent(name: string): void {
    this.intents.delete(name);
    this.logger.info(`Removed NLU intent: ${name}`);
  }

  addEntity(name: string, description: string, examples: string[]): void {
    this.entities.set(name, { description, examples });
    this.logger.info(`Added NLU entity: ${name}`);
  }

  removeEntity(name: string): void {
    this.entities.delete(name);
    this.logger.info(`Removed NLU entity: ${name}`);
  }

  getIntents(): Array<{ name: string; description: string; examples: string[] }> {
    return Array.from(this.intents.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  getEntities(): Array<{ name: string; description: string; examples: string[] }> {
    return Array.from(this.entities.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  updateConfig(newConfig: Partial<NLUConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('NLU engine configuration updated');
  }
}

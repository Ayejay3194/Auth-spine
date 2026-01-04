import type { NLUIntent, PromptContext } from "../core/types.js";

export interface NLUEntity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface NLUTrainingExample {
  text: string;
  intent: string;
  entities: NLUEntity[];
  context?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface IntentPattern {
  intent: string;
  patterns: string[];
  entities?: Array<{
    type: string;
    patterns: RegExp[];
  }>;
  responses?: string[];
  followUpQuestions?: string[];
}

export interface ConversationContext {
  previousIntents: NLUIntent[];
  userProfile?: any;
  sessionData: Map<string, any>;
  conversationHistory: Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>;
}

export class EnhancedNLUService {
  private patterns: IntentPattern[] = [];
  private trainingData: NLUTrainingExample[] = [];
  private vocabulary: Map<string, number> = new Map();
  private intentFrequency: Map<string, number> = new Map();
  private context: ConversationContext = {
    previousIntents: [],
    sessionData: new Map(),
    conversationHistory: []
  };

  constructor() {
    this.initializeDefaultPatterns();
    this.buildVocabulary();
  }

  // Initialize with comprehensive booking and service patterns
  private initializeDefaultPatterns(): void {
    // Booking intents with natural language variations
    this.patterns = [
      {
        intent: 'booking.create',
        patterns: [
          'book appointment', 'schedule appointment', 'make appointment', 'book a', 'schedule a',
          'i want to book', 'need to schedule', 'can i book', 'would like to book',
          'make a booking', 'set up appointment', 'reserve a spot', 'get an appointment'
        ],
        entities: [
          { type: 'service', patterns: [/haircut|hair styling|massage|facial|manicure|pedicure|consultation|treatment|service/] },
          { type: 'datetime', patterns: [/today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm|\d{1,2}:\d{2}/] },
          { type: 'professional', patterns: [/with (john|jane|smith|dr\.|professor|\w+)/] }
        ],
        responses: [
          "I'd be happy to help you book an appointment. What service would you like?",
          "Sure! Let me schedule that for you. What type of appointment are you looking for?",
          "I can help you book that. What service and time works best for you?"
        ],
        followUpQuestions: [
          "What service would you like to book?",
          "What date and time works for you?",
          "Do you have a preference for a specific professional?"
        ]
      },
      {
        intent: 'booking.inquiry',
        patterns: [
          'check availability', 'what times are available', 'when can i', 'available slots',
          'what openings', 'schedule availability', 'booking availability', 'free appointments'
        ],
        responses: [
          "Let me check the availability for you. What service are you interested in?",
          "I'll look up the available times. What day were you thinking?"
        ]
      },
      {
        intent: 'service.information',
        patterns: [
          'what services', 'tell me about', 'service information', 'what do you offer',
          'services available', 'service menu', 'treatment options', 'what can i get'
        ],
        responses: [
          "We offer various services including hair styling, massage, facials, and more. What would you like to know about?",
          "I'd be happy to tell you about our services. Which area interests you?"
        ]
      },
      {
        intent: 'pricing.information',
        patterns: [
          'how much', 'what is the price', 'cost', 'pricing', 'rates', 'fees',
          'how much does it cost', 'price of', 'cost for'
        ],
        responses: [
          "Pricing varies by service and duration. Which service are you interested in?",
          "I can help you with pricing information. What service would you like to know about?"
        ]
      },
      {
        intent: 'greeting',
        patterns: [
          'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
          'how are you', 'howdy', 'greetings'
        ],
        responses: [
          "Hello! How can I help you today?",
          "Hi there! What can I assist you with?",
          "Welcome! How may I help you today?"
        ]
      },
      {
        intent: 'help',
        patterns: [
          'help', 'what can you do', 'how do i', 'i need help', 'assist me',
          'support', 'guidance', 'instructions'
        ],
        responses: [
          "I can help you book appointments, check availability, get service information, and answer questions about pricing. What would you like to do?",
          "I'm here to help with bookings, services, and general information. How can I assist you?"
        ]
      },
      {
        intent: 'booking.cancel',
        patterns: [
          'cancel appointment', 'cancel booking', 'need to cancel', 'cancel my',
          'reschedule', 'change appointment', 'move appointment'
        ],
        responses: [
          "I can help you cancel or reschedule. What appointment would you like to change?",
          "Let me help you with that. Which appointment do you need to cancel or reschedule?"
        ]
      },
      {
        intent: 'professional.information',
        patterns: [
          'who is available', 'which professional', 'staff information', 'who works',
          'available professionals', 'team members', 'who can help me'
        ],
        responses: [
          "I can help you find the right professional for your needs. What service are you looking for?",
          "Let me tell you about our team. What type of professional are you looking for?"
        ]
      }
    ];
  }

  // Build vocabulary from training data for better understanding
  private buildVocabulary(): void {
    this.trainingData.forEach(example => {
      const words = example.text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        this.vocabulary.set(word, (this.vocabulary.get(word) || 0) + 1);
      });
      this.intentFrequency.set(example.intent, (this.intentFrequency.get(example.intent) || 0) + 1);
    });
  }

  // Enhanced intent recognition with context awareness
  parse(text: string, context?: Partial<ConversationContext>): NLUIntent {
    const lowerText = text.toLowerCase().trim();
    
    // Update conversation context
    if (context) {
      this.context = { ...this.context, ...context };
    }
    
    // Add to conversation history
    this.context.conversationHistory.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    });

    // Try to match against patterns with enhanced scoring
    let bestMatch: NLUIntent | null = null;
    let highestScore = 0;

    for (const pattern of this.patterns) {
      const score = this.calculatePatternScore(lowerText, pattern);
      if (score > highestScore && score > 0.3) { // Minimum confidence threshold
        highestScore = score;
        const entities = this.extractEntities(text, pattern);
        bestMatch = {
          intent: pattern.intent,
          confidence: score,
          entities
        };
      }
    }

    // If no pattern matches, try semantic matching
    if (!bestMatch) {
      bestMatch = this.semanticMatching(lowerText);
    }

    // If still no match, return unknown intent
    if (!bestMatch) {
      bestMatch = {
        intent: 'unknown',
        confidence: 0.1,
        entities: []
      };
    }

    // Update context with current intent
    this.context.previousIntents.push(bestMatch);
    if (this.context.previousIntents.length > 10) {
      this.context.previousIntents.shift(); // Keep only last 10 intents
    }

    return bestMatch;
  }

  // Enhanced pattern scoring with context awareness
  private calculatePatternScore(text: string, pattern: IntentPattern): number {
    let score = 0;
    let matchedPatterns = 0;

    for (const patternText of pattern.patterns) {
      const patternWords = patternText.toLowerCase().split(/\s+/);
      const textWords = text.split(/\s+/);
      
      let patternScore = 0;
      for (const patternWord of patternWords) {
        if (textWords.some(textWord => textWord.includes(patternWord) || patternWord.includes(textWord))) {
          patternScore += 1 / patternWords.length;
        }
      }
      
      if (patternScore > 0.5) {
        score += patternScore;
        matchedPatterns++;
      }
    }

    // Context bonus - if this intent follows logically from previous intents
    if (this.context.previousIntents.length > 0) {
      const lastIntent = this.context.previousIntents[this.context.previousIntents.length - 1];
      if (this.isLogicalFollowUp(lastIntent.intent, pattern.intent)) {
        score += 0.2;
      }
    }

    return matchedPatterns > 0 ? score / matchedPatterns : 0;
  }

  // Semantic matching using vocabulary similarity
  private semanticMatching(text: string): NLUIntent | null {
    const words = text.split(/\s+/);
    let bestMatch: { intent: string, score: number } | null = null;

    this.intentFrequency.forEach((_, intent) => {
      const score = this.calculateSemanticSimilarity(words, intent);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { intent, score };
      }
    });

    if (bestMatch && bestMatch.score > 0.2) {
      return {
        intent: bestMatch.intent,
        confidence: bestMatch.score,
        entities: []
      };
    }

    return null;
  }

  // Calculate semantic similarity between text and intent
  private calculateSemanticSimilarity(words: string[], intent: string): number {
    // Simple word overlap similarity
    const intentWords = intent.split('_');
    let matches = 0;
    
    for (const word of words) {
      for (const intentWord of intentWords) {
        if (word.includes(intentWord) || intentWord.includes(word)) {
          matches++;
        }
      }
    }
    
    return matches / (words.length * intentWords.length);
  }

  // Check if intent logically follows previous intent
  private isLogicalFollowUp(previousIntent: string, currentIntent: string): boolean {
    const followUpMap: Record<string, string[]> = {
      'greeting': ['booking.create', 'service.information', 'help'],
      'service.information': ['booking.create', 'pricing.information'],
      'pricing.information': ['booking.create'],
      'booking.create': ['booking.inquiry', 'professional.information'],
      'booking.inquiry': ['booking.create'],
      'help': ['booking.create', 'service.information', 'pricing.information']
    };

    return followUpMap[previousIntent]?.includes(currentIntent) || false;
  }

  // Enhanced entity extraction
  private extractEntities(text: string, pattern: IntentPattern): NLUEntity[] {
    const entities: NLUEntity[] = [];

    if (!pattern.entities) return entities;

    for (const entityConfig of pattern.entities) {
      for (const entityPattern of entityConfig.patterns) {
        const matches = text.matchAll(entityPattern);
        for (const match of matches) {
          if (match.index !== undefined) {
            entities.push({
              type: entityConfig.type,
              value: match[0],
              start: match.index,
              end: match.index + match[0].length,
              confidence: 0.8
            });
          }
        }
      }
    }

    return entities;
  }

  // Generate contextual response
  generateResponse(intent: NLUIntent): string {
    const pattern = this.patterns.find(p => p.intent === intent.intent);
    
    if (pattern && pattern.responses && pattern.responses.length > 0) {
      // Select response based on context and confidence
      const responseIndex = Math.floor(Math.random() * pattern.responses.length);
      let response = pattern.responses[responseIndex];

      // Add context-aware modifications
      if (intent.confidence < 0.6) {
        response = "I'm not completely sure, but " + response.toLowerCase();
      }

      // Add follow-up questions if available
      if (pattern.followUpQuestions && pattern.followUpQuestions.length > 0) {
        const followUpIndex = Math.floor(Math.random() * pattern.followUpQuestions.length);
        response += " " + pattern.followUpQuestions[followUpIndex];
      }

      return response;
    }

    // Default responses for unknown intents
    const defaultResponses = [
      "I'm not sure I understand. Could you please rephrase that?",
      "I'd be happy to help, but I need a bit more information.",
      "Let me help you with that. Could you tell me more about what you need?",
      "I can assist with bookings, services, and pricing. What would you like to know?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Add training data with enhanced features
  addTrainingData(examples: NLUTrainingExample[]): void {
    this.trainingData.push(...examples);
    this.buildVocabulary();
  }

  // Add custom intent patterns
  addIntentPattern(pattern: IntentPattern): void {
    this.patterns.push(pattern);
  }

  // Get conversation context
  getContext(): ConversationContext {
    return { ...this.context };
  }

  // Clear conversation context
  clearContext(): void {
    this.context = {
      previousIntents: [],
      sessionData: new Map(),
      conversationHistory: []
    };
  }

  // Train the model with new data
  async train(trainingData: NLUTrainingExample[]): Promise<void> {
    this.addTrainingData(trainingData);
    
    // Simulate training process
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`NLU model trained with ${trainingData.length} examples`);
        resolve();
      }, 1000);
    });
  }

  // Get model statistics
  getStats(): {
    totalPatterns: number;
    totalTrainingExamples: number;
    vocabularySize: number;
    intentCount: number;
  } {
    return {
      totalPatterns: this.patterns.length,
      totalTrainingExamples: this.trainingData.length,
      vocabularySize: this.vocabulary.size,
      intentCount: this.intentFrequency.size
    };
  }
}

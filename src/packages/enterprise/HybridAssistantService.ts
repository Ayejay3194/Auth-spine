import { HybridNLUService, TrainingDataset } from '../nlu/HybridNLUService.js';
import { SecurityFirewall, SecurityContext } from '../security/SecurityFirewall.js';
import { DecisionEngine } from '../decision/DecisionEngine.js';
import { EventBus } from '../events/EventBus.js';
import { AnalyticsService } from '../analytics/AnalyticsService.js';
import type { NLUIntent, PromptContext, Message } from '../core/types.js';

export interface HybridAssistantConfig {
  maxConversationLength: number;
  sessionTimeout: number;
  enableSecurity: boolean;
  enableAnalytics: boolean;
  enableDecisionEngine: boolean;
  nluConfig: {
    enableSnips: boolean;
    enableEnhanced: boolean;
    fallbackStrategy: 'snips' | 'enhanced' | 'combined';
    confidenceThreshold: number;
  };
  personality: 'professional' | 'friendly' | 'casual' | 'formal';
  responseDelay: number;
}

export interface HybridConversationSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  messages: Message[];
  context: PromptContext;
  securityContext: SecurityContext;
  personality: string;
  nluStats: {
    totalProcessed: number;
    snipsUsed: number;
    enhancedUsed: number;
    combinedUsed: number;
    averageConfidence: number;
  };
  metadata: Record<string, any>;
}

export interface HybridAssistantResponse {
  message: string;
  intent: NLUIntent;
  confidence: number;
  nluSource: 'enhanced' | 'snips' | 'combined';
  actions: string[];
  followUpQuestions: string[];
  securityViolations: any[];
  metadata: Record<string, any>;
}

export class HybridAssistantService {
  private nluService: HybridNLUService;
  private securityFirewall: SecurityFirewall;
  private decisionEngine: DecisionEngine;
  private eventBus: EventBus;
  private analyticsService: AnalyticsService;
  private sessions: Map<string, HybridConversationSession> = new Map();
  private config: HybridAssistantConfig;

  constructor(config: Partial<HybridAssistantConfig> = {}) {
    this.config = {
      maxConversationLength: 50,
      sessionTimeout: 30,
      enableSecurity: true,
      enableAnalytics: true,
      enableDecisionEngine: true,
      nluConfig: {
        enableSnips: true,
        enableEnhanced: true,
        fallbackStrategy: 'combined',
        confidenceThreshold: 0.7
      },
      personality: 'professional',
      responseDelay: 300,
      ...config
    };

    this.nluService = new HybridNLUService(this.config.nluConfig);
    this.securityFirewall = new SecurityFirewall();
    this.decisionEngine = new DecisionEngine();
    this.eventBus = new EventBus();
    this.analyticsService = new AnalyticsService();

    this.initializeAssistant();
  }

  private async initializeAssistant(): Promise<void> {
    // Load training data for both NLU systems
    const trainingData = this.generateComprehensiveTrainingData();
    await this.nluService.train(trainingData);

    // Set up event listeners
    this.setupEventListeners();

    console.log('Hybrid Assistant Service initialized with Snips NLU and Enhanced NLU');
  }

  private generateComprehensiveTrainingData(): TrainingDataset {
    return {
      intents: [
        {
          name: 'booking.create',
          utterances: [
            "I want to book a haircut",
            "Schedule an appointment for tomorrow",
            "Can I get a massage this week?",
            "I need to make a reservation",
            "Book me a facial for Friday",
            "I'd like to schedule a consultation",
            "Can you make an appointment for me?",
            "I need to book some time with a professional",
            "Schedule a manicure for next week",
            "I want to reserve a spot for hair styling"
          ]
        },
        {
          name: 'booking.inquiry',
          utterances: [
            "What appointments are available?",
            "Do you have any openings today?",
            "Can I see the schedule?",
            "What times are available?",
            "Are there any slots open this week?",
            "Show me available appointments",
            "When can I come in?",
            "Do you have availability tomorrow?",
            "What's your schedule like?",
            "Can I check your booking calendar?"
          ]
        },
        {
          name: 'pricing.information',
          utterances: [
            "How much does a haircut cost?",
            "What are your prices?",
            "Can you tell me about pricing?",
            "How much for a facial?",
            "What's the cost of a massage?",
            "Price list please",
            "How much do you charge?",
            "What are your rates?",
            "Cost information please",
            "Pricing details"
          ]
        },
        {
          name: 'booking.cancel',
          utterances: [
            "I need to cancel my appointment",
            "Can I reschedule my booking?",
            "I want to cancel my reservation",
            "Need to change my appointment time",
            "Cancel my booking please",
            "I have to reschedule",
            "Move my appointment to another day",
            "I can't make it to my appointment",
            "Please cancel my reservation",
            "Change my booking time"
          ]
        },
        {
          name: 'service.information',
          utterances: [
            "What services do you offer?",
            "Tell me about your services",
            "What can I get done here?",
            "Service menu please",
            "What treatments are available?",
            "List your services",
            "What do you specialize in?",
            "Service options",
            "Available treatments",
            "What can you help me with?"
          ]
        },
        {
          name: 'professional.information',
          utterances: [
            "Who are your professionals?",
            "Tell me about your staff",
            "Who will be doing my service?",
            "Professional information",
            "Staff details please",
            "Who works here?",
            "About your professionals",
            "Professional bios",
            "Team information",
            "Who are your experts?"
          ]
        },
        {
          name: 'greeting',
          utterances: [
            "Hello",
            "Hi there",
            "Hey",
            "Good morning",
            "Good afternoon",
            "Hi",
            "Hello there",
            "Greetings",
            "Hey there",
            "Good day"
          ]
        },
        {
          name: 'help',
          utterances: [
            "I need help",
            "Can you assist me?",
            "Help me please",
            "What can you do?",
            "How can you help?",
            "Assistance needed",
            "Support please",
            "I'm confused",
            "What should I do?",
            "Guide me"
          ]
        },
        {
          name: 'farewell',
          utterances: [
            "Goodbye",
            "Bye",
            "See you later",
            "Thanks bye",
            "That's all",
            "Done",
            "Thank you goodbye",
            "See ya",
            "Catch you later",
            "Farewell"
          ]
        },
        {
          name: 'confirmation',
          utterances: [
            "Yes",
            "That's correct",
            "Confirm",
            "That's right",
            "Yes please",
            "Absolutely",
            "Sure",
            "That works",
            "Perfect",
            "Sounds good"
          ]
        }
      ]
    };
  }

  private setupEventListeners(): void {
    this.eventBus.on('assistant.message_received', (eventData: any) => {
      if (this.config.enableAnalytics) {
        this.analyticsService.track({
          type: 'assistant.message_received',
          timestamp: new Date().toISOString(),
          userId: eventData.userId,
          data: {
            sessionId: eventData.sessionId,
            messageLength: eventData.message.length,
            intent: eventData.intent?.intent,
            nluSource: eventData.nluSource
          }
        });
      }
    });

    this.eventBus.on('assistant.nlu_processed', (eventData: any) => {
      if (this.config.enableAnalytics) {
        this.analyticsService.track({
          type: 'assistant.nlu_processed',
          timestamp: new Date().toISOString(),
          userId: eventData.userId,
          data: {
            sessionId: eventData.sessionId,
            nluSource: eventData.nluSource,
            confidence: eventData.confidence,
            processingTime: eventData.processingTime
          }
        });
      }
    });

    this.eventBus.on('assistant.security_violation', (eventData: any) => {
      console.warn('Security violation detected:', eventData);
      if (this.config.enableAnalytics) {
        this.analyticsService.track({
          type: 'assistant.security_violation',
          timestamp: new Date().toISOString(),
          userId: eventData.userId,
          data: {
            sessionId: eventData.sessionId,
            violationType: eventData.violationType,
            riskScore: eventData.riskScore
          }
        });
      }
    });
  }

  // Main chat method with hybrid NLU processing
  async processMessage(
    message: string,
    sessionId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<HybridAssistantResponse> {
    try {
      const startTime = Date.now();
      
      // Get or create session
      const session = this.getOrCreateSession(sessionId, userId, ipAddress, userAgent);
      
      // Update session activity
      session.lastActivity = new Date();
      
      // Add user message to conversation
      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        fromId: userId || 'anonymous',
        toId: 'assistant',
        channel: 'chat',
        sentAtUtc: new Date().toISOString()
      };
      session.messages.push(userMessage);

      // Security check on input
      let sanitizedMessage = message;
      let securityViolations: any[] = [];
      
      if (this.config.enableSecurity && session.securityContext) {
        const securityResult = await this.securityFirewall.checkSecurity(
          message,
          'input',
          session.securityContext
        );
        
        if (!securityResult.allowed) {
          throw new Error(securityResult.message || 'Access denied');
        }
        
        sanitizedMessage = securityResult.sanitizedData || message;
        securityViolations = securityResult.violations;
      }

      // Process message through hybrid NLU
      const nluStartTime = Date.now();
      const intent = await this.nluService.parse(sanitizedMessage, session.context);
      const nluProcessingTime = Date.now() - nluStartTime;

      // Get NLU source information
      const nluSourceInfo = await this.nluService.getIntentConfidence(sanitizedMessage);
      
      // Update session NLU stats
      session.nluStats.totalProcessed++;
      session.nluStats.averageConfidence = 
        (session.nluStats.averageConfidence * (session.nluStats.totalProcessed - 1) + intent.confidence) 
        / session.nluStats.totalProcessed;
      
      if (nluSourceInfo.source === 'snips') {
        session.nluStats.snipsUsed++;
      } else if (nluSourceInfo.source === 'enhanced') {
        session.nluStats.enhancedUsed++;
      } else {
        session.nluStats.combinedUsed++;
      }

      // Generate contextual response
      let responseText = this.nluService.generateResponse(intent);
      
      // Apply personality
      responseText = this.applyPersonality(responseText, session.personality);

      // Decision engine processing
      let actions: string[] = [];
      let followUpQuestions: string[] = [];
      
      if (this.config.enableDecisionEngine) {
        const decision = this.decisionEngine.makeDecision({
          intent: { intent: intent.intent, confidence: intent.confidence, entities: intent.entities },
          entities: intent.entities,
          confidence: intent.confidence,
          clientId: session.context.clientId,
          conversationHistory: session.context.conversationHistory,
          metadata: session.context.metadata
        });
        
        actions = decision.action ? [decision.action] : [];
        followUpQuestions = decision.nextSteps || [];
      }

      // Security check on output
      if (this.config.enableSecurity && session.securityContext) {
        const outputSecurityResult = await this.securityFirewall.checkSecurity(
          responseText,
          'output',
          session.securityContext
        );
        
        if (!outputSecurityResult.allowed) {
          responseText = "I apologize, but I cannot provide that information.";
        } else if (outputSecurityResult.sanitizedData) {
          responseText = outputSecurityResult.sanitizedData;
        }
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
        fromId: 'assistant',
        toId: userId || 'anonymous',
        channel: 'chat',
        sentAtUtc: new Date().toISOString()
      };
      session.messages.push(assistantMessage);

      // Emit events
      this.eventBus.emit({
        type: 'assistant.message_processed',
        timestamp: new Date().toISOString(),
        userId: userId,
        data: {
          sessionId,
          intent: intent.intent,
          confidence: intent.confidence,
          messageLength: responseText.length,
          nluSource: nluSourceInfo.source,
          processingTime: Date.now() - startTime
        }
      });

      this.eventBus.emit({
        type: 'assistant.nlu_processed',
        timestamp: new Date().toISOString(),
        userId: userId,
        data: {
          sessionId,
          nluSource: nluSourceInfo.source,
          confidence: intent.confidence,
          processingTime: nluProcessingTime
        }
      });

      // Track analytics
      if (this.config.enableAnalytics) {
        this.analyticsService.track({
          type: 'assistant.conversation_turn',
          timestamp: new Date().toISOString(),
          userId: userId,
          sessionId: sessionId,
          data: {
            intent: intent.intent,
            confidence: intent.confidence,
            nluSource: nluSourceInfo.source,
            responseTime: Date.now() - startTime,
            securityViolations: securityViolations.length
          }
        });
      }

      // Simulate response delay for natural conversation
      if (this.config.responseDelay > 0) {
        await this.delay(this.config.responseDelay);
      }

      return {
        message: responseText,
        intent,
        confidence: intent.confidence,
        nluSource: nluSourceInfo.source,
        actions,
        followUpQuestions,
        securityViolations,
        metadata: {
          sessionId,
          personality: session.personality,
          messageCount: session.messages.length,
          nluStats: session.nluStats,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Track error
      if (this.config.enableAnalytics) {
        this.analyticsService.track({
          type: 'assistant.error',
          timestamp: new Date().toISOString(),
          userId: userId,
          sessionId: sessionId,
          data: {
            error: error instanceof Error ? error.message : String(error),
            message: message.substring(0, 100)
          }
        });
      }

      return {
        message: "I apologize, but I encountered an error processing your request. Please try again.",
        intent: { intent: 'error', confidence: 0.1, entities: [] },
        confidence: 0.1,
        nluSource: 'enhanced',
        actions: [],
        followUpQuestions: [],
        securityViolations: [],
        metadata: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private getOrCreateSession(
    sessionId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): HybridConversationSession {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      const securityContext = this.securityFirewall.createContext(
        sessionId,
        ipAddress || 'unknown',
        userAgent || 'unknown',
        userId
      );

      session = {
        id: sessionId,
        userId,
        startTime: new Date(),
        lastActivity: new Date(),
        messages: [],
        context: {
          clientId: userId || 'anonymous',
          conversationHistory: [],
          metadata: {}
        },
        securityContext,
        personality: this.config.personality,
        nluStats: {
          totalProcessed: 0,
          snipsUsed: 0,
          enhancedUsed: 0,
          combinedUsed: 0,
          averageConfidence: 0
        },
        metadata: {}
      };

      this.sessions.set(sessionId, session);
    }

    // Check session timeout
    const now = new Date();
    const timeDiff = now.getTime() - session.lastActivity.getTime();
    if (timeDiff > this.config.sessionTimeout * 60 * 1000) {
      // Reset conversation context but keep session
      session.messages = [];
      session.context.conversationHistory = [];
    }

    return session;
  }

  private applyPersonality(message: string, personality: string): string {
    switch (personality) {
      case 'professional':
        return message.replace(/!/g, '.').replace(/\b(hi|hey)\b/gi, 'Hello');
      case 'friendly':
        return message + (message.includes('!') ? '' : ' 😊');
      case 'casual':
        return message.replace(/\b(I would|I can)\b/gi, "I'll").replace(/\b(please)\b/gi, 'pls');
      case 'formal':
        return message.replace(/\b(hi|hey|hello)\b/gi, 'Good day').replace(/!/g, '.');
      default:
        return message;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  async trainAssistant(trainingData?: TrainingDataset): Promise<void> {
    const data = trainingData || this.generateComprehensiveTrainingData();
    await this.nluService.train(data);
    
    if (this.config.enableAnalytics) {
      this.analyticsService.track({
        type: 'assistant.trained',
        timestamp: new Date().toISOString(),
        data: {
          trainingIntents: data.intents.length,
          trainingExamples: data.intents.reduce((sum, intent) => sum + intent.utterances.length, 0)
        }
      });
    }
  }

  getSession(sessionId: string): HybridConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Track session end
      if (this.config.enableAnalytics) {
        this.analyticsService.track({
          type: 'assistant.session_ended',
          timestamp: new Date().toISOString(),
          userId: session.userId,
          sessionId: sessionId,
          data: {
            duration: Date.now() - session.startTime.getTime(),
            messageCount: session.messages.length,
            nluStats: session.nluStats
          }
        });
      }
      
      this.sessions.delete(sessionId);
    }
  }

  updateConfig(newConfig: Partial<HybridAssistantConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.nluService.updateConfig(this.config.nluConfig);
  }

  getStats(): {
    activeSessions: number;
    totalMessages: number;
    averageSessionLength: number;
    securityStats: any;
    nluStats: any;
    hybridStats: any;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.messages.length, 0) / sessions.length 
      : 0;

    // Aggregate NLU stats
    const aggregatedNLUStats = sessions.reduce((acc, session) => ({
      totalProcessed: acc.totalProcessed + session.nluStats.totalProcessed,
      snipsUsed: acc.snipsUsed + session.nluStats.snipsUsed,
      enhancedUsed: acc.enhancedUsed + session.nluStats.enhancedUsed,
      combinedUsed: acc.combinedUsed + session.nluStats.combinedUsed,
      averageConfidence: sessions.length > 0 
        ? (acc.averageConfidence + session.nluStats.averageConfidence) / sessions.length 
        : 0
    }), {
      totalProcessed: 0,
      snipsUsed: 0,
      enhancedUsed: 0,
      combinedUsed: 0,
      averageConfidence: 0
    });

    return {
      activeSessions: sessions.length,
      totalMessages,
      averageSessionLength,
      securityStats: this.securityFirewall.getSecurityStats(),
      nluStats: this.nluService.getStats(),
      hybridStats: {
        ...aggregatedNLUStats,
        config: this.config.nluConfig
      }
    };
  }

  // Advanced NLU methods
  async getIntentAnalysis(text: string): Promise<{
    intent: string;
    confidence: number;
    source: 'enhanced' | 'snips' | 'combined';
    entities: any[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    const result = await this.nluService.getIntentConfidence(text);
    const processingTime = Date.now() - startTime;

    return {
      intent: result.intent,
      confidence: result.confidence,
      source: result.source,
      entities: [], // Would need to extract entities
      processingTime
    };
  }

  // Security methods
  addSecurityRule(rule: any): void {
    this.securityFirewall.addRule(rule);
  }

  getSecurityAuditLog(limit?: number): any[] {
    return this.securityFirewall.getAuditLog(limit);
  }

  blockIP(ipAddress: string): void {
    this.securityFirewall.blockIP(ipAddress);
  }

  unblockIP(ipAddress: string): void {
    this.securityFirewall.unblockIP(ipAddress);
  }

  // Export/import capabilities
  exportTrainingData(): TrainingDataset {
    return this.nluService.exportTrainingData();
  }

  async importTrainingData(dataset: TrainingDataset): Promise<void> {
    await this.nluService.train(dataset);
  }
}

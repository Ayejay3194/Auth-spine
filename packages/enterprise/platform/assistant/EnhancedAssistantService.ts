import { EnhancedNLUService } from '../nlu/EnhancedNLUService.js';
import { SecurityFirewall, SecurityContext } from '../security/SecurityFirewall.js';
import { DecisionEngine } from '../decision/DecisionEngine.js';
import { EventBus } from '../events/EventBus.js';
import { AnalyticsService } from '../analytics/AnalyticsService.js';
import type { NLUIntent, PromptContext, Message } from '../core/types.js';

export interface AssistantConfig {
  maxConversationLength: number;
  sessionTimeout: number; // in minutes
  enableSecurity: boolean;
  enableAnalytics: boolean;
  enableDecisionEngine: boolean;
  personality: 'professional' | 'friendly' | 'casual' | 'formal';
  responseDelay: number; // in milliseconds
}

export interface ConversationSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  messages: Message[];
  context: PromptContext;
  securityContext: SecurityContext;
  personality: string;
  metadata: Record<string, any>;
}

export interface AssistantResponse {
  message: string;
  intent: NLUIntent;
  confidence: number;
  actions: string[];
  followUpQuestions: string[];
  securityViolations: any[];
  metadata: Record<string, any>;
}

export class EnhancedAssistantService {
  private nluService: EnhancedNLUService;
  private securityFirewall: SecurityFirewall;
  private decisionEngine: DecisionEngine;
  private eventBus: EventBus;
  private analyticsService: AnalyticsService;
  private sessions: Map<string, ConversationSession> = new Map();
  private config: AssistantConfig;

  constructor(config: Partial<AssistantConfig> = {}) {
    this.config = {
      maxConversationLength: 50,
      sessionTimeout: 30,
      enableSecurity: true,
      enableAnalytics: true,
      enableDecisionEngine: true,
      personality: 'professional',
      responseDelay: 500,
      ...config
    };

    this.nluService = new EnhancedNLUService();
    this.securityFirewall = new SecurityFirewall();
    this.decisionEngine = new DecisionEngine();
    this.eventBus = new EventBus();
    this.analyticsService = new AnalyticsService();

    this.initializeAssistant();
  }

  private async initializeAssistant(): Promise<void> {
    // Load training data
    const { comprehensiveTrainingData } = await import('../nlu/training-data.js');
    await this.nluService.train(comprehensiveTrainingData);

    // Set up event listeners
    this.setupEventListeners();

    console.log('Enhanced Assistant Service initialized with security and NLU capabilities');
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
            intent: eventData.intent?.intent
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

  // Main chat method with full security and NLU processing
  async processMessage(
    message: string,
    sessionId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AssistantResponse> {
    try {
      // Get or create session
      const session = this.getOrCreateSession(sessionId, userId, ipAddress, userAgent);
      
      // Update session activity
      session.lastActivity = new Date();
      
      // Add user message to conversation
      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
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

      // Process message through NLU
      const intent = this.nluService.parse(sanitizedMessage, {
        previousIntents: session.messages
          .filter(m => m.role === 'assistant')
          .map(m => this.nluService.parse(m.content))
      });

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
        timestamp: new Date().toISOString()
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
          messageLength: responseText.length
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
            responseTime: Date.now() - session.startTime.getTime(),
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
        actions,
        followUpQuestions,
        securityViolations,
        metadata: {
          sessionId,
          personality: session.personality,
          messageCount: session.messages.length
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
  ): ConversationSession {
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
  async trainAssistant(trainingData: any[]): Promise<void> {
    await this.nluService.train(trainingData);
    
    if (this.config.enableAnalytics) {
      this.analyticsService.track({
        type: 'assistant.trained',
        timestamp: new Date().toISOString(),
        data: {
          trainingExamples: trainingData.length
        }
      });
    }
  }

  getSession(sessionId: string): ConversationSession | undefined {
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
            messageCount: session.messages.length
          }
        });
      }
      
      this.sessions.delete(sessionId);
    }
  }

  updateConfig(newConfig: Partial<AssistantConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getStats(): {
    activeSessions: number;
    totalMessages: number;
    averageSessionLength: number;
    securityStats: any;
    nluStats: any;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.messages.length, 0) / sessions.length 
      : 0;

    return {
      activeSessions: sessions.length,
      totalMessages,
      averageSessionLength,
      securityStats: this.securityFirewall.getSecurityStats(),
      nluStats: this.nluService.getStats()
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
}

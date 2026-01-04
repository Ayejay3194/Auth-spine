import { HybridAssistantService } from '../assistant/HybridAssistantService.js';
import { SecurityFirewall } from '../security/SecurityFirewall.js';
import { EventBus } from '../events/EventBus.js';
import { AnalyticsService } from '../analytics/AnalyticsService.js';
import type { NLUIntent, PromptContext, Message } from '../core/types.js';

export interface CopilotKitConfig {
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  properties: {
    name: string;
    instructions: string;
    description?: string;
    context?: string;
  };
  features: {
    enableAutoComplete: boolean;
    enableCoPilotText: boolean;
    enableSidePanel: boolean;
    enableInlineActions: boolean;
    enableContextualActions: boolean;
    enableMultiModal: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    size: 'small' | 'medium' | 'large';
    animations: boolean;
  };
  security: {
    enableInputValidation: boolean;
    enableOutputFiltering: boolean;
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
  };
}

export interface CopilotAction {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (context: any) => Promise<any>;
}

export interface CopilotContext {
  userId?: string;
  sessionId: string;
  page: string;
  component: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context: CopilotContext;
  actions?: CopilotAction[];
  metadata: {
    intent?: NLUIntent;
    confidence?: number;
    nluSource?: 'enhanced' | 'snips' | 'combined';
    processingTime?: number;
    securityViolations?: any[];
  };
}

export class CopilotKitIntegration {
  private config: CopilotKitConfig;
  private assistant: HybridAssistantService;
  private security: SecurityFirewall;
  private eventBus: EventBus;
  private analytics: AnalyticsService;
  private actions: Map<string, CopilotAction> = new Map();
  private contexts: Map<string, CopilotContext> = new Map();
  private messageHistory: Map<string, CopilotMessage[]> = new Map();
  private requestCount: Map<string, number[]> = new Map();

  constructor(config: Partial<CopilotKitConfig> = {}) {
    this.config = {
      endpoint: '/api/platform/assistant/hybrid-chat',
      properties: {
        name: 'Auth-Spine AI Assistant',
        instructions: 'You are a helpful AI assistant integrated with the Auth-Spine platform. You can help users with booking appointments, getting pricing information, answering questions about services, and providing general assistance.',
        description: 'Advanced AI assistant with hybrid NLU capabilities',
        context: 'Enterprise platform with booking, scheduling, and customer management features'
      },
      features: {
        enableAutoComplete: true,
        enableCoPilotText: true,
        enableSidePanel: true,
        enableInlineActions: true,
        enableContextualActions: true,
        enableMultiModal: true,
      },
      ui: {
        theme: 'auto',
        position: 'bottom-right',
        size: 'medium',
        animations: true,
      },
      security: {
        enableInputValidation: true,
        enableOutputFiltering: true,
        enableRateLimiting: true,
        maxRequestsPerMinute: 60,
      },
      ...config
    };

    this.assistant = new HybridAssistantService({
      enableSecurity: this.config.security.enableInputValidation,
      enableAnalytics: true,
      enableDecisionEngine: true,
      nluConfig: {
        enableSnips: true,
        enableEnhanced: true,
        fallbackStrategy: 'combined',
        confidenceThreshold: 0.7
      }
    });

    this.security = new SecurityFirewall();
    this.eventBus = new EventBus();
    this.analytics = new AnalyticsService();

    this.initializeDefaultActions();
  }

  private initializeDefaultActions(): void {
    // Booking actions
    this.registerAction({
      name: 'book_appointment',
      description: 'Book an appointment for a service',
      parameters: {
        service: 'string',
        datetime: 'string',
        duration: 'number'
      },
      handler: async (context) => {
        const { service, datetime, duration } = context.parameters;
        // Implementation would integrate with booking engine
        return {
          success: true,
          bookingId: `booking_${Date.now()}`,
          confirmation: `Appointment booked for ${service} on ${datetime}`
        };
      }
    });

    // Pricing actions
    this.registerAction({
      name: 'get_pricing',
      description: 'Get pricing information for services',
      parameters: {
        service: 'string'
      },
      handler: async (context) => {
        const { service } = context.parameters;
        // Implementation would integrate with pricing engine
        return {
          service,
          price: '$50-150',
          duration: '60 minutes',
          currency: 'USD'
        };
      }
    });

    // Availability actions
    this.registerAction({
      name: 'check_availability',
      description: 'Check availability for a service',
      parameters: {
        service: 'string',
        date: 'string'
      },
      handler: async (context) => {
        const { service, date } = context.parameters;
        // Implementation would integrate with booking engine
        return {
          service,
          date,
          availableSlots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']
        };
      }
    });

    // User profile actions
    this.registerAction({
      name: 'update_profile',
      description: 'Update user profile information',
      parameters: {
        field: 'string',
        value: 'string'
      },
      handler: async (context) => {
        const { field, value } = context.parameters;
        // Implementation would integrate with user management
        return {
          success: true,
          field,
          updatedValue: value,
          message: `Profile ${field} updated successfully`
        };
      }
    });
  }

  // Action Management
  registerAction(action: CopilotAction): void {
    this.actions.set(action.name, action);
  }

  unregisterAction(name: string): void {
    this.actions.delete(name);
  }

  getAction(name: string): CopilotAction | undefined {
    return this.actions.get(name);
  }

  listActions(): CopilotAction[] {
    return Array.from(this.actions.values());
  }

  // Context Management
  setContext(sessionId: string, context: CopilotContext): void {
    this.contexts.set(sessionId, context);
  }

  getContext(sessionId: string): CopilotContext | undefined {
    return this.contexts.get(sessionId);
  }

  updateContext(sessionId: string, updates: Partial<CopilotContext>): void {
    const existing = this.contexts.get(sessionId);
    if (existing) {
      this.contexts.set(sessionId, { ...existing, ...updates });
    }
  }

  // Message Processing
  async processMessage(
    message: string,
    sessionId: string,
    context?: Partial<CopilotContext>
  ): Promise<CopilotMessage> {
    const fullContext: CopilotContext = {
      sessionId,
      page: context?.page || 'unknown',
      component: context?.component || 'chat',
      data: context?.data || {},
      metadata: context?.metadata || {},
      ...context
    };

    // Rate limiting
    if (this.config.security.enableRateLimiting) {
      await this.checkRateLimit(sessionId);
    }

    // Security check
    if (this.config.security.enableInputValidation) {
      const securityContext = this.security.createContext(
        sessionId,
        '127.0.0.1',
        'copilotkit',
        fullContext.userId
      );

      const securityResult = await this.security.checkSecurity(
        message,
        'input',
        securityContext
      );

      if (!securityResult.allowed) {
        throw new Error(securityResult.message || 'Message blocked by security');
      }
    }

    const startTime = Date.now();

    try {
      // Process through hybrid assistant
      const response = await this.assistant.processMessage(
        message,
        sessionId,
        fullContext.userId,
        '127.0.0.1',
        'copilotkit'
      );

      const processingTime = Date.now() - startTime;

      // Create assistant message
      const assistantMessage: CopilotMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        context: fullContext,
        actions: this.extractActions(response.intent),
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          nluSource: response.nluSource,
          processingTime,
          securityViolations: response.securityViolations
        }
      };

      // Store message
      this.storeMessage(sessionId, assistantMessage);

      // Emit events
      this.eventBus.emit({
        type: 'copilot.message_processed',
        timestamp: new Date().toISOString(),
        data: {
          sessionId,
          message: assistantMessage,
          processingTime
        }
      });

      return assistantMessage;

    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Create error message
      const errorMessage: CopilotMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        context: fullContext,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          processingTime
        }
      };

      this.storeMessage(sessionId, errorMessage);

      throw error;
    }
  }

  // Auto-complete functionality
  async getAutoComplete(
    partial: string,
    sessionId: string,
    context?: Partial<CopilotContext>
  ): Promise<string[]> {
    if (!this.config.features.enableAutoComplete) {
      return [];
    }

    const fullContext = this.getContext(sessionId) || {
      sessionId,
      page: 'unknown',
      component: 'autocomplete',
      data: {},
      metadata: {}
    };

    // Generate suggestions based on context and partial input
    const suggestions = [
      partial + ' appointment',
      partial + ' booking',
      partial + ' pricing',
      partial + ' availability',
      partial + ' cancel',
      partial + ' reschedule',
      partial + ' services',
      partial + ' help'
    ];

    return suggestions.filter(s => s !== partial);
  }

  // Contextual actions
  async getContextualActions(
    context: CopilotContext
  ): Promise<CopilotAction[]> {
    if (!this.config.features.enableContextualActions) {
      return [];
    }

    const relevantActions: CopilotAction[] = [];

    // Filter actions based on context
    for (const action of this.actions.values()) {
      if (this.isActionRelevant(action, context)) {
        relevantActions.push(action);
      }
    }

    return relevantActions;
  }

  private isActionRelevant(action: CopilotAction, context: CopilotContext): boolean {
    // Simple relevance check - can be enhanced with more sophisticated logic
    const pageActions = {
      'booking': ['book_appointment', 'check_availability'],
      'pricing': ['get_pricing'],
      'profile': ['update_profile'],
      'services': ['get_pricing', 'book_appointment']
    };

    const relevantForPage = pageActions[context.page as keyof typeof pageActions];
    return relevantForPage?.includes(action.name) || true;
  }

  // Multi-modal support
  async processMultiModal(
    input: {
      text?: string;
      image?: File;
      audio?: File;
      document?: File;
    },
    sessionId: string,
    context?: Partial<CopilotContext>
  ): Promise<CopilotMessage> {
    if (!this.config.features.enableMultiModal) {
      throw new Error('Multi-modal support is not enabled');
    }

    let message = input.text || '';

    // Process different input types
    if (input.image) {
      message += ` [Image: ${input.image.name}]`;
    }

    if (input.audio) {
      message += ` [Audio: ${input.audio.name}]`;
    }

    if (input.document) {
      message += ` [Document: ${input.document.name}]`;
    }

    return await this.processMessage(message, sessionId, context);
  }

  // Side panel functionality
  async getSidePanelContent(
    sessionId: string,
    context?: Partial<CopilotContext>
  ): Promise<{
    title: string;
    content: string;
    actions: CopilotAction[];
    suggestions: string[];
  }> {
    if (!this.config.features.enableSidePanel) {
      throw new Error('Side panel is not enabled');
    }

    const fullContext = this.getContext(sessionId) || {
      sessionId,
      page: 'unknown',
      component: 'sidepanel',
      data: {},
      metadata: {}
    };

    const contextualActions = await this.getContextualActions(fullContext);
    const suggestions = await this.getAutoComplete('', sessionId, context);

    return {
      title: 'AI Assistant',
      content: this.config.properties.description || 'How can I help you today?',
      actions: contextualActions,
      suggestions
    };
  }

  // Co-pilot text functionality
  async getCoPilotText(
    element: string,
    context: CopilotContext
  ): Promise<string> {
    if (!this.config.features.enableCoPilotText) {
      return '';
    }

    // Generate contextual help text based on element and context
    const helpTexts: Record<string, string> = {
      'booking_form': 'Fill in your preferred date and time to book an appointment.',
      'service_selection': 'Choose from our available services to see pricing and availability.',
      'profile_page': 'Update your personal information and preferences here.',
      'pricing_page': 'View detailed pricing information for all our services.'
    };

    return helpTexts[element] || 'I can help you with this. What would you like to know?';
  }

  // Inline actions
  async executeInlineAction(
    actionName: string,
    parameters: Record<string, any>,
    context: CopilotContext
  ): Promise<any> {
    if (!this.config.features.enableInlineActions) {
      throw new Error('Inline actions are not enabled');
    }

    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`Action '${actionName}' not found`);
    }

    try {
      const result = await action.handler({ ...context, parameters });
      
      // Track action execution
      this.analytics.track({
        type: 'copilot.action_executed',
        timestamp: new Date().toISOString(),
        userId: context.userId,
        data: {
          actionName,
          parameters,
          result,
          context
        }
      });

      return result;
    } catch (error) {
      this.analytics.track({
        type: 'copilot.action_error',
        timestamp: new Date().toISOString(),
        userId: context.userId,
        data: {
          actionName,
          error: error instanceof Error ? error.message : String(error),
          context
        }
      });

      throw error;
    }
  }

  // Utility Methods
  private extractActions(intent: NLUIntent): CopilotAction[] {
    const relevantActions: CopilotAction[] = [];

    // Extract actions based on intent
    if (intent.intent.includes('booking') || intent.intent.includes('appointment')) {
      const bookingAction = this.actions.get('book_appointment');
      if (bookingAction) relevantActions.push(bookingAction);
    }

    if (intent.intent.includes('pricing') || intent.intent.includes('cost')) {
      const pricingAction = this.actions.get('get_pricing');
      if (pricingAction) relevantActions.push(pricingAction);
    }

    if (intent.intent.includes('availability') || intent.intent.includes('schedule')) {
      const availabilityAction = this.actions.get('check_availability');
      if (availabilityAction) relevantActions.push(availabilityAction);
    }

    return relevantActions;
  }

  private storeMessage(sessionId: string, message: CopilotMessage): void {
    if (!this.messageHistory.has(sessionId)) {
      this.messageHistory.set(sessionId, []);
    }
    
    const history = this.messageHistory.get(sessionId)!;
    history.push(message);
    
    // Keep only last 50 messages
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  private async checkRateLimit(sessionId: string): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.requestCount.has(sessionId)) {
      this.requestCount.set(sessionId, []);
    }

    const requests = this.requestCount.get(sessionId)!;
    
    // Remove old requests
    const validRequests = requests.filter(time => time > oneMinuteAgo);
    this.requestCount.set(sessionId, validRequests);

    if (validRequests.length >= this.config.security.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Add current request
    validRequests.push(now);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Analytics and Monitoring
  getAnalytics(): {
    totalSessions: number;
    totalMessages: number;
    totalActions: number;
    averageResponseTime: number;
    topActions: Array<{ name: string; count: number }>;
  } {
    const totalSessions = this.contexts.size;
    const totalMessages = Array.from(this.messageHistory.values())
      .reduce((sum, messages) => sum + messages.length, 0);
    const totalActions = this.actions.size;

    // Calculate average response time
    const allMessages = Array.from(this.messageHistory.values()).flat();
    const responseTimes = allMessages
      .filter(m => m.metadata.processingTime)
      .map(m => m.metadata.processingTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Get top actions (mock data for now)
    const topActions = [
      { name: 'book_appointment', count: 45 },
      { name: 'get_pricing', count: 32 },
      { name: 'check_availability', count: 28 },
      { name: 'update_profile', count: 15 }
    ];

    return {
      totalSessions,
      totalMessages,
      totalActions,
      averageResponseTime,
      topActions
    };
  }

  // Configuration
  updateConfig(newConfig: Partial<CopilotKitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): CopilotKitConfig {
    return { ...this.config };
  }

  // Cleanup
  cleanup(): void {
    this.actions.clear();
    this.contexts.clear();
    this.messageHistory.clear();
    this.requestCount.clear();
  }
}

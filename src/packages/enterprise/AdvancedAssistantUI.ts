import { HybridAssistantService } from '../assistant/HybridAssistantService.js';
import { SecurityFirewall } from '../security/SecurityFirewall.js';
import { EventBus } from '../events/EventBus.js';
import { AnalyticsService } from '../analytics/AnalyticsService.js';
import type { NLUIntent, PromptContext, Message } from '../core/types.js';

export interface AdvancedUIConfig {
  theme: 'light' | 'dark' | 'auto';
  layout: 'sidebar' | 'fullscreen' | 'embedded';
  features: {
    enableVoiceInput: boolean;
    enableFileUpload: boolean;
    enableCodeHighlight: boolean;
    enableMarkdown: boolean;
    enableStreaming: boolean;
    enableSuggestions: boolean;
    enableFeedback: boolean;
    enableExport: boolean;
  };
  assistant: {
    enableHybridNLU: boolean;
    enableSecurity: boolean;
    enableAnalytics: boolean;
    personality: 'professional' | 'friendly' | 'casual' | 'formal';
    responseDelay: number;
  };
  ui: {
    showTimestamps: boolean;
    showConfidence: boolean;
    showNLUSource: boolean;
    showSecurityStatus: boolean;
    enableAnimations: boolean;
    compactMode: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata: {
    intent?: string;
    confidence?: number;
    nluSource?: 'enhanced' | 'snips' | 'combined';
    securityViolations?: any[];
    processingTime?: number;
    entities?: any[];
  };
  status: 'sending' | 'sent' | 'processing' | 'completed' | 'error';
}

export interface UIEvent {
  type: 'message_sent' | 'message_received' | 'nlu_processed' | 'security_violation' | 'error';
  timestamp: Date;
  data: any;
}

export interface ConversationState {
  sessionId: string;
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  securityStatus: 'secure' | 'warning' | 'blocked';
  nluStats: {
    totalProcessed: number;
    snipsUsage: number;
    enhancedUsage: number;
    combinedUsage: number;
    averageConfidence: number;
  };
}

export class AdvancedAssistantUI {
  private config: AdvancedUIConfig;
  private assistant: HybridAssistantService;
  private security: SecurityFirewall;
  private eventBus: EventBus;
  private analytics: AnalyticsService;
  private conversations: Map<string, ConversationState> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<AdvancedUIConfig> = {}) {
    this.config = {
      theme: 'auto',
      layout: 'sidebar',
      features: {
        enableVoiceInput: true,
        enableFileUpload: true,
        enableCodeHighlight: true,
        enableMarkdown: true,
        enableStreaming: true,
        enableSuggestions: true,
        enableFeedback: true,
        enableExport: true,
      },
      assistant: {
        enableHybridNLU: true,
        enableSecurity: true,
        enableAnalytics: true,
        personality: 'professional',
        responseDelay: 300,
      },
      ui: {
        showTimestamps: true,
        showConfidence: true,
        showNLUSource: true,
        showSecurityStatus: true,
        enableAnimations: true,
        compactMode: false,
      },
      ...config
    };

    this.assistant = new HybridAssistantService({
      enableSecurity: this.config.assistant.enableSecurity,
      enableAnalytics: this.config.assistant.enableAnalytics,
      enableDecisionEngine: true,
      nluConfig: {
        enableSnips: this.config.assistant.enableHybridNLU,
        enableEnhanced: true,
        fallbackStrategy: 'combined',
        confidenceThreshold: 0.7
      },
      personality: this.config.assistant.personality,
      responseDelay: this.config.assistant.responseDelay
    });

    this.security = new SecurityFirewall();
    this.eventBus = new EventBus();
    this.analytics = new AnalyticsService();

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // UI event listeners
    this.eventBus.on('ui.message_sent', (data) => {
      this.emit('message_sent', data);
    });

    this.eventBus.on('ui.message_received', (data) => {
      this.emit('message_received', data);
    });

    this.eventBus.on('ui.nlu_processed', (data) => {
      this.emit('nlu_processed', data);
    });

    this.eventBus.on('ui.security_violation', (data) => {
      this.emit('security_violation', data);
    });

    this.eventBus.on('ui.error', (data) => {
      this.emit('error', data);
    });
  }

  // Conversation Management
  async sendMessage(
    message: string,
    sessionId: string,
    userId?: string,
    options: {
      enableVoice?: boolean;
      attachments?: File[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ChatMessage> {
    const conversation = this.getOrCreateConversation(sessionId);
    
    // Create user message
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        ...options.metadata,
        attachments: options.attachments?.map(f => ({ name: f.name, size: f.size, type: f.type }))
      },
      status: 'sent'
    };

    conversation.messages.push(userMessage);
    conversation.isTyping = true;

    // Emit message sent event
    this.emit('message_sent', {
      sessionId,
      message: userMessage,
      conversation
    });

    try {
      // Security check
      if (this.config.assistant.enableSecurity) {
        const securityContext = this.security.createContext(
          sessionId,
          '127.0.0.1',
          'advanced-ui',
          userId
        );

        const securityResult = await this.security.checkSecurity(
          message,
          'input',
          securityContext
        );

        if (!securityResult.allowed) {
          throw new Error(securityResult.message || 'Message blocked by security');
        }

        if (securityResult.violations.length > 0) {
          conversation.securityStatus = 'warning';
        }
      }

      // Process through assistant
      const startTime = Date.now();
      const response = await this.assistant.processMessage(
        message,
        sessionId,
        userId,
        '127.0.0.1',
        'advanced-ui'
      );
      const processingTime = Date.now() - startTime;

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          intent: response.intent.intent,
          confidence: response.confidence,
          nluSource: response.nluSource,
          securityViolations: response.securityViolations,
          processingTime,
          entities: response.intent.entities
        },
        status: 'completed'
      };

      conversation.messages.push(assistantMessage);
      conversation.isTyping = false;

      // Update NLU stats
      conversation.nluStats.totalProcessed++;
      if (response.nluSource === 'snips') {
        conversation.nluStats.snipsUsage++;
      } else if (response.nluSource === 'enhanced') {
        conversation.nluStats.enhancedUsage++;
      } else {
        conversation.nluStats.combinedUsage++;
      }

      conversation.nluStats.averageConfidence = 
        (conversation.nluStats.averageConfidence * (conversation.nluStats.totalProcessed - 1) + response.confidence) 
        / conversation.nluStats.totalProcessed;

      // Update security status
      if (response.securityViolations.length > 0) {
        conversation.securityStatus = 'warning';
      } else {
        conversation.securityStatus = 'secure';
      }

      // Emit message received event
      this.emit('message_received', {
        sessionId,
        message: assistantMessage,
        conversation,
        response
      });

      return assistantMessage;

    } catch (error) {
      conversation.isTyping = false;
      conversation.securityStatus = 'blocked';

      // Create error message
      const errorMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        },
        status: 'error'
      };

      conversation.messages.push(errorMessage);

      // Emit error event
      this.emit('error', {
        sessionId,
        error,
        conversation
      });

      return errorMessage;
    }
  }

  // Voice Input Integration
  async startVoiceInput(sessionId: string): Promise<void> {
    if (!this.config.features.enableVoiceInput) {
      throw new Error('Voice input is not enabled');
    }

    // Initialize voice recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.sendMessage(transcript, sessionId);
      };

      recognition.onerror = (event: any) => {
        this.emit('error', {
          sessionId,
          error: new Error(`Voice recognition error: ${event.error}`)
        });
      };

      recognition.start();
    } else {
      throw new Error('Voice recognition is not supported in this browser');
    }
  }

  // File Upload Integration
  async uploadFiles(
    files: File[],
    sessionId: string,
    userId?: string
  ): Promise<void> {
    if (!this.config.features.enableFileUpload) {
      throw new Error('File upload is not enabled');
    }

    const attachments: File[] = [];
    
    for (const file of files) {
      // Security check for files
      const allowedTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`File ${file.name} is too large`);
      }

      attachments.push(file);
    }

    // Send message with attachments
    const message = `I've uploaded ${attachments.length} file(s): ${attachments.map(f => f.name).join(', ')}`;
    await this.sendMessage(message, sessionId, userId, { attachments });
  }

  // Streaming Support
  async *streamMessage(
    message: string,
    sessionId: string,
    userId?: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.config.features.enableStreaming) {
      throw new Error('Streaming is not enabled');
    }

    const conversation = this.getOrCreateConversation(sessionId);
    conversation.isTyping = true;

    try {
      // Simulate streaming response
      const response = await this.sendMessage(message, sessionId, userId);
      const words = response.content.split(' ');

      for (let i = 0; i < words.length; i++) {
        yield words.slice(0, i + 1).join(' ');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } finally {
      conversation.isTyping = false;
    }
  }

  // Suggestions and Auto-completion
  async getSuggestions(
    partialMessage: string,
    sessionId: string
  ): Promise<string[]> {
    if (!this.config.features.enableSuggestions) {
      return [];
    }

    const conversation = this.getConversation(sessionId);
    const context = conversation?.messages.slice(-3).map(m => m.content).join(' ') || '';

    // Generate suggestions based on context and partial input
    const suggestions = [
      partialMessage + ' booking',
      partialMessage + ' appointment',
      partialMessage + ' pricing',
      partialMessage + ' availability',
      partialMessage + ' cancellation'
    ];

    return suggestions.filter(s => s !== partialMessage);
  }

  // Export and Analytics
  async exportConversation(
    sessionId: string,
    format: 'json' | 'txt' | 'csv' = 'json'
  ): Promise<string> {
    const conversation = this.getConversation(sessionId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(conversation, null, 2);
      
      case 'txt':
        return conversation.messages
          .map(m => `[${m.timestamp.toISOString()}] ${m.role}: ${m.content}`)
          .join('\n');
      
      case 'csv':
        const headers = 'Timestamp,Role,Content,Intent,Confidence,NLU Source\n';
        const rows = conversation.messages.map(m => 
          `${m.timestamp.toISOString()},${m.role},"${m.content}","${m.metadata.intent || ''}",${m.metadata.confidence || 0},${m.metadata.nluSource || ''}`
        ).join('\n');
        return headers + rows;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // UI State Management
  getConversation(sessionId: string): ConversationState | undefined {
    return this.conversations.get(sessionId);
  }

  private getOrCreateConversation(sessionId: string): ConversationState {
    let conversation = this.conversations.get(sessionId);
    
    if (!conversation) {
      conversation = {
        sessionId,
        messages: [],
        isTyping: false,
        isConnected: true,
        securityStatus: 'secure',
        nluStats: {
          totalProcessed: 0,
          snipsUsage: 0,
          enhancedUsage: 0,
          combinedUsage: 0,
          averageConfidence: 0
        }
      };
      this.conversations.set(sessionId, conversation);
    }

    return conversation;
  }

  // Event Management
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Also emit through event bus
    this.eventBus.emit({
      type: `ui.${event}`,
      timestamp: new Date().toISOString(),
      data
    });
  }

  // Configuration and Utilities
  updateConfig(newConfig: Partial<AdvancedUIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update assistant config
    this.assistant.updateConfig({
      enableSecurity: this.config.assistant.enableSecurity,
      enableAnalytics: this.config.assistant.enableAnalytics,
      personality: this.config.assistant.personality,
      responseDelay: this.config.assistant.responseDelay
    });
  }

  getConfig(): AdvancedUIConfig {
    return { ...this.config };
  }

  // Analytics and Metrics
  getAnalytics(): {
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    nluStats: any;
    securityStats: any;
  } {
    const conversations = Array.from(this.conversations.values());
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const totalConversations = conversations.length;

    // Calculate average response time
    const responseTimes = conversations
      .flatMap(conv => conv.messages)
      .filter(m => m.role === 'assistant' && m.metadata.processingTime)
      .map(m => m.metadata.processingTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Aggregate NLU stats
    const nluStats = conversations.reduce((acc, conv) => ({
      totalProcessed: acc.totalProcessed + conv.nluStats.totalProcessed,
      snipsUsage: acc.snipsUsage + conv.nluStats.snipsUsage,
      enhancedUsage: acc.enhancedUsage + conv.nluStats.enhancedUsage,
      combinedUsage: acc.combinedUsage + conv.nluStats.combinedUsage,
      averageConfidence: conv.nluStats.averageConfidence
    }), {
      totalProcessed: 0,
      snipsUsage: 0,
      enhancedUsage: 0,
      combinedUsage: 0,
      averageConfidence: 0
    });

    // Get security stats
    const securityStats = this.security.getSecurityStats();

    return {
      totalConversations,
      totalMessages,
      averageResponseTime,
      nluStats,
      securityStats
    };
  }

  // Cleanup
  cleanup(): void {
    this.conversations.clear();
    this.eventListeners.clear();
  }

  // Utility Methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Theme Management
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.config.theme = theme;
    
    if (typeof document !== 'undefined') {
      if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  }

  // Layout Management
  setLayout(layout: 'sidebar' | 'fullscreen' | 'embedded'): void {
    this.config.layout = layout;
    this.emit('layout_changed', { layout });
  }

  // Feature Toggles
  enableFeature(feature: keyof AdvancedUIConfig['features']): void {
    this.config.features[feature] = true;
    this.emit('feature_enabled', { feature });
  }

  disableFeature(feature: keyof AdvancedUIConfig['features']): void {
    this.config.features[feature] = false;
    this.emit('feature_disabled', { feature });
  }

  isFeatureEnabled(feature: keyof AdvancedUIConfig['features']): boolean {
    return this.config.features[feature];
  }
}

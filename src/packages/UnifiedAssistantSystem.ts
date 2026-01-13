import { HybridAssistantService } from '../assistant/HybridAssistantService.js';
import { SecurityFirewall } from '../security/SecurityFirewall.js';
import { EventBus } from '../core/EventBus.js';
import { AnalyticsService } from '../analytics/AnalyticsService.js';
import TransformersIntegration from './TransformersIntegration.js';

export interface AssistantCapability {
  name: string;
  enabled: boolean;
  priority: number;
  description: string;
}

export interface UnifiedAssistantConfig {
  enableTransformers: boolean;
  enableHybridNLU: boolean;
  enableSecurity: boolean;
  enableAnalytics: boolean;
  intelligence: {
    sentimentAnalysis: boolean;
    intentDetection: boolean;
    entityExtraction: boolean;
    questionAnswering: boolean;
    textSummarization: boolean;
    semanticSimilarity: boolean;
    contextAwareness: boolean;
  };
  firewall: {
    enableComponentIsolation: boolean;
    enableDataEncryption: boolean;
    enableAccessControl: boolean;
    enableAuditLogging: boolean;
  };
}

export interface AssistantResponse {
  id: string;
  sessionId: string;
  message: string;
  intent?: string;
  sentiment?: string;
  entities?: Record<string, any>;
  confidence: number;
  processingTime: number;
  capabilities: string[];
  timestamp: Date;
  metadata: Record<string, any>;
}

export class ComponentFirewall {
  private accessControl: Map<string, Set<string>> = new Map();
  private dataEncryption: Map<string, boolean> = new Map();
  private auditLog: Array<{
    timestamp: Date;
    component: string;
    action: string;
    status: 'allowed' | 'denied';
    reason?: string;
  }> = [];

  constructor(private enableEncryption: boolean = true) {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // Define which components can access which resources
    this.accessControl.set('transformers', new Set(['nlp-models', 'feature-extraction', 'sentiment-analysis']));
    this.accessControl.set('hybrid-nlu', new Set(['nlp-models', 'intent-routing', 'training-data']));
    this.accessControl.set('security', new Set(['audit-logs', 'user-data', 'access-control']));
    this.accessControl.set('analytics', new Set(['metrics', 'events', 'performance-data']));
    this.accessControl.set('assistant', new Set(['nlp-models', 'intent-routing', 'response-generation']));
  }

  /**
   * Check if a component can access a resource
   */
  canAccess(component: string, resource: string): boolean {
    const allowedResources = this.accessControl.get(component);
    const allowed = allowedResources?.has(resource) ?? false;

    this.auditLog.push({
      timestamp: new Date(),
      component,
      action: `access_${resource}`,
      status: allowed ? 'allowed' : 'denied',
      reason: allowed ? undefined : `Component ${component} not authorized for ${resource}`
    });

    return allowed;
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: any, component: string): any {
    if (!this.enableEncryption) return data;

    // In production, use proper encryption (e.g., crypto-js, TweetNaCl.js)
    // This is a simplified example
    const encrypted = {
      __encrypted: true,
      component,
      timestamp: new Date().toISOString(),
      data: Buffer.from(JSON.stringify(data)).toString('base64')
    };

    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encrypted: any, component: string): any {
    if (!encrypted.__encrypted) return encrypted;

    if (!this.canAccess(component, 'encrypted-data')) {
      throw new Error(`Component ${component} not authorized to decrypt data`);
    }

    return JSON.parse(Buffer.from(encrypted.data, 'base64').toString());
  }

  /**
   * Get audit log
   */
  getAuditLog(component?: string, limit: number = 100): any[] {
    let log = this.auditLog;
    if (component) {
      log = log.filter(entry => entry.component === component);
    }
    return log.slice(-limit);
  }

  /**
   * Register a new component with access policies
   */
  registerComponent(component: string, allowedResources: string[]): void {
    this.accessControl.set(component, new Set(allowedResources));
  }

  /**
   * Revoke component access
   */
  revokeComponentAccess(component: string, resource: string): void {
    const resources = this.accessControl.get(component);
    if (resources) {
      resources.delete(resource);
    }
  }
}

export class UnifiedAssistantSystem {
  private hybridAssistant: HybridAssistantService;
  private transformers: TransformersIntegration;
  private firewall: ComponentFirewall;
  private securityFirewall: SecurityFirewall;
  private eventBus: EventBus;
  private analytics: AnalyticsService;
  private config: UnifiedAssistantConfig;
  private capabilities: Map<string, AssistantCapability> = new Map();

  constructor(config?: Partial<UnifiedAssistantConfig>) {
    this.config = {
      enableTransformers: true,
      enableHybridNLU: true,
      enableSecurity: true,
      enableAnalytics: true,
      intelligence: {
        sentimentAnalysis: true,
        intentDetection: true,
        entityExtraction: true,
        questionAnswering: true,
        textSummarization: true,
        semanticSimilarity: true,
        contextAwareness: true
      },
      firewall: {
        enableComponentIsolation: true,
        enableDataEncryption: true,
        enableAccessControl: true,
        enableAuditLogging: true
      },
      ...config
    };

    // Initialize components with firewall isolation
    this.firewall = new ComponentFirewall(this.config.firewall.enableDataEncryption);
    this.securityFirewall = new SecurityFirewall();
    this.eventBus = new EventBus();
    this.analytics = new AnalyticsService();
    this.hybridAssistant = new HybridAssistantService();
    this.transformers = new TransformersIntegration();

    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    const capabilities: AssistantCapability[] = [
      {
        name: 'sentiment-analysis',
        enabled: this.config.intelligence.sentimentAnalysis,
        priority: 8,
        description: 'Analyze emotional tone and sentiment of user messages'
      },
      {
        name: 'intent-detection',
        enabled: this.config.intelligence.intentDetection,
        priority: 10,
        description: 'Detect user intent from natural language queries'
      },
      {
        name: 'entity-extraction',
        enabled: this.config.intelligence.entityExtraction,
        priority: 9,
        description: 'Extract named entities and key information from text'
      },
      {
        name: 'question-answering',
        enabled: this.config.intelligence.questionAnswering,
        priority: 9,
        description: 'Answer questions based on provided context'
      },
      {
        name: 'text-summarization',
        enabled: this.config.intelligence.textSummarization,
        priority: 7,
        description: 'Summarize long text into concise summaries'
      },
      {
        name: 'semantic-similarity',
        enabled: this.config.intelligence.semanticSimilarity,
        priority: 8,
        description: 'Calculate semantic similarity between texts'
      },
      {
        name: 'context-awareness',
        enabled: this.config.intelligence.contextAwareness,
        priority: 10,
        description: 'Maintain and utilize conversation context'
      },
      {
        name: 'hybrid-nlu',
        enabled: this.config.enableHybridNLU,
        priority: 10,
        description: 'Hybrid NLU with Snips and Enhanced processing'
      },
      {
        name: 'security-filtering',
        enabled: this.config.enableSecurity,
        priority: 10,
        description: 'Security firewall for input/output filtering'
      },
      {
        name: 'analytics-tracking',
        enabled: this.config.enableAnalytics,
        priority: 8,
        description: 'Real-time analytics and performance tracking'
      }
    ];

    capabilities.forEach(cap => this.capabilities.set(cap.name, cap));
  }

  /**
   * Process user message with full unified system
   */
  async processMessage(message: string, sessionId: string, userId?: string): Promise<AssistantResponse> {
    const startTime = Date.now();
    const responseId = `response_${Date.now()}`;

    try {
      // 1. Security filtering
      if (this.config.enableSecurity && this.config.firewall.enableAccessControl) {
        if (!this.firewall.canAccess('assistant', 'user-input')) {
          throw new Error('Security firewall: Access denied to process user input');
        }
      }

      // 2. Input validation and sanitization
      const sanitizedInput = await this.securityFirewall.validateInput(message);

      // 3. Intent detection with Transformers
      let intent = 'general';
      if (this.config.intelligence.intentDetection && this.config.enableTransformers) {
        try {
          const intentResult = await this.transformers.detectIntent(sanitizedInput);
          intent = (intentResult.result as any).intent;
        } catch (error) {
          console.warn('Intent detection failed, using default:', error);
        }
      }

      // 4. Sentiment analysis
      let sentiment = 'neutral';
      if (this.config.intelligence.sentimentAnalysis && this.config.enableTransformers) {
        try {
          const sentimentResult = await this.transformers.analyzeSentiment(sanitizedInput);
          sentiment = (sentimentResult.result as any).label;
        } catch (error) {
          console.warn('Sentiment analysis failed:', error);
        }
      }

      // 5. Entity extraction
      let entities: Record<string, any> = {};
      if (this.config.intelligence.entityExtraction && this.config.enableTransformers) {
        try {
          const entityResult = await this.transformers.extractEntities(sanitizedInput);
          entities = entityResult.result as Record<string, any>;
        } catch (error) {
          console.warn('Entity extraction failed:', error);
        }
      }

      // 6. Hybrid NLU processing
      const nluResult = await this.hybridAssistant.processMessage(sanitizedInput, sessionId);

      // 7. Generate response
      const responseText = nluResult.response;

      // 8. Calculate confidence
      const confidence = Math.min(
        (nluResult.confidence || 0.7) * 0.5 +
        (sentiment !== 'neutral' ? 0.8 : 0.6) * 0.3 +
        (Object.keys(entities).length > 0 ? 0.9 : 0.7) * 0.2,
        1.0
      );

      // 9. Get active capabilities
      const activeCaps = Array.from(this.capabilities.values())
        .filter(cap => cap.enabled)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .map(cap => cap.name);

      // 10. Create response
      const response: AssistantResponse = {
        id: responseId,
        sessionId,
        message: responseText,
        intent,
        sentiment,
        entities: Object.keys(entities).length > 0 ? entities : undefined,
        confidence,
        processingTime: Date.now() - startTime,
        capabilities: activeCaps,
        timestamp: new Date(),
        metadata: {
          nluSource: nluResult.nluSource,
          securityStatus: 'passed',
          componentIsolation: this.config.firewall.enableComponentIsolation,
          encryptionEnabled: this.config.firewall.enableDataEncryption
        }
      };

      // 11. Analytics tracking
      if (this.config.enableAnalytics) {
        this.analytics.trackEvent('message_processed', {
          sessionId,
          userId,
          intent,
          sentiment,
          confidence,
          processingTime: response.processingTime,
          capabilities: activeCaps.length
        });
      }

      // 12. Emit event
      this.eventBus.emit('message_processed', response);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log error
      if (this.config.enableAnalytics) {
        this.analytics.trackEvent('message_processing_error', {
          sessionId,
          userId,
          error: errorMessage,
          processingTime: Date.now() - startTime
        });
      }

      throw new Error(`Message processing failed: ${errorMessage}`);
    }
  }

  /**
   * Get system intelligence report
   */
  getIntelligenceReport(): {
    capabilities: AssistantCapability[];
    enabledCount: number;
    totalCount: number;
    intelligenceScore: number;
    firewallStatus: string;
  } {
    const allCapabilities = Array.from(this.capabilities.values());
    const enabledCount = allCapabilities.filter(cap => cap.enabled).length;
    const totalCount = allCapabilities.length;
    
    // Calculate intelligence score (0-100)
    const intelligenceScore = Math.round(
      (enabledCount / totalCount) * 100 * 
      (this.config.enableTransformers ? 1.2 : 0.8)
    );

    return {
      capabilities: allCapabilities.sort((a, b) => b.priority - a.priority),
      enabledCount,
      totalCount,
      intelligenceScore: Math.min(intelligenceScore, 100),
      firewallStatus: this.config.firewall.enableComponentIsolation ? 'ACTIVE' : 'INACTIVE'
    };
  }

  /**
   * Get firewall audit log
   */
  getFirewallAuditLog(component?: string, limit?: number): any[] {
    return this.firewall.getAuditLog(component, limit);
  }

  /**
   * Get system configuration
   */
  getConfig(): UnifiedAssistantConfig {
    return { ...this.config };
  }

  /**
   * Update system configuration
   */
  updateConfig(newConfig: Partial<UnifiedAssistantConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeCapabilities();
  }

  /**
   * Check component isolation status
   */
  checkComponentIsolation(): {
    firewallActive: boolean;
    encryptionEnabled: boolean;
    accessControlEnabled: boolean;
    auditLoggingEnabled: boolean;
    isolatedComponents: string[];
  } {
    return {
      firewallActive: this.config.firewall.enableComponentIsolation,
      encryptionEnabled: this.config.firewall.enableDataEncryption,
      accessControlEnabled: this.config.firewall.enableAccessControl,
      auditLoggingEnabled: this.config.firewall.enableAuditLogging,
      isolatedComponents: Array.from(this.capabilities.keys())
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.transformers.clearCache();
    this.eventBus.removeAllListeners();
    this.analytics.flush();
  }
}

export default UnifiedAssistantSystem;

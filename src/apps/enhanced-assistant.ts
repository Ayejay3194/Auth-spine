import { SmartEngine, SmartSuggestion, AssistantContext } from '../core/types.js';
import { Logger } from '../utils/logger.js';
import { nanoid } from 'nanoid';
import { LLMService } from '../llm/service.js';
import { 
  createEnhancedPredictiveSchedulingEngine,
  createEnhancedClientBehaviorEngine,
  createDynamicPricingEngine,
  createSegmentationEngine,
  FallbackPredictiveSchedulingEngine,
  FallbackClientBehaviorEngine
} from './engines/enhanced-index.js';

export type EnhancedSmartAssistantConfig = {
  enabled: boolean;
  engines: string[];
  interval?: number; // milliseconds between runs
  maxSuggestions?: number;
  useLLM?: boolean;
  teacherMode?: boolean;
};

export class EnhancedSmartAssistant {
  private engines: Map<string, SmartEngine> = new Map();
  private logger: Logger;
  private config: EnhancedSmartAssistantConfig;
  private llmService?: LLMService;

  constructor(config: EnhancedSmartAssistantConfig, llmService?: LLMService) {
    this.config = config;
    this.llmService = llmService;
    this.logger = new Logger({ level: 'info', format: 'simple' });
  }

  async initialize(engineConfigs: Map<string, SmartEngine>): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('Enhanced Smart Assistant is disabled');
      return;
    }

    // Register enhanced engines if LLM is available, otherwise use fallbacks
    if (this.config.useLLM && this.llmService && await this.llmService.isAvailable()) {
      this.logger.info('Initializing enhanced LLM-powered engines');
      
      this.engines.set('predictive_scheduling', createEnhancedPredictiveSchedulingEngine(this.llmService));
      this.engines.set('client_behavior', createEnhancedClientBehaviorEngine(this.llmService));
      this.engines.set('dynamic_pricing', createDynamicPricingEngine(this.llmService));
      this.engines.set('segmentation', createSegmentationEngine(this.llmService));
    } else {
      this.logger.info('Using fallback engines (LLM not available)');
      this.engines.set('predictive_scheduling', FallbackPredictiveSchedulingEngine);
      this.engines.set('client_behavior', FallbackClientBehaviorEngine);
    }

    // Register any additional custom engines
    for (const [name, engine] of engineConfigs) {
      if (this.config.engines.includes(name)) {
        this.engines.set(name, engine);
        this.logger.info(`Custom smart engine loaded: ${name} v${engine.version}`);
      }
    }

    this.logger.info(`Enhanced Smart Assistant initialized with ${this.engines.size} engines`);
  }

  async getSuggestions(ctx: AssistantContext): Promise<SmartSuggestion[]> {
    if (!this.config.enabled || this.engines.size === 0) {
      return [];
    }

    const allSuggestions: SmartSuggestion[] = [];

    try {
      // Run all enabled engines
      for (const [name, engine] of this.engines) {
        if (this.config.engines.includes(name)) {
          try {
            const suggestions = await engine.run(ctx);
            allSuggestions.push(...suggestions);
          } catch (error) {
            this.logger.error(`Engine ${name} failed`, error);
          }
        }
      }

      // If LLM is available, get additional smart suggestions
      if (this.config.useLLM && this.llmService && await this.llmService.isAvailable()) {
        try {
          const llmSuggestions = await this.llmService.generateSmartSuggestions(ctx);
          allSuggestions.push(...llmSuggestions);
        } catch (error) {
          this.logger.error('LLM smart suggestions failed', error);
        }
      }

      // Sort by severity and limit results
      const sorted = allSuggestions.sort((a, b) => {
        const severityOrder = { critical: 3, warn: 2, info: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      const maxSuggestions = this.config.maxSuggestions || 10;
      return sorted.slice(0, maxSuggestions);

    } catch (error) {
      this.logger.error('Failed to get smart suggestions', error);
      return [];
    }
  }

  async runEngine(name: string, ctx: AssistantContext): Promise<SmartSuggestion[]> {
    const engine = this.engines.get(name);
    if (!engine) {
      throw new Error(`Engine not found: ${name}`);
    }

    return await engine.run(ctx);
  }

  async explainSuggestion(suggestion: SmartSuggestion, ctx: AssistantContext): Promise<any> {
    if (!this.llmService || !await this.llmService.isAvailable()) {
      return {
        suggestion,
        reasoning: 'LLM service not available - using basic explanation',
        confidence: 0.5
      };
    }

    try {
      return await this.llmService.explainOperation('suggestion_generation', {
        suggestion,
        context: ctx
      }, suggestion);
    } catch (error) {
      return {
        suggestion,
        reasoning: `Failed to generate explanation: ${error}`,
        confidence: 0
      };
    }
  }

  registerEngine(engine: SmartEngine): void {
    this.engines.set(engine.name, engine);
    this.logger.info(`Smart engine registered: ${engine.name}`);
  }

  unregisterEngine(name: string): void {
    if (this.engines.delete(name)) {
      this.logger.info(`Smart engine unregistered: ${name}`);
    }
  }

  async switchToLLM(llmService: LLMService): Promise<void> {
    this.llmService = llmService;
    this.config.useLLM = true;
    
    // Reinitialize engines with LLM capabilities
    await this.initialize(new Map());
    
    this.logger.info('Switched to LLM-powered engines');
  }

  async switchToFallback(): Promise<void> {
    this.config.useLLM = false;
    
    // Reinitialize with fallback engines
    await this.initialize(new Map());
    
    this.logger.info('Switched to fallback engines');
  }

  enableTeacherMode(): void {
    this.config.teacherMode = true;
    this.logger.info('Teacher mode enabled');
  }

  disableTeacherMode(): void {
    this.config.teacherMode = false;
    this.logger.info('Teacher mode disabled');
  }

  getEngines(): Array<{ name: string; version: string }> {
    return Array.from(this.engines.values()).map(e => ({
      name: e.name,
      version: e.version
    }));
  }

  isEngineRunning(name: string): boolean {
    return this.engines.has(name);
  }

  isLLMEnabled(): boolean {
    return this.config.useLLM || false;
  }

  isTeacherModeEnabled(): boolean {
    return this.config.teacherMode || false;
  }

  async getCapabilities(): Promise<{
    engines: Array<{ name: string; version: string; type: 'llm' | 'fallback' | 'custom' }>;
    llmAvailable: boolean;
    teacherMode: boolean;
  }> {
    const engines = Array.from(this.engines.values()).map(engine => ({
      name: engine.name,
      version: engine.version,
      type: this.config.useLLM && this.llmService ? 'llm' as const : 
            ['predictive_scheduling', 'client_behavior'].includes(engine.name) ? 'fallback' as const : 
            'custom' as const
    }));

    return {
      engines,
      llmAvailable: this.config.useLLM && this.llmService ? await this.llmService.isAvailable() : false,
      teacherMode: this.config.teacherMode || false
    };
  }
}

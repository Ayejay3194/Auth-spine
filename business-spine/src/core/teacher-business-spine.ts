import { BusinessSpineConfig, ModuleConfig, AssistantContext, Spine, ToolRegistry, Plugin } from "./types.js";
import { Logger } from "../utils/logger.js";
import { TeacherOrchestrator } from "./teacher-orchestrator.js";
import { SmartAssistant } from "../smart/assistant.js";
import { TeacherService } from "../teacher/service.js";
import { ToolRegistry as DefaultToolRegistry } from "./tools/index.js";
import { Orchestrator } from "./orchestrator.js";

export class TeacherBusinessSpine {
  private config: BusinessSpineConfig;
  private logger: Logger;
  private orchestrator: Orchestrator; // Original orchestrator for core operations
  private teacherOrchestrator: TeacherOrchestrator; // Teacher wrapper
  private smartAssistant: SmartAssistant; // Original smart assistant
  private teacherService?: TeacherService;
  private tools: ToolRegistry;
  private spines: Spine[];
  private plugins: Plugin[];
  private teacherEnabled: boolean = false;

  constructor(config: BusinessSpineConfig) {
    this.config = config;
    this.logger = new Logger({ 
      level: config.logging.level, 
      format: config.logging.format 
    });
    
    this.tools = DefaultToolRegistry;
    this.spines = [];
    this.plugins = [];

    // Initialize original components (preserves existing behavior)
    this.orchestrator = new Orchestrator({
      spines: this.spines,
      tools: this.tools
    });

    // Initialize teacher service (only for explanations)
    this.teacherService = new TeacherService();
    this.teacherEnabled = config.assistant.teacherMode || false;

    // Initialize teacher orchestrator (wraps original for teaching)
    this.teacherOrchestrator = new TeacherOrchestrator({
      spines: this.spines,
      tools: this.tools,
      teacherService: this.teacherService
    });

    // Keep original smart assistant (no LLM integration)
    this.smartAssistant = new SmartAssistant({
      enabled: config.assistant.enabled,
      engines: config.assistant.engines
    });

    this.logger.info('Teacher Business Spine initialized - core operations preserved');
  }

  async initialize(): Promise<void> {
    try {
      // Initialize spines (same as original)
      await this.loadSpines();

      // Initialize smart assistant (original behavior)
      await this.smartAssistant.initialize(new Map());

      // Reinitialize orchestrators with loaded spines
      this.orchestrator = new Orchestrator({
        spines: this.spines,
        tools: this.tools
      });

      this.teacherOrchestrator = new TeacherOrchestrator({
        spines: this.spines,
        tools: this.tools,
        teacherService: this.teacherService
      });

      this.logger.info('Teacher Business Spine initialization complete');
    } catch (error) {
      this.logger.error('Failed to initialize Teacher Business Spine', error);
      throw error;
    }
  }

  private async loadSpines(): Promise<void> {
    // Load spines based on enabled modules (same as original)
    const enabledModules = this.config.modules.filter(m => m.enabled);
    
    for (const module of enabledModules) {
      try {
        const spine = await this.loadSpine(module.name);
        if (spine) {
          this.spines.push(spine);
          this.logger.info(`Loaded spine: ${spine.name} v${spine.version}`);
        }
      } catch (error) {
        this.logger.error(`Failed to load spine for module: ${module.name}`, error);
      }
    }
  }

  private async loadSpine(moduleName: string): Promise<Spine | null> {
    try {
      switch (moduleName) {
        case 'booking':
          const { spine: bookingSpine } = await import('../spines/booking/spine.js');
          return bookingSpine;
        case 'crm':
          const { spine: crmSpine } = await import('../spines/crm/spine.js');
          return crmSpine;
        case 'payments':
          const { spine: paymentsSpine } = await import('../spines/payments/spine.js');
          return paymentsSpine;
        case 'marketing':
          const { spine: marketingSpine } = await import('../spines/marketing/spine.js');
          return marketingSpine;
        case 'analytics':
          const { spine: analyticsSpine } = await import('../spines/analytics/spine.js');
          return analyticsSpine;
        case 'admin_security':
          const { spine: adminSpine } = await import('../spines/admin_security/spine.js');
          return adminSpine;
        default:
          this.logger.warn(`Unknown module: ${moduleName}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to load spine for module: ${moduleName}`, error);
      return null;
    }
  }

  // Core operations - use original system only
  async processRequest(message: string, context: AssistantContext, options?: { explain?: boolean }): Promise<any> {
    if (options?.explain && this.teacherEnabled) {
      // Use teacher orchestrator for explanations
      return await this.teacherOrchestrator.handle(message, context, options);
    } else {
      // Use original orchestrator for all core operations
      return await this.orchestrator.handle(message, context, options);
    }
  }

  async detectIntents(text: string, context: AssistantContext): Promise<any[]> {
    // Always use original orchestrator for intent detection
    return this.orchestrator.detect(text, context);
  }

  async getSmartSuggestions(context: AssistantContext): Promise<any[]> {
    // Always use original smart assistant
    return await this.smartAssistant.getSuggestions(context);
  }

  // Teacher-only methods - these don't affect core operations
  async explainOperation(text: string, context: AssistantContext): Promise<any> {
    if (!this.teacherEnabled || !this.teacherService) {
      return {
        operation: "teacher_disabled",
        reasoning: "Teacher mode is not enabled. Enable it in configuration to get explanations.",
        confidence: 0,
        alternatives: [
          "Enable teacher mode in configuration",
          "Use the system without explanations",
          "Check documentation for operation details"
        ],
        nextSteps: [
          "Set ASSISTANT_TEACHER_MODE=true in environment",
          "Restart the service",
          "Try the explanation endpoint again"
        ]
      };
    }

    return await this.teacherOrchestrator.explainOperation(text, context);
  }

  async explainIntent(text: string, context: AssistantContext): Promise<any> {
    if (!this.teacherEnabled || !this.teacherService) {
      return {
        type: 'explain_intent',
        title: 'Intent Recognition',
        explanation: 'The system uses rule-based pattern matching to recognize user intents.',
        reasoning: 'Teacher mode is disabled - enable it for detailed explanations.',
        confidence: 0.5,
        userLevel: 'intermediate'
      };
    }

    return await this.teacherOrchestrator.explainIntent(text, context);
  }

  async explainSuggestion(suggestion: any, context: AssistantContext): Promise<any> {
    if (!this.teacherEnabled || !this.teacherService) {
      return {
        type: 'explain_suggestion',
        title: 'Suggestion Details',
        explanation: 'Business suggestions are generated using rule-based analysis.',
        reasoning: 'Enable teacher mode for detailed explanations of suggestions.',
        confidence: 0.5,
        userLevel: 'intermediate'
      };
    }

    return await this.teacherOrchestrator.explainSuggestion(suggestion, context);
  }

  async teachConcept(concept: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    if (!this.teacherEnabled || !this.teacherService) {
      return {
        type: 'teach_concept',
        title: `Concept: ${concept}`,
        explanation: `${concept} is a business automation concept. Enable teacher mode for detailed learning.`,
        reasoning: 'Teacher mode provides educational content about system concepts.',
        confidence: 0.5,
        userLevel,
        examples: [`Example of ${concept} in business context`],
        alternatives: ['Read documentation', 'Contact support', 'Explore system features'],
        nextSteps: ['Enable teacher mode', 'Check help resources', 'Try practical examples']
      };
    }

    return await this.teacherOrchestrator.teachConcept(concept, userLevel);
  }

  // Teacher configuration methods
  async configureTeacher(llmConfig: any): Promise<boolean> {
    try {
      if (!this.teacherService) {
        this.teacherService = new TeacherService();
      }

      // Create LLM service for teacher only
      const { LLMService } = await import('../llm/service.js');
      const llmService = new LLMService(llmConfig, true);
      
      await this.teacherService.setLLMService(llmService);
      
      // Update teacher orchestrator
      this.teacherOrchestrator = new TeacherOrchestrator({
        spines: this.spines,
        tools: this.tools,
        teacherService: this.teacherService
      });

      const available = await llmService.isAvailable();
      if (available) {
        this.logger.info(`Teacher configured with ${llmConfig.provider} LLM`);
        return true;
      } else {
        this.logger.warn('Teacher LLM not available, will use fallback explanations');
        return false;
      }
    } catch (error) {
      this.logger.error('Failed to configure teacher', error);
      return false;
    }
  }

  setTeacherMode(enabled: boolean): void {
    this.teacherEnabled = enabled;
    this.logger.info(`Teacher mode ${enabled ? 'enabled' : 'disabled'} - core operations unchanged`);
  }

  // Getters for API server
  getTeacherService(): TeacherService | undefined {
    return this.teacherService;
  }

  isTeacherEnabled(): boolean {
    return this.teacherEnabled;
  }

  isTeacherAvailable(): boolean {
    return this.teacherEnabled && !!this.teacherService;
  }

  // Preserve all original getters
  getConfig(): BusinessSpineConfig {
    return this.config;
  }

  getSpines(): Spine[] {
    return this.spines;
  }

  getEngines(): any[] {
    return this.smartAssistant.getEngines();
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }

  // Original methods preserved
  async installPlugin(plugin: Plugin): Promise<void> {
    try {
      await plugin.install(this);
      this.plugins.push(plugin);
      this.logger.info(`Plugin installed: ${plugin.name} v${plugin.version}`);
    } catch (error) {
      this.logger.error(`Failed to install plugin: ${plugin.name}`, error);
      throw error;
    }
  }

  async uninstallPlugin(pluginName: string): Promise<void> {
    const pluginIndex = this.plugins.findIndex(p => p.name === pluginName);
    if (pluginIndex === -1) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    const plugin = this.plugins[pluginIndex];
    try {
      if (plugin.uninstall) {
        await plugin.uninstall(this);
      }
      this.plugins.splice(pluginIndex, 1);
      this.logger.info(`Plugin uninstalled: ${plugin.name}`);
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin: ${plugin.name}`, error);
      throw error;
    }
  }

  registerTool(name: string, tool: (args: { ctx: AssistantContext; input: Record<string, unknown> }) => Promise<any>): void {
    this.tools[name] = tool;
    this.logger.info(`Tool registered: ${name}`);
  }

  unregisterTool(name: string): void {
    delete this.tools[name];
    this.logger.info(`Tool unregistered: ${name}`);
  }

  async getCapabilities(): Promise<{
    spines: Array<{ name: string; version: string; description: string }>;
    engines: Array<{ name: string; version: string }>;
    teacher: { enabled: boolean; available: boolean; configured: boolean };
    plugins: Array<{ name: string; version: string; description: string }>;
  }> {
    return {
      spines: this.spines.map(s => ({
        name: s.name,
        version: s.version,
        description: s.description
      })),
      engines: this.smartAssistant.getEngines(),
      teacher: {
        enabled: this.teacherEnabled,
        available: this.teacherEnabled && !!this.teacherService,
        configured: !!this.teacherService
      },
      plugins: this.plugins.map(p => ({
        name: p.name,
        version: p.version,
        description: p.description
      }))
    };
  }
}

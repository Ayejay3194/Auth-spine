import { BusinessSpineConfig, ModuleConfig, AssistantContext, Spine, ToolRegistry, Plugin } from "./types.js";
import { Logger } from "../utils/logger.js";
import { EnhancedOrchestrator } from "./enhanced-orchestrator.js";
import { EnhancedSmartAssistant } from "../smart/enhanced-assistant.js";
import { LLMService } from "../llm/service.js";
import { TeacherService } from "../teacher/service.js";
import { ToolRegistry as DefaultToolRegistry } from "./tools/index.js";

export class EnhancedBusinessSpine {
  private config: BusinessSpineConfig;
  private logger: Logger;
  private orchestrator: EnhancedOrchestrator;
  private smartAssistant: EnhancedSmartAssistant;
  private llmService?: LLMService;
  private teacherService?: TeacherService;
  private tools: ToolRegistry;
  private spines: Spine[];
  private plugins: Plugin[];
  private llmEnabled: boolean = false;
  private teacherMode: boolean = false;

  constructor(config: BusinessSpineConfig) {
    this.config = config;
    this.logger = new Logger({ 
      level: config.logging.level, 
      format: config.logging.format 
    });
    
    this.tools = DefaultToolRegistry;
    this.spines = [];
    this.plugins = [];

    // Initialize LLM service if configured
    if (config.llm) {
      this.llmService = new LLMService(config.llm, config.llm.fallbackEnabled);
      this.llmEnabled = config.assistant.useLLM || false;
    }

    // Initialize teacher service
    this.teacherService = new TeacherService(this.llmService);
    this.teacherMode = config.assistant.teacherMode || false;

    // Initialize orchestrator with LLM support
    this.orchestrator = new EnhancedOrchestrator({
      spines: this.spines,
      tools: this.tools,
      llmService: this.llmService,
      useLLM: this.llmEnabled,
      teacherMode: this.teacherMode
    });

    // Initialize smart assistant
    this.smartAssistant = new EnhancedSmartAssistant({
      enabled: config.assistant.enabled,
      engines: config.assistant.engines,
      useLLM: this.llmEnabled,
      teacherMode: this.teacherMode
    }, this.llmService);

    this.logger.info('Enhanced Business Spine initialized');
  }

  async initialize(): Promise<void> {
    try {
      // Initialize spines
      await this.loadSpines();

      // Initialize smart assistant
      await this.smartAssistant.initialize(new Map());

      // Test LLM connection if configured
      if (this.llmService && this.llmEnabled) {
        const available = await this.llmService.isAvailable();
        if (available) {
          this.logger.info('LLM service is available and ready');
        } else {
          this.logger.warn('LLM service is not available, using fallback mode');
          this.llmEnabled = false;
        }
      }

      this.logger.info('Enhanced Business Spine initialization complete');
    } catch (error) {
      this.logger.error('Failed to initialize Enhanced Business Spine', error);
      throw error;
    }
  }

  private async loadSpines(): Promise<void> {
    // Load spines based on enabled modules
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

    // Update orchestrator with loaded spines
    this.orchestrator = new EnhancedOrchestrator({
      spines: this.spines,
      tools: this.tools,
      llmService: this.llmService,
      useLLM: this.llmEnabled,
      teacherMode: this.teacherMode
    });
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

  async processRequest(message: string, context: AssistantContext, options?: { explain?: boolean }): Promise<any> {
    return await this.orchestrator.handle(message, context, { 
      explain: options?.explain 
    });
  }

  async detectIntents(text: string, context: AssistantContext): Promise<any[]> {
    return await this.orchestrator.detect(text, context);
  }

  async getSmartSuggestions(context: AssistantContext): Promise<any[]> {
    return await this.smartAssistant.getSuggestions(context);
  }

  async configureLLM(llmConfig: any): Promise<boolean> {
    try {
      if (!this.llmService) {
        this.llmService = new LLMService(llmConfig, llmConfig.fallbackEnabled);
      } else {
        await this.llmService.switchProvider(llmConfig);
      }

      // Update orchestrator and assistant
      this.orchestrator = new EnhancedOrchestrator({
        spines: this.spines,
        tools: this.tools,
        llmService: this.llmService,
        useLLM: true,
        teacherMode: this.teacherMode
      });

      await this.smartAssistant.switchToLLM(this.llmService);

      const available = await this.llmService.isAvailable();
      if (available) {
        this.llmEnabled = true;
        this.logger.info(`LLM configured with ${llmConfig.provider} provider`);
        return true;
      } else {
        this.logger.warn('LLM configuration failed, service not available');
        return false;
      }
    } catch (error) {
      this.logger.error('Failed to configure LLM', error);
      return false;
    }
  }

  async switchProcessingMode(mode: 'llm' | 'patterns' | 'auto'): Promise<void> {
    switch (mode) {
      case 'llm':
        if (this.llmService) {
          this.llmEnabled = true;
          await this.orchestrator.switchToLLM(this.llmService);
          await this.smartAssistant.switchToLLM(this.llmService);
        } else {
          throw new Error('LLM service not configured');
        }
        break;
      case 'patterns':
        this.llmEnabled = false;
        await this.orchestrator.switchToPatterns();
        await this.smartAssistant.switchToFallback();
        break;
      case 'auto':
        if (this.llmService && await this.llmService.isAvailable()) {
          this.llmEnabled = true;
          await this.orchestrator.switchToLLM(this.llmService);
          await this.smartAssistant.switchToLLM(this.llmService);
        } else {
          this.llmEnabled = false;
          await this.orchestrator.switchToPatterns();
          await this.smartAssistant.switchToFallback();
        }
        break;
    }
    
    this.logger.info(`Switched to ${mode} processing mode`);
  }

  setTeacherMode(enabled: boolean): void {
    this.teacherMode = enabled;
    this.orchestrator.enableTeacherMode();
    this.smartAssistant.enableTeacherMode();
    this.logger.info(`Teacher mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  setLLMEnabled(enabled: boolean): void {
    this.llmEnabled = enabled;
    this.orchestrator = new EnhancedOrchestrator({
      spines: this.spines,
      tools: this.tools,
      llmService: this.llmService,
      useLLM: enabled,
      teacherMode: this.teacherMode
    });
  }

  // Getters for API server
  getLLMService(): LLMService | undefined {
    return this.llmService;
  }

  getTeacherService(): TeacherService | undefined {
    return this.teacherService;
  }

  isLLMEnabled(): boolean {
    return this.llmEnabled;
  }

  isTeacherModeEnabled(): boolean {
    return this.teacherMode;
  }

  isFallbackEnabled(): boolean {
    return this.config.llm?.fallbackEnabled || false;
  }

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
    engines: Array<{ name: string; version: string; type: string }>;
    llm: { configured: boolean; available: boolean; provider?: string };
    teacher: { enabled: boolean };
    plugins: Array<{ name: string; version: string; description: string }>;
  }> {
    const llmAvailable = this.llmService ? await this.llmService.isAvailable() : false;
    
    const capabilities = await this.smartAssistant.getCapabilities();
    return {
      spines: this.spines.map(s => ({
        name: s.name,
        version: s.version,
        description: s.description
      })),
      engines: capabilities.engines,
      llm: {
        configured: !!this.llmService,
        available: llmAvailable,
        provider: this.config.llm?.provider
      },
      teacher: {
        enabled: this.teacherMode
      },
      plugins: this.plugins.map(p => ({
        name: p.name,
        version: p.version,
        description: p.description
      }))
    };
  }
}

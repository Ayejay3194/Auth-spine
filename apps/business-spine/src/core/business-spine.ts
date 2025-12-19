import { 
  AssistantContext, 
  FlowRunResult, 
  Spine, 
  ToolRegistry, 
  BusinessSpineConfig, 
  Plugin, 
  SmartEngine,
  SmartSuggestion 
} from './types.js';
import { Orchestrator } from './orchestrator.js';
import { SmartAssistant } from '../smart/assistant.js';
import { PluginManager } from './plugin-manager.js';
import { Logger } from '../utils/logger.js';
import { tools as memoryTools } from '../adapters/memory.js';

export class BusinessSpine {
  private config: BusinessSpineConfig;
  private spines: Map<string, Spine> = new Map();
  private tools: ToolRegistry = {};
  private engines: Map<string, SmartEngine> = new Map();
  private plugins: Map<string, Plugin> = new Map();
  private orchestrator: Orchestrator;
  private assistant: SmartAssistant;
  private pluginManager: PluginManager;
  private logger: Logger;

  constructor(config: BusinessSpineConfig) {
    this.config = config;
    this.logger = new Logger(config.logging);
    
    // Initialize with memory tools
    this.tools = { ...memoryTools };
    
    this.orchestrator = new Orchestrator({
      spines: [],
      tools: this.tools
    });
    this.assistant = new SmartAssistant(config.assistant);
    this.pluginManager = new PluginManager(this);
    
    this.logger.info('BusinessSpine initialized', { tenantId: config.tenantId });
  }

  async initialize(): Promise<void> {
    try {
      // Load core modules
      await this.loadCoreModules();
      
      // Load enabled plugins
      await this.loadEnabledPlugins();
      
      // Initialize smart assistant
      if (this.config.assistant.enabled) {
        await this.assistant.initialize(this.engines);
      }
      
      this.logger.info('BusinessSpine fully initialized');
    } catch (error) {
      this.logger.error('Failed to initialize BusinessSpine', error);
      throw error;
    }
  }

  private async loadCoreModules(): Promise<void> {
    const coreModules = ['booking', 'crm', 'payments', 'marketing', 'analytics', 'admin_security'];
    
    for (const moduleName of coreModules) {
      const moduleConfig = this.config.modules.find(m => m.name === moduleName);
      if (moduleConfig?.enabled) {
        try {
          const module = await import(`../spines/${moduleName}/index.js`);
          const spine: Spine = module.createSpine(moduleConfig.settings || {});
          this.registerSpine(spine);
          this.logger.info(`Core module loaded: ${moduleName}`);
        } catch (error) {
          this.logger.error(`Failed to load core module: ${moduleName}`, error);
        }
      }
    }
  }

  private async loadEnabledPlugins(): Promise<void> {
    for (const moduleConfig of this.config.modules) {
      if (moduleConfig.enabled && !this.spines.has(moduleConfig.name)) {
        try {
          // Try to load as plugin
          const pluginPath = `../plugins/${moduleConfig.name}/index.js`;
          const pluginModule = await import(pluginPath);
          const plugin: Plugin = pluginModule.default;
          await this.installPlugin(plugin);
        } catch (error) {
          // Not a plugin, might be a custom module
          this.logger.debug(`Module ${moduleConfig.name} is not a plugin`);
        }
      }
    }
  }

  registerSpine(spine: Spine): void {
    this.spines.set(spine.name, spine);
    this.orchestrator = new Orchestrator({
      spines: Array.from(this.spines.values()),
      tools: this.tools
    });
    this.logger.info(`Spine registered: ${spine.name} v${spine.version}`);
  }

  registerTool(name: string, tool: (args: { ctx: AssistantContext; input: Record<string, unknown> }) => Promise<any>): void {
    this.tools[name] = tool;
    this.logger.info(`Tool registered: ${name}`);
  }

  registerEngine(engine: SmartEngine): void {
    this.engines.set(engine.name, engine);
    this.logger.info(`Smart engine registered: ${engine.name} v${engine.version}`);
  }

  async installPlugin(plugin: Plugin): Promise<void> {
    try {
      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep) && !this.spines.has(dep)) {
            throw new Error(`Plugin dependency not found: ${dep}`);
          }
        }
      }

      await plugin.install(this);
      this.plugins.set(plugin.name, plugin);
      this.logger.info(`Plugin installed: ${plugin.name} v${plugin.version}`);
    } catch (error) {
      this.logger.error(`Failed to install plugin: ${plugin.name}`, error);
      throw error;
    }
  }

  async uninstallPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    try {
      if (plugin.uninstall) {
        await plugin.uninstall(this);
      }
      this.plugins.delete(name);
      this.logger.info(`Plugin uninstalled: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin: ${name}`, error);
      throw error;
    }
  }

  async processRequest(text: string, ctx: AssistantContext): Promise<FlowRunResult> {
    try {
      this.logger.info('Processing request', { text: text.substring(0, 100), userId: ctx.actor.userId });
      
      const result = await this.orchestrator.handle(text, ctx);
      
      this.logger.info('Request processed', { 
        steps: result.steps.length, 
        success: result.final?.ok 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Request processing failed', error);
      return {
        steps: [{ kind: "respond", message: "An error occurred while processing your request." }],
        final: { ok: false, message: "Processing failed" }
      };
    }
  }

  async getSmartSuggestions(ctx: AssistantContext): Promise<SmartSuggestion[]> {
    if (!this.config.assistant.enabled) {
      return [];
    }

    try {
      return await this.assistant.getSuggestions(ctx);
    } catch (error) {
      this.logger.error('Failed to get smart suggestions', error);
      return [];
    }
  }

  detectIntents(text: string, ctx: AssistantContext) {
    return this.orchestrator.detect(text, ctx);
  }

  getConfig(): BusinessSpineConfig {
    return { ...this.config };
  }

  getSpines(): Spine[] {
    return Array.from(this.spines.values());
  }

  getEngines(): SmartEngine[] {
    return Array.from(this.engines.values());
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // Public accessors for testing
  getOrchestrator() {
    return this.orchestrator;
  }

  getTools() {
    return this.tools;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down BusinessSpine');
    
    // Uninstall all plugins
    for (const [name] of this.plugins) {
      try {
        await this.uninstallPlugin(name);
      } catch (error) {
        this.logger.error(`Error uninstalling plugin ${name} during shutdown`, error);
      }
    }
    
    this.logger.info('BusinessSpine shutdown complete');
  }
}

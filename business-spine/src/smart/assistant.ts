import { SmartEngine, SmartSuggestion, AssistantContext } from '../core/types.js';
import { Logger } from '../utils/logger.js';
import { nanoid } from 'nanoid';

export type SmartAssistantConfig = {
  enabled: boolean;
  engines: string[];
  interval?: number; // milliseconds between runs
  maxSuggestions?: number;
};

export class SmartAssistant {
  private engines: Map<string, SmartEngine> = new Map();
  private logger: Logger;
  private config: SmartAssistantConfig;

  constructor(config: SmartAssistantConfig) {
    this.config = config;
    this.logger = new Logger({ level: 'info', format: 'simple' });
  }

  async initialize(engineConfigs: Map<string, SmartEngine>): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('Smart Assistant is disabled');
      return;
    }

    // Register engines
    for (const [name, engine] of engineConfigs) {
      if (this.config.engines.includes(name)) {
        this.engines.set(name, engine);
        this.logger.info(`Smart engine loaded: ${name} v${engine.version}`);
      }
    }

    this.logger.info(`Smart Assistant initialized with ${this.engines.size} engines`);
  }

  async getSuggestions(ctx: AssistantContext): Promise<SmartSuggestion[]> {
    if (!this.config.enabled || this.engines.size === 0) {
      return [];
    }

    const allSuggestions: SmartSuggestion[] = [];

    try {
      // Run all enabled engines
      for (const [name, engine] of this.engines) {
        try {
          const suggestions = await engine.run(ctx);
          allSuggestions.push(...suggestions);
        } catch (error) {
          this.logger.error(`Engine ${name} failed`, error);
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

  registerEngine(engine: SmartEngine): void {
    this.engines.set(engine.name, engine);
    this.logger.info(`Smart engine registered: ${engine.name}`);
  }

  unregisterEngine(name: string): void {
    if (this.engines.delete(name)) {
      this.logger.info(`Smart engine unregistered: ${name}`);
    }
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
}

import { AssistantContext, FlowRunResult, Spine, ToolRegistry, BusinessSpineConfig, Plugin, SmartEngine, SmartSuggestion } from './types.js';
import { Orchestrator } from './orchestrator.js';
export declare class BusinessSpine {
    private config;
    private spines;
    private tools;
    private engines;
    private plugins;
    private orchestrator;
    private assistant;
    private pluginManager;
    private logger;
    constructor(config: BusinessSpineConfig);
    initialize(): Promise<void>;
    private loadCoreModules;
    private loadEnabledPlugins;
    registerSpine(spine: Spine): void;
    registerTool(name: string, tool: (args: {
        ctx: AssistantContext;
        input: Record<string, unknown>;
    }) => Promise<any>): void;
    registerEngine(engine: SmartEngine): void;
    installPlugin(plugin: Plugin): Promise<void>;
    uninstallPlugin(name: string): Promise<void>;
    processRequest(text: string, ctx: AssistantContext): Promise<FlowRunResult>;
    getSmartSuggestions(ctx: AssistantContext): Promise<SmartSuggestion[]>;
    detectIntents(text: string, ctx: AssistantContext): import("./types.js").Intent[];
    getConfig(): BusinessSpineConfig;
    getSpines(): Spine[];
    getEngines(): SmartEngine[];
    getPlugins(): Plugin[];
    getOrchestrator(): Orchestrator;
    getTools(): ToolRegistry;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=business-spine.d.ts.map
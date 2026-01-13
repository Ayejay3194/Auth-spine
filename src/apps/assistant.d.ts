import { SmartEngine, SmartSuggestion, AssistantContext } from '../core/types.js';
export type SmartAssistantConfig = {
    enabled: boolean;
    engines: string[];
    interval?: number;
    maxSuggestions?: number;
};
export declare class SmartAssistant {
    private engines;
    private logger;
    private config;
    constructor(config: SmartAssistantConfig);
    initialize(engineConfigs: Map<string, SmartEngine>): Promise<void>;
    getSuggestions(ctx: AssistantContext): Promise<SmartSuggestion[]>;
    runEngine(name: string, ctx: AssistantContext): Promise<SmartSuggestion[]>;
    registerEngine(engine: SmartEngine): void;
    unregisterEngine(name: string): void;
    getEngines(): Array<{
        name: string;
        version: string;
    }>;
    isEngineRunning(name: string): boolean;
}
//# sourceMappingURL=assistant.d.ts.map
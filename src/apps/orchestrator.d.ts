import { AssistantContext, Intent, FlowRunResult, Spine, ToolRegistry } from "./types.js";
export type OrchestratorOptions = {
    spines: Spine[];
    tools: ToolRegistry;
};
export declare class Orchestrator {
    private opts;
    constructor(opts: OrchestratorOptions);
    detect(text: string, ctx: AssistantContext): Intent[];
    handle: (text: string, ctx: AssistantContext, args?: {
        confirmToken?: string;
    }) => Promise<FlowRunResult>;
}
//# sourceMappingURL=orchestrator.d.ts.map
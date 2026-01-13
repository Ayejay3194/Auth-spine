import { FlowStep, AssistantContext, ToolResult, Policy, AuditEvent, AuditWriter } from "./types.js";
export type FlowContext = {
    ctx: AssistantContext;
    confirmationToken?: string;
};
export type FlowEnvironment = {
    tools: Record<string, (args: {
        ctx: AssistantContext;
        input: Record<string, unknown>;
    }) => Promise<ToolResult>>;
    policy: Policy;
    audit: AuditWriter;
    hashChain?: (evt: AuditEvent) => string;
};
export declare function runFlow(steps: FlowStep[], flowCtx: FlowContext, env: FlowEnvironment): Promise<{
    steps: FlowStep[];
    final?: {
        ok: boolean;
        message: string;
        payload?: unknown;
    };
}>;
//# sourceMappingURL=flow.d.ts.map
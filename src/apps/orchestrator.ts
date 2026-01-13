import { FlowStep, AssistantContext, ToolResult, Policy, AuditEvent, AuditWriter, Intent, FlowRunResult, Spine, ToolRegistry } from "./types.js";
import { runFlow } from "./flow.js";
import { defaultPolicy } from "./policy.js";
import { memoryAuditWriter, memoryHashChain } from "../adapters/memory.js";

export type OrchestratorOptions = {
  spines: Spine[];
  tools: ToolRegistry;
};

export class Orchestrator {
  constructor(private opts: OrchestratorOptions) {}

  detect(text: string, ctx: AssistantContext): Intent[] {
    const intents = this.opts.spines.flatMap(s => s.detectIntent(text, ctx));
    intents.sort((a, b) => b.confidence - a.confidence);
    return intents.slice(0, 5);
  }

  handle = async (text: string, ctx: AssistantContext, args?: { confirmToken?: string }): Promise<FlowRunResult> => {
    const intents = this.detect(text, ctx);
    const top = intents[0];
    
    if (!top) {
      return { 
        steps: [{ 
          kind: "respond", 
          message: "I didn't recognize that command. Try: book, cancel, invoice, refund, report, schedule, client, analytics." 
        }],
        final: { ok: false, message: "Unknown intent" } 
      };
    }
    
    const spine = this.opts.spines.find(s => s.name === top.spine);
    if (!spine) {
      return { 
        steps: [{ 
          kind: "respond", 
          message: `Spine missing: ${top.spine}` 
        }], 
        final: { ok: false, message: "Missing spine" } 
      };
    }
    
    const extraction = spine.extractEntities(top, text, ctx);
    const steps = spine.buildFlow(top, extraction, ctx);

    return runFlow(steps, { ctx, confirmationToken: args?.confirmToken }, {
      tools: this.opts.tools,
      policy: defaultPolicy,
      audit: memoryAuditWriter,
      hashChain: memoryHashChain ? (evt: AuditEvent) => 'hash' : undefined,
    });
  };
}

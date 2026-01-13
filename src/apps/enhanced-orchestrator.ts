import { FlowStep, AssistantContext, ToolResult, Policy, AuditEvent, AuditWriter, Intent, FlowRunResult, Spine, ToolRegistry } from "./types.js";
import { runFlow } from "./flow.js";
import { defaultPolicy } from "./policy.js";
import { memoryAuditWriter, memoryHashChain } from "../adapters/memory.js";
import { LLMService } from "../llm/service.js";
import { detectByPatterns } from "./intent.js";

export type EnhancedOrchestratorOptions = {
  spines: Spine[];
  tools: ToolRegistry;
  llmService?: LLMService;
  useLLM?: boolean;
  teacherMode?: boolean;
};

export class EnhancedOrchestrator {
  private llmService?: LLMService;
  private useLLM: boolean;
  private teacherMode: boolean;

  constructor(private opts: EnhancedOrchestratorOptions) {
    this.llmService = opts.llmService;
    this.useLLM = opts.useLLM || false;
    this.teacherMode = opts.teacherMode || false;
  }

  async detect(text: string, ctx: AssistantContext): Promise<Intent[]> {
    if (this.useLLM && this.llmService && await this.llmService.isAvailable()) {
      try {
        const llmIntents = await this.llmService.detectIntent(text, ctx);
        if (llmIntents.length > 0) {
          return llmIntents;
        }
      } catch (error) {
        console.warn('LLM intent detection failed, falling back to patterns:', error);
      }
    }

    // Fallback to pattern matching
    return this.opts.spines.flatMap(s => s.detectIntent(text, ctx))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  async extractEntities(intent: Intent, text: string, ctx: AssistantContext): Promise<{entities: Record<string, unknown>; missing: string[]}> {
    if (this.useLLM && this.llmService && await this.llmService.isAvailable()) {
      try {
        const llmExtraction = await this.llmService.extractEntities(intent, text, ctx);
        if (llmExtraction.entities && Object.keys(llmExtraction.entities).length > 0) {
          return llmExtraction;
        }
      } catch (error) {
        console.warn('LLM entity extraction failed, falling back to patterns:', error);
      }
    }

    // Fallback to pattern-based extraction
    const spine = this.opts.spines.find(s => s.name === intent.spine);
    if (!spine) {
      return { entities: {}, missing: [] };
    }

    return spine.extractEntities(intent, text, ctx);
  }

  handle = async (text: string, ctx: AssistantContext, args?: { confirmToken?: string; explain?: boolean }): Promise<FlowRunResult & { explanation?: any }> => {
    const intents = await this.detect(text, ctx);
    const top = intents[0];
    
    if (!top) {
      const steps = [{ 
        kind: "respond" as const, 
        message: "I didn't recognize that command. Try: book, cancel, invoice, refund, report, schedule, client, analytics." 
      }];

      if (this.teacherMode && args?.explain) {
        const explanation = await this.generateExplanation("intent_recognition", { text, ctx }, { recognized: false });
        return { steps, final: { ok: false, message: "Unknown intent" }, explanation };
      }

      return { steps, final: { ok: false, message: "Unknown intent" } };
    }
    
    const spine = this.opts.spines.find(s => s.name === top.spine);
    if (!spine) {
      const steps = [{ 
        kind: "respond" as const, 
        message: `Spine missing: ${top.spine}` 
      }];
      
      if (this.teacherMode && args?.explain) {
        const explanation = await this.generateExplanation("spine_resolution", { intent: top, availableSpines: this.opts.spines.map(s => s.name) }, { found: false });
        return { steps, final: { ok: false, message: "Missing spine" }, explanation };
      }

      return { steps, final: { ok: false, message: "Missing spine" } };
    }
    
    const extraction = await this.extractEntities(top, text, ctx);
    const steps = spine.buildFlow(top, extraction, ctx);

    const result = await runFlow(steps, { ctx, confirmationToken: args?.confirmToken }, {
      tools: this.opts.tools,
      policy: defaultPolicy,
      audit: memoryAuditWriter,
      hashChain: memoryHashChain ? (evt: AuditEvent) => 'hash' : undefined,
    });

    // Add explanation if teacher mode is enabled
    if (this.teacherMode && args?.explain) {
      const explanation = await this.generateExplanation("operation_execution", { 
        intent: top, 
        extraction, 
        steps: steps.length,
        result: result.final 
      }, result.final);
      
      return { ...result, explanation };
    }

    return result;
  };

  async explain(text: string, ctx: AssistantContext): Promise<any> {
    const intents = await this.detect(text, ctx);
    const top = intents[0];
    
    if (!top) {
      return {
        operation: "intent_recognition",
        reasoning: "No intent could be recognized from the input. The system looks for patterns related to booking, CRM, payments, marketing, analytics, and security operations.",
        confidence: 0,
        alternatives: [
          "Try using specific commands like 'book appointment', 'cancel booking', 'create invoice'",
          "Check spelling and be more explicit about what you want to do",
          "Use one of the supported business domains: booking, crm, payments, marketing, analytics, admin_security"
        ],
        nextSteps: [
          "Review the available commands and try again",
          "Use simpler language with clear action words"
        ]
      };
    }

    const spine = this.opts.spines.find(s => s.name === top.spine);
    const extraction = await this.extractEntities(top, text, ctx);
    
    return {
      operation: `${top.spine}.${top.name}`,
      reasoning: `Detected intent "${top.name}" with ${Math.round(top.confidence * 100)}% confidence in the ${top.spine} domain. ${top.match}`,
      confidence: top.confidence,
      extractedEntities: extraction.entities,
      missingEntities: extraction.missing,
      alternatives: intents.slice(1, 3).map(i => `${i.spine}.${i.name} (${Math.round(i.confidence * 100)}% confidence)`),
      nextSteps: extraction.missing.length > 0 
        ? [`Provide missing information: ${extraction.missing.join(', ')}`]
        : [`Execute ${top.name} operation in ${top.spine} domain`]
    };
  }

  async switchToLLM(llmService: LLMService): Promise<void> {
    this.llmService = llmService;
    this.useLLM = true;
  }

  async switchToPatterns(): Promise<void> {
    this.useLLM = false;
  }

  enableTeacherMode(): void {
    this.teacherMode = true;
  }

  disableTeacherMode(): void {
    this.teacherMode = false;
  }

  isLLMEnabled(): boolean {
    return this.useLLM;
  }

  isTeacherModeEnabled(): boolean {
    return this.teacherMode;
  }

  private async generateExplanation(operation: string, context: any, result: any): Promise<any> {
    if (!this.llmService || !await this.llmService.isAvailable()) {
      return {
        operation,
        reasoning: "LLM service unavailable - using rule-based explanation",
        confidence: 0.5,
        context,
        result
      };
    }

    try {
      return await this.llmService.explainOperation(operation, context, result);
    } catch (error) {
      return {
        operation,
        reasoning: `Failed to generate LLM explanation: ${error}`,
        confidence: 0,
        context,
        result
      };
    }
  }
}

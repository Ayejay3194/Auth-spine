import { FlowStep, AssistantContext, ToolResult, Policy, AuditEvent, AuditWriter, Intent, FlowRunResult, Spine, ToolRegistry } from "./types.js";
import { runFlow } from "./flow.js";
import { defaultPolicy } from "./policy.js";
import { memoryAuditWriter, memoryHashChain } from "../adapters/memory.js";
import { TeacherService } from "../teacher/service.js";
import { Orchestrator } from "./orchestrator.js";

export type TeacherOrchestratorOptions = {
  spines: Spine[];
  tools: ToolRegistry;
  teacherService?: TeacherService;
};

export class TeacherOrchestrator {
  private originalOrchestrator: Orchestrator;
  private teacherService?: TeacherService;

  constructor(private opts: TeacherOrchestratorOptions) {
    // Use the original orchestrator for all core operations
    this.originalOrchestrator = new Orchestrator({
      spines: opts.spines,
      tools: opts.tools
    });
    this.teacherService = opts.teacherService;
  }

  // Core operations - uses original rule-based system only
  detect(text: string, ctx: AssistantContext): Intent[] {
    return this.originalOrchestrator.detect(text, ctx);
  }

  handle = async (text: string, ctx: AssistantContext, args?: { confirmToken?: string; explain?: boolean }): Promise<FlowRunResult & { explanation?: any }> => {
    // Use original orchestrator for all core processing
    const result = await this.originalOrchestrator.handle(text, ctx, args);

    // Only add explanation if teacher mode is requested and available
    if (args?.explain && this.teacherService) {
      try {
        const explanation = await this.generateExplanation(text, ctx, result);
        return { ...result, explanation };
      } catch (error) {
        console.warn('Teacher explanation failed:', error);
        return result;
      }
    }

    return result;
  };

  // Teacher-only methods - these don't affect core operations
  async explainOperation(text: string, ctx: AssistantContext): Promise<any> {
    if (!this.teacherService) {
      return {
        operation: "explanation_unavailable",
        reasoning: "Teacher service not configured. Please set up LLM credentials to enable explanations.",
        confidence: 0,
        alternatives: [
          "Configure LLM provider in environment variables",
          "Use the rule-based system without explanations",
          "Check system documentation for operation details"
        ],
        nextSteps: [
          "Set up OPENAI_API_KEY or ANTHROPIC_API_KEY",
          "Restart the service to apply changes",
          "Try the explanation endpoint again"
        ]
      };
    }

    try {
      // First, get the actual operation result using the original system
      const intents = this.detect(text, ctx);
      const top = intents[0];
      
      if (!top) {
        return await this.teacherService.teach({
          type: 'explain_intent',
          intent: null,
          context: { text, ...ctx },
          result: { recognized: false },
          userLevel: 'intermediate'
        });
      }

      const spine = this.opts.spines.find(s => s.name === top.spine);
      if (!spine) {
        return await this.teacherService.teach({
          type: 'explain_decision',
          operation: 'spine_resolution',
          context: { intent: top, availableSpines: this.opts.spines.map(s => s.name), ...ctx },
          result: { found: false },
          userLevel: 'intermediate'
        });
      }

      const extraction = spine.extractEntities(top, text, ctx);
      const steps = spine.buildFlow(top, extraction, ctx);
      
      // Now get the teacher explanation
      return await this.teacherService.teach({
        type: 'explain_operation',
        operation: `${top.spine}.${top.name}`,
        context: { 
          intent: top, 
          extraction, 
          steps: steps.length,
          text,
          ...ctx 
        },
        result: { 
          intentDetected: true,
          entitiesExtracted: Object.keys(extraction.entities).length,
          missingEntities: extraction.missing,
          stepsGenerated: steps.length
        },
        userLevel: 'intermediate'
      });

    } catch (error) {
      console.error('Teacher explanation failed:', error);
      return {
        operation: "explanation_failed",
        reasoning: `Failed to generate explanation: ${error}`,
        confidence: 0,
        alternatives: [
          "Try again with a simpler request",
          "Check if the LLM service is properly configured",
          "Use the system without explanations"
        ],
        nextSteps: [
          "Verify LLM API credentials",
          "Check network connectivity",
          "Contact system administrator"
        ]
      };
    }
  }

  async explainIntent(text: string, ctx: AssistantContext): Promise<any> {
    if (!this.teacherService) {
      return {
        type: 'explain_intent',
        title: 'Intent Recognition Unavailable',
        explanation: 'The system uses rule-based pattern matching to recognize user intents.',
        reasoning: 'Without the teacher service, detailed explanations are not available.',
        confidence: 0.5,
        userLevel: 'intermediate'
      };
    }

    try {
      const intents = this.detect(text, ctx);
      
      return await this.teacherService.teach({
        type: 'explain_intent',
        intent: intents[0] || null,
        context: { text, allIntents: intents, ...ctx },
        result: { 
          intentsFound: intents.length,
          topIntent: intents[0] || null
        },
        userLevel: 'intermediate'
      });

    } catch (error) {
      console.error('Intent explanation failed:', error);
      return {
        type: 'explain_intent',
        title: 'Intent Recognition',
        explanation: 'The system analyzed your input to determine what you wanted to accomplish.',
        reasoning: 'Pattern matching was used to identify potential business operations.',
        confidence: 0.6,
        userLevel: 'intermediate'
      };
    }
  }

  async explainSuggestion(suggestion: any, ctx: AssistantContext): Promise<any> {
    if (!this.teacherService) {
      return {
        type: 'explain_suggestion',
        title: 'Suggestion Details Unavailable',
        explanation: 'AI-generated business insights require the teacher service for detailed explanations.',
        reasoning: 'Configure LLM credentials to enable suggestion explanations.',
        confidence: 0.5,
        userLevel: 'intermediate'
      };
    }

    try {
      return await this.teacherService.teach({
        type: 'explain_suggestion',
        suggestion,
        context: ctx,
        result: { suggestionAvailable: !!suggestion },
        userLevel: 'intermediate'
      });

    } catch (error) {
      console.error('Suggestion explanation failed:', error);
      return {
        type: 'explain_suggestion',
        title: 'Business Suggestion',
        explanation: 'This is an AI-generated recommendation to help optimize your business operations.',
        reasoning: 'The system analyzes patterns and provides actionable insights.',
        confidence: 0.6,
        userLevel: 'intermediate'
      };
    }
  }

  async teachConcept(concept: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    if (!this.teacherService) {
      return {
        type: 'teach_concept',
        title: `Concept: ${concept}`,
        explanation: `${concept} is a business automation concept. Detailed explanations require the teacher service.`,
        reasoning: 'Configure LLM credentials to enable concept teaching.',
        confidence: 0.5,
        userLevel,
        examples: [`Example of ${concept} in business context`],
        alternatives: ['Read the documentation', 'Contact support', 'Explore the system'],
        nextSteps: ['Set up LLM provider', 'Try the concept again', 'Use help resources']
      };
    }

    try {
      return await this.teacherService.teach({
        type: 'teach_concept',
        concept,
        context: { requestedLevel: userLevel },
        result: { conceptProvided: true },
        userLevel
      });

    } catch (error) {
      console.error('Concept teaching failed:', error);
      return {
        type: 'teach_concept',
        title: `Concept: ${concept}`,
        explanation: `${concept} relates to business automation and workflow management.`,
        reasoning: 'This concept helps understand how the system processes business operations.',
        confidence: 0.6,
        userLevel,
        examples: [`Practical example of ${concept}`],
        nextSteps: ['Explore related features', 'Read documentation', 'Try practical examples']
      };
    }
  }

  // Method to update teacher service without affecting core operations
  setTeacherService(teacherService: TeacherService | undefined): void {
    this.teacherService = teacherService;
  }

  // Check if teacher is available (doesn't affect core operations)
  isTeacherAvailable(): boolean {
    return !!this.teacherService;
  }

  // Get the original orchestrator for core operations if needed
  getOriginalOrchestrator(): Orchestrator {
    return this.originalOrchestrator;
  }

  private async generateExplanation(text: string, ctx: AssistantContext, result: FlowRunResult): Promise<any> {
    if (!this.teacherService) {
      return {
        operation: "system_operation",
        reasoning: "Core business logic executed using rule-based patterns",
        confidence: 0.8,
        context: { text, result: result.final }
      };
    }

    try {
      return await this.teacherService.teach({
        type: 'explain_operation',
        operation: 'business_process',
        context: { text, steps: result.steps, ...ctx },
        result: result.final,
        userLevel: 'intermediate'
      });
    } catch (error) {
      return {
        operation: "system_operation",
        reasoning: "Business operation completed using established patterns",
        confidence: 0.7,
        context: { text, result: result.final }
      };
    }
  }
}

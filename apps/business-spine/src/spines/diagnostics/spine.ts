import { Spine, Intent, Extraction, AssistantContext, FlowStep } from "../../core/types.js";
import { detectByPatterns } from "../../core/intent.js";
import { patterns } from "./intents.js";

export const spine: Spine = {
  name: "diagnostics",
  description: "Admin diagnostics and health checks for the business spine system",

  detectIntent(text: string, ctx: AssistantContext): Intent[] {
    // Only admins can run diagnostics
    if (ctx.actor.role !== "admin" && ctx.actor.role !== "owner") {
      return [];
    }
    return detectByPatterns(text, patterns);
  },

  extractEntities(intent: Intent, text: string, ctx: AssistantContext): Extraction {
    const entities: Record<string, unknown> = {};
    const missing: string[] = [];

    // Most diagnostic commands don't need additional parameters
    // They're execute-only commands

    return { entities, missing };
  },

  buildFlow(intent: Intent, extraction: Extraction, ctx: AssistantContext): FlowStep[] {
    const steps: FlowStep[] = [];

    // Check for missing required fields
    if (extraction.missing.length > 0) {
      steps.push({
        kind: "ask",
        prompt: `Please provide: ${extraction.missing.join(", ")}`,
        missing: extraction.missing,
      });
      return steps;
    }

    // Execute diagnostics
    switch (intent.name) {
      case "run_diagnostics":
        steps.push({
          kind: "execute",
          action: "diagnostics.runAll",
          sensitivity: "medium",
          tool: "runDiagnostics",
          input: extraction.entities,
        });
        break;

      case "check_database":
        steps.push({
          kind: "execute",
          action: "diagnostics.checkDatabase",
          sensitivity: "low",
          tool: "checkDatabase",
          input: extraction.entities,
        });
        break;

      case "check_redis":
        steps.push({
          kind: "execute",
          action: "diagnostics.checkRedis",
          sensitivity: "low",
          tool: "checkRedis",
          input: extraction.entities,
        });
        break;

      case "check_queue":
        steps.push({
          kind: "execute",
          action: "diagnostics.checkQueue",
          sensitivity: "low",
          tool: "checkQueue",
          input: extraction.entities,
        });
        break;

      default:
        steps.push({
          kind: "respond",
          message: `Unknown diagnostics command: ${intent.name}`,
        });
    }

    return steps;
  },
};

import { FlowStep, AssistantContext, ToolResult, Policy, AuditEvent, AuditWriter } from "./types.js";
import { nanoid } from "nanoid";

export type FlowContext = {
  ctx: AssistantContext;
  confirmationToken?: string;
};

export type FlowEnvironment = {
  tools: Record<string, (args: { ctx: AssistantContext; input: Record<string, unknown> }) => Promise<ToolResult>>;
  policy: Policy;
  audit: AuditWriter;
  hashChain?: (evt: AuditEvent) => string;
};

/**
 * Validate flow steps before execution to prevent code injection
 * Ensures all tools referenced in execute steps exist in the environment
 */
function validateFlowSteps(steps: FlowStep[], env: FlowEnvironment): void {
  for (const step of steps) {
    if (step.kind === "execute") {
      // Validate tool exists
      if (!env.tools[step.tool]) {
        throw new Error(`Invalid tool reference: ${step.tool}. Tool not found in environment.`);
      }
      
      // Validate action is a string (not code)
      if (typeof step.action !== "string" || step.action.length === 0) {
        throw new Error(`Invalid action: action must be a non-empty string.`);
      }
      
      // Validate sensitivity is one of allowed values
      if (!["low", "medium", "high"].includes(step.sensitivity)) {
        throw new Error(`Invalid sensitivity: ${step.sensitivity}. Must be 'low', 'medium', or 'high'.`);
      }
      
      // Validate input is an object
      if (typeof step.input !== "object" || step.input === null) {
        throw new Error(`Invalid input: input must be an object.`);
      }
    }
  }
}

export async function runFlow(
  steps: FlowStep[], 
  flowCtx: FlowContext, 
  env: FlowEnvironment
): Promise<{ steps: FlowStep[], final?: { ok: boolean; message: string; payload?: unknown } }> {
  const executedSteps: FlowStep[] = [];
  let finalResult: { ok: boolean; message: string; payload?: unknown } | undefined;

  // Validate all steps before execution to prevent code injection
  validateFlowSteps(steps, env);

  for (const step of steps) {
    executedSteps.push(step);

    switch (step.kind) {
      case "ask":
        // Stop flow and ask for missing information
        return { steps: executedSteps };

      case "confirm":
        // Stop flow and request confirmation
        return { steps: executedSteps };

      case "execute":
        try {
          // Validate tool exists before execution
          const tool = env.tools[step.tool];
          if (!tool) {
            throw new Error(`Tool not found: ${step.tool}`);
          }

          // Check policy
          const policyResult = env.policy({
            ctx: flowCtx.ctx,
            action: step.action,
            sensitivity: step.sensitivity,
            input: step.input
          });

          if (!policyResult.allow) {
            executedSteps.push({
              kind: "respond",
              message: policyResult.reason || "Action not allowed"
            });
            finalResult = { ok: false, message: policyResult.reason || "Action not allowed" };
            continue;
          }

          // Check confirmation if required
          if (policyResult.requireConfirmation && !flowCtx.confirmationToken) {
            executedSteps.push({
              kind: "confirm",
              prompt: policyResult.requireConfirmation.message || "Please confirm this action",
              token: policyResult.requireConfirmation.token || nanoid()
            });
            return { steps: executedSteps };
          }

          // Execute tool with validated input
          const result = await tool({ ctx: flowCtx.ctx, input: step.input });

          // Audit the execution
          const auditEvent: AuditEvent = {
            id: nanoid(),
            tsISO: new Date().toISOString(),
            tenantId: flowCtx.ctx.tenantId,
            actorUserId: flowCtx.ctx.actor.userId,
            actorRole: flowCtx.ctx.actor.role,
            action: step.action,
            inputSummary: step.input,
            outcome: result.ok ? "success" : "failure",
            reason: result.error?.message
          };

          if (env.hashChain) {
            auditEvent.hash = env.hashChain(auditEvent);
          }

          await env.audit(auditEvent);

          if (result.ok) {
            executedSteps.push({
              kind: "respond",
              message: "Action completed successfully",
              payload: result.data
            });
            finalResult = { ok: true, message: "Action completed successfully", payload: result.data };
          } else {
            executedSteps.push({
              kind: "respond",
              message: result.error?.message || "Action failed"
            });
            finalResult = { ok: false, message: result.error?.message || "Action failed" };
          }
        } catch (error) {
          executedSteps.push({
            kind: "respond",
            message: `Error executing action: ${error instanceof Error ? error.message : "Unknown error"}`
          });
          finalResult = { ok: false, message: `Execution error: ${error instanceof Error ? error.message : "Unknown error"}` };
        }
        break;

      case "respond":
        finalResult = { 
          ok: true, 
          message: step.message, 
          payload: step.payload 
        };
        break;
    }
  }

  return { steps: executedSteps, final: finalResult };
}

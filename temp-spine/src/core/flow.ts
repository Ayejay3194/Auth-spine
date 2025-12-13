import { AuditWriter, FlowRunResult, FlowStep, Policy, ToolRegistry, ToolResult } from "./types.js";
import { uid, stableHash } from "./util.js";

export type FlowRunnerOptions = {
  tools: ToolRegistry;
  policy: Policy;
  audit: AuditWriter;
  // if provided, link audit hashes for tamper-evidence
  hashChain?: { getPrevHash: () => Promise<string | undefined>; setPrevHash: (h: string) => Promise<void> };
};

export async function runFlow(steps: FlowStep[], args: {
  ctx: any;
  confirmationToken?: string;
}, opts: FlowRunnerOptions): Promise<FlowRunResult> {
  const out: FlowStep[] = [];
  for (const step of steps) {
    if (step.kind === "ask") {
      out.push(step);
      return { steps: out, final: { ok: true, message: step.prompt, payload: { missing: step.missing } } };
    }

    if (step.kind === "confirm") {
      if (args.confirmationToken && args.confirmationToken === step.token) {
        // confirmed, continue
        continue;
      }
      out.push(step);
      return { steps: out, final: { ok: true, message: step.prompt, payload: { confirmToken: step.token } } };
    }

    if (step.kind === "execute") {
      // policy check
      const decision = opts.policy({ ctx: args.ctx, action: step.action, sensitivity: step.sensitivity, input: step.input });
      if (!decision.allow) {
        await writeAudit(opts, args.ctx, {
          action: step.action,
          outcome: "blocked",
          inputSummary: step.input,
          reason: decision.reason ?? "Policy denied",
        });
        out.push({ kind: "respond", message: `Blocked: ${decision.reason ?? "not allowed"}` });
        return { steps: out, final: { ok: false, message: decision.reason ?? "Blocked" } };
      }
      if (decision.requireConfirmation?.required) {
        const token = decision.requireConfirmation.token ?? uid("confirm");
        out.push({ kind: "confirm", prompt: decision.requireConfirmation.message ?? "Confirm?", token });
        return { steps: out, final: { ok: true, message: decision.requireConfirmation.message ?? "Confirm?", payload: { confirmToken: token } } };
      }

      const fn = opts.tools[step.tool];
      if (!fn) {
        await writeAudit(opts, args.ctx, { action: step.action, outcome: "failure", reason: `Unknown tool: ${step.tool}` });
        out.push({ kind: "respond", message: `Internal error: tool not found (${step.tool})` });
        return { steps: out, final: { ok: false, message: "Tool not found" } };
      }

      let res: ToolResult;
      try {
        res = await fn({ ctx: args.ctx, input: step.input });
      } catch (e: any) {
        res = { ok: false, error: { code: "tool_exception", message: e?.message ?? "Tool threw", details: String(e) } };
      }

      await writeAudit(opts, args.ctx, {
        action: step.action,
        outcome: res.ok ? "success" : "failure",
        inputSummary: step.input,
        reason: res.ok ? undefined : res.error?.message,
      });

      if (!res.ok) {
        out.push({ kind: "respond", message: `Failed: ${res.error?.message ?? "unknown error"}`, payload: res.error });
        return { steps: out, final: { ok: false, message: res.error?.message ?? "Failed", payload: res.error } };
      }

      out.push({ kind: "respond", message: `Done: ${step.action}`, payload: res.data });
      continue;
    }

    if (step.kind === "respond") {
      out.push(step);
      continue;
    }
  }

  return { steps: out, final: { ok: true, message: "Completed", payload: out.at(-1) } };
}

async function writeAudit(opts: FlowRunnerOptions, ctx: any, partial: {
  action: string;
  outcome: "success"|"failure"|"blocked";
  reason?: string;
  inputSummary?: Record<string, unknown>;
}) {
  const evtBase: any = {
    id: uid("audit"),
    tsISO: ctx.nowISO,
    tenantId: ctx.tenantId,
    actorUserId: ctx.actor.userId,
    actorRole: ctx.actor.role,
    action: partial.action,
    inputSummary: partial.inputSummary,
    outcome: partial.outcome,
    reason: partial.reason,
  };

  if (opts.hashChain) {
    const prevHash = await opts.hashChain.getPrevHash();
    const hash = stableHash({ ...evtBase, prevHash });
    evtBase.prevHash = prevHash;
    evtBase.hash = hash;
    await opts.hashChain.setPrevHash(hash);
  }

  await opts.audit(evtBase);
}

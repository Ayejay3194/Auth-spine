import path from "path";
import { plan } from "./plan.js";
import { executePlan } from "./execute.js";
import { classifyFailure } from "./taxonomy.js";
import { toLearningRow } from "./learning.js";
import { AgentState } from "./state.js";
import { appendJsonl, readJson, writeJson } from "../storage/fsStore.js";
import { computeRates, updateRolling, RunSignal } from "./metrics.js";

export async function agentLoop(opts: {
  modelBaseUrl: string;
  apiKey?: string;
  input: string;
  stateFile: string;
  eventsFile: string;
  learningFile: string;
}) {
  // load state + history
  const state = readJson<AgentState>(opts.stateFile, {
    id: "solari",
    goals: ["Produce accurate, structured outputs"],
    beliefs: {},
    metrics: {},
    updatedAt: new Date().toISOString()
  } as any);

  const history: RunSignal[] = readJson(path.join(path.dirname(opts.stateFile), "history.json"), []);

  const baseContext = { userInput: opts.input, goals: state.goals, beliefs: state.beliefs };

  // PLAN
  const p = await plan(opts.modelBaseUrl, opts.apiKey, opts.input, baseContext);
  appendJsonl(opts.eventsFile, { t: new Date().toISOString(), stage: "plan", ok: p.ok, error: p.ok ? null : p.error });

  if (!p.ok) {
    const code = classifyFailure(p);
    appendJsonl(opts.eventsFile, { t: new Date().toISOString(), stage: "fail", code, raw: p.raw });
    // learning row: planner failed; capture minimal fix target
    appendJsonl(opts.learningFile, toLearningRow({
      system: "You are Solari Planner. Output valid JSON matching the plan schema only.",
      user: `Create a plan JSON for: ${opts.input}`,
      assistantBad: String(p.raw || ""),
      assistantGood: JSON.stringify({
        goal: opts.input,
        steps: [{ id: "s1", kind: "tool", description: "Fetch needed facts", inputs: { tool: "calcEphemeris", args: {} }, expectedOutput: "toolResult" },
                { id: "s2", kind: "generate_report", description: "Generate final report JSON", inputs: {}, expectedOutput: "report" }],
        stopConditions: ["report_generated"],
        safety: { mustUseToolsForFacts: true, mustOutputJson: true, maxSteps: 6 }
      }),
      meta: { failure: code, stage: "plan" }
    }));
    return { ok:false, error: code };
  }

  // EXECUTE
  const ex = await executePlan(opts.modelBaseUrl, opts.apiKey, p.data, baseContext);
  appendJsonl(opts.eventsFile, { t: new Date().toISOString(), stage: "execute", ok: ex.ok, error: ex.ok ? null : ex.error });

  const runSignal: RunSignal = {
    ok: !!ex.ok,
    repaired: false, // this kit doesn't do repair; you can add it the same way as runtime
    confidenceLabel: undefined
  };

  const newHist = updateRolling(history, runSignal, 50);
  const rates = computeRates(newHist);

  const updated: AgentState = {
    ...state,
    lastRun: { ok: !!ex.ok, at: new Date().toISOString(), taxonomy: ex.ok ? undefined : classifyFailure(ex) },
    updatedAt: new Date().toISOString(),
    metrics: {
      schemaPassRate: { name:"schemaPassRate", target: 0.97, current: rates.ok, window: 50 },
      repairRate: { name:"repairRate", target: 0.10, current: rates.repaired, window: 50 },
      lowConfidenceRate: { name:"lowConfidenceRate", target: 0.10, current: rates.lowConf, window: 50 }
    }
  };

  // If execute failed, capture learning row (bad output -> good output)
  if (!ex.ok) {
    const code = classifyFailure(ex);
    appendJsonl(opts.eventsFile, { t: new Date().toISOString(), stage: "fail", code, raw: ex.raw, errors: ex.errors });

    // Provide a canonical "good" empty-but-valid report to teach schema compliance.
    const good = {
      title: "Insufficient grounded output",
      summary: "The system could not produce a grounded schema-valid report on this run. This is a safe fallback.",
      bullets: ["Re-run with required tools enabled", "Check schema and token limits", "Verify data inputs"],
      actions: ["Enable tool grounding", "Increase token headroom", "Add eval case and retrain on failures"],
      cautions: ["Do not fabricate facts", "Do not output non-JSON"],
      citations: []
    };

    appendJsonl(opts.learningFile, toLearningRow({
      system: "You are Solari. Output valid JSON matching the report schema only.",
      user: `User request: ${opts.input}`,
      assistantBad: String(ex.raw || ""),
      assistantGood: JSON.stringify(good),
      meta: { failure: code, stage: "execute" }
    }));
  }

  // Persist
  writeJson(opts.stateFile, updated);
  writeJson(path.join(path.dirname(opts.stateFile), "history.json"), newHist);

  return ex.ok ? { ok:true, data: ex.data } : { ok:false, error: ex.error };
}

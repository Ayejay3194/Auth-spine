import fs from "node:fs";
import path from "node:path";
import { NowContext } from "../fusion/nowContext";
import { buildStudentFeatures } from "../teacher_student/feature_schema";
import { truthTeacherBaseline } from "../teacher_student/truth_teacher";
import { TruthStudentArtifact, truthStudentInfer } from "../teacher_student/truth_student";
import { OracleDial } from "../oracle/contracts";
import { oracleStudentRender } from "../oracle/oracle_student";

export type TeacherStudentConfig = {
  truthStudentArtifactPath?: string; // if missing, falls back to baseline teacher
  useTeacherBaseline?: boolean;
};

export function runTeacherStudent(ctx: NowContext, cfg: TeacherStudentConfig = {}) {
  const teacher = truthTeacherBaseline(ctx);

  // Build student features from deterministic summaries
  const features = buildStudentFeatures({
    topTransitStrengths: ctx.astro.topAspects.slice(0,6).map(a=>a.strength),
    topTransitTypes: ctx.astro.topAspects.slice(0,6).map(a=>encodeAspectType(a.type)),
    topTransitOrbs: ctx.astro.topAspects.slice(0,6).map(a=>a.orbDeg),
    retroMask: retroMaskFromCtx(ctx),
    pressureSupport: [teacher.pressureIndex, teacher.supportIndex],
    vibe: [ctx.vibe.arousal, ctx.vibe.warmth, ctx.vibe.defensiveness, ctx.vibe.coherence, ctx.vibe.dominance, ctx.vibe.volatility, ctx.vibe.confidence],
  });

  let studentOut = teacher;
  if (cfg.truthStudentArtifactPath && fs.existsSync(cfg.truthStudentArtifactPath)) {
    const art = JSON.parse(fs.readFileSync(cfg.truthStudentArtifactPath, "utf-8")) as TruthStudentArtifact;
    const core = truthStudentInfer(art, features);
    studentOut = { ...teacher, ...core }; // keep windows + suggestedModules from teacher baseline for now
  }

  // Build oracle message (snarky but grounded)
  const dials: OracleDial = { snark: 2, mystic: 2, intimacy: 1 };
  const oracle = oracleStudentRender({
    utc: ctx.astro.utc,
    claims: [
      { text: `Pressure index ${studentOut.pressureIndex.toFixed(2)} and conflict risk ${studentOut.conflictRisk.toFixed(2)}.`, confidence: studentOut.confidence, tags: ["pressure","conflict"] },
      { text: `Repair likelihood ${studentOut.repairLikelihood.toFixed(2)}.`, confidence: studentOut.confidence, tags: ["repair"] },
    ],
    receipts: ctx.astro.topAspects.slice(0,2).map(a=>({ label: `${a.a} ${a.type} ${a.b}`, detail: `orb=${a.orbDeg.toFixed(2)} applying=${a.applying}` })),
    dials,
    certaintyBudget: studentOut.confidence,
    forbidden: ["invent_claims","new_facts","absolute_predictions"],
  });

  return { truth: studentOut, oracle };
}

function encodeAspectType(t: string) {
  const map: Record<string, number> = { CONJ:1, OPP:2, SQR:3, TRI:4, SEX:5, QUINC:6, SEMI:7, SESQ:8 };
  return map[t] ?? 0;
}

function retroMaskFromCtx(ctx: NowContext) {
  const bodies = Object.keys(ctx.astro.bodies) as any[];
  let mask = 0;
  for (let i=0;i<bodies.length;i++) {
    const b = bodies[i];
    if ((ctx.astro.bodies as any)[b]?.retrograde) mask |= (1<<i);
  }
  return mask;
}

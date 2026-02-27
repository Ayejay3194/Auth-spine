import { TruthStudentOutput } from "./types";

/**
 * Runtime student model. Keep it tiny and fast.
 * This implementation supports a compact JSON artifact with linear heads.
 */
export type LinearHead = { w: number[]; b: number; };
export type TruthStudentArtifact = {
  version: { id: string; createdUtc: string; schemaHash: string; notes?: string };
  featureSize: number;
  heads: {
    pressureIndex: LinearHead;
    supportIndex: LinearHead;
    conflictRisk: LinearHead;
    repairLikelihood: LinearHead;
    confidence: LinearHead;
    // suggestedModules handled separately via learned routing head, or keep heuristic
  };
};

export function evalLinear(head: LinearHead, x: number[]): number {
  let s = head.b;
  const n = Math.min(head.w.length, x.length);
  for (let i=0;i<n;i++) s += head.w[i]*x[i];
  return sigmoid(s);
}

export function truthStudentInfer(artifact: TruthStudentArtifact, features: number[]): Omit<TruthStudentOutput, "suggestedModules"|"windows"> {
  if (features.length !== artifact.featureSize) {
    // If schema changed, fail soft: assume padded.
    // Caller should manage schemaHash checks in production.
  }
  const pressureIndex = evalLinear(artifact.heads.pressureIndex, features);
  const supportIndex = evalLinear(artifact.heads.supportIndex, features);
  const conflictRisk = evalLinear(artifact.heads.conflictRisk, features);
  const repairLikelihood = evalLinear(artifact.heads.repairLikelihood, features);
  const confidence = evalLinear(artifact.heads.confidence, features);

  return { pressureIndex, supportIndex, conflictRisk, repairLikelihood, confidence };
}

function sigmoid(z: number) {
  if (z > 30) return 1;
  if (z < -30) return 0;
  return 1 / (1 + Math.exp(-z));
}

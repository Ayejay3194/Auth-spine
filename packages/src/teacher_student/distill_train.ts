import fs from "node:fs";
import path from "node:path";
import { TruthStudentArtifact, LinearHead } from "./truth_student";
import { DistillRow } from "./types";

/**
 * Minimal distillation training: fits independent logistic regression heads
 * by simple SGD. Intentionally dependency-free.
 *
 * Usage:
 *   node dist/distill_train.js data/distill.jsonl artifacts/truth-student.json
 */
type Options = { lr: number; epochs: number; l2: number; };

export function loadJsonl(file: string): DistillRow[] {
  const rows: DistillRow[] = [];
  const txt = fs.readFileSync(file, "utf-8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line));
  }
  return rows;
}

function sigmoid(z: number) { return 1 / (1 + Math.exp(-z)); }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function trainHead(rows: DistillRow[], pick: (r: DistillRow)=>number, featureSize: number, opt: Options): LinearHead {
  const w = new Array(featureSize).fill(0);
  let b = 0;

  for (let e=0;e<opt.epochs;e++) {
    for (const r of rows) {
      const x = r.features;
      const y = clamp01(pick(r));
      // forward
      let z = b;
      for (let i=0;i<featureSize;i++) z += w[i] * (x[i] ?? 0);
      const p = sigmoid(z);
      // gradient (logistic loss)
      const dz = (p - y);
      for (let i=0;i<featureSize;i++) {
        const xi = x[i] ?? 0;
        w[i] -= opt.lr * (dz * xi + opt.l2 * w[i]);
      }
      b -= opt.lr * dz;
    }
  }
  return { w, b };
}

export function distillTrain(distillJsonl: string, outArtifact: string, schemaHash = "dev-schema"): void {
  const rows = loadJsonl(distillJsonl);
  if (!rows.length) throw new Error("No distill rows.");
  const featureSize = rows[0].features.length;

  const opt: Options = { lr: 0.03, epochs: 8, l2: 1e-4 };

  const artifact: TruthStudentArtifact = {
    version: { id: `truth-student-${new Date().toISOString().slice(0,10)}`, createdUtc: new Date().toISOString(), schemaHash },
    featureSize,
    heads: {
      pressureIndex: trainHead(rows, r => r.label.pressureIndex, featureSize, opt),
      supportIndex: trainHead(rows, r => r.label.supportIndex, featureSize, opt),
      conflictRisk: trainHead(rows, r => r.label.conflictRisk, featureSize, opt),
      repairLikelihood: trainHead(rows, r => r.label.repairLikelihood, featureSize, opt),
      confidence: trainHead(rows, r => r.label.confidence, featureSize, opt),
    },
  };

  fs.mkdirSync(path.dirname(outArtifact), { recursive: true });
  fs.writeFileSync(outArtifact, JSON.stringify(artifact, null, 2), "utf-8");
}

import { distillTrain } from "../src/teacher_student/distill_train";

const [,, dataPath, outPath] = process.argv;
if (!dataPath || !outPath) {
  console.error("Usage: ts-node scripts/train_truth_student.ts data/distill.jsonl artifacts/truth-student.json");
  process.exit(1);
}
distillTrain(dataPath, outPath, "student-schema-v1");
console.log("Wrote", outPath);

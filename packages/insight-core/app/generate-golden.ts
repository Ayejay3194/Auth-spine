import path from "node:path";
import { ensureDir, writeJson } from "../utils/io.js";
import { Body, EphemerisInput } from "../ephemeris/domain.js";
import { TeacherSource } from "../ephemeris/teacher/teacherSource.js";
import { StudentEngine } from "../ephemeris/student/studentEngine.js";
import { GoldenFile } from "../golden/schema.js";

const OUT_DIR = "out/golden";

function bodies(): Body[] {
  return ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
}

function main() {
  ensureDir(OUT_DIR);

  const teacher = new TeacherSource();
  const student = new StudentEngine();

  const vectors = [];
  const base = 2451545.0;
  for (let i = 0; i < 300; i++) {
    const body = bodies()[i % bodies().length];
    const jdTT = base + i * 7.25; // weekly-ish sampling
    const input: EphemerisInput = { jdTT, body, frame: "ECLIPTIC", flags: { confidence: true } };
    const t = teacher.compute(input);
    const s = student.compute(input);
    vectors.push({
      id: `${body}-${jdTT.toFixed(5)}`,
      createdAt: new Date().toISOString(),
      input,
      teacher: t,
      student: s,
    });
  }

  const file: GoldenFile = {
    name: "golden-vectors-demo",
    engineVersion: "0.2.0",
    vectors,
  };

  writeJson(path.join(OUT_DIR, "golden-vectors.json"), file);
  console.log("Wrote", vectors.length, "golden vectors to", OUT_DIR);
}

main();

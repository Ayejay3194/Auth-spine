import path from "node:path";
import { ensureDir, writeJson, writeText } from "../utils/io.js";
import { summarize } from "../utils/stats.js";
import { Body, EphemerisInput } from "../ephemeris/domain.js";
import { TeacherSource } from "../ephemeris/teacher/teacherSource.js";
import { StudentEngine } from "../ephemeris/student/studentEngine.js";
import { radToArcsec } from "../utils/math.js";

const OUT_DIR = "out/residuals";

function bodies(): Body[] {
  return ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
}

function errArcsec(studentLon: number, studentLat: number, teacherLon: number, teacherLat: number): number {
  const dLon = teacherLon - studentLon;
  const dLat = teacherLat - studentLat;
  return Math.sqrt(radToArcsec(dLon)**2 + radToArcsec(dLat)**2);
}

function main() {
  ensureDir(OUT_DIR);

  const teacher = new TeacherSource();
  const student = new StudentEngine();

  const start = 2451545.0; // J2000 TT
  const stepDays = 0.5;
  const n = 4000;

  const summary: any = { start, stepDays, n, perBody: {} as Record<string, any> };

  for (const body of bodies()) {
    const rows: string[] = ["jdTT,errArcsec"];
    const errs: number[] = [];

    for (let i = 0; i < n; i++) {
      const jdTT = start + i * stepDays;
      const input: EphemerisInput = { jdTT, body, frame: "ECLIPTIC", flags: { confidence: true } };
      const s = student.compute(input);
      const t = teacher.compute(input);
      const e = errArcsec(s.lon, s.lat, t.lon, t.lat);
      errs.push(e);
      rows.push(`${jdTT.toFixed(5)},${e.toFixed(6)}`);
    }

    const stats = summarize(errs);
    summary.perBody[body] = stats;
    writeText(path.join(OUT_DIR, `${body}.csv`), rows.join("\n"));
  }

  writeJson(path.join(OUT_DIR, "summary.json"), summary);
  console.log("Wrote residual atlas to", OUT_DIR);
  console.log("Summary:", summary.perBody);
}

main();

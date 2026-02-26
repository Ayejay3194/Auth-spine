import fs from "node:fs";
import path from "node:path";
import { TeacherSource } from "../ephemeris/teacher/teacherSource.js";
import { StudentEngine } from "../ephemeris/student/studentEngine.js";
import { GoldenFile } from "../golden/schema.js";
import { radToArcsec } from "../utils/math.js";

const IN_FILE = "out/golden/golden-vectors.json";

function errArcsec(aLon: number, aLat: number, bLon: number, bLat: number): number {
  const dLon = bLon - aLon;
  const dLat = bLat - aLat;
  return Math.sqrt(radToArcsec(dLon)**2 + radToArcsec(dLat)**2);
}

function main() {
  if (!fs.existsSync(IN_FILE)) {
    console.error("Missing golden file:", IN_FILE);
    process.exit(1);
  }
  const raw = fs.readFileSync(IN_FILE, "utf-8");
  const golden = JSON.parse(raw) as GoldenFile;

  const teacher = new TeacherSource();
  const student = new StudentEngine();

  let maxTE = 0, maxSE = 0;
  let bad = 0;

  for (const v of golden.vectors) {
    const tNow = teacher.compute(v.input);
    const sNow = student.compute(v.input);

    const eT = errArcsec(tNow.lon, tNow.lat, v.teacher.lon, v.teacher.lat);
    const eS = errArcsec(sNow.lon, sNow.lat, v.student.lon, v.student.lat);

    maxTE = Math.max(maxTE, eT);
    maxSE = Math.max(maxSE, eS);

    // thresholds for demo placeholders: should be near 0 for real deterministic engines
    if (eT > 1e-6 || eS > 1e-6) bad++;
  }

  console.log("Golden check results:");
  console.log("Vectors:", golden.vectors.length);
  console.log("Teacher drift max arcsec:", maxTE);
  console.log("Student drift max arcsec:", maxSE);
  console.log("Potential regressions:", bad);

  if (bad > 0) process.exit(2);
}

main();

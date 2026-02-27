import { EphemerisInput, EphemerisOutput, Body } from "../ephemeris/domain.js";
import { TeacherSource } from "../ephemeris/teacher/teacherSource.js";
import { StudentCore } from "../ephemeris/student/studentCore.js";
import { radToArcsec, wrap2pi } from "../utils/math.js";

export interface ResidualSample {
  input: EphemerisInput;
  student: EphemerisOutput;
  teacher: EphemerisOutput;
  dLon: number;
  dLat: number;
  dR: number;
  errArcsec: number;
}

export function computeResidual(student: EphemerisOutput, teacher: EphemerisOutput): { dLon: number; dLat: number; dR: number } {
  // For angles, you may want shortest-angle difference; demo uses raw difference.
  return { dLon: teacher.lon - student.lon, dLat: teacher.lat - student.lat, dR: teacher.r - student.r };
}

export function residualArcsec(dLon: number, dLat: number): number {
  // Euclidean arcsec on lon/lat components (approx)
  return Math.sqrt(radToArcsec(dLon)**2 + radToArcsec(dLat)**2);
}

export function buildSamples(opts: {
  startJdTT: number;
  stepDays: number;
  n: number;
  bodies: Body[];
}): ResidualSample[] {
  const teacher = new TeacherSource();
  const student = new StudentCore();
  const out: ResidualSample[] = [];

  for (let i = 0; i < opts.n; i++) {
    const jdTT = opts.startJdTT + i * opts.stepDays;
    const body = opts.bodies[i % opts.bodies.length];
    const input: EphemerisInput = { jdTT, body, frame: "ECLIPTIC", flags: { confidence: true } };
    const s = student.compute(input);
    const t = teacher.compute(input);
    const { dLon, dLat, dR } = computeResidual(s, t);
    out.push({ input, student: s, teacher: t, dLon, dLat, dR, errArcsec: residualArcsec(dLon, dLat) });
  }
  return out;
}

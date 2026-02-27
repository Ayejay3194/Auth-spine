import { buildNowContext } from "../fusion/buildNowContext";
import { createStubEphemerisProvider } from "../ephemeris/stubProvider";
import { runTeacherStudent } from "../engine/teacherStudentEngine";

async function main() {
  const eph = createStubEphemerisProvider();
  const ctx = await buildNowContext({
    utc: new Date().toISOString(),
    ephemeris: eph,
    user: { natal: {}, preferences: { tone: "sassy", intensity: 2, receiptsDefault: true } },
    chatEvents: [
      { kind: "msg", t: Date.now()-60_000, text: "I feel pressed for no reason." },
      { kind: "msg", t: Date.now()-20_000, text: "Also I might text them. Bad idea?" },
      { kind: "latency", t: Date.now()-10_000, ms: 1800 },
    ],
  });

  const out = runTeacherStudent(ctx, { truthStudentArtifactPath: "artifacts/truth-student.json" });
  console.log("=== Oracle ===");
  console.log(out.oracle.lines.join("\n"));
  console.log("\n=== Truth (student) ===");
  console.log(JSON.stringify(out.truth, null, 2));
}

main().catch((e)=>{ console.error(e); process.exit(1); });

import { buildSamples } from "../training/teacherStudent.js";
import { summarize } from "../utils/stats.js";

function main() {
  const samples = buildSamples({
    startJdTT: 2451545.0,
    stepDays: 0.25,
    n: 2500,
    bodies: ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"],
  });

  const errs = samples.map(s => s.errArcsec);
  const stats = summarize(errs);

  console.log("Teacher–Student residual snapshot (arcsec):", stats);
  console.log("Worst sample:", samples.reduce((a,b)=> (a.errArcsec>b.errArcsec?a:b)));
}

main();

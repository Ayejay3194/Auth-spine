import { testAspectsDeterministic } from "./test_aspects.js";
import { testVibeDeterministic } from "./test_vibe.js";
import { testContextBuild } from "./test_context.js";

const tests: { name: string; fn: () => void }[] = [
  { name: "aspects deterministic", fn: testAspectsDeterministic },
  { name: "vibe deterministic", fn: testVibeDeterministic },
  { name: "context build", fn: testContextBuild },
];

let pass = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log(`✅ ${t.name}`);
    pass++;
  } catch (e: any) {
    console.error(`❌ ${t.name}`);
    console.error(e?.stack ?? e);
    process.exitCode = 1;
    break;
  }
}
console.log(`\n${pass}/${tests.length} tests passed.`);

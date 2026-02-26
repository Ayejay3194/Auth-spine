import { defaultGate, defaultDriftPolicy } from "@aj/ml-core"; // (not exported here; example only)
import { selectArm, updateArm } from "@aj/ml-recs";

const state = { arms: {} as any };
const candidates = ["a", "b", "c"];
const chosen = selectArm(state, candidates, { epsilon: 0.2 });
updateArm(state, chosen, 1.0);
console.log({ chosen, state });

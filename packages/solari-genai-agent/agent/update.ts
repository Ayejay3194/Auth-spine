import { AgentState } from "./state.js";

export function update(state: AgentState, evaln: any, result: any): AgentState {
  return {
    ...state,
    lastAction: result?.raw ? "generate" : "none",
    lastResult: result?.data,
    confidence: result?.confidence?.score01,
    updatedAt: new Date().toISOString()
  };
}

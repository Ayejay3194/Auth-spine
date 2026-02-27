import { observe } from "./observe.js";
import { decide } from "./decide.js";
import { act } from "./act.js";
import { evaluate } from "./evaluate.js";
import { update } from "./update.js";
import { AgentState } from "./state.js";

export async function agentLoop(
  state: AgentState,
  input: string,
  modelBaseUrl: string,
  apiKey?: string
) {
  const obs = observe(input, { goals: state.goals, beliefs: state.beliefs });

  const decision = await decide(modelBaseUrl, apiKey, obs);
  if (!decision.ok) return state;

  let result = null;
  if (decision.data.intent !== "wait") {
    result = await act(modelBaseUrl, apiKey, obs);
  }

  const evaln = evaluate(result);
  const newState = update(state, evaln, result);
  return newState;
}

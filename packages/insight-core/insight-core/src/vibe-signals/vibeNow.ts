import type { ConversationWindow } from "./events.js";
import { extractVibeFeatures } from "./features.js";
import { DEFAULT_VIBE, updateVibeState, type VibeStateInternal } from "./state.js";
import type { VibeNowSignals } from "../types/vibe.js";

export class VibeEngine {
  private state: VibeStateInternal = { ...DEFAULT_VIBE };

  public computeNow(utc: string, win: ConversationWindow): VibeNowSignals {
    const feats = extractVibeFeatures(win);
    const { state, signals } = updateVibeState(this.state, utc, feats);
    this.state = state;
    return signals;
  }

  public reset(): void {
    this.state = { ...DEFAULT_VIBE };
  }
}

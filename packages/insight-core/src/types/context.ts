import type { AstroNowSignals } from "./astro.js";
import type { VibeNowSignals } from "./vibe.js";

export type Tone = "sassy"|"balanced"|"clinical";

export type NowContext = {
  utc: string;
  astro: AstroNowSignals;
  vibe: VibeNowSignals;
  user: {
    natal?: unknown; // plug your natal model
    preferences: {
      tone: Tone;
      intensity: 0|1|2|3;
      receiptsDefault: boolean;
    };
  };
  routing: {
    suggestedModules: string[];
    riskFlags: string[];
  };
};

import { Intent, AssistantContext } from './types.js';

export type Pattern = {
  spine: string;
  intent: string;
  re: string;
  baseConfidence: number;
  hint: string;
};

export function detectByPatterns(patterns: Pattern[], text: string, ctx: AssistantContext): Intent[] {
  const normalized = text.toLowerCase().trim();
  const intents: Intent[] = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.re, 'i');
    if (regex.test(normalized)) {
      intents.push({
        spine: pattern.spine,
        name: pattern.intent,
        confidence: pattern.baseConfidence,
        match: pattern.hint
      });
    }
  }

  return intents;
}

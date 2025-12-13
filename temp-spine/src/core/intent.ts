import { Intent } from "./types.js";
import { clamp01, normalizeText, stripPunct } from "./util.js";

export type Pattern = {
  spine: string;
  intent: string;
  // simple regex for deterministic matching
  re: RegExp;
  baseConfidence: number;
  hint?: string;
};

export function detectByPatterns(text: string, patterns: Pattern[]): Intent[] {
  const t = stripPunct(normalizeText(text));
  const hits: Intent[] = [];
  for (const p of patterns) {
    const m = t.match(p.re);
    if (!m) continue;
    const boost = Math.min(0.2, (m[0]?.length ?? 0) / 100);
    hits.push({
      spine: p.spine,
      name: p.intent,
      confidence: clamp01(p.baseConfidence + boost),
      match: p.hint ?? p.re.toString(),
    });
  }
  // highest confidence first
  hits.sort((a, b) => b.confidence - a.confidence);
  // de-dupe same (spine,intent)
  const seen = new Set<string>();
  return hits.filter(h => {
    const k = `${h.spine}:${h.name}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
}

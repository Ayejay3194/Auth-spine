import type { ConversationWindow } from "./events.js";

const NEGATIONS = /\b(no|not|never|can't|won't|don't|nothing|nobody|nah)\b/gi;
const INTENSIFIERS = /\b(very|so|super|extremely|literally|always|everyone|everything)\b/gi;

export type VibeFeatures = {
  msgCount: number;
  avgLen: number;
  shortReplyRate: number;
  questionRate: number;
  exclamRate: number;
  negationRate: number;
  intensifierRate: number;
  latencyAvgMs: number | null;
  topicDrift: number; // 0..1 (cheap)
};

function countMatches(re: RegExp, s: string): number {
  const m = s.match(re);
  return m ? m.length : 0;
}

function hashWords(text: string): Map<string, number> {
  const m = new Map<string, number>();
  const words = text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);
  for (const w of words) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  for (const [k, va] of a) {
    na += va * va;
    const vb = b.get(k);
    if (vb) dot += va * vb;
  }
  for (const [, vb] of b) nb += vb * vb;
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}

export function extractVibeFeatures(win: ConversationWindow): VibeFeatures {
  const msgs = win.events.filter(e => e.kind === "msg") as {kind:"msg"; t:number; speaker:string; text:string}[];
  const lats = win.events.filter(e => e.kind === "latency") as {kind:"latency"; t:number; speaker:string; ms:number}[];

  const msgCount = msgs.length;
  const lens = msgs.map(m => m.text.length);
  const avgLen = msgCount ? lens.reduce((a,b)=>a+b,0)/msgCount : 0;

  const shortReplyRate = msgCount ? msgs.filter(m => m.text.trim().length <= 18).length / msgCount : 0;
  const questionRate = msgCount ? msgs.filter(m => m.text.includes("?")).length / msgCount : 0;
  const exclamRate = msgCount ? msgs.filter(m => m.text.includes("!")).length / msgCount : 0;

  const negationRate = msgCount ? msgs.map(m => countMatches(NEGATIONS, m.text)).reduce((a,b)=>a+b,0) / msgCount : 0;
  const intensifierRate = msgCount ? msgs.map(m => countMatches(INTENSIFIERS, m.text)).reduce((a,b)=>a+b,0) / msgCount : 0;

  const latencyAvgMs = lats.length ? lats.reduce((a,b)=>a+b.ms,0)/lats.length : null;

  // Topic drift: compare last message to previous (cheap)
  let topicDrift = 0;
  if (msgs.length >= 2) {
    const a = hashWords(msgs[msgs.length-2].text);
    const b = hashWords(msgs[msgs.length-1].text);
    const c = cosine(a,b); // 0..1 similarity
    topicDrift = 1 - c;
  }

  return { msgCount, avgLen, shortReplyRate, questionRate, exclamRate, negationRate, intensifierRate, latencyAvgMs, topicDrift };
}

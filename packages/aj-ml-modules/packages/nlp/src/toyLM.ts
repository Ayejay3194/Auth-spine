/**
 * Language Model From Scratch (Advanced) - but honest.
 * This is a character-level bigram model:
 * - trains fast
 * - proves the LM pipeline
 * - gives you deterministic artifacts
 *
 * Swap later with a real transformer if you want compute pain.
 */
export interface BigramLM {
  chars: string[];
  probs: number[][]; // row i -> P(next | char i)
  startProbs: number[];
}

export function trainBigramLM(text: string): BigramLM {
  const chars = Array.from(new Set(text.split("")));
  const idx = new Map(chars.map((c,i)=>[c,i] as const));
  const K = chars.length;
  const counts = Array.from({length:K}, ()=>Array(K).fill(1)); // add-1 smoothing
  const start = new Array(K).fill(1);

  let prev: string | null = null;
  for (const ch of text) {
    const j = idx.get(ch)!;
    if (prev == null) start[j] += 1;
    else {
      const i = idx.get(prev)!;
      counts[i]![j] += 1;
    }
    prev = ch === "\n" ? null : ch;
  }

  function norm(row: number[]) {
    const s = row.reduce((a,b)=>a+b,0) || 1;
    return row.map(x=>x/s);
  }

  return {
    chars,
    probs: counts.map(norm),
    startProbs: norm(start)
  };
}

export function sample(lm: BigramLM, n=200, seed=42): string {
  let s = seed>>>0;
  const rnd = ()=> (s=(1664525*s+1013904223)>>>0)/2**32;

  const pick = (p: number[]) => {
    let r = rnd();
    for (let i=0;i<p.length;i++){ r -= p[i] ?? 0; if (r <= 0) return i; }
    return p.length-1;
  };

  let cur = pick(lm.startProbs);
  let out = lm.chars[cur] ?? "";
  for (let t=1;t<n;t++){
    const nxt = pick(lm.probs[cur] ?? lm.startProbs);
    out += lm.chars[nxt] ?? "";
    cur = nxt;
  }
  return out;
}

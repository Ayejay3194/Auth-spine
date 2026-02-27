export interface TokenizeOpts { lower?: boolean; minLen?: number; }

export function tokenize(text: string, opts: TokenizeOpts = {}): string[] {
  const lower = opts.lower ?? true;
  const minLen = opts.minLen ?? 2;
  const t = lower ? text.toLowerCase() : text;
  return t
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/g)
    .map(s => s.trim())
    .filter(s => s.length >= minLen);
}

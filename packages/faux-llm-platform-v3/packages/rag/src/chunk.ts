export interface Chunk {
  id: string;
  text: string;
  meta?: Record<string, unknown>;
}

export interface ChunkerConfig {
  maxChars: number;
  overlapChars: number;
}

export function chunkText(idPrefix: string, text: string, cfg: ChunkerConfig): Chunk[] {
  const out: Chunk[] = [];
  const maxC = Math.max(200, cfg.maxChars);
  const ov = Math.max(0, Math.min(cfg.overlapChars, maxC - 50));
  let i = 0;
  let idx = 0;
  while (i < text.length) {
    const start = i;
    const end = Math.min(text.length, i + maxC);
    out.push({ id: `${idPrefix}:${idx++}`, text: text.slice(start, end) });
    i = end - ov;
    if (i <= start) i = end;
  }
  return out;
}

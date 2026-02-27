import { tokenize } from "./tokenize";

export interface TfIdfModel {
  vocab: string[];
  idf: number[];
}

export function fitTfIdf(docs: string[], maxVocab=5000): TfIdfModel {
  const df = new Map<string, number>();
  const N = docs.length;
  for (const doc of docs) {
    const toks = new Set(tokenize(doc));
    for (const t of toks) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const vocab = [...df.entries()].sort((a,b)=>b[1]-a[1]).slice(0,maxVocab).map(x=>x[0]);
  const idf = vocab.map(w => {
    const dfi = df.get(w) ?? 0;
    return Math.log((N + 1) / (dfi + 1)) + 1;
  });
  return { vocab, idf };
}

export function transformTfIdf(model: TfIdfModel, docs: string[]): number[][] {
  const idx = new Map(model.vocab.map((w,i)=>[w,i] as const));
  return docs.map(doc => {
    const vec = new Array(model.vocab.length).fill(0);
    const toks = tokenize(doc);
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [t,c] of tf.entries()) {
      const i = idx.get(t);
      if (i == null) continue;
      vec[i] = (c / toks.length) * (model.idf[i] ?? 1);
    }
    return vec;
  });
}

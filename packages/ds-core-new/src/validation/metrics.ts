export function mse(yTrue: number[], yPred: number[]): number {
  let s = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const e = (yPred[i]! - yTrue[i]!);
    s += e * e;
  }
  return s / Math.max(1, yTrue.length);
}

export function mae(yTrue: number[], yPred: number[]): number {
  let s = 0;
  for (let i = 0; i < yTrue.length; i++) s += Math.abs(yPred[i]! - yTrue[i]!);
  return s / Math.max(1, yTrue.length);
}

export function accuracy(yTrue: number[], yPred: number[]): number {
  let c = 0;
  for (let i = 0; i < yTrue.length; i++) if (yTrue[i] === yPred[i]) c++;
  return c / Math.max(1, yTrue.length);
}

export function logLoss(yTrue: number[], yProb: number[]): number {
  const eps = 1e-12;
  let s = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const y = yTrue[i]!;
    const p = Math.min(1 - eps, Math.max(eps, yProb[i]!));
    s += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  }
  return s / Math.max(1, yTrue.length);
}

export function brierScore(yTrue: number[], yProb: number[]): number {
  let s = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const e = yProb[i]! - yTrue[i]!;
    s += e * e;
  }
  return s / Math.max(1, yTrue.length);
}

/** ROC AUC for binary classification using rank-sum method. */
export function rocAuc(yTrue: number[], yProb: number[]): number {
  const pairs = yTrue.map((y, i) => ({ y, p: yProb[i]! }));
  pairs.sort((a, b) => a.p - b.p);

  let nPos = 0, nNeg = 0;
  for (const pr of pairs) (pr.y === 1 ? nPos++ : nNeg++);
  if (nPos === 0 || nNeg === 0) return NaN;

  // sum ranks for positives (1-based ranks)
  let rankSumPos = 0;
  for (let i = 0; i < pairs.length; i++) if (pairs[i]!.y === 1) rankSumPos += (i + 1);

  // AUC = (rankSumPos - nPos*(nPos+1)/2) / (nPos*nNeg)
  return (rankSumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
}

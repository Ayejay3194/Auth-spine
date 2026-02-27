export interface ReliabilityBin {
  bin: number;
  count: number;
  avgProb: number;
  fracPos: number;
}

export function reliabilityDiagram(yTrue: number[], yProb: number[], bins = 10): ReliabilityBin[] {
  const b: { count: number; sumP: number; sumY: number }[] =
    Array.from({ length: bins }, () => ({ count: 0, sumP: 0, sumY: 0 }));

  for (let i = 0; i < yTrue.length; i++) {
    const p = yProb[i]!;
    const y = yTrue[i]!;
    const bi = Math.min(bins - 1, Math.max(0, Math.floor(p * bins)));
    b[bi]!.count++;
    b[bi]!.sumP += p;
    b[bi]!.sumY += y;
  }

  return b.map((bb, i) => ({
    bin: i,
    count: bb.count,
    avgProb: bb.count ? bb.sumP / bb.count : 0,
    fracPos: bb.count ? bb.sumY / bb.count : 0,
  }));
}

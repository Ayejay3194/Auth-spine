export namespace feature_selection {
  export class SelectKBest {
    private k: number;
    private scores: number[] = [];
    private selectedIndices: number[] = [];

    constructor(k: number = 10) {
      this.k = k;
    }

    fit(X: number[][], y: number[]): this {
      const n = X.length;
      const m = X[0].length;

      this.scores = new Array(m);

      for (let j = 0; j < m; j++) {
        const feature = X.map(row => row[j]);
        const correlation = this.pearsonCorrelation(feature, y);
        this.scores[j] = Math.abs(correlation);
      }

      const indices = Array.from({ length: m }, (_, i) => i);
      indices.sort((a, b) => this.scores[b] - this.scores[a]);
      this.selectedIndices = indices.slice(0, Math.min(this.k, m));

      return this;
    }

    transform(X: number[][]): number[][] {
      return X.map(row => this.selectedIndices.map(idx => row[idx]));
    }

    fitTransform(X: number[][], y: number[]): number[][] {
      return this.fit(X, y).transform(X);
    }

    getSelectedIndices(): number[] {
      return this.selectedIndices;
    }

    getScores(): number[] {
      return this.scores;
    }

    private pearsonCorrelation(x: number[], y: number[]): number {
      const n = x.length;
      const meanX = x.reduce((a, b) => a + b, 0) / n;
      const meanY = y.reduce((a, b) => a + b, 0) / n;

      let numerator = 0;
      let denomX = 0;
      let denomY = 0;

      for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
      }

      return numerator / Math.sqrt(denomX * denomY);
    }
  }

  export class VarianceThreshold {
    private threshold: number;
    private variances: number[] = [];
    private selectedIndices: number[] = [];

    constructor(threshold: number = 0) {
      this.threshold = threshold;
    }

    fit(X: number[][]): this {
      const n = X.length;
      const m = X[0].length;

      this.variances = new Array(m);

      for (let j = 0; j < m; j++) {
        const feature = X.map(row => row[j]);
        const mean = feature.reduce((a, b) => a + b, 0) / n;
        const variance = feature.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        this.variances[j] = variance;
      }

      this.selectedIndices = Array.from({ length: m }, (_, i) => i).filter(
        i => this.variances[i] > this.threshold
      );

      return this;
    }

    transform(X: number[][]): number[][] {
      return X.map(row => this.selectedIndices.map(idx => row[idx]));
    }

    fitTransform(X: number[][]): number[][] {
      return this.fit(X).transform(X);
    }

    getSelectedIndices(): number[] {
      return this.selectedIndices;
    }

    getVariances(): number[] {
      return this.variances;
    }
  }

  export function mutualInfo(X: number[][], y: number[], nBins: number = 10): number[] {
    const m = X[0].length;
    const scores: number[] = [];

    for (let j = 0; j < m; j++) {
      const feature = X.map(row => row[j]);
      const score = calculateMutualInformation(feature, y, nBins);
      scores.push(score);
    }

    return scores;
  }

  function calculateMutualInformation(x: number[], y: number[], nBins: number): number {
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);

    const xBinWidth = (xMax - xMin) / nBins;
    const yBinWidth = (yMax - yMin) / nBins;

    const n = x.length;
    const jointProb: Record<string, number> = {};
    const xProb: Record<number, number> = {};
    const yProb: Record<number, number> = {};

    for (let i = 0; i < n; i++) {
      const xBin = Math.floor((x[i] - xMin) / xBinWidth);
      const yBin = Math.floor((y[i] - yMin) / yBinWidth);

      const key = `${xBin},${yBin}`;
      jointProb[key] = (jointProb[key] || 0) + 1;
      xProb[xBin] = (xProb[xBin] || 0) + 1;
      yProb[yBin] = (yProb[yBin] || 0) + 1;
    }

    let mi = 0;
    for (const key in jointProb) {
      const [xBin, yBin] = key.split(',').map(Number);
      const pXY = jointProb[key] / n;
      const pX = xProb[xBin] / n;
      const pY = yProb[yBin] / n;

      if (pXY > 0 && pX > 0 && pY > 0) {
        mi += pXY * Math.log2(pXY / (pX * pY));
      }
    }

    return mi;
  }
}

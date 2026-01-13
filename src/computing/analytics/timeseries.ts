export namespace timeseries {
  export class TimeSeriesAnalyzer {
    movingAverage(data: number[], window: number): number[] {
      const result: number[] = [];

      for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const slice = data.slice(start, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        result.push(avg);
      }

      return result;
    }

    exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
      const result: number[] = [data[0]];

      for (let i = 1; i < data.length; i++) {
        const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
        result.push(smoothed);
      }

      return result;
    }

    seasonalDecomposition(
      data: number[],
      period: number
    ): {
      trend: number[];
      seasonal: number[];
      residual: number[];
    } {
      const trend = this.movingAverage(data, period);

      const seasonal: number[] = new Array(data.length).fill(0);
      for (let i = 0; i < data.length; i++) {
        seasonal[i] = data[i] - (trend[i] || 0);
      }

      const seasonalPattern: number[] = new Array(period).fill(0);
      const counts: number[] = new Array(period).fill(0);

      for (let i = 0; i < data.length; i++) {
        const idx = i % period;
        seasonalPattern[idx] += seasonal[i];
        counts[idx]++;
      }

      for (let i = 0; i < period; i++) {
        seasonalPattern[i] /= counts[i];
      }

      const adjustedSeasonal = data.map((_, i) => seasonalPattern[i % period]);
      const residual = data.map((val, i) => val - (trend[i] || 0) - adjustedSeasonal[i]);

      return {
        trend,
        seasonal: adjustedSeasonal,
        residual
      };
    }

    static autocorrelation(data: number[], maxLag: number = 20): number[] {
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const c0 = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;

      const acf: number[] = [1];

      for (let lag = 1; lag <= maxLag; lag++) {
        let c = 0;
        for (let i = 0; i < data.length - lag; i++) {
          c += (data[i] - mean) * (data[i + lag] - mean);
        }
        c /= data.length;
        acf.push(c / c0);
      }

      return acf;
    }

    static differencing(data: number[], order: number = 1): number[] {
      let result = [...data];

      for (let o = 0; o < order; o++) {
        const diff: number[] = [];
        for (let i = 1; i < result.length; i++) {
          diff.push(result[i] - result[i - 1]);
        }
        result = diff;
      }

      return result;
    }
  }

  export class AnomalyDetector {
    static isolationForest(data: number[][], contamination: number = 0.1): number[] {
      const n = data.length;
      const numAnomalies = Math.ceil(n * contamination);
      const scores: Array<[number, number]> = [];

      for (let i = 0; i < n; i++) {
        const score = this.computeAnomalyScore(data[i], data);
        scores.push([score, i]);
      }

      scores.sort((a, b) => b[0] - a[0]);

      const anomalies: number[] = [];
      for (let i = 0; i < numAnomalies; i++) {
        anomalies.push(scores[i][1]);
      }

      return anomalies;
    }

    private static computeAnomalyScore(point: number[], data: number[][]): number {
      let sumDist = 0;
      for (const other of data) {
        sumDist += this.euclideanDistance(point, other);
      }
      return sumDist / data.length;
    }

    private static euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }

    static localOutlierFactor(data: number[][], k: number = 5): number[] {
      const n = data.length;
      const lofs: number[] = new Array(n);

      const distances: number[][] = [];
      for (let i = 0; i < n; i++) {
        distances[i] = [];
        for (let j = 0; j < n; j++) {
          distances[i][j] = this.euclideanDistance(data[i], data[j]);
        }
      }

      for (let i = 0; i < n; i++) {
        const kDistances = distances[i]
          .map((d, idx) => [d, idx])
          .sort((a, b) => a[0] - b[0])
          .slice(1, k + 1);

        const kDistance = kDistances[kDistances.length - 1][0];
        const neighbors = kDistances.map(d => d[1]);

        let reachDistSum = 0;
        for (const neighbor of neighbors) {
          const neighborKDistance = distances[neighbor]
            .map((d, idx) => [d, idx])
            .sort((a, b) => a[0] - b[0])[k][0];

          const reachDist = Math.max(distances[i][neighbor], neighborKDistance);
          reachDistSum += reachDist;
        }

        const lrd = k / reachDistSum;

        let neighborLrdSum = 0;
        for (const neighbor of neighbors) {
          const neighborReachDistSum = distances[neighbor]
            .map((d, idx) => [d, idx])
            .sort((a, b) => a[0] - b[0])
            .slice(1, k + 1)
            .reduce((sum, d) => sum + d[0], 0);

          const neighborLrd = k / neighborReachDistSum;
          neighborLrdSum += neighborLrd;
        }

        lofs[i] = neighborLrdSum / (k * lrd);
      }

      return lofs;
    }

    static zScoreAnomaly(data: number[], threshold: number = 3): number[] {
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);

      const anomalies: number[] = [];
      for (let i = 0; i < data.length; i++) {
        const zScore = Math.abs((data[i] - mean) / std);
        if (zScore > threshold) {
          anomalies.push(i);
        }
      }

      return anomalies;
    }
  }

  export class DriftDetector {
    private baseline: number[];
    private windowSize: number;

    constructor(baseline: number[], windowSize: number = 100) {
      this.baseline = baseline;
      this.windowSize = windowSize;
    }

    detectDrift(newData: number[]): number {
      const baselineMean = this.baseline.reduce((a, b) => a + b, 0) / this.baseline.length;
      const newMean = newData.reduce((a, b) => a + b, 0) / newData.length;

      const baselineStd = Math.sqrt(
        this.baseline.reduce((sum, val) => sum + Math.pow(val - baselineMean, 2), 0) /
          this.baseline.length
      );

      const driftScore = Math.abs(newMean - baselineMean) / (baselineStd || 1);
      return driftScore;
    }

    kolmogorovSmirnovTest(data1: number[], data2: number[]): number {
      const sorted1 = [...data1].sort((a, b) => a - b);
      const sorted2 = [...data2].sort((a, b) => a - b);

      let maxDiff = 0;
      let i = 0;
      let j = 0;

      while (i < sorted1.length && j < sorted2.length) {
        const cdf1 = i / sorted1.length;
        const cdf2 = j / sorted2.length;

        maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));

        if (sorted1[i] <= sorted2[j]) {
          i++;
        } else {
          j++;
        }
      }

      return maxDiff;
    }
  }
}

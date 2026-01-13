export { preprocessing as encodingPreprocessing } from './encoding';
export { preprocessing as imputationPreprocessing } from '../preprocessing/index';

export namespace preprocessing {
  export class StandardScaler {
    private mean: number[] = [];
    private std: number[] = [];
    private isFitted: boolean = false;

    fit(X: number[][]): this {
      const n_features = X[0].length;
      this.mean = new Array(n_features).fill(0);
      this.std = new Array(n_features).fill(0);

      for (let j = 0; j < n_features; j++) {
        let sum = 0;
        for (let i = 0; i < X.length; i++) {
          sum += X[i][j];
        }
        this.mean[j] = sum / X.length;
      }

      for (let j = 0; j < n_features; j++) {
        let sumSquares = 0;
        for (let i = 0; i < X.length; i++) {
          sumSquares += Math.pow(X[i][j] - this.mean[j], 2);
        }
        this.std[j] = Math.sqrt(sumSquares / X.length);
      }

      this.isFitted = true;
      return this;
    }

    transform(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('StandardScaler must be fitted before transform');
      }

      return X.map(row =>
        row.map((val, j) => (val - this.mean[j]) / (this.std[j] || 1))
      );
    }

    fitTransform(X: number[][]): number[][] {
      return this.fit(X).transform(X);
    }
  }

  export class MinMaxScaler {
    private min: number[] = [];
    private max: number[] = [];
    private isFitted: boolean = false;

    fit(X: number[][]): this {
      const n_features = X[0].length;
      this.min = new Array(n_features).fill(Infinity);
      this.max = new Array(n_features).fill(-Infinity);

      for (let j = 0; j < n_features; j++) {
        for (let i = 0; i < X.length; i++) {
          this.min[j] = Math.min(this.min[j], X[i][j]);
          this.max[j] = Math.max(this.max[j], X[i][j]);
        }
      }

      this.isFitted = true;
      return this;
    }

    transform(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('MinMaxScaler must be fitted before transform');
      }

      return X.map(row =>
        row.map((val, j) => (val - this.min[j]) / (this.max[j] - this.min[j] || 1))
      );
    }

    fitTransform(X: number[][]): number[][] {
      return this.fit(X).transform(X);
    }
  }

  export function trainTestSplit(
    X: number[][],
    y: number[],
    testSize: number = 0.2,
    randomState?: number
  ): [number[][], number[][], number[], number[]] {
    const n = X.length;
    const testCount = Math.floor(n * testSize);
    const indices = Array.from({ length: n }, (_, i) => i);

    if (randomState !== undefined) {
      let seed = randomState;
      for (let i = n - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }

    const testIndices = indices.slice(0, testCount);
    const trainIndices = indices.slice(testCount);

    const X_train = trainIndices.map(i => X[i]);
    const X_test = testIndices.map(i => X[i]);
    const y_train = trainIndices.map(i => y[i]);
    const y_test = testIndices.map(i => y[i]);

    return [X_train, X_test, y_train, y_test];
  }
}

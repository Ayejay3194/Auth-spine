export namespace preprocessing {
  export class SimpleImputer {
    private strategy: string;
    private fillValue: number = 0;
    private statistics: Record<number, number> = {};
    private isFitted: boolean = false;

    constructor(strategy: string = 'mean', fillValue?: number) {
      this.strategy = strategy;
      if (fillValue !== undefined) {
        this.fillValue = fillValue;
      }
    }

    fit(X: number[][]): this {
      const n_features = X[0].length;
      this.statistics = {};

      for (let j = 0; j < n_features; j++) {
        const column = X.map(row => row[j]).filter(v => Number.isFinite(v));

        if (this.strategy === 'mean') {
          this.statistics[j] = column.reduce((a, b) => a + b, 0) / column.length;
        } else if (this.strategy === 'median') {
          column.sort((a, b) => a - b);
          const mid = Math.floor(column.length / 2);
          this.statistics[j] = column.length % 2 !== 0 ? column[mid] : (column[mid - 1] + column[mid]) / 2;
        } else if (this.strategy === 'most_frequent') {
          const counts: Record<number, number> = {};
          for (const val of column) {
            counts[val] = (counts[val] || 0) + 1;
          }
          let maxCount = 0;
          let mostFrequent = column[0];
          for (const [val, count] of Object.entries(counts)) {
            if (count > maxCount) {
              maxCount = count;
              mostFrequent = Number(val);
            }
          }
          this.statistics[j] = mostFrequent;
        } else if (this.strategy === 'constant') {
          this.statistics[j] = this.fillValue;
        }
      }

      this.isFitted = true;
      return this;
    }

    transform(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('SimpleImputer must be fitted before transform');
      }

      return X.map(row =>
        row.map((val, j) => (Number.isFinite(val) ? val : this.statistics[j]))
      );
    }

    fitTransform(X: number[][]): number[][] {
      return this.fit(X).transform(X);
    }
  }

  export class KNNImputer {
    private k: number;
    private X_train: number[][] = [];
    private isFitted: boolean = false;

    constructor(k: number = 5) {
      this.k = k;
    }

    fit(X: number[][]): this {
      this.X_train = X;
      this.isFitted = true;
      return this;
    }

    transform(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('KNNImputer must be fitted before transform');
      }

      return X.map(row => this.imputeRow(row));
    }

    fitTransform(X: number[][]): number[][] {
      return this.fit(X).transform(X);
    }

    private imputeRow(row: number[]): number[] {
      const result = [...row];

      for (let j = 0; j < row.length; j++) {
        if (!Number.isFinite(row[j])) {
          const distances = this.X_train.map((trainRow, idx) => ({
            distance: this.euclideanDistance(row, trainRow),
            value: trainRow[j],
            idx
          }));

          distances.sort((a, b) => a.distance - b.distance);

          const validNeighbors = distances
            .filter(d => Number.isFinite(d.value))
            .slice(0, this.k);

          if (validNeighbors.length > 0) {
            result[j] = validNeighbors.reduce((sum, d) => sum + d.value, 0) / validNeighbors.length;
          } else {
            result[j] = 0;
          }
        }
      }

      return result;
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        if (Number.isFinite(a[i]) && Number.isFinite(b[i])) {
          sum += Math.pow(a[i] - b[i], 2);
        }
      }
      return Math.sqrt(sum);
    }
  }

  export function fillMissing(X: number[][], method: string = 'mean', value?: number): number[][] {
    if (method === 'mean' || method === 'median' || method === 'most_frequent') {
      const imputer = new SimpleImputer(method, value);
      return imputer.fitTransform(X);
    } else if (method === 'constant') {
      const imputer = new SimpleImputer('constant', value || 0);
      return imputer.fitTransform(X);
    }
    return X;
  }
}

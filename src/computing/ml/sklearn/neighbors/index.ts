export namespace neighbors {
  export class KNeighborsClassifier {
    private k: number;
    private X_train: number[][] = [];
    private y_train: number[] = [];
    private isFitted: boolean = false;

    constructor(k: number = 5) {
      this.k = k;
    }

    fit(X: number[][], y: number[]): this {
      this.X_train = X;
      this.y_train = y;
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('KNeighborsClassifier must be fitted before predict');
      }

      return X.map(sample => {
        const distances = this.X_train.map((train_sample, idx) => ({
          distance: this.euclideanDistance(sample, train_sample),
          label: this.y_train[idx]
        }));

        distances.sort((a, b) => a.distance - b.distance);
        const k_nearest = distances.slice(0, this.k);

        const votes: Record<number, number> = {};
        for (const { label } of k_nearest) {
          votes[label] = (votes[label] || 0) + 1;
        }

        let maxLabel = 0;
        let maxVotes = 0;
        for (const [label, count] of Object.entries(votes)) {
          if (count > maxVotes) {
            maxVotes = count;
            maxLabel = Number(label);
          }
        }

        return maxLabel;
      });
    }

    predictProba(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('KNeighborsClassifier must be fitted before predictProba');
      }

      return X.map(sample => {
        const distances = this.X_train.map((train_sample, idx) => ({
          distance: this.euclideanDistance(sample, train_sample),
          label: this.y_train[idx]
        }));

        distances.sort((a, b) => a.distance - b.distance);
        const k_nearest = distances.slice(0, this.k);

        const votes: Record<number, number> = {};
        const unique_labels = new Set(this.y_train);

        for (const label of unique_labels) {
          votes[label] = 0;
        }

        for (const { label } of k_nearest) {
          votes[label]++;
        }

        const proba: number[] = [];
        for (const label of Array.from(unique_labels).sort((a, b) => a - b)) {
          proba.push((votes[label] || 0) / this.k);
        }

        return proba;
      });
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const correct = predictions.filter((pred, i) => pred === y[i]).length;
      return correct / y.length;
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }
  }

  export class KNeighborsRegressor {
    private k: number;
    private X_train: number[][] = [];
    private y_train: number[] = [];
    private isFitted: boolean = false;

    constructor(k: number = 5) {
      this.k = k;
    }

    fit(X: number[][], y: number[]): this {
      this.X_train = X;
      this.y_train = y;
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('KNeighborsRegressor must be fitted before predict');
      }

      return X.map(sample => {
        const distances = this.X_train.map((train_sample, idx) => ({
          distance: this.euclideanDistance(sample, train_sample),
          value: this.y_train[idx]
        }));

        distances.sort((a, b) => a.distance - b.distance);
        const k_nearest = distances.slice(0, this.k);

        const mean = k_nearest.reduce((sum, { value }) => sum + value, 0) / this.k;
        return mean;
      });
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const yMean = y.reduce((a, b) => a + b, 0) / y.length;
      const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(y[i] - pred, 2), 0);
      const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
      return 1 - ssRes / ssTot;
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }
  }
}

export namespace svm {
  export class SVC {
    private C: number;
    private kernel: string;
    private gamma: number;
    private weights: number[] = [];
    private bias: number = 0;
    private X_train: number[][] = [];
    private y_train: number[] = [];
    private isFitted: boolean = false;

    constructor(C: number = 1.0, kernel: string = 'rbf', gamma: number = 0.1) {
      this.C = C;
      this.kernel = kernel;
      this.gamma = gamma;
    }

    fit(X: number[][], y: number[]): this {
      this.X_train = X;
      this.y_train = y;

      const n = X.length;
      this.weights = new Array(n).fill(0);

      if (this.kernel === 'linear') {
        this.fitLinear(X, y);
      } else if (this.kernel === 'rbf') {
        this.fitRBF(X, y);
      }

      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('SVC must be fitted before predict');
      }

      return X.map(sample => {
        let decision = this.bias;

        for (let i = 0; i < this.X_train.length; i++) {
          if (Math.abs(this.weights[i]) > 1e-6) {
            const k = this.kernelFunction(sample, this.X_train[i]);
            decision += this.weights[i] * this.y_train[i] * k;
          }
        }

        return decision >= 0 ? 1 : 0;
      });
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const correct = predictions.filter((pred, i) => pred === y[i]).length;
      return correct / y.length;
    }

    private fitLinear(X: number[][], y: number[]): void {
      const n = X.length;
      const m = X[0].length;

      const weights = new Array(m).fill(0);
      const learningRate = 0.01;
      const iterations = 100;

      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < n; i++) {
          let prediction = 0;
          for (let j = 0; j < m; j++) {
            prediction += weights[j] * X[i][j];
          }

          const label = y[i] === 0 ? -1 : 1;
          const margin = label * prediction;

          if (margin < 1) {
            for (let j = 0; j < m; j++) {
              weights[j] += learningRate * (label * X[i][j] - (2 * this.C * weights[j]) / n);
            }
          } else {
            for (let j = 0; j < m; j++) {
              weights[j] -= learningRate * (2 * this.C * weights[j]) / n;
            }
          }
        }
      }

      this.weights = weights as any;
    }

    private fitRBF(X: number[][], y: number[]): void {
      const n = X.length;
      this.weights = new Array(n).fill(1 / n);

      for (let iter = 0; iter < 50; iter++) {
        for (let i = 0; i < n; i++) {
          let prediction = this.bias;
          for (let j = 0; j < n; j++) {
            const k = this.kernelFunction(X[i], X[j]);
            prediction += this.weights[j] * y[j] * k;
          }

          const label = y[i] === 0 ? -1 : 1;
          const margin = label * prediction;

          if (margin < 1) {
            this.weights[i] = Math.min(this.weights[i] + 0.01, this.C / n);
          } else {
            this.weights[i] = Math.max(this.weights[i] - 0.01, 0);
          }
        }
      }

      this.bias = this.calculateBias();
    }

    private kernelFunction(x1: number[], x2: number[]): number {
      if (this.kernel === 'linear') {
        return this.dotProduct(x1, x2);
      } else if (this.kernel === 'rbf') {
        const distance = this.euclideanDistance(x1, x2);
        return Math.exp(-this.gamma * distance * distance);
      }
      return 0;
    }

    private dotProduct(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
      }
      return sum;
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }

    private calculateBias(): number {
      let bias = 0;
      let count = 0;

      for (let i = 0; i < this.X_train.length; i++) {
        if (this.weights[i] > 1e-6 && this.weights[i] < this.C / this.X_train.length - 1e-6) {
          let prediction = 0;
          for (let j = 0; j < this.X_train.length; j++) {
            const k = this.kernelFunction(this.X_train[i], this.X_train[j]);
            prediction += this.weights[j] * this.y_train[j] * k;
          }
          bias += (this.y_train[i] === 0 ? -1 : 1) - prediction;
          count++;
        }
      }

      return count > 0 ? bias / count : 0;
    }
  }

  export class SVR {
    private C: number;
    private epsilon: number;
    private kernel: string;
    private gamma: number;
    private weights: number[] = [];
    private bias: number = 0;
    private X_train: number[][] = [];
    private y_train: number[] = [];
    private isFitted: boolean = false;

    constructor(C: number = 1.0, epsilon: number = 0.1, kernel: string = 'rbf', gamma: number = 0.1) {
      this.C = C;
      this.epsilon = epsilon;
      this.kernel = kernel;
      this.gamma = gamma;
    }

    fit(X: number[][], y: number[]): this {
      this.X_train = X;
      this.y_train = y;

      const n = X.length;
      this.weights = new Array(n).fill(0);

      for (let iter = 0; iter < 50; iter++) {
        for (let i = 0; i < n; i++) {
          let prediction = this.bias;
          for (let j = 0; j < n; j++) {
            const k = this.kernelFunction(X[i], X[j]);
            prediction += this.weights[j] * k;
          }

          const error = y[i] - prediction;

          if (Math.abs(error) > this.epsilon) {
            const sign = error > 0 ? 1 : -1;
            this.weights[i] += 0.01 * sign * Math.min(this.C, Math.abs(error));
          }
        }
      }

      this.bias = this.calculateBias();
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('SVR must be fitted before predict');
      }

      return X.map(sample => {
        let prediction = this.bias;
        for (let i = 0; i < this.X_train.length; i++) {
          const k = this.kernelFunction(sample, this.X_train[i]);
          prediction += this.weights[i] * k;
        }
        return prediction;
      });
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const yMean = y.reduce((a, b) => a + b, 0) / y.length;
      const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(y[i] - pred, 2), 0);
      const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
      return 1 - ssRes / ssTot;
    }

    private kernelFunction(x1: number[], x2: number[]): number {
      if (this.kernel === 'linear') {
        return this.dotProduct(x1, x2);
      } else if (this.kernel === 'rbf') {
        const distance = this.euclideanDistance(x1, x2);
        return Math.exp(-this.gamma * distance * distance);
      }
      return 0;
    }

    private dotProduct(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
      }
      return sum;
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }

    private calculateBias(): number {
      let bias = 0;
      let count = 0;

      for (let i = 0; i < this.X_train.length; i++) {
        let prediction = 0;
        for (let j = 0; j < this.X_train.length; j++) {
          const k = this.kernelFunction(this.X_train[i], this.X_train[j]);
          prediction += this.weights[j] * k;
        }
        bias += this.y_train[i] - prediction;
        count++;
      }

      return count > 0 ? bias / count : 0;
    }
  }
}

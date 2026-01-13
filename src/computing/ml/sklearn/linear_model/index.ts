export namespace linear_model {
  export class LinearRegression {
    private coefficients: number[] = [];
    private intercept: number = 0;
    private isFitted: boolean = false;

    fit(X: number[][], y: number[]): this {
      const n = X.length;
      const m = X[0].length;

      const XtX: number[][] = Array(m + 1)
        .fill(null)
        .map(() => Array(m + 1).fill(0));
      const Xty: number[] = Array(m + 1).fill(0);

      for (let i = 0; i < n; i++) {
        XtX[0][0] += 1;
        for (let j = 0; j < m; j++) {
          XtX[0][j + 1] += X[i][j];
          XtX[j + 1][0] += X[i][j];
          for (let k = 0; k < m; k++) {
            XtX[j + 1][k + 1] += X[i][j] * X[i][k];
          }
        }
        Xty[0] += y[i];
        for (let j = 0; j < m; j++) {
          Xty[j + 1] += X[i][j] * y[i];
        }
      }

      const beta = this.gaussianElimination(XtX, Xty);
      this.intercept = beta[0];
      this.coefficients = beta.slice(1);
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('LinearRegression must be fitted before predict');
      }
      return X.map(row => this.intercept + row.reduce((sum, val, i) => sum + val * this.coefficients[i], 0));
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const yMean = y.reduce((a, b) => a + b, 0) / y.length;
      const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(y[i] - pred, 2), 0);
      const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
      return 1 - ssRes / ssTot;
    }

    private gaussianElimination(A: number[][], b: number[]): number[] {
      const n = A.length;
      const augmented = A.map((row, i) => [...row, b[i]]);

      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
            maxRow = k;
          }
        }
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

        for (let k = i + 1; k < n; k++) {
          const factor = augmented[k][i] / augmented[i][i];
          for (let j = i; j <= n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }

      const x: number[] = Array(n);
      for (let i = n - 1; i >= 0; i--) {
        x[i] = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
          x[i] -= augmented[i][j] * x[j];
        }
        x[i] /= augmented[i][i];
      }
      return x;
    }
  }

  export class LogisticRegression {
    private coefficients: number[] = [];
    private intercept: number = 0;
    private isFitted: boolean = false;
    private learningRate: number = 0.01;
    private iterations: number = 1000;

    constructor(learningRate: number = 0.01, iterations: number = 1000) {
      this.learningRate = learningRate;
      this.iterations = iterations;
    }

    fit(X: number[][], y: number[]): this {
      const n = X.length;
      const m = X[0].length;

      this.coefficients = Array(m).fill(0);
      this.intercept = 0;

      for (let iter = 0; iter < this.iterations; iter++) {
        const predictions = X.map(row => this.sigmoid(this.intercept + row.reduce((sum, val, i) => sum + val * this.coefficients[i], 0)));

        const errors = predictions.map((pred, i) => pred - y[i]);

        const interceptGradient = errors.reduce((a, b) => a + b, 0) / n;
        this.intercept -= this.learningRate * interceptGradient;

        for (let j = 0; j < m; j++) {
          const coeffGradient = errors.reduce((sum, err, i) => sum + err * X[i][j], 0) / n;
          this.coefficients[j] -= this.learningRate * coeffGradient;
        }
      }

      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('LogisticRegression must be fitted before predict');
      }
      return X.map(row => this.sigmoid(this.intercept + row.reduce((sum, val, i) => sum + val * this.coefficients[i], 0)) > 0.5 ? 1 : 0);
    }

    predictProba(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('LogisticRegression must be fitted before predictProba');
      }
      return X.map(row => {
        const prob = this.sigmoid(this.intercept + row.reduce((sum, val, i) => sum + val * this.coefficients[i], 0));
        return [1 - prob, prob];
      });
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const correct = predictions.filter((pred, i) => pred === y[i]).length;
      return correct / y.length;
    }

    private sigmoid(z: number): number {
      return 1 / (1 + Math.exp(-z));
    }
  }
}

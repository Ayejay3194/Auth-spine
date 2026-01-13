export namespace decomposition {
  export class PCA {
    private nComponents: number;
    private mean: number[] = [];
    private components: number[][] = [];
    private explainedVariance: number[] = [];
    private isFitted: boolean = false;

    constructor(nComponents: number = 2) {
      this.nComponents = nComponents;
    }

    fit(X: number[][]): this {
      const n = X.length;
      const m = X[0].length;

      this.mean = Array(m)
        .fill(0)
        .map((_, j) => X.reduce((sum, row) => sum + row[j], 0) / n);

      const X_centered = X.map(row => row.map((val, j) => val - this.mean[j]));

      const cov = this.computeCovariance(X_centered);
      const { eigenvalues, eigenvectors } = this.eigenDecomposition(cov);

      const indices = Array.from({ length: eigenvalues.length }, (_, i) => i).sort((a, b) => eigenvalues[b] - eigenvalues[a]);

      this.explainedVariance = indices.slice(0, this.nComponents).map(i => eigenvalues[i]);
      this.components = indices.slice(0, this.nComponents).map(i => eigenvectors[i]);

      this.isFitted = true;
      return this;
    }

    transform(X: number[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('PCA must be fitted before transform');
      }

      const X_centered = X.map(row => row.map((val, j) => val - this.mean[j]));

      return X_centered.map(row => this.components.map(comp => row.reduce((sum, val, i) => sum + val * comp[i], 0)));
    }

    fitTransform(X: number[][]): number[][] {
      return this.fit(X).transform(X);
    }

    getExplainedVarianceRatio(): number[] {
      const total = this.explainedVariance.reduce((a, b) => a + b, 0);
      return this.explainedVariance.map(v => v / total);
    }

    private computeCovariance(X: number[][]): number[][] {
      const n = X.length;
      const m = X[0].length;
      const cov: number[][] = Array(m)
        .fill(null)
        .map(() => Array(m).fill(0));

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          for (let k = 0; k < n; k++) {
            cov[i][j] += (X[k][i] * X[k][j]) / n;
          }
        }
      }

      return cov;
    }

    private eigenDecomposition(matrix: number[][]): { eigenvalues: number[]; eigenvectors: number[][] } {
      const n = matrix.length;
      const eigenvalues: number[] = [];
      const eigenvectors: number[][] = [];

      for (let i = 0; i < n; i++) {
        eigenvalues.push(Math.random());
        eigenvectors.push(Array(n).fill(0));
      }

      return { eigenvalues, eigenvectors };
    }
  }
}

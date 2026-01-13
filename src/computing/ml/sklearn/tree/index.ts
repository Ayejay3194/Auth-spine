export namespace tree {
  export class DecisionTreeClassifier {
    private maxDepth: number;
    private root: any = null;
    private isFitted: boolean = false;

    constructor(maxDepth: number = 10) {
      this.maxDepth = maxDepth;
    }

    fit(X: number[][], y: number[]): this {
      this.root = this.buildTree(X, y, 0);
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('DecisionTreeClassifier must be fitted before predict');
      }
      return X.map(sample => this.predictSample(sample, this.root));
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const correct = predictions.filter((pred, i) => pred === y[i]).length;
      return correct / y.length;
    }

    private buildTree(X: number[][], y: number[], depth: number): any {
      if (depth >= this.maxDepth || new Set(y).size === 1) {
        const counts: Record<number, number> = {};
        for (const label of y) {
          counts[label] = (counts[label] || 0) + 1;
        }
        let maxLabel = 0;
        let maxCount = 0;
        for (const [label, count] of Object.entries(counts)) {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = Number(label);
          }
        }
        return { leaf: true, value: maxLabel };
      }

      const bestSplit = this.findBestSplit(X, y);
      if (!bestSplit) {
        const counts: Record<number, number> = {};
        for (const label of y) {
          counts[label] = (counts[label] || 0) + 1;
        }
        let maxLabel = 0;
        let maxCount = 0;
        for (const [label, count] of Object.entries(counts)) {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = Number(label);
          }
        }
        return { leaf: true, value: maxLabel };
      }

      const { feature, threshold } = bestSplit;
      const leftIndices = X.map((row, i) => (row[feature] <= threshold ? i : -1)).filter(i => i !== -1);
      const rightIndices = X.map((row, i) => (row[feature] > threshold ? i : -1)).filter(i => i !== -1);

      const X_left = leftIndices.map(i => X[i]);
      const y_left = leftIndices.map(i => y[i]);
      const X_right = rightIndices.map(i => X[i]);
      const y_right = rightIndices.map(i => y[i]);

      return {
        leaf: false,
        feature,
        threshold,
        left: this.buildTree(X_left, y_left, depth + 1),
        right: this.buildTree(X_right, y_right, depth + 1)
      };
    }

    private findBestSplit(X: number[][], y: number[]): { feature: number; threshold: number } | null {
      let bestGini = Infinity;
      let bestSplit = null;

      for (let feature = 0; feature < X[0].length; feature++) {
        const values = [...new Set(X.map(row => row[feature]))].sort((a, b) => a - b);

        for (let i = 0; i < values.length - 1; i++) {
          const threshold = (values[i] + values[i + 1]) / 2;
          const leftIndices = X.map((row, idx) => (row[feature] <= threshold ? idx : -1)).filter(i => i !== -1);
          const rightIndices = X.map((row, idx) => (row[feature] > threshold ? idx : -1)).filter(i => i !== -1);

          const y_left = leftIndices.map(idx => y[idx]);
          const y_right = rightIndices.map(idx => y[idx]);

          const gini = this.giniImpurity(y_left, y_right, y.length);
          if (gini < bestGini) {
            bestGini = gini;
            bestSplit = { feature, threshold };
          }
        }
      }

      return bestSplit;
    }

    private giniImpurity(left: number[], right: number[], total: number): number {
      const leftGini = 1 - this.calculateGini(left);
      const rightGini = 1 - this.calculateGini(right);
      return (left.length / total) * leftGini + (right.length / total) * rightGini;
    }

    private calculateGini(y: number[]): number {
      const counts: Record<number, number> = {};
      for (const label of y) {
        counts[label] = (counts[label] || 0) + 1;
      }
      let gini = 1;
      for (const count of Object.values(counts)) {
        gini -= Math.pow(count / y.length, 2);
      }
      return gini;
    }

    private predictSample(sample: number[], node: any): number {
      if (node.leaf) {
        return node.value;
      }
      if (sample[node.feature] <= node.threshold) {
        return this.predictSample(sample, node.left);
      }
      return this.predictSample(sample, node.right);
    }
  }

  export class DecisionTreeRegressor {
    private maxDepth: number;
    private root: any = null;
    private isFitted: boolean = false;

    constructor(maxDepth: number = 10) {
      this.maxDepth = maxDepth;
    }

    fit(X: number[][], y: number[]): this {
      this.root = this.buildTree(X, y, 0);
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('DecisionTreeRegressor must be fitted before predict');
      }
      return X.map(sample => this.predictSample(sample, this.root));
    }

    score(X: number[][], y: number[]): number {
      const predictions = this.predict(X);
      const yMean = y.reduce((a, b) => a + b, 0) / y.length;
      const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(y[i] - pred, 2), 0);
      const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
      return 1 - ssRes / ssTot;
    }

    private buildTree(X: number[][], y: number[], depth: number): any {
      if (depth >= this.maxDepth || X.length === 0) {
        const mean = y.reduce((a, b) => a + b, 0) / y.length;
        return { leaf: true, value: mean };
      }

      const bestSplit = this.findBestSplit(X, y);
      if (!bestSplit) {
        const mean = y.reduce((a, b) => a + b, 0) / y.length;
        return { leaf: true, value: mean };
      }

      const { feature, threshold } = bestSplit;
      const leftIndices = X.map((row, i) => (row[feature] <= threshold ? i : -1)).filter(i => i !== -1);
      const rightIndices = X.map((row, i) => (row[feature] > threshold ? i : -1)).filter(i => i !== -1);

      const X_left = leftIndices.map(i => X[i]);
      const y_left = leftIndices.map(i => y[i]);
      const X_right = rightIndices.map(i => X[i]);
      const y_right = rightIndices.map(i => y[i]);

      return {
        leaf: false,
        feature,
        threshold,
        left: this.buildTree(X_left, y_left, depth + 1),
        right: this.buildTree(X_right, y_right, depth + 1)
      };
    }

    private findBestSplit(X: number[][], y: number[]): { feature: number; threshold: number } | null {
      let bestMSE = Infinity;
      let bestSplit = null;

      for (let feature = 0; feature < X[0].length; feature++) {
        const values = [...new Set(X.map(row => row[feature]))].sort((a, b) => a - b);

        for (let i = 0; i < values.length - 1; i++) {
          const threshold = (values[i] + values[i + 1]) / 2;
          const leftIndices = X.map((row, idx) => (row[feature] <= threshold ? idx : -1)).filter(i => i !== -1);
          const rightIndices = X.map((row, idx) => (row[feature] > threshold ? idx : -1)).filter(i => i !== -1);

          const y_left = leftIndices.map(idx => y[idx]);
          const y_right = rightIndices.map(idx => y[idx]);

          const mse = this.calculateMSE(y_left, y_right);
          if (mse < bestMSE) {
            bestMSE = mse;
            bestSplit = { feature, threshold };
          }
        }
      }

      return bestSplit;
    }

    private calculateMSE(left: number[], right: number[]): number {
      const leftMean = left.reduce((a, b) => a + b, 0) / left.length;
      const rightMean = right.reduce((a, b) => a + b, 0) / right.length;

      const leftMSE = left.reduce((sum, val) => sum + Math.pow(val - leftMean, 2), 0) / left.length;
      const rightMSE = right.reduce((sum, val) => sum + Math.pow(val - rightMean, 2), 0) / right.length;

      return (left.length * leftMSE + right.length * rightMSE) / (left.length + right.length);
    }

    private predictSample(sample: number[], node: any): number {
      if (node.leaf) {
        return node.value;
      }
      if (sample[node.feature] <= node.threshold) {
        return this.predictSample(sample, node.left);
      }
      return this.predictSample(sample, node.right);
    }
  }
}

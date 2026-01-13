export namespace ensemble {
  export class RandomForestClassifier {
    private nEstimators: number;
    private maxDepth: number;
    private trees: any[] = [];
    private isFitted: boolean = false;

    constructor(nEstimators: number = 100, maxDepth: number = 10) {
      this.nEstimators = nEstimators;
      this.maxDepth = maxDepth;
    }

    fit(X: number[][], y: number[]): this {
      for (let i = 0; i < this.nEstimators; i++) {
        const bootstrapIndices = this.getBootstrapSample(X.length);
        const X_bootstrap = bootstrapIndices.map(idx => X[idx]);
        const y_bootstrap = bootstrapIndices.map(idx => y[idx]);

        const tree = this.buildTree(X_bootstrap, y_bootstrap, 0);
        this.trees.push(tree);
      }
      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('RandomForestClassifier must be fitted before predict');
      }

      return X.map(sample => {
        const predictions = this.trees.map(tree => this.predictSample(sample, tree));
        const counts: Record<number, number> = {};
        for (const pred of predictions) {
          counts[pred] = (counts[pred] || 0) + 1;
        }
        let maxLabel = 0;
        let maxCount = 0;
        for (const [label, count] of Object.entries(counts)) {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = Number(label);
          }
        }
        return maxLabel;
      });
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

    private predictSample(sample: number[], tree: any): number {
      if (tree.leaf) {
        return tree.value;
      }
      if (sample[tree.feature] <= tree.threshold) {
        return this.predictSample(sample, tree.left);
      }
      return this.predictSample(sample, tree.right);
    }

    private getBootstrapSample(n: number): number[] {
      const indices: number[] = [];
      for (let i = 0; i < n; i++) {
        indices.push(Math.floor(Math.random() * n));
      }
      return indices;
    }
  }
}

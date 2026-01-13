export { model_selection as stratifiedSelection } from './stratified';

export namespace model_selection {
  export class KFold {
    private n_splits: number;
    private shuffle: boolean;
    private randomState?: number;

    constructor(n_splits: number = 5, shuffle: boolean = false, randomState?: number) {
      this.n_splits = n_splits;
      this.shuffle = shuffle;
      this.randomState = randomState;
    }

    split(X: number[][]): Array<[number[], number[]]> {
      const n = X.length;
      const foldSize = Math.floor(n / this.n_splits);
      const indices = Array.from({ length: n }, (_, i) => i);

      if (this.shuffle && this.randomState !== undefined) {
        let seed = this.randomState;
        for (let i = n - 1; i > 0; i--) {
          seed = (seed * 9301 + 49297) % 233280;
          const j = Math.floor((seed / 233280) * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
      }

      const splits: Array<[number[], number[]]> = [];
      for (let i = 0; i < this.n_splits; i++) {
        const testStart = i * foldSize;
        const testEnd = i === this.n_splits - 1 ? n : (i + 1) * foldSize;
        const testIndices = indices.slice(testStart, testEnd);
        const trainIndices = [...indices.slice(0, testStart), ...indices.slice(testEnd)];
        splits.push([trainIndices, testIndices]);
      }

      return splits;
    }
  }

  export class GridSearchCV {
    private estimator: any;
    private paramGrid: Record<string, any[]>;
    private cv: number;
    private bestParams: Record<string, any> = {};
    private bestScore: number = -Infinity;

    constructor(estimator: any, paramGrid: Record<string, any[]>, cv: number = 5) {
      this.estimator = estimator;
      this.paramGrid = paramGrid;
      this.cv = cv;
    }

    fit(X: number[][], y: number[]): this {
      const paramCombinations = this.generateParamCombinations();

      for (const params of paramCombinations) {
        const scores: number[] = [];
        const kfold = new KFold(this.cv, false, 42);
        const splits = kfold.split(X);

        for (const [trainIdx, testIdx] of splits) {
          const X_train = trainIdx.map(i => X[i]);
          const y_train = trainIdx.map(i => y[i]);
          const X_test = testIdx.map(i => X[i]);
          const y_test = testIdx.map(i => y[i]);

          const estimator = Object.create(this.estimator);
          Object.assign(estimator, params);
          estimator.fit(X_train, y_train);
          const score = estimator.score(X_test, y_test);
          scores.push(score);
        }

        const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (meanScore > this.bestScore) {
          this.bestScore = meanScore;
          this.bestParams = params;
        }
      }

      Object.assign(this.estimator, this.bestParams);
      this.estimator.fit(X, y);
      return this;
    }

    private generateParamCombinations(): Record<string, any>[] {
      const keys = Object.keys(this.paramGrid);
      const combinations: Record<string, any>[] = [];

      const generate = (index: number, current: Record<string, any>): void => {
        if (index === keys.length) {
          combinations.push({ ...current });
          return;
        }

        const key = keys[index];
        for (const value of this.paramGrid[key]) {
          current[key] = value;
          generate(index + 1, current);
        }
      };

      generate(0, {});
      return combinations;
    }

    getBestParams(): Record<string, any> {
      return this.bestParams;
    }

    getBestScore(): number {
      return this.bestScore;
    }
  }
}

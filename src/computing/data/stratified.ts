export namespace model_selection {
  export class StratifiedKFold {
    private n_splits: number;
    private shuffle: boolean;
    private randomState: number;

    constructor(n_splits: number = 5, shuffle: boolean = false, randomState: number = 0) {
      this.n_splits = n_splits;
      this.shuffle = shuffle;
      this.randomState = randomState;
    }

    split(X: number[][], y: number[]): Array<[number[], number[]]> {
      const n = X.length;
      const classes = [...new Set(y)];
      const classIndices: Record<number, number[]> = {};

      for (const cls of classes) {
        classIndices[cls] = [];
      }

      for (let i = 0; i < n; i++) {
        classIndices[y[i]].push(i);
      }

      for (const cls of classes) {
        if (this.shuffle) {
          this.shuffleArray(classIndices[cls]);
        }
      }

      const splits: Array<[number[], number[]]> = [];

      for (let fold = 0; fold < this.n_splits; fold++) {
        const testIndices: number[] = [];
        const trainIndices: number[] = [];

        for (const cls of classes) {
          const classSize = classIndices[cls].length;
          const foldSize = Math.floor(classSize / this.n_splits);
          const start = fold * foldSize;
          const end = fold === this.n_splits - 1 ? classSize : (fold + 1) * foldSize;

          for (let i = start; i < end; i++) {
            testIndices.push(classIndices[cls][i]);
          }

          for (let i = 0; i < start; i++) {
            trainIndices.push(classIndices[cls][i]);
          }
          for (let i = end; i < classSize; i++) {
            trainIndices.push(classIndices[cls][i]);
          }
        }

        splits.push([trainIndices, testIndices]);
      }

      return splits;
    }

    private shuffleArray(arr: number[]): void {
      let seed = this.randomState;
      for (let i = arr.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }

  export class LeaveOneOut {
    split(X: number[][]): Array<[number[], number[]]> {
      const n = X.length;
      const splits: Array<[number[], number[]]> = [];

      for (let i = 0; i < n; i++) {
        const trainIndices = Array.from({ length: n }, (_, idx) => idx).filter(idx => idx !== i);
        const testIndices = [i];
        splits.push([trainIndices, testIndices]);
      }

      return splits;
    }
  }

  export class TimeSeriesSplit {
    private n_splits: number;

    constructor(n_splits: number = 5) {
      this.n_splits = n_splits;
    }

    split(X: number[][]): Array<[number[], number[]]> {
      const n = X.length;
      const splits: Array<[number[], number[]]> = [];
      const testSize = Math.floor(n / (this.n_splits + 1));

      for (let i = 0; i < this.n_splits; i++) {
        const trainEnd = (i + 1) * testSize;
        const testEnd = trainEnd + testSize;

        const trainIndices = Array.from({ length: trainEnd }, (_, idx) => idx);
        const testIndices = Array.from({ length: testEnd - trainEnd }, (_, idx) => trainEnd + idx);

        splits.push([trainIndices, testIndices]);
      }

      return splits;
    }
  }

  export class ShuffleSplit {
    private n_splits: number;
    private testSize: number;
    private randomState: number;

    constructor(n_splits: number = 10, testSize: number = 0.1, randomState: number = 0) {
      this.n_splits = n_splits;
      this.testSize = testSize;
      this.randomState = randomState;
    }

    split(X: number[][]): Array<[number[], number[]]> {
      const n = X.length;
      const testSplitSize = Math.floor(n * this.testSize);
      const splits: Array<[number[], number[]]> = [];

      for (let split = 0; split < this.n_splits; split++) {
        const indices = Array.from({ length: n }, (_, i) => i);
        this.shuffleArray(indices, split);

        const testIndices = indices.slice(0, testSplitSize);
        const trainIndices = indices.slice(testSplitSize);

        splits.push([trainIndices, testIndices]);
      }

      return splits;
    }

    private shuffleArray(arr: number[], seed: number): void {
      let rng = this.randomState + seed;
      for (let i = arr.length - 1; i > 0; i--) {
        rng = (rng * 9301 + 49297) % 233280;
        const j = Math.floor((rng / 233280) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }
}

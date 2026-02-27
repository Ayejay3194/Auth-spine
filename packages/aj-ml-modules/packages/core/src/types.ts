export type Matrix = number[][];
export type Vector = number[];

export interface Dataset {
  X: Matrix;
  y?: Vector;
  featureNames?: string[];
  labelName?: string;
  meta?: Record<string, unknown>;
}

export interface Split {
  train: Dataset;
  test: Dataset;
  val?: Dataset;
}

export interface Predictor {
  fit(X: Matrix, y: Vector): Promise<void> | void;
  predict(X: Matrix): Vector;
}

export interface Transformer {
  fit?(X: Matrix, y?: Vector): void;
  transform(X: Matrix): Matrix;
}

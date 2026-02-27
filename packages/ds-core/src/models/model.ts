import type { Matrix, TaskType } from "../types.js";

export interface FitOptions {
  epochs: number;
  batchSize: number;
  learningRate: number;
  l2?: number;         // L2 regularization strength
  seed?: number;
  verbose?: boolean;
}

export interface Model<Y = number> {
  name: string;
  task: TaskType;
  params(): Record<string, unknown>;
  hyperparams(): Record<string, unknown>;
  predict(X: Matrix): Y[];
  fit(X: Matrix, y: Y[], opts: FitOptions): Promise<void> | void;
}

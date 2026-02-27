export type Vector = Float64Array;
export type Matrix = Float64Array[]; // array of row vectors

export type TaskType =
  | "regression"
  | "binary_classification"
  | "multiclass_classification";

export interface Instance<Row = unknown, Y = unknown> {
  id: string;
  x: Row;
  y?: Y;
  meta?: Record<string, unknown>;
}

export interface Dataset<Row = unknown, Y = unknown> {
  name: string;
  task: TaskType;
  instances: Array<Instance<Row, Y>>;
  schema?: Record<string, unknown>;
}

export interface RNG {
  (): number; // [0,1)
}

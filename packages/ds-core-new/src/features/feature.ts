import type { Vector } from "../types.js";

export interface Feature<Row> {
  name: string;
  dim: number;
  encode(row: Row): Vector;
}

export interface FeaturePipeline<Row> {
  features: Feature<Row>[];
  transform(row: Row): Vector;
  dim(): number;
}

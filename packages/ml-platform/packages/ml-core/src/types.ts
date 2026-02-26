export type Vec = readonly number[];

export interface Prediction<T> {
  value: T;
  confidence: number; // 0..1
  diagnostics?: Record<string, unknown>;
}

export interface ModelMeta {
  id: string;
  version: string;
  trainedAtIso: string;
  trainingDataHash: string;
  featureSchemaHash: string;
  notes?: string;
}

export interface Model<Input, Output> {
  meta: ModelMeta;
  predict(input: Input): Prediction<Output>;
}

export interface FeaturePipeline<C, X = Vec> {
  schemaId: string;
  featureNames(): readonly string[];
  featurize(ctx: C): X;
}

export interface GateDecision<T> {
  apply: boolean;
  valueToApply: T;
  reasons: string[];
  confidence: number;
}

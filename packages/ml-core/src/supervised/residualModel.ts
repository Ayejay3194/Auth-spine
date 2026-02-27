import { EphemerisInput, EphemerisOutput, Model, Residual, Prediction } from "../core/types";
import { FeaturePipeline } from "../features/featurePipeline";

export interface ResidualModel extends Model<{ x: readonly number[] }, Residual> {}

export interface ResidualPredictor {
  pipeline: FeaturePipeline;
  model: ResidualModel;
  predictResidual(input: EphemerisInput, baseline: EphemerisOutput): Prediction<Residual>;
}

export function makeResidualPredictor(pipeline: FeaturePipeline, model: ResidualModel): ResidualPredictor {
  return {
    pipeline,
    model,
    predictResidual: (input, baseline) => {
      const x = pipeline.featurize(input, baseline);
      return model.predict({ x });
    }
  };
}

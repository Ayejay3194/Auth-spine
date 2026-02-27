import { Model, ModelMeta, Prediction, Residual } from "../core/types";

/**
 * Train in Python/Scala/etc, export to JSON, then implement deterministic tree traversal here.
 * This stub intentionally returns NOOP.
 */
export class GbdtResidualModel implements Model<{ x: readonly number[] }, Residual> {
  constructor(public meta: ModelMeta, private exported: unknown) {}

  predict(_: { x: readonly number[] }): Prediction<Residual> {
    return {
      value: { dLonArcsec: 0, dLatArcsec: 0 },
      confidence: 0.0,
      diagnostics: { note: "gbdt_stub_noop" }
    };
  }
}

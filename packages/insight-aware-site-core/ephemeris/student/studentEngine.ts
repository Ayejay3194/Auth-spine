import { EphemerisEngine, EphemerisInput, EphemerisOutput } from "../domain.js";
import { StudentCore } from "./studentCore.js";
import { CappedGatedLinearCorrector, ResidualCorrector } from "./residualCorrector.js";

export class StudentEngine implements EphemerisEngine {
  name = "StudentEngine(core + residual shell)";

  constructor(
    private core: StudentCore = new StudentCore(),
    private corrector: ResidualCorrector = new CappedGatedLinearCorrector()
  ) {}

  compute(input: EphemerisInput): EphemerisOutput {
    const coreOut = this.core.compute(input);
    const r = this.corrector.predict(input, coreOut.lon, coreOut.lat, coreOut.r);
    return {
      lon: coreOut.lon + r.gate * r.dLon,
      lat: coreOut.lat + r.gate * r.dLat,
      r: coreOut.r + r.gate * r.dR,
    };
  }
}

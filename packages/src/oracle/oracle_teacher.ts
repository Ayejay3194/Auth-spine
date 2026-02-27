import { OracleInput, OracleOutput } from "./contracts";

/**
 * Offline style teacher placeholder.
 * In practice you'd use a larger LLM (or curated templates) to generate oracle outputs
 * from structured inputs, then distill into the runtime student renderer.
 *
 * Here we just call the student renderer (identity teacher) for reproducibility.
 */
import { oracleStudentRender } from "./oracle_student";

export function oracleTeacherGenerate(input: OracleInput): OracleOutput {
  return oracleStudentRender(input);
}

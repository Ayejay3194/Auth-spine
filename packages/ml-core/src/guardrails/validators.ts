import { EphemerisInput, EphemerisOutput } from "../core/types";

export function validateInput(input: EphemerisInput): string[] {
  const issues: string[] = [];
  if (!Number.isFinite(input.jdTt)) issues.push("jdTt_not_finite");
  if (input.latDeg != null && (input.latDeg < -90 || input.latDeg > 90)) issues.push("lat_out_of_range");
  if (input.lonDeg != null && (input.lonDeg < -180 || input.lonDeg > 180)) issues.push("lon_out_of_range");
  return issues;
}

export function validateOutput(out: EphemerisOutput): string[] {
  const issues: string[] = [];
  if (!Number.isFinite(out.lonDeg)) issues.push("lon_not_finite");
  if (!Number.isFinite(out.latDeg)) issues.push("lat_not_finite");
  if (out.latDeg < -90 || out.latDeg > 90) issues.push("lat_out_of_range");
  return issues;
}

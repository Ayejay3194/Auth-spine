import { Body, EphemerisInput, EphemerisOutput } from "../ephemeris/domain.js";

export interface GoldenVector {
  id: string;
  createdAt: string;
  input: EphemerisInput;
  teacher: EphemerisOutput;
  student: EphemerisOutput;
  meta?: Record<string, unknown>;
}

export interface GoldenFile {
  name: string;
  engineVersion: string;
  vectors: GoldenVector[];
}

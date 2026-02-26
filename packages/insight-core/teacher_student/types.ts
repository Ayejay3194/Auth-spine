export type ModelVersion = {
  id: string;              // e.g. "truth-student-2026-02-22"
  createdUtc: string;      // ISO
  schemaHash: string;      // hash of feature schema + model hyperparams (string you compute)
  notes?: string;
};

export type TruthTeacherOutput = {
  // All bounded 0..1 unless noted.
  pressureIndex: number;
  supportIndex: number;
  conflictRisk: number;
  repairLikelihood: number;

  // Routing / ranking
  suggestedModules: Array<{ id: string; score: number }>;

  // Time windows derived from astro signals (already computed upstream)
  windows: Array<{ label: string; startUtc: string; peakUtc?: string; endUtc: string; confidence: number }>;

  // Calibration / uncertainty
  confidence: number;
};

export type TruthStudentOutput = TruthTeacherOutput;

// For distillation: training row is signals/features + teacher labels
export type DistillRow = {
  features: number[];      // student feature vector
  label: TruthTeacherOutput;
};

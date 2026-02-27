export type OracleDial = {
  snark: 0|1|2|3;
  mystic: 0|1|2|3;
  intimacy: 0|1|2|3;
};

export type OracleInput = {
  utc: string;
  claims: Array<{ text: string; confidence: number; tags?: string[] }>;
  receipts: Array<{ label: string; detail: string }>;
  dials: OracleDial;
  certaintyBudget: number; // 0..1
  forbidden: string[];
};

export type OracleOutput = {
  lines: string[]; // 2-4 lines
  moduleLink?: string;
  receiptsHint?: string;
};

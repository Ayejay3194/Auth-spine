export type DiagStatus = "ok" | "warn" | "fail";

export type DiagResult = {
  id: string;
  name: string;
  status: DiagStatus;
  ms: number;
  details?: Record<string, any>;
};

export type RunResponse = {
  runId: string;
  at: string;
  results: DiagResult[];
  summary: { ok: number; warn: number; fail: number };
};

export type DiagContext = {
  tenantId: string;
  actorId: string;
  role: string;
  ip?: string;
  userAgent?: string;
};

export type Adapter<T> = {
  check(ctx: DiagContext): Promise<DiagResult>;
} & T;

export function summarize(results: DiagResult[]) {
  const summary = { ok: 0, warn: 0, fail: 0 };
  for (const r of results) summary[r.status]++;
  return summary;
}

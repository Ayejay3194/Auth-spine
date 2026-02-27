export interface ExperimentRun {
  id: string;
  name: string;
  startedAt: string;
  params: Record<string, unknown>;
  metrics: Record<string, number>;
  notes?: string;
}

function uuid(): string {
  // browser/node 18+ has crypto.randomUUID; fallback if needed.
  const g = (globalThis as any);
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return "run_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

export class InMemoryTracker {
  private runs: ExperimentRun[] = [];

  start(name: string, params: Record<string, unknown>): ExperimentRun {
    const run: ExperimentRun = {
      id: uuid(),
      name,
      startedAt: new Date().toISOString(),
      params,
      metrics: {},
    };
    this.runs.push(run);
    return run;
  }

  logMetric(run: ExperimentRun, key: string, value: number): void {
    run.metrics[key] = value;
  }

  annotate(run: ExperimentRun, notes: string): void {
    run.notes = notes;
  }

  list(): ExperimentRun[] {
    return [...this.runs];
  }
}

export interface GoalMetric {
  name: string;
  target: number;     // e.g. passRate >= 0.95
  current: number;
  window: number;     // last N runs
}

export interface AgentState {
  id: string;
  goals: string[];
  beliefs: Record<string, any>;
  metrics: Record<string, GoalMetric>;
  lastRun?: { ok: boolean; repaired?: boolean; confidence?: number; taxonomy?: string; at: string };
  updatedAt: string;
}

export function initialState(id: string, goals: string[]): AgentState {
  return {
    id,
    goals,
    beliefs: {},
    metrics: {
      schemaPassRate: { name: "schemaPassRate", target: 0.97, current: 0, window: 50 },
      repairRate: { name: "repairRate", target: 0.10, current: 0, window: 50 },
      lowConfidenceRate: { name: "lowConfidenceRate", target: 0.10, current: 0, window: 50 }
    },
    updatedAt: new Date().toISOString()
  };
}

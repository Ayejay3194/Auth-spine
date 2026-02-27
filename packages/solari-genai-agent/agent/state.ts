export interface AgentState {
  id: string;
  goals: string[];
  beliefs: Record<string, any>;
  lastAction?: string;
  lastResult?: any;
  confidence?: number;
  updatedAt: string;
}

export function initialState(id: string, goals: string[]): AgentState {
  return {
    id,
    goals,
    beliefs: {},
    updatedAt: new Date().toISOString()
  };
}

export type EventType =
  | "user_message"
  | "assistant_answer"
  | "tool_call"
  | "tool_result"
  | "retrieval"
  | "policy"
  | "error"
  | "feedback";

export interface TraceEvent {
  id: string;
  t: number; // unix ms
  type: EventType;
  data: Record<string, unknown>;
}

export interface Goal {
  id: string;
  t: number;
  text: string;
  status: "active" | "done" | "blocked";
  tags?: string[];
}

export interface SessionState {
  sessionId: string;
  createdAt: number;
  updatedAt: number;

  goals: Goal[];
  notes: Array<{ id: string; t: number; key: string; value: string; confidence: number; expiresAt?: number }>;
  events: TraceEvent[];

  counters: {
    toolCallsThisTurn: number;
    turns: number;
  };

  last: {
    retrievalConfidence?: number;
    lastAnswerHash?: string;
  };
}

import type { SessionState, TraceEvent, Goal } from "./types";

export function nowMs(): number { return Date.now(); }

export function makeId(prefix = "id"): string {
  return prefix + "_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

export function newSession(sessionId: string): SessionState {
  const t = nowMs();
  return {
    sessionId,
    createdAt: t,
    updatedAt: t,
    goals: [],
    notes: [],
    events: [],
    counters: { toolCallsThisTurn: 0, turns: 0 },
    last: {}
  };
}

export function addEvent(st: SessionState, type: TraceEvent["type"], data: TraceEvent["data"]): void {
  const e: TraceEvent = { id: makeId("evt"), t: nowMs(), type, data };
  st.events.push(e);
  st.updatedAt = e.t;
}

export function setTurnStart(st: SessionState): void {
  st.counters.turns += 1;
  st.counters.toolCallsThisTurn = 0;
  st.updatedAt = nowMs();
}

export function addGoal(st: SessionState, text: string, tags?: string[]): Goal {
  const g: Goal = { id: makeId("goal"), t: nowMs(), text, status: "active", tags };
  st.goals.push(g);
  st.updatedAt = g.t;
  return g;
}

export function completeGoal(st: SessionState, goalId: string): void {
  const g = st.goals.find(x => x.id === goalId);
  if (g) { g.status = "done"; st.updatedAt = nowMs(); }
}

export function pruneExpiredNotes(st: SessionState, now = nowMs()): void {
  st.notes = st.notes.filter(n => n.expiresAt == null || n.expiresAt > now);
}

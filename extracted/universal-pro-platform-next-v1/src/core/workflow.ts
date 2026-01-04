import type { WorkflowService, WorkflowState, ID } from "./types";
export class InMemoryWorkflow implements WorkflowService {
  private m = new Map<ID, WorkflowState>();
  async upsert(state: WorkflowState){ this.m.set(state.id, state); }
  async get(id: ID){ return this.m.get(id) ?? null; }
  async resume(id: ID){ const s = this.m.get(id); if (!s) return; s.status="active"; s.updatedAt=new Date().toISOString(); this.m.set(id,s); }
}

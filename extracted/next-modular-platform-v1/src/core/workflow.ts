import type { WorkflowService, WorkflowState, ID } from "./types";

export class InMemoryWorkflow implements WorkflowService {
  private m = new Map<ID, WorkflowState>();

  async upsert(state: WorkflowState): Promise<void> {
    this.m.set(state.id, state);
  }

  async get(workflowId: ID): Promise<WorkflowState | null> {
    return this.m.get(workflowId) ?? null;
  }

  async resume(workflowId: ID): Promise<void> {
    const s = this.m.get(workflowId);
    if (!s) return;
    s.status = "active";
    s.updatedAt = new Date().toISOString();
    this.m.set(workflowId, s);
  }
}

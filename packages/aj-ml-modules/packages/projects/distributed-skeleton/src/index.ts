/**
 * Distributed ML System (Advanced) - orchestration skeleton.
 * Not "distributed backprop". It's job submission + workers + artifacts.
 */
export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Job<T=any> {
  id: string;
  name: string;
  payload: T;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  error?: string;
}

export class InMemoryQueue {
  private jobs: Job[] = [];
  enqueue<T>(name: string, payload: T): Job<T> {
    const id = `job_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    const j: Job<T> = { id, name, payload, status: "queued", createdAt: Date.now(), updatedAt: Date.now() };
    this.jobs.push(j);
    return j;
  }
  next(): Job | undefined { return this.jobs.find(j => j.status === "queued"); }
  list(): Job[] { return [...this.jobs]; }
  mark(id: string, status: JobStatus, error?: string) {
    const j = this.jobs.find(x=>x.id===id); if (!j) return;
    j.status = status; j.updatedAt = Date.now(); if (error) j.error = error;
  }
}

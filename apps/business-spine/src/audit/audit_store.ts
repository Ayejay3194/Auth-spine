import type { AuditEntry } from "../ops/types.js";

export interface IAuditStore {
  write(entry: AuditEntry): Promise<void>;
}

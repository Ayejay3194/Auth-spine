import { OpsActionRequest, OpsActionResult } from "../types/opsRuntime";

type AuditRecord = {
  audit_id: string;
  ts: string;
  request_id?: string;
  request: OpsActionRequest;
  result: OpsActionResult;
};

const audit: AuditRecord[] = [];

export function appendAudit(record: AuditRecord) {
  audit.push(record);
}

export function listAudit(limit: number = 50) {
  return audit.slice(-limit).reverse();
}

export function newAuditId() {
  // @ts-ignore
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "aud_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

import type { AuditEntry, KPI, Money } from "@spine/contracts";

export type Txn = {
  id: string;
  tsISO: string;
  kind: "charge" | "refund" | "payout";
  provider: "stripe" | "square" | "manual";
  amount: Money;
  status: "succeeded" | "pending" | "failed";
  note?: string;
};

export type PayrollRun = {
  id: string;
  periodLabel: string;
  tsISO: string;
  total: Money;
  status: "draft" | "approved" | "paid";
};

export type InventoryItem = {
  id: string;
  name: string;
  onHand: number;
  reorderAt: number;
  unitCost: Money;
};

export type Vendor = {
  id: string;
  name: string;
  monthlyCents: number;
  renewalISO: string;
  status: "active" | "canceled";
};

export function kpis(): KPI[] {
  return [
    { key: "rev_today", label: "Revenue Today", value: "$4,820", trend: "up" },
    { key: "labor_today", label: "Labor Cost Today", value: "$1,620", trend: "flat" },
    { key: "margin_today", label: "Margin Today", value: "66%", trend: "up" },
    { key: "utilization", label: "Utilization", value: "78%", trend: "down" }
  ];
}

export function txns(): Txn[] {
  return [
    { id: "t_001", tsISO: new Date().toISOString(), kind: "charge", provider: "stripe", amount: { currency: "USD", cents: 18200 }, status: "succeeded", note: "Online booking" },
    { id: "t_002", tsISO: new Date().toISOString(), kind: "refund", provider: "stripe", amount: { currency: "USD", cents: -5000 }, status: "succeeded", note: "Refunded cancellation" },
    { id: "t_003", tsISO: new Date().toISOString(), kind: "payout", provider: "stripe", amount: { currency: "USD", cents: 76000 }, status: "pending", note: "Settlement" }
  ];
}

export function payrollRuns(): PayrollRun[] {
  return [
    { id: "p_001", periodLabel: "Dec 1–15", tsISO: new Date().toISOString(), total: { currency: "USD", cents: 126000 }, status: "approved" },
    { id: "p_002", periodLabel: "Nov 16–30", tsISO: new Date().toISOString(), total: { currency: "USD", cents: 118400 }, status: "paid" }
  ];
}

export function inventory(): InventoryItem[] {
  return [
    { id: "i_001", name: "Gloves (Box)", onHand: 18, reorderAt: 10, unitCost: { currency: "USD", cents: 1299 } },
    { id: "i_002", name: "Fluoride Varnish", onHand: 7, reorderAt: 8, unitCost: { currency: "USD", cents: 3999 } },
    { id: "i_003", name: "Disposable Bibs", onHand: 44, reorderAt: 20, unitCost: { currency: "USD", cents: 899 } }
  ];
}

export function vendors(): Vendor[] {
  return [
    { id: "v_001", name: "Phone + SMS", monthlyCents: 12900, renewalISO: "2026-01-01T00:00:00.000Z", status: "active" },
    { id: "v_002", name: "Email Provider", monthlyCents: 5900, renewalISO: "2026-01-05T00:00:00.000Z", status: "active" },
    { id: "v_003", name: "Accounting", monthlyCents: 29900, renewalISO: "2025-12-28T00:00:00.000Z", status: "active" }
  ];
}

export function auditLog(): AuditEntry[] {
  return [
    { id: "a_001", tsISO: new Date().toISOString(), env: "dev", action: "SCHEDULE_EDIT", surface: "admin", meta: { appointmentId: "appt_22", change: "moved 2pm → 3pm" } },
    { id: "a_002", tsISO: new Date().toISOString(), env: "dev", action: "PAYMENT_REFUNDED", surface: "admin", meta: { txnId: "t_002", reason: "cancellation" } },
    { id: "a_003", tsISO: new Date().toISOString(), env: "dev", action: "FEATURE_FLAG_SET", surface: "admin", meta: { key: "module.inventory", value: true } }
  ];
}


import { db } from "@/lib/db";

export async function buildPayRunItems(payRunId: string) {
  const employees = await db.employee.findMany({ where: { status: "ACTIVE" } });
  return employees.map(e => {
    const gross = e.payType === "HOURLY" ? e.rateCents * 80 : e.rateCents;
    const taxes = Math.round(gross * 0.15);
    const deductions = 0;
    const net = gross - taxes - deductions;
    return { payRunId, employeeId: e.id, grossCents: gross, taxesCents: taxes, deductionsCents: deductions, netCents: net, breakdown: { method: "naive_v1" } };
  });
}

export function validateItems(items: Array<{ employeeId: string; netCents: number }>) {
  const exceptions: Array<{ employeeId?: string; kind: string; message: string }> = [];
  for (const it of items) {
    if (it.netCents < 0) exceptions.push({ employeeId: it.employeeId, kind: "NEGATIVE_NET", message: "Net pay is negative." });
  }
  return exceptions;
}

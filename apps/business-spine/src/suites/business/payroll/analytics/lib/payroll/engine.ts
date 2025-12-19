
import { db } from "@/lib/db";

export async function buildItemsFromApprovedTimesheets(payRunId: string, periodStart: Date, periodEnd: Date) {
  const employees = await db.employee.findMany({ where: { status: "ACTIVE" } });

  const adjustments = await db.payRunAdjustment.findMany({ where: { payRunId } });
  const adjByEmp = new Map<string, typeof adjustments>();
  for (const a of adjustments) adjByEmp.set(a.employeeId, [...(adjByEmp.get(a.employeeId) || []), a]);

  const items: Array<{ employeeId: string; grossCents: number; taxesCents: number; deductionsCents: number; netCents: number; breakdown: any }> = [];
  const exceptions: Array<{ employeeId?: string; kind: string; message: string }> = [];

  for (const e of employees) {
    const ts = await db.timesheet.findFirst({
      where: { employeeId: e.id, status: "APPROVED", periodStart: { lte: periodStart }, periodEnd: { gte: periodEnd } },
      include: { entries: true }
    });

    if (!ts && e.payType === "HOURLY") {
      exceptions.push({ employeeId: e.id, kind: "MISSING_APPROVED_TIMESHEET", message: "Hourly employee has no approved timesheet covering the pay period." });
      continue;
    }

    let gross = 0;
    const breakdown: any = { payType: e.payType, baseRateCents: e.rateCents, minutes: 0, earnings: [] };

    if (e.payType === "HOURLY") {
      const minutes = (ts?.entries || []).reduce((s, x) => s + (x.minutes || 0), 0);
      breakdown.minutes = minutes;
      gross = Math.round(e.rateCents * (minutes / 60));
      breakdown.earnings.push({ kind: "HOURLY", minutes, amountCents: gross });
    } else {
      gross = e.rateCents;
      breakdown.earnings.push({ kind: "SALARY", amountCents: gross });
    }

    const empAdjs = adjByEmp.get(e.id) || [];
    let adjEarnings = 0;
    let adjDeductions = 0;
    for (const a of empAdjs) {
      if (a.type === "EARNING") adjEarnings += a.amountCents;
      else adjDeductions += a.amountCents;
    }
    gross += adjEarnings;
    const deductions = Math.max(0, adjDeductions);

    const taxes = Math.max(0, Math.round(gross * 0.15));
    const net = gross - taxes - deductions;

    if (net < 0) exceptions.push({ employeeId: e.id, kind: "NEGATIVE_NET", message: "Net pay is negative after taxes/deductions." });

    items.push({ employeeId: e.id, grossCents: gross, taxesCents: taxes, deductionsCents: deductions, netCents: net, breakdown });
  }

  return { items, exceptions };
}

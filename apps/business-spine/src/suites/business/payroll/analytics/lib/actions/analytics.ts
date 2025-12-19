
"use server";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { redirect } from "next/navigation";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function recomputeDailySnapshots() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ADMIN");

  const today = startOfDayUTC(new Date());
  const days = 30;

  await db.metricSnapshot.deleteMany({ where: { asOfDate: { gte: new Date(today.getTime() - days*86400000) } } });

  for (let i = 0; i < days; i++) {
    const day = new Date(today.getTime() - i*86400000);
    const next = new Date(day.getTime() + 86400000);

    const [invoicesIssued, invoicesPaid, billsIssued, billsPaid, payRuns, timesheetsApproved, events] = await Promise.all([
      db.invoice.count({ where: { createdAt: { gte: day, lt: next } } }),
      db.invoice.count({ where: { status: "PAID", createdAt: { gte: day, lt: next } } }),
      db.bill.count({ where: { createdAt: { gte: day, lt: next } } }),
      db.bill.count({ where: { status: "PAID", createdAt: { gte: day, lt: next } } }),
      db.payRun.count({ where: { createdAt: { gte: day, lt: next } } }),
      db.timesheet.count({ where: { status: "APPROVED", approvedAt: { gte: day, lt: next } } }),
      db.analyticsEvent.count({ where: { occurredAt: { gte: day, lt: next } } })
    ]);

    const rows = [
      { metric: "invoices_created", valueNumber: invoicesIssued },
      { metric: "invoices_paid", valueNumber: invoicesPaid },
      { metric: "bills_created", valueNumber: billsIssued },
      { metric: "bills_paid", valueNumber: billsPaid },
      { metric: "payruns_created", valueNumber: payRuns },
      { metric: "timesheets_approved", valueNumber: timesheetsApproved },
      { metric: "events_tracked", valueNumber: events }
    ];

    await db.metricSnapshot.createMany({
      data: rows.map(r => ({ asOfDate: day, metric: r.metric, valueNumber: r.valueNumber }))
    });
  }

  await audit(viewer, "RECOMPUTE", "MetricSnapshot", null, null, { days: 30 });
  redirect("/analytics");
}

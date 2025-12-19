
import { getViewer, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { recomputeDailySnapshots } from "@/lib/actions/analytics";
import { fmt } from "@/lib/money";

export default async function AnalyticsHome() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const [eventsToday, topEvents, snapshots] = await Promise.all([
    db.analyticsEvent.count({ where: { occurredAt: { gte: startOfDayUTC(new Date()) } } }),
    db.analyticsEvent.groupBy({ by: ["event"], _count: { event: true }, orderBy: { _count: { event: "desc" } }, take: 10 }),
    db.metricSnapshot.findMany({ where: { asOfDate: { gte: new Date(Date.now() - 14*86400000) } }, orderBy: [{ asOfDate: "asc" }, { metric: "asc" }] })
  ]);

  const kpis = await computeKpis();

  return (
    <div className="grid">
      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h1">Analytics</div>
          <div className="small">Operational metrics + audit-friendly event tracking.</div>
        </div>
        {viewer.role === "ADMIN" && (
          <form action={recomputeDailySnapshots}>
            <button className="button">Recompute 30-day snapshots</button>
          </form>
        )}
      </div>

      <div className="panel">
        <div className="kpi">
          <div className="chip">Events today: {eventsToday}</div>
          <div className="chip">MRR (placeholder): {fmt(kpis.mrrCents)}</div>
          <div className="chip">Cash balance (approx): {fmt(kpis.cashCents)}</div>
          <div className="chip">A/R outstanding: {fmt(kpis.arOutstandingCents)}</div>
          <div className="chip">A/P outstanding: {fmt(kpis.apOutstandingCents)}</div>
        </div>
        <div className="small">Cash/A/R/A/P are computed from invoices/bills/payments, not bank statement truth. Reconciliation is still your friend.</div>
      </div>

      <div className="panel grid grid2">
        <div className="panel">
          <div className="h2">Top events (all-time)</div>
          <table className="table">
            <thead><tr><th>Event</th><th>Count</th></tr></thead>
            <tbody>
              {topEvents.map(e => (<tr key={e.event}><td>{e.event}</td><td>{e._count.event}</td></tr>))}
            </tbody>
          </table>
          <div className="small"><Link href="/analytics/events">View events</Link></div>
        </div>

        <div className="panel">
          <div className="h2">Snapshots (last 14 days)</div>
          <div className="small">Use this table to wire charts later.</div>
          <table className="table">
            <thead><tr><th>Day</th><th>Metric</th><th>Value</th></tr></thead>
            <tbody>
              {snapshots.slice(-60).map(s => (
                <tr key={s.id}>
                  <td>{s.asOfDate.toISOString().slice(0,10)}</td>
                  <td>{s.metric}</td>
                  <td>{s.valueNumber ?? s.valueCents ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="h2">Dashboards</div>
        <div className="row">
          <Link className="button" href="/analytics/funnels">Funnels</Link>
          <Link className="button" href="/analytics/retention">Retention</Link>
          <Link className="button" href="/analytics/performance">Performance</Link>
          <Link className="button" href="/analytics/events">Event Explorer</Link>
        </div>
      </div>
    </div>
  );
}

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function computeKpis() {
  const [invoices, bills, payments, cashAcct] = await Promise.all([
    db.invoice.findMany({ include: { payments: true } }),
    db.bill.findMany({ include: { payments: true } }),
    db.payment.findMany(),
    db.account.findFirst({ where: { code: "1000" } })
  ]);

  const arOutstandingCents = invoices.reduce((s, inv) => {
    const paid = inv.payments.reduce((p, x) => p + x.amountCents, 0);
    return s + Math.max(0, inv.totalCents - paid);
  }, 0);

  const apOutstandingCents = bills.reduce((s, b) => {
    const paid = b.payments.reduce((p, x) => p + x.amountCents, 0);
    return s + Math.max(0, b.totalCents - paid);
  }, 0);

  // rough cash: sum AR payments - AP payments (not including payroll etc)
  const cashCents = payments.reduce((s, p) => s + (p.kind === "AR" ? p.amountCents : -p.amountCents), 0);

  return { arOutstandingCents, apOutstandingCents, cashCents, mrrCents: 0, cashAccountId: cashAcct?.id ?? null };
}

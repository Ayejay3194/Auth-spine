
import { getViewer, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Funnels() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  // A very real funnel: invoice created -> payment recorded
  const [created, paid] = await Promise.all([
    db.invoice.count(),
    db.invoice.count({ where: { status: "PAID" } })
  ]);

  const pct = created ? Math.round((paid/created)*1000)/10 : 0;

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Funnels</div>
        <div className="small">V1: server-side business funnel examples.</div>
      </div>

      <div className="panel">
        <div className="h2">Invoices → Paid</div>
        <div className="kpi">
          <div className="chip">Invoices created: {created}</div>
          <div className="chip">Invoices paid: {paid}</div>
          <div className="chip">Conversion: {pct}%</div>
        </div>
      </div>

      <div className="panel">
        <div className="small">Next: multi-step funnels using AnalyticsEvent sequences (page_view → create_invoice → record_payment).</div>
      </div>
    </div>
  );
}

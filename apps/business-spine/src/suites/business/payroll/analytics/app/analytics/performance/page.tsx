
import { getViewer, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Performance() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  // crude perf: count of events by path (page_view) last 7 days
  const since = new Date(Date.now() - 7*86400000);
  const topPaths = await db.analyticsEvent.groupBy({
    by: ["path"],
    where: { occurredAt: { gte: since }, event: "page_view" },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 15
  });

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Performance</div>
        <div className="small">V1: What pages get hit (page_view). Real latency tracing is next.</div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Path</th><th>Views (7d)</th></tr></thead>
          <tbody>
            {topPaths.map(p => (<tr key={p.path ?? "null"}><td>{p.path ?? "-"}</td><td>{p._count.path}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

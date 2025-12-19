
import { getViewer, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Retention() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  // Simple retention proxy: active days per actorEmail over last 14 days
  const since = new Date(Date.now() - 14*86400000);
  const events = await db.analyticsEvent.findMany({ where: { occurredAt: { gte: since }, actorEmail: { not: null } }, select: { actorEmail: true, occurredAt: true } });

  const map = new Map<string, Set<string>>();
  for (const e of events) {
    const email = e.actorEmail!;
    const day = e.occurredAt.toISOString().slice(0,10);
    if (!map.has(email)) map.set(email, new Set());
    map.get(email)!.add(day);
  }

  const rows = Array.from(map.entries()).map(([email, days]) => ({ email, activeDays: days.size })).sort((a,b)=>b.activeDays-a.activeDays).slice(0,50);

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Retention</div>
        <div className="small">V1: Active days over last 14 days by user. It’s not fancy, but it’s honest.</div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>User</th><th>Active days (14d)</th></tr></thead>
          <tbody>
            {rows.map(r => (<tr key={r.email}><td>{r.email}</td><td>{r.activeDays}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

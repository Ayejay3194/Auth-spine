
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";

export default async function Audit() {
  const viewer = await getViewer();
  requireRole(viewer.role, "HR");
  const events = await db.auditEvent.findMany({ take: 200, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Audit Log</div>
        <div className="small">Because people are… people.</div>
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>ID</th></tr></thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td>{e.createdAt.toISOString()}</td>
                <td>{e.actorEmail ?? "-"}</td>
                <td>{e.action}</td>
                <td>{e.entity}</td>
                <td>{e.entityId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

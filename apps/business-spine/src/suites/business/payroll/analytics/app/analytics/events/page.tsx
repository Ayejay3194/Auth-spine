
import { getViewer, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EventExplorer() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const events = await db.analyticsEvent.findMany({ orderBy: { occurredAt: "desc" }, take: 200 });

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Event Explorer</div>
        <div className="small">Last 200 events. Filter UI comes when humans stop changing their minds every 5 seconds.</div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>When</th><th>Actor</th><th>Event</th><th>Entity</th><th>Path</th></tr></thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td>{e.occurredAt.toISOString()}</td>
                <td>{e.actorEmail ?? "-"}</td>
                <td>{e.event}</td>
                <td>{e.entity ? `${e.entity}:${e.entityId ?? ""}` : "-"}</td>
                <td>{e.path ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

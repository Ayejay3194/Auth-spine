
import { db } from "@/lib/db";
import { getViewer } from "@/lib/auth";
import { attachEntryToTimesheet, submitTimesheet } from "@/lib/actions/time";

export default async function TimesheetDetail({ params }: { params: { id: string } }) {
  await getViewer();
  const ts = await db.timesheet.findUnique({ where: { id: params.id }, include: { employee: true, entries: true } });
  if (!ts) return <div className="panel">Not found.</div>;

  const unattached = await db.timeEntry.findMany({
    where: { employeeId: ts.employeeId, timesheetId: null },
    orderBy: { startAt: "desc" },
    take: 50
  });

  const minutes = ts.entries.reduce((s, e) => s + (e.minutes || 0), 0);

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Timesheet</div>
        <div className="small">{ts.employee.firstName} {ts.employee.lastName} | {ts.periodStart.toISOString().slice(0,10)} → {ts.periodEnd.toISOString().slice(0,10)}</div>
        <div className="kpi">
          <div className="chip">Status: {ts.status}</div>
          <div className="chip">Total minutes: {minutes}</div>
        </div>

        {ts.status === "DRAFT" && (
          <form action={submitTimesheet}>
            <input type="hidden" name="id" value={ts.id} />
            <button className="button" type="submit">Submit timesheet</button>
          </form>
        )}
      </div>

      <div className="panel">
        <h2 className="h2">Attached entries</h2>
        <table className="table">
          <thead><tr><th>Start</th><th>End</th><th>Minutes</th><th>Notes</th></tr></thead>
          <tbody>
            {ts.entries.map(e => (
              <tr key={e.id}>
                <td>{e.startAt.toISOString()}</td>
                <td>{e.endAt ? e.endAt.toISOString() : "-"}</td>
                <td>{e.minutes ?? "-"}</td>
                <td>{e.notes ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ts.status === "DRAFT" && (
        <div className="panel">
          <h2 className="h2">Attach entries</h2>
          {unattached.length === 0 ? (
            <div className="small">No unattached entries.</div>
          ) : (
            <table className="table">
              <thead><tr><th>Start</th><th>End</th><th>Minutes</th><th></th></tr></thead>
              <tbody>
                {unattached.map(e => (
                  <tr key={e.id}>
                    <td>{e.startAt.toISOString()}</td>
                    <td>{e.endAt ? e.endAt.toISOString() : "-"}</td>
                    <td>{e.minutes ?? "-"}</td>
                    <td>
                      <form action={attachEntryToTimesheet}>
                        <input type="hidden" name="timesheetId" value={ts.id} />
                        <input type="hidden" name="entryId" value={e.id} />
                        <button className="button" type="submit">Attach</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

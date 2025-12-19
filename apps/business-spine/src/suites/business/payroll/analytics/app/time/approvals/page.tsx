
import Link from "next/link";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { approveTimesheet, rejectTimesheet } from "@/lib/actions/time";

export default async function Approvals() {
  const viewer = await getViewer();
  requireRole(viewer.role, "MANAGER");

  const submitted = await db.timesheet.findMany({ where: { status: "SUBMITTED" }, include: { employee: true }, orderBy: { submittedAt: "desc" }, take: 50 });

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Timesheet Approvals</div>
        <div className="small">Manager queue.</div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Employee</th><th>Period</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            {submitted.map(t => (
              <tr key={t.id}>
                <td>{t.employee.firstName} {t.employee.lastName}</td>
                <td>{t.periodStart.toISOString().slice(0,10)} → {t.periodEnd.toISOString().slice(0,10)}</td>
                <td>{t.submittedAt ? t.submittedAt.toISOString() : "-"}</td>
                <td className="row">
                  <Link className="button" href={`/time/timesheets/${t.id}`}>Review</Link>
                  <form action={approveTimesheet}><input type="hidden" name="id" value={t.id} /><button className="button">Approve</button></form>
                  <form action={rejectTimesheet}><input type="hidden" name="id" value={t.id} /><button className="button">Reject</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submitted.length===0 && <div className="small">Empty queue. Shocking.</div>}
      </div>
    </div>
  );
}

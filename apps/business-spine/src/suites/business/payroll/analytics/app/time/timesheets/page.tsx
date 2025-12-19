
import Link from "next/link";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/auth";
import { createTimesheet } from "@/lib/actions/time";

export default async function Timesheets() {
  await getViewer();
  const [timesheets, employees] = await Promise.all([
    db.timesheet.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { employee: true } }),
    db.employee.findMany({ take: 200, orderBy: { lastName: "asc" } })
  ]);

  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - 14);
  const end = new Date(now);

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Timesheets</div>
        <div className="small">Create → attach entries → submit → approve.</div>
        <hr />
        <form className="form" action={createTimesheet}>
          <select className="input" name="employeeId" defaultValue={employees[0]?.id ?? ""} required>
            {employees.map(e => (<option key={e.id} value={e.id}>{e.lastName}, {e.firstName} ({e.payType})</option>))}
          </select>
          <div className="row">
            <input className="input" type="datetime-local" name="periodStart" defaultValue={toLocal(start)} required />
            <input className="input" type="datetime-local" name="periodEnd" defaultValue={toLocal(end)} required />
          </div>
          <button className="button" type="submit">Create timesheet</button>
        </form>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Employee</th><th>Period</th><th>Status</th><th>Open</th></tr></thead>
          <tbody>
            {timesheets.map(t => (
              <tr key={t.id}>
                <td>{t.employee.firstName} {t.employee.lastName}</td>
                <td>{t.periodStart.toISOString().slice(0,10)} → {t.periodEnd.toISOString().slice(0,10)}</td>
                <td><span className={"pill " + (t.status==="APPROVED"?"good": t.status==="SUBMITTED"?"warn": t.status==="REJECTED"?"bad":"")}>{t.status}</span></td>
                <td><Link className="button" href={`/time/timesheets/${t.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toLocal(d: Date) {
  const pad = (n:number)=> String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

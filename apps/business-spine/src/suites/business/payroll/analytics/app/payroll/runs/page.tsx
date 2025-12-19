import PageView from "@/app/_components/PageView";

import Link from "next/link";
import { db } from "@/lib/db";

export default async function Runs() {
  const runs = await db.payRun.findMany({ take: 30, orderBy: { createdAt: "desc" }, include: { payGroup: true, exceptions: true } });
  return (
    <>
      <PageView name="payroll_runs_view" />
    <div className="grid">
      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h1">Payroll Runs</div>
          <div className="small">Generate items from approved time.</div>
        </div>
        <Link className="button" href="/payroll/runs/new">New run</Link>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Pay Group</th><th>Period</th><th>Status</th><th>Exceptions</th><th>Open</th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td>{r.payGroup.name}</td>
                <td>{r.periodStart ? r.periodStart.toISOString().slice(0,10) : "-"} → {r.periodEnd ? r.periodEnd.toISOString().slice(0,10) : "-"}</td>
                <td>{r.status}</td>
                <td>{r.exceptions.length}</td>
                <td><Link className="button" href={`/payroll/runs/${r.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

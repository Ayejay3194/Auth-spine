
import Link from "next/link";
import { db } from "@/lib/db";
import { moveRunToReview, finalizeRun } from "@/lib/actions/payroll";

export default async function Runs() {
  const runs = await db.payRun.findMany({ take: 30, orderBy: { createdAt: "desc" }, include: { payGroup: true, exceptions: true } });
  return (
    <div className="grid">
      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h1">Payroll Runs</div>
          <div className="small">Draft → Review → Finalize.</div>
        </div>
        <Link className="button" href="/payroll/runs/new">New run</Link>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Pay Group</th><th>Status</th><th>Exceptions</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td>{r.payGroup.name}</td>
                <td><span className={"pill " + (r.status==="FINALIZED"?"good": r.status==="REVIEW"?"warn":"")}>{r.status}</span></td>
                <td>{r.exceptions.length}</td>
                <td>{r.createdAt.toISOString()}</td>
                <td className="row">
                  <Link className="button" href={`/payroll/runs/${r.id}`}>Open</Link>
                  {r.status === "DRAFT" && (
                    <form action={moveRunToReview}><input type="hidden" name="id" value={r.id} /><button className="button">Send to review</button></form>
                  )}
                  {r.status === "REVIEW" && (
                    <form action={finalizeRun}><input type="hidden" name="id" value={r.id} /><button className="button">Finalize</button></form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

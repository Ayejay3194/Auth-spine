import PageView from "@/app/_components/PageView";

import Link from "next/link";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createReconciliationSession } from "@/lib/actions/books";

export default async function Reconcile() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const [banks, sessions] = await Promise.all([
    db.bankAccount.findMany({ orderBy: { createdAt: "desc" } }),
    db.reconciliationSession.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { bankAccount: true, matches: true } })
  ]);

  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate()-30);
  const toDate = (d: Date)=> d.toISOString().slice(0,10);

  return (
    <>
      <PageView name="reconcile_view" />
    <div className="grid">
      <div className="panel">
        <div className="h1">Reconciliation</div>
        <div className="small">Match bank transactions to journal entries. No, it can’t be vibes-based.</div>
        <hr />
        <form className="form" action={createReconciliationSession}>
          <select className="input" name="bankAccountId" required defaultValue={banks[0]?.id ?? ""}>
            {banks.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
          <div className="row">
            <input className="input" type="date" name="statementStart" defaultValue={toDate(start)} required />
            <input className="input" type="date" name="statementEnd" defaultValue={toDate(now)} required />
          </div>
          <button className="button">Create session</button>
        </form>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Bank</th><th>Range</th><th>Status</th><th>Matches</th><th></th></tr></thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td>{s.bankAccount.name}</td>
                <td>{s.statementStart.toISOString().slice(0,10)} → {s.statementEnd.toISOString().slice(0,10)}</td>
                <td>{s.status}</td>
                <td>{s.matches.length}</td>
                <td><Link className="button" href={`/books/reconcile/${s.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

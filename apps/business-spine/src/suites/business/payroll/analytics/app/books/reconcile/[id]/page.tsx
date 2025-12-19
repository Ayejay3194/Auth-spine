
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { matchBankTxn } from "@/lib/actions/books";
import { fmt } from "@/lib/money";

export default async function ReconcileSession({ params }: { params: { id: string } }) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const session = await db.reconciliationSession.findUnique({
    where: { id: params.id },
    include: { bankAccount: true, matches: { include: { bankTxn: true, journalEntry: true } } }
  });
  if (!session) return <div className="panel">Not found.</div>;

  const [unmatched, accounts] = await Promise.all([
    db.bankTxn.findMany({
      where: { bankAccountId: session.bankAccountId, postedAt: { gte: session.statementStart, lte: session.statementEnd }, matchedEntryId: null },
      orderBy: { postedAt: "desc" },
      take: 200
    }),
    db.account.findMany({ orderBy: { code: "asc" } })
  ]);

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Session</div>
        <div className="small">{session.bankAccount.name} | {session.statementStart.toISOString().slice(0,10)} → {session.statementEnd.toISOString().slice(0,10)}</div>
        <div className="kpi">
          <div className="chip">Unmatched txns: {unmatched.length}</div>
          <div className="chip">Matched: {session.matches.length}</div>
        </div>
      </div>

      <div className="panel">
        <div className="h2">Unmatched bank transactions</div>
        {unmatched.length===0 ? <div className="small">All matched.</div> : (
          <table className="table">
            <thead><tr><th>Posted</th><th>Description</th><th>Amount</th><th>Match to</th><th></th></tr></thead>
            <tbody>
              {unmatched.map(t => (
                <tr key={t.id}>
                  <td>{t.postedAt.toISOString().slice(0,10)}</td>
                  <td>{t.description}</td>
                  <td>{fmt(t.amountCents)}</td>
                  <td>
                    <form className="row" action={matchBankTxn}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="bankTxnId" value={t.id} />
                      <select className="input" name="accountId" defaultValue={accounts.find(a=>a.type==="EXPENSE")?.id ?? accounts[0]?.id}>
                        {accounts.map(a => (<option key={a.id} value={a.id}>{a.code} {a.name} ({a.type})</option>))}
                      </select>
                      <button className="button">Create match entry</button>
                    </form>
                  </td>
                  <td className="small">Creates a journal entry + links it.</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="h2">Matches</div>
        <table className="table">
          <thead><tr><th>Posted</th><th>Description</th><th>Amount</th><th>Journal</th></tr></thead>
          <tbody>
            {session.matches.map(m => (
              <tr key={m.id}>
                <td>{m.bankTxn.postedAt.toISOString().slice(0,10)}</td>
                <td>{m.bankTxn.description}</td>
                <td>{fmt(m.bankTxn.amountCents)}</td>
                <td className="small">{m.journalEntry.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createJournalEntry } from "@/lib/actions/books";
import { fmt } from "@/lib/money";

export default async function Journal() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const [entries, accounts] = await Promise.all([
    db.journalEntry.findMany({ take: 50, orderBy: { postedAt: "desc" }, include: { lines: { include: { account: true } } } }),
    db.account.findMany({ orderBy: { code: "asc" } })
  ]);

  const example = JSON.stringify([
    { accountId: accounts.find(a=>a.code==="1000")?.id || "<cash>", debitCents: 10000, creditCents: 0, description: "Cash" },
    { accountId: accounts.find(a=>a.code==="4000")?.id || "<income>", debitCents: 0, creditCents: 10000, description: "Sales" }
  ], null, 2);

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Journal</div>
        <div className="small">Manual journal entry. Must balance.</div>
        <hr />
        <form className="form" action={createJournalEntry}>
          <input className="input" name="memo" placeholder="Memo (optional)" />
          <textarea className="input" name="linesJson" rows={8} defaultValue={example} />
          <div className="small">Paste JSON lines array: accountId, debitCents, creditCents, description.</div>
          <button className="button" type="submit">Post entry</button>
        </form>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Posted</th><th>Memo</th><th>Lines</th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td>{e.postedAt.toISOString()}</td>
                <td>{e.memo ?? "-"}</td>
                <td>
                  {e.lines.map(l => (
                    <div key={l.id} className="small">
                      {l.account.code} {l.account.name}: Dr {fmt(l.debitCents)} / Cr {fmt(l.creditCents)} {l.description ? `(${l.description})` : ""}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

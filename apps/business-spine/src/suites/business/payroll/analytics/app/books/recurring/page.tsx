
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createRecurringTemplate, runRecurringNow } from "@/lib/actions/books";

export default async function Recurring() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const [templates, accounts] = await Promise.all([
    db.recurringTemplate.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.account.findMany({ orderBy: { code: "asc" } })
  ]);

  const example = JSON.stringify([
    { accountId: accounts.find(a=>a.code==="6000")?.id || "<expense>", debitCents: 9900, creditCents: 0, description: "Software expense" },
    { accountId: accounts.find(a=>a.code==="1000")?.id || "<cash>", debitCents: 0, creditCents: 9900, description: "Cash" }
  ], null, 2);

  const now = new Date();
  const toLocal = (d: Date) => {
    const pad = (n:number)=> String(n).padStart(2,"0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Recurring Entries</div>
        <div className="small">Templates you can run manually (scheduler later).</div>
        <hr />
        <form className="form" action={createRecurringTemplate}>
          <div className="row">
            <input className="input" name="name" placeholder="Name" required />
            <select className="input" name="cadence" defaultValue="MONTHLY">
              <option value="MONTHLY">MONTHLY</option>
              <option value="WEEKLY">WEEKLY</option>
            </select>
            <input className="input" type="datetime-local" name="nextRunAt" defaultValue={toLocal(now)} required />
          </div>
          <input className="input" name="memo" placeholder="Memo (optional)" />
          <textarea className="input" name="linesJson" rows={8} defaultValue={example} />
          <button className="button">Create template</button>
        </form>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Name</th><th>Cadence</th><th>Next run</th><th></th></tr></thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.cadence}</td>
                <td>{t.nextRunAt.toISOString()}</td>
                <td>
                  <form action={runRecurringNow}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="button">Run now</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

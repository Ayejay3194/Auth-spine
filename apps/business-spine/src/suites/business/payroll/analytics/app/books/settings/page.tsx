
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createPeriod, closePeriod, upsertSalesTaxRate } from "@/lib/actions/books";

export default async function Settings() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const [periods, taxRates] = await Promise.all([
    db.period.findMany({ orderBy: { startDate: "desc" }, take: 24 }),
    db.salesTaxRate.findMany({ orderBy: { name: "asc" } })
  ]);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,"0");
  const name = `${y}-${m}`;

  const start = new Date(y, now.getMonth(), 1);
  const end = new Date(y, now.getMonth()+1, 0);

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Bookkeeping Settings</div>
        <div className="small">Period locks + sales tax config.</div>
      </div>

      <div className="panel grid grid2">
        <div className="panel">
          <div className="h2">Accounting periods</div>
          <form className="form" action={createPeriod}>
            <div className="row">
              <input className="input" name="name" defaultValue={name} required />
              <input className="input" type="date" name="startDate" defaultValue={start.toISOString().slice(0,10)} required />
              <input className="input" type="date" name="endDate" defaultValue={end.toISOString().slice(0,10)} required />
            </div>
            <button className="button">Create period</button>
          </form>
          <hr />
          <table className="table">
            <thead><tr><th>Name</th><th>Range</th><th>Closed</th><th></th></tr></thead>
            <tbody>
              {periods.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.startDate.toISOString().slice(0,10)} → {p.endDate.toISOString().slice(0,10)}</td>
                  <td>{p.isClosed ? "Yes" : "No"}</td>
                  <td>
                    {!p.isClosed && (
                      <form action={closePeriod}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="button">Close</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="small">Closed periods block new postings whose postedAt falls inside them.</div>
        </div>

        <div className="panel">
          <div className="h2">Sales tax rates</div>
          <form className="form" action={upsertSalesTaxRate}>
            <div className="row">
              <input className="input" name="name" placeholder="Name (e.g. NYS)" required />
              <input className="input" name="rateBps" placeholder="Rate BPS (e.g. 825 = 8.25%)" required />
            </div>
            <button className="button">Save</button>
          </form>
          <hr />
          <table className="table">
            <thead><tr><th>Name</th><th>Rate</th></tr></thead>
            <tbody>
              {taxRates.map(t => (<tr key={t.id}><td>{t.name}</td><td>{(t.rateBps/100).toFixed(2)}%</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

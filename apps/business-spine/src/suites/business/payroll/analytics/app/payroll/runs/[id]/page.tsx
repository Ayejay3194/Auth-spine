
import { db } from "@/lib/db";
import { generateItems } from "@/lib/actions/payroll";
import { fmt } from "@/lib/money";

export default async function Run({ params }: { params: { id: string } }) {
  const run = await db.payRun.findUnique({ where: { id: params.id }, include: { payGroup: true, items: { include: { employee: true } }, exceptions: true } });
  if (!run) return <div className="panel">Not found.</div>;

  return (
    <div className="grid">
      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h1">Run: {run.payGroup.name}</div>
          <div className="small">Period: {run.periodStart?.toISOString().slice(0,10)} → {run.periodEnd?.toISOString().slice(0,10)} | Status: {run.status}</div>
        </div>
        <form action={generateItems}>
          <input type="hidden" name="id" value={run.id} />
          <button className="button">Generate/Recompute</button>
        </form>
      </div>

      <div className="panel">
        <h2 className="h2">Exceptions</h2>
        {run.exceptions.length === 0 ? <div className="small">None.</div> : (
          <table className="table">
            <thead><tr><th>Kind</th><th>Message</th></tr></thead>
            <tbody>{run.exceptions.map(x => (<tr key={x.id}><td>{x.kind}</td><td>{x.message}</td></tr>))}</tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="h2">Items</h2>
        <table className="table">
          <thead><tr><th>Employee</th><th>Gross</th><th>Taxes</th><th>Deductions</th><th>Net</th></tr></thead>
          <tbody>
            {run.items.map(i => (
              <tr key={i.id}>
                <td>{i.employee.firstName} {i.employee.lastName}</td>
                <td>{fmt(i.grossCents)}</td>
                <td>{fmt(i.taxesCents)}</td>
                <td>{fmt(i.deductionsCents)}</td>
                <td>{fmt(i.netCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
